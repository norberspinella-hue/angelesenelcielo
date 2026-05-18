'use client'

import { motion } from 'framer-motion'
import type { ViewportState } from '@/lib/mural/muralTypes'
import { PREMIUM_ZONE, getSlotStep } from '@/lib/mural/gridMath'

interface MuralPremiumBadgeProps {
  viewport: ViewportState
}

export default function MuralPremiumBadge({ viewport }: MuralPremiumBadgeProps) {
  const step = getSlotStep(viewport.zoomLevel)
  const cx = viewport.x + (PREMIUM_ZONE.x + PREMIUM_ZONE.w / 2) * step
  const cy = viewport.y + (PREMIUM_ZONE.y + PREMIUM_ZONE.h / 2) * step

  if (cx < -80 || cx > 1900 || cy < -60 || cy > 700) return null

  return (
    <motion.div
      className="absolute pointer-events-none z-[8] flex flex-col items-center gap-3 px-7 py-5 rounded-3xl"
      style={{
        left:                cx,
        top:                 cy,
        transform:           'translate(-50%, -50%)',
        /* Fix 3: pink/rose semi-transparent matching the uploaded image */
        background:          'linear-gradient(160deg, rgba(255,230,235,0.20) 0%, rgba(255,200,218,0.20) 60%, rgba(255,220,230,0.20) 100%)',
        backdropFilter:      'blur(14px)',
        WebkitBackdropFilter:'blur(14px)',
        border:              '1px solid rgba(255,255,255,0.75)',
        boxShadow:           'inset 0 2px 8px rgba(255,255,255,0.60), inset 0 -2px 8px rgba(220,100,140,0.15), 0 0 0 3px rgba(255,255,255,0.90), 0 0 24px rgba(255,160,190,0.75), 0 0 55px rgba(255,140,180,0.50), 0 12px 40px rgba(220,80,130,0.25)',
      }}
      animate={{
        boxShadow: [
          'inset 0 2px 8px rgba(255,255,255,0.60), 0 0 0 3px rgba(255,255,255,0.90), 0 0 24px rgba(255,160,190,0.75), 0 0 55px rgba(255,140,180,0.50)',
          'inset 0 2px 10px rgba(255,255,255,0.70), 0 0 0 3px rgba(255,255,255,0.90), 0 0 40px rgba(255,160,190,0.90), 0 0 80px rgba(255,140,180,0.65)',
          'inset 0 2px 8px rgba(255,255,255,0.60), 0 0 0 3px rgba(255,255,255,0.90), 0 0 24px rgba(255,160,190,0.75), 0 0 55px rgba(255,140,180,0.50)',
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Heart wing logo PNG */}
      <img
        src="/logos/heart-wing-logo.png"
        alt=""
        width={52}
        height={52}
        className="animate-ascend"
        style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(255,180,160,0.45))' }}
      />

      {/* Label */}
      <span
        className="text-[11px] font-semibold tracking-[0.5px]"
        style={{
          color: 'rgba(180, 60, 100, 0.85)',
          textShadow: '0 1px 4px rgba(255,255,255,0.6)',
        }}
      >
        Zona premium
      </span>
    </motion.div>
  )
}
