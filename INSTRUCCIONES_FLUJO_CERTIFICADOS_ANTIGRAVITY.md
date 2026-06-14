# INSTRUCCIONES — Flujo de Certificados
## Entrega manual 24-72h · Ángeles en el Cielo

---

## RESUMEN DEL FLUJO

```
1. Usuario paga → Stripe webhook dispara el proceso
2. Sistema guarda el pedido en Supabase (tabla certificates)
3. Email al usuario → "Tu certificado está en proceso"
4. Email al diseñador → datos + foto + link de subida único
5. Diseñador crea el certificado y lo sube via link
6. Sistema guarda en Supabase Storage
7. Email al usuario → "Tu certificado está listo" + PDF adjunto + PNG
```

---

## PARTE 1 — BASE DE DATOS

### Nueva tabla: `certificates`

```sql
create table certificates (
  id uuid default gen_random_uuid() primary key,
  order_id text not null unique,          -- "AEC-F0001", "AEC-000126"
  user_email text not null,
  pet_name text not null,
  plan text not null,                     -- 'fundador' | 'eterno' | 'estrella' | 'inicial'
  founder_number integer,                 -- solo para plan fundador
  slot_code text,                         -- código del espacio en el mural
  pet_photo_url text not null,            -- URL foto en Supabase Storage
  profile_url text,                       -- URL perfil público /angeles-en-el-cielo/[slug]
  upload_token text not null unique,      -- token único para link de subida
  status text default 'pending',          -- 'pending' | 'uploaded' | 'delivered'
  certificate_pdf_url text,               -- URL PDF final en Supabase Storage
  certificate_png_url text,               -- URL PNG final en Supabase Storage
  created_at timestamptz default now(),
  uploaded_at timestamptz,
  delivered_at timestamptz
);

-- RLS: solo service_role puede leer/escribir
alter table certificates enable row level security;
```

### Supabase Storage bucket: `certificates`
```
Bucket: certificates (privado)
Rutas:
  certificates/{order_id}/certificate.pdf
  certificates/{order_id}/certificate.png
```

---

## PARTE 2 — TRIGGER POST-PAGO

En el webhook de Stripe (`/api/webhooks/stripe`), tras confirmar `payment_intent.succeeded`:

```typescript
// lib/certificates.ts

import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

export async function createCertificateOrder(params: {
  orderId: string
  userEmail: string
  petName: string
  plan: string
  founderNumber?: number
  slotCode: string
  petPhotoUrl: string
  profileUrl: string
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const uploadToken = nanoid(32)

  const { data, error } = await supabase
    .from('certificates')
    .insert({
      order_id: params.orderId,
      user_email: params.userEmail,
      pet_name: params.petName,
      plan: params.plan,
      founder_number: params.founderNumber ?? null,
      slot_code: params.slotCode,
      pet_photo_url: params.petPhotoUrl,
      profile_url: params.profileUrl,
      upload_token: uploadToken,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error

  // Enviar emails
  await sendUserPendingEmail(params.userEmail, params.petName, params.plan)
  await sendDesignerEmail({
    orderId: params.orderId,
    userEmail: params.userEmail,
    petName: params.petName,
    plan: params.plan,
    founderNumber: params.founderNumber,
    petPhotoUrl: params.petPhotoUrl,
    uploadToken,
  })

  return data
}
```

---

## PARTE 3 — EMAILS CON RESEND

### Email 1 · Al usuario (confirmación en proceso)

```typescript
// emails/CertificatePendingEmail.tsx
// Usar React Email + Resend

export async function sendUserPendingEmail(
  userEmail: string,
  petName: string,
  plan: string
) {
  const planLabel: Record<string, string> = {
    fundador: 'Angelito Fundador',
    eterno: 'Recuerdo Eterno',
    estrella: 'Estrella Anual',
    inicial: 'Recuerdo Inicial',
  }

  await resend.emails.send({
    from: 'Ángeles en el Cielo <hola@todaslasmascotasvanalcielo.com>',
    to: userEmail,
    subject: `✨ El certificado de ${petName} está en camino`,
    react: CertificatePendingEmail({ petName, planLabel: planLabel[plan] }),
  })
}

// Contenido del email:
// Asunto: ✨ El certificado de [nombre] está en camino
//
// Hola,
//
// Estamos creando con amor el Certificado [plan] de [nombre].
//
// Nuestro equipo lo está diseñando especialmente para ti.
// Lo recibirás en tu email en las próximas 24-72 horas.
//
// Mientras tanto, [nombre] ya tiene su espacio reservado
// en el Mural de Ángeles en el Cielo. 🐾
//
// Con cariño,
// El equipo de Ángeles en el Cielo
```

---

### Email 2 · Al diseñador (encargo con datos + link subida)

```typescript
export async function sendDesignerEmail(params: {
  orderId: string
  userEmail: string
  petName: string
  plan: string
  founderNumber?: number
  petPhotoUrl: string
  uploadToken: string
}) {
  const uploadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/upload-certificate?token=${params.uploadToken}`

  await resend.emails.send({
    from: 'Sistema <admin@todaslasmascotasvanalcielo.com>',
    to: 'admin@todaslasmascotasvanalcielo.com',
    subject: `🎨 Nuevo certificado · ${params.petName} · ${params.plan} · ${params.orderId}`,
    react: DesignerOrderEmail({
      ...params,
      uploadUrl,
    }),
  })
}

