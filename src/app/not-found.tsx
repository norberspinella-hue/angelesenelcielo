'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/images/placeholders/bg-page-heaven-desktop.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      fontFamily: 'Georgia, serif',
    }}>
      {/* Overlay semi-transparente */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(255,240,248,0.75)',
        backdropFilter: 'blur(2px)',
        zIndex: 0,
      }} />
      
      {/* Contenido principal */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <img src="/images/icons/Logoheart.svg" alt="Logoheart" style={{ width: 144, height: 144, marginBottom: 24 }} />

        <h1 style={{
          fontSize: 42,
          fontWeight: 700,
          color: '#1E2A78',
          marginBottom: 16,
          lineHeight: 1.2,
        }}>
          Esta página no existe
        </h1>

        <p style={{
          fontSize: 18,
          color: '#706A95',
          marginBottom: 16,
          maxWidth: 480,
          lineHeight: 1.6,
        }}>
          Parece que este pedacito de cielo todavía no existe.
          Pero hay millones de ángeles esperándote en el mural.
        </p>

        <p style={{
          fontSize: 14,
          color: '#9B8FB0',
          marginBottom: 40,
        }}>
          Error 404
        </p>

        <div style={{ 
          display: 'flex', 
          gap: 16, 
          flexWrap: 'wrap', 
          justifyContent: 'center' 
        }}>
          <Link href="/" style={{
            padding: '14px 28px',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #ff82ad, #ec5f96)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(236,95,150,0.35)',
          }}>
            Volver al inicio ✦
          </Link>

          <Link href="/mural-global" style={{
            padding: '14px 28px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.80)',
            color: '#1E2A78',
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
            border: '1.5px solid rgba(180,150,220,0.40)',
          }}>
            Ver el mural
          </Link>
        </div>
      </div>
    </div>
  )
}
