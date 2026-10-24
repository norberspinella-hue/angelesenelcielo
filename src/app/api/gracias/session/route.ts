import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { getPlanOrDefault } from '@/lib/plans'
import { generateSponsorshipEmailHtml } from '@/lib/emails/sponsorshipEmail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
})

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic';

function buildMemorialResponse(memorial: any) {
  const answers = memorial.story_answers || {}
  const isSponsorship = Boolean(
    answers.isSponsorship ||
    answers.isSponsored ||
    memorial.plan_type === 'corazon_eterno' ||
    memorial.plan_type?.toLowerCase().includes('corazon') ||
    memorial.plan_type?.toLowerCase().includes('apadrinamiento')
  )
  return NextResponse.json({
    petName: memorial.pet_name || 'Tu ángel',
    petDate: memorial.death_date || '',
    plan: memorial.plan_type || '',
    email: memorial.email || '',
    photoUrl: memorial.photo_url || '',
    thumbnailUrl: memorial.photo_url || '',
    species: memorial.species || '',
    breed: memorial.breed || '',
    birthDate: memorial.birth_date || '',
    location: memorial.location || '',
    dedication: memorial.dedication || '',
    slug: memorial.profile_slug || '',
    slotId: memorial.slot_assigned || '',
    sponsorName: answers.sponsorName || 'Padrino Solidario',
    shelterName: answers.shelterName || 'Refugio Nueva Vida',
    shelterPetName: memorial.pet_name || 'Juliette',
    sponsorPetName: answers.sponsorPetName || answers.memorialPetName || '',
    isSponsorship,
  })
}

