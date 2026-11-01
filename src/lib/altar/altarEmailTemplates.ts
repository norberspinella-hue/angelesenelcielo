/**
 * Plantillas HTML oficiales para el sistema de correos de Cielo lleno de luces.
 * 
 * PALETA OFICIAL APROBADA (ACTUALIZACIÓN FASE K):
 * - Fondo lavanda celestial: #EFE2F5
 * - Fondo blanco cálido: #FFFDFB
 * - Recuadros rosa nube: #F7EFF5
 * - Botones principales rosa malva: #A87991
 * - Títulos ciruela suave: #795377
 * - Elementos decorativos rosa empolvado: #B98489
 * - Texto principal gris ciruela: #645260
 * - Texto secundario malva oscuro: #76546D
 * - Texto de botones: #FFFFFF
 * 
 * ELEMENTOS DE MARCA INTOCABLES:
 * - Cabecera oficial con imagen: https://todaslasmascotasvanalcielo.com/images/email/header-email.jpg
 * - Pie de página oficial con azul corporativo #1E2A78, dorado #C9A961 y enlaces de privacidad/contacto.
 */

interface BaseEmailProps {
  petName: string;
  authorName?: string;
  candleUrl: string;
  unsubscribeUrl: string;
  headerImageUrl?: string;
}

export interface ConfirmationEmailProps extends BaseEmailProps {
  manageUrl: string;
  expiresDateStr: string;
}

export interface PreExtinctionEmailProps extends BaseEmailProps {
  reigniteUrl: string;
  hoursRemaining?: number;
}

export interface ExtinguishedEmailProps extends BaseEmailProps {
  reigniteUrl: string;
  muralUrl: string;
}

export interface RecoveryEmailProps extends BaseEmailProps {
  recoveryUrl: string;
  expiresHours?: number;
  requestDateStr: string;
}

const DEFAULT_HEADER_IMG = 'https://todaslasmascotasvanalcielo.com/images/email/header-email.jpg';

function renderOfficialFooter(unsubscribeUrl?: string): string {
  return `
    <!-- 3. FOOTER OFICIAL (IDÉNTICO AL MURAL GLOBAL) -->
    <tr>
      <td bgcolor="#1E2A78" style="padding:28px 36px;text-align:center;">
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#C9A961;font-weight:700;margin:0 0 6px 0;letter-spacing:0.5px;">
          Todas las mascotas van al cielo
        </p>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.50);line-height:1.6;margin:0 0 12px 0;">
          Enviado con todo nuestro respeto y cariño a las familias de Ángeles en el Cielo.
        </p>
        <p style="margin:0;font-size:11px;font-family:Arial,Helvetica,sans-serif;">
          <a href="https://todaslasmascotasvanalcielo.com/mural-global" 
             style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Mural Global</a>
          <span style="color:rgba(255,255,255,0.20);">·</span>
          <a href="https://todaslasmascotasvanalcielo.com/privacidad" 
             style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Privacidad</a>
          <span style="color:rgba(255,255,255,0.20);">·</span>
          <a href="https://todaslasmascotasvanalcielo.com/contacto" 
             style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Contacto</a>
          ${unsubscribeUrl ? `
          <span style="color:rgba(255,255,255,0.20);">·</span>
          <a href="${unsubscribeUrl}" 
             style="color:rgba(255,255,255,0.50);text-decoration:underline;margin:0 8px;">Darse de baja</a>
          ` : ''}
        </p>
      </td>
    </tr>
  `;
}

function renderOfficialHeader(headerImg = DEFAULT_HEADER_IMG): string {
  return `
    <!-- 1. HEADER OFICIAL CON IMAGEN CELESTIAL (IDÉNTICO AL MURAL GLOBAL) -->
    <tr>
      <td bgcolor="#1E2A78" style="padding:0;line-height:0;text-align:center;">
        <img 
          src="${headerImg}" 
          alt="Todas las mascotas van al cielo · Ángeles en el Cielo"
          width="600" 
          height="200"
          style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;"
        />
      </td>
    </tr>
  `;
}

