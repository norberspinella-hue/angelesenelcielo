'use client'

import { motion } from 'framer-motion'
import { ZOOM_LABELS } from '@/lib/mural/gridMath'
import type { ZoomLevel } from '@/lib/mural/muralTypes'

interface MuralZoomControlsProps {
  zoomLevel: ZoomLevel
  onZoomIn: () => void
  onZoomOut: () => void
  onCenter: () => void
  onViewAll: () => void
}

const ZBtn = ({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) => (
  <motion.button
    onClick={onClick}
    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
    style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.80)', color: 'var(--color-text-title)', fontSize: '18px' }}
    whileHover={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 16px rgba(160,100,180,0.22)', scale: 1.06 }}
    whileTap={{ scale: 0.93 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    aria-label={label}
  >
    {children}
  </motion.button>
)

export default function MuralZoomControls({ zoomLevel, onZoomIn, onZoomOut, onCenter, onViewAll }: MuralZoomControlsProps) {
  return (
    <div
      className="absolute z-20 flex flex-col items-center gap-2 px-2 py-3 rounded-2xl"
      style={{
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1.5px solid rgba(255,255,255,0.75)',
        boxShadow: '0 8px 32px rgba(160,100,180,0.16)',
      }}
    >
      <ZBtn onClick={onZoomIn} label="Acercar">+</ZBtn>
      <span className="text-[11px] font-semibold text-center select-none" style={{ color: 'var(--color-text-title)', minWidth: '28px' }}>
        {ZOOM_LABELS[zoomLevel]}
      </span>
      <ZBtn onClick={onZoomOut} label="Alejar">−</ZBtn>
      <div style={{ width: '24px', height: '1px', background: 'rgba(201,184,255,0.35)' }} />
      <ZBtn onClick={onCenter} label="Centrar vista"><span style={{ fontSize: '14px' }}>⊙</span></ZBtn>
      <ZBtn onClick={onViewAll} label="Ver todo"><span style={{ fontSize: '12px' }}>⤢</span></ZBtn>
    </div>
  )
}
