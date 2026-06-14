import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendUserDeliveryEmail } from '@/lib/certificates';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Falta token de subida' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Buscar certificate por upload_token y status uploaded
    const { data: cert, error: fetchError } = await supabase
      .from('certificates')
      .select('*')
      .eq('upload_token', token)
      .eq('status', 'uploaded')
      .single();

    if (fetchError || !cert) {
      return NextResponse.json(
        { error: 'Certificado no encontrado o no está listo para entrega' }, 
        { status: 404 }
      );
    }

    // 2. Enviar email al usuario con el PDF y el PNG firmados
    await sendUserDeliveryEmail({
      userEmail: cert.user_email,
      petName: cert.pet_name,
      plan: cert.plan,
      certificatePdfUrl: cert.certificate_pdf_url,
      certificatePngUrl: cert.certificate_png_url,
      profileUrl: cert.profile_url || '',
    });

    // 3. Actualizar status de la orden a 'delivered'
    const { error: updateError } = await supabase
      .from('certificates')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', cert.id);

    if (updateError) {
      console.error('Error updating certificate delivery status:', updateError);
      throw new Error(`Error al actualizar estado del certificado a entregado: ${updateError.message}`);
    }

    console.log(`🎁 Certificado entregado con éxito para ${cert.pet_name} (${cert.order_id})`);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('❌ Error en el envío del certificado:', err);
    const errorMessage = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}
