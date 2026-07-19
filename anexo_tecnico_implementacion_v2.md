# Anexo Técnico de Implementación v2
## Ángeles en el Cielo · MVP v2 · Proyecto único Next.js + Supabase

---

## 0. Propósito y contexto

Este documento es el **anexo técnico v2** del proyecto "Ángeles en el Cielo". Reemplaza al anexo v1 anterior y refleja la arquitectura definitiva acordada tras múltiples iteraciones de diseño:

- **Un solo proyecto Next.js** que contiene landing + mural + flujo de compra + perfiles públicos.
- **Dominio**: `todaslasmascotasvanalcielo.com`.
- **Arquitectura**: la landing (`/angeles-en-el-cielo`) es antesala emocional. El mural (`/mural-global`) es donde sucede TODO el flujo de compra mediante un drawer deslizante.
- **Stack**: Next.js 14 App Router + TypeScript + Supabase + Stripe + Resend + Plausible + Vercel.

**Documentos relacionados (jerarquía):**

1. **Prompt Maestro Visual** → manda en lo visual.
2. **Documento Técnico-Funcional v2** → manda en lógica de negocio y copy.
3. **Este Anexo Técnico v2** → manda en decisiones de implementación.
4. **Auditoría Mural Global Actual** → referencia de código existente (NO base evolutiva).

**Si hay conflicto, prevalece el documento de mayor jerarquía.**

---

## 1. Arquitectura del proyecto

### 1.1 Rutas del dominio

```
todaslasmascotasvanalcielo.com/
│
├─ /                                  ← placeholder mínimo (no redirigir, no expandir)
│
├─ /angeles-en-el-cielo               ← LANDING EMOCIONAL (antesala)
│  ├─ Hero + propuesta + planes + storytelling + prueba social
│  └─ CTA único: "Darle su lugar en el Cielo" → /mural-global
│
├─ /angeles-en-el-cielo/[slug]        ← perfil público de cada memorial
│
├─ /mural-global                      ← DONDE SUCEDE TODO
│  ├─ Canvas 1M slots + zoom + pan + miniaturas
│  ├─ Modo view: visitable libremente
│  ├─ Click slot ocupado → modal con perfil del angelito
│  ├─ Click slot libre o CTA → drawer deslizante con 4 pasos
│  └─ Drawer:
│      Step 1: Slot pre-fijado + selección de plan (1/4/9 slots)
│      Step 2: Subida foto + datos + dedicatoria + preview
│      Step 3: Stripe Checkout (redirect hosted)
│      Step 4: Vuelta con animación "tu angelito apareció en el mural"
│
├─ /gracias/[id]                      ← confirmación emocional + share
├─ /eliminar/[token]                  ← borrado auto-servicio GDPR
│
├─ /aviso-legal                       ← LSSI-CE
├─ /privacidad                        ← RGPD
├─ /cookies                           ← política de cookies
├─ /condiciones-contratacion          ← TyC compras
│
└─ /admin/moderacion                  ← panel admin (auth obligatoria)
```

### 1.2 La raíz `/`

**Decisión:** la raíz NO redirige. Es un placeholder mínimo (logo + tagline + link a `/angeles-en-el-cielo`). Reservada para futuras expansiones (blog, tienda, etc.).

### 1.3 Los dos modos del mural

| Aspecto | Modo `view` (URL: `/mural-global`) | Modo `select` (drawer abierto) |
|---|---|---|
| Cómo se llega | CTA desde landing, link directo, comparte | Click slot libre o CTA "Darle su lugar" |
| Qué hace el click en slot ocupado | Abre modal con perfil del angelito | Igual |
| Qué hace el click en slot libre | Pre-fija slot + abre drawer | Selecciona ese slot |
| Estado URL | Limpia | Misma URL (no se cambia, solo se abre drawer) |

**Implementación:** un solo componente `<MuralGlobal>`. El drawer es un overlay con `framer-motion` que entra desde la derecha (desktop) o sube desde abajo (mobile). El mural queda visible al fondo.

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | Next.js 14 (App Router) | NO Pages Router |
| Lenguaje | TypeScript (strict) | Sin `any` sin justificar |
| Estilos | CSS del prompt maestro + Tailwind utilities | Tailwind solo para utilities, no para definir identidad |
| Animaciones | framer-motion | Ya usado en el código actual, mantener |
| Base de datos | Supabase (PostgreSQL gestionado) | Con Row Level Security activado |
| Auth | Supabase Auth | MVP sin login: email obligatorio + token de borrado |
| Storage | Supabase Storage | Fotos de mascotas + tarjetas compartibles |
| Pagos | Stripe Checkout | Modo `payment` (pago único) para los 3 planes |
| Email | Resend | API key como variable de entorno |
| Plantillas email | React Email | Componentes JSX (no plantillas HTML) |
| Moderación imágenes | Google Cloud Vision SafeSearch | Automática + revisión manual |
| Analytics | Plausible | Sin cookies, sin GDPR banner por analítica |
| Hosting | Vercel | Region: `fra1` (Frankfurt) |
| Dominio | todaslasmascotasvanalcielo.com | |
| Canvas | Canvas 2D nativo + framer-motion | NO pixi.js (bundle pesado) |

### 2.1 Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_RECUERDO_INICIAL=
STRIPE_PRICE_ESTRELLA_ANUAL=
STRIPE_PRICE_RECUERDO_ETERNO=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@todaslasmascotasvanalcielo.com

# Google Cloud Vision
GOOGLE_VISION_API_KEY=

# Plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=todaslasmascotasvanalcielo.com

# App
NEXT_PUBLIC_APP_URL=https://todaslasmascotasvanalcielo.com

# Emails operativos
ADMIN_EMAIL=admin@todaslasmascotasvanalcielo.com           # recibe reportes moderación + alertas
SUPPORT_EMAIL=hello@todaslasmascotasvanalcielo.com          # contacto público (footer, emails)
PRIVACY_EMAIL=privacidad@todaslasmascotasvanalcielo.com    # ejercicio derechos RGPD
```

### 2.2 Configuración de emails operativos

El proyecto necesita **al menos 3 buzones operativos** configurados en el proveedor de email del dominio (puede ser uno solo con aliases):

| Buzón | Función | Dónde aparece |
|---|---|---|
| `hello@todaslasmascotasvanalcielo.com` | Remitente de TODOS los emails transaccionales (Resend) + soporte usuario | Resend `from`, footer, "Contacto" |
| `admin@todaslasmascotasvanalcielo.com` | Recibe alertas moderación, errores webhooks, reportes admin | Solo interno (no se muestra al usuario) |
| `privacidad@todaslasmascotasvanalcielo.com` | Solicitudes RGPD (ejercicio derechos manuales) | `/privacidad` y `/aviso-legal` |

**Recomendación:** todos pueden ser **aliases redirigidos al mismo buzón real** mientras el proyecto es pequeño. Cuando crezca, se separan.

**DNS necesario en el dominio:**
- SPF: incluir Resend
- DKIM: configurar según Resend dashboard
- DMARC: política `quarantine` mínimo
- MX records: configurar proveedor (Google Workspace, Zoho, ProtonMail, etc.)

---

## 3. Esquema de base de datos Supabase

### 3.1 Tabla `memorials`

```sql
create type plan_type as enum ('recuerdo_inicial', 'estrella_anual', 'recuerdo_eterno');
create type payment_status as enum ('draft', 'pending', 'paid', 'failed');
create type publication_status as enum ('draft', 'published', 'archived', 'expired');
create type species_type as enum ('perro', 'gato', 'conejo', 'pajaro', 'caballo', 'otro');
create type visibility_type as enum ('public', 'private');

