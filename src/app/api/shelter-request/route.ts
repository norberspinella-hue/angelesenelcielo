import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      shelterName,
      shelterCity,
      shelterEmail,
      shelterPhone,
      shelterContact,
      notes,
    } = body;

    if (!shelterName || typeof shelterName !== 'string' || !shelterName.trim()) {
      return NextResponse.json({ error: 'El nombre de la protectora es obligatorio' }, { status: 400 });
    }

    if (!shelterCity || typeof shelterCity !== 'string' || !shelterCity.trim()) {
      return NextResponse.json({ error: 'La ciudad o región es obligatoria' }, { status: 400 });
    }

    // Determinar email y teléfono
    let contactEmail = (shelterEmail || '').trim();
    let contactPhone = (shelterPhone || '').trim();

    // Compatibilidad hacia atrás si se envió un único campo shelterContact
    if (!contactEmail && shelterContact) {
      if (shelterContact.includes('@')) {
        contactEmail = shelterContact.trim();
      } else {
        contactPhone = shelterContact.trim();
      }
    }

    if (!contactEmail && !contactPhone) {
      return NextResponse.json({ error: 'Por favor indica al menos un email o teléfono de contacto' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'norber.spinella@gmail.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';
    const nowStr = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' });

    // 1. Notificación por email al Administrador
    const cleanPhone = contactPhone ? contactPhone.replace(/[^0-9+]/g, '') : '';
    const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.length === 9 ? '34' + cleanPhone : cleanPhone)}` : null;

    const { error: adminEmailError } = await resend.emails.send({
      from: `Ángeles en el Cielo <${fromEmail}>`,
      to: adminEmail,
      replyTo: contactEmail || undefined,
      subject: `🏡 [Solicitud Protectora] Nueva inscripción: ${shelterName.trim()} (${shelterCity.trim()})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #FFF9F7; border-radius: 16px; border: 1px solid #F3E8FF;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 40px;">🏡🐾</span>
            <h2 style="color: #1E2A78; margin: 10px 0 4px 0; font-size: 22px;">Nueva Solicitud de Protectora</h2>
            <p style="color: #6B4C7D; font-size: 14px; margin: 0;">Iniciativa Solidaria · Programa Piloto (5 Angelitos Gratis)</p>
          </div>
          
          <div style="background: #FFFFFF; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #E9D5FF; box-shadow: 0 4px 12px rgba(180,140,190,0.08);">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #706A95; font-weight: 600; width: 35%;">Protectora / Refugio:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #1E2A78; font-weight: 700; font-size: 15px;">${escapeHtml(shelterName.trim())}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #706A95; font-weight: 600;">Ciudad / Región:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #1E2A78;">${escapeHtml(shelterCity.trim())}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #706A95; font-weight: 600;">Email de contacto:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #1E2A78;">
                  ${contactEmail ? `<a href="mailto:${escapeHtml(contactEmail)}" style="color: #EC4899; font-weight: 600; text-decoration: none;">${escapeHtml(contactEmail)}</a>` : '<span style="color: #9CA3AF;">No indicado</span>'}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #706A95; font-weight: 600;">Teléfono / WhatsApp:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #1E2A78;">
                  ${contactPhone ? `<span style="font-weight: 600;">${escapeHtml(contactPhone)}</span>` : '<span style="color: #9CA3AF;">No indicado</span>'}
                </td>
              </tr>
              ${notes && typeof notes === 'string' && notes.trim() ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #706A95; font-weight: 600; vertical-align: top;">Notas / Mensaje:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3E8FF; color: #374151;">${escapeHtml(notes.trim())}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; color: #706A95; font-weight: 600;">Fecha y hora:</td>
                <td style="padding: 10px 0; color: #706A95; font-size: 13px;">${nowStr}</td>
              </tr>
            </table>
          </div>

          <!-- Acciones directas para el admin -->
          <div style="text-align: center; margin-top: 24px;">
            ${contactEmail ? `
              <a href="mailto:${escapeHtml(contactEmail)}?subject=Bienvenida%20al%20Programa%20Piloto%20·%20Ángeles%20en%20el%20Cielo" 
                 style="display: inline-block; background: #7C3AED; color: #FFFFFF; font-weight: bold; font-size: 13px; padding: 12px 22px; border-radius: 24px; text-decoration: none; margin: 4px;">
                ✉️ Responder por Email
              </a>
            ` : ''}
            ${whatsappLink ? `
              <a href="${whatsappLink}" target="_blank" 
                 style="display: inline-block; background: #25D366; color: #FFFFFF; font-weight: bold; font-size: 13px; padding: 12px 22px; border-radius: 24px; text-decoration: none; margin: 4px;">
                💬 Abrir chat en WhatsApp
              </a>
            ` : ''}
          </div>

          <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px; text-align: center;">
            Este aviso fue generado automáticamente tras el envío del formulario de la Tarjeta 1 en todaslasmascotasvanalcielo.com
          </p>
        </div>
      `,
    });

    if (adminEmailError) {
      console.error('Error al enviar notificación de protectora al admin via Resend:', adminEmailError);
    } else {
      console.log('Notificación de protectora enviada exitosamente al admin:', adminEmail);
    }

    // 2. Email de confirmación al contacto de la Protectora (si facilitó email)
    if (contactEmail && contactEmail.includes('@')) {
      await resend.emails.send({
        from: `Ángeles en el Cielo <${fromEmail}>`,
        to: contactEmail,
        subject: `🐾 Hemos recibido la solicitud de ${shelterName.trim()} · Programa Piloto Corazones de Ángel`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFF9F7; border-radius: 16px; border: 1px solid #F3E8FF;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 44px;">🕊️🐾</span>
              <h2 style="color: #1E2A78; margin: 12px 0 6px 0; font-size: 22px;">¡Gracias por contactarnos!</h2>
              <p style="color: #6B4C7D; font-size: 15px; margin: 0;">Iniciativa Solidaria · Corazones de Ángel</p>
            </div>

            <div style="background: #FFFFFF; border-radius: 12px; padding: 22px; margin: 20px 0; border: 1px solid #E9D5FF; color: #374151; font-size: 14px; line-height: 1.65;">
              <p>Hola equipo de <strong>${escapeHtml(shelterName.trim())}</strong>,</p>
              
              <p>
                Hemos recibido con mucho cariño vuestra solicitud para sumarse al programa piloto en <strong>Ángeles en el Cielo</strong>.
              </p>
              
              <div style="background: #FDF4FF; border-left: 4px solid #D946EF; padding: 14px 16px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0; color: #701A75; font-size: 13.5px; font-weight: 600;">
                  ✨ Vuestro refugio tiene asignados 5 recuerdos conmemorativos de 9 estrellas de forma 100% gratuita para angelitos que partieron bajo vuestra custodia.
                </p>
              </div>

              <p>
                En las próximas <strong>24 horas laborables</strong> nos pondremos en contacto con vosotros a través de este correo o vía WhatsApp para facilitaros el acceso y ayudaros a publicar las historias y fotos de vuestros angelitos.
              </p>

              <p style="margin-bottom: 0;">
                Gracias de corazón por la labor incansable que hacéis cada día por los animales más vulnerables.
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://todaslasmascotasvanalcielo.com/#corazones-de-angel" 
                 style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFFFF; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 24px; text-decoration: none;">
                Conocer la iniciativa solidaria
              </a>
            </div>

            <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px; text-align: center;">
              Ángeles en el Cielo · Un millón de ángeles, un solo Cielo.<br />
              <a href="https://todaslasmascotasvanalcielo.com" style="color: #7C3AED; text-decoration: none;">todaslasmascotasvanalcielo.com</a>
            </p>
          </div>
        `,
      }).catch(err => {
        console.error('Error enviando confirmación a la protectora:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud enviada correctamente',
    });
  } catch (error) {
    console.error('Error procesando solicitud de protectora en /api/shelter-request:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud' },
      { status: 500 }
    );
  }
}
