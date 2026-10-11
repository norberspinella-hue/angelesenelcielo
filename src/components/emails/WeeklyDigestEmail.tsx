import * as React from 'react';

interface DigestPet {
  name: string;
  breed?: string;
  photoUrl: string;
}

interface WeeklyDigestEmailProps {
  ownerPetNames: string;
  recentPets: DigestPet[];
  muralUrl: string;
  unsubscribeUrl: string;
}

export const WeeklyDigestEmail = ({
  ownerPetNames,
  recentPets,
  muralUrl,
  unsubscribeUrl,
}: WeeklyDigestEmailProps) => {
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
              Nuevas estrellas brillan<br />junto a {ownerPetNames} ✨
            </h1>

            <p style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '15px', color: '#706A95', lineHeight: 1.7, margin: '0 0 12px 0' }}>
              Cada semana el cielo de las mascotas se vuelve un poco más luminoso. Nuevas familias han encendido la memoria de sus compañeros de 4 patas, que ya forman parte del cielo junto a <strong style={{ color: '#25335F' }}>{ownerPetNames}</strong>.
            </p>

            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '15px', color: '#7B5EA9', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 26px 0' }}>
              Damos una cálida bienvenida a las almas que cruzaron el puente esta semana:
            </p>

            {/* Galería de perritos de la semana */}
            <table 
              width="100%" 
              cellPadding={0} 
              cellSpacing={0} 
              style={{ background: '#FFF8F7', border: '1px solid #F3DCE7', borderRadius: '18px', margin: '0 0 26px 0', borderCollapse: 'collapse' }}
            >
              <tr>
                <td style={{ padding: '20px' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
                    <tr>
                      {recentPets.slice(0, 4).map((pet, idx) => (
                        <td key={idx} align="center" width="25%" valign="top" style={{ padding: '6px' }}>
                          <div style={{ width: '58px', height: '58px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #C9A961', background: '#f5e8ff', marginBottom: '6px' }}>
                            <img 
                              src={pet.photoUrl || 'https://todaslasmascotasvanalcielo.com/images/placeholders/first.webp'} 
                              alt={pet.name} 
                              width="58" 
                              height="58" 
                              style={{ display: 'block', width: '58px', height: '58px', objectFit: 'cover' }}
                            />
                          </div>
                          <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '13px', fontWeight: 700, color: '#25335F', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pet.name}
                          </p>
                          <span style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', color: '#7B5EA9', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pet.breed || 'Perrito'}
                          </span>
                        </td>
                      ))}
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
                    Un millón de estrellas, un solo cielo.
                  </p>
                  <p style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px', color: '#9B8FB0', lineHeight: 1.6, margin: 0 }}>
                    Cada vez que alguien visita el mural, su recuerdo sigue brillando para siempre. ✨
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
                    Saludar a los nuevos ángeles en el mural ✦
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
                No deseo recibir más resúmenes semanales
              </a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  );
};
