import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { sendUserDeliveryEmail } from '@/lib/certificates';

export const dynamic = 'force-dynamic';

// Orden cronológico y asignación oficial de los primeros Ángeles Fundadores (#1 al #6)
const FOUNDER_SPECS = [
  { slug: 'chloe-1791659186920', petName: 'Chloe', number: 1, email: 'norber.spinella@gmail.com', slot: '499,499' },
  { slug: 'house-1791661708523', petName: 'House', number: 2, email: 'norber.spinella@gmail.com', slot: '495,499' },
  { slug: 'mary-margaret-1791704934801', petName: 'Mary Margaret', number: 3, email: 'norber.spinella@gmail.com', slot: '497,503' },
  { slug: 'juliette-1791706558194', petName: 'Juliette', number: 4, email: 'norber.spinella@gmail.com', slot: '497,495' },
  { slug: 'protectora-vaiana-1792348295633', petName: 'Vaiana', number: 5, email: 'protectoras@todaslasmascotasvanalcielo.com', slot: '476,494' },
  { slug: 'nano-1792605318398', petName: 'Nano', number: 6, email: 'davidcerro1976@gmail.com', slot: '503,499' },
  { slug: 'bro-1792879210062', petName: 'Bro', number: 7, email: 'yaritcar@gmail.com', slot: '503,495' },
];

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    // 1. Obtener certificados existentes
    const { data: certs, error: certErr } = await (supabase
      .from('certificates') as any)
      .select('*')
      .order('created_at', { ascending: true });

    if (certErr) {
      console.error('Error fetching certificates:', certErr);
      return NextResponse.json({ error: certErr.message }, { status: 500 });
    }

    // 2. Obtener memoriales para enriquecer y asegurar sincronización
    const { data: memorials, error: memErr } = await (supabase
      .from('memorials') as any)
      .select('*')
      .not('slot_assigned', 'is', null);

    const existingCerts = (certs || []) as any[];
    const memorialsList = (memorials || []) as any[];

    // 3. Sincronizar los 6 fundadores iniciales
    for (const spec of FOUNDER_SPECS) {
      const mem = memorialsList.find(
        (m: any) => m.profile_slug === spec.slug || m.slot_assigned === spec.slot || m.pet_name?.toLowerCase() === spec.petName.toLowerCase()
      );

      const foundIndex = existingCerts.findIndex(
        (c: any) =>
          c.pet_name?.toLowerCase() === spec.petName.toLowerCase() ||
          c.order_id === `AEC-FOUNDER-${String(spec.number).padStart(4, '0')}`
      );

      if (foundIndex === -1) {
        const orderId = `AEC-FOUNDER-${String(spec.number).padStart(4, '0')}`;
        const newRecord = {
          order_id: orderId,
          user_email: spec.email,
          pet_name: spec.petName,
          plan: mem?.plan_type || 'recuerdo_eterno',
          pet_photo_url: mem?.photo_url || '',
          upload_token: crypto.randomUUID(),
          status: 'pending',
          created_at: mem?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: inserted, error: insErr } = await (supabase
          .from('certificates') as any)
          .insert(newRecord)
          .select()
          .single();

        if (!insErr && inserted) {
          existingCerts.push(inserted);
        } else {
          console.error('Error inserting founder cert row:', insErr);
        }
      } else {
        // Asegurar que el order_id o el email reflejen el identificador de fundador si era temporal
        const currentCert = existingCerts[foundIndex];
        const targetOrderId = `AEC-FOUNDER-${String(spec.number).padStart(4, '0')}`;
        if (!currentCert.order_id.startsWith('AEC-FOUNDER-')) {
          await (supabase
            .from('certificates') as any)
            .update({ order_id: targetOrderId, user_email: spec.email })
            .eq('id', currentCert.id);
          currentCert.order_id = targetOrderId;
          currentCert.user_email = spec.email;
        }
      }
    }

    // 4. Enriquecer los certificados con metadatos del memorial y número de fundador
    const enrichedList = existingCerts.map((cert) => {
      // Determinar número de fundador
      let founderNumber: number | null = null;
      const founderMatch = FOUNDER_SPECS.find(
        (f) =>
          f.petName.toLowerCase() === cert.pet_name?.toLowerCase() ||
          cert.order_id === `AEC-FOUNDER-${String(f.number).padStart(4, '0')}`
      );

      if (founderMatch) {
        founderNumber = founderMatch.number;
      } else if (cert.order_id?.startsWith('AEC-FOUNDER-')) {
        const parsed = parseInt(cert.order_id.replace('AEC-FOUNDER-', ''), 10);
        if (!isNaN(parsed)) founderNumber = parsed;
      }

      // Buscar datos del memorial correspondiente
      const mem = memorialsList.find(
        (m: any) =>
          m.pet_name?.toLowerCase() === cert.pet_name?.toLowerCase() ||
          (founderMatch && m.slot_assigned === founderMatch.slot)
      );

      const slotCode = founderMatch?.slot || mem?.slot_assigned || null;

      return {
        ...cert,
        founder_number: founderNumber,
        slot_code: slotCode,
        species: mem?.species || 'perro',
        breed: mem?.breed || '',
        birth_date: mem?.birth_date || null,
        death_date: mem?.death_date || null,
        dedication: mem?.dedication || '',
        profile_url: mem?.profile_slug
          ? `https://todaslasmascotasvanalcielo.com/memorial/${mem.profile_slug}`
          : null,
        mural_url: slotCode
          ? `https://todaslasmascotasvanalcielo.com/mural-global?highlight=${slotCode}&zoom=true`
          : null,
      };
    });

    // Ordenar: Fundadores primero por número (#1 a #6), luego otros por fecha
    enrichedList.sort((a, b) => {
      if (a.founder_number && b.founder_number) return a.founder_number - b.founder_number;
      if (a.founder_number) return -1;
      if (b.founder_number) return 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const totalFounders = 2000;
    const foundersOccupied = enrichedList.filter((c) => Boolean(c.founder_number)).length;
    const foundersAvailable = Math.max(0, totalFounders - foundersOccupied);
    const pendingCount = enrichedList.filter((c) => c.status === 'pending').length;
    const deliveredCount = enrichedList.filter((c) => c.status === 'delivered' || c.status === 'uploaded').length;

    return NextResponse.json({
      success: true,
      certificates: enrichedList,
      stats: {
        totalFounders,
        foundersOccupied,
        foundersAvailable,
        pendingCount,
        deliveredCount,
        totalCertificates: enrichedList.length,
      },
    });
  } catch (err: any) {
    console.error('Error en GET /api/admin/certificates:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Actualizar estado, URLs o enviar el certificado a la familia
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { action, id, status, user_email, certificate_pdf_url, certificate_png_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'Falta el id del certificado' }, { status: 400 });
    }

    // Acción 1: Entregar por email al usuario
    if (action === 'deliver_email') {
      const { data: cert, error: fetchErr } = await (supabase
        .from('certificates') as any)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !cert) {
        return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 });
      }

      const targetEmail = user_email || cert.user_email;
      const pdfUrl = certificate_pdf_url || cert.certificate_pdf_url;
      const pngUrl = certificate_png_url || cert.certificate_png_url;

      if (!targetEmail) {
        return NextResponse.json({ error: 'No hay email de destino configurado' }, { status: 400 });
      }

      if (!pdfUrl && !pngUrl) {
        return NextResponse.json(
          { error: 'Debes añadir al menos la URL del PDF o del PNG del diploma antes de entregarlo' },
          { status: 400 }
        );
      }

      // Enviar email con la plantilla oficial
      await sendUserDeliveryEmail({
        userEmail: targetEmail,
        petName: cert.pet_name,
        plan: cert.plan,
        certificatePdfUrl: pdfUrl || pngUrl,
        certificatePngUrl: pngUrl || pdfUrl,
        profileUrl: 'https://todaslasmascotasvanalcielo.com',
      });

      // Actualizar estado en BD a entregado
      const now = new Date().toISOString();
      const { data: updated, error: updErr } = await (supabase
        .from('certificates') as any)
        .update({
          status: 'delivered',
          delivered_at: now,
          updated_at: now,
          user_email: targetEmail,
          certificate_pdf_url: pdfUrl,
          certificate_png_url: pngUrl,
        })
        .eq('id', id)
        .select()
        .single();

      if (updErr) throw updErr;

      return NextResponse.json({
        success: true,
        message: `Certificado enviado con éxito a ${targetEmail}`,
        certificate: updated,
      });
    }

    // Acción 2: Actualización de datos generales
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (user_email) updatePayload.user_email = user_email;
    if (certificate_pdf_url !== undefined) updatePayload.certificate_pdf_url = certificate_pdf_url;
    if (certificate_png_url !== undefined) updatePayload.certificate_png_url = certificate_png_url;

    const { data: updated, error: updErr } = await (supabase
      .from('certificates') as any)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updErr) throw updErr;

    return NextResponse.json({
      success: true,
      certificate: updated,
    });
  } catch (err: any) {
    console.error('Error en POST /api/admin/certificates:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
