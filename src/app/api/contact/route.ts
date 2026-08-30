import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'El email proporcionado no es válido' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'El mensaje es obligatorio' }, { status: 400 });
    }

    const recipientEmail = 'norber.spinella@gmail.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';

    const { data, error: emailError } = await resend.emails.send({
      from: `Ángeles en el Cielo <${fromEmail}>`,
      to: recipientEmail,
      replyTo: email.trim(),
      subject: `🐾 [Contacto Web] Nuevo mensaje de ${name.trim()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFF9F7; border-radius: 16px; border: 1px solid #F3E8FF;">
          <h2 style="color: #1E2A78; margin-top: 0;">Nuevo mensaje de contacto 💌</h2>
          <p style="color: #4A3F6B; font-size: 15px; line-height: 1.6;">
            Has recibido un nuevo mensaje desde el formulario de contacto de <strong>todaslasmascotasvanalcielo.com</strong>:
          </p>
          
          <div style="background: #FFFFFF; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #E9D5FF;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1E2A78;">
              <strong>Nombre:</strong> ${escapeHtml(name.trim())}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1E2A78;">
              <strong>Email de contacto:</strong> <a href="mailto:${escapeHtml(email.trim())}" style="color: #EC4899;">${escapeHtml(email.trim())}</a>
            </p>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #1E2A78;">
              <strong>Mensaje:</strong>
            </p>
            <div style="background: #FAF5FF; padding: 14px; border-radius: 8px; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">
              ${escapeHtml(message.trim())}
            </div>
          </div>

          <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px; text-align: center;">
            Puedes responder directamente a este correo para contestar a ${escapeHtml(name.trim())}.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Error sending contact email via Resend:', emailError);
      return NextResponse.json({ 
        error: 'No se pudo enviar el correo en este momento. Por favor escribe a hello@todaslasmascotasvanalcielo.com' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '¡Tu mensaje ha sido enviado con éxito! Te responderemos muy pronto.' 
    });

  } catch (error: any) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json({ 
      error: 'Ocurrió un error inesperado al procesar el mensaje.' 
    }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
