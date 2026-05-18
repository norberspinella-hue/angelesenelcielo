'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LightCount, UploadStep } from '@/lib/mural/muralTypes'

interface MuralUploadFlowProps {
  isOpen: boolean
  onClose: () => void
}

// ─── Paw SVG — enhanced gradient + glow ──────────────────────────────────────
// Uses linearGradient (userSpaceOnUse) matching provided reference SVG exactly
const PawSVG = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="pawGradient" x1="16" y1="8" x2="48" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFF1B8"/>
        <stop offset="38%"  stopColor="#FFD27E"/>
        <stop offset="72%"  stopColor="#F8A84C"/>
        <stop offset="100%" stopColor="#F18B3E"/>
      </linearGradient>
      <filter id="pawGlowF" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="blur"/>
        <feColorMatrix in="blur" type="matrix"
          values="1 0 0 0 1  0 0.72 0 0 0.55  0 0 0.22 0 0.12  0 0 0 0.75 0"
          result="glow"/>
        <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g filter="url(#pawGlowF)">
      <path fill="url(#pawGradient)" d="M31.8 34.5c-8.4 0-15.7 7.6-15.7 16.2 0 5.2 3.9 8.1 8.4 6.1 2.6-1.2 4.6-2.2 7.3-2.2s4.8 1 7.5 2.2c4.5 2 8.4-.9 8.4-6.1 0-8.6-7.4-16.2-15.9-16.2Z"/>
      <path fill="url(#pawGradient)" d="M19.3 29.7c4.2-.6 6.7-5.4 5.8-10.9-.8-5.5-4.8-9.5-9-8.9-4.2.6-6.7 5.4-5.9 10.9.9 5.5 4.9 9.5 9.1 8.9Z"/>
      <path fill="url(#pawGradient)" d="M44.6 29.7c4.2.6 8.2-3.4 9-8.9.9-5.5-1.7-10.3-5.8-10.9-4.2-.6-8.2 3.4-9 8.9-.9 5.5 1.6 10.3 5.8 10.9Z"/>
      <path fill="url(#pawGradient)" d="M31.9 27.4c4.3 0 7.7-4.9 7.7-11s-3.4-11-7.7-11-7.7 4.9-7.7 11 3.5 11 7.7 11Z"/>
    </g>
  </svg>
)

// ─── Plan cards data ──────────────────────────────────────────────────────────
const PLANS: Array<{
  lights: LightCount
  copy: string
  price: string
  cols: number
  pawSize: number
}> = [
  { lights: 1,  copy: 'Una huella de luz',        price: 'Gratis', cols: 1, pawSize: 40 },
  { lights: 4,  copy: 'Cuatro luces que brillan', price: '€2.99', cols: 2, pawSize: 32 },
  { lights: 8,  copy: 'Ocho luces eternas',       price: '€4.99', cols: 4, pawSize: 26 },
  { lights: 12, copy: 'Una constelación de amor', price: '€7.99', cols: 4, pawSize: 22 },
]

// ─── Step dots ────────────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: UploadStep; total: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '9px', marginBottom: '24px' }}>
      {Array.from({ length: total }, (_, i) => {
        const s = (i + 1) as UploadStep
        const active = s === current
        const done   = s < current
        return (
          <motion.div key={i}
            animate={{
              width: active ? 34 : 10,
              background: active
                ? 'linear-gradient(90deg,#ef6fa3,#f8a6c3)'
                : done
                  ? 'rgba(239,111,163,0.52)'
                  : 'rgba(199,167,246,0.34)',
            }}
            style={{ height: 10, borderRadius: 999,
              boxShadow: active ? '0 0 14px rgba(239,111,163,0.42)' : 'none' }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          />
        )
      })}
    </div>
  )
}

