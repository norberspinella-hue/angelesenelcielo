# Instrucciones de arranque para Antigravity
## Ángeles en el Cielo · MVP v2

---

## 0. Contexto que recibirás

Estás construyendo **Ángeles en el Cielo**, una experiencia memorial digital para mascotas fallecidas. Los usuarios pueden crear perfiles públicos compartibles de su mascota y reservar un espacio (1, 4 o 9 slots) en un mural global de 1.000.000 de lugares.

**El proyecto se construye desde cero**, en UN SOLO proyecto Next.js 14 con App Router + TypeScript + Supabase + Stripe + Resend + Vercel.

**Dominio:** `todaslasmascotasvanalcielo.com`

---

## 1. Documentos que debes leer (orden estricto)

Lee los documentos en este orden, ANTES de escribir una sola línea de código:

| Orden | Documento | Qué define |
|---|---|---|
| 1 | `PROMPT_MAESTRO_VISUAL_ACTUALIZADO.docx` | Identidad visual: paleta, tipografía, espíritu emocional |
| 2 | `CSS.docx` | CSS exacto del proyecto (variables, clases, tokens) |
| 3 | `LANDING_ANGELES_EN_EL_CIELO.png` | Diseño visual referencia de la landing |
| 4 | Capturas del flujo (drawer, mural, stats) | Diseño visual referencia del mural y drawer |
| 5 | `documento_tecnico_funcional_v2.md` | QUÉ construir (lógica de negocio, flujos, copy) |
| 6 | `anexo_tecnico_implementacion_v2.md` | CÓMO construir (stack, esquema DB, integraciones) |
| 7 | `auditoria_mural_global_actual_v1.md` | Estado del código previo (REFERENCIA, no base) |
| 8 | `mural-global.zip` (código previo) | REFERENCIA técnica del canvas — NO copiar tal cual |

**Si hay conflicto entre documentos:** prevalece el de orden más bajo (visual > funcional > implementación > referencia).

---

## 2. Decisiones críticas que NO debes cuestionar

Estas decisiones ya están tomadas. NO las re-discutas:

1. **Un solo proyecto Next.js** (no separar landing y mural).
2. **App Router** (no Pages Router).
3. **Stripe en modo `payment`** para los 3 planes. Estrella Anual NO es subscription.
4. **3 planes**: 1 € / 4,99 €/año / 9,99 € — slots 1/4/9 (bloques 1×1, 2×2, 3×3).
5. **Precios SIEMPRE con IVA incluido** (España, B2C). Stripe Tax con `tax_behavior: 'inclusive'`.
6. **Todo el flujo de compra dentro de `/mural-global`** mediante drawer deslizante.
7. **NO hay página `/crear`** dedicada.
8. **NO pre-poblar** la tabla `mural_slots` con 1M de filas.
9. **NO crear cuenta de usuario** en MVP. Email + token suficiente.
10. **CSS del prompt maestro** define la identidad. Tailwind solo para utilities.
11. **Canvas 2D nativo** (no pixi.js, no WebGL).
12. **Supabase** para todo (DB + Storage + Auth futuro).
13. **Vercel** + region `fra1`.
14. **Plausible** (sin cookies de tracking).
15. **GDPR**: banner mínimo, borrado auto-servicio por token email.
16. **La raíz `/` es placeholder mínimo** (no redirige).
17. **Casilla obligatoria de derechos de imagen** en step 2 del drawer (protección legal).
18. **Tres buzones operativos** mínimos: `hola@`, `admin@`, `privacidad@`.

---

## 3. Orden recomendado de implementación

### Fase 0 — Setup (1-2 días)

```
[ ] Inicializar proyecto Next.js 14 + TypeScript + App Router
[ ] Configurar tailwind.config.js (solo utilities)
[ ] Copiar globals.css del prompt maestro
[ ] Configurar fuentes (Playfair Display + Inter via next/font)
[ ] Crear proyecto Supabase + obtener keys
[ ] Crear proyecto Vercel + variables de entorno
[ ] Configurar dominio en Vercel
[ ] Crear cuenta Stripe (test mode) + productos
[ ] Crear cuenta Resend + verificar dominio (SPF, DKIM, DMARC)
[ ] Crear API key Google Cloud Vision
[ ] Crear cuenta Plausible
```

### Fase 1 — Backend foundation (2-3 días)

```
[ ] Crear esquema SQL completo en Supabase (ver Anexo v2 sección 3)
[ ] Crear todas las tablas + enums + índices
[ ] Configurar RLS en todas las tablas
[ ] Crear buckets Storage (memorial-photos, shareable-cards)
[ ] Crear funciones SQL is_block_available, find_nearest_available_block
[ ] Generar types TypeScript con supabase gen types
[ ] Crear /lib/supabase/{client.ts, server.ts}
[ ] Crear /lib/stripe.ts, /lib/resend.ts, /lib/vision.ts
[ ] Probar conectividad con un endpoint /api/health
```

