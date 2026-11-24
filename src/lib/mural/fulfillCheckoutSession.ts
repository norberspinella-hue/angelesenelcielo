import crypto from 'crypto';
import type Stripe from 'stripe';
import { resend } from '@/lib/resend';
import { notifyNeighborsOfNewPet } from '@/lib/notifications';
import { getPlanOrDefault } from '@/lib/plans';
import { isBlockGridValidAndFree } from '@/lib/mural/blockAvailability';
import { generateSponsorshipEmailHtml } from '@/lib/emails/sponsorshipEmail';
import { isValidWorldSpaceId } from '@/lib/world3d/contracts';
import { resolveAuthorizedTestRecipient } from '@/lib/community/stagingEmailAdapter';

export function buildDeterministicOrderId(stripeSessionId: string): string {
  const hash = crypto.createHash('sha256').update(stripeSessionId).digest('hex').slice(0, 12).toUpperCase();
  return `AEC-${hash}`;
}

export interface FulfillCheckoutResult {
  memorial: any | null;
  slotAssigned: string;
  finalX: number | null;
  finalY: number | null;
  slotsUpserted: number;
  certificateCreated: boolean;
  emailSent: boolean;
  duplicateMemorialConflict: boolean;
  duplicateCertificateConflict: boolean;
  worldSpaceId: string | null;
  worldAllocationConfirmed: boolean;
  worldAllocationReason: string | null;
}

function parseCoords(slotStr: string | null | undefined): { x: number; y: number } | null {
  if (!slotStr || !slotStr.includes(',')) return null;
  const [xStr, yStr] = slotStr.split(',');
  const x = parseInt(xStr.trim(), 10);
  const y = parseInt(yStr.trim(), 10);
  if (Number.isNaN(x) || Number.isNaN(y) || x < 0 || y < 0) return null;
  return { x, y };
}

async function isBlockFree(
  supabase: any,
  startX: number,
  startY: number,
  size: number,
  allowMemorialId?: string,
  ignorePendingHolds: boolean = false
): Promise<boolean> {
  if (startX < 0 || startY < 0 || startX + size > 1000 || startY + size > 1000) {
    return false;
  }
  const { data } = await (supabase.from('mural_slots') as any)
    .select('x, y, status, reserved_until, memorial_id')
    .gte('x', startX)
    .lt('x', startX + size)
    .gte('y', startY)
    .lt('y', startY + size);

  const allowIds = allowMemorialId ? new Set<string>([allowMemorialId]) : undefined;
  return isBlockGridValidAndFree(startX, startY, size, data || [], Date.now(), allowIds, ignorePendingHolds).ok;
}

async function resolveFreeBlockCoords(
  supabase: any,
  slotId: string | undefined,
  planSize: number,
  allowMemorialId?: string,
  ignoreInitialPendingHolds: boolean = false
): Promise<{ finalX: number | null; finalY: number | null; slotAssignedStr: string }> {
  if (!slotId || slotId === 'auto') {
    return { finalX: null, finalY: null, slotAssignedStr: '' };
  }
  const parsed = parseCoords(slotId);
  if (!parsed) {
    return { finalX: null, finalY: null, slotAssignedStr: '' };
  }

  let finalX = parsed.x;
  let finalY = parsed.y;

  const free = await isBlockFree(supabase, finalX, finalY, planSize, allowMemorialId, ignoreInitialPendingHolds);
  if (!free) {
    let found = false;
    for (let radius = 1; radius <= 50 && !found; radius++) {
      const candidates: Array<{ x: number; y: number; dist: number }> = [];
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
            candidates.push({
              x: parsed.x + dx,
              y: parsed.y + dy,
              dist: Math.sqrt(dx * dx + dy * dy),
            });
          }
        }
      }
      candidates.sort((a, b) => a.dist - b.dist);

      for (const c of candidates) {
        if (c.x < 0 || c.y < 0) continue;
        if (await isBlockFree(supabase, c.x, c.y, planSize, allowMemorialId)) {
          finalX = c.x;
          finalY = c.y;
          found = true;
          break;
        }
      }
    }
  }

  return { finalX, finalY, slotAssignedStr: `${finalX},${finalY}` };
}