// ─── Primary button ───────────────────────────────────────────────────────────
const PrimaryBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <motion.button onClick={onClick}
    style={{
      position: 'relative', zIndex: 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      width: 'min(420px, 100%)', minHeight: 62, margin: '0 auto',
      border: 'none', borderRadius: 999,
      background: 'linear-gradient(90deg,#ff82ad 0%,#ec5f96 52%,#bd6fed 100%)',
      color: '#fff',
      fontFamily: 'var(--font-ui), "Nunito Sans", sans-serif',
      fontSize: 19, fontWeight: 900, cursor: 'pointer',
      boxShadow: '0 18px 40px rgba(236,95,150,0.34),0 8px 20px rgba(184,111,237,0.16),inset 0 1px 0 rgba(255,255,255,0.42)',
    }}
    whileHover={{ y: -2, boxShadow: '0 24px 52px rgba(236,95,150,0.42),0 12px 30px rgba(184,111,237,0.20),inset 0 1px 0 rgba(255,255,255,0.48)' }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    {children}
  </motion.button>
)

const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick}
    style={{
      width: '100%', minHeight: 48, marginTop: 10, border: '1.5px solid rgba(199,167,246,0.40)',
      borderRadius: 999, background: 'transparent', cursor: 'pointer',
      color: '#7b5ab6',
      fontFamily: 'var(--font-ui), sans-serif', fontSize: 14, fontWeight: 600,
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = '#ef6fa3')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(199,167,246,0.40)')}
  >
    ← Volver
  </button>
)

// ─── Modal wrapper styles ─────────────────────────────────────────────────────
const MODAL_STYLE: React.CSSProperties = {
  position: 'relative',
  width: 'min(960px, 94vw)',
  margin: '0 auto',
  padding: '34px 34px 38px',
  borderRadius: 36,
  overflow: 'hidden',
  background: `
    radial-gradient(circle at 50% 8%, rgba(255,226,168,0.26), transparent 28%),
    radial-gradient(circle at 12% 30%, rgba(248,181,204,0.24), transparent 28%),
    radial-gradient(circle at 88% 36%, rgba(184,139,232,0.18), transparent 30%),
    linear-gradient(180deg, rgba(255,253,251,0.96), rgba(255,242,248,0.90) 48%, rgba(255,247,241,0.94))
  `,
  border: '1px solid rgba(255,255,255,0.92)',
  boxShadow: '0 30px 90px rgba(122,90,182,0.18),0 16px 42px rgba(239,111,163,0.14),inset 0 1px 0 rgba(255,255,255,0.95)',
  fontFamily: 'var(--font-ui), "Nunito Sans", sans-serif',
  color: '#6977b8',
}