### Fase 2 — Landing /angeles-en-el-cielo (2 días)

```
[ ] PEDIR AL USUARIO el pantallazo Canva de la landing (LANDING_ANGELES_EN_EL_CIELO.png)
[ ] Pintar el diseño 1:1 con el pantallazo
[ ] Generar iconos SVG inline con el estilo del pantallazo
[ ] Hero + título + subtítulo + CTAs
[ ] 3 cards de planes
[ ] Mini-mural con fotos preview
[ ] Stats (50.000 ocupados / 950.000 disponibles)
[ ] Sección "Cuéntanos su historia"
[ ] Sección "Elige cómo mantener su luz encendida"
[ ] CTA final
[ ] Footer con 4 valores
[ ] Responsive mobile
[ ] CTA único hacia /mural-global
```

### Fase 3 — Mural canvas /mural-global (5-7 días, la pieza más compleja)

```
[ ] Crear /app/mural-global/page.tsx
[ ] Crear componente MuralCanvas con canvas 2D
   · REFERENCIA: lib/mural/gridMath.ts del código previo
   · REFERENCIA: MuralGlobalPage.tsx líneas 147-365
[ ] Implementar pan con drag (mouse + touch)
[ ] Implementar zoom con wheel + pinch
[ ] Carga progresiva de slots por viewport (SWR + /api/mural/slots)
[ ] Carga progresiva de miniaturas a zoom alto
[ ] Click slot ocupado → modal con perfil
[ ] Click slot libre → abre drawer con slot pre-fijado
[ ] Zona destacada centro (pezuña dorada)
[ ] Stats card flotante
[ ] Buscador de mascotas
[ ] Leyenda de estados de slot
[ ] Botones de zoom + centrar + fullscreen
[ ] Performance: 60 fps a zoom 1x
[ ] Mobile responsive
[ ] Seed inicial con golden ratio scatter (truco del código previo)
```

### Fase 4 — Drawer del flujo (3-4 días)

```
[ ] Crear MuralDrawer.tsx con framer-motion
   · Desktop: entrada desde derecha
   · Mobile: entrada desde abajo, fullscreen
[ ] DrawerStepper (4 puntos animados)
[ ] Step 1: Selección de plan + mini-mapa con slot pre-fijado
   · Auto-buscar bloque alternativo si plan 4/9 no cabe
[ ] Step 2a: Upload foto con drag&drop
   · Integración con /api/upload/photo (Google Vision)
[ ] Step 2b: Datos básicos
[ ] Step 2c: Preguntas guiadas
[ ] Step 2d: Dedicatoria
[ ] Step 2e: Preview emocional
[ ] Step 3: Redirect a Stripe Checkout
   · Reserva 15 min antes del redirect
[ ] Persistencia de borrador (cookie httponly + memorial_id)
[ ] Cerrar drawer y volver = recuperar estado
```

### Fase 5 — Checkout y confirmación (2 días)

```
[ ] /api/checkout/route.ts → crea Stripe session
[ ] /api/webhooks/stripe/route.ts → verifica firma + handler
[ ] /api/cron/release-expired (libera reservas >15 min)
[ ] /app/gracias/[id]/page.tsx
   · Animación zoom al slot del angelito
   · Tarjeta compartible (carga desde /api/og/[id])
   · 6 botones share
[ ] /api/og/[memorialId]/route.ts → @vercel/og
[ ] Generar tarjeta + guardar en bucket shareable-cards post-pago
[ ] Enviar email confirmación post-pago (Resend + React Email)
```

### Fase 6 — Estrella Anual + emails (2 días)

```
[ ] Lógica expires_at en webhook post-pago
[ ] /api/cron/expiration-warnings (30, 7, 0 días)
[ ] /api/cron/expire-annual (liberar slots + marcar expired)
[ ] Email post-expiración con CTAs de conversión
[ ] Plantillas React Email:
   · ConfirmationEmail
   · DraftRecoveryEmail
   · AnniversaryEmail
   · ExpirationWarning30d/7d/0d
   · PostExpirationConversion
   · DeletionTokenEmail
```

### Fase 7 — Perfiles públicos (2 días)

```
[ ] /app/angeles-en-el-cielo/[slug]/page.tsx
[ ] generateMetadata con Open Graph dinámico
[ ] Foto + historia + dedicatoria + datos
[ ] Reacciones (4 tipos: huellita, estrella, corazón, luz)
[ ] Comentarios con botón reportar
[ ] Botón "Eliminar este recuerdo" (GDPR)
[ ] /app/eliminar/[token]/page.tsx + lógica borrado completo
```

