import { createAdminClient } from '@/lib/supabase/server';
import { resend } from '@/lib/resend';
import { renderToStaticMarkup } from 'react-dom/server';
import { NeighborAngelEmail } from '@/components/emails/NeighborAngelEmail';
import { WeeklyDigestEmail } from '@/components/emails/WeeklyDigestEmail';

export interface NewPetNotificationData {
  newPetId: string;
  newPetName: string;
  newBreed?: string;
  newDedication?: string;
  newPhotoUrl?: string;
  x: number;
  y: number;
  planType: string;
  newEmail?: string;
}

/**
 * Comprueba si un email ha solicitado darse de baja de avisos
 */
export async function isEmailOptedOut(email: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data } = await (supabase
      .from('memorials') as any)
      .select('moderation_notes')
      .eq('email', email)
      .ilike('moderation_notes', '%opt_out%')
      .limit(1);

    return !!(data && data.length > 0);
  } catch (err) {
    console.error('Error checking opt out status:', err);
    return false;
  }
}

/**
 * Da de baja un email de las notificaciones
 */
export async function optOutEmail(email: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data: memorials } = await (supabase
      .from('memorials') as any)
      .select('id, moderation_notes')
      .eq('email', email);

    if (memorials && memorials.length > 0) {
      for (const m of memorials) {
        const existing = m.moderation_notes || '';
        if (!existing.includes('opt_out')) {
          await (supabase
            .from('memorials') as any)
            .update({ moderation_notes: `${existing} [opt_out_notifications]`.trim() })
            .eq('id', m.id);
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Error opting out email:', err);
    return false;
  }
}

/**
 * FÓRMULA B: Notifica a los dueños de mascotas vecinas (en un radio de casillas)
 */
export async function notifyNeighborsOfNewPet(data: NewPetNotificationData) {
  try {
    const { newPetId, newPetName, newBreed = 'Perrito', newDedication = '', newPhotoUrl = '', x, y, planType, newEmail } = data;
    const supabase = createAdminClient();

    // Radio de vecindad en el mural (8 casillas alrededor)
    const RADIUS = 8;
    const minX = Math.max(0, x - RADIUS);
    const maxX = Math.min(999, x + RADIUS);
    const minY = Math.max(0, y - RADIUS);
    const maxY = Math.min(999, y + RADIUS);

    // 1. Buscar slots vecinos ocupados
    const { data: slots, error: slotErr } = await (supabase
      .from('mural_slots') as any)
      .select('memorial_id, x, y')
      .gte('x', minX)
      .lte('x', maxX)
      .gte('y', minY)
      .lte('y', maxY)
      .neq('memorial_id', newPetId);

    if (slotErr || !slots || slots.length === 0) {
      console.log(`[Notificaciones] No se encontraron vecinos en el radio de ${newPetName}`);
      return { notified: 0 };
    }

    // 2. Extraer IDs únicos de memoriales vecinos
    const uniqueMemorialIds = Array.from(new Set(slots.map((s: any) => s.memorial_id).filter(Boolean))) as string[];

    if (uniqueMemorialIds.length === 0) return { notified: 0 };

    // 3. Obtener los datos de los memoriales vecinos
    const { data: neighborMemorials, error: memErr } = await (supabase
      .from('memorials') as any)
      .select('id, pet_name, email, publication_status, visibility, moderation_notes')
      .in('id', uniqueMemorialIds)
      .eq('publication_status', 'published')
      .eq('visibility', 'public');

    if (memErr || !neighborMemorials || neighborMemorials.length === 0) {
      return { notified: 0 };
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';
    const appUrl = process.env.NEXT_PUBLIC_URL || 'https://todaslasmascotasvanalcielo.com';

    // Evitar duplicados por email (si el mismo dueño tiene 2 mascotas vecinas, enviar solo 1 correo)
    const contactedEmails = new Set<string>();
    let sentCount = 0;

    for (const neighbor of neighborMemorials) {
      const neighborEmail = neighbor.email?.trim()?.toLowerCase();

      // No notificar al mismo dueño sobre sus propias mascotas
      if (!neighborEmail || neighborEmail === newEmail?.trim()?.toLowerCase()) continue;

      // No repetir si ya se contactó a este email en esta ronda
      if (contactedEmails.has(neighborEmail)) continue;

      // Comprobar si se dio de baja
      if (neighbor.moderation_notes && neighbor.moderation_notes.includes('opt_out')) {
        continue;
      }

      contactedEmails.add(neighborEmail);

      const muralLink = `${appUrl}/mural-global?highlight=${x},${y}&zoom=3.8`;
      const unsubscribeLink = `${appUrl}/api/notifications/unsubscribe?email=${encodeURIComponent(neighborEmail)}`;

      try {
        const html = renderToStaticMarkup(
          NeighborAngelEmail({
            ownerPetName: neighbor.pet_name,
            neighborPetName: newPetName,
            neighborBreed: newBreed,
            neighborDedication: newDedication,
            neighborPhotoUrl: newPhotoUrl,
            isFounder: planType === 'recuerdo_eterno' || planType === 'corazon_eterno',
            muralUrl: muralLink,
            unsubscribeUrl: unsubscribeLink,
          })
        );

        await resend.emails.send({
          from: `Ángeles en el Cielo <${fromEmail}>`,
          to: neighborEmail,
          subject: `🐾 ¡Un nuevo angelito acompaña a ${neighbor.pet_name} en el cielo!`,
          html,
        });

        sentCount++;
        console.log(`[Notificaciones] Aviso de vecino enviado a ${neighborEmail} (mascota: ${neighbor.pet_name})`);
      } catch (sendErr) {
        console.error(`[Notificaciones] Error enviando email de vecino a ${neighborEmail}:`, sendErr);
      }
    }

    return { notified: sentCount };
  } catch (err) {
    console.error('[Notificaciones] Error general en notifyNeighborsOfNewPet:', err);
    return { notified: 0, error: err };
  }
}

/**
 * FÓRMULA A: Envía el Resumen Semanal de Nuevas Estrellas
 */
export async function sendWeeklyDigestNotification() {
  try {
    const supabase = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_URL || 'https://todaslasmascotasvanalcielo.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';

    // 1. Buscar mascotas publicadas en los últimos 7 días
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentPetsData, error: recentErr } = await (supabase
      .from('memorials') as any)
      .select('id, pet_name, breed, photo_url, created_at')
      .eq('publication_status', 'published')
      .eq('visibility', 'public')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(8);

    if (recentErr || !recentPetsData || recentPetsData.length === 0) {
      console.log('[Resumen Semanal] No hay nuevas mascotas en los últimos 7 días. No se envían correos.');
      return { sent: 0, reason: 'no_recent_pets' };
    }

    const recentPets = recentPetsData.map((p: any) => ({
      name: p.pet_name,
      breed: p.breed || 'Perrito',
      photoUrl: p.photo_url || `${appUrl}/images/placeholders/first.webp`,
    }));

    // 2. Obtener lista de familias registradas anteriormente
    const { data: allOwners, error: ownersErr } = await (supabase
      .from('memorials') as any)
      .select('email, pet_name, moderation_notes')
      .eq('publication_status', 'published')
      .eq('visibility', 'public');

    if (ownersErr || !allOwners || allOwners.length === 0) {
      return { sent: 0, reason: 'no_recipients' };
    }

    // Agrupar por email para personalizar con el nombre de sus mascotas
    const emailToPetsMap = new Map<string, string[]>();

    for (const row of allOwners) {
      const email = row.email?.trim()?.toLowerCase();
      if (!email) continue;
      if (row.moderation_notes && row.moderation_notes.includes('opt_out')) continue;

      if (!emailToPetsMap.has(email)) {
        emailToPetsMap.set(email, []);
      }
      if (row.pet_name && !emailToPetsMap.get(email)!.includes(row.pet_name)) {
        emailToPetsMap.get(email)!.push(row.pet_name);
      }
    }

    let sentCount = 0;
    const muralLink = `${appUrl}/mural-global`;

    for (const [email, petNames] of Array.from(emailToPetsMap.entries())) {
      const ownerPetNames = petNames.length > 2 
        ? `${petNames.slice(0, -1).join(', ')} y ${petNames[petNames.length - 1]}`
        : petNames.join(' y ');

      const unsubscribeLink = `${appUrl}/api/notifications/unsubscribe?email=${encodeURIComponent(email)}`;

      try {
        const html = renderToStaticMarkup(
          WeeklyDigestEmail({
            ownerPetNames: ownerPetNames || 'tus angelitos',
            recentPets,
            muralUrl: muralLink,
            unsubscribeUrl: unsubscribeLink,
          })
        );

        await resend.emails.send({
          from: `Ángeles en el Cielo <${fromEmail}>`,
          to: email,
          subject: `✨ Esta semana nuevas estrellas brillan en el cielo junto a ${ownerPetNames}`,
          html,
        });

        sentCount++;
      } catch (sendErr) {
        console.error(`[Resumen Semanal] Error enviando digest a ${email}:`, sendErr);
      }
    }

    console.log(`[Resumen Semanal] Completado. ${sentCount} correos enviados.`);
    return { sent: sentCount, recentCount: recentPets.length };
  } catch (err) {
    console.error('[Resumen Semanal] Error general:', err);
    return { sent: 0, error: err };
  }
}