/**
 * 1. Plantilla de Confirmación Inmediata de Encendido
 */
export function generateConfirmationEmailHtml(props: ConfirmationEmailProps): string {
  const authorGreeting = props.authorName && props.authorName !== 'Familia amorosa' ? ` ${props.authorName}` : '';
  const headerImg = props.headerImageUrl || DEFAULT_HEADER_IMG;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Una luz brilla por ${props.petName} en el Cielo de Luces ♡</title>
</head>
<body style="margin:0;padding:24px 0;background-color:#EFE2F5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader oculto -->
  <div style="display:none;font-size:1px;color:#EFE2F5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    La velita de ${props.petName} ya arde en el altar comunitario. Guarda este correo para gestionar su luz.
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#EFE2F5;padding:12px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFDFB;border-radius:20px;overflow:hidden;border:1px solid #DEC8D7;box-shadow:0 10px 32px rgba(121,83,119,0.08);border-collapse:collapse;">
          
          ${renderOfficialHeader(headerImg)}

          <!-- 2. CUERPO CENTRAL -->
          <tr>
            <td style="padding:36px 32px 28px;background-color:#FFFDFB;">
              
              <!-- Badge decorativo de sección -->
              <div style="margin-bottom:12px;">
                <span style="display:inline-block;background-color:#F7EFF5;border:1px solid #B98489;color:#795377;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;border-radius:999px;">
                  ✦ Cielo lleno de luces · Altar Comunitario
                </span>
              </div>

              <!-- Título principal -->
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#795377;line-height:1.3;margin:0 0 16px 0;font-weight:700;">
                Una luz brilla por ${props.petName} ✨
              </h1>

              <!-- Saludo y mensaje principal -->
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#76546D;margin:0 0 12px 0;">
                Hola${authorGreeting},
              </p>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#645260;line-height:1.7;margin:0 0 16px 0;">
                Queremos confirmarte con todo nuestro cariño que la velita en memoria de <strong style="color:#795377;">${props.petName}</strong> ya ha sido encendida en el altar comunitario. Su llama viva permanecerá ardiendo durante los próximos <strong>7 días</strong> (hasta el <strong>${props.expiresDateStr}</strong>) para acompañar su vuelo.
              </p>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#645260;line-height:1.7;margin:0 0 24px 0;">
                Cumplidos los 7 días, la llama entrará en reposo, pero su fotografía, dedicatoria y tarjeta <strong>permanecerán visibles en el altar para siempre</strong>. Podrás volver a encenderla gratuitamente tantas veces como lo sientas en tu corazón.
              </p>

              <!-- Botón Principal Malva -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;border-collapse:collapse;">
                <tr>
                  <td align="center" style="border-radius:9999px;background-color:#A87991;">
                    <a href="${props.candleUrl}" target="_blank" style="display:inline-block;background-color:#A87991;color:#FFFFFF;padding:16px 38px;border-radius:9999px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(168,121,145,0.30);">
                      Ver la vela de ${props.petName} en el Altar →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Recuadro Rosa Nube: Enlace Privado de Gestión -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F7EFF5;border:1.5px solid #DEC8D7;border-radius:18px;margin:0 0 24px 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:20px 22px;">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td width="32" valign="top" style="font-size:22px;line-height:1;">🔑</td>
                        <td style="padding-left:10px;">
                          <p style="font-family:Georgia,'Times New Roman',serif;margin:0 0 6px;font-size:14px;font-weight:700;color:#795377;">
                            Tu enlace privado de gestión
                          </p>
                          <p style="font-family:Arial,Helvetica,sans-serif;margin:0 0 10px;font-size:12.5px;line-height:1.6;color:#645260;">
                            Guarda este correo. Si visitas el altar desde otro ordenador o teléfono, este enlace te permitirá reavivar la vela directamente sin contraseñas:
                          </p>
                          <a href="${props.manageUrl}" target="_blank" style="font-family:Arial,Helvetica,sans-serif;display:inline-block;font-size:12.5px;font-weight:700;color:#795377;text-decoration:underline;word-break:break-all;">
                            Gestionar y reavivar la vela de ${props.petName} →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Cita Emotiva en Ciruela / Malva Oscuro -->
              <p style="font-family:Georgia,'Times New Roman',serif;margin:0;font-size:14px;line-height:1.6;color:#76546D;font-style:italic;text-align:center;">
                «Cada luz es un recuerdo, cada llama una historia de amor eterno.»
              </p>

            </td>
          </tr>

          ${renderOfficialFooter(props.unsubscribeUrl)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 2. Plantilla de Aviso Previo al Apagado (Día 5 / 48 horas antes)
 */
export function generatePreExtinctionEmailHtml(props: PreExtinctionEmailProps): string {
  const authorGreeting = props.authorName && props.authorName !== 'Familia amorosa' ? ` ${props.authorName}` : '';
  const hoursText = props.hoursRemaining || 48;
  const headerImg = props.headerImageUrl || DEFAULT_HEADER_IMG;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La velita de ${props.petName} descansará pronto en el Cielo de Luces 🕯️</title>
</head>
<body style="margin:0;padding:24px 0;background-color:#EFE2F5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#EFE2F5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    En ${hoursText} horas la llama de ${props.petName} entrará en reposo. Puedes volver a encenderla gratis.
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#EFE2F5;padding:12px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFDFB;border-radius:20px;overflow:hidden;border:1px solid #DEC8D7;box-shadow:0 10px 32px rgba(121,83,119,0.08);border-collapse:collapse;">
          
          ${renderOfficialHeader(headerImg)}

          <!-- CUERPO CENTRAL -->
          <tr>
            <td style="padding:36px 32px 28px;background-color:#FFFDFB;">
              
              <!-- Badge -->
              <div style="margin-bottom:12px;">
                <span style="display:inline-block;background-color:#F7EFF5;border:1px solid #B98489;color:#795377;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;border-radius:999px;">
                  ⏳ Aviso de reposo · 48 horas restantes
                </span>
              </div>

              <!-- Título -->
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:25px;color:#795377;line-height:1.3;margin:0 0 16px 0;font-weight:700;">
                La velita de ${props.petName} descansará pronto
              </h1>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#76546D;margin:0 0 12px 0;">
                Hola${authorGreeting},
              </p>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#645260;line-height:1.7;margin:0 0 16px 0;">
                Han pasado 5 días desde que encendiste la velita por <strong style="color:#795377;">${props.petName}</strong> en el Cielo de Luces. Su llama viva ha estado acompañando a nuestra comunidad con paz y serenidad.
              </p>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#645260;line-height:1.7;margin:0 0 24px 0;">
                En <strong>${hoursText} horas</strong> su llama entrará en reposo según el ciclo natural del altar. Si deseas que continúe ardiendo sin interrupción, puedes reavivarla por <strong>7 días nuevos de forma 100% gratuita</strong>:
              </p>

              <!-- Botón Principal Malva -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;border-collapse:collapse;">
                <tr>
                  <td align="center" style="border-radius:9999px;background-color:#A87991;">
                    <a href="${props.reigniteUrl}" target="_blank" style="display:inline-block;background-color:#A87991;color:#FFFFFF;padding:16px 38px;border-radius:9999px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(168,121,145,0.30);">
                      Reavivar la llama de ${props.petName} (Gratis) →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Recuadro Rosa Nube: Mensaje de Tranquilidad -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F7EFF5;border:1.5px solid #DEC8D7;border-radius:18px;margin:0 0 20px 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="font-family:Arial,Helvetica,sans-serif;margin:0;font-size:13.5px;line-height:1.65;color:#645260;">
                      <strong style="color:#795377;">Recuerda:</strong> No hay ninguna prisa. Aunque la llama descanse, su fotografía y dedicatoria no se borrarán; permanecerán en el altar para que puedas visitarla y volver a encenderla cuando tu corazón lo desee.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#76546D;text-align:center;line-height:1.6;margin:0;">
                O visita directamente el altar comunitario en: <br />
                <a href="${props.candleUrl}" style="color:#795377;text-decoration:underline;">${props.candleUrl}</a>
              </p>

            </td>
          </tr>

          ${renderOfficialFooter(props.unsubscribeUrl)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 3. Plantilla de Aviso de Vela Apagada / En Reposo (Día 7)
 */
export function generateExtinguishedEmailHtml(props: ExtinguishedEmailProps): string {
  const authorGreeting = props.authorName && props.authorName !== 'Familia amorosa' ? ` ${props.authorName}` : '';
  const headerImg = props.headerImageUrl || DEFAULT_HEADER_IMG;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La llama de ${props.petName} reposa en el altar · Su recuerdo permanece ✨</title>
</head>
<body style="margin:0;padding:24px 0;background-color:#EFE2F5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#EFE2F5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Se han cumplido los 7 días de luz viva. La tarjeta de ${props.petName} permanece visible y puedes volver a encenderla gratis.
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#EFE2F5;padding:12px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFDFB;border-radius:20px;overflow:hidden;border:1px solid #DEC8D7;box-shadow:0 10px 32px rgba(121,83,119,0.08);border-collapse:collapse;">
          
          ${renderOfficialHeader(headerImg)}

          <!-- CUERPO CENTRAL -->
          <tr>
            <td style="padding:36px 32px 28px;background-color:#FFFDFB;">
              
              <!-- Badge -->
              <div style="margin-bottom:12px;">
                <span style="display:inline-block;background-color:#F7EFF5;border:1px solid #B98489;color:#795377;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;border-radius:999px;">
                  ✨ Memoria viva en el santuario
                </span>
              </div>

              <!-- Título -->
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:25px;color:#795377;line-height:1.3;margin:0 0 16px 0;font-weight:700;">
                La llama de ${props.petName} reposa
              </h1>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#76546D;margin:0 0 12px 0;">
                Hola${authorGreeting},
              </p>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#645260;line-height:1.7;margin:0 0 16px 0;">
                Se han cumplido los 7 días de luz viva de la velita que encendiste por <strong style="color:#795377;">${props.petName}</strong>. Su llama ha entrado en reposo en el Cielo de Luces.
              </p>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#645260;line-height:1.7;margin:0 0 24px 0;">
                Queremos transmitirte tranquilidad: <strong>su homenaje no desaparece</strong>. Su tarjeta, fotografía y dedicatoria continúan presentes en el santuario para recibir el cariño de quienes visitan el altar. Cuando sientas el deseo de renovar su luz, puedes reavivarla en un solo clic:
              </p>

              <!-- Botón Principal Malva -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;border-collapse:collapse;">
                <tr>
                  <td align="center" style="border-radius:9999px;background-color:#A87991;">
                    <a href="${props.reigniteUrl}" target="_blank" style="display:inline-block;background-color:#A87991;color:#FFFFFF;padding:16px 38px;border-radius:9999px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(168,121,145,0.30);">
                      Volver a encender su llama (Gratis) →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Recuadro Rosa Nube: Conexión Respetuosa con el Mural Global -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F7EFF5;border:1.5px solid #DEC8D7;border-radius:18px;margin:0 0 16px 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:22px;text-align:center;">
                    <p style="font-family:Georgia,'Times New Roman',serif;margin:0 0 8px;font-size:15px;font-weight:700;color:#795377;">
                      ⭐ ¿Deseas que su llama nunca se apague?
                    </p>
                    <p style="font-family:Arial,Helvetica,sans-serif;margin:0 0 14px;font-size:13px;line-height:1.6;color:#645260;">
                      En el Mural Global de Ángeles, los memoriales disfrutan de una <strong>Llama Eterna perpetua</strong> que resplandece de forma continua en la web y en nuestras emisiones en directo.
                    </p>
                    <a href="${props.muralUrl}" target="_blank" style="font-family:Arial,Helvetica,sans-serif;display:inline-block;font-size:12.5px;font-weight:700;color:#795377;text-decoration:underline;">
                      Conocer el Mural Global y sus espacios perpetuos →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          ${renderOfficialFooter(props.unsubscribeUrl)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 4. Plantilla de Recuperación Segura de Acceso Multidispositivo
 */
export function generateRecoveryEmailHtml(props: RecoveryEmailProps): string {
  const authorGreeting = props.authorName && props.authorName !== 'Familia amorosa' ? ` ${props.authorName}` : '';
  const hoursValidity = props.expiresHours || 2;
  const headerImg = props.headerImageUrl || DEFAULT_HEADER_IMG;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso seguro a la vela de ${props.petName} · Ángeles en el Cielo 🔑</title>
</head>
<body style="margin:0;padding:24px 0;background-color:#EFE2F5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#EFE2F5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Enlace de acceso temporal de un solo uso para gestionar la vela de ${props.petName} desde tu nuevo dispositivo.
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#EFE2F5;padding:12px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFDFB;border-radius:20px;overflow:hidden;border:1px solid #DEC8D7;box-shadow:0 10px 32px rgba(121,83,119,0.08);border-collapse:collapse;">
          
          ${renderOfficialHeader(headerImg)}

          <!-- CUERPO CENTRAL -->
          <tr>
            <td style="padding:36px 32px 28px;background-color:#FFFDFB;">
              
              <!-- Badge -->
              <div style="margin-bottom:12px;">
                <span style="display:inline-block;background-color:#F7EFF5;border:1px solid #B98489;color:#795377;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;border-radius:999px;">
                  🔑 Seguridad y Titularidad
                </span>
              </div>

              <!-- Título -->
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:25px;color:#795377;line-height:1.3;margin:0 0 16px 0;font-weight:700;">
                Acceso a la vela de ${props.petName}
              </h1>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#76546D;margin:0 0 12px 0;">
                Hola${authorGreeting},
              </p>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#645260;line-height:1.7;margin:0 0 16px 0;">
                Hemos recibido una solicitud para acceder a la gestión y reavivado de la vela de <strong style="color:#795377;">${props.petName}</strong> desde un nuevo dispositivo o navegador el <strong>${props.requestDateStr}</strong>.
              </p>

              <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#645260;line-height:1.7;margin:0 0 24px 0;">
                Por seguridad y respeto a cada familia, el acceso nunca se entrega de forma pública en la web. Para vincular este dispositivo de forma autorizada, pulsa en el siguiente enlace seguro (válido durante las próximas <strong>${hoursValidity} horas</strong>):
              </p>

              <!-- Botón Principal Malva -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;border-collapse:collapse;">
                <tr>
                  <td align="center" style="border-radius:9999px;background-color:#A87991;">
                    <a href="${props.recoveryUrl}" target="_blank" style="display:inline-block;background-color:#A87991;color:#FFFFFF;padding:16px 38px;border-radius:9999px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(168,121,145,0.30);">
                      Autorizar y vincular este dispositivo →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Recuadro Rosa Nube: Cláusula de Seguridad -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F7EFF5;border:1.5px solid #DEC8D7;border-radius:18px;margin:0 0 16px 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="font-family:Arial,Helvetica,sans-serif;margin:0;font-size:12.5px;line-height:1.6;color:#645260;">
                      🛡️ <strong style="color:#795377;">¿No has solicitado tú este acceso?</strong> Puedes ignorar este correo con absoluta tranquilidad. La vela permanece protegida y nadie puede gestionarla sin acceso a tu bandeja personal de correo.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          ${renderOfficialFooter(props.unsubscribeUrl)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
