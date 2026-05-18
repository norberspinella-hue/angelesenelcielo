# Mural Global · Paquete de referencia técnica

> **Para Antigravity:** este NO es el código a evolucionar.
> Es un paquete de **referencia técnica curada** del proyecto previo.
> Estos archivos te ayudan a entender qué funcionaba bien y cómo,
> para **REIMPLEMENTAR LIMPIO** en el nuevo proyecto.

---

## ⚠️ Regla de uso

| ✅ HACER | ❌ NO HACER |
|---|---|
| Leer cada archivo para entender el patrón técnico | Copiar archivos completos al nuevo proyecto |
| Replicar la estructura del canvas (devicePixelRatio, viewport clipping, etc.) | Reusar nombres incorrectos (`lights`, `tier`, etc.) |
| Reaprovechar el diseño visual del drawer y la tarjeta flotante | Mantener los planes incorrectos (1/4/8/12 con precios Gratis/2.99/4.99/7.99) |
| Mantener el truco "scatter golden ratio" para el seed inicial del mural | Asumir que el código está completo (NO tiene backend, NO tiene Stripe, NO tiene Supabase) |

---

## 📁 Contenido del paquete

```
mural-global-referencia/
├─ README.md                                         ← este archivo
│
├─ lib/mural/
│  └─ gridMath.ts                                    ← ⭐ EXCELENTE — usar tal cual
│
├─ components/mural-global/
│  ├─ MuralCanvas-reference.tsx                      ← extracto del canvas (referencia)
│  ├─ MuralFloatingPetCard.tsx                       ← diseño tarjeta perfil
│  ├─ MuralUploadFlow.tsx                            ← diseño steps del drawer
│  ├─ MuralZoomControls.tsx                          ← controles zoom
│  └─ MuralPremiumBadge.tsx                          ← badge zona destacada
│
├─ public/Iconos/                                    ← 5 iconos SVG ya generados
│  ├─ paw.svg
│  ├─ pawrosa.svg
│  ├─ corazon.svg
│  ├─ star.svg
│  └─ star.png
│
└─ app/
   └─ globals.css                                    ← CSS base (validar contra CSS.docx)
```

---

## 📋 Detalle por archivo

### `lib/mural/gridMath.ts` ⭐⭐⭐ EXCELENTE
**Estado: USAR TAL CUAL (con renombres menores).**

Matemática del viewport del mural. Calcula qué slots son visibles según pan/zoom, hace clamp para evitar que el grid se vaya fuera de pantalla, y centra la cámara en la zona destacada.

**Por qué es bueno:**
- Funciones puras, sin side effects.
- Bien tipadas con TypeScript.
- Tests mentales fáciles (matemática 2D simple).
- Constantes bien definidas.

**Qué cambiar:**
- `GRID_COLS = 1000` → mantener.
- `ZOOM_SLOT_SIZES` → revisar contra constantes del Anexo Técnico v2.

---

### `components/mural-global/MuralCanvas-reference.tsx` ⭐⭐ BUENA REFERENCIA
**Estado: LEER, ENTENDER Y REIMPLEMENTAR LIMPIO.**

Extracto del canvas 2D del proyecto previo. La cabecera del archivo explica qué replicar y qué cambiar. **Léelo entero antes de construir el nuevo MuralCanvas.**

**Lo más valioso aquí:**
- Uso correcto de `devicePixelRatio`.
- Cálculo de viewport visible antes de pintar.
- Helper `rr()` para rounded rects.
- Click handler con conversión de coordenadas.

**Lo que falta y hay que añadir:**
- Conexión a Supabase (aquí está mockeado).
- Miniaturas de fotos reales a zoom alto.
- Throttling con `requestAnimationFrame`.
- Separación viewport en hook `useMuralViewport()`.

---

### `components/mural-global/MuralFloatingPetCard.tsx` ⭐⭐ BUENA REFERENCIA VISUAL
**Estado: REAPROVECHAR EL DISEÑO, REESCRIBIR LIMPIO.**

Tarjeta flotante que muestra el perfil de una mascota cuando el usuario hace click en un slot ocupado del mural.

**Lo bueno:**
- Composición visual elegante.
- SVGs inline para iconos (HeartSVG, StarSVG, PawSVG, CalendarSVG).
- Animaciones con framer-motion.

**Lo que mejorar:**
- Hardcodea cálculos de tiempo (`timeAgo`) → usar `Intl.RelativeTimeFormat`.
- No tiene estados de carga.
- Falta botón "Compartir" y "Reportar" (decisión del MVP nuevo).

---

### `components/mural-global/MuralUploadFlow.tsx` ⭐⭐ BUENA REFERENCIA VISUAL
**Estado: REAPROVECHAR DISEÑO DE STEPS, REESCRIBIR LÓGICA.**

⚠️ **ATENCIÓN:** este es el COMPONENTE MÁS PROBLEMÁTICO del proyecto previo. Tiene la estética perfecta pero la lógica está fuera de lo acordado.

**Lo bueno (replicar):**
- El stepper visual (puntos animados arriba) es excelente.
- El diseño de cada step (sube foto, datos, confirmación, share) es lo que ves en las capturas que enviaste.
- Las animaciones de transición.