### Fase 8 — GDPR + legal + admin (2 días)

```
[ ] Banner cookies mínimo (localStorage flag)
[ ] /aviso-legal con placeholders [TITULAR], [NIF], etc.
[ ] /privacidad
[ ] /cookies
[ ] /condiciones-contratacion
[ ] /admin/moderacion (panel para revisar reportes y flags)
[ ] Auth admin (env var ADMIN_EMAIL + magic link Supabase)
```

### Fase 9 — Analytics + SEO (1 día)

```
[ ] Plausible embed en layout.tsx
[ ] /lib/analytics.ts con trackEvent()
[ ] Implementar los 19 eventos en su sitio
[ ] /api/events/route.ts → INSERT analytics_events
[ ] /app/sitemap.ts
[ ] /app/robots.ts
```

### Fase 10 — Testing + producción (3 días)

```
[ ] Ejecutar todos los tests del Anexo v2 sección 17
[ ] Stripe test → Stripe live
[ ] Configurar Resend dominio productivo
[ ] Lighthouse audit (objetivo >85 performance, >95 SEO)
[ ] Test compartir en WhatsApp/Twitter (Open Graph)
[ ] Test borrado GDPR end-to-end
[ ] Deploy a producción
[ ] Configurar Vercel Cron jobs
[ ] Monitor de errores con Vercel Analytics
```

---

## 4. Cosas que debes pedirme antes de empezar

Antes de la fase 2 (landing), **PIDE EXPLÍCITAMENTE**:

1. **Imagen PNG del diseño Canva de la landing** — necesaria para replicar 1:1.
2. **Capturas del mural funcionando** — para entender la estética del grid.
3. **Capturas del drawer (4 imágenes)** — para entender steps visuales.
4. **Imágenes hero, fondos, ilustración del perrito** — el usuario las tiene.

Si no recibes estas referencias, **NO inventes el diseño**. El usuario tiene una visión clara y los pantallazos son la fuente de verdad visual.

### 4.1 ⚠️ Mockups definitivos del drawer (NUEVA paleta, NO la rosa)

Los 5 archivos `Flujo_cta_*.png` son **los mockups DEFINITIVOS** del flujo de compra:

| Archivo | Contenido |
|---|---|
| `Flujo_cta_completo.png` | Vista general con drawer en cada step (overview) |
| `Flujo_cta_1.png` | Step 1 isolation: Plan + slot |
| `Flujo_cta_2.png` | Step 2 isolation: Datos + foto + preview |
| `Flujo_cta__3.png` | Step 3 isolation: Pago (Stripe summary) |
| `Flujo_cta__4.png` | Step 4 isolation: Gracias (NO drawer, página completa) |

**Estos mockups YA usan la paleta correcta** (azul marino + dorado pastel). Replícalos pixel-perfect:
- Composición, layout, copy, microcopy → **DEFINITIVO**.
- Paleta de colores → **DEFINITIVA** (ya es la correcta).
- Estructura de stepper, cards, botones → **DEFINITIVA**.
- Tipografías, espaciados, glassmorphism → **DEFINITIVOS**.

**IMPORTANTE — descartar mockups antiguos:** los archivos `flujo_cta_2/3/4/5.jpeg` con paleta rosa/magenta son OBSOLETOS. Si los ves en el material, **IGNÓRALOS**. Solo cuentan los `Flujo_cta_*.png` con paleta azul/dorado.

### 4.2 Background del drawer

**El drawer SIEMPRE se abre sobre el MURAL canvas**, NO sobre la landing.

En los mockups `Flujo_cta_*.png` el background es la landing porque los mockups muestran cómo se vería desde la landing. **Pero en producción real:**
- Usuario está en `/mural-global` (modo view).
- Click en slot libre o CTA → drawer abre.
- Detrás del drawer queda el mural canvas atenuado con overlay semi-transparente.
- Esto refuerza la sensación emocional "estoy poniendo a mi mascota aquí mismo".

### 4.3 Step 4 (Gracias) — Pagina completa, no drawer

**El step 4 NO es parte del drawer**, aunque el stepper lo muestre como un paso. Cuando el usuario completa el pago en Stripe:
- Redirect a `/gracias/[memorial_id]` (página completa Next.js).
- El stepper del mockup `Flujo_cta__4.png` es decorativo en esa página.
- Background de la página: **el MURAL haciendo zoom progresivo al slot del angelito recién publicado** con destellos animados. NO es la landing.
- Esto es **el momento mágico del producto** — no comprometer la calidad de esta animación.

Detalles completos en Anexo Técnico v2 sección 5.4 (step 4).

---

