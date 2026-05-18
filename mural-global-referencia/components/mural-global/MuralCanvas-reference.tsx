/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MuralCanvas-reference.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️  ESTO ES CÓDIGO DE REFERENCIA TÉCNICA, NO PARA COPIAR TAL CUAL.
 *
 * Es el código real del componente MuralCanvas del proyecto previo. Su valor
 * está en la implementación del canvas 2D: devicePixelRatio, viewport
 * clipping, gap entre celdas, click handler, rounded rects. Antigravity debe
 * LEERLO, ENTENDERLO Y REIMPLEMENTARLO LIMPIO con las mejoras detalladas
 * en el Anexo Técnico v2 sección 4.
 *
 * ─── Lo que está BIEN (replicar el patrón) ─────────────────────────────────
 *
 * ✅ devicePixelRatio scaling — nitidez en pantallas retina.
 * ✅ Cálculo de viewport visible antes de pintar (col0/row0/col1/row1).
 * ✅ Helper rr() para rounded rects cross-browser.
 * ✅ Gap entre celdas (cell = slot - gap).
 * ✅ Pintado diferenciado por tipo de slot.
 * ✅ Click handler con conversión pantalla → grid.
 * ✅ ResizeObserver para responsive.
 *
 * ─── Lo que HAY QUE CAMBIAR (NO replicar) ──────────────────────────────────
 *
 * ❌ SLOTS hardcoded global con buildSlots() → en producción vienen de
 *    Supabase vía SWR fetching a /api/mural/slots por viewport.
 * ❌ _pawImg cargado como atributo de función → usar useRef.
 * ❌ Sin throttling con requestAnimationFrame → añadir para wheel zoom.
 * ❌ A zoom alto (>2x) debe pintar MINIATURAS DE FOTOS reales,
 *    no solo color. AQUÍ NO ESTÁ IMPLEMENTADO — hay que añadirlo.
 * ❌ Lógica de drag/zoom mezclada con render → separar en hook
 *    useMuralViewport().
 * ❌ Estados de slot: aquí hay 4 tipos. En el nuevo proyecto son 5:
 *    available, reserved_pending_payment, occupied, blocked_admin,
 *    sponsor_private (ver Anexo v2 sección 3.2).
 *
 * ─── Constantes recomendadas para el nuevo proyecto ────────────────────────
 *
 * El proyecto previo usa BASE_SLOT=80 con zoom desde 0.1.
 * En el nuevo conviene normalizar:
 *
 *   const BASE_SLOT = 8;        // a zoom 1x cada slot ocupa 8px
 *   const MIN_ZOOM = 0.1;
 *   const MAX_ZOOM = 10;
 *   const ZOOM_FACTOR = 1.15;
 *
 * ─── Próximos pasos para Antigravity ───────────────────────────────────────
 *
 * 1. Leer este archivo entero para entender el patrón canvas.
 * 2. Leer también gridMath.ts (matemática del viewport — excelente).
 * 3. Reimplementar limpio en /components/mural/MuralCanvas.tsx siguiendo
 *    las mejoras descritas arriba y el Anexo Técnico v2 sección 4.
 * 4. Separar viewport en hook useMuralViewport().
 * 5. Conectar a Supabase con SWR.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

