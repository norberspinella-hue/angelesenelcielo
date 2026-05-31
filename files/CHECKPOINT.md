# CHECKPOINT del proyecto Ángeles en el Cielo
## Estado a fecha del último avance · v1

> Este documento tiene **doble función**:
>
> 1. **Checkpoint:** resumen ejecutivo del estado actual del proyecto.
> 2. **Prompt de re-arranque:** si esta conversación se cierra o se vuelve muy larga, pega el contenido de la sección "PROMPT PARA NUEVA CONVERSACIÓN" en un chat nuevo de Claude junto con los documentos finales, y Claude se pondrá al día en un solo mensaje.

---

## PARTE 1 — RESUMEN EJECUTIVO

### Qué es el proyecto

**Ángeles en el Cielo** es una experiencia memorial digital para mascotas fallecidas. Los usuarios pueden:
- Crear un perfil público compartible de su mascota.
- Reservar un espacio físico (1, 4 o 9 slots) en un **mural global de 1.000.000 de lugares**.
- Compartir la historia y dejar que otros reaccionen con comentarios y "luces".

Marca: "Cada foto guarda una historia. Cada historia deja una huella."

### Stack tecnológico cerrado

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 App Router + TypeScript (strict) |
| DB + Storage + Auth | Supabase |
| Pagos | Stripe Checkout `mode: payment` (one-time) |
| Email | Resend + React Email |
| Moderación imágenes | Google Cloud Vision SafeSearch |
| Analytics | Plausible (sin cookies) |
| Animaciones | framer-motion |
| Tarjeta OG | @vercel/og (edge runtime) |
| Hosting | Vercel (region `fra1`) |
| Canvas | Canvas 2D nativo (no pixi.js) |
| Estilos | CSS prompt maestro + Tailwind utilities |

### Arquitectura de páginas

```
todaslasmascotasvanalcielo.com/
│
├─ /                              Placeholder mínimo (raíz reservada)
│
├─ /angeles-en-el-cielo           ★ LANDING EMOCIONAL (antesala)
├─ /angeles-en-el-cielo/[slug]    Perfil público de cada memorial
│
├─ /mural-global                  ★ DONDE SUCEDE TODO
│  ├─ Modo view: visitable libremente
│  └─ Drawer overlay: flujo de compra
│
├─ /gracias/[id]                  Confirmación emocional (página completa)
├─ /eliminar/[token]              Borrado GDPR auto-servicio
│
├─ /aviso-legal                   Legales (LSSI-CE)
├─ /privacidad                    RGPD
├─ /cookies                       Política cookies (mínima)
├─ /condiciones-contratacion      TyC compras
│
└─ /admin/moderacion              Panel admin
```

### Planes y precios (DEFINITIVOS)

| Plan | Precio (IVA incl) | Modalidad | Slots | Vigencia |
|---|---|---|---|---|
| Recuerdo Inicial | 1,99 € | Pago único | 1 (1×1) | Indefinida |
| Estrella Anual ⭐ | 4,99 €/año | Pago único + expires_at | 4 (2×2) | 365 días, renovable manualmente |
| Recuerdo Eterno | 9,99 € | Pago único | 9 (3×3) | Indefinida |

**Crítico:** todos son `mode: 'payment'` en Stripe. NO subscriptions. Estrella Anual se renueva manualmente con email recordatorio a 30/7/0 días.

### Flujo de usuario definitivo

```
ENTRADA A:                          ENTRADA B:
/angeles-en-el-cielo                /mural-global (directo)
       ↓                                   ↓
   CTA "Darle su lugar"             Explora libremente
       ↓                                   ↓
   /mural-global                    Click slot libre o CTA
       ↓                                   ↓
   Click slot libre                 Drawer abre sobre el mural
       ↓
   Drawer abre sobre el mural

DRAWER (4 steps):
1. Plan + slot pre-fijado (auto-buscar alternativa si bloque no cabe)
2. Foto + datos + dedicatoria + preview en vivo + checkbox derechos
3. Resumen + redirect Stripe Checkout (reserva slots 15 min)
4. /gracias/[id] — página completa con animación zoom al slot
```

### Decisiones críticas cerradas

