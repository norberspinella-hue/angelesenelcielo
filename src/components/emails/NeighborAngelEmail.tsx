import * as React from 'react';

interface NeighborAngelEmailProps {
  ownerPetName: string;
  neighborPetName: string;
  neighborBreed: string;
  neighborDedication?: string;
  neighborPhotoUrl: string;
  isFounder?: boolean;
  muralUrl: string;
  unsubscribeUrl: string;
}

export const NeighborAngelEmail = ({
  ownerPetName,
  neighborPetName,
  neighborBreed,
  neighborDedication,
  neighborPhotoUrl,
  isFounder = true,
  muralUrl,
  unsubscribeUrl,
}: NeighborAngelEmailProps) => {
  return (
    <div style={{ margin: 0, padding: '24px 0', background: '#e8e0f0', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <table 
        width="100%" 
        cellPadding={0} 
        cellSpacing={0} 
        style={{ maxWidth: '600px', margin: '0 auto', background: '#FFF8F7', borderRadius: '16px', overflow: 'hidden', borderCollapse: 'collapse' }}
      >
        {/* 1. Header con imagen oficial */}
        <tr>
          <td style={{ backgroundColor: '#1E2A78', padding: 0, lineHeight: 0 }}>
            <img 
              src="https://todaslasmascotasvanalcielo.com/images/email/header-email.jpg" 
              alt="Todas las mascotas van al cielo - Ángeles en el Cielo"
              width="600" 
              height="200"
              style={{ display: 'block', width: '100%', maxWidth: '600px', height: 'auto', border: 0 }}
            />
          </td>
        </tr>

        {/* 2. Cuerpo del correo */}
        <tr>
          <td style={{ padding: '36px 30px', background: '#FFFFFF' }}>
            <p style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', color: '#706A95', margin: '0 0 8px 0' }}>
              Hola,
            </p>

            <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '25px', color: '#25335F', lineHeight: 1.3, margin: '0 0 16px 0' }}>
              Un nuevo amigo acompaña<br />a {ownerPetName} en el cielo ✨
            </h1>

            <p style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '15px', color: '#706A95', lineHeight: 1.7, margin: '0 0 12px 0' }}>
              Queríamos escribirte para compartir contigo algo muy especial: una familia acaba de encender la estrella eterna de su angelito <strong style={{ color: '#25335F' }}>{neighborPetName}</strong> muy cerquita de tu querido <strong style={{ color: '#25335F' }}>{ownerPetName}</strong>.
            </p>

            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '15px', color: '#7B5EA9', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 28px 0' }}>
              Nos reconforta pensar que, desde hoy, corren y se hacen compañía en ese rincón dorado del cielo.
            </p>

            {/* Tarjeta destacada del nuevo vecino */}
            <table 
              width="100%" 
              cellPadding={0} 
              cellSpacing={0} 
              style={{ background: '#FFF8F7', border: '1px solid #F3DCE7', borderRadius: '18px', margin: '0 0 26px 0', borderCollapse: 'collapse' }}
            >
              <tr>
                <td style={{ padding: '22px' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
                    <tr>
                      <td width="70" valign="top" style={{ paddingRight: '16px' }}>
                        <div style={{ width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #C9A961', background: '#f5e8ff', boxShadow: '0 4px 12px rgba(100,70,150,0.15)' }}>
                          <img 
                            src={neighborPhotoUrl || 'https://todaslasmascotasvanalcielo.com/images/placeholders/first.webp'} 
                            alt={neighborPetName} 
                            width="68" 
                            height="68"
                            style={{ display: 'block', width: '68px', height: '68px', objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td valign="middle">
                        {isFounder && (
                          <span style={{ display: 'inline-block', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px', fontWeight: 700, color: '#7B5EA9', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#F7E8FF', padding: '3px 8px', borderRadius: '999px', marginBottom: '4px' }}>
                            ⭐ Ángel Fundador
                          </span>
                        )}
                        <h3 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '18px', color: '#25335F', fontWeight: 700, margin: '0 0 4px 0' }}>
                          {neighborPetName} {neighborBreed ? `(${neighborBreed})` : ''}
                        </h3>
                        {neighborDedication && (
                          <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '13px', color: '#7B5EA9', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                            &ldquo;{neighborDedication.length > 140 ? `${neighborDedication.slice(0, 140)}...` : neighborDedication}&rdquo;
                          </p>
                        )}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            {/* Bloque emocional lavender */}
            <table 
              width="100%" 
              cellPadding={0} 
              cellSpacing={0}
              style={{ background: '#F7E8FF', borderRadius: '18px', margin: '0 0 28px 0', borderCollapse: 'collapse' }}
            >
              <tr>
                <td style={{ padding: '22px', textAlign: 'center' }}>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '17px', color: '#7B5EA9', fontStyle: 'italic', fontWeight: 700, margin: '0 0 6px 0' }}>
                    En el cielo de las mascotas nunca se está solo.
                  </p>
                  <p style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px', color: '#9B8FB0', lineHeight: 1.6, margin: 0 }}>
                    Cada nueva estrella que se enciende abraza el recuerdo de todas las demás. ✨
                  </p>
                </td>
              </tr>
            </table>

            {/* Botón CTA rosa corporativo */}
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: '0 0 20px 0', borderCollapse: 'collapse' }}>
              <tr>
                <td align="center">
                  <a 
                    href={muralUrl}
                    style={{ display: 'inline-block', background: '#F65F8F', color: '#FFFFFF', padding: '16px 36px', borderRadius: '999px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '15px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.5px', boxShadow: '0 8px 20px rgba(246,95,143,0.35)' }}
                  >
                    Ver a {ownerPetName} y a {neighborPetName} juntos ✦
                  </a>
                </td>
              </tr>
            </table>

            {/* Bloque ayuda/contacto */}
            <p style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px', color: '#706A95', textAlign: 'center', lineHeight: 1.6, margin: '24px 0 0 0' }}>
              Si tienes cualquier duda o quieres escribirnos,<br />
              responde a este email o contáctanos en{' '}
              <a href="mailto:hello@todaslasmascotasvanalcielo.com" style={{ color: '#7B5EA9', textDecoration: 'none' }}>
                hello@todaslasmascotasvanalcielo.com
              </a>
            </p>
          </td>
        </tr>

        {/* 3. Footer oficial */}
        <tr>
          <td style={{ backgroundColor: '#1E2A78', padding: '28px 36px', textAlign: 'center' }}>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '15px', color: '#C9A961', fontWeight: 700, margin: '0 0 6px 0' }}>
              Todas las mascotas van al cielo
            </p>
            <p style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
              Enviado con amor a las familias que forman parte del Mural de Ángeles en el Cielo.
            </p>
            <p style={{ margin: 0, fontSize: '11px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              <a href="https://todaslasmascotasvanalcielo.com/mural-global" style={{ color: 'rgba(201,169,97,0.85)', textDecoration: 'none', margin: '0 8px' }}>
                Mural Global
              </a>
              <span style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
              <a href="https://todaslasmascotasvanalcielo.com/privacidad" style={{ color: 'rgba(201,169,97,0.85)', textDecoration: 'none', margin: '0 8px' }}>
                Privacidad
              </a>
              <span style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
              <a href={unsubscribeUrl} style={{ color: 'rgba(255,255,255,0.60)', textDecoration: 'underline', margin: '0 8px' }}>
                No deseo recibir más avisos de nuevos vecinos
              </a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  );
};