function MuralCanvas({
  viewport, onSelectCell, selectedCell,
}: {
  viewport: Viewport
  onSelectCell: (x: number, y: number) => void
  selectedCell: { x: number; y: number } | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1200, h: 700 })
  const slotSize = BASE_SLOT * viewport.zoom

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let rafId: number
    const measure = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: rect.width, h: rect.height })
      } else {
        rafId = requestAnimationFrame(measure)
      }
    }

    measure()

    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setSize({ w: entry.contentRect.width, h: entry.contentRect.height })
        } else {
          measure()
        }
      }
    })
    
    obs.observe(el)
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(rafId)
      obs.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width  = size.w * dpr
    canvas.height = size.h * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size.w, size.h)

    const gap = Math.max(0.5, slotSize * 0.08)
    const cell = slotSize - gap

    const colStart = Math.max(0, Math.floor(-viewport.x / slotSize))
    const colEnd   = Math.min(GRID_COLS - 1, colStart + Math.ceil(size.w / slotSize) + 1)
    const rowStart = Math.max(0, Math.floor(-viewport.y / slotSize))
    const rowEnd   = Math.min(GRID_ROWS - 1, rowStart + Math.ceil(size.h / slotSize) + 1)

    // Helper: draw rounded rect without roundRect (better browser compat)
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      r = Math.max(0, Math.min(r, w/2, h/2))
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.arcTo(x + w, y, x + w, y + r, r)
      ctx.lineTo(x + w, y + h - r)
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx.lineTo(x + r, y + h)
      ctx.arcTo(x, y + h, x, y + h - r, r)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
    }

    // ── Pre-pass: draw heart glow as one continuous halo ─────────────────────
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = colStart; col <= colEnd; col++) {
        const slot = SLOTS.get(`${col},${row}`)
        if (slot?.type !== 'premium') continue
        const isBorder = !SLOTS.get(`${col-1},${row}`)?.type?.startsWith('p') ||
                         !SLOTS.get(`${col+1},${row}`)?.type?.startsWith('p') ||
                         !SLOTS.get(`${col},${row-1}`)?.type?.startsWith('p') ||
                         !SLOTS.get(`${col},${row+1}`)?.type?.startsWith('p')
        const sx = viewport.x + col * slotSize
        const sy = viewport.y + row * slotSize
        ctx.shadowBlur  = isBorder ? 22 : 10
        ctx.shadowColor = 'rgba(255,200,60,0.20)'
        ctx.fillStyle   = 'rgba(255,220,97,0.10)'
        ctx.beginPath()
        ctx.rect(sx, sy, cell, cell)
        ctx.fill()
      }
    }
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'

    // ── Main draw loop ─────────────────────────────────────────────────────────
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = colStart; col <= colEnd; col++) {
        const sx = viewport.x + col * slotSize
        const sy = viewport.y + row * slotSize
        const slot = SLOTS.get(`${col},${row}`)
        const isSelected = selectedCell?.x === col && selectedCell?.y === row
        const r = Math.max(1, cell * 0.15)

        if (isSelected) {
          ctx.fillStyle = 'rgba(255,220,80,0.9)'
          ctx.strokeStyle = '#C0A020'
          ctx.lineWidth = 1
          rr(sx, sy, cell, cell, r)
          ctx.fill(); ctx.stroke()
        } else if (slot?.demo) {
          // ── Demo slot: bright pink/gold, bigger, thick border ──
          const dSize = Math.max(cell + 4, 16) // at least 16px so always clickable
          ctx.fillStyle = slot.color
          ctx.strokeStyle = slot.type === 'angel' ? '#A07800' : '#A0004A'
          ctx.lineWidth = Math.max(2, slotSize * 0.1)
          rr(sx - 2, sy - 2, dSize, dSize, Math.max(3, r + 2))
          ctx.fill()
          ctx.stroke()
        } else if (slot) {
          if (slot.type === 'premium') {
            const scale = 1.05
            const pCell = cell * scale
            const off   = (cell - pCell) / 2
            ctx.fillStyle   = 'rgba(255,220,97,0.25)'
            ctx.strokeStyle = 'rgba(255,200,60,0.90)'
            ctx.lineWidth   = Math.max(0.8, slotSize * 0.05)
            ctx.shadowBlur    = 15
            ctx.shadowColor   = 'rgba(255,200,60,0.20)'
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
            rr(sx + off, sy + off, pCell, pCell, Math.max(1, pCell * 0.15))
            ctx.fill()
            ctx.stroke()
            ctx.shadowBlur  = 0
            ctx.shadowColor = 'transparent'
          } else if (slot.type === 'angel') {
            ctx.fillStyle = 'rgba(255,200,80,0.75)'
            ctx.strokeStyle = 'rgba(200,160,40,0.80)'
            ctx.lineWidth = 0.5
          } else if (slot.type === 'reserved') {
            ctx.fillStyle = 'rgba(160,180,255,0.65)'
            ctx.strokeStyle = 'rgba(120,140,220,0.50)'
            ctx.lineWidth = 0.5
          } else {
            ctx.fillStyle = slot.color + 'CC'
            ctx.strokeStyle = slot.color + 'A0'
            ctx.lineWidth = 0.3
          }
          if (slot.type !== 'premium') {
            rr(sx, sy, cell, cell, r)
            ctx.fill()
            if (slotSize > 6) ctx.stroke()
          }
        } else {
          // Empty slot — subtle background
          ctx.fillStyle = 'rgba(230,220,240,0.30)'
          ctx.strokeStyle = 'rgba(200,190,220,0.45)'
          ctx.lineWidth = 0.3
          rr(sx, sy, cell, cell, Math.max(1, cell * 0.12))
          ctx.fill()
          if (slotSize > 4) ctx.stroke()
          // Paw icon on empty slots — only when cells are big enough to see it
          if (slotSize >= 20 && cell >= 14) {
            const iconSize = Math.min(cell * 2.2, 128)
            const ix = sx + (cell - iconSize) / 2
            const iy = sy + (cell - iconSize) / 2
            if ((MuralCanvas as any)._pawImg) {
              ctx.globalAlpha = 0.18
              ctx.drawImage((MuralCanvas as any)._pawImg, ix, iy, iconSize, iconSize)
              ctx.globalAlpha = 1
            }
          }
        }
      }
    }
  }, [viewport, size, slotSize, selectedCell])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const col = Math.floor((mx - viewport.x) / slotSize)
    const row = Math.floor((my - viewport.y) / slotSize)
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      onSelectCell(col, row)
    }
  }, [viewport, slotSize, onSelectCell])

  // Preload paw image for canvas drawing
  useEffect(() => {
    if ((MuralCanvas as any)._pawImg) return
    const img = new Image()
    img.src = '/Iconos/paw.svg'
    img.onload = () => { (MuralCanvas as any)._pawImg = img }
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: size.w + 'px', height: size.h + 'px', cursor: starCursor, display: 'block', position: 'absolute', top: 0, left: 0 }}
        onClick={handleClick}
      />
    </div>
  )
}
