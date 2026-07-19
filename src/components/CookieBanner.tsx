'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(680px, calc(100vw - 32px))',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(16px)',
      borderRadius: 20,
      border: '1.5px solid rgba(180,150,220,0.30)',
      boxShadow: '0 8px 40px rgba(100,70,150,0.18), 0 2px 12px rgba(100,70,150,0.10)',
      padding: '20px 24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      fontFamily: 'sans-serif',
    }}>
      
      {/* Icono */}
      <div style={{ fontSize: 32, flexShrink: 0 }}>🍪</div>

      {/* Texto */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 14,
          color: '#4A3F6B',
          margin: '0 0 4px',
          fontWeight: 600,
          lineHeight: 1.4,
        }}>
          Usamos cookies para mejorar tu experiencia
        </p>
        <p style={{
          fontSize: 13,
          color: '#9B8FB0',
          margin: 0,
          lineHeight: 1.5,
        }}>
          Solo usamos cookies necesarias para el funcionamiento 
          del sitio y el proceso de pago. No rastreamos tu actividad.{' '}
          <Link href="/cookies" style={{ color: '#EC6F9B', textDecoration: 'none' }}>
            Más información
          </Link>
        </p>
      </div>

      {/* Botones */}
      <div style={{ 
        display: 'flex', 
        gap: 10, 
        flexShrink: 0,
        flexDirection: 'column',
      }}>
        <button
          onClick={handleAccept}
          style={{
            padding: '10px 20px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(90deg, #ff82ad, #ec5f96)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(236,95,150,0.35)',
          }}
        >
          Aceptar todas ✦
        </button>
        <button
          onClick={handleReject}
          style={{
            padding: '10px 20px',
            borderRadius: 999,
            border: '1.5px solid rgba(180,150,220,0.40)',
            background: 'transparent',
            color: '#9B8FB0',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Solo necesarias
        </button>
      </div>
    </div>
  )
}
