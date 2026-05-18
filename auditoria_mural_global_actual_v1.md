# Auditoría del Mural Global actual
## Ángeles en el Cielo · Estado pre-Antigravity · v1

---

## 0. Resumen ejecutivo

**Veredicto: REAPROVECHABLE en ~40%.** El código actual tiene piezas bien implementadas (especialmente el canvas y la matemática de viewport), pero arrastra **deuda técnica importante** y **dos implementaciones paralelas del mural** que generan ambigüedad. Recomiendo arrancar con Antigravity desde cero usando este código como **referencia técnica**, NO como base.

**Lo más valioso:** la implementación de canvas con devicePixelRatio, el sistema de zoom (factor 1.15 con anchor al cursor) y la matemática de viewport en `gridMath.ts`.

**Lo más problemático:** dos componentes paralelos hacen lo mismo (`MuralShell`+`MuralVirtualGrid` con divs vs `MuralGlobalPage` con canvas), naming inconsistente (`lights` vs `slots`, "perros" vs "mascotas"), y la lógica de planes no coincide con las decisiones tomadas.

---

## 1. Estructura actual

```
mural-global/
├─ app/
│  ├─ layout.tsx                     ← Next.js App Router ✓ correcto
│  ├─ globals.css                    ← estilos globales
│  └─ mural-global/
│     └─ page.tsx                    ← solo importa MuralGlobalPage
├─ components/
│  └─ mural-global/
│     ├─ MuralGlobalPage.tsx         ← 1141 líneas, CANVAS, USADO ⚠️
│     ├─ MuralShell.tsx              ← 279 líneas, DIVS, NO USADO ⚠️
│     ├─ MuralVirtualGrid.tsx        ← 134 líneas, DIVS, NO USADO ⚠️
│     ├─ MuralUploadFlow.tsx         ← 533 líneas, flujo de creación
│     ├─ MuralFloatingPetCard.tsx    ← 284 líneas, modal de perfil
│     ├─ MuralHeroHeader.tsx         ← 168 líneas, header del mural
│     ├─ MuralStatsBar.tsx           ← 66 líneas, stats
│     ├─ MuralBottomCTA.tsx          ← 113 líneas, CTA inferior
│     ├─ MuralTopNav.tsx             ← 101 líneas, nav superior
│     ├─ MuralPremiumBadge.tsx       ← 63 líneas, badge zona premium
│     └─ MuralZoomControls.tsx       ← 54 líneas, controles zoom
├─ lib/mural/
│  ├─ muralTypes.ts                  ← tipos TS
│  ├─ gridMath.ts                    ← cálculos del viewport
│  └─ mockPets.ts                    ← datos de prueba
└─ public/
   ├─ Iconos/                        ← SVG icons
   ├─ logos/                         ← logos
   └─ backgrounds/                   ← fondos pesados
```

Stack actual: **Next.js 14.2.3 + React 18 + framer-motion + Tailwind**. Sin Supabase, sin Stripe, sin nada del backend.

---

## 2. Auditoría pieza por pieza

### 🟢 LO QUE ES REAPROVECHABLE (con cambios menores)

#### 2.1 Canvas rendering en `MuralGlobalPage.tsx` (líneas 147-365)
**Calidad: 7/10.** La función `MuralCanvas` está bien implementada:

- ✅ Usa `devicePixelRatio` para nitidez en pantallas retina.
- ✅ Calcula viewport visible correctamente antes de pintar.
- ✅ Helper `rr()` para rounded rects compatible con todos los navegadores.
- ✅ Dibuja gap entre celdas.
- ✅ Maneja distintos tipos de slot (occupied, reserved, angel, premium).
- ✅ Detecta clicks con coordenadas convertidas correctamente.

**Qué hay que arreglar:**
- ⚠️ No usa `OffscreenCanvas` ni double buffering — repinta el canvas completo en cada frame, lo cual es subóptimo para 60 fps en zoom alto.
- ⚠️ No tiene throttling en wheel zoom — puede saturar a Mac touchpad sensible.
- ⚠️ La imagen de la pezuña dorada se carga con `_pawImg` adjunto a la propia función (hack que rompe SSR strict mode).
- ⚠️ Mezcla lógica de drag y zoom con UI (separar en hook custom `useMuralViewport`).

**Decisión:** mantener la arquitectura canvas (es correcta), pero reescribir limpio en Antigravity con las mejoras anteriores.

