# Documento Técnico-Funcional v2
## Ángeles en el Cielo · MVP v2

> Este documento reemplaza al v1. Refleja la arquitectura definitiva: **todo el flujo de compra sucede dentro de `/mural-global` mediante un drawer deslizante**. La landing `/angeles-en-el-cielo` es la antesala emocional para usuarios nuevos.

---

## 1. Concepto

"Ángeles en el Cielo" es una experiencia memorial digital donde los dueños de mascotas fallecidas pueden:

- Crear un perfil público compartible de su mascota.
- Reservar un espacio físico (1, 4 o 9 slots) en un mural global de 1.000.000 de lugares.
- Compartir la historia y dejar que otros reaccionen.

La marca comunica: **"Cada foto guarda una historia. Cada historia deja una huella."**

---

## 2. Arquitectura de páginas

```
todaslasmascotasvanalcielo.com/
│
├─ /                                  Placeholder mínimo (futuras expansiones)
│
├─ /angeles-en-el-cielo               ★ LANDING EMOCIONAL (antesala)
│  └─ Hero + propuesta + planes + storytelling + prueba social
│     CTA único: "Darle su lugar en el Cielo" → /mural-global
│
├─ /angeles-en-el-cielo/[slug]        Perfil público de cada memorial
│
├─ /mural-global                      ★ DONDE SUCEDE TODO
│  ├─ Modo view (URL limpia): cualquiera puede visitar y explorar
│  └─ Modo select (drawer abierto): flujo de creación de memorial
│
├─ /gracias/[id]                      Confirmación emocional + share
├─ /eliminar/[token]                  Borrado GDPR auto-servicio
│
├─ /aviso-legal                       Páginas legales
├─ /privacidad
├─ /cookies
├─ /condiciones-contratacion
│
└─ /admin/moderacion                  Panel admin
```

### 2.1 Dos rutas de entrada al flujo

**Camino A — Usuario nuevo:**
```
Llega a /angeles-en-el-cielo (SEO, redes, boca a boca)
   ↓
Lee la propuesta, ve los planes, se enamora
   ↓
CTA "Darle su lugar en el Cielo" → /mural-global
   ↓
Explora el mural, decide su slot, hace click
   ↓
Se abre el drawer → flujo de 4 pasos
```

**Camino B — Usuario recurrente o por link directo:**
```
Llega directamente a /mural-global (no pasa por landing)
   ↓
Explora el mural libremente
   ↓
Click en slot libre o CTA "Darle su lugar"
   ↓
Se abre el drawer → flujo de 4 pasos
```

---

## 3. Modos del mural

| Aspecto | Modo `view` | Modo `select` (drawer abierto) |
|---|---|---|
| URL | `/mural-global` | `/mural-global` (drawer es overlay, no cambia URL) |
| Quién accede | Cualquiera | Quien inició el flujo de compra |
| Click slot ocupado | Modal con perfil del angelito | Igual |
| Click slot libre | Pre-fija slot + abre drawer | Selecciona ese slot |
| Zoom + pan | Sí | Sí (mural visible al fondo) |
| Stats visibles | Sí (50.015 ocupados / 949.985 libres) | Sí |

---

## 4. El mural

### 4.1 Especificaciones

- **Grid: 1000 × 1000 = 1.000.000 slots.**
- **Render: canvas 2D virtualizado** (solo pinta lo visible en el viewport).
- **Zoom: 0.1× a 10×.** A zoom bajo solo se ve color, a zoom alto se ven miniaturas de las fotos.
- **Pan con drag** (mouse + touch).
- **Zoom con wheel** (desktop) y pinch (mobile).

### 4.2 Estados de slot

| Estado | Significado | Visual |
|---|---|---|
| `available` | Libre, comprable | Cuadradito blanco translúcido con borde dashed |
| `reserved_pending_payment` | Reservado 15 min mientras se completa el pago | Color amarillo/azul con animación pulse |
| `occupied` | Comprado y publicado | Color del memorial (a zoom bajo) / miniatura foto (a zoom alto) |
| `blocked_admin` | Reservado por admin (zona destacada, fundadores futuro) | Color dorado con glow |
| `sponsor_private` | Patrocinador (futuro) | Estilo especial reservado |