**Lo malo (NO replicar):**
- Modal CENTRAL — el nuevo proyecto usa DRAWER LATERAL (desktop) o DRAWER BOTTOM (mobile).
- Planes 1/4/8/12 con precios Gratis/2.99/4.99/7.99 — el nuevo proyecto usa 1/4/9 con precios 1€/4,99€/9,99€.
- 5 steps secuenciales — el nuevo proyecto tiene 4 (Plan+Slot → Foto+Datos → Stripe → Confirmación).
- Sin integración real con backend.
- Sin checkbox de derechos de imagen (T.3 del Anexo).

**Decisión:** ESTÉTICA REAPROVECHABLE, LÓGICA REHACER COMPLETO.

---

### `components/mural-global/MuralZoomControls.tsx` ⭐⭐⭐ USAR TAL CUAL
**Estado: REAPROVECHAR.**

Botones de zoom-in/zoom-out/centrar/fullscreen. Simple, bien implementado, sin bugs aparentes.

---

### `components/mural-global/MuralPremiumBadge.tsx` ⭐⭐ BUENA REFERENCIA
**Estado: REAPROVECHAR.**

Badge dorado para la zona destacada del centro del mural (la zona con la pezuña). Decoración visual.

---

### `public/Iconos/*` ⭐⭐ POTENCIALMENTE REAPROVECHABLE
**Estado: VALIDAR CONTRA EL DISEÑO CANVA.**

5 iconos SVG ya creados:
- `paw.svg` — pezuña principal
- `pawrosa.svg` — pezuña rosa (cursor)
- `corazon.svg` — corazón con halo
- `star.svg` — estrella
- `star.png` — versión PNG de la estrella

**Antes de usarlos:** comparar visualmente con el diseño Canva de la landing (`LANDING_ANGELES_EN_EL_CIELO.png`). Si están alineados con el estilo → usar. Si NO → regenerar siguiendo la sección 14 del Anexo Técnico v2.

---

### `app/globals.css` ⭐ VALIDAR CONTRA CSS.docx
**Estado: VALIDAR.**

CSS global del proyecto previo. **Antes de usarlo:** compararlo con el `CSS.docx` oficial. El CSS oficial manda. Si hay conflicto, prevalece el `CSS.docx`.

---

## ❌ Archivos del proyecto previo que NO están aquí (descartados)

Los siguientes archivos del proyecto previo se descartan deliberadamente:

| Archivo | Razón |
|---|---|
| `components/mural-global/MuralShell.tsx` | Implementación con divs (no canvas). Código muerto, no usado. |
| `components/mural-global/MuralVirtualGrid.tsx` | Lo mismo. Renderizaba divs, no escala a 1M slots. |
| `components/mural-global/MuralGlobalPage.tsx` (completo) | 1141 líneas mezclando todo. Solo se extrae el canvas como referencia. |
| `components/mural-global/MuralHeroHeader.tsx` | Se rediseña según el pantallazo Canva nuevo. |
| `components/mural-global/MuralTopNav.tsx` | Idem. |
| `components/mural-global/MuralBottomCTA.tsx` | Idem. |
| `components/mural-global/MuralStatsBar.tsx` | Idem (las stats se rediseñan según capturas). |
| `lib/mural/mockPets.ts` | Datos mockeados con golden ratio scatter. La técnica conceptual SÍ vale (documentada en Anexo Técnico v2). El código NO. |
| `lib/mural/muralTypes.ts` | Tipos con planes incorrectos (1/4/8/12, `tier`, `lights`). Se rehacen alineados con `documento_tecnico_funcional_v2.md`. |
| `app/layout.tsx` | Title incorrecto ("Todos los perros van al cielo"). Se rehace. |
| `app/mural-global/page.tsx` | Trivial, se rehace. |
| `package.json` | Faltan todas las dependencias (Supabase, Stripe, Resend, etc.). Rehacer desde cero. |
| `next.config.js`, `tsconfig.json` | Rehacer alineados con stack nuevo. |

---

## 🎯 Resumen ejecutivo

**Qué te llevas de este paquete:**
1. Una matemática de viewport sólida (`gridMath.ts`).
2. Un patrón canvas 2D probado (`MuralCanvas-reference.tsx`).
3. Diseños visuales validados (drawer, tarjeta flotante).
4. Controles zoom y badge listos.
5. 5 iconos SVG (si pasan validación visual).

**Qué construyes desde cero:**
1. Backend completo (Supabase, Stripe, Resend, Vision, GDPR).
2. Lógica de planes correcta (1/4/9 con precios 1€/4,99€/9,99€).
3. Drawer lateral en lugar de modal central.
4. Integración real con DB en lugar de mocks.
5. Performance optimizations (rAF throttling, dirty regions si es necesario).
6. Miniaturas de fotos reales a zoom alto.

---

**Lectura recomendada antes de empezar:**

1. `instrucciones_antigravity.md` — primero esto.
2. `documento_tecnico_funcional_v2.md` — qué construir.
3. `anexo_tecnico_implementacion_v2.md` — cómo construir.
4. `auditoria_mural_global_actual_v1.md` — contexto del código previo.
5. Este README + archivos de este paquete — referencia técnica.

¡A construir algo bonito! 💛