#### 2.2 `lib/mural/gridMath.ts` (130 líneas)
**Calidad: 9/10.** Excelente. La matemática es correcta:

- ✅ `getVisibleRange()` calcula bien las columnas visibles según pan/zoom.
- ✅ `clampPan()` evita que el grid se vaya fuera de pantalla.
- ✅ `getPanToCenterPremiumZone()` centra correctamente la zona destacada.
- ✅ Constantes (`GRID_COLS=1000`, `ZOOM_SLOT_SIZES`) bien definidas.

**Reaprovechar tal cual.** Es la pieza más limpia del proyecto.

#### 2.3 `lib/mural/muralTypes.ts` (95 líneas)
**Calidad: 6/10.** Los tipos están bien estructurados PERO:

- ⚠️ El tipo `LightCount = 1 | 4 | 8 | 12` no coincide con los planes acordados (`1 | 4 | 9`). Antigravity debe rehacerlo.
- ⚠️ El tipo `PetTier = 'free' | 'premium' | 'premium_plus'` no coincide con nuestros planes (`recuerdo_inicial | estrella_anual | recuerdo_eterno`).
- ⚠️ El status `SlotStatus` tiene 10 valores cuando solo necesitamos 5 (los del doc técnico).
- ✅ El tipo `Pet` y `Slot` son buena referencia para el modelo Supabase.
- ✅ El tipo `ViewportState` es perfecto.

**Decisión:** rehacer alineado con el doc técnico. Mantener la estructura.

#### 2.4 `MuralFloatingPetCard.tsx` (284 líneas)
**Calidad: 7/10.** La tarjeta flotante del perfil de mascota está bien diseñada visualmente. Buena composición de SVGs (HeartSVG, StarSVG, PawSVG, CalendarSVG).

**Qué hay que arreglar:**
- ⚠️ Hardcodea cálculos de tiempo (`timeAgo`) — usar `date-fns` o nativo `Intl.RelativeTimeFormat`.
- ⚠️ No tiene estados de carga (foto del perfil placeholder mientras carga).
- ⚠️ Falta el botón "Compartir perfil" y "Reportar".

**Decisión:** reaprovechar el diseño visual y la composición. Reescribir limpio.

#### 2.5 `MuralUploadFlow.tsx` (533 líneas) — el drawer del flujo
**Calidad: 5/10.** Muy bien diseñado visualmente (las capturas que enviaste lo demuestran), pero arrastra problemas:

- ✅ El stepper visual (puntitos animados) es muy bueno y replicable.
- ✅ Las plantillas de paso (subir foto, datos, confirmación, share) están bien.
- ⚠️ Solo tiene 5 steps con planes `1/4/8/12` (no `1/4/9`).
- ⚠️ No hay paso de **selección de plan** explícito.
- ⚠️ Los precios mostrados (Gratis / 2.99 € / 4.99 € / 7.99 €) NO COINCIDEN con los acordados (1 € / 4,99 € / 9,99 €).
- ⚠️ No hay integración con Stripe.
- ⚠️ El modal es central (no drawer lateral) — visualmente bonito pero NO es lo que decidimos.

**Decisión:** reaprovechar el diseño visual de cada step, pero rehacer la lógica completa.

#### 2.6 `MuralZoomControls.tsx`, `MuralPremiumBadge.tsx`, `MuralStatsBar.tsx`
**Calidad: 7/10.** Componentes auxiliares pequeños y limpios. Reaprovechar directamente.

### 🔴 LO QUE HAY QUE DESCARTAR

#### 2.7 `MuralShell.tsx` + `MuralVirtualGrid.tsx`
**Implementación paralela ABANDONADA.** Estos componentes existen pero `app/mural-global/page.tsx` no los importa — usa el canvas de `MuralGlobalPage.tsx`. Renderizan slots como `<div>` absolutamente posicionados, lo cual **no escala a 1M slots** (sería ~3500 divs visibles a la vez como máximo, pero React reconciliation se vuelve costoso). Es código muerto que confunde.

**Decisión:** descartar completamente.

#### 2.8 `lib/mural/mockPets.ts` — datos de prueba con scatter pseudoaleatorio
**No reaprovechable** porque:
- Los datos los proveerá Supabase en producción.
- La técnica de "150.000 ocupados con scatter golden ratio" es un hack para llenar visualmente el mural sin guardar 1M filas. **Esto SÍ vale la pena conservar conceptualmente** para el seed inicial pero no el código.