### 4.3 Zona destacada

En el centro (coordenadas alrededor de 500, 500) hay una zona con forma de pezuña dorada. Los primeros memoriales se colocan ahí para que el mural se sienta vivo desde el día uno.

### 4.4 Stats visibles en el mural

```
Pezuña: X.XXX ocupados
Estrella: Y.YYY libres
Corazón: Z ángeles reales (los recientes, con miniatura visible)
```

---

## 5. Planes y precios

| Plan | Precio | Modalidad | Slots | Vigencia | Características |
|---|---|---|---|---|---|
| **Recuerdo Inicial** | 1,99 € | Pago único | 1 (1×1) | Indefinida | Perfil público, 1 foto, 1 lugar en mural |
| **Estrella Anual** ⭐ | 4,99 € | Pago único | 4 (bloque 2×2) | 365 días, renovable | Todo lo anterior + mayor presencia + renovación anual |
| **Recuerdo Eterno** | 9,99 € | Pago único | 9 (bloque 3×3) | Indefinida | Todo lo anterior + recuerdo eterno + mayor brillo |

**Stripe:** todos los planes en `mode: 'payment'` (pago único). Estrella Anual NO es subscription — se implementa con `expires_at` manual y cron de expiración. Esto evita la complejidad operativa de subscriptions.

### 5.1 Lógica de Estrella Anual

- Al pagar: `expires_at = now() + 365 días`.
- Email a 30, 7 y 0 días antes de expirar.
- Al expirar: slots se liberan, memorial pasa a `expired`.
- Email post-expiración: ofrece convertir a Recuerdo Eterno (9,99 €) o Recuerdo Inicial (1,99 €).

---

## 6. El drawer del flujo

Cuando el usuario hace click en un slot libre del mural (o en cualquier CTA "Darle su lugar"), se abre un **drawer deslizante** que ocupa el lateral derecho en desktop o todo el alto en mobile.

### 6.1 Los 5 pasos

**Stepper visual:** `1 · Plan   2 · Foto   3 · Historia   4 · Pago   5 · Gracias`

Estados del stepper: círculo numerado azul lleno = activo · check azul = completado · gris = pendiente.

#### **Step 1 — Plan + slot**

```text
Estado inicial: slot pre-fijado del click en el mural (col, row).

UI:
- Cabecera: "Añadir mi angelito al cielo"
- 3 cards de plan:
  · Recuerdo Inicial · 1,99 € · 1 slot
  · Estrella Anual · 4,99 €/año · 4 slots [El más elegido]
  · Recuerdo Eterno · 9,99 € pago único · 9 slots
- Vista previa de presencia en el mural:
  Mini-grid con recorte REAL del grid centrado en el slot elegido.
  El slot (y bloque completo si plan 4/9) destacado en dorado
  en su posición REAL, con vecinos reales visibles.
  Si bloque de 4/9 no cabe: auto-buscar bloque libre más cercano
  y proponerlo con mensaje "Hemos encontrado un espacio muy cerca."

Botón: "Continuar →"
```

#### **Step 2 — Foto + datos**

```text
- Subir foto (drag & drop, JPG/PNG/WEBP, máx 10MB)
  Validación automática Google Vision SafeSearch.
  Mensaje empático si falla moderación.
- Nombre del angelito (obligatorio)
- Fecha — cuando subió al cielo (obligatorio)
- Email (obligatorio)

Botones: "← Volver" / "Continuar →"
```

#### **Step 3 — Su historia** *(el paso emocional diferencial)*

