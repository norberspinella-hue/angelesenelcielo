import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const memorialId = searchParams.get('id')
  const side = searchParams.get('side') || 'front'

  let petName = 'Mi Angelito'
  let photoUrl = ''
  let dedication = 'Siempre en nuestros corazones'

  if (memorialId) {
    const supabase = createAdminClient()
    const { data } = await (supabase
      .from('memorials') as any)
      .select('pet_name, photo_url, dedication')
      .eq('id', memorialId)
      .single()
    
    if (data) {
      petName = data.pet_name || petName
      photoUrl = data.photo_url || ''
      dedication = data.dedication || dedication
    }
  }

  // TARJETA TRASERA — REVERSO (HISTORIA)
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

  // TARJETA FRONTAL — ANVERSO (RECUERDO)
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
        <div
          style={{
            position: 'absolute',
            top: '105px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            fontFamily: "'Pinyon Script', cursive",
            fontSize: '52px',
            color: '#C29028',
          }}
        >
          {petName}
        </div>

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