1. **Un solo proyecto Next.js** (no separar landing y mural).
2. **App Router** (no Pages Router).
3. **Stripe `mode: payment`** para los 3 planes.
4. **Precios siempre IVA incluido** (B2C España).
5. **3 planes**: 1,99 € / 4,99 €/año / 9,99 € — slots 1/4/9.
6. **Todo el flujo de compra DENTRO de `/mural-global`** mediante drawer deslizante.
7. **Drawer SIEMPRE sobre el mural** (no sobre la landing) — los mockups muestran landing como decoración del mockup.
8. **Step 4 NO es parte del drawer** — es página completa `/gracias/[id]` con mural haciendo zoom al slot.
9. **NO hay página `/crear`** dedicada.
10. **NO pre-poblar** `mural_slots` con 1M de filas. Insertar solo al reservar.
11. **NO crear cuenta** de usuario en MVP. Email + deletion_token suficiente.
12. **CSS del prompt maestro** define identidad. Tailwind solo utilities.
13. **Canvas 2D nativo** (no pixi.js, no WebGL).
14. **GDPR**: banner cookies mínimo (esenciales) + borrado autoservicio por token email.
15. **La raíz `/` es placeholder mínimo** (no redirige).
16. **Checkbox obligatorio derechos de imagen** en step 2 (T.3).
17. **3 buzones operativos**: `hola@`, `admin@`, `privacidad@`.
18. **Despliegue:** `preview.todaslasmascotasvanalcielo.com` primero, dominio raíz al go-live.
19. **Assets visuales:** placeholders SVG generados por Antigravity hasta tener definitivos.
20. **Paleta DEFINITIVA**: azul marino `#1E2A78` + dorado pastel `#C9A961` + cremas/cielos pastel. NO rosa/magenta.

### Esquema de datos (referencia rápida)

Tablas principales:
- `memorials` — los recuerdos con email, foto, datos, plan, expires_at, deletion_token, rights_confirmed_at, etc.
- `mural_slots` — sparse map de slots ocupados/reservados (NO pre-poblar 1M filas)
- `memorial_comments` — comentarios públicos
- `memorial_reactions` — reacciones (huellita, estrella, corazón, luz)
- `analytics_events` — eventos de negocio (complementa Plausible)
- `email_logs` — auditoría de emails enviados

Funciones SQL:
- `is_block_available(x, y, size)` — verifica si bloque NxN está libre
- `find_nearest_available_block(x, y, size)` — búsqueda en espiral

RLS activado en todas las tablas. Escrituras pasan por service_role server-side.

---

## PARTE 2 — DOCUMENTOS PRODUCIDOS

### Entregables finales (v2.2)

| Archivo | Contenido | Estado |
|---|---|---|
| `instrucciones_antigravity.md` | Primera lectura obligatoria para Antigravity | ✅ v2.2 |
| `documento_tecnico_funcional_v2.md` | QUÉ construir (negocio, flujos, copy) | ✅ v2 |
| `anexo_tecnico_implementacion_v2.md` | CÓMO construir (stack, SQL, integraciones) | ✅ v2.2 |
| `auditoria_mural_global_actual_v1.md` | Auditoría código previo | ✅ v1 |
| `mural-global-referencia.zip` | Código referencia curado (2.1 MB) | ✅ v1 |

### Referencias visuales

| Archivo | Define |
|---|---|
| `LANDING_ANGELES_EN_EL_CIELO.png` | Landing oficial |
| `Flujo_cta_completo.png` | Overview del drawer en todos los steps |
| `Flujo_cta_1.png` | Drawer Step 1 — Plan + slot |
| `Flujo_cta_2.png` | Drawer Step 2 — Datos + preview |
| `Flujo_cta__3.png` | Drawer Step 3 — Pago |
| `Flujo_cta__4.png` | Página `/gracias/[id]` |
| `cta.png` | Hero detail |
| `mural_global.jpeg` + `tarjeta_cta.jpeg` | Mural funcionando |
| `PROMPT_MAESTRO_VISUAL_ACTUALIZADO.docx` | Identidad visual |
| `CSS.docx` | CSS oficial del proyecto |

**Descartados (no usar):** `flujo_cta_2/3/4/5.jpeg` (versiones antiguas con paleta rosa/magenta).

---

## PARTE 3 — ESTADO ACTUAL DEL TRABAJO

### Donde estamos

✅ **Fase 0 — Setup:** completada.
✅ **Fase 1 — Backend Foundation:** completada.
✅ **Fase 2 — Landing `/angeles-en-el-cielo`:** validada. Pendientes menores (hero layout 2 columnas cuando lleguen assets definitivos, color stat 50.000, mini-mural decorativo placeholder, copy CTA final).
✅ **Fase 3 — Mural canvas `/mural-global`:** validada. Pezuña dorada central correcta, UI completa (stats card, nav, leyenda, buscador, controles zoom).
🔄 **Fase 4 — Drawer del flujo:** en construcción.

### Cambios de scope en el drawer (post-validación visual)

El drawer ha pasado de **4 a 5 pasos**. Stepper: `Plan · Foto · Historia · Pago · Gracias`.