```text
Layout DOS COLUMNAS:

COLUMNA IZQUIERDA (formulario):
- Título: "Cuéntanos su historia"
- Subtítulo: "Estas preguntas pueden ayudarte a encontrar las palabras."

4 preguntas visibles como INSPIRACIÓN (no son campos de texto):
  ✦ ¿Cómo llegó a tu vida?
  ✦ ¿Qué era lo que más le gustaba?
  ✦ ¿Qué huella dejó en tu corazón?
  ✦ ¿Qué le dirías si pudieras abrazarlo una vez más?

Campo único: "Dedicatoria (opcional)"
  Placeholder: "Escribe aquí lo que sientes...
                Deja que las preguntas te guíen."
  Textarea de 4-5 líneas visibles.

Checkbox obligatorio para continuar:
  ☐ Confirmo que tengo los derechos sobre esta imagen
     y acepto las políticas de uso.

COLUMNA DERECHA (preview en vivo):
- Tarjeta memorial que se actualiza en tiempo real.
- Foto subida en step 2 visible desde el inicio del step 3.
  (Placeholder con icono pezuña dorada si no hay foto.)
- Nombre + fecha del step 2.
- Dedicatoria actualizada letra a letra mientras escribe.
- Texto placeholder en cursiva: "Tu dedicatoria aparecerá aquí..."

Botones: "← Volver" / "Continuar →"
  (Continuar deshabilitado hasta marcar checkbox)
```

**Por qué este paso es el diferenciador emocional:**
La foto ya subida en step 2 está visible mientras el usuario escribe.
Las 4 preguntas actúan como detonador emocional sin obligar.
El usuario ve a su mascota mirándole mientras construye su recuerdo.
Es lo que distingue este memorial de una foto con nombre en cualquier otra web.

#### **Step 4 — Pago**

```text
- Resumen del plan elegido:
  Foto + nombre + precio + slots + duración
- Dedicatoria tal como quedó en step 3
- Bloque confianza Stripe:
  🔒 Pago seguro con Stripe
  CIFRADO · PROTEGIDO · 100% SEGURO

Botón principal: "Ir a Stripe Checkout ↗" (azul marino)
Botón secundario: "← Volver a datos"

Al pulsar "Ir a Stripe Checkout":
1. POST /api/checkout con memorial_id y plan_type
2. Sistema reserva slots 15 minutos
3. Redirect a Stripe Checkout Hosted
4. success_url = /gracias/{memorial_id}
   cancel_url = /mural-global?recovery={memorial_id}
```

#### **Step 5 — Gracias**

```text
NO está dentro del drawer. Es /gracias/[id] como página completa.

Background: mural canvas haciendo zoom progresivo al slot del
angelito recién publicado + destellos animados (el momento mágico).

Contenido:
- Título: "Tu angelito ya tiene su lugar en el cielo"
- Subtítulo: "Gracias por honrar su memoria con amor.
              Su luz brillará por siempre en nuestro mural."
- Tarjeta memorial generada
- Bloque de share:
  · Copiar enlace · Facebook · Instagram · WhatsApp
- Nota: "Te hemos enviado un email de confirmación"
- 3 botones: "Ver su homenaje" / "Compartir" / "Volver al mural"
```

### 6.2 Persistencia del borrador

Si el usuario cierra el drawer antes de completar:

- Step 1: nada se guarda.
- Step 2 completado: INSERT memorial con `payment_status='draft'` + cookie `memorial_id` httponly.
- Step 3 completado: UPDATE memorial con dedicatoria + respuestas.
- Step 4 iniciado: reserva slots 15 min + redirect Stripe.
- Cron diario: email de recuperación a drafts >12h pero <24h.
- Cron diario: borrar drafts >24h.

```text
Estado inicial: viene del click en un slot libre con coordenada (col, row).

UI:
- Cabecera: "Has elegido este lugar en el cielo"
- Mini-mapa del mural con el slot destacado
- 3 cards de plan:
  · Recuerdo Inicial · 1,99 € · Ocupa 1 slot
  · Estrella Anual · 4,99 €/año · Ocupa 4 slots [Más elegido]
  · Recuerdo Eterno · 9,99 € pago único · Ocupa 9 slots
- Al seleccionar plan de 4 o 9 slots:
  Sistema verifica is_block_available(col, row, size)
  Si SÍ: mini-mapa destaca el bloque completo
  Si NO: muestra "Hemos encontrado un espacio muy cerca" 
         con bloque alternativo destacado y opción "Buscar yo mismo"

Botón principal: "Continuar"
Botón secundario: "Volver al mural"
```

#### **Step 2 — Foto + Datos + Dedicatoria + Preview**

Sub-pasos visuales (scroll lineal dentro del drawer, no nuevos steps formales):

