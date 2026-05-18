'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Pet } from '@/lib/mural/muralTypes'

interface MuralFloatingPetCardProps {
  pet: Pet | null
  onClose: () => void
  onShare: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (h < 1)  return 'Hace unos minutos'
  if (h < 24) return `Hace ${h} hora${h > 1 ? 's' : ''}`
  if (d < 7)  return `Hace ${d} día${d > 1 ? 's' : ''}`
  return `Hace ${Math.floor(d / 7)} semana${Math.floor(d / 7) > 1 ? 's' : ''}`
}

// ─── SVG decorations ──────────────────────────────────────────────────────────
const StarSVG = ({ size = 18, color = '#E8C8FF' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
)

const HeartSVG = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill="white"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="0.5"
    />
  </svg>
)

const CalendarSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B8BC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const PawSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#7B8BC9">
    <ellipse cx="6" cy="7" rx="2.5" ry="3"/>
    <ellipse cx="12" cy="5" rx="2.5" ry="3"/>
    <ellipse cx="18" cy="7" rx="2.5" ry="3"/>
    <ellipse cx="3.5" cy="13" rx="2" ry="2.5"/>
    <path d="M12 22c-4 0-7-2.5-7-6 0-2 1.5-3.5 3-4.5 1-.7 2.5-1.5 4-1.5s3 .8 4 1.5c1.5 1 3 2.5 3 4.5 0 3.5-3 6-7 6z"/>
  </svg>
)

// ─── Main component ───────────────────────────────────────────────────────────
export default function MuralFloatingPetCard({ pet, onClose, onShare }: MuralFloatingPetCardProps) {
  return (
    <AnimatePresence>
      {pet && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[500] flex items-center justify-center p-5"
            style={{ background: 'rgba(37,30,70,0.55)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Card — stops click propagation */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: 'min(210px, 46vw)',
                padding: '28px 17px 18px',
                borderRadius: '22px',
                background: `
                  radial-gradient(circle at 50% 18%, rgba(211,187,255,0.28), transparent 34%),
                  radial-gradient(circle at 75% 42%, rgba(255,174,204,0.20), transparent 28%),
                  linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,248,252,0.95), rgba(255,250,245,0.96))
                `,
                border: '1px solid rgba(255,255,255,0.85)',
                boxShadow: `
                  0 14px 40px rgba(172,135,240,0.20),
                  0 7px 19px rgba(255,132,178,0.16),
                  inset 0 1px 0 rgba(255,255,255,0.95)
                `,
                overflow: 'hidden',
                textAlign: 'center' as const,
              }}
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.88, y: 16  }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            >

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(180,110,240,0.12)',
                  border: '1px solid rgba(180,110,240,0.20)',
                  color: '#B46EF0', fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ×
              </button>

              {/* Star decorations */}
              <div style={{ position: 'absolute', top: '24px', left: '18px', animation: 'sparkle 3s ease-in-out infinite' }}>
                <StarSVG size={8} color="#E8C8FF" />
              </div>
              <div style={{ position: 'absolute', top: '40px', right: '22px', animation: 'sparkle 3s ease-in-out infinite 1s' }}>
                <StarSVG size={6} color="#FFB8D4" />
              </div>

              {/* Avatar */}
              <div style={{
                position: 'relative',
                width: '110px', height: '110px',
                margin: '0 auto 14px',
                borderRadius: '999px',
                padding: '4px',
                background: 'linear-gradient(145deg, #ffffff, #f4e9ff, #ffe4ef)',
                boxShadow: '0 0 20px rgba(187,142,255,0.42), 0 0 30px rgba(255,142,188,0.32)',
              }}>
                {/* Pastel sky bg behind emoji */}
                <div style={{
                  width: '100%', height: '100%',
                  borderRadius: '999px',
                  background: `linear-gradient(160deg, #EEE4FF 0%, #FFE4F0 50%, #FFF4E8 100%)`,
                  border: '3px solid rgba(255,255,255,0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px',
                  overflow: 'hidden',
                }}>
                  {pet.emoji}
                </div>

                {/* Heart badge */}
                <div style={{
                  position: 'absolute', right: '3px', bottom: '9px',
                  width: '26px', height: '26px',
                  borderRadius: '9px',
                  background: 'linear-gradient(145deg, #ffb1c8, #f05f98)',
                  transform: 'rotate(-8deg)',
                  boxShadow: '0 5px 12px rgba(240,95,152,0.35), inset 0 1px 0 rgba(255,255,255,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HeartSVG />
                </div>
              </div>

              {/* Pet name */}
              <h2 style={{
                margin: '0 0 6px',
                fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
                fontSize: 'clamp(26px, 4vw, 36px)',
                lineHeight: 0.95,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #f06fa6, #b46ef0, #7fa2e8)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {pet.name}
              </h2>

              {/* Tier badge */}
              {pet.tier !== 'free' && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  margin: '0 0 7px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(255,200,97,0.15)',
                  border: '1px solid rgba(255,200,97,0.45)',
                  color: '#A07010', fontSize: '10px', fontWeight: 600,
                }}>
                  ✨ Zona premium
                </div>
              )}

              {/* Emotional message */}
              <p style={{
                margin: '0 auto',
                maxWidth: '180px',
                fontFamily: 'var(--font-ui), "Nunito Sans", sans-serif',
                fontSize: '11px',
                lineHeight: 1.55,
                fontWeight: 500,
                color: '#6479B7',
              }}>
                {pet.message.length > 70 ? pet.message.slice(0, 68) + '…' : pet.message}
              </p>

              {/* Decorative divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                margin: '13px auto 10px',
                width: '76%',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(180,140,240,0.35), transparent)' }} />
                <div style={{
                  width: '5px', height: '5px', borderRadius: '999px',
                  background: '#C8A8FF',
                  boxShadow: '0 0 8px rgba(200,168,255,0.8)',
                }} />
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(180,140,240,0.35), transparent)' }} />
              </div>

              {/* Meta info */}
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: '6px', flexWrap: 'wrap' as const,
                marginBottom: '14px',
                fontFamily: 'var(--font-ui), sans-serif',
                fontSize: '10px', fontWeight: 600, color: '#7B8BC9',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CalendarSVG /> {timeAgo(pet.createdAt)}
                </span>
                <span style={{ color: '#C8A8FF' }}>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <PawSVG /> {pet.country || 'España'}
                </span>
              </div>

              {/* CTA button */}
              <motion.button
                onClick={onShare}
                style={{
                  width: '100%',
                  minHeight: '32px',
                  border: 'none',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #ff7ea8 0%, #ec65b7 52%, #b969f3 100%)',
                  color: 'white',
                  fontFamily: 'var(--font-ui), sans-serif',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  boxShadow: '0 8px 18px rgba(236,101,183,0.34), inset 0 1px 0 rgba(255,255,255,0.35)',
                  cursor: 'pointer',
                  border: '1.5px solid rgba(255,255,255,0.55)' as any,
                }}
                whileHover={{
                  y: -1,
                  boxShadow: '0 10px 22px rgba(236,101,183,0.42), inset 0 1px 0 rgba(255,255,255,0.42)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <HeartSVG /> Ver recuerdo
              </motion.button>

              {/* Inline sparkle keyframe */}
              <style>{`
                @keyframes sparkle {
                  0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
                  50%      { transform: translateY(-4px) rotate(15deg); opacity: 1; }
                }
              `}</style>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