**Nuevo step 3 "Su historia"** — insertado entre Foto y Pago:
- 4 preguntas guiadas visibles como INSPIRACIÓN (no campos obligatorios).
- UN solo campo de dedicatoria libre donde el usuario escribe guiado por las preguntas.
- Preview en vivo con la foto del step 2 visible mientras escribe (el momento emocional clave).
- Checkbox de derechos de imagen aquí (no en step 2).

**Corrección en step 1:** mini-grid debe mostrar posición REAL del slot en el grid, no centrado artificialmente.

### Próximo checkpoint

Cuando Antigravity complete el drawer con los 5 steps, validar capturas de los steps 1, 2, 3 y 4 antes de conectar Stripe.

---

## PARTE 4 — ROADMAP FASE 2 (post-MVP)

6 oportunidades de negocio documentadas para después del MVP:

1. **Add-ons emocionales en checkout** (vela virtual, postal premium, mensaje aniversario) — coste BAJO, impacto ALTO
2. **"Regala un recuerdo"** (gifting) — coste MEDIO, impacto ALTO
3. **Newsletter "Historias del Cielo"** — coste BAJO, impacto MEDIO
4. **Video memorial automático** (Remotion/Bannerbear para TikTok/Reels) — coste MEDIO-ALTO, impacto MULTIPLICADOR
5. **Productos físicos** (marketplace print-on-demand) — coste ALTO, requiere partner logístico
6. **Programa afiliación veterinarios** — coste ALTO, canal de adquisición estratégico

Detalle completo en `documento_tecnico_funcional_v2.md` sección 11.

---

---

# PROMPT PARA NUEVA CONVERSACIÓN

> **Copia y pega EXACTAMENTE lo que está debajo de esta línea en un chat nuevo de Claude. Adjunta también los archivos que se mencionan.**

---

Hola Claude. Estoy continuando un proyecto que empecé en otra conversación. Necesito que te pongas al día y sigas ayudándome.

**El proyecto:** "Ángeles en el Cielo" — experiencia memorial digital para mascotas fallecidas. Web con una landing emocional + mural global de 1.000.000 de slots donde los usuarios reservan un espacio para su mascota.

**Stack:** Next.js 14 App Router + Supabase + Stripe (mode payment) + Resend + Plausible + Vercel. Dominio: `todaslasmascotasvanalcielo.com`.

**Mi rol:** soy el product owner. Tú me ayudas con decisiones de producto, arquitectura técnica, auditoría de código y preparación de documentación para Antigravity (la IA que construye el código).

**Lo que te adjunto:**

1. `instrucciones_antigravity.md` — primera lectura obligatoria
2. `documento_tecnico_funcional_v2.md` — qué construir
3. `anexo_tecnico_implementacion_v2.md` — cómo construir (50 KB, contiene todo el detalle técnico)
4. `auditoria_mural_global_actual_v1.md` — auditoría del código previo descartado
5. `CHECKPOINT.md` — este documento que estás leyendo, con el resumen ejecutivo y estado actual
6. Referencias visuales: `LANDING_ANGELES_EN_EL_CIELO.png`, `Flujo_cta_completo.png`, `Flujo_cta_1.png`, `Flujo_cta_2.png`, `Flujo_cta__3.png`, `Flujo_cta__4.png`
7. `PROMPT_MAESTRO_VISUAL_ACTUALIZADO.docx` + `CSS.docx`
8. `mural-global-referencia.zip` — código referencia técnica

**Lo que necesito de ti en tu primera respuesta:**

1. Confirma que has leído el CHECKPOINT.md y los documentos clave.
2. Resúmeme en 5-10 líneas lo que has entendido del proyecto (para verificar que tienes el contexto).
3. Dime en qué fase estoy y cuál es el próximo paso lógico.

**Reglas de trabajo conmigo:**

- Soy honesto y directo, prefiero que tú también lo seas. Discrepa cuando tengas argumentos.
- Usa preguntas en formato `ask_user_input_v0` cuando necesites decisiones (más fácil para mí en móvil).
- No me hagas más de 3 preguntas por mensaje.
- Si vas a generar código o documentos largos, hazlo en archivos con `create_file` y dame el archivo final.
- Si alguna decisión cerrada parece equivocada al revisarla con ojos frescos, dímelo — prefiero corregir a perpetuar errores.

**Estado actual:** Antigravity está arrancando Fase 0 (Setup) + Fase 1 (Backend Foundation). El próximo checkpoint contigo es cuando Antigravity termine esas dos fases y necesite validación antes de pasar a la landing.

¿Listo? Empezamos.