## 5. Cosas que NO debes hacer

- ❌ **No uses Tailwind para definir identidad visual.** Solo utilities (flex, grid, spacing).
- ❌ **No inventes iconos SVG sin ver el pantallazo del diseño.**
- ❌ **No crees una página `/crear` separada.** Todo es drawer dentro de `/mural-global`.
- ❌ **No uses Stripe subscriptions.** Todos los planes son `mode: 'payment'`.
- ❌ **No pre-popules `mural_slots`** con 1.000.000 de filas. Solo inserta al reservar.
- ❌ **No expongas `SUPABASE_SERVICE_ROLE_KEY` al cliente** bajo ningún concepto.
- ❌ **No copies código del proyecto previo tal cual.** Úsalo como REFERENCIA.
- ❌ **No mezcles `MuralShell` + `MuralVirtualGrid`** del código previo. Eran código muerto con divs. Usa el canvas de `MuralGlobalPage.tsx` como referencia.
- ❌ **No uses los planes del código previo** (1/4/8/12 con precios Gratis/2.99/4.99/7.99). Los correctos son los del documento técnico (1/4/9 con precios 1€/4,99€/9,99€).
- ❌ **No olvides verificar la firma del webhook Stripe.**
- ❌ **No muestres mensajes técnicos al usuario.** Errores siempre empáticos.
- ❌ **No crees cuenta de usuario en MVP.** Email + deletion_token son suficientes.

---

## 6. Cosas que SÍ debes hacer

- ✅ **Pide al usuario lo que necesites** antes de inventar.
- ✅ **Replica el diseño Canva al pixel** cuando lo recibas.
- ✅ **Usa el canvas como referencia técnica** del código previo (es lo único valioso).
- ✅ **Implementa devicePixelRatio** en el canvas.
- ✅ **Usa requestAnimationFrame** para pan/zoom (no setState directo).
- ✅ **Cachea miniaturas** con Map<id, HTMLImageElement>.
- ✅ **Errores empáticos:** "No hemos podido procesar esta imagen. ¿Puedes probar con otra?" en lugar de "Vision API returned LIKELY".
- ✅ **El mural NUNCA debe sentirse vacío.** Usa el truco golden ratio scatter para seed inicial (referencia: `mockPets.ts` del código previo).
- ✅ **Reserva 15 minutos antes del redirect a Stripe.**
- ✅ **Registra todo email en `email_logs`** (success o failure).
- ✅ **Genera la tarjeta compartible automáticamente** post-pago.
- ✅ **GDPR borrado completo:** memorial + foto Storage + tarjeta + comentarios + reacciones + logs.

---

## 7. Comunicación con el usuario

Durante la implementación:

- **Pregunta antes de inventar** decisiones de producto.
- **Muestra capturas o previews** de lo que vas construyendo para validación temprana.
- **Avisa cuando termines cada fase** con un resumen de lo entregado.
- **Reporta errores o decisiones técnicas que cambien lo escrito** en los documentos.

---

## 8. Stack final confirmado

```
Framework:        Next.js 14 App Router + TypeScript (strict)
DB + Storage:     Supabase (PostgreSQL + Storage + Auth)
Pagos:            Stripe Checkout (mode: payment)
Email:            Resend + React Email
Moderación:       Google Cloud Vision SafeSearch
Analytics:        Plausible + tabla analytics_events
Animaciones:      framer-motion
Tarjetas OG:      @vercel/og (edge runtime)
Hosting:          Vercel (region: fra1)
Estilos:          CSS prompt maestro + Tailwind utilities
Canvas:           Canvas 2D nativo (sin pixi.js)
Fuentes:          Playfair Display (display) + Inter (UI)
```

---

## 9. Recursos

- Documentación Supabase: https://supabase.com/docs
- Stripe Checkout: https://stripe.com/docs/payments/checkout
- React Email: https://react.email
- Resend: https://resend.com/docs
- @vercel/og: https://vercel.com/docs/functions/og-image-generation
- Plausible: https://plausible.io/docs

---

## 10. Pregunta clave inicial

Antes de empezar, confirma al usuario:

> "He leído todos los documentos. Antes de empezar la fase 0 (setup), ¿puedes pasarme:
> 1. El pantallazo Canva de la landing (`LANDING_ANGELES_EN_EL_CIELO.png`)
> 2. Las capturas del drawer del flujo (los 4 steps)
> 3. Las imágenes hero, fondos y la ilustración del perrito que ya tienes
> 4. ¿Quieres que el deploy productivo sea a `todaslasmascotasvanalcielo.com` o un subdomain de preview primero?"

Una vez recibida la información, procede con la fase 0 y reporta el progreso al usuario.

**Buena suerte. Construye algo bonito.**