/**
 * Ejecuta de forma idempotente y recuperable el alta/reconciliación de memorial,
 * casillas (`mural_slots`), certificado (`certificates`) y correos transaccionales
 * para una sesión pagada de Stripe Checkout.
 */
export async function fulfillPaidCheckoutSession(
  supabase: any,
  session: Stripe.Checkout.Session,
  options?: { source?: 'webhook' | 'gracias'; skipEmails?: boolean }
): Promise<FulfillCheckoutResult> {
  const source = options?.source ?? 'webhook';
  const md = session.metadata || {};
  const plan = md.plan || '';
  const slotId = md.slotId || '';
  const petName = md.petName || 'Tu ángel';
  const email = md.email || session.customer_details?.email || '';
  const photoUrl = md.photoUrl || '';
  const thumbnailUrl = md.thumbnailUrl || '';
  const petDate = md.petDate || '';
  const species = md.species || 'otro';
  const breed = md.breed || '';
  const birthDate = md.birthDate || '';
  const location = md.location || '';
  const dedication = md.dedication || '';
  const shareOnSocials = md.shareOnSocials;
  const socialHandle = md.socialHandle || '';
  const instagram = md.instagram || '';
  const tiktok = md.tiktok || '';

  const isSponsor =
    md.isSponsorship === 'true' ||
    plan.toLowerCase().includes('corazon') ||
    plan.toLowerCase().includes('apadrinamiento');
  const sponsoredPetIdVal = md.sponsoredPetId || '';
  const sponsorNameVal = md.sponsorName || session.customer_details?.name || 'Padrino de Corazón';
  const sponsorPetNameVal = md.sponsorPetName || '';
  const shelterNameVal = md.shelterName || 'Refugio Colaborador';
  const isShareOnSocialsAllowed = shareOnSocials === 'true';

  const planCfg = getPlanOrDefault(plan);
  const planDb = planCfg.dbName;
  const orderId = buildDeterministicOrderId(session.id);
  const uploadToken = crypto.randomUUID();

  let memorialRecord: any = null;
  let isExistingShelter = false;
  let duplicateMemorialConflict = false;
  let duplicateCertificateConflict = false;
  let certificateCreated = false;
  let emailSent = false;
  let slotsUpserted = 0;
  let finalX: number | null = null;
  let finalY: number | null = null;
  let slotAssignedStr = '';
  const worldSpaceId = isValidWorldSpaceId(md.worldSpaceId) ? md.worldSpaceId!.trim() : null;
  const worldHoldToken = typeof md.worldHoldToken === 'string' && md.worldHoldToken.trim() ? md.worldHoldToken.trim() : null;
  let ownsPendingMuralHold = false;
  if (worldSpaceId && worldHoldToken) {
    try {
      const { data: holdRow } = await (supabase.from('world_space_allocations') as any)
        .select('id, mural_start_x, mural_start_y, status')
        .eq('hold_token', worldHoldToken)
        .eq('space_id', worldSpaceId)
        .in('status', ['reserved_pending_payment', 'expired', 'occupied'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (holdRow && `${holdRow.mural_start_x},${holdRow.mural_start_y}` === slotId) {
        ownsPendingMuralHold = true;
      }
    } catch {
      ownsPendingMuralHold = false;
    }
  }
  let worldAllocationConfirmed = false;
  let worldAllocationReason: string | null = null;

  // 1. Verificar apadrinamiento sobre mascota de protectora existente
  if (isSponsor) {
    let existingShelter: any = null;
    if (sponsoredPetIdVal && sponsoredPetIdVal !== 'auto') {
      const { data: byId } = await (supabase.from('memorials') as any)
        .select('*')
        .eq('id', sponsoredPetIdVal)
        .maybeSingle();
      if (byId) existingShelter = byId;
    }
    if (!existingShelter && petName) {
      const { data: byName } = await (supabase.from('memorials') as any)
        .select('*')
        .ilike('pet_name', petName)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (byName && (byName.story_answers?.isShelter || byName.story_answers?.shelterName)) {
        existingShelter = byName;
      }
    }

    if (existingShelter) {
      isExistingShelter = true;
      // Comprobar si esta sesión de apadrinamiento ya fue reclamada atómicamente en certificates
      const { data: existingSponsorCert } = await (supabase.from('certificates') as any)
        .select('id, order_id, created_at')
        .eq('order_id', orderId)
        .maybeSingle();

      const coords = parseCoords(existingShelter.slot_assigned);
      if (coords) {
        finalX = coords.x;
        finalY = coords.y;
        slotAssignedStr = existingShelter.slot_assigned;
      }

      if (existingSponsorCert) {
        memorialRecord = existingShelter;
        duplicateCertificateConflict = true;
      } else {
        const updatedAnswers = {
          ...(existingShelter.story_answers || {}),
          isSponsored: true,
          isSponsorship: true,
          sponsorName: sponsorNameVal,
          sponsorPetName: sponsorPetNameVal,
          shelterName: shelterNameVal,
          sponsoredPetId: sponsoredPetIdVal,
          sponsoredAt: new Date().toISOString(),
          starsCount: 9,
          socialHandle: socialHandle
            ? socialHandle.replace(/^@/, '').trim()
            : (existingShelter.story_answers?.socialHandle || ''),
        };

        const { data: updated, error: updateErr } = await (supabase.from('memorials') as any)
          .update({
            story_answers: updatedAnswers,
            dedication: dedication || undefined,
            slots_count: 9,
            plan_type: 'recuerdo_eterno',
          })
          .eq('id', existingShelter.id)
          .select()
          .single();

        memorialRecord = (!updateErr && updated) ? updated : existingShelter;
      }
    }
  }

  // 2. Flujo estándar (o apadrinamiento nuevo): búsqueda + alta atómica con manejo de conflicto 23505
  if (!isExistingShelter) {
    const { data: existingBySession } = await (supabase.from('memorials') as any)
      .select('*')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existingBySession) {
      memorialRecord = existingBySession;
    } else {
      const resolved = await resolveFreeBlockCoords(supabase, slotId, planCfg.size, undefined, ownsPendingMuralHold);
      finalX = resolved.finalX;
      finalY = resolved.finalY;
      slotAssignedStr = resolved.slotAssignedStr;

      const socialClean = socialHandle ? socialHandle.replace(/^@/, '').trim() : (tiktok || instagram || '');
      const { data: inserted, error: memorialError } = await (supabase.from('memorials') as any)
        .insert({
          stripe_session_id: session.id,
          stripe_payment_intent_id: (session.payment_intent as string) || null,
          payment_status: 'paid',
          price_paid: (session.amount_total ?? 0) / 100,
          currency: (session.currency || 'eur').toUpperCase(),
          plan_type: planDb,
          email,
          pet_name: petName,
          species: species as any,
          breed,
          birth_date: birthDate || null,
          location,
          photo_url: photoUrl || '',
          death_date: petDate || new Date().toISOString().split('T')[0],
          slots_count: planCfg.slotsCount,
          profile_slug: `${petName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
          visibility: 'public',
          publication_status: 'published',
          moderation_status: 'approved',
          dedication,
          slot_assigned: slotAssignedStr,
          moderation_notes: isShareOnSocialsAllowed ? '[autoriza_redes_sociales]' : null,
          story_answers: isSponsor
            ? {
                isSponsorship: true,
                isSponsored: true,
                sponsorName: sponsorNameVal,
                sponsorPetName: sponsorPetNameVal,
                shelterName: shelterNameVal,
                sponsoredPetId: sponsoredPetIdVal,
                sponsoredAt: new Date().toISOString(),
                starsCount: 9,
                socialHandle: socialClean,
                instagram: instagram ? instagram.replace(/^@/, '').trim() : '',
                tiktok: tiktok ? tiktok.replace(/^@/, '').trim() : '',
              }
            : {
                socialHandle: socialClean,
                instagram: instagram ? instagram.replace(/^@/, '').trim() : '',
                tiktok: tiktok ? tiktok.replace(/^@/, '').trim() : '',
                shareOnSocials: isShareOnSocialsAllowed,
              },
        })
        .select()
        .single();

      if (memorialError?.code === '23505') {
        duplicateMemorialConflict = true;
        const { data: winnerRow } = await (supabase.from('memorials') as any)
          .select('*')
          .eq('stripe_session_id', session.id)
          .maybeSingle();
        if (winnerRow) {
          memorialRecord = winnerRow;
        }
      } else if (memorialError) {
        console.error(`Error guardando memorial (${source}):`, memorialError);
      } else {
        memorialRecord = inserted;
      }
    }
  }

  const memorial = memorialRecord;
  if (!memorial) {
    return {
      memorial: null,
      slotAssigned: slotAssignedStr,
      finalX,
      finalY,
      slotsUpserted: 0,
      certificateCreated: false,
      emailSent: false,
      duplicateMemorialConflict,
      duplicateCertificateConflict,
      worldSpaceId,
      worldAllocationConfirmed: false,
      worldAllocationReason: 'MEMORIAL_NOT_CREATED',
    };
  }

  // 3. Reconciliar/garantizar las `size × size` casillas reales en `mural_slots`
  //    (recupera compras interrumpidas donde se creó el memorial pero faltaron casillas)
  if (!isExistingShelter) {
    const { data: currentSlots } = await (supabase.from('mural_slots') as any)
      .select('x, y')
      .eq('memorial_id', memorial.id);

    const existingCount = Array.isArray(currentSlots) ? currentSlots.length : 0;
    let canonicalCoords = parseCoords(memorial.slot_assigned);

    if (!canonicalCoords && slotId && slotId !== 'auto') {
      const resolved = await resolveFreeBlockCoords(supabase, slotId, planCfg.size, memorial.id, ownsPendingMuralHold);
      if (resolved.finalX !== null && resolved.finalY !== null) {
        canonicalCoords = { x: resolved.finalX, y: resolved.finalY };
        slotAssignedStr = resolved.slotAssignedStr;
        await (supabase.from('memorials') as any)
          .update({ slot_assigned: slotAssignedStr })
          .eq('id', memorial.id);
      }
    } else if (canonicalCoords) {
      slotAssignedStr = `${canonicalCoords.x},${canonicalCoords.y}`;
    }

    if (canonicalCoords) {
      finalX = canonicalCoords.x;
      finalY = canonicalCoords.y;

      if (existingCount < planCfg.slotsCount) {
        // Asegurar que las coordenadas no estén ocupadas por OTRA mascota distinta tras un fallo previo
        const stillMineOrFree = await isBlockFree(supabase, finalX, finalY, planCfg.size, memorial.id, ownsPendingMuralHold);
        if (!stillMineOrFree) {
          const relocated = await resolveFreeBlockCoords(supabase, `${finalX},${finalY}`, planCfg.size, memorial.id, ownsPendingMuralHold);
          if (relocated.finalX !== null && relocated.finalY !== null) {
            finalX = relocated.finalX;
            finalY = relocated.finalY;
            slotAssignedStr = relocated.slotAssignedStr;
            await (supabase.from('memorials') as any)
              .update({ slot_assigned: slotAssignedStr })
              .eq('id', memorial.id);
          }
        }

        const slotsToUpsert: any[] = [];
        for (let dx = 0; dx < planCfg.size; dx++) {
          for (let dy = 0; dy < planCfg.size; dy++) {
            slotsToUpsert.push({
              x: finalX + dx,
              y: finalY + dy,
              status: 'occupied',
              reserved_until: null,
              memorial_id: memorial.id,
              plan_type: planDb,
              thumbnail_url: thumbnailUrl || '',
            });
          }
        }

        const { error: slotError } = await (supabase.from('mural_slots') as any)
          .upsert(slotsToUpsert, { onConflict: 'x,y' });

        if (slotError) {
          console.error(`Error reconciliando mural_slots (${source}):`, slotError);
        } else {
          slotsUpserted = slotsToUpsert.length;
        }
      }
    }
  } else {
    const c = parseCoords(memorial.slot_assigned);
    if (c) {
      finalX = c.x;
      finalY = c.y;
      slotAssignedStr = `${c.x},${c.y}`;
    }
  }

  // 3B. Confirmación atómica del espacio 3D elegido (sin reubicación silenciosa ante conflicto)
  if (worldSpaceId && memorial?.id) {
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('confirm_world_3d_allocation', {
        p_space_id: worldSpaceId,
        p_plan_id: planCfg.id,
        p_memorial_id: memorial.id,
        p_stripe_session_id: session.id,
        p_start_x: finalX,
        p_start_y: finalY,
        p_block_size: planCfg.size,
        p_hold_token: worldHoldToken || '',
        p_entitlement_source: 'new_checkout',
      });
      if (rpcErr) {
        console.error(`Error confirm_world_3d_allocation (${source}):`, rpcErr);
        worldAllocationReason = 'WORLD_SPACE_RPC_ERROR';
      } else {
        const row = Array.isArray(rpcRes) ? rpcRes[0] : rpcRes;
        worldAllocationConfirmed = Boolean(row?.confirmed);
        worldAllocationReason = row?.reason || null;
        if (!worldAllocationConfirmed) {
          console.warn(`[world3d] Conflicto/bloqueo sin reubicación silenciosa para ${worldSpaceId}:`, worldAllocationReason);
          await (supabase.from('world_3d_allocation_incidents') as any).upsert(
            {
              stripe_session_id: session.id,
              memorial_id: memorial.id,
              requested_space_id: worldSpaceId,
              plan_id: planCfg.id,
              reason: worldAllocationReason || 'WORLD_SPACE_CONFLICT',
              status: 'open',
              details: {
                slotAssigned: slotAssignedStr,
                holdToken: worldHoldToken || null,
                source,
              },
            },
            { onConflict: 'stripe_session_id' }
          );
        }
      }
    } catch (e) {
      console.error(`Excepción confirm_world_3d_allocation (${source}):`, e);
      worldAllocationReason = 'WORLD_SPACE_EXCEPTION';
    }
  }

  // 4. Crear certificado determinista (`order_id` único por sesión) como candado atómico para correos
  let certWinner = false;
  let existingCertRow: any = null;
  const { data: preCert } = await (supabase.from('certificates') as any)
    .select('id, order_id, created_at')
    .eq('order_id', orderId)
    .maybeSingle();

  if (preCert) {
    existingCertRow = preCert;
    duplicateCertificateConflict = true;
  } else {
    const { data: certInserted, error: certError } = await (supabase.from('certificates') as any)
      .insert({
        order_id: orderId,
        user_email: email,
        pet_name: petName,
        plan: planDb,
        upload_token: uploadToken,
        status: 'pending',
        pet_photo_url: photoUrl || '',
      })
      .select('id, order_id, created_at')
      .single();

    if (certError?.code === '23505') {
      duplicateCertificateConflict = true;
      const { data: winnerCert } = await (supabase.from('certificates') as any)
        .select('id, order_id, created_at')
        .eq('order_id', orderId)
        .maybeSingle();
      existingCertRow = winnerCert;
    } else if (certError) {
      console.error(`Error creando certificado (${source}):`, certError);
    } else if (certInserted) {
      certWinner = true;
      certificateCreated = true;
    }
  }

  // 5. Envío único de correos:
  //    - Quien gana la inserción en `certificates` envía de inmediato.
  //    - Si hubo caída previa tras insertar certificado (>15s) y NO consta `'confirmation'` en `email_logs`,
  //      un reintento recupera el correo una única vez sin duplicar en carreras simultáneas.
  let shouldRecoverEmail = false;
  if (!certWinner && existingCertRow && memorial?.id) {
    const ageMs = Date.now() - Date.parse(existingCertRow.created_at || new Date().toISOString());
    if (!Number.isNaN(ageMs) && ageMs > 15000) {
      const { data: sentLog } = await (supabase.from('email_logs') as any)
        .select('id')
        .eq('memorial_id', memorial.id)
        .eq('type', 'confirmation')
        .eq('status', 'sent')
        .limit(1);
      if (!sentLog || sentLog.length === 0) {
        shouldRecoverEmail = true;
      }
    }
  }

  if ((certWinner || shouldRecoverEmail) && !options?.skipEmails && email) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://todaslasmascotasvanalcielo.com';
      const userEmailSubject = isSponsor
        ? sponsorPetNameVal
          ? `🕊️ En memoria de ${sponsorPetNameVal} · Gracias por apadrinar a ${petName} 🐾`
          : `📜 Reconocimiento Oficial Corazón de Ángel · Gracias por apadrinar a ${petName} 🐾`
        : source === 'gracias'
          ? `🐾 ${petName} ya brilla en el cielo`
          : '✨ Su recuerdo ya brilla en el cielo';

      const userEmailHtml = isSponsor
        ? generateSponsorshipEmailHtml({
            sponsorName: sponsorNameVal,
            sponsorEmail: email,
            petName,
            shelterName: shelterNameVal,
            sponsorPetName: sponsorPetNameVal,
            dedication,
            muralUrl: `${baseUrl}/mural-global?highlight=${finalX},${finalY}&zoom=true`,
            diplomaUrl: `${baseUrl}/gracias/${session.id}`,
          })
        : `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e0f0;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">
  Gracias por crear un lugar eterno para tu angelito en el Mural de Ángeles.
</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e0f0;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFF8F7;border-radius:16px;overflow:hidden;">
  <tr>
    <td bgcolor="#1E2A78" style="padding:0;">
      <img src="https://todaslasmascotasvanalcielo.com/images/email/header-email.jpg" alt="Todas las mascotas van al cielo - Ángeles en el Cielo" width="600" height="200" style="display:block;max-width:100%;height:auto;">
    </td>
  </tr>
  <tr>
    <td style="padding:40px 36px;background:#FFFFFF;">
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#706A95;margin:0 0 8px 0;">Hola,</p>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#25335F;line-height:1.3;margin:0 0 16px 0;">Tu ángel ya forma parte<br>del cielo ✨</h1>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#706A95;line-height:1.7;margin:0 0 12px 0;">
        Gracias por crear un lugar eterno para <strong style="color:#25335F;">tu angelito</strong>. Su recuerdo ya ha sido recibido y formará parte del Mural de Ángeles.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F7;border:1px solid #F3DCE7;border-radius:18px;margin:0 0 28px 0;">
        <tr><td style="padding:24px;">
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#25335F;font-weight:700;margin:0 0 16px 0;">Resumen de tu recuerdo</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;font-size:13px;color:#706A95;">Mascota</td><td style="padding:8px 0;font-size:13px;color:#25335F;font-weight:700;text-align:right;">${petName}</td></tr>
            <tr><td style="padding:8px 0;font-size:13px;color:#706A95;">Plan</td><td style="padding:8px 0;font-size:13px;color:#25335F;font-weight:700;text-align:right;">${planCfg.title}</td></tr>
            <tr><td style="padding:8px 0;font-size:13px;color:#706A95;">Luces en el cielo</td><td style="padding:8px 0;font-size:13px;color:#25335F;font-weight:700;text-align:right;">${planCfg.slotsCount} luces ✨</td></tr>
            <tr><td style="padding:8px 0;font-size:13px;color:#706A95;">Importe</td><td style="padding:8px 0;font-size:13px;color:#25335F;font-weight:700;text-align:right;">${planCfg.price.EUR}</td></tr>
          </table>
        </td></tr>
      </table>
      ${planCfg.id === 'vinculo_infinito' ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF0F5;border:1.5px solid #F8C7D8;border-radius:18px;margin:0 0 28px 0;">
        <tr><td style="padding:20px 24px;">
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#A0285D;font-weight:700;margin:0 0 8px 0;">📸 Tu Galería Conmemorativa Ampliada (4 fotos más)</p>
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6E2548;line-height:1.6;margin:0;">Al haber elegido el plan <strong>Vínculo Infinito</strong>, nos pondremos en contacto contigo muy pronto para crear la galería conmemorativa de <strong>${petName}</strong>.</p>
        </td></tr>
      </table>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr><td align="center">
          <a href="${baseUrl}/mural-global?highlight=${finalX},${finalY}&zoom=true" style="display:inline-block;background:#F65F8F;color:#FFFFFF;padding:16px 40px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;text-decoration:none;">Ver su recuerdo ✦</a>
        </td></tr>
      </table>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

      const isStagingIsolated =
        process.env.COMMUNITY_ALLOWED_ENV === 'staging' || process.env.VERCEL_ENV === 'preview';
      const stagingEmailEnabled = process.env.COMMUNITY_EMAIL_SEND_ENABLED === 'true';
      const resolvedBuyerRecipient = isStagingIsolated
        ? (stagingEmailEnabled ? resolveAuthorizedTestRecipient(email) : null)
        : email;
      const resolvedAdminRecipient = isStagingIsolated
        ? (stagingEmailEnabled ? resolveAuthorizedTestRecipient(process.env.ADMIN_EMAIL || '') : null)
        : (process.env.ADMIN_EMAIL || 'admin@todaslasmascotasvanalcielo.com');

      if (resolvedBuyerRecipient) {
        const userSendRes = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: resolvedBuyerRecipient,
          subject: isStagingIsolated ? `[STAGING] ${userEmailSubject}` : userEmailSubject,
          html: userEmailHtml,
        });

        emailSent = true;
        await (supabase.from('email_logs') as any).insert({
          memorial_id: memorial.id,
          to_email: resolvedBuyerRecipient,
          type: 'confirmation',
          resend_id: userSendRes?.data?.id || null,
          status: 'sent',
        });
      }

      const adminSubject = isSponsor
        ? `💖 ¡Nuevo Apadrinamiento!: ${petName} (Por ${sponsorNameVal})`
        : `🐾 Nuevo ángel: ${petName} (${plan})`;

      if (resolvedAdminRecipient) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: resolvedAdminRecipient,
          subject: isStagingIsolated ? `[STAGING ADMIN] ${adminSubject}` : adminSubject,
          html: `<div style="font-family:sans-serif;padding:20px;"><h2>Nuevo ángel registrado</h2><p><strong>Mascota:</strong> ${petName}</p><p><strong>Plan:</strong> ${planCfg.title} (${plan})</p><p><strong>Slot:</strong> ${slotAssignedStr}</p><p><strong>Sesión Stripe:</strong> ${session.id}</p></div>`,
        });
      }

      if (!isStagingIsolated && certWinner && memorial?.id && finalX !== null && finalY !== null) {
        notifyNeighborsOfNewPet({
          newPetId: memorial.id,
          newPetName: petName,
          newBreed: breed || 'Perrito',
          newDedication: dedication,
          newPhotoUrl: photoUrl,
          x: finalX,
          y: finalY,
          planType: plan,
          newEmail: email,
        }).catch((e) => console.error('Error notificando a vecinos:', e));
      }
    } catch (emailErr) {
      console.error(`Error enviando emails a través de Resend (${source}):`, emailErr);
    }
  }

  return {
    memorial,
    slotAssigned: slotAssignedStr,
    finalX,
    finalY,
    slotsUpserted,
    certificateCreated,
    emailSent,
    duplicateMemorialConflict,
    duplicateCertificateConflict,
    worldSpaceId,
    worldAllocationConfirmed,
    worldAllocationReason,
  };
}