create table memorials (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  email           text not null,

  pet_name        text not null,
  species         species_type not null,
  photo_url       text not null,

  death_date      date not null,
  dedication      text,

  story_answers   jsonb not null default '{}'::jsonb,
  generated_story text,

  plan_type       plan_type not null,
  price_paid      numeric(8,2) not null,
  currency        text not null default 'EUR',
  slots_count     int not null check (slots_count in (1, 4, 9)),

  profile_slug    text unique not null,
  visibility      visibility_type not null default 'public',

  reactions_count int not null default 0,
  comments_count  int not null default 0,

  payment_status      payment_status not null default 'draft',
  publication_status  publication_status not null default 'draft',

  -- Solo plan_type='estrella_anual' (paid_at + 365 días).
  expires_at      timestamptz,

  -- Stripe references
  stripe_session_id        text,
  stripe_payment_intent_id text,

  -- GDPR: token de borrado auto-servicio
  deletion_token  uuid default gen_random_uuid(),

  -- Moderación
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes  text,

  -- Confirmación de derechos de imagen (T.3 — protección legal)
  rights_confirmed_at timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_memorials_slug         on memorials(profile_slug);
create index idx_memorials_email        on memorials(email);
create index idx_memorials_pub_status   on memorials(publication_status);
create index idx_memorials_expires_at   on memorials(expires_at)
  where expires_at is not null;
```

### 3.2 Tabla `mural_slots`

```sql
create type slot_status as enum (
  'available', 'reserved_pending_payment', 'occupied',
  'blocked_admin', 'sponsor_private'
);

create table mural_slots (
  id              uuid primary key default gen_random_uuid(),
  x               int not null check (x >= 0 and x < 1000),
  y               int not null check (y >= 0 and y < 1000),
  status          slot_status not null default 'available',
  memorial_id     uuid references memorials(id) on delete set null,
  reserved_until  timestamptz,
  plan_type       plan_type,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique(x, y)
);

create index idx_slots_status        on mural_slots(status);
create index idx_slots_coords        on mural_slots(x, y);
create index idx_slots_memorial      on mural_slots(memorial_id);
create index idx_slots_reserved      on mural_slots(reserved_until)
  where status = 'reserved_pending_payment';
```

**Nota crítica:** NO se pre-popula la tabla con 1M filas vacías. Solo se inserta cuando un slot cambia de estado distinto a `available`. Cualquier `(x, y)` ausente = implícitamente `available`.

### 3.3 Tablas adicionales

```sql
-- Comentarios públicos
create type comment_status as enum ('visible', 'pending_moderation', 'reported', 'hidden');

create table memorial_comments (
  id           uuid primary key default gen_random_uuid(),
  memorial_id  uuid not null references memorials(id) on delete cascade,
  author_name  text not null,
  author_email text,
  message      text not null,
  status       comment_status not null default 'visible',
  ip_hash      text,
  created_at   timestamptz not null default now()
);

-- Reacciones
create type reaction_type as enum ('huellita', 'estrella', 'corazon', 'luz');

create table memorial_reactions (
  id           uuid primary key default gen_random_uuid(),
  memorial_id  uuid not null references memorials(id) on delete cascade,
  type         reaction_type not null,
  user_id      uuid references auth.users(id) on delete set null,
  ip_hash      text,
  created_at   timestamptz not null default now(),
  unique (memorial_id, type, ip_hash)
);

-- Analytics complementarios a Plausible
create table analytics_events (
  id           uuid primary key default gen_random_uuid(),
  event_name   text not null,
  memorial_id  uuid references memorials(id) on delete set null,
  metadata     jsonb,
  session_id   text,
  ip_hash      text,
  created_at   timestamptz not null default now()
);

-- Logs de emails enviados
create type email_type as enum (
  'confirmation', 'draft_recovery', 'anniversary',
  'expiration_warning_30d', 'expiration_warning_7d', 'expiration_warning_0d',
  'post_expiration_conversion', 'deletion_token', 'moderation_alert'
);

create table email_logs (
  id           uuid primary key default gen_random_uuid(),
  memorial_id  uuid references memorials(id) on delete set null,
  to_email     text not null,
  type         email_type not null,
  resend_id    text,
  status       text not null,
  sent_at      timestamptz not null default now()
);

create index idx_comments_memorial on memorial_comments(memorial_id);
create index idx_comments_status   on memorial_comments(status);
create index idx_reactions_memorial on memorial_reactions(memorial_id);
create index idx_events_name        on analytics_events(event_name);
create index idx_events_created     on analytics_events(created_at desc);
```

### 3.4 Row Level Security (RLS)

```sql
alter table memorials enable row level security;
alter table mural_slots enable row level security;
alter table memorial_comments enable row level security;
alter table memorial_reactions enable row level security;

-- memorials: público lee solo publicados; resto pasa por service_role
create policy "public_reads_published" on memorials for select
  using (publication_status = 'published' and visibility = 'public' and moderation_status = 'approved');
create policy "owner_reads_own" on memorials for select
  using (auth.uid() = user_id);

-- mural_slots: público lee todo (necesario para pintar el mural)
create policy "public_reads_slots" on mural_slots for select using (true);

-- comments: público lee los visibles
create policy "public_reads_visible_comments" on memorial_comments for select
  using (status = 'visible');

-- reactions: público lee todas
create policy "public_reads_reactions" on memorial_reactions for select using (true);

-- TODAS las escrituras pasan por route handlers server-side con service_role.
```

### 3.5 Supabase Storage buckets

```text
Bucket: memorial-photos
  - Pública: NO (signed URLs)
  - Tamaño máximo: 8 MB
  - MIME: image/jpeg, image/png, image/webp
  - Inserción: solo server-side con service_role
  - Path: /memorials/{memorial_id}/photo.{ext}

Bucket: shareable-cards
  - Pública: SÍ (son por definición compartibles)
  - Generadas server-side post-pago con @vercel/og
  - Path: /cards/{memorial_id}.png
```

### 3.6 Función SQL: búsqueda de bloques disponibles

```sql
-- Verifica si un bloque NxN está totalmente libre
create or replace function is_block_available(
  start_x int, start_y int, block_size int
) returns boolean language plpgsql stable as $$
declare occupied_count int;
begin
  if start_x < 0 or start_y < 0 or
     start_x + block_size > 1000 or
     start_y + block_size > 1000 then return false; end if;

  select count(*) into occupied_count
  from mural_slots
  where x >= start_x and x < start_x + block_size
    and y >= start_y and y < start_y + block_size
    and status != 'available';

  return occupied_count = 0;
end;
$$;

-- Encuentra el bloque libre más cercano a una coordenada
-- (búsqueda en espiral, máx 50 radio)
create or replace function find_nearest_available_block(
  target_x int, target_y int, block_size int, max_radius int default 50
) returns table(x int, y int) language plpgsql stable as $$
declare r int := 0; dx int; dy int;
begin
  while r <= max_radius loop
    for dx in -r..r loop
      for dy in -r..r loop
        if abs(dx) = r or abs(dy) = r then
          if is_block_available(target_x + dx, target_y + dy, block_size) then
            x := target_x + dx; y := target_y + dy;
            return next; return;
          end if;
        end if;
      end loop;
    end loop;
    r := r + 1;
  end loop;
  return;
end;
$$;
```

---

## 4. Render del mural — Canvas + Zoom/Pan

### 4.1 Decisión arquitectónica

**Canvas 2D nativo + framer-motion para overlay.** NO pixi.js, NO WebGL, NO DOM elements para slots.

**Referencia:** el código actual de `MuralGlobalPage.tsx` (líneas 147-365) ya implementa esto correctamente. Antigravity debe **extraer esa lógica en un componente limpio** `<MuralCanvas>`, no copiarla tal cual.

### 4.2 Parámetros del canvas

```typescript
const GRID_COLS = 1000;
const GRID_ROWS = 1000;
const TOTAL_SLOTS = 1_000_000;

const BASE_SLOT = 8;          // tamaño base a zoom 1x: 8px
const MIN_ZOOM = 0.1;         // zoom mínimo: vista completa
const MAX_ZOOM = 10;          // zoom máximo: cada slot 80px (miniaturas legibles)
const ZOOM_FACTOR = 1.15;     // sensibilidad zoom wheel/pinch

// Centro del mural = zona destacada con la pezuña dorada
const PREMIUM_CENTER = { x: 500, y: 500 };
```

### 4.3 Render strategy

```typescript
// Pseudocódigo del render
function render(ctx, viewport, slotsData) {
  const slotSize = BASE_SLOT * viewport.zoom;
  const gap = Math.max(0.5, slotSize * 0.08);
  const cell = slotSize - gap;

  // 1. Calcular viewport visible
  const colStart = Math.max(0, Math.floor(-viewport.x / slotSize));
  const colEnd = Math.min(999, colStart + Math.ceil(canvasWidth / slotSize) + 1);
  const rowStart = Math.max(0, Math.floor(-viewport.y / slotSize));
  const rowEnd = Math.min(999, rowStart + Math.ceil(canvasHeight / slotSize) + 1);

  // 2. Limpiar canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 3. Pintar slots visibles
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      const slot = slotsData.get(`${col},${row}`);
      const sx = viewport.x + col * slotSize;
      const sy = viewport.y + row * slotSize;

      if (!slot || slot.status === 'available') {
        // Slot libre: cuadradito blanco translúcido con borde dashed
        drawAvailableSlot(ctx, sx, sy, cell);
      } else if (slot.status === 'occupied') {
        if (viewport.zoom >= 2) {
          // Zoom alto: dibuja miniatura de la foto
          drawPhotoThumbnail(ctx, sx, sy, cell, slot.photoUrl);
        } else {
          // Zoom bajo: solo color
          drawColorSlot(ctx, sx, sy, cell, slot.color);
        }
      } else if (slot.status === 'reserved_pending_payment') {
        drawReservedSlot(ctx, sx, sy, cell);
      }
    }
  }
}
```

### 4.4 Carga progresiva de datos

```typescript
// Endpoint: GET /api/mural/slots?x1=0&y1=0&x2=100&y2=100
// Devuelve solo slots NO available en esa región