// ─── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan, selected, onSelect,
}: {
  plan: typeof PLANS[0]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        position: 'relative',
        minHeight: 282,
        padding: '24px 16px 18px',
        borderRadius: 24,
        border: selected
          ? '1.5px solid rgba(239,95,150,0.86)'
          : '1.5px solid rgba(225,198,255,0.68)',
        background: selected
          ? `linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,236,245,0.68)),
             radial-gradient(circle at 50% 50%,rgba(255,226,168,0.30),transparent 40%)`
          : `linear-gradient(180deg,rgba(255,255,255,0.62) 0%,rgba(255,244,249,0.54) 100%),
             radial-gradient(circle at 50% 54%,rgba(255,226,168,0.20),transparent 35%)`,
        boxShadow: selected
          ? '0 28px 72px rgba(239,95,150,0.22),0 14px 42px rgba(184,139,232,0.18),0 0 0 4px rgba(239,95,150,0.10),inset 0 1px 0 rgba(255,255,255,0.95)'
          : '0 14px 34px rgba(122,90,182,0.08),0 8px 22px rgba(239,111,163,0.08),inset 0 1px 0 rgba(255,255,255,0.82)',
        cursor: 'pointer',
        textAlign: 'center',
        overflow: 'hidden',
      }}
      whileHover={!selected ? { y: -4,
        boxShadow: '0 24px 58px rgba(122,90,182,0.14),0 12px 34px rgba(239,111,163,0.14),inset 0 1px 0 rgba(255,255,255,0.9)',
      } : {}}
      animate={selected ? { y: -5, scale: 1.015 } : { y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
    >
      {/* Inner border ring */}
      <div style={{
        position: 'absolute', inset: 10, borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.56)', pointerEvents: 'none',
      }}/>

      {/* Selected glow */}
      {selected && (
        <div style={{
          position: 'absolute', inset: '-20%',
          background: `radial-gradient(circle at 50% 48%,rgba(255,226,168,0.34),transparent 34%),
            radial-gradient(circle at 50% 60%,rgba(239,95,150,0.18),transparent 45%)`,
          pointerEvents: 'none',
        }}/>
      )}

      {/* Cloud bottom */}
      <div style={{
        position: 'absolute', left: '-10%', right: '-10%', bottom: 36, height: 94,
        background: `radial-gradient(ellipse at 20% 80%,rgba(255,255,255,0.82),transparent 42%),
          radial-gradient(ellipse at 50% 86%,rgba(255,255,255,0.70),transparent 46%),
          radial-gradient(ellipse at 80% 80%,rgba(255,255,255,0.76),transparent 42%)`,
        opacity: 0.8, pointerEvents: 'none',
      }}/>

      {/* Title */}
      <h3 style={{
        position: 'relative', zIndex: 2,
        margin: '0 0 16px',
        fontFamily: '"Playfair Display","Cormorant Garamond",serif',
        fontSize: 29, lineHeight: 1, fontWeight: 700,
        color: '#7154ad', letterSpacing: '-0.02em',
      }}>
        {plan.lights} {plan.lights === 1 ? 'luz' : 'luces'}
      </h3>

      {/* Paw stage */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: 120, margin: '0 -4px 12px',
        borderRadius: 18, display: 'grid', placeItems: 'center',
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(255,248,200,0.65), transparent 45%),
          radial-gradient(ellipse at 20% 85%, rgba(255,255,255,0.80), transparent 38%),
          radial-gradient(ellipse at 80% 85%, rgba(255,255,255,0.72), transparent 38%),
          linear-gradient(180deg, rgba(255,240,220,0.38), rgba(255,230,245,0.35))
        `,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${plan.cols}, ${plan.pawSize}px)`,
          gap: 9, justifyContent: 'center', alignItems: 'center',
        }}>
          {Array.from({ length: plan.lights }).map((_, i) => (
            <PawSVG key={i} size={plan.pawSize} />
          ))}
        </div>
      </div>

      {/* Copy */}
      <p style={{
        position: 'relative', zIndex: 2,
        minHeight: 32, margin: '0 0 10px',
        fontSize: 13.5, lineHeight: 1.25, fontWeight: 800, color: '#6374b3',
      }}>
        {plan.copy}
      </p>

      {/* Price pill */}
      <span style={{
        position: 'relative', zIndex: 2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 26, padding: '0 13px', borderRadius: 999,
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid rgba(248,181,204,0.52)',
        color: '#ef6fa3', fontSize: 12, fontWeight: 900,
        boxShadow: '0 6px 14px rgba(239,111,163,0.08),inset 0 1px 0 rgba(255,255,255,0.88)',
      }}>
        {plan.price}
      </span>
    </motion.button>
  )
}

// ─── Upload area ──────────────────────────────────────────────────────────────
function UploadZone({ uploaded, onUpload }: { uploaded: boolean; onUpload: () => void }) {
  return (
    <div
      onClick={onUpload}
      style={{
        borderRadius: 20, padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
        border: uploaded ? '2px solid rgba(239,111,163,0.60)' : '2px dashed rgba(199,167,246,0.55)',
        background: uploaded ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.42)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { if (!uploaded) { (e.currentTarget as HTMLDivElement).style.borderColor = '#ef6fa3' }}}
      onMouseLeave={e => { if (!uploaded) { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(199,167,246,0.55)' }}}
    >
      {uploaded ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 700, color: '#7b5ab6', margin: 0 }}>Foto lista</p>
          <p style={{ fontSize: 13, color: '#6977b8', marginTop: 4 }}>La foto ha sido cargada</p>
        </>
      ) : (
        <>
          <img src="/logos/paw-wing-logo.png" alt="" width={64} height={64} style={{ objectFit: "contain", margin: "0 auto" }} />
          <p style={{ fontWeight: 700, color: '#7b5ab6', marginTop: 12, marginBottom: 4 }}>
            Haz clic para subir una foto
          </p>
          <p style={{ fontSize: 13, color: '#6977b8', margin: 0 }}>o arrastra y suelta · JPG, PNG, WEBP</p>
          <p style={{ fontSize: 12, color: '#9988bb', marginTop: 6 }}>Máximo 10 MB · Cuadrada recomendada</p>
        </>
      )}
    </div>
  )
}