**Decisión:** descartar el archivo. Documentar la idea (sparse map con coordenadas golden ratio) como sugerencia para el seeder inicial de Supabase.

#### 2.9 Title `"Todos los perros van al cielo"` en `layout.tsx`
Inconsistencia de naming. El dominio acordado es **`todaslasmascotasvanalcielo.com`** y el slug **"Ángeles en el Cielo"**. El proyecto en `package.json` se llama `todos-los-perros-van-al-cielo`. Hay que unificar.

### 🟡 LO QUE NO SÉ AÚN

#### 2.10 `MuralHeroHeader.tsx`, `MuralTopNav.tsx`, `MuralBottomCTA.tsx`
No los he revisado a fondo pero por las capturas (Image 7 y 8) se ven bien. Probablemente reaprovechables visualmente. Antigravity puede inspirarse en ellos.

#### 2.11 `app/globals.css`
8 KB de CSS. Probablemente contenga utilities y variables del prompt maestro. Reaprovechable si está alineado con el CSS.docx oficial.

---

## 3. Discrepancias con las decisiones tomadas

| Decisión acordada | Estado en el código |
|---|---|
| 3 planes (1€ / 4,99€/año / 9,99€) | ❌ Actualmente 4 planes (Gratis / 2.99 / 4.99 / 7.99) |
| Slots 1 / 4 / 9 (bloques 1×1, 2×2, 3×3) | ❌ Actualmente 1 / 4 / 8 / 12 |
| Drawer/panel deslizante | ❌ Actualmente modal central |
| Stripe Checkout (mode: payment) | ❌ Sin integración |
| Supabase como DB | ❌ Mock data en código |
| 5 estados de slot | ❌ Hay 10 estados en el tipo |
| Slot pre-fijado → plan → datos → pago | ❌ Flujo actual mezcla orden |
| Pago único Estrella Anual + expires_at | ❌ Sin lógica de expiración |
| Email Resend + React Email | ❌ Sin sistema de email |
| Google Vision moderación | ❌ Sin moderación |
| Plausible analytics | ❌ Sin tracking |
| Stack canvas 2D virtualizado | ✅ Implementado |
| Zoom + pan suave | ✅ Implementado |
| Viewport visible filtering | ✅ Implementado |
| Premium zone destacada | ✅ Implementado (zona de la pezuña central) |

**Resumen:** la parte VISUAL y el RENDERING TÉCNICO están bastante bien. La parte de NEGOCIO y BACKEND no existe.

---

## 4. Recomendaciones para Antigravity

### 4.1 Estrategia recomendada: arrancar desde cero usando este código como referencia

**Por qué no evolucionar el actual:**
1. Tiene dos implementaciones del mural paralelas — confuso.
2. Los planes/precios/slots no coinciden con lo decidido.
3. El flujo de creación es modal, no drawer.
4. No tiene backend.
5. El naming es inconsistente (`lights` vs `slots`, `perros` vs `mascotas`, `tier` vs `plan_type`).

**Por qué referenciarlo:**
1. La matemática del canvas está bien.
2. Las plantillas visuales (drawer steps, floating card, premium badge) son una excelente base de diseño.
3. La paleta y composición visual ya está validada con las capturas.

### 4.2 Cómo presentarlo a Antigravity

Hay que adjuntarle estos archivos como **referencias técnicas**, NO como código a evolucionar:

**Mantener como referencia obligatoria:**
- `lib/mural/gridMath.ts` ← matemática canvas (reescribir alineado)
- `components/mural-global/MuralGlobalPage.tsx` líneas 147-365 ← canvas rendering (extraer a `MuralCanvas.tsx` limpio)
- `components/mural-global/MuralFloatingPetCard.tsx` ← diseño tarjeta perfil
- `components/mural-global/MuralUploadFlow.tsx` ← diseño de los steps del drawer
- `components/mural-global/MuralPremiumBadge.tsx` ← badge zona premium
- `components/mural-global/MuralZoomControls.tsx` ← controles zoom
- `app/globals.css` ← validar contra CSS.docx

**Descartar completamente:**
- `components/mural-global/MuralShell.tsx`
- `components/mural-global/MuralVirtualGrid.tsx`
- `lib/mural/mockPets.ts`
- `package.json` (rehacer con todas las deps nuevas: Supabase, Stripe, Resend, etc.)

### 4.3 Iconos disponibles en `/public/Iconos`

Ya hay iconos generados en el proyecto. Conviene auditarlos y decidir si Antigravity debe regenerarlos o reaprovecharlos.
