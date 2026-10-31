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
    <div
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] sm:w-[min(680px,calc(100vw-32px))] rounded-[20px] p-4 sm:p-6 z-[9999] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 box-border"
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(180,150,220,0.30)',
        boxShadow: '0 8px 40px rgba(100,70,150,0.18), 0 2px 12px rgba(100,70,150,0.10)',
        fontFamily: 'sans-serif',
      }}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Icono */}
        <div style={{ fontSize: 28, flexShrink: 0 }}>🍪</div>
        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p style={{
            fontSize: 13,
            color: '#4A3F6B',
            margin: '0 0 2px',
            fontWeight: 600,
            lineHeight: 1.3,
          }}>
            Usamos cookies para mejorar tu experiencia
          </p>
          <p style={{
            fontSize: 12,
            color: '#9B8FB0',
            margin: 0,
            lineHeight: 1.4,
          }}>
            Solo cookies necesarias para el sitio.{' '}
            <Link href="/cookies" style={{ color: '#EC6F9B', textDecoration: 'none' }}>
              Más info
            </Link>
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 justify-end">
        <button
          onClick={handleAccept}
          className="flex-1 sm:flex-initial"
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(90deg, #ff82ad, #ec5f96)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(236,95,150,0.35)',
          }}
        >
          Aceptar ✦
        </button>
        <button
          onClick={handleReject}
          className="flex-1 sm:flex-initial"
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: '1.5px solid rgba(180,150,220,0.40)',
            background: 'transparent',
            color: '#9B8FB0',
            fontSize: 12,
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