```text
2a. Sube su foto
    - Drag & drop o click
    - Formatos: JPG, PNG, WEBP
    - Máximo 10 MB
    - Cuadrada recomendada
    - Validación automática con Google Vision SafeSearch
    - Mensaje empático si falla moderación

2b. Cuéntanos sobre él
    - Nombre de la mascota (obligatorio)
    - Especie: perro / gato / conejo / pájaro / caballo / otro
    - Fecha de fallecimiento
    - Email (obligatorio, para confirmación + emails)

2c. Su historia (opcional, preguntas guiadas)
    - ¿Cómo llegó a tu vida?
    - ¿Qué era lo que más le gustaba?
    - ¿Qué huella dejó en tu corazón?
    - ¿Qué le dirías si pudieras abrazarlo una vez más?

2d. Dedicatoria (opcional)
    - Texto libre

2e. Preview emocional
    - Tarjeta con foto + nombre + dedicatoria
    - "Así se verá tu recuerdo en el cielo"

Botón principal: "Ir al pago" → step 3
Botón secundario: "Volver"
```

#### **Step 3 — Stripe Checkout**

```text
Sin UI propia. Al pulsar "Ir al pago":
1. POST /api/checkout con memorial_id y plan_type
2. Sistema crea Stripe Checkout Session
3. Sistema reserva los slots por 15 minutos (status='reserved_pending_payment')
4. Redirect a Stripe Checkout Hosted
5. Usuario paga
6. Stripe → success_url = /gracias/{memorial_id}
   o cancel_url = /mural-global?recovery={memorial_id} (recupera drawer)
```

#### **Step 4 — Confirmación**

```text
NO está dentro del drawer. Es /gracias/[id] como página propia.

Animación al cargar:
- Mural se centra en el slot del angelito recién publicado
- Zoom progresivo hacia el slot
- Destellos brotan del slot
- Aparece la tarjeta del angelito con su foto

Contenido:
- Mensaje: "Tu luz ya forma parte del mural"
- Tarjeta compartible descargable
- 6 botones de share:
  · Copiar enlace
  · WhatsApp
  · Instagram
  · TikTok
  · Descargar postal emocional
  · Volver al mural

Email automático enviado en este momento.
```

### 6.2 Persistencia del borrador

Si el usuario cierra el drawer antes de completar:

- En step 1: nada se guarda (no hay datos).
- En step 2 (parcial): se guarda `memorial` con `payment_status='draft'`, cookie `memorial_id` httponly.
- Si vuelve al sitio: drawer se abre en el step donde estaba (si la cookie sigue viva).
- Cron diario `/api/cron/draft-recovery`: envía email "Tu recuerdo de Luna te está esperando" a drafts >12h pero <24h.
- Cron diario: borra drafts >24h.

---

## 7. Modelo de datos (referencia)

> Ver detalle completo en el Anexo Técnico v2, sección 3.

### 7.1 Tabla `memorials`

```typescript
type Memorial = {
  id: string;
  email: string;
  
  petName: string;
  species: 'perro' | 'gato' | 'conejo' | 'pajaro' | 'caballo' | 'otro';
  photoUrl: string;
  
  deathDate: string;
  dedication?: string;
  storyAnswers: Record<string, string>;
  generatedStory?: string;
  
  planType: 'recuerdo_inicial' | 'estrella_anual' | 'recuerdo_eterno';
  pricePaid: number;
  slotsCount: 1 | 4 | 9;
  
  profileSlug: string;
  visibility: 'public' | 'private';
  
  paymentStatus: 'draft' | 'pending' | 'paid' | 'failed';
  publicationStatus: 'draft' | 'published' | 'archived' | 'expired';
  
  // Solo para plan_type='estrella_anual'
  expiresAt?: string | null;
  
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  
  // GDPR
  deletionToken: string;
  
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  
  createdAt: string;
  updatedAt: string;
};
```

### 7.2 Tabla `mural_slots`

```typescript
type MuralSlot = {
  id: string;
  x: number;             // 0-999
  y: number;             // 0-999
  status: 'available' | 'reserved_pending_payment' | 'occupied' | 'blocked_admin' | 'sponsor_private';
  memorialId?: string;
  reservedUntil?: string;
  planType?: 'recuerdo_inicial' | 'estrella_anual' | 'recuerdo_eterno';
};
```

