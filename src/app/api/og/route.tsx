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
          width: '1080px',
          height: '1080px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #C8A8E8 0%, #D8B8E8 30%, #E8C8D8 55%, #F0D0C0 80%, #C8A8D8 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          padding: '60px',
          textAlign: 'center',
        }}
      >
        {/* Cabecera superior */}
        <div
          style={{
            fontSize: '30px',
            fontWeight: 700,
            letterSpacing: '6px',
            color: '#4A3F6B',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          MI ANGELITO
        </div>

        {/* Nombre de la mascota */}
        <div
          style={{
            fontSize: '84px',
            color: '#C29028',
            fontWeight: 700,
            marginBottom: '28px',
            textShadow: '0 2px 8px rgba(110, 70, 15, 0.25)',
          }}
        >
          {petName}
        </div>

        {/* Foto circular con halo dorado */}
        {photoUrl ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: '40px',
            }}
          >
            <img
              src={photoUrl}
              width={340}
              height={340}
              style={{
                borderRadius: '50%',
                border: '6px solid rgba(201, 169, 97, 0.90)',
                objectFit: 'cover',
                boxShadow: '0 12px 40px rgba(100, 70, 150, 0.25)',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '340px',
              height: '340px',
              borderRadius: '50%',
              background: '#f5e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px',
              border: '6px solid rgba(201, 169, 97, 0.90)',
              marginBottom: '40px',
            }}
          >
            🐾
          </div>
        )}

        {/* Frase fija */}
        <div
          style={{
            fontSize: '32px',
            color: '#4A3F6B',
            fontWeight: 700,
            marginBottom: '24px',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          "Siempre serás mi lugar favorito en el mundo."
        </div>

        {/* Logo Ángeles en el Cielo */}
        <div
          style={{
            fontSize: '26px',
            color: 'rgba(74, 63, 107, 0.90)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🐾 Mural de Ángeles en el Cielo
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  )
}
