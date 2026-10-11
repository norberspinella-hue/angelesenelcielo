export interface NeighborAngelEmailProps {
  ownerPetName: string;
  neighborPetName: string;
  neighborBreed: string;
  neighborDedication?: string;
  neighborPhotoUrl: string;
  isFounder?: boolean;
  muralUrl: string;
  unsubscribeUrl: string;
}

export function renderNeighborAngelEmail({
  ownerPetName,
  neighborPetName,
  neighborBreed,
  neighborDedication,
  neighborPhotoUrl,
  isFounder = true,
  muralUrl,
  unsubscribeUrl,
}: NeighborAngelEmailProps): string {
  const photo = neighborPhotoUrl || 'https://todaslasmascotasvanalcielo.com/images/placeholders/first.webp';
  const dedication = neighborDedication
    ? (neighborDedication.length > 140 ? `${neighborDedication.slice(0, 140)}...` : neighborDedication)
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Un nuevo amigo acompaña a ${ownerPetName} en el cielo</title>
</head>
<body style="margin:0;padding:24px 0;background-color:#e8e0f0;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background-color:#FFF8F7;border-radius:16px;overflow:hidden;border-collapse:collapse;">
    <!-- 1. Header con imagen oficial -->
    <tr>
      <td bgcolor="#1E2A78" style="padding:0;line-height:0;text-align:center;">
        <img 
          src="https://todaslasmascotasvanalcielo.com/images/email/header-email.jpg" 
          alt="Todas las mascotas van al cielo - Ángeles en el Cielo"
          width="600" 
          height="200"
          style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;"
        />
      </td>
    </tr>

    <!-- 2. Cuerpo del correo -->
    <tr>
      <td style="padding:36px 30px;background-color:#FFFFFF;">
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#706A95;margin:0 0 8px 0;">
          Hola,
        </p>

        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:25px;color:#25335F;line-height:1.3;margin:0 0 16px 0;">
          Un nuevo amigo acompaña<br />a ${ownerPetName} en el cielo ✨
        </h1>

        <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#706A95;line-height:1.7;margin:0 0 12px 0;">
          Queríamos escribirte para compartir contigo algo muy especial: una familia acaba de encender la estrella eterna de su angelito <strong style="color:#25335F;">${neighborPetName}</strong> muy cerquita de tu querido <strong style="color:#25335F;">${ownerPetName}</strong>.
        </p>

        <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#7B5EA9;line-height:1.7;font-style:italic;margin:0 0 28px 0;">
          Nos reconforta pensar que, desde hoy, corren y se hacen compañía en ese rincón dorado del cielo.
        </p>

        <!-- Tarjeta destacada del nuevo vecino -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF8F7;border:1px solid #F3DCE7;border-radius:18px;margin:0 0 26px 0;border-collapse:collapse;">
          <tr>
            <td style="padding:22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td width="70" valign="top" style="padding-right:16px;">
                    <div style="width:68px;height:68px;border-radius:50%;overflow:hidden;border:2px solid #C9A961;background-color:#f5e8ff;">
                      <img 
                        src="${photo}" 
                        alt="${neighborPetName}" 
                        width="68" 
                        height="68"
                        style="display:block;width:68px;height:68px;object-fit:cover;border-radius:50%;"
                      />
                    </div>
                  </td>
                  <td valign="middle">
                    ${isFounder ? `
                    <span style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#7B5EA9;text-transform:uppercase;letter-spacing:0.5px;background-color:#F7E8FF;padding:3px 8px;border-radius:999px;margin-bottom:4px;">
                      ⭐ Ángel Fundador
                    </span>
                    ` : ''}
                    <h3 style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#25335F;font-weight:700;margin:0 0 4px 0;">
                      ${neighborPetName} ${neighborBreed ? `(${neighborBreed})` : ''}
                    </h3>
                    ${dedication ? `
                    <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#7B5EA9;font-style:italic;line-height:1.6;margin:0;">
                      &ldquo;${dedication}&rdquo;
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Bloque emocional lavender -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7E8FF;border-radius:18px;margin:0 0 28px 0;border-collapse:collapse;">
          <tr>
            <td style="padding:22px;text-align:center;">
              <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#7B5EA9;font-style:italic;font-weight:700;margin:0 0 6px 0;">
                En el cielo de las mascotas nunca se está solo.
              </p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9B8FB0;line-height:1.6;margin:0;">
                Cada nueva estrella que se enciende abraza el recuerdo de todas las demás. ✨
              </p>
            </td>
          </tr>
        </table>

        <!-- Botón CTA rosa corporativo -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;border-collapse:collapse;">
          <tr>
            <td align="center">
              <a 
                href="${muralUrl}"
                style="display:inline-block;background-color:#F65F8F;color:#FFFFFF;padding:16px 36px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;"
              >
                Ver a ${ownerPetName} y a ${neighborPetName} juntos ✦
              </a>
            </td>
          </tr>
        </table>

        <!-- Bloque ayuda/contacto -->
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#706A95;text-align:center;line-height:1.6;margin:24px 0 0 0;">
          Si tienes cualquier duda o quieres escribirnos,<br />
          responde a este email o contáctanos en 
          <a href="mailto:hello@todaslasmascotasvanalcielo.com" style="color:#7B5EA9;text-decoration:none;">
            hello@todaslasmascotasvanalcielo.com
          </a>
        </p>
      </td>
    </tr>

    <!-- 3. Footer oficial -->
    <tr>
      <td bgcolor="#1E2A78" style="padding:28px 36px;text-align:center;">
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#C9A961;font-weight:700;margin:0 0 6px 0;">
          Todas las mascotas van al cielo
        </p>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.50);line-height:1.6;margin:0 0 12px 0;">
          Enviado con amor a las familias que forman parte del Mural de Ángeles en el Cielo.
        </p>
        <p style="margin:0;font-size:11px;font-family:Arial,Helvetica,sans-serif;">
          <a href="https://todaslasmascotasvanalcielo.com/mural-global" style="color:rgba(201,169,97,0.85);text-decoration:none;margin:0 8px;">
            Mural Global
          </a>
          <span style="color:rgba(255,255,255,0.20);">·</span>
          <a href="https://todaslasmascotasvanalcielo.com/privacidad" style="color:rgba(201,169,97,0.85);text-decoration:none;margin:0 8px;">
            Privacidad
          </a>
          <span style="color:rgba(255,255,255,0.20);">·</span>
          <a href="${unsubscribeUrl}" style="color:rgba(255,255,255,0.60);text-decoration:underline;margin:0 8px;">
            No deseo recibir más avisos de nuevos vecinos
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