---

## 8. Perfil público

Cada memorial tiene una URL pública: `/angeles-en-el-cielo/[slug]`.

Contenido:
- Foto grande de la mascota
- Nombre + fecha de fallecimiento
- Historia / dedicatoria
- Reacciones (4 tipos: huellita, estrella, corazón, luz)
- Comentarios (visibles + botón reportar)
- Botón "Compartir"
- Botón "Eliminar este recuerdo" (GDPR auto-servicio)
- Open Graph dinámico (tarjeta 1080×1080 generada con @vercel/og)

---

## 9. Eventos analytics (19)

| Evento | Cuándo | Service |
|---|---|---|
| `hero_cta_click` | Click CTA principal landing | Plausible + Supabase |
| `mural_explore_click` | Click "Explorar mural" | Plausible + Supabase |
| `mural_slot_clicked` | Click en cualquier slot del mural | Plausible + Supabase |
| `drawer_opened` | Drawer del flujo se abre | Plausible + Supabase |
| `plan_selected` | Usuario selecciona plan en step 1 | Plausible + Supabase |
| `photo_upload_started` | Empieza a subir foto | Plausible + Supabase |
| `photo_upload_completed` | Foto sube y pasa moderación | Plausible + Supabase |
| `basic_info_completed` | Termina campos básicos | Plausible + Supabase |
| `guided_questions_completed` | Termina preguntas guiadas | Plausible + Supabase |
| `preview_viewed` | Ve el preview emocional | Plausible + Supabase |
| `checkout_started` | Redirect a Stripe | Plausible + Supabase |
| `checkout_completed` | Webhook Stripe success | Supabase |
| `payment_failed` | Pago falla o expira | Supabase |
| `profile_created` | Memorial pasa a published | Supabase |
| `share_card_downloaded` | Descarga la postal | Plausible + Supabase |
| `profile_shared` | Click en cualquier botón share | Plausible + Supabase |
| `pet_card_opened` | Click en slot ocupado abre modal | Plausible + Supabase |
| `comment_added` | Nuevo comentario | Plausible + Supabase |
| `reaction_added` | Nueva reacción | Plausible + Supabase |

---

## 10. Checklist de aceptación

