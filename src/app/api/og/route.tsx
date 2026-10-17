import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const memorialId = searchParams.get('id')
  const side = searchParams.get('side') || 'front'
  const format = searchParams.get('format') // 'story' (1080x1920) | 'square' (1080x1080) | 'front' | 'back'

  let petName = searchParams.get('petName') || 'Mi Angelito'
  let photoUrl = searchParams.get('photoUrl') || ''
  let dedication = searchParams.get('dedication') || 'Siempre en nuestros corazones'

  if (memorialId) {
    try {
      const supabase = createAdminClient()
      const { data } = await (supabase
        .from('memorials') as any)
        .select('pet_name, photo_url, dedication')
        .eq('id', memorialId)
        .single()
      
      if (data) {
        petName = data.pet_name || petName
        photoUrl = data.photo_url || photoUrl
        dedication = data.dedication || dedication
      }
    } catch (err) {
      console.error('Error fetching memorial for OG route:', err)
    }
  }

  // 1. FORMATO STORY 9:16 (1080 × 1920) — Para Instagram Stories, TikTok y WhatsApp Estados
  if (format === 'story') {
    const len = (petName || '').trim().length
    let fontSize = '72px'
    if (len > 16) fontSize = '42px'
    else if (len > 13) fontSize = '50px'
    else if (len > 10) fontSize = '58px' // Ej. Mary Margaret
    else if (len > 7) fontSize = '65px'

    return new ImageResponse(
      (
        <div
          style={{
            width: '1080px',
            height: '1920px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '90px 40px',
            background: 'radial-gradient(ellipse at 50% 30%, #2A194C 0%, #150D2A 55%, #0B0616 100%)',
            fontFamily: 'Georgia, serif',
            position: 'relative',
          }}
        >
          {/* Top Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 44px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '2.5px solid rgba(245, 200, 66, 0.75)',
              color: '#FDE68A',
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '3px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            }}
          >
            ✨ MI ÁNGEL YA BRILLA EN EL CIELO ✨
          </div>

          {/* Tarjeta Oficial Centrada (720 × 1000) */}
          <div
            style={{
              position: 'relative',
              width: '720px',
              height: '1000px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '48px',
              border: '5px solid rgba(255, 255, 255, 0.95)',
              overflow: 'hidden',
              backgroundColor: '#f5e8ff',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Fondo de tarjeta */}
            <img
              src="https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/assets/profilecard-front.webp"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '720px',
                height: '1000px',
                objectFit: 'cover',
              }}
            />

            {/* MI ANGELITO */}
            <div
              style={{
                position: 'absolute',
                top: '75px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                fontFamily: 'Georgia, serif',
                fontSize: '38px',
                fontWeight: 700,
                color: '#584582',
                letterSpacing: '5px',
              }}
            >
              MI ANGELITO
            </div>

            {/* Nombre Mascota */}
            <div
              style={{
                position: 'absolute',
                top: '160px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize,
                whiteSpace: 'nowrap',
                color: '#C29028',
                padding: '0 30px',
              }}
            >
              {petName}
            </div>

            {/* Halo dorado */}
            <div
              style={{
                position: 'absolute',
                top: '310px',
                left: '239px',
                width: '242px',
                height: '64px',
                borderRadius: '50%',
                border: '6px solid #F5C842',
                display: 'flex',
              }}
            />

            {/* Foto circular */}
            <div
              style={{
                position: 'absolute',
                top: '365px',
                left: '180px',
                width: '360px',
                height: '360px',
                borderRadius: '180px',
                border: '6px solid rgba(201, 169, 97, 0.85)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '180px',
                  }}
                />
              ) : (
                <div style={{ fontSize: '100px' }}>🐾</div>
              )}
            </div>

            {/* Frase */}
            <div
              style={{
                position: 'absolute',
                top: '800px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: 'Georgia, serif',
                fontSize: '28px',
                fontWeight: 700,
                color: '#584582',
                padding: '0 40px',
              }}
            >
              Siempre serás mi lugar favorito en el mundo
            </div>

            {/* Pie */}
            <div
              style={{
                position: 'absolute',
                top: '900px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                fontFamily: 'Georgia, serif',
                fontSize: '26px',
                fontWeight: 700,
                color: '#584582',
              }}
            >
              Ángeles en el Cielo
            </div>
          </div>

          {/* Bottom Branding */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '2px',
              }}
            >
              🐾 TodasLasMascotasVanAlCielo.com
            </div>
            <div
              style={{
                fontSize: '22px',
                color: '#C4B5FD',
                fontStyle: 'italic',
              }}
            >
              Mural Global de las Estrellas
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
      }
    )
  }

  // 2. FORMATO POSTAL CUADRADA 1:1 (1080 × 1080)
  if (format === 'square') {
    const len = (petName || '').trim().length
    let fontSize = '60px'
    if (len > 16) fontSize = '36px'
    else if (len > 13) fontSize = '44px'
    else if (len > 10) fontSize = '50px'

    return new ImageResponse(
      (
        <div
          style={{
            width: '1080px',
            height: '1080px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '50px',
            background: 'radial-gradient(ellipse at 50% 30%, #2A194C 0%, #150D2A 55%, #0B0616 100%)',
            fontFamily: 'Georgia, serif',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '980px',
              height: '980px',
              borderRadius: '40px',
              border: '4px solid rgba(255, 255, 255, 0.90)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '60px 40px',
              backgroundColor: '#f5e8ff',
              position: 'relative',
            }}
          >
            <img
              src="https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/assets/profilecard-front.webp"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '980px',
                height: '980px',
                objectFit: 'cover',
              }}
            />

            {/* Cabecera */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#584582',
                  letterSpacing: '5px',
                  marginBottom: '10px',
                }}
              >
                MI ANGELITO
              </div>
              <div
                style={{
                  fontSize,
                  fontStyle: 'italic',
                  color: '#C29028',
                  fontWeight: 700,
                }}
              >
                {petName}
              </div>
            </div>

            {/* Foto circular con halo */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: '240px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '5px solid #F5C842',
                  marginBottom: '-25px',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: '320px',
                  height: '320px',
                  borderRadius: '160px',
                  overflow: 'hidden',
                  border: '6px solid rgba(201, 169, 97, 0.85)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '160px',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '80px' }}>🐾</div>
                )}
              </div>
            </div>

            {/* Cierre */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: 10,
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#584582',
                  maxWidth: '720px',
                }}
              >
                Siempre serás mi lugar favorito en el mundo
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#7C3AED',
                }}
              >
                🐾 TodasLasMascotasVanAlCielo.com · Mural de las Estrellas
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    )
  }

  // 3. TARJETA TRASERA — REVERSO (HISTORIA)
  if (side === 'back') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '1080px',
            height: '1080px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #E6D0F8 0%, #F5E8FF 40%, #FFF5FB 70%, #E8D0F5 100%)',
            fontFamily: 'Georgia, serif',
            position: 'relative',
            padding: '80px',
            textAlign: 'center',
          }}
        >
          {/* Logo corazón celestial */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.70)',
              marginBottom: '32px',
              boxShadow: '0 8px 30px rgba(100, 70, 150, 0.15)',
            }}
          >
            <div style={{ fontSize: '70px' }}>💜</div>
          </div>

          {/* Título Historia de amor */}
          <div
            style={{
              fontSize: '48px',
              color: '#4A3F6B',
              fontStyle: 'italic',
              fontWeight: 700,
              marginBottom: '40px',
            }}
          >
            Historia de amor de {petName}
          </div>

          {/* Dedicatoria */}
          <div
            style={{
              fontSize: '32px',
              color: '#584582',
              lineHeight: 1.6,
              maxWidth: '850px',
              marginBottom: '60px',
              fontStyle: 'italic',
              background: 'rgba(255, 255, 255, 0.65)',
              padding: '40px 50px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(100, 70, 150, 0.08)',
            }}
          >
            "{dedication}"
          </div>

          {/* Cierre inferior */}
          <div
            style={{
              fontSize: '26px',
              color: '#4A3F6B',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            — Siempre en nuestro corazón 🐾
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    )
  }

  // 4. TARJETA FRONTAL ESTÁNDAR (360 × 500)
  return new ImageResponse(
    (
      <div
        style={{
          width: '360px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f5e8ff',
        }}
      >
        {/* 1. Fondo */}
        <img
          src="https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/assets/profilecard-front.webp"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '360px',
            height: '500px',
            objectFit: 'cover',
          }}
        />

        {/* 2. MI ANGELITO */}
        <div
          style={{
            position: 'absolute',
            top: '45px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'Georgia, serif',
            fontSize: '21px',
            fontWeight: 700,
            color: '#584582',
            letterSpacing: '3px',
          }}
        >
          MI ANGELITO
        </div>

        {/* 3. Nombre mascota */}
        {(() => {
          const len = (petName || '').trim().length
          let fontSize = '52px'
          if (len > 16) fontSize = '28px'
          else if (len > 13) fontSize = '34px'
          else if (len > 10) fontSize = '38px'
          else if (len > 7) fontSize = '45px'

          return (
            <div
              style={{
                position: 'absolute',
                top: '105px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize,
                whiteSpace: 'nowrap',
                color: '#C29028',
              }}
            >
              {petName}
            </div>
          )
        })()}

        {/* 4. Halo dorado elipse */}
        <div
          style={{
            position: 'absolute',
            top: '162px',
            left: '119px',
            width: '121px',
            height: '32px',
            borderRadius: '50%',
            border: '3px solid #F5C842',
            display: 'flex',
          }}
        />

        {/* 5. Foto circular de la mascota */}
        <div
          style={{
            position: 'absolute',
            top: '190px',
            left: '90px',
            width: '180px',
            height: '180px',
            borderRadius: '90px',
            border: '3px solid rgba(201, 169, 97, 0.70)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '90px',
              }}
            />
          ) : (
            <div style={{ fontSize: '50px' }}>🐾</div>
          )}
        </div>

        {/* 6. Frase */}
        <div
          style={{
            position: 'absolute',
            top: '400px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            fontSize: '15px',
            fontWeight: 700,
            color: '#584582',
            padding: '0 20px',
          }}
        >
          Siempre serás mi lugar favorito en el mundo
        </div>

        {/* 7. Pie */}
        <div
          style={{
            position: 'absolute',
            top: '455px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            fontWeight: 700,
            color: '#584582',
          }}
        >
          Ángeles en el Cielo
        </div>
      </div>
    ),
    {
      width: 360,
      height: 500,
    }
  )
}