const { data } = await supabase
  .from('mural_slots')
  .select('x, y, status, memorial_id')
  .gte('x', x1).lte('x', x2)
  .gte('y', y1).lte('y', y2)
  .neq('status', 'available');

// Client-side cache con SWR, invalidación cada 60s
const slots = useSWR(
  `/api/mural/slots?x1=${x1}&y1=${y1}&x2=${x2}&y2=${y2}`,
  fetcher,
  { refreshInterval: 60_000 }
);
```

### 4.5 Carga de miniaturas (a zoom alto)

```typescript
// Endpoint: GET /api/mural/thumbnails?memorial_ids=id1,id2,id3
// Devuelve URLs firmadas de Supabase Storage

// En canvas: solo cargar miniaturas para slots visibles
// Cache local con Map<memorialId, HTMLImageElement>
// Lazy load: solo si zoom >= 2

const thumbnailCache = new Map<string, HTMLImageElement>();

function loadThumbnail(memorialId, url) {
  if (thumbnailCache.has(memorialId)) return thumbnailCache.get(memorialId);
  const img = new Image();
  img.src = url;
  img.onload = () => { thumbnailCache.set(memorialId, img); triggerRedraw(); };
  return null;
}
```

### 4.6 Interacciones

```typescript
// Click → convertir a coordenadas grid
function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const col = Math.floor((mx - viewport.x) / slotSize);
  const row = Math.floor((my - viewport.y) / slotSize);

  if (col < 0 || col >= 1000 || row < 0 || row >= 1000) return;

  const slot = slotsData.get(`${col},${row}`);
  if (slot?.status === 'occupied') {
    openPetCard(slot.memorial_id);
  } else {
    openDrawerWithPreSelectedSlot(col, row);
  }
}

// Wheel zoom (anchor al cursor)
function handleWheel(e) {
  e.preventDefault();
  const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
  const newZoom = clamp(viewport.zoom * factor, MIN_ZOOM, MAX_ZOOM);
  const newX = mouseX - (mouseX - viewport.x) * (newZoom / viewport.zoom);
  const newY = mouseY - (mouseY - viewport.y) * (newZoom / viewport.zoom);
  setViewport({ x: newX, y: newY, zoom: newZoom });
}

// Pan con drag
function handleMouseDown(e) { /* ... */ }
function handleMouseMove(e) { /* requestAnimationFrame throttled */ }

// Touch pinch + pan (mobile)
function handleTouchStart(e) { /* gestion 1 dedo = pan, 2 dedos = pinch */ }
```

### 4.7 Performance

```text
Optimizaciones obligatorias:
- devicePixelRatio scaling (canvas.width = size * dpr, ctx.scale(dpr, dpr))
- requestAnimationFrame para pan/zoom (no setState directo en mousemove)
- Cache de slots data con SWR
- Cache de miniaturas en Map (no recrear Image objects)
- Solo redibujar cuando cambia viewport o slots data
- En mobile: capturar evento touch para evitar scroll de página

Capping:
- Si hay más de 5000 slots visibles a la vez, considerar reducir calidad de miniaturas
- Throttle a 60 fps máximo (16ms entre redraws)
```

---

## 5. El drawer del flujo de creación

### 5.1 Decisión

El flujo NO está en una ruta separada (`/crear`). Es un **drawer/panel deslizante** que se abre sobre `/mural-global`. La URL no cambia (solo añade query param opcional `?step=1` para deeplinks).

### 5.0 Mockups definitivos del drawer

Existen 5 archivos de referencia que Antigravity DEBE replicar pixel-perfect:

```text
Flujo_cta_completo.png    ← vista general con drawer en cada step (overview)
Flujo_cta_1.png           ← Step 1 isolation: Plan + slot
Flujo_cta_2.png           ← Step 2 isolation: Datos + foto + preview
Flujo_cta__3.png          ← Step 3 isolation: Pago (Stripe checkout summary)
Flujo_cta__4.png          ← Step 4 isolation: Gracias (pantalla completa, no drawer)
```

**Reglas de interpretación de estos mockups:**

1. **Layout, composición, copy, tipografía, paleta, iconografía: DEFINITIVOS — replicar 1:1.**
2. **Background detrás del drawer en los mockups (la landing):** ES DECORATIVO DEL MOCKUP. En producción el drawer SIEMPRE se abre sobre el MURAL, no sobre la landing.
3. **Stepper visual de 4 puntos** numerados 1-2-3-4 con etiquetas Plan+slot / Datos y preview / Pago / Gracias: DEFINITIVO.
4. **Estados del stepper:** punto azul lleno = activo, check azul = completado, punto gris = pendiente.
5. **Step 4 NO es parte del drawer.** Es una página completa `/gracias/[id]` (ver sección 5.5).

### 5.1 Decisión arquitectónica reconfirmada

El flujo NO está en una ruta separada (`/crear`). Es un **drawer/panel deslizante** que se abre sobre `/mural-global`. La URL no cambia (solo añade query param opcional `?step=N` para deeplinks o recuperación).

**Background del drawer:** SIEMPRE el mural canvas, atenuado con overlay semi-transparente. NO es la landing. Esto refuerza la sensación emocional de "estoy poniendo a mi mascota aquí mismo, en este mural".

### 5.2 Estructura del drawer

```typescript
// /components/mural/MuralDrawer.tsx

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedSlot: { x: number; y: number } | null;
}

