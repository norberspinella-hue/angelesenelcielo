export interface SponsorshipEmailParams {
  sponsorName: string;
  sponsorEmail: string;
  petName: string;
  shelterName: string;
  sponsorPetName?: string;
  dedication?: string;
  muralUrl: string;
  diplomaUrl: string;
  dateStr?: string;
}

/**
 * Genera el HTML del email conmemorativo oficial de apadrinamiento solidario
 * («Corazones de Ángel»), adaptando fielmente la identidad visual y estructura
 * del email transaccional principal del santuario.
 */
export function generateSponsorshipEmailHtml({
  sponsorName,
  petName,
  shelterName,
  sponsorPetName,
  dedication,
  muralUrl,
  diplomaUrl,
  dateStr,
}: SponsorshipEmailParams): string {
  const cleanDate = dateStr || new Date().toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reconocimiento Oficial · Corazones de Ángel</title>
</head>
<body style="margin:0;padding:0;background:#e8e0f0;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Preheader oculto para clientes de correo -->
<div style="display:none;font-size:1px;color:#e8e0f0;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  Has encendido las 9 estrellas perpetuas de ${petName}. 5,00 € van destinados a ${shelterName}. Descarga tu Diploma Oficial Corazón de Ángel.
</div>

<!-- Contenedor Exterior -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e0f0;padding:28px 12px;">
  <tr>
    <td align="center">

      <!-- Tabla Principal (600px Max) -->
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFF8F7;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(30,10,60,0.12);border:1px solid #E5D5EE;">

        <!-- 1. HEADER CON BANNER OFICIAL -->
        <tr>
          <td bgcolor="#1E2A78" style="padding:0;text-align:center;">
            <img src="https://todaslasmascotasvanalcielo.com/images/email/header-email.jpg" 
                 alt="Todas las mascotas van al cielo · Corazones de Ángel"
                 width="600" height="200"
                 style="display:block;max-width:100%;height:auto;border:0;">
          </td>
        </tr>

        <!-- 2. CUERPO PRINCIPAL -->
        <tr>
          <td style="padding:40px 36px;background:#FFFFFF;">

            <!-- Distintivo inicial suave -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td>
                  <span style="display:inline-block;padding:5px 14px;border-radius:999px;background:#FFF0F5;border:1px solid #F472B6;color:#BE185D;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">
                    ✨ Iniciativa Solidaria · Corazones de Ángel
                  </span>
                </td>
              </tr>
            </table>

            <!-- Saludo personalizado -->
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#706A95;margin:0 0 8px 0;">
              Hola, <strong style="color:#25335F;">${sponsorName || 'Padrino de Corazón'}</strong>:
            </p>

            <!-- Título Principal Emocional -->
            <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#25335F;line-height:1.3;margin:0 0 16px 0;font-weight:700;">
              Gracias por ser el ángel<br>de la guarda de ${petName} 🐾
            </h1>

            <!-- Párrafo central -->
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#706A95;line-height:1.7;margin:0 0 14px 0;">
              Hay personas que no miran hacia otro lado, que ven una historia y deciden hacer algo. Gracias por haber encendido la <strong style="color:#25335F;">constelación de 9 estrellas perpetuas</strong> de <strong style="color:#25335F;">${petName}</strong>, custodiada con amor por <strong style="color:#25335F;">${shelterName}</strong>.
            </p>

            ${sponsorPetName ? `
            <!-- Cita en memoria de la mascota del donante -->
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#7B5EA9;line-height:1.7;font-style:italic;margin:0 0 26px 0;padding-left:14px;border-left:3px solid #F472B6;">
              Al apadrinar en memoria de tu amado <strong>${sponsorPetName}</strong>, su amor se ha convertido en un puente eterno: tu ángel en el cielo ahora arropa y cuida a quien más lo necesitaba en la tierra.
            </p>
            ` : `
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#7B5EA9;line-height:1.7;font-style:italic;margin:0 0 26px 0;padding-left:14px;border-left:3px solid #F472B6;">
              Gracias a ti, su historia jamás caerá en el olvido y su luz seguirá protegiendo a los compañeros que aún buscan hogar.
            </p>
            `}

            <!-- 3. LA CINTA NOBLE DEL PADRINO (IDÉNTICA AL MURAL Y TARJETA 2) -->
            <table width="100%" cellpadding="0" cellspacing="0" 
                   style="background:linear-gradient(180deg, #FFE6EB 0%, #FAC8D7 100%);border:1px solid #FFFFFF;border-radius:18px;margin:0 0 28px 0;box-shadow:0 8px 24px rgba(30,10,50,0.06);">
              <tr>
                <td style="padding:22px 24px;text-align:center;">
                  <span style="font-size:26px;display:block;margin-bottom:6px;">💖</span>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#4A3F6B;font-weight:700;margin:0 0 6px 0;line-height:1.4;">
                    «Apadrinado con amor por ${sponsorName}${sponsorPetName ? ` en memoria de su ángel ${sponsorPetName}` : ''} 🐾»
                  </p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7B6F9A;margin:0;">
                    ${shelterName} · <strong>Constelación de 9 estrellas perpetuas</strong>
                  </p>
                </td>
              </tr>
            </table>

            <!-- 4. BLOQUE DESTACADO DEL DIPLOMA OFICIAL A4 -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#FFFDF7;border:1.5px solid #FCD34D;border-radius:18px;margin:0 0 28px 0;box-shadow:0 6px 20px rgba(245,158,11,0.10);">
              <tr>
                <td style="padding:26px 24px;text-align:center;">
                  <span style="font-size:32px;display:block;margin-bottom:8px;">📜</span>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#92400E;font-weight:700;margin:0 0 8px 0;">
                    Tu Reconocimiento Oficial «Corazón de Ángel»
                  </p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#78350F;line-height:1.6;margin:0 0 18px 0;">
                    Ya tienes asignado tu diploma de honor con el Sello de las 9 Estrellas y la dedicatoria <em>«Tienes corazón de perrito»</em>. En formato horizontal A4 a 300 DPI, listo para impresión y enmarcado.
                  </p>
                  <a href="${diplomaUrl}" 
                     target="_blank"
                     style="display:inline-block;background:linear-gradient(135deg, #F472B6 0%, #EC4899 100%);color:#FFFFFF;padding:13px 30px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(236,72,153,0.38);letter-spacing:0.3px;">
                    Ver y Descargar Diploma Oficial (A4) 📄
                  </a>
                </td>
              </tr>
            </table>

            <!-- 5. RESUMEN DE LA APORTACIÓN SOLIDARIA (SPLIT 50%) -->
            <table width="100%" cellpadding="0" cellspacing="0" 
                   style="background:#FFF8F7;border:1px solid #F3DCE7;border-radius:18px;margin:0 0 28px 0;">
              <tr>
                <td style="padding:24px;">
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#25335F;font-weight:700;margin:0 0 16px 0;">
                    Resumen de tu Aportación Solidaria
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                        Angelito apadrinado
                      </td>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                        ${petName}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                        Refugio colaborador
                      </td>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                        ${shelterName}
                      </td>
                    </tr>
                    ${sponsorPetName ? `
                    <tr>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                        En memoria de tu ángel
                      </td>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                        ${sponsorPetName} 🕊️
                      </td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                        Constelación en el mural
                      </td>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                        9 Estrellas Perpetuas (3×3) ⭐
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#047857;font-weight:700;border-bottom:1px solid #F3DCE7;">
                        Donación directa a la protectora (50%)
                      </td>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#047857;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                        5,00 € 💖
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                        Distintivo Corazón de Ángel en el Mural
                      </td>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#B45309;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                        Activo y Visible ✓
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                        Fecha de apadrinamiento
                      </td>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                        ${cleanDate}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;">
                        Aportación única
                      </td>
                      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#25335F;font-weight:700;text-align:right;">
                        9,99 €
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- 6. DEDICATORIA SI EXISTE -->
            ${dedication ? `
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#F7E8FF;border-radius:18px;margin:0 0 28px 0;">
              <tr>
                <td style="padding:22px 24px;text-align:center;">
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#7B5EA9;font-style:italic;font-weight:700;margin:0 0 6px 0;">
                    «${dedication}»
                  </p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9B8FB0;margin:0;">
                    — Palabras de amor grabadas para siempre junto a su estrella
                  </p>
                </td>
              </tr>
            </table>
            ` : ''}

            <!-- 7. CTA PRINCIPAL: VER SUS ESTRELLAS EN EL MURAL -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
              <tr>
                <td align="center">
                  <a href="${muralUrl}"
                     target="_blank"
                     style="display:inline-block;background:#F65F8F;color:#FFFFFF;padding:16px 42px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.5px;box-shadow:0 6px 18px rgba(246,95,143,0.40);">
                    Ver sus 9 estrellas en el Mural ✦
                  </a>
                </td>
              </tr>
            </table>

            <!-- Bloque de Ayuda -->
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#706A95;text-align:center;line-height:1.6;margin:24px 0 0 0;">
              Si necesitas modificar la dedicatoria o consultar cualquier duda,<br>
              responde directamente a este email o contáctanos en 
              <a href="mailto:hello@todaslasmascotasvanalcielo.com" 
                 style="color:#7B5EA9;text-decoration:none;font-weight:700;">
                hello@todaslasmascotasvanalcielo.com
              </a>
            </p>

          </td>
        </tr>

        <!-- 8. FOOTER CORPORATIVO OFICIAL -->
        <tr>
          <td bgcolor="#1E2A78" style="padding:28px 36px;text-align:center;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#C9A961;font-weight:700;margin:0 0 6px 0;">
              Todas las mascotas van al cielo
            </p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.50);line-height:1.6;margin:0 0 12px 0;">
              Iniciativa Solidaria «Corazones de Ángel» · El 50% de cada apadrinamiento se dona a protectoras colaboradoras en España.
            </p>
            <p style="margin:0;font-size:11px;">
              <a href="https://todaslasmascotasvanalcielo.com/aviso-legal" 
                 style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Aviso legal</a>
              <span style="color:rgba(255,255,255,0.20);">·</span>
              <a href="https://todaslasmascotasvanalcielo.com/privacidad" 
                 style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Privacidad</a>
              <span style="color:rgba(255,255,255,0.20);">·</span>
              <a href="mailto:hello@todaslasmascotasvanalcielo.com" 
                 style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Contacto</a>
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}
