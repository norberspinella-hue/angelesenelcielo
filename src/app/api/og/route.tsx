import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const memorialId = searchParams.get('id')

  let petName = 'Mi Angelito'
  let photoUrl = ''

  if (memorialId) {
    const supabase = createAdminClient()
    const { data } = await (supabase
      .from('memorials') as any)
      .select('pet_name, photo_url')
      .eq('id', memorialId)
      .single()
    
    if (data) {
      petName = data.pet_name
      photoUrl = data.photo_url
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #C8A8E8 0%, #D8B8E8 30%, #E8C8D8 55%, #F0D0C0 80%, #C8A8D8 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Foto circular */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}>
          {photoUrl && (
            <img
              src={photoUrl}
              width={200}
              height={200}
              style={{
                borderRadius: '50%',
                border: '4px solid rgba(201,169,97,0.80)',
                objectFit: 'cover',
              }}
            />
          )}
          <div style={{
            fontSize: '80px',
            color: '#C9A961',
            fontStyle: 'italic',
            fontWeight: 700,
          }}>
            {petName}
          </div>
          <div style={{
            fontSize: '28px',
            color: '#4A3F6B',
            fontStyle: 'italic',
          }}>
            "Siempre serás mi lugar favorito en el mundo."
          </div>
          <div style={{
            fontSize: '22px',
            color: 'rgba(74,63,107,0.70)',
          }}>
            🐾 Mural de Ángeles en el Cielo
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