function MuralDrawer({ isOpen, onClose, preSelectedSlot }: DrawerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);  // Step 4 es página aparte
  const [draft, setDraft] = useState<DraftMemorial>({});

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="drawer-overlay"
          initial={{ x: '100%' }}       // desktop: entra desde derecha
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        >
          <DrawerStepper currentStep={step} totalSteps={4} />
          <DrawerCloseButton onClose={onClose} />
          
          {step === 1 && <StepPlanAndSlot {...} />}
          {step === 2 && <StepDataAndPreview {...} />}
          {step === 3 && <StepCheckoutSummary {...} />}
          {/* Step 4 NO va aquí — es /gracias/[id] */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 5.3 Comportamiento responsive

```css
/* Desktop: drawer lateral derecho */
@media (min-width: 1024px) {
  .drawer-overlay {
    width: 600px;
    height: 100vh;
    right: 0;
    top: 0;
    border-radius: 32px 0 0 32px;
  }
}

/* Mobile: drawer fullscreen desde abajo */
@media (max-width: 1023px) {
  .drawer-overlay {
    width: 100%;
    height: 100vh;
    border-radius: 32px 32px 0 0;
  }
}
```

### 5.4 Los 4 pasos (según mockups definitivos)

#### **Step 1 — Plan + slot** (ver `Flujo_cta_1.png`)

```text
Cabecera del drawer:
- Icono estrella + "Añadir mi angelito al cielo" + botón X de cerrar
- Stepper visual: 1 activo (azul lleno) · 2-3-4 pendientes
- Etiquetas: "Plan + slot" / "Datos y preview" / "Pago" / "Gracias"

Contenido:
- Título: "Paso 1 — Elige tu plan y tu slot"
- Subtítulo: "Elige tu plan y la presencia de tu angelito en el mural."

3 cards horizontales con planes:
┌─ Recuerdo Inicial ─┐  ┌─ Estrella Anual ─┐  ┌─ Recuerdo Eterno ─┐
│ 1,99 €            │  │ 4,99 € /año      │  │ 9,99 €            │
│ 1 slot            │  │ 4 slots          │  │ 9 slots           │
│ [⭐ 1 estrella]    │  │ [⭐⭐⭐⭐ grid 2×2] │  │ [⭐ grid 3×3]      │
└───────────────────┘  └──────────────────┘  └───────────────────┘
Card seleccionada: borde dorado más grueso

Vista previa de presencia en el mural:
- Mini grid 10×2 de cuadraditos representando un trozo del mural
- Los slots del bloque elegido destacados en dorado (1, 4 o 9 según plan)
- Icono ⓘ con tooltip explicando dónde caerán

Botón "Continuar →" (azul marino primario)
```

**Lógica subyacente:**
- Estado de entrada: slot pre-fijado del click previo en el mural (col, row).
- Al seleccionar plan de 4 o 9 slots:
  - Sistema verifica si el bloque desde (col, row) cabe libre con `is_block_available()`.
  - Si SÍ: el mini-mapa destaca el bloque completo.
  - Si NO: llama a `find_nearest_available_block()`, propone bloque alternativo con mini-overlay "Hemos encontrado un espacio muy cerca".

---

#### **Step 2 — Datos y preview** (ver `Flujo_cta_2.png`)

```text
Cabecera:
- Stepper: 1 ✓ · 2 activo · 3-4 pendientes

Título: "Paso 2 — Foto, datos, dedicatoria, preview"
Subtítulo: "Completa los datos de tu angelito y crea su recuerdo en el mural."

Layout en DOS COLUMNAS dentro del drawer:

┌─ Columna izquierda: FORMULARIO ─┐    ┌─ Columna derecha: PREVIEW EN VIVO ─┐
│ Foto de tu angelito              │    │ Preview de tu recuerdo              │
│ ┌──────────────┐                 │    │ ┌────────────────────────┐         │
│ │ ☁ Subir foto │ (drag&drop)    │    │ │ [foto del angelito]    │         │
│ │ JPG o PNG    │                 │    │ │ con halo + pezuña      │         │
│ │ máx 10MB     │                 │    │ │                        │         │
│ └──────────────┘                 │    │ │  Luna                  │         │
│                                  │    │ │  12/04/2016            │         │
│ Nombre de tu angelito            │    │ │                        │         │
│ [Luna___________________] 🐾     │    │ │  "Gracias por cada     │         │
│                                  │    │ │   día de amor          │         │
│ Fecha                            │    │ │   incondicional.       │         │
│ [12/04/2016] 📅                  │    │ │   Siempre en mi        │         │
│                                  │    │ │   corazón."            │         │
│ Plan seleccionado                │    │ └────────────────────────┘         │
│ ⭐ Estrella Anual  4,99€/año     │    │                                     │
│ 4 slots incluidos [⭐⭐⭐⭐]       │    │ (Se actualiza en tiempo real        │
│                                  │    │  conforme el usuario escribe)       │
│ Dedicatoria (opcional)           │    │                                     │
│ [textarea ───────────────────]   │    │                                     │
│                                  │    │                                     │
│ ☐ Confirmo derechos de imagen ←  │    │                                     │
│    (T.3 obligatorio)             │    │                                     │
└──────────────────────────────────┘    └─────────────────────────────────────┘

Botones inferiores:
- [← Volver] (secundario)
- [Continuar →] (primario azul, deshabilitado hasta marcar derechos)
```

**Lógica subyacente:**
- Upload de foto dispara `POST /api/upload/photo` con Google Vision moderación.
- Preview en columna derecha se actualiza en tiempo real con `useState` + render reactivo.
- Casilla derechos (T.3): obligatoria. Guarda `rights_confirmed_at` timestamp al marcar.
- Nombre, fecha, dedicatoria → guardados en draft en `memorials` con `payment_status='draft'`.

---

#### **Step 3 — Pago** (ver `Flujo_cta__3.png`)

```text
Cabecera:
- Stepper: 1 ✓ · 2 ✓ · 3 activo · 4 pendiente

Título: "Paso 3 — Stripe Checkout (redirect)"
Subtítulo: "Estás a un paso de completar tu homenaje. Revisa tu selección antes de continuar."

Card de resumen del plan:
┌────────────────────────────────────────────────────────────┐
│ [foto angelito]   Recuerdo Estrella Anual  [Plan seleccionado] │
│                   👤 Precio    📅 Slots    ⏱ Duración           │
│                   4,99€/año    4 slots     1 año                │
└────────────────────────────────────────────────────────────┘

Card de dedicatoria (lectura):
┌────────────────────────────────────────────────────────────┐
│ Dedicatoria                                                  │
│ "Gracias por cada día de amor incondicional.                 │
│  Siempre en mi corazón." ✨                                  │
└────────────────────────────────────────────────────────────┘

Bloque de confianza Stripe:
┌────────────────────────────────────────────────────────────┐
│ 🔒 Pago seguro con Stripe                                    │
│ Serás redirigido a Stripe Checkout para completar           │
│ tu pago de forma segura.                                    │
│                                                              │
│              [logo stripe]                                   │
│                                                              │
│ 🔐 Conexión cifrada  🛡 Tus datos protegidos  ✓ Pago 100% seguro │
└────────────────────────────────────────────────────────────┘

Botón principal: "Ir a Stripe Checkout ↗" (azul marino)
Botón secundario: "← Volver a datos"
```

**Lógica subyacente:**
- Al pulsar "Ir a Stripe Checkout":
  1. POST `/api/checkout` con `memorial_id` y `plan_type`.
  2. Sistema **reserva los slots por 15 min** (`status='reserved_pending_payment'`).
  3. Sistema crea Stripe Checkout Session (`mode: 'payment'`).
  4. Redirect a `session.url`.
- success_url = `/gracias/{memorial_id}?session_id={CHECKOUT_SESSION_ID}`
- cancel_url = `/mural-global?recovery={memorial_id}` (vuelve y recupera drawer en step 3).

---

#### **Step 4 — Gracias** (ver `Flujo_cta__4.png`)

```text
⚠️ ESTE STEP NO ES PARTE DEL DRAWER. Es página completa /gracias/[id].

URL: /gracias/{memorial_id}

Background: el MURAL (no la landing).
- El canvas hace zoom progresivo hasta el slot del angelito recién publicado.
- El slot se ilumina con destellos suaves animados (framer-motion).
- Esto es EL momento mágico del producto.

Foreground: contenido emocional sobre el mural atenuado.

Cabecera (igual que landing):
- Logo "Ángeles en el Cielo" izquierda
- Nav: Cómo funciona · Planes · Mural · Historias · Ayuda
- "Iniciar sesión" + "Añadir mi angelito" (azul)

Hero de la página:
- Icono pezuña con halo dorado
- Título grande Playfair: "Tu angelito ya tiene su lugar en el cielo"
- Subtítulo: "Gracias por honrar su memoria con amor."
- Subtítulo 2: "Su luz brillará por siempre en nuestro mural."

Bloque doble:
┌─ Tarjeta memorial generada ─┐  ┌─ Comparte su recuerdo ──────────┐
│ [foto angelito]              │  │ Comparte su recuerdo            │
│ Luna                         │  │ para que su luz llegue más lejos│
│ 12/04/2016 — ∞               │  │                                 │
│ "Siempre en mi corazón."     │  │ 🔵 Facebook  📷 Instagram       │
│                              │  │ 💚 WhatsApp  🔗 Copiar enlace   │
└──────────────────────────────┘  └─────────────────────────────────┘

Bloque de confirmación email:
┌──────────────────────────────────────────────────────────────────┐
│ ✉ Te hemos enviado un email de confirmación                       │
│   Revisa tu bandeja de entrada para ver tu homenaje y compartirlo │
│   siempre que quieras.                                             │
└──────────────────────────────────────────────────────────────────┘

3 botones inferiores:
- [⭐ Ver su homenaje] (primario azul) → /angeles-en-el-cielo/{slug}
- [⤴ Compartir] (secundario)
- [♥ Volver al mural] (secundario)
```

**Lógica subyacente:**
- La página se carga tras `success_url` del webhook Stripe.
- Webhook `checkout.session.completed` ya disparó:
  - Update memorial → `payment_status='paid'`, `publication_status='published'`.
  - Slots → `status='occupied'`.
  - Tarjeta compartible generada con `@vercel/og`.
  - Email de confirmación enviado vía Resend.
- La página `/gracias/[id]` solo:
  - Muestra el resultado.
  - Anima el zoom del mural al slot publicado.
  - Ofrece compartir.

### 5.5 Persistencia del borrador

**Crítico:** el usuario puede cerrar el drawer en cualquier paso. Hay que poder recuperar.

```typescript
// Cookie httponly con memorial_id en draft
// Si el usuario vuelve, drawer se abre en el step donde estaba

// Estrategia:
// Step 1 completado → INSERT memorial con payment_status='draft'
// Step 2 completado → UPDATE memorial con foto/datos
// Step 3 iniciado → reserva slots 15min + STRIPE redirect
// Webhook stripe.completed → UPDATE payment_status='paid', publication_status='published'

// Si cierra el drawer en step 2:
// - Mantenemos memorial_id en cookie
// - Email de recuperación al día siguiente (cron job)
// - Borrar drafts >24h en cron
```

---

## 6. Stripe — Configuración

### 6.1 Productos (crear en Stripe dashboard)

**IMPORTANTE: todos los precios incluyen IVA español (21%).** Por imperativo legal B2C en España, los precios mostrados al consumidor final SIEMPRE deben ser IVA incluido. Configurar en Stripe:

- `tax_behavior: 'inclusive'` en los Price objects.
- Activar Stripe Tax si está disponible y configurar región España.
- En el checkout NO mostrar desglose tipo "9,99 € + IVA". Mostrar solo "9,99 €" final.
- En las páginas legales (`/condiciones-contratacion`) indicar explícitamente "Precios con IVA incluido".

```text
Producto: Recuerdo Inicial
  Precio: 1.99 EUR · one-time · tax_behavior: inclusive
  Metadata: { slug: "recuerdo_inicial", slots: 1 }

Producto: Estrella Anual
  Precio: 4.99 EUR · one-time · tax_behavior: inclusive  ← NO subscription
  Metadata: { slug: "estrella_anual", slots: 4, expires_days: 365 }

Producto: Recuerdo Eterno
  Precio: 9.99 EUR · one-time · tax_behavior: inclusive
  Metadata: { slug: "recuerdo_eterno", slots: 9 }
```

**Para la contabilidad/facturación:** Stripe Tax genera automáticamente las facturas con desglose IVA si está configurado. Stripe envía recibo al email del cliente con el desglose interno para sus registros. El usuario ve precio final, el titular (autónomo/empresa) ve desglose IVA en su dashboard.

### 6.2 Creación de Checkout Session

```typescript
// /app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { memorialId, planType } = await req.json();
  const memorial = await getMemorial(memorialId);
  
  const priceId = {
    recuerdo_inicial: process.env.STRIPE_PRICE_RECUERDO_INICIAL,
    estrella_anual: process.env.STRIPE_PRICE_ESTRELLA_ANUAL,
    recuerdo_eterno: process.env.STRIPE_PRICE_RECUERDO_ETERNO,
  }[planType];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',  // NO subscription
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/gracias/${memorialId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/mural-global?recovery=${memorialId}`,
    customer_email: memorial.email,
    metadata: { memorial_id: memorialId, plan_type: planType },
    expires_at: Math.floor(Date.now() / 1000) + 15 * 60,
    locale: 'es',
  });

  return Response.json({ url: session.url });
}
```

### 6.3 Webhook crítico

```typescript
// /app/api/webhooks/stripe/route.ts
export const runtime = 'nodejs';  // Stripe SDK requires Node

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook signature invalid', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'checkout.session.expired':
    case 'payment_intent.payment_failed':
      await releaseReservedSlots(event.data.object);
      break;
  }
  return Response.json({ received: true });
}