async function findMemorialInDb(sessionId: string) {
  const supabase = createAdminClient()
  let foundMemorial: any = null

  // 1. Buscar en certificates por order_id (ej. order_649e7b2f o AEC-...)
  const { data: cert } = await (supabase.from('certificates') as any)
    .select('*')
    .eq('order_id', sessionId)
    .maybeSingle()

  if (cert) {
    if (cert.user_email && cert.pet_name) {
      const { data: mem } = await (supabase.from('memorials') as any)
        .select('*')
        .eq('email', cert.user_email)
        .eq('pet_name', cert.pet_name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (mem) foundMemorial = mem
    }
    if (!foundMemorial && cert.pet_name) {
      const { data: memByName } = await (supabase.from('memorials') as any)
        .select('*')
        .eq('pet_name', cert.pet_name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (memByName) foundMemorial = memByName
    }
  }

  // 2. Buscar en memorials por stripe_session_id
  if (!foundMemorial) {
    const { data: memBySession } = await (supabase.from('memorials') as any)
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()
    if (memBySession) foundMemorial = memBySession
  }

  // 2.5. Si sessionId empieza por order_, buscar stripe_session_id que coincida por sufijo
  if (!foundMemorial && sessionId.startsWith('order_')) {
    const suffix = sessionId.replace('order_', '')
    if (suffix.length >= 4) {
      const { data: memBySuffix } = await (supabase.from('memorials') as any)
        .select('*')
        .ilike('stripe_session_id', '%' + suffix)
        .maybeSingle()
      if (memBySuffix) foundMemorial = memBySuffix
    }
  }

  // 3. Buscar en memorials por id
  if (!foundMemorial) {
    const { data: memById } = await (supabase.from('memorials') as any)
      .select('*')
      .eq('id', sessionId)
      .maybeSingle()
    if (memById) foundMemorial = memById
  }

  // 4. Si sessionId empieza por order_ o AEC-, buscar apadrinamiento reciente
  if (!foundMemorial && (sessionId.startsWith('order_') || sessionId.startsWith('AEC-'))) {
    const { data: recentMems } = await (supabase.from('memorials') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    if (recentMems && recentMems.length > 0) {
      const match = recentMems.find((m: any) => m.story_answers?.isSponsorship || m.story_answers?.isSponsored)
      if (match) foundMemorial = match
    }
  }

  return foundMemorial
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID requerido' },
      { status: 400 }
    )
  }

  // Si no es un session_id de Stripe (ej: order_id o memorial_id desde email), buscar en la BD
  if (!sessionId.startsWith('cs_')) {
    const dbMemorial = await findMemorialInDb(sessionId)
    if (dbMemorial) {
      return buildMemorialResponse(dbMemorial)
    }
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      const dbMemorial = await findMemorialInDb(sessionId)
      if (dbMemorial) {
        return buildMemorialResponse(dbMemorial)
      }
      return NextResponse.json(
        { error: 'Sesión no encontrada en Stripe' },
        { status: 404 }
      )
    }

    const { plan, slotId, petName, email, photoUrl, thumbnailUrl, petDate, species, breed, birthDate, location, dedication, socialHandle, instagram, tiktok } = session.metadata || {}

    const supabase = createAdminClient()

    const isBlockFree = async (
      startX: number,
      startY: number, 
      size: number
    ): Promise<boolean> => {
      const { data } = await (supabase
        .from('mural_slots') as any)
        .select('status')
        .gte('x', startX)
        .lt('x', startX + size)
        .gte('y', startY)
        .lt('y', startY + size)
      
      if (data && data.some((s: any) => s.status === 'occupied')) {
        return false
      }
      return true
    }

    // Verificar si ya existe un memorial para esta sesión
    const { data: existingMemorial } = await (supabase
      .from('memorials') as any)
      .select('id, slot_assigned')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    let finalSlotId = existingMemorial?.slot_assigned || slotId || ''

    if (!existingMemorial && petName && email) {
      console.log('Creando memorial desde la página de gracias (fallback local/webhook)...')
      
      const planCfg = getPlanOrDefault(plan)
      const planDb = planCfg.dbName
      const orderId = `AEC-${Date.now()}`
      const uploadToken = crypto.randomUUID()

      let finalX: number | null = null
      let finalY: number | null = null
      let slotAssignedStr = ''

      if (slotId && slotId !== 'auto') {
        const [xStr, yStr] = slotId.split(',')
        const xVal = parseInt(xStr)
        const yVal = parseInt(yStr)

        if (!isNaN(xVal) && !isNaN(yVal)) {
          finalX = xVal
          finalY = yVal

          const planSize = planCfg.size

          // Verificar si el bloque completo está libre
          const blockFree = await isBlockFree(xVal, yVal, planSize)

          if (!blockFree) {
            console.log(`Bloque (${xVal}, ${yVal}) de tamaño ${planSize}x${planSize} ocupado en fallback, buscando alternativo...`)
            
            let found = false
            for (let radius = 1; radius <= 50 && !found; radius++) {
              const candidates = []
              for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                  if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                    candidates.push({ 
                      x: xVal + dx, 
                      y: yVal + dy,
                      dist: Math.sqrt(dx*dx + dy*dy)
                    })
                  }
                }
              }
              candidates.sort((a, b) => a.dist - b.dist)
              
              for (const candidate of candidates) {
                if (candidate.x < 0 || candidate.y < 0) continue
                const free = await isBlockFree(candidate.x, candidate.y, planSize)
                if (free) {
                  finalX = candidate.x
                  finalY = candidate.y
                  found = true
                  console.log(`Bloque alternativo asignado en fallback: (${finalX}, ${finalY}) de tamaño ${planSize}x${planSize}`)
                  break
                }
              }
            }
          }

          slotAssignedStr = `${finalX},${finalY}`
        }
      }

      try {
        // 1. Guardar o actualizar en tabla memorials
        let memorialRecord: any = null;
        let isExistingShelter = false;

        const isSponsorshipFallback = session.metadata?.isSponsorship === 'true' || 
          plan?.toLowerCase().includes('corazon') || 
          plan?.toLowerCase().includes('apadrinamiento');
        const sponsoredPetIdVal = session.metadata?.sponsoredPetId || '';
        const sponsorNameVal = session.metadata?.sponsorName || session.customer_details?.name || 'Padrino de Corazón';
        const sponsorPetNameVal = session.metadata?.sponsorPetName || '';
        const shelterNameVal = session.metadata?.shelterName || 'Refugio Colaborador';

        if (isSponsorshipFallback) {
          let existingShelter: any = null;
          if (sponsoredPetIdVal && sponsoredPetIdVal !== 'auto') {
            const { data: byId } = await (supabase.from('memorials') as any)
              .select('id, slot_assigned, story_answers, photo_url')
              .eq('id', sponsoredPetIdVal)
              .maybeSingle();
            if (byId) existingShelter = byId;
          }
          if (!existingShelter && petName) {
            const { data: byName } = await (supabase.from('memorials') as any)
              .select('id, slot_assigned, story_answers, photo_url')
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
              socialHandle: socialHandle ? socialHandle.replace(/^@/, '').trim() : (existingShelter.story_answers?.socialHandle || ''),
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

            if (!updateErr && updated) {
              memorialRecord = updated;
              console.log('Memorial de protectora actualizado en fallback:', updated.id);
              if (existingShelter.slot_assigned && existingShelter.slot_assigned.includes(',')) {
                const [ex, ey] = existingShelter.slot_assigned.split(',').map((v: string) => parseInt(v.trim(), 10));
                if (!isNaN(ex) && !isNaN(ey)) {
                  finalX = ex;
                  finalY = ey;
                  slotAssignedStr = existingShelter.slot_assigned;
                }
              }
            }
          }
        }

        if (!isExistingShelter) {
          const { data: inserted, error: memorialError } = await (supabase
            .from('memorials') as any)
            .insert({
              stripe_session_id: sessionId,
              stripe_payment_intent_id: session.payment_intent as string,
              payment_status: 'paid',
              price_paid: (session.amount_total ?? 0) / 100,
              currency: (session.currency || 'eur').toUpperCase(),
              plan_type: planDb,
              email: email,
              pet_name: petName,
              species: (species || 'otro') as any,
              breed: breed || '',
              birth_date: birthDate || null,
              location: location || '',
              photo_url: photoUrl || '',
              death_date: petDate || new Date().toISOString().split('T')[0],
              slots_count: planCfg.slotsCount,
              profile_slug: `${petName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
              visibility: 'public',
              publication_status: 'published',
              moderation_status: 'approved',
              dedication: dedication || '',
              slot_assigned: slotAssignedStr,
              story_answers: isSponsorshipFallback ? {
                isSponsorship: true,
                isSponsored: true,
                sponsorName: sponsorNameVal,
                sponsorPetName: sponsorPetNameVal,
                shelterName: shelterNameVal,
                sponsoredPetId: sponsoredPetIdVal,
                sponsoredAt: new Date().toISOString(),
                starsCount: 9,
                socialHandle: socialHandle ? socialHandle.replace(/^@/, '').trim() : (tiktok || instagram || ''),
                instagram: instagram ? instagram.replace(/^@/, '').trim() : '',
                tiktok: tiktok ? tiktok.replace(/^@/, '').trim() : '',
              } : {
                socialHandle: socialHandle ? socialHandle.replace(/^@/, '').trim() : (tiktok || instagram || ''),
                instagram: instagram ? instagram.replace(/^@/, '').trim() : '',
                tiktok: tiktok ? tiktok.replace(/^@/, '').trim() : '',
              },
            })
            .select()
            .single();

          if (memorialError) {
            console.error('Error guardando memorial en fallback:', memorialError);
          } else if (inserted) {
            memorialRecord = inserted;
            console.log('Memorial guardado en fallback:', inserted.id);
          }
        }

        const memorial = memorialRecord;
        if (memorial) {
          finalSlotId = slotAssignedStr;

          // 2. Registrar/actualizar los slots en mural_slots
          if (finalX !== null && finalY !== null) {
            const size = planCfg.size
            const slotsToUpsert = []

            for (let dx = 0; dx < size; dx++) {
              for (let dy = 0; dy < size; dy++) {
                slotsToUpsert.push({
                  x: finalX + dx,
                  y: finalY + dy,
                  status: 'occupied',
                  memorial_id: memorial.id,
                  plan_type: planDb,
                  thumbnail_url: thumbnailUrl || '',
                })
              }
            }

            const { error: slotError } = await (supabase
              .from('mural_slots') as any)
              .upsert(slotsToUpsert, { onConflict: 'x,y' })

            if (slotError) {
              console.error('Error actualizando slots en fallback:', slotError)
            } else {
              console.log(`Slots de tamaño ${size}x${size} registrados/actualizados en fallback en (${finalX}, ${finalY})`)
            }
          }

          // 3. Crear registro en certificates
          const { error: certError } = await (supabase
            .from('certificates') as any)
            .insert({
              order_id: orderId,
              user_email: email,
              pet_name: petName,
              plan: planDb,
              upload_token: uploadToken,
              status: 'pending',
              pet_photo_url: photoUrl || '',
            })

          if (certError) {
            console.error('Error creando certificado en fallback:', certError)
          } else {
            console.log('Certificado pendiente creado en fallback:', orderId)
          }

          // Enviar notificaciones por email
          try {
            const isSponsor = session.metadata?.isSponsorship === 'true' || 
              plan?.toLowerCase().includes('corazon') || 
              plan?.toLowerCase().includes('apadrinamiento');
            const sponsorNameVal = session.metadata?.sponsorName || session.customer_details?.name || 'Padrino de Corazón';
            const sponsorPetNameVal = session.metadata?.sponsorPetName || '';
            const shelterNameVal = session.metadata?.shelterName || 'Refugio Colaborador';

            const userEmailSubject = isSponsor
              ? (sponsorPetNameVal
                  ? `🕊️ En memoria de ${sponsorPetNameVal} · Gracias por apadrinar a ${petName} 🐾`
                  : `📜 Reconocimiento Oficial Corazón de Ángel · Gracias por apadrinar a ${petName} 🐾`)
              : `🐾 ${petName} ya brilla en el cielo`;

            const userEmailHtml = isSponsor
              ? generateSponsorshipEmailHtml({
                  sponsorName: sponsorNameVal,
                  sponsorEmail: email,
                  petName,
                  shelterName: shelterNameVal,
                  sponsorPetName: sponsorPetNameVal,
                  dedication: dedication || '',
                  muralUrl: `${process.env.NEXT_PUBLIC_URL}/mural-global?highlight=${finalX},${finalY}&zoom=true`,
                  diplomaUrl: `${process.env.NEXT_PUBLIC_URL}/gracias/${sessionId}`,
                })
              : `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e0f0;font-family:Arial,Helvetica,sans-serif;">

<!-- Preheader oculto -->
<div style="display:none;max-height:0;overflow:hidden;">
  Gracias por crear un lugar eterno para tu angelito en el Mural de Ángeles.
</div>

<!-- Contenedor -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e0f0;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFF8F7;border-radius:16px;overflow:hidden;">

  <!-- HEADER IMAGEN -->
  <!-- Fallback local: /images/email/header-email.jpg -->
  <tr>
    <td bgcolor="#1E2A78" style="padding:0;">
      <img src="https://todaslasmascotasvanalcielo.com/images/email/header-email.jpg" 
           alt="Todas las mascotas van al cielo - Ángeles en el Cielo"
           width="600" height="200"
           style="display:block;max-width:100%;height:auto;">
    </td>
  </tr>

  <!-- CUERPO -->
  <tr>
    <td style="padding:40px 36px;background:#FFFFFF;">

      <!-- Saludo -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#706A95;margin:0 0 8px 0;">
        Hola,
      </p>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#25335F;line-height:1.3;margin:0 0 16px 0;">
        Tu ángel ya forma parte<br>del cielo ✨
      </h1>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#706A95;line-height:1.7;margin:0 0 12px 0;">
        Gracias por crear un lugar eterno para <strong style="color:#25335F;">tu angelito</strong>. 
        Su recuerdo ya ha sido recibido y formará parte del Mural de Ángeles.
      </p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#7B5EA9;line-height:1.7;font-style:italic;margin:0 0 32px 0;">
        Sabemos que no es solo una compra.<br>
        Es una forma preciosa de decir: sigues conmigo.
      </p>

      <!-- Resumen de compra -->
      <table width="100%" cellpadding="0" cellspacing="0" 
             style="background:#FFF8F7;border:1px solid #F3DCE7;border-radius:18px;margin:0 0 28px 0;">
        <tr>
          <td style="padding:24px;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#25335F;font-weight:700;margin:0 0 16px 0;">
              Resumen de tu recuerdo
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                  Mascota
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                  ${petName}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                  Plan
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                  ${planCfg.title}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                  Luces en el cielo
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                  ${planCfg.slotsCount} luces ✨
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                  Fecha
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                  ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;">
                  Importe
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;">
                  ${planCfg.price.EUR}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Bloque emocional -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#F7E8FF;border-radius:18px;margin:0 0 28px 0;">
        <tr>
          <td style="padding:24px;text-align:center;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#7B5EA9;font-style:italic;font-weight:700;margin:0 0 8px 0;">
              Tu angelito de 4 patas ya tiene su espacio<br>en el cielo de las mascotas.
            </p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9B8FB0;line-height:1.6;margin:0;">
              Cada vez que alguien visite el mural,<br>su recuerdo seguirá brillando. ✨
            </p>
          </td>
        </tr>
      </table>

      <!-- Bloque certificado -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#FFF8F7;border:1px solid #F3DCE7;border-radius:18px;margin:0 0 28px 0;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#706A95;line-height:1.6;margin:0;">
              🎁 <strong style="color:#25335F;">Tu certificado memorial</strong> se enviará 
              en 48-72h al email del registro. 
              Incluye versión PDF para imprimir and PNG para compartir en redes sociales.
            </p>
          </td>
        </tr>
      </table>

      <!-- CTA principal -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr>
          <td align="center">
            <a href="${process.env.NEXT_PUBLIC_URL}/mural-global?highlight=${finalX},${finalY}&zoom=true"
               style="display:inline-block;background:#F65F8F;color:#FFFFFF;padding:16px 40px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
              Ver su recuerdo ✦
            </a>
          </td>
        </tr>
      </table>

      <!-- Bloque ayuda -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#706A95;text-align:center;line-height:1.6;margin:24px 0 0 0;">
        Si necesitas modificar algún dato del recuerdo,<br>
        responde a este email o contáctanos en 
        <a href="mailto:hello@todaslasmascotasvanalcielo.com" 
           style="color:#7B5EA9;text-decoration:none;">
          hello@todaslasmascotasvanalcielo.com
        </a>
      </p>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td bgcolor="#1E2A78" style="padding:28px 36px;text-align:center;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#C9A961;font-weight:700;margin:0 0 6px 0;">
        Todas las mascotas van al cielo
      </p>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.50);line-height:1.6;margin:0 0 12px 0;">
        Este email confirma tu compra y la creación de tu recuerdo en Ángeles en el Cielo.
      </p>
      <p style="margin:0;font-size:11px;">
        <a href="${process.env.NEXT_PUBLIC_URL}/aviso-legal" 
           style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Aviso legal</a>
        <span style="color:rgba(255,255,255,0.20);">·</span>
        <a href="${process.env.NEXT_PUBLIC_URL}/privacidad" 
           style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Privacidad</a>
        <span style="color:rgba(255,255,255,0.20);">·</span>
        <a href="mailto:hello@todaslasmascotasvanalcielo.com" 
           style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Contacto</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>
            `

            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: email,
              subject: userEmailSubject,
              html: userEmailHtml,
            })
            console.log('Email de confirmación enviado al usuario (fallback):', email)

            // EMAIL 2 → ADMIN
            const adminSubject = isSponsor
              ? `💖 ¡Nuevo Apadrinamiento Solidario! (fallback): ${petName} (Por ${sponsorNameVal})`
              : `🐾 Nuevo ángel: ${petName} (${plan})`

            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: process.env.ADMIN_EMAIL || 'admin@todaslasmascotasvanalcielo.com',
              subject: adminSubject,
              html: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2>Nuevo ángel registrado (fallback)</h2>
                  <p><strong>Mascota:</strong> ${petName}</p>
                  <p><strong>Plan:</strong> ${plan}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Slot:</strong> ${slotAssignedStr}</p>
                </div>
              `,
            })
            console.log('Email de notificación enviado al administrador (fallback)')
          } catch (emailErr) {
            console.error('Error enviando emails en fallback a través de Resend:', emailErr)
          }
        }
      } catch (err) {
        console.error('Error procesando fallback de creación:', err)
      }
    }

    return NextResponse.json({
      petName: session.metadata?.petName || 'Tu ángel',
      petDate: session.metadata?.petDate || '',
      plan: session.metadata?.plan || '',
      email: session.metadata?.email || '',
      photoUrl: session.metadata?.photoUrl || '',
      thumbnailUrl: session.metadata?.thumbnailUrl || '',
      species: session.metadata?.species || '',
      breed: session.metadata?.breed || '',
      birthDate: session.metadata?.birthDate || '',
      location: session.metadata?.location || '',
      dedication: session.metadata?.dedication || '',
      slug: existingMemorial?.profile_slug || '',
      slotId: finalSlotId,
      sponsorName: session.metadata?.sponsorName || session.customer_details?.name || 'Padrino Solidario',
      shelterName: session.metadata?.shelterName || 'Refugio Nueva Vida',
      shelterPetName: session.metadata?.shelterPetName || session.metadata?.petName || 'Juliette',
      sponsorPetName: session.metadata?.sponsorPetName || '',
      isSponsorship: session.metadata?.isSponsorship === 'true' || 
        session.metadata?.plan?.toLowerCase().includes('corazon') || 
        session.metadata?.plan?.toLowerCase().includes('apadrinamiento'),
    })
  } catch (error) {
    console.error('Error recuperando sesión de Stripe, probando búsqueda en base de datos:', error)
    const dbMemorial = await findMemorialInDb(sessionId)
    if (dbMemorial) {
      return buildMemorialResponse(dbMemorial)
    }
    return NextResponse.json(
      { error: 'Sesión no encontrada' },
      { status: 404 }
    )
  }
}