// Contenido del email al diseñador:
// Asunto: 🎨 Nuevo certificado · Luna · fundador · AEC-F0001
//
// NUEVO ENCARGO DE CERTIFICADO
//
// Pedido:     AEC-F0001
// Plan:       Angelito Fundador
// Fundador #: 0001
// Mascota:    Luna
// Email:      cliente@email.com
//
// [Ver foto de Luna] → link directo a petPhotoUrl
//
// Una vez terminado el certificado, súbelo aquí:
// [SUBIR CERTIFICADO] → botón grande → uploadUrl
//
// El sistema enviará automáticamente el email al cliente.
```

---

## PARTE 4 — PÁGINA DE SUBIDA DEL DISEÑADOR

### Ruta: `/admin/upload-certificate`

```typescript
// app/admin/upload-certificate/page.tsx

// Params: ?token=xxxx

// 1. Verificar que el token existe en la tabla certificates
//    y que status === 'pending'
// 2. Si no existe o ya fue usado → mostrar error
// 3. Si válido → mostrar formulario de subida

// Formulario:
// - Upload PDF (obligatorio)
// - Upload PNG (obligatorio)  
// - Botón "Subir y enviar al cliente"

// Al hacer submit:
// 1. Subir PDF a Supabase Storage: certificates/{order_id}/certificate.pdf
// 2. Subir PNG a Supabase Storage: certificates/{order_id}/certificate.png
// 3. Actualizar tabla certificates:
//    status: 'uploaded'
//    certificate_pdf_url: url_pdf
//    certificate_png_url: url_png
//    uploaded_at: now()
// 4. Llamar a /api/certificates/deliver → envía email al usuario
// 5. Actualizar status: 'delivered', delivered_at: now()
// 6. Mostrar confirmación: "✓ Certificado enviado a cliente@email.com"
```

---

## PARTE 5 — API ROUTE DE ENTREGA

### Ruta: `POST /api/certificates/deliver`

```typescript
// app/api/certificates/deliver/route.ts

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  // 1. Buscar certificate por upload_token
  const { data: cert } = await supabase
    .from('certificates')
    .select('*')
    .eq('upload_token', token)
    .eq('status', 'uploaded')
    .single()

  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 2. Enviar email al usuario con PDF adjunto
  await sendUserDeliveryEmail({
    userEmail: cert.user_email,
    petName: cert.pet_name,
    plan: cert.plan,
    certificatePdfUrl: cert.certificate_pdf_url,
    certificatePngUrl: cert.certificate_png_url,
    profileUrl: cert.profile_url,
  })

  // 3. Actualizar status
  await supabase
    .from('certificates')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', cert.id)

  return NextResponse.json({ ok: true })
}
```

---

### Email 3 · Al usuario (entrega del certificado)

```typescript
// Asunto: 🎁 El certificado de [nombre] ya está listo

// Hola,
//
// ¡Tu certificado personalizado está listo! 🎉
//
// [nombre] tiene ahora su lugar eterno en el
// Mural de Ángeles en el Cielo.
//
// [DESCARGAR CERTIFICADO PDF] → link pdf
// [VER EN REDES / DESCARGAR PNG] → link png
//
// Comparte su historia en redes sociales y
// ayuda a otros a conocer el Mural. 🐾
//
// [VER PERFIL DE nombre EN EL MURAL] → profileUrl
//
// Con cariño,
// El equipo de Ángeles en el Cielo
//
// —
// Guardar para siempre · Compartir con amor
```

---

## PARTE 6 — VARIABLES DE ENTORNO NECESARIAS

```env
# Ya existentes
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_BASE_URL=https://todaslasmascotasvanalcielo.com

# Sin cambios necesarios
```

---

## PARTE 7 — CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear tabla `certificates` en Supabase
- [ ] Crear bucket `certificates` en Supabase Storage (privado)
- [ ] `lib/certificates.ts` → función `createCertificateOrder`
- [ ] Llamar a `createCertificateOrder` en webhook de Stripe tras pago exitoso
- [ ] Email 1 · `CertificatePendingEmail` → usuario (en proceso)
- [ ] Email 2 · `DesignerOrderEmail` → admin (encargo + link subida)
- [ ] Página `/admin/upload-certificate` → formulario subida PDF+PNG
- [ ] API route `POST /api/certificates/deliver` → entrega + email usuario
- [ ] Email 3 · `CertificateDeliveryEmail` → usuario (certificado listo)
- [ ] Probar flujo completo con pedido de prueba

---

## NOTAS

- El token de subida es de un solo uso — una vez entregado no se puede reutilizar
- No hay login para el diseñador — el token del email es la autenticación
- Los archivos en Supabase Storage son privados — se sirven via URL firmada con expiración
- En el futuro (Fase 2) este flujo puede automatizarse con generación dinámica del certificado