async function handlePaymentSuccess(session) {
  const memorialId = session.metadata.memorial_id;
  const planType = session.metadata.plan_type;
  
  // Update memorial
  const updateData: any = {
    payment_status: 'paid',
    publication_status: 'published',
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent,
    updated_at: new Date().toISOString(),
  };
  
  // Solo Estrella Anual: setear expires_at
  if (planType === 'estrella_anual') {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);
    updateData.expires_at = expiresAt.toISOString();
  }
  
  await supabase.from('memorials').update(updateData).eq('id', memorialId);
  
  // Confirmar slots como occupied
  await supabase.from('mural_slots')
    .update({ status: 'occupied', reserved_until: null })
    .eq('memorial_id', memorialId);
  
  // Generar tarjeta compartible
  await generateShareableCard(memorialId);
  
  // Enviar email de confirmación
  await sendConfirmationEmail(memorialId);
}
```

### 6.4 Reserva temporal de 15 minutos

```sql
-- Al iniciar el step 3 (antes del redirect a Stripe)
-- Para cada slot del bloque:
insert into mural_slots (x, y, status, memorial_id, reserved_until, plan_type)
values ($1, $2, 'reserved_pending_payment', $3, now() + interval '15 minutes', $4)
on conflict (x, y) do update
  set status = 'reserved_pending_payment',
      memorial_id = excluded.memorial_id,
      reserved_until = excluded.reserved_until,
      plan_type = excluded.plan_type,
      updated_at = now()
  where mural_slots.status = 'available';
```

### 6.5 Cron de liberación de reservas

```sql
-- /api/cron/release-expired (cada minuto)
update mural_slots
set status = 'available',
    memorial_id = null,
    reserved_until = null,
    plan_type = null,
    updated_at = now()
where status = 'reserved_pending_payment'
  and reserved_until < now();
```

---

## 7. Lógica de expiración del plan Estrella Anual

### 7.1 Al pagarse

`expires_at = now() + 365 days` (ver webhook arriba).

### 7.2 Emails de aviso (Vercel Cron diario)

```sql
-- A 30, 7 y 0 días de expiración:
select id, email, pet_name, expires_at
from memorials
where plan_type = 'estrella_anual'
  and publication_status = 'published'
  and expires_at::date = (current_date + interval 'X days')::date;
```

Cada match dispara email vía Resend → registro en `email_logs`.

### 7.3 Al expirar (Vercel Cron diario)

```sql
-- 1. Marcar memoriales expirados
update memorials
set publication_status = 'expired', updated_at = now()
where plan_type = 'estrella_anual'
  and publication_status = 'published'
  and expires_at < now();

-- 2. Liberar slots
update mural_slots
set status = 'available', memorial_id = null, plan_type = null, updated_at = now()
where memorial_id in (
  select id from memorials where publication_status = 'expired'
);
```

### 7.4 Email post-expiración

Después de marcar como `expired`, enviar email `post_expiration_conversion`:

```text
Asunto: El recuerdo de Luna ha vuelto al cielo

Querida María,

El año juntos ha terminado. Pero el amor por Luna no.

Si quieres que su luz vuelva a brillar en el mural, tienes dos opciones:

