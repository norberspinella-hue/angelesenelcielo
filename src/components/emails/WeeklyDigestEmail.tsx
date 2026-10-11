export interface DigestPet {
  name: string;
  breed?: string;
  photoUrl: string;
}

export interface WeeklyDigestEmailProps {
  ownerPetNames: string;
  recentPets: DigestPet[];
  muralUrl: string;
  unsubscribeUrl: string;
}

export function renderWeeklyDigestEmail({
  ownerPetNames,
  recentPets,
  muralUrl,
  unsubscribeUrl,
}: WeeklyDigestEmailProps): string {
  const petsHtml = recentPets.slice(0, 4).map(pet => `
    <td align="center" width="25%" valign="top" style="padding:6px;">
      <div style="width:58px;height:58px;border-radius:50%;overflow:hidden;border:2px solid #C9A961;background-color:#f5e8ff;margin-bottom:6px;">
        <img 
          src="${pet.photoUrl || 'https://todaslasmascotasvanalcielo.com/images/placeholders/first.webp'}" 
          alt="${pet.name}" 
          width="58" 
          height="58" 
          style="display:block;width:58px;height:58px;object-fit:cover;border-radius:50%;"
        />
      </div>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:700;color:#25335F;margin:0 0 2px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${pet.name}
      </p>
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#7B5EA9;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${pet.breed || 'Perrito'}
      </span>
    </td>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevas estrellas brillan junto a ${ownerPetNames}</title>
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
          Nuevas estrellas brillan<br />junto a ${ownerPetNames} ✨
        </h1>

        <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#706A95;line-height:1.7;margin:0 0 12px 0;">
          Cada semana el cielo de las mascotas se vuelve un poco más luminoso. Nuevas familias han encendido la memoria de sus compañeros de 4 patas, que ya forman parte del cielo junto a <strong style="color:#25335F;">${ownerPetNames}</strong>.
        </p>

        <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#7B5EA9;line-height:1.7;font-style:italic;margin:0 0 26px 0;">
          Damos una cálida bienvenida a las almas que cruzaron el puente esta semana:
        </p>

        <!-- Galería de perritos de la semana -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF8F7;border:1px solid #F3DCE7;border-radius:18px;margin:0 0 26px 0;border-collapse:collapse;">
          <tr>
            <td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  ${petsHtml}
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
                Un millón de estrellas, un solo cielo.
              </p>
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9B8FB0;line-height:1.6;margin:0;">
                Cada vez que alguien visita el mural, su recuerdo sigue brillando para siempre. ✨
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
                Saludar a los nuevos ángeles en el mural ✦
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
            No deseo recibir más resúmenes semanales
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
