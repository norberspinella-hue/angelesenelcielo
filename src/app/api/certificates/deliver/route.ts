import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Falta token de subida' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Buscar certificate por upload_token y status uploaded
    const { data, error: fetchError } = await (supabase
      .from('certificates') as any)
      .select('*')
      .eq('upload_token', token)
      .eq('status', 'uploaded')
      .single();

    const cert = data as any;

    if (fetchError || !cert) {
      return NextResponse.json(
        { error: 'Certificado no encontrado o no está listo para entrega' }, 
        { status: 404 }
      );
    }

    // 2. Enviar email al usuario con el PDF y el PNG firmados
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';
    const { error: emailError } = await resend.emails.send({
      from: `Ángeles en el Cielo <${fromEmail}>`,
      to: cert.user_email,
      subject: `🎁 El certificado de ${cert.pet_name} ya está listo`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; 
        margin: 0 auto; padding: 40px 20px;
        background: linear-gradient(160deg, #ffe8f0, #f5e8ff);">
          <h1 style="color: #4A3F6B; font-size: 28px;">
            🎁 El certificado de ${cert.pet_name} ya está listo
          </h1>
          <p style="color: #7B6F9A; font-size: 16px; line-height: 1.6;">
            Tu certificado personalizado ha sido creado con mucho cariño.
            <strong>${cert.pet_name}</strong> tiene ahora su lugar eterno en el mural.
          </p>
          <div style="margin: 32px 0; display: flex; flex-direction: column; gap: 16px;">
            <a href="${cert.certificate_pdf_url}" 
               style="background: linear-gradient(90deg, #ff82ad, #ec5f96);
               color: white; padding: 14px 28px; border-radius: 999px;
               text-decoration: none; font-weight: 700; font-size: 16px;
               display: inline-block; text-align: center; margin-bottom: 12px;">
              📄 Descargar certificado PDF
            </a>
            <a href="${cert.certificate_png_url}" 
               style="background: linear-gradient(90deg, #9B8FB0, #7B5EA9);
               color: white; padding: 14px 28px; border-radius: 999px;
               text-decoration: none; font-weight: 700; font-size: 16px;
               display: inline-block; text-align: center;">
              🖼️ Descargar imagen para redes sociales
            </a>
          </div>
          <p style="color: #7B6F9A; font-size: 14px; line-height: 1.6;">
            Comparte su historia en redes sociales y 
            mantén viva su memoria para siempre.
          </p>
          <p style="color: #B8B0CC; font-size: 12px; text-align: center; margin-top: 32px;">
            Ángeles en el Cielo · todaslasmascotasvanalcielo.com
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Error sending delivery email:', emailError);
      throw emailError;
    }

    // 3. Actualizar status de la orden a 'delivered'
    const { error: updateError } = await (supabase
      .from('certificates') as any)
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