[Recuerdo Eterno · 9,99 €] · Su lugar para siempre, sin caducidad.
[Recuerdo Inicial · 1,99 €] · Volver a tener un slot en el mural.

Gracias por mantener viva su memoria,
El equipo de Ángeles en el Cielo
```

---

## 8. Moderación de imágenes — Google Vision

### 8.1 Cuándo se ejecuta

Al subirse la foto en el step 2, ANTES de crearse el memorial publicado.

### 8.2 Implementación

```typescript
// /app/api/upload/photo/route.ts
import { ImageAnnotatorClient } from '@google-cloud/vision';

export const runtime = 'nodejs';

const visionClient = new ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_VISION_API_KEY,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('photo') as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // 1. SafeSearch
  const [result] = await visionClient.safeSearchDetection({
    image: { content: buffer },
  });
  const { adult, violence, racy } = result.safeSearchAnnotation!;
  
  const isUnsafe =
    ['LIKELY', 'VERY_LIKELY'].includes(adult!) ||
    ['LIKELY', 'VERY_LIKELY'].includes(violence!) ||
    ['VERY_LIKELY'].includes(racy!);
  
  if (isUnsafe) {
    return Response.json(
      { error: 'No hemos podido procesar esta imagen. ¿Puedes probar con otra foto de tu mascota?' },
      { status: 400 }
    );
  }
  
  // 2. Subir a Supabase Storage
  const memorialId = formData.get('memorialId') as string;
  const ext = file.name.split('.').pop();
  const path = `memorials/${memorialId}/photo.${ext}`;
  
  const { data, error } = await supabase.storage
    .from('memorial-photos')
    .upload(path, buffer, { contentType: file.type });
  
  if (error) return Response.json({ error: error.message }, { status: 500 });
  
  // 3. Actualizar memorial con photo_url
  const { data: { publicUrl } } = supabase.storage
    .from('memorial-photos').getPublicUrl(path);
  
  await supabase.from('memorials')
    .update({ photo_url: publicUrl, moderation_status: 'approved' })
    .eq('id', memorialId);
  
  return Response.json({ photoUrl: publicUrl });
}
```

### 8.3 Reportes y revisión manual

- Botón "Reportar" en cada perfil público → crea entry con `moderation_status = 'flagged'`.
- Admin recibe email con link a `/admin/moderacion`.
- Panel admin: lista filtrable por status, acciones aprobar/rechazar.

---

## 9. Emails — Resend + React Email

### 9.1 Templates

```text
/emails/
  layouts/
    HeavenLayout.tsx              ← layout base celestial (paleta + serif Playfair)
  templates/
    ConfirmationEmail.tsx         ← post-pago
    DraftRecoveryEmail.tsx        ← borrador abandonado (cron diario)
    AnniversaryEmail.tsx          ← aniversario fallecimiento
    ExpirationWarning30dEmail.tsx
    ExpirationWarning7dEmail.tsx
    ExpirationWarning0dEmail.tsx
    PostExpirationConversionEmail.tsx
    DeletionTokenEmail.tsx        ← borrado GDPR auto-servicio
    ModerationAlertEmail.tsx      ← admin alert
```

### 9.2 Envío

```typescript
import { Resend } from 'resend';
import ConfirmationEmail from '@/emails/templates/ConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Ángeles en el Cielo <hello@todaslasmascotasvanalcielo.com>',
  to: memorial.email,
  subject: `${memorial.petName} ya tiene su lugar en el Cielo`,
  react: ConfirmationEmail({ memorial }),
});

// Registrar SIEMPRE en email_logs (success o failure)
await supabase.from('email_logs').insert({
  memorial_id: memorial.id,
  to_email: memorial.email,
  type: 'confirmation',
  resend_id: data?.id,
  status: error ? 'failed' : 'sent',
});
```

### 9.3 DNS

Antes de producción: configurar SPF, DKIM, DMARC siguiendo guía de Resend dashboard.

---

## 10. Tarjeta compartible — @vercel/og

```typescript
// /app/api/og/[memorialId]/route.ts
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req, { params }) {
  const memorial = await getMemorial(params.memorialId);
  
  return new ImageResponse(
    (
      <div style={{
        width: 1080, height: 1080,
        background: 'linear-gradient(180deg, #FFF8F4 0%, #F8C7D8 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 60,
      }}>
        {/* Foto circular */}
        <img src={memorial.photo_url} 
             style={{ width: 400, height: 400, borderRadius: 200, objectFit: 'cover' }} />
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 72, marginTop: 40 }}>
          {memorial.pet_name}
        </h1>
        <p style={{ fontSize: 36, fontStyle: 'italic', marginTop: 20 }}>
          {memorial.dedication || 'Un angelito que dejó huella'}
        </p>
        <p style={{ fontSize: 24, marginTop: 40 }}>
          todaslasmascotasvanalcielo.com
        </p>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
```

Tras pago confirmado, llamar a este endpoint y guardar el resultado en bucket `shareable-cards`. URL pública sirve como:
- `og:image` del perfil
- Botón "Descargar postal" en step 4
- Adjunto en email de confirmación

---

## 11. SEO y Open Graph

### 11.1 Metadata dinámica

```typescript
// /app/angeles-en-el-cielo/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const memorial = await getMemorialBySlug(params.slug);
  const cardUrl = `${APP_URL}/api/og/${memorial.id}`;
  
  return {
    title: `${memorial.pet_name} ya tiene su lugar en Ángeles en el Cielo`,
    description: `Un recuerdo creado para ${memorial.pet_name}. Cada foto guarda una historia. Cada historia deja una huella.`,
    openGraph: {
      title: `${memorial.pet_name} ya tiene su lugar en Ángeles en el Cielo`,
      images: [{ url: cardUrl, width: 1080, height: 1080 }],
      type: 'profile',
    },
    twitter: { card: 'summary_large_image', images: [cardUrl] },
  };
}
```

### 11.2 Sitemap

```typescript
// /app/sitemap.ts
export default async function sitemap() {
  const memorials = await getPublicMemorials();
  return [
    { url: `${APP_URL}/angeles-en-el-cielo`, priority: 1.0 },
    { url: `${APP_URL}/mural-global`, priority: 0.95 },
    ...memorials.map(m => ({
      url: `${APP_URL}/angeles-en-el-cielo/${m.profile_slug}`,
      lastModified: m.updated_at,
      priority: 0.7,
    })),
  ];
}
```

---

## 12. Analytics — Plausible + Supabase

### 12.1 Plausible embed

```typescript
// /app/layout.tsx
<Script
  defer
  data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
  src="https://plausible.io/js/script.tagged-events.js"
/>
```

**Plausible NO usa cookies → no requiere banner de consentimiento por analítica.**

### 12.2 Eventos personalizados (19 del doc técnico)

```typescript
// /lib/analytics.ts
export function trackEvent(name: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(name, { props });
  }
  fetch('/api/events', {
    method: 'POST',
    body: JSON.stringify({ event_name: name, metadata: props }),
  });
}
```

Eventos: `hero_cta_click`, `mural_explore_click`, `mural_slot_clicked`, `drawer_opened`, `plan_selected`, `photo_upload_started`, `photo_upload_completed`, `basic_info_completed`, `guided_questions_completed`, `preview_viewed`, `checkout_started`, `checkout_completed`, `payment_failed`, `profile_created`, `share_card_downloaded`, `profile_shared`, `pet_card_opened`, `comment_added`, `reaction_added`.

---

## 13. GDPR — Cookies, privacidad, borrado

### 13.1 Banner de cookies (mínimo)

```text
"Usamos cookies esenciales para que la web funcione. No usamos cookies de marketing ni rastreamos a nadie."
[Entendido] [Política de cookies →]
```

Aparece UNA vez por dispositivo. Persistencia con `localStorage.heaven_consent_seen = '1'`. No es cookie.

### 13.2 Borrado auto-servicio (RGPD art. 17)

```text
Flujo:
1. Botón "Eliminar este recuerdo" en perfil público.
2. Formulario: pide email del creador.
3. Si email coincide con memorials.email → enviar email con link:
   https://todaslasmascotasvanalcielo.com/eliminar/{deletion_token}