```text
LANDING /angeles-en-el-cielo
[ ] Hero emocional con perrito + gato + título Playfair
[ ] Subtítulo + frase tagline
[ ] 2 CTAs primarios: "Añadir mi angelito al cielo" y "Explorar el mural"
[ ] 3 cards de plan visibles con precios correctos (1,99€ / 4,99€ / 9,99€)
[ ] Mini-mural con foto previews
[ ] Stats: X.XXX ocupados / Y.YYY libres
[ ] Sección "Cuéntanos su historia" con 4 preguntas en cards
[ ] Sección "Elige cómo mantener su luz encendida" con 3 planes detallados
[ ] CTA final con bloque de imagen + botón
[ ] Footer con 4 valores: hecho con amor, privado, comunidad, siempre contigo
[ ] Responsive mobile

MURAL /mural-global
[ ] Canvas 1000×1000 = 1M slots
[ ] Zoom + pan suave (60 fps a zoom 1x)
[ ] Devicepixelratio scaling
[ ] Pinch zoom + pan en mobile
[ ] A zoom bajo: colores. A zoom alto (>2x): miniaturas de foto
[ ] Stats card flotante: ocupados / libres / ángeles reales
[ ] Buscador de mascotas por nombre
[ ] Leyenda: Libre / Ocupado / En reserva / Tu selección
[ ] Top nav: "Volver a la landing" / "Pantalla completa" / "Añadir mi mascota"
[ ] Botones zoom inferior derecha
[ ] Click en slot ocupado: modal con perfil
[ ] Click en slot libre: pre-fija slot + abre drawer
[ ] CTA permanente "Añadir su recuerdo"

DRAWER FLOW
[ ] Drawer entra desde derecha (desktop) o desde abajo (mobile)
[ ] Stepper visual (4 puntos animados)
[ ] Botón cerrar X
[ ] Step 1: Plan + Slot pre-fijado con mini-mapa
[ ] Step 1: Si bloque ocupado, auto-propone alternativa
[ ] Step 2a: Subida foto con drag&drop + moderación Vision
[ ] Step 2b: Datos básicos (nombre, especie, fecha, email)
[ ] Step 2c: Preguntas guiadas (opcionales)
[ ] Step 2d: Dedicatoria libre (opcional)
[ ] Step 2e: Preview emocional
[ ] Step 3: Redirect a Stripe Checkout hosted
[ ] Reserva temporal 15 min antes del redirect

POST-PAGO /gracias/[id]
[ ] Animación: zoom al slot publicado + destellos
[ ] Tarjeta compartible descargable
[ ] 6 botones share (copiar, whatsapp, instagram, tiktok, postal, mural)
[ ] Email confirmación enviado

BACKEND
[ ] Supabase con todas las tablas + RLS
[ ] Función SQL is_block_available + find_nearest_available_block
[ ] Stripe webhook verifica firma
[ ] Resend email confirmación
[ ] Google Vision moderación automática
[ ] @vercel/og tarjeta compartible
[ ] Cron release-expired (cada minuto)
[ ] Cron expire-annual (diario)
[ ] Cron expiration-warnings 30/7/0 (diario)
[ ] Cron draft-recovery (diario)
[ ] Cron anniversary (diario)

LEGAL / GDPR
[ ] Banner cookies mínimo (solo esenciales)
[ ] /aviso-legal accesible desde footer
[ ] /privacidad accesible desde footer
[ ] /cookies accesible desde footer
[ ] /condiciones-contratacion accesible desde footer
[ ] Borrado auto-servicio en perfil público (botón + email + confirmación)
[ ] Borrado completo: BD + Storage + tarjeta + comentarios + reacciones

PERFIL PÚBLICO /angeles-en-el-cielo/[slug]
[ ] Foto + nombre + fecha + historia
[ ] Reacciones (4 tipos)
[ ] Comentarios + botón reportar
[ ] Botón compartir
[ ] Botón eliminar (GDPR)
[ ] Open Graph dinámico funciona en WhatsApp/Twitter

ANALYTICS
[ ] Plausible embed sin cookies
[ ] 19 eventos personalizados registrados
[ ] Tabla analytics_events poblándose

SEO
[ ] sitemap.xml dinámico
[ ] robots.txt
[ ] meta tags en cada página
[ ] Open Graph en cada perfil

EXPERIENCIA
[ ] Errores empáticos (no técnicos)
[ ] El mural nunca se siente vacío (seed inicial)
[ ] Flujo emocional, no transaccional
```

---

## 11. Roadmap Fase 2 (post-MVP)

Una vez validado el MVP (conversión, retención, NPS), las siguientes oportunidades están priorizadas por impacto/coste:

### 11.1 Add-ons emocionales en el checkout (upsell)
**Prioridad: ALTA · Coste: BAJO · Time-to-market: 2 semanas**

Extras opcionales en el step de pago que aumentan el AOV (valor medio del pedido) capturando el momento de mayor receptividad emocional:

- **Vela virtual eterna** (+1 €) — animación de vela parpadeante permanente en el perfil
- **Postal premium descargable** (+1,99 €) — diseño PDF imprimible A4 con marco emocional
- **Mensaje aniversario personalizado** (+1,99 €) — email anual con frase única personalizada
- **Pack memorial completo** (+3,99 €) — combina los 3 anteriores

**Impacto esperado:** AOV +30-40%. Coste técnico: lógica de productos extra en Stripe + flags en `memorials`.

### 11.2 "Regala un recuerdo" (gifting)
**Prioridad: ALTA · Coste: MEDIO · Time-to-market: 3-4 semanas**

Funcionalidad para regalar un plan a otra persona (alguien que perdió a su mascota). Genera tarjeta digital con código + email al destinatario.

**Flujo:**
1. Quien regala elige plan + escribe mensaje personal
2. Paga con sus datos
3. Recibe link con tarjeta digital "Tu amigo X te regala…"
4. El destinatario abre el link → entra al drawer pre-pagado → solo sube foto y datos

**Impacto esperado:** captura segmento totalmente nuevo (amigos/familia consoladores). Conversión esperada 8-12% en visitantes que llegan vía link de regalo. Coste técnico: lógica de tokens de pago + nuevo flujo de email + página de canje.