function FormInput({ label, placeholder, as = 'input', value, onChange }: {
  label: string; placeholder: string; as?: 'input' | 'textarea'; value: string; onChange: (v: string) => void
}) {
  const shared: React.CSSProperties = {
    width: '100%', borderRadius: 14, padding: '12px 16px',
    border: '1.5px solid rgba(199,167,246,0.38)',
    background: 'rgba(255,255,255,0.70)',
    color: '#25335F',
    fontFamily: 'var(--font-ui), sans-serif', fontSize: 14,
    outline: 'none', resize: 'none' as any,
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#7b5ab6', marginBottom: 6 }}>
        {label}
      </label>
      {as === 'textarea'
        ? <textarea rows={3} placeholder={placeholder} value={value}
            onChange={e => onChange(e.target.value)} style={shared}
            onFocus={e => { e.target.style.borderColor = '#ef6fa3'; e.target.style.boxShadow = '0 0 0 3px rgba(239,111,163,0.12)' }}
            onBlur={e  => { e.target.style.borderColor = 'rgba(199,167,246,0.38)'; e.target.style.boxShadow = 'none' }}
          />
        : <input type="text" placeholder={placeholder} value={value}
            onChange={e => onChange(e.target.value)} style={shared}
            onFocus={e => { e.target.style.borderColor = '#ef6fa3'; e.target.style.boxShadow = '0 0 0 3px rgba(239,111,163,0.12)' }}
            onBlur={e  => { e.target.style.borderColor = 'rgba(199,167,246,0.38)'; e.target.style.boxShadow = 'none' }}
          />
      }
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function MuralUploadFlow({ isOpen, onClose }: MuralUploadFlowProps) {
  const [step,      setStep]      = useState<UploadStep>(1)
  const [lights,    setLights]    = useState<LightCount>(1)
  const [petName,   setPetName]   = useState('')
  const [petMsg,    setPetMsg]    = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [uploaded,  setUploaded]  = useState(false)
  const [done,      setDone]      = useState(false)

  const reset = () => { setStep(1); setLights(1); setPetName(''); setPetMsg(''); setOwnerName(''); setUploaded(false); setDone(false) }
  const handleClose = () => { reset(); onClose() }

  const handleSend = () => {
    setStep(5)
    setTimeout(() => setDone(true), 2600)
  }

  const titleStyle: React.CSSProperties = {
    position: 'relative', zIndex: 2, textAlign: 'center', margin: '0 0 8px',
    fontFamily: '"Playfair Display","Cormorant Garamond",serif',
    fontSize: 'clamp(30px, 4vw, 48px)', lineHeight: 1.08, fontWeight: 700,
    letterSpacing: '-0.035em',
    background: 'linear-gradient(90deg,#6657ac 0%,#9c63bd 46%,#dd5e94 100%)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
  const subtitleStyle: React.CSSProperties = {
    position: 'relative', zIndex: 2,
    maxWidth: 620, margin: '0 auto 28px', textAlign: 'center',
    fontSize: 15, lineHeight: 1.55, fontWeight: 600, color: '#6877b5',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
          style={{ background: 'rgba(37,30,70,0.48)', backdropFilter: 'blur(10px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <motion.div
            style={{ ...MODAL_STYLE, maxHeight: '92vh', overflowY: 'auto' }}
            initial={{ y: 28, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 28, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Decorative sparkles */}
            <div style={{ position: 'absolute', top: 70, left: 48, right: 48, display: 'flex', justifyContent: 'space-between', color: 'rgba(255,205,126,0.68)', fontSize: 18, pointerEvents: 'none', zIndex: 1, textShadow: '0 0 16px rgba(255,216,155,0.9)' }}>
              <span>✦</span><span>✧</span><span>✦</span>
            </div>
            {/* Cloud reflections */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 18% 90%,rgba(255,255,255,0.80),transparent 24%), radial-gradient(ellipse at 42% 94%,rgba(255,255,255,0.64),transparent 28%), radial-gradient(ellipse at 78% 92%,rgba(255,255,255,0.72),transparent 26%)`, opacity: 0.72, pointerEvents: 'none', zIndex: 0 }}/>

            {/* Close */}
            <motion.button
              onClick={handleClose}
              style={{ position: 'absolute', zIndex: 5, top: 22, right: 22, width: 46, height: 46, borderRadius: 999, border: '1px solid rgba(255,255,255,0.82)', background: 'rgba(255,255,255,0.58)', color: '#a05c87', fontSize: 26, lineHeight: '1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(122,90,182,0.10),inset 0 1px 0 rgba(255,255,255,0.8)' }}
              whileHover={{ scale: 1.06, background: 'rgba(255,255,255,0.78)' }}
              whileTap={{ scale: 0.94 }}
              aria-label="Cerrar"
            >
              ×
            </motion.button>

            {/* Step dots */}
            <StepDots current={step} total={5} />

            {/* ── STEP 1: Choose lights ─────────────────────────────── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(239,111,163,0.68)', letterSpacing: 2, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span>⌁</span><span>Elige su luz</span><span>⌁</span>
                  </div>
                </div>
                <h2 style={titleStyle}>Haz que su recuerdo brille más fuerte</h2>
                <p style={subtitleStyle}>
                  Cada recuerdo ocupa un espacio dentro del cielo.
                  Puedes dejarlo como un susurro o convertirlo en una pequeña constelación.
                </p>

                {/* Plan grid */}
                <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 18, marginBottom: 24 }}>
                  {PLANS.map(p => (
                    <PlanCard key={p.lights} plan={p} selected={lights === p.lights} onSelect={() => setLights(p.lights)} />
                  ))}
                </div>

                <p style={{ position: 'relative', zIndex: 2, maxWidth: 620, margin: '0 auto 22px', textAlign: 'center', fontSize: 15, lineHeight: 1.45, fontWeight: 700, color: '#6877b5' }}>
                  <span style={{ marginRight: 8, filter: 'drop-shadow(0 0 8px rgba(239,111,163,0.42))' }}>💗</span>
                  Puedes hacer que su luz pase desapercibida… o que brille para siempre dentro del mural.
                </p>

                <PrimaryBtn onClick={() => setStep(2)}>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.86)', textShadow: '0 0 12px rgba(255,255,255,0.72)' }}>✦</span>
                  Continuar
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.86)', textShadow: '0 0 12px rgba(255,255,255,0.72)' }}>✦</span>
                </PrimaryBtn>
              </motion.div>
            )}

            {/* ── STEP 2: Upload photo ──────────────────────────────── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={titleStyle}>Sube su foto</h2>
                <p style={subtitleStyle}>Elige la foto más especial de tu compañero. Será su luz en el cielo.</p>
                <UploadZone uploaded={uploaded} onUpload={() => setUploaded(true)} />
                <div style={{ marginTop: 16 }}>
                  <PrimaryBtn onClick={() => setStep(3)}>
                    <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.86)' }}>✦</span>
                    Continuar
                    <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.86)' }}>✦</span>
                  </PrimaryBtn>
                  <BackBtn onClick={() => setStep(1)} />
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Name + message ────────────────────────────── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={titleStyle}>Su nombre y mensaje</h2>
                <p style={subtitleStyle}>Cuéntale al cielo quién es.</p>
                <FormInput label="Nombre de tu compañero" placeholder="Ej: Luna, Max, Coco…" value={petName} onChange={setPetName} />
                <FormInput label="Tu mensaje de amor" placeholder="Escribe las palabras que siempre llevarás en el corazón…" as="textarea" value={petMsg} onChange={setPetMsg} />
                <FormInput label="Tu nombre (opcional)" placeholder="Para que otros puedan ver quién lo recuerda" value={ownerName} onChange={setOwnerName} />
                <PrimaryBtn onClick={() => setStep(4)}>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.86)' }}>✦</span>Continuar<span style={{ fontSize: 16, color: 'rgba(255,255,255,0.86)' }}>✦</span>
                </PrimaryBtn>
                <BackBtn onClick={() => setStep(2)} />
              </motion.div>
            )}

            {/* ── STEP 4: Confirm ───────────────────────────────────── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={titleStyle}>Confirmar recuerdo</h2>
                <p style={subtitleStyle}>Revisa que todo esté perfecto.</p>
                <div style={{ borderRadius: 20, padding: 20, marginBottom: 20, background: 'rgba(255,255,255,0.72)', border: '1.5px solid rgba(199,167,246,0.28)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#FFD6E7,#C9B8FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <PawSVG size={36} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: '"Playfair Display",serif', fontSize: 20, color: '#7b5ab6', fontWeight: 700, margin: '0 0 4px' }}>{petName || 'Tu mascota'}</p>
                      <p style={{ fontSize: 13, color: '#6977b8', margin: '0 0 6px' }}>{petMsg || 'Un amor eterno…'}</p>
                      <span style={{ fontSize: 12, color: '#ef6fa3', background: 'rgba(239,111,163,0.10)', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
                        💡 {lights} {lights === 1 ? 'Luz' : 'Luces'} · {lights === 1 ? 'Gratis' : lights === 4 ? '€2.99' : lights === 8 ? '€4.99' : '€7.99'}
                      </span>
                    </div>
                  </div>
                </div>
                <PrimaryBtn onClick={handleSend}>🕊️ Enviar al cielo</PrimaryBtn>
                <BackBtn onClick={() => setStep(3)} />
              </motion.div>
            )}

            {/* ── STEP 5: Heaven + share ────────────────────────────── */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 72, marginBottom: 16, animation: 'ascend 2s ease-in-out infinite' }}>
                  {done ? '✨' : '🕊️'}
                </div>
                <h2 style={{ ...titleStyle, textAlign: 'center' }}>
                  {done ? 'Tu luz ya forma parte del mural' : 'Su recuerdo sube al cielo'}
                </h2>
                <p style={{ ...subtitleStyle, marginBottom: done ? 20 : 0 }}>
                  {done ? 'Comparte este recuerdo y que el mundo lo conozca' : 'Preparando su lugar eterno…'}
                </p>
                {done && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      {[['🔗','Copiar enlace'],['💬','WhatsApp'],['📸','Instagram'],['🎵','TikTok']].map(([icon, label]) => (
                        <button key={label}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: '12px 16px', border: '1.5px solid rgba(199,167,246,0.32)', background: 'rgba(255,255,255,0.62)', color: '#7b5ab6', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef6fa3'; (e.currentTarget as HTMLButtonElement).style.background = 'white' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(199,167,246,0.32)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.62)' }}
                        >
                          {icon} {label}
                        </button>
                      ))}
                      <button
                        style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: '12px 16px', border: '1.5px solid rgba(199,167,246,0.32)', background: 'rgba(255,255,255,0.62)', color: '#7b5ab6', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef6fa3'; (e.currentTarget as HTMLButtonElement).style.background = 'white' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(199,167,246,0.32)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.62)' }}
                      >
                        💌 Descargar postal emocional
                      </button>
                    </div>
                    <button onClick={handleClose}
                      style={{ width: '100%', minHeight: 48, border: '1.5px solid rgba(199,167,246,0.40)', borderRadius: 999, background: 'transparent', color: '#7b5ab6', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Volver al mural
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