4. Click en link → pantalla confirmación con preview del memorial.
5. Click "Sí, eliminar" → 
   - DELETE memorial (cascade → comments, reactions)
   - DELETE archivo de Storage
   - DELETE tarjeta compartible
   - UPDATE slots → available
   - INSERT email_logs (deletion_token sent)
   - Email "El recuerdo de Luna ha sido eliminado"
```

### 13.3 Borradores legales (4 páginas)

#### `/aviso-legal` (LSSI-CE art. 10)

```markdown
# Aviso legal

## 1. Datos del titular
- Titular: [TITULAR]
- NIF/CIF: [NIF]
- Domicilio: [DIRECCIÓN]
- Email: [EMAIL_CONTACTO]
- Sitio web: https://todaslasmascotasvanalcielo.com

## 2. Objeto
Las presentes condiciones regulan el uso del sitio web https://todaslasmascotasvanalcielo.com, del que es titular [TITULAR]. El Sitio Web ofrece una experiencia memorial digital para mascotas fallecidas mediante perfiles públicos compartibles dentro del Mural de Ángeles en el Cielo, así como servicios accesorios.

## 3. Condiciones de uso
El acceso es gratuito. La creación de un memorial requiere el pago de uno de los planes ofrecidos.

El usuario se compromete a no:
- Publicar contenido ilícito, ofensivo o que vulnere derechos de terceros.
- Subir imágenes de las que no posea derechos.
- Suplantar identidades o realizar fraude.

## 4. Propiedad intelectual
El usuario conserva la propiedad intelectual de las fotos y textos subidos, pero concede a [TITULAR] una licencia no exclusiva, gratuita y mundial para mostrarlos en el Sitio Web mientras el memorial esté publicado.

## 5. Responsabilidad
[TITULAR] no se hace responsable de los contenidos publicados por los usuarios. Retirará cualquier contenido denunciado contrario a la ley o a estas condiciones.

## 6. Legislación aplicable
Legislación española. Juzgados del domicilio del consumidor.

Última actualización: [FECHA].
```

#### `/privacidad` (RGPD)

```markdown
# Política de privacidad

## 1. Responsable
- Responsable: [TITULAR] · NIF/CIF: [NIF] · Domicilio: [DIRECCIÓN] · Email: [EMAIL_CONTACTO]

## 2. Datos recogidos
- Email (obligatorio).
- Nombre, especie, fecha de fallecimiento, foto de la mascota.
- Historia y dedicatoria.
- IP anonimizada (hash SHA-256) anti-spam.

## 3. Finalidades
- Publicar el memorial.
- Enviar email de confirmación de pago.
- Enviar email de aniversario.
- Enviar enlace de eliminación.
- Avisos de expiración (plan Estrella Anual).
- Prevenir abuso.

Base legal: ejecución del contrato (art. 6.1.b RGPD) para operacionales; consentimiento (art. 6.1.a) para aniversario.

## 4. Conservación
- Memoriales publicados: hasta solicitud de eliminación o expiración.
- Borradores no pagados: 24 horas.
- Logs de email: 12 meses.

## 5. Encargados de tratamiento (todos con DPA)
- Supabase (DB + Storage) — servidores en UE.
- Stripe (pagos) — Cláusulas Contractuales Tipo UE.
- Resend (emails) — Cláusulas Contractuales Tipo UE.
- Google Cloud Vision (moderación) — Cláusulas Contractuales Tipo UE.
- Vercel (hosting) — servidores en UE (Frankfurt).
- Plausible (analítica anónima) — servidores en UE (Alemania).

NO vendemos tus datos.

## 6. Tus derechos (RGPD)
- Acceso, rectificación, supresión, limitación, oposición, portabilidad, retirar consentimiento.
- Botón "Eliminar este recuerdo" en cada perfil público (autoservicio).
- Reclamación ante la AEPD: www.aepd.es.
- Contacto: [EMAIL_CONTACTO]

## 7. Menores
Web dirigida a mayores de 14 años.

Última actualización: [FECHA].
```

#### `/cookies`

```markdown
# Política de cookies

Solo usamos **cookies estrictamente necesarias**. No usamos cookies de marketing ni de seguimiento.

| Cookie | Finalidad | Duración | Tipo |
|---|---|---|---|
| `__supabase_session` | Sesión (si crea cuenta futura) | Sesión | Esencial |
| Stripe (en checkout) | Procesar pago | Sesión | Esencial |

`heaven_consent_seen` se guarda en localStorage (no es cookie).

Usamos **Plausible Analytics** (sin cookies, sin tracking individual).

Última actualización: [FECHA].
```

#### `/condiciones-contratacion`

```markdown
# Condiciones de contratación

## 1. Prestador
[TITULAR] · [NIF] · [DIRECCIÓN] · [EMAIL_CONTACTO].

## 2. Productos y precios

| Plan | Precio (IVA incluido) | Modalidad | Vigencia |
|---|---|---|---|
| Recuerdo Inicial | 1,99 € | Pago único | Indefinida |
| Estrella Anual | 4,99 € | Pago único | 365 días, renovable manualmente |
| Recuerdo Eterno | 9,99 € | Pago único | Indefinida |

## 3. Pago
Stripe. [TITULAR] no almacena datos de pago.

## 4. Derecho de desistimiento
**NO aplicable** (art. 103.m RD 1/2007) por ejecución inmediata de contenido digital con consentimiento expreso.

Al pagar, el usuario acepta expresamente esto.

## 5. Reembolsos
Solo en caso de error técnico o pago duplicado, en los 14 días siguientes, escribiendo a [EMAIL_CONTACTO].

## 6. Estrella Anual
365 días de vigencia. Tras expiración: slots liberados, memorial archivado. Avisos a 30, 7 y 0 días. Opción de conversión a Recuerdo Eterno o Inicial.

Última actualización: [FECHA].
```

---

## 14. Iconos SVG — Generación temporal

### 14.0 Identidad visual unificada (CRÍTICO)

**Decisión de paleta:** TODA la web (landing + mural + drawer + step 4 gracias + perfiles + emails) usa la paleta **azul marino + dorado pastel** del diseño oficial.

**Referencias visuales DEFINITIVAS:**

| Archivo | Define |
|---|---|
| `LANDING_ANGELES_EN_EL_CIELO.png` | Landing `/angeles-en-el-cielo` |
| `Flujo_cta_completo.png` | Vista general del drawer en todos los steps |
| `Flujo_cta_1.png` | Drawer Step 1 (Plan + slot) |
| `Flujo_cta_2.png` | Drawer Step 2 (Datos + preview) |
| `Flujo_cta__3.png` | Drawer Step 3 (Pago) |
| `Flujo_cta__4.png` | Página `/gracias/[id]` |

**TODOS estos mockups usan la misma paleta**. No hay conflicto de colores. Antigravity debe replicarlos pixel-perfect.

**Paleta principal extraída de los mockups:**

```text
Color                  HEX aproximado    Uso
──────────────────────────────────────────────────────────────────
Azul marino primario   #1E2A78           CTAs principales, títulos
Azul marino oscuro     #151C5C           Hover states
Crema claro            #FFF8F4           Backgrounds de cards
Crema medio            #F5E6D3           Gradientes de fondo
Dorado pastel          #C9A961           Acentos, bordes, iconos
Dorado claro           #E5C88A           Halos, glows
Cielo lila pastel      #C8B8E8           Fondos cielo
Cielo rosa pastel      #F4D4D9           Fondos cielo
Blanco translúcido     rgba(255,255,255,0.6)  Cards glassmorphism
Texto principal        #1E2A78           Mismo azul que primario
Texto secundario       #6B7280           Grises suaves
```

**Decisión histórica documentada:** los mockups antiguos del drawer (archivos `flujo_cta_2/3/4/5.jpeg`) usaban una paleta rosa/magenta. Fueron descartados. Los actuales `Flujo_cta_*.png` son los definitivos.

### 14.1 Instrucción para Antigravity

Los iconos definitivos serán generados por el usuario más adelante. Antigravity genera **placeholders SVG inline** replicando el estilo de la imagen PNG del diseño Canva de la landing `/angeles-en-el-cielo` (`LANDING_ANGELES_EN_EL_CIELO.png`).

**Antigravity debe:**
1. Observar la imagen PNG adjunta del diseño de la landing.
2. Identificar el estilo de los iconos visibles (corazón, pezuña, estrella, mariposa, etc.).
3. Replicar trazo, paleta, ángulos, redondez y efectos glow.
4. Generar SVGs consistentes entre sí (no mezclar estilos).

### 14.2 Iconos disponibles en el repo actual

El proyecto pre-existente tiene 5 iconos en `/public/Iconos/`:
- `paw.svg`
- `pawrosa.svg`
- `corazon.svg`
- `star.svg`
- `star.png`

**Antigravity puede reaprovecharlos si están alineados con el diseño Canva**, o regenerar si no lo están.

### 14.3 Lista de iconos a generar

```text
/components/icons/
  IconPezuna.tsx        ← Pezuña dorada con glow (PRINCIPAL del proyecto)
  IconPezunaRosa.tsx    ← Variante rosa
  IconCorazon.tsx       ← Corazón con halo
  IconAlas.tsx          ← Alas suaves
  IconEstrella.tsx      ← Estrella dorada
  IconMariposa.tsx      ← Mariposa
  IconDestello.tsx      ← Sparkle / brillo
  IconVela.tsx          ← Vela / luz
  IconFoto.tsx          ← Cámara / foto
  IconMural.tsx         ← Grid
  IconCompartir.tsx
  IconLuz.tsx           ← Reacción
  IconHuellita.tsx      ← Reacción
  IconEliminar.tsx      ← Papelera suave
  IconEditar.tsx