### 11.3 Newsletter "Historias del Cielo"
**Prioridad: MEDIA · Coste: BAJO · Time-to-market: 1-2 semanas**

Newsletter quincenal con historias destacadas de la comunidad para visitantes que no compran inmediatamente (acaban de perder a su mascota, demasiado reciente, vuelven cuando están emocionalmente listos).

**Impacto esperado:** convierte tráfico SEO en audiencia recurrente. Tasa típica de conversión 30 días post-suscripción: 4-8%. Coste técnico: form en footer + integración Resend/Beehiiv + lógica de doble opt-in (GDPR).

### 11.4 Video memorial automático
**Prioridad: ALTA · Coste: MEDIO-ALTO · Time-to-market: 4-6 semanas**

Generar un video corto (15-30 s) post-pago con la foto + nombre + dedicatoria + música cielo + animación. Descargable y optimizado para TikTok/Reels (formato vertical 9:16).

**Por qué funciona:** TikTok/Reels de mascotas fallecidas es uno de los nichos más virales (búsqueda "rainbow bridge" en TikTok tiene 4.2B views). Cada video compartido es publicidad orgánica gratuita.

**Coste técnico:** integrar **Remotion** (React-to-video) en Lambda/Vercel, o servicio externo tipo **Bannerbear** / **Creatomate** (más fácil pero coste por render).

**Impacto esperado:** multiplicador viral. Si el 20% de usuarios comparte el video y cada video genera 1-2 visitas, CAC orgánico cae significativamente.

### 11.5 Productos físicos (marketplace de partners)
**Prioridad: MEDIA · Coste: ALTO · Time-to-market: 8-12 semanas**

Sin tener stock propio, integrar print-on-demand con partners (Printful, Gelato, Prodigi) para:

- **Lámina A3 con foto y dedicatoria** (15-25 € + envío) — margen ~40%
- **Llavero metálico foto grabada** (8-15 € + envío) — margen ~50%
- **Vela personalizada con foto** (12-20 € + envío) — margen ~45%
- **Placa conmemorativa jardín** (25-40 € + envío) — margen ~35%

**Por qué esperar:** lo digital ya valida la conversión emocional. Los productos físicos complementan con márgenes altos pero requieren partner logístico, gestión de devoluciones, fotos profesionales del producto y atención al cliente más compleja.

**Impacto esperado:** AOV +200-400% en quien convierte, pero conversión global más baja. Mejor verlo como una venta cruzada post-MVP.

### 11.6 Programa de afiliación con veterinarios
**Prioridad: ALTA (largo plazo) · Coste: ALTO · Time-to-market: 12-16 semanas**

Sistema B2B donde veterinarios ofrecen el servicio a familias cuyo animal acaba de fallecer. Comisión del 30-40% al vet por cada memorial creado vía su código único.

**Por qué es estratégico:** llega al usuario en el momento EXACTO de máxima receptividad (cuando el vet anuncia el fallecimiento). El vet añade valor a su servicio sin coste y monetiza.

**Requiere:**
- Landing B2B para vets (`/profesionales`)
- Panel de afiliación con tracking de comisiones
- Sistema de códigos únicos por vet
- Facturación mensual al vet
- Materiales offline para clínicas (tarjetas físicas con QR)
- Equipo de ventas / partnerships dedicado

**Impacto esperado:** canal de adquisición exponencial (un vet puede traer 5-20 memoriales/mes). Pero coste alto en gestión.

---

## 12. Pendientes técnicos fase 2

```text
- Cuenta de usuario completa con magic link login
- Panel privado del usuario (sus memoriales, sus reacciones)
- Edición avanzada del perfil post-publicación
- Renovar Estrella Anual con un click (desde email)
- IA generativa para mejorar dedicatorias (sugerencias opcionales)
- Moderación avanzada con cola priorizada por riesgo
- Sistema de patrocinadores (zonas especiales)
- Zonas de fundadores (early adopters)
- Dashboard de métricas público (transparencia)
- Multi-idioma (i18n): empezar por inglés y francés
- App móvil nativa (React Native)
- API pública para vets
```