```

Props comunes: `size`, `color`, `glow?: boolean`, `className?`.

**Sustitución futura:** cuando el usuario tenga los SVGs definitivos, solo hay que reemplazar el contenido del componente. La API se mantiene.

---

## 15. Estructura de carpetas

```text
/app
  /angeles-en-el-cielo
    page.tsx                          ← landing emocional
    /[slug]/page.tsx                  ← perfil público
  /mural-global
    page.tsx                          ← mural + drawer (todo aquí)
  /gracias/[id]/page.tsx
  /eliminar/[token]/page.tsx
  /aviso-legal/page.tsx
  /privacidad/page.tsx
  /cookies/page.tsx
  /condiciones-contratacion/page.tsx
  /admin/moderacion/page.tsx
  layout.tsx
  globals.css

  /api
    /checkout/route.ts
    /webhooks/stripe/route.ts
    /upload/photo/route.ts
    /mural/slots/route.ts
    /mural/thumbnails/route.ts
    /mural/reserve/route.ts
    /memorial/route.ts
    /memorial/[id]/route.ts
    /events/route.ts
    /og/[memorialId]/route.ts
    /cron/release-expired/route.ts
    /cron/expire-annual/route.ts
    /cron/anniversary/route.ts
    /cron/expiration-warnings/route.ts
    /cron/draft-recovery/route.ts

/components
  /landing                            ← componentes de /angeles-en-el-cielo
    Hero.tsx
    PlansSection.tsx
    StorySection.tsx
    SocialProof.tsx
    Footer.tsx
  /mural                              ← componentes de /mural-global
    MuralCanvas.tsx                   ← canvas limpio
    MuralViewport.ts                  ← hook useMuralViewport
    MuralStats.tsx
    MuralZoomControls.tsx
    MuralPetCardModal.tsx             ← modal de perfil ocupado
    MuralDrawer.tsx                   ← drawer principal
    MuralDrawerSteps/
      Step1Plan.tsx
      Step2DataAndPhoto.tsx
      Step3Checkout.tsx
      DrawerStepper.tsx
  /icons                              ← SVG icons
  /ui                                 ← botones, inputs, cards
  /shared
    Logo.tsx
    Header.tsx
    Footer.tsx

/lib
  supabase/client.ts                  ← SSR-safe client
  supabase/server.ts                  ← service_role client
  stripe.ts
  resend.ts
  vision.ts
  analytics.ts
  slug.ts                             ← generación slugs únicos
  draft.ts                            ← gestión de drafts en cookie

/emails
  layouts/HeavenLayout.tsx
  templates/
    ConfirmationEmail.tsx
    ...

/styles
  globals.css                         ← CSS del prompt maestro

/types
  database.ts                         ← types generados por Supabase CLI
  app.ts                              ← types de dominio

/public
  /icons                              ← iconos SVG estáticos si los hay
  /backgrounds                        ← fondos hero/body (los aporta el usuario)
  /images                             ← ilustraciones (el perrito etc.)
```

---

## 16. Configuración Vercel

### 16.1 vercel.json

```json
{
  "regions": ["fra1"],
  "crons": [
    { "path": "/api/cron/release-expired",     "schedule": "* * * * *"  },
    { "path": "/api/cron/expire-annual",       "schedule": "0 3 * * *"  },
    { "path": "/api/cron/anniversary",         "schedule": "0 9 * * *"  },
    { "path": "/api/cron/expiration-warnings", "schedule": "0 10 * * *" },
    { "path": "/api/cron/draft-recovery",      "schedule": "0 11 * * *" }
  ]
}
```

### 16.2 Runtime por endpoint

- `@vercel/og` (tarjetas): `edge`
- Webhooks Stripe: `nodejs` (Stripe SDK Node-only)
- Google Vision: `nodejs`
- Resto: `nodejs` por defecto, `edge` donde sea posible

---

## 17. Tests mínimos pre-producción

```text
[ ] Crear memorial Recuerdo Inicial → publica → tarjeta generada → email llega
[ ] Crear memorial Estrella Anual → expires_at = +365 días
[ ] Crear memorial Recuerdo Eterno → expires_at = null
[ ] Reserva 15 min: dejar pasar 16 minutos → slot vuelve a available
[ ] Webhook Stripe verificado con stripe CLI
[ ] Foto inapropiada → rechazada por Vision con mensaje empático
[ ] Bloque 2×2 sobre celda ocupada → propone alternativa cercana
[ ] Borrado GDPR auto-servicio → token válido → borrado completo (BD + Storage)
[ ] Email confirmación se ve bien en Gmail, Outlook, Apple Mail
[ ] Open Graph: compartir en WhatsApp/Twitter muestra tarjeta correcta
[ ] Canvas: pan y zoom suaves en desktop y mobile (60 fps en zoom 1x)
[ ] Mobile: pinch zoom funciona
[ ] RLS: anon_key NO puede leer drafts ni memoriales rechazados
[ ] Plausible registra los 19 eventos
[ ] Banner cookies aparece una vez, no vuelve
[ ] /aviso-legal, /privacidad, /cookies, /condiciones-contratacion accesibles
[ ] Sitemap genera correctamente con todos los memoriales públicos
```

---

## 18. Reglas de oro para Antigravity

1. **NO usar Stripe subscriptions** — todos los planes son `mode: 'payment'`.
2. **NO pre-popular** la tabla `mural_slots`.
3. **NO crear cuenta** de usuario en MVP — email + token suficientes.
4. **NO usar Tailwind para identidad** — solo utilities. El CSS del prompt maestro define la identidad.
5. **NO exponer `service_role` key** al cliente.
6. **NO mezclar lógica de negocio con UI** — toda escritura pasa por `/api`.
7. **Verificar firma de webhook Stripe** siempre.
8. **GDPR borrado completo**: memorial + foto Storage + tarjeta + comentarios + reacciones + logs.
9. **Errores empáticos**: nunca mensajes técnicos al usuario. "No hemos podido procesar esta imagen" no "Vision API returned LIKELY".
10. **El mural nunca debe sentirse vacío** — usar el truco golden ratio del código actual para el seed inicial.
11. **Pedir al usuario el pantallazo de Canva** antes de generar iconos SVG.
12. **Referencia técnica del canvas**: ver `MuralGlobalPage.tsx` líneas 147-365 del código pre-existente.
