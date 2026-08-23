import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { resend } from '@/lib/resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { plan, slotId, petName, email, photoUrl, thumbnailUrl, petDate, species, breed, birthDate, location, dedication } = session.metadata!

    const planMapping: Record<string, string> = {
      'huellita': 'recuerdo_inicial',
      'estrella_brillante': 'estrella_anual',
      'corazon_eterno': 'recuerdo_eterno',
    }
    const planDb = planMapping[plan] ?? 'recuerdo_inicial'

    console.log('Pago completado:', {
      plan,
      planDb,
      slotId,
      petName,
      email,
      sessionId: session.id,
      amount: session.amount_total,
    })

    // Crear cliente admin de Supabase
    const supabase = createAdminClient()

    const isBlockFree = async (
      startX: number,
      startY: number, 
      size: number
    ): Promise<boolean> => {
      const { data } = await (supabase
        .from('mural_slots') as any)
        .select('status')
        .gte('x', startX)
        .lt('x', startX + size)
        .gte('y', startY)
        .lt('y', startY + size)
      
      if (data && data.some((s: any) => s.status === 'occupied')) {
        return false
      }
      return true
    }

    // Generar order_id único
    const orderId = `AEC-${Date.now()}`

    // Generar upload_token único para el certificado
    const uploadToken = crypto.randomUUID()

    // Determinar slot final asignado (Lógica de validación de slot ocupado)
    let finalX: number | null = null
    let finalY: number | null = null
    let slotAssignedStr = ''

    if (slotId && slotId !== 'auto') {
      const [xStr, yStr] = slotId.split(',')
      const xVal = parseInt(xStr)
      const yVal = parseInt(yStr)

      if (!isNaN(xVal) && !isNaN(yVal)) {
        finalX = xVal
        finalY = yVal

        const planSize = planDb === 'recuerdo_eterno' ? 3 :
                         planDb === 'estrella_anual' ? 2 : 1

        // Verificar si el bloque completo está libre
        const blockFree = await isBlockFree(xVal, yVal, planSize)

        if (!blockFree) {
          console.log(`Bloque (${xVal}, ${yVal}) de tamaño ${planSize}x${planSize} ocupado, buscando alternativo...`)
          
          let found = false
          for (let radius = 1; radius <= 50 && !found; radius++) {
            const candidates = []
            for (let dx = -radius; dx <= radius; dx++) {
              for (let dy = -radius; dy <= radius; dy++) {
                if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                  candidates.push({ 
                    x: xVal + dx, 
                    y: yVal + dy,
                    dist: Math.sqrt(dx*dx + dy*dy)
                  })
                }
              }
            }
            candidates.sort((a, b) => a.dist - b.dist)
            
            for (const candidate of candidates) {
              if (candidate.x < 0 || candidate.y < 0) continue
              const free = await isBlockFree(candidate.x, candidate.y, planSize)
              if (free) {
                finalX = candidate.x
                finalY = candidate.y
                found = true
                console.log(`Bloque alternativo asignado: (${finalX}, ${finalY}) de tamaño ${planSize}x${planSize}`)
                break
              }
            }
          }
        }

        slotAssignedStr = `${finalX},${finalY}`
      }
    }

    try {
      // 1. Guardar en tabla memorials
      const { data: memorial, error: memorialError } = await (supabase
        .from('memorials') as any)
        .insert({
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          payment_status: 'paid',
          price_paid: (session.amount_total ?? 0) / 100, // Convertir de céntimos a euros
          plan_type: planDb,
          email: email, // En la BD la columna se llama email, no user_email
          pet_name: petName,
          species: (species || 'otro') as any,
          breed: breed || '',
          birth_date: birthDate || null,
          location: location || '',
          photo_url: photoUrl || '', // de los metadatos de Stripe
          death_date: petDate || new Date().toISOString().split('T')[0],
          slots_count: plan === 'corazon_eterno' ? 9 : plan === 'estrella_brillante' ? 4 : 1,
          profile_slug: `${petName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
          visibility: 'public',
          publication_status: 'published',
          moderation_status: 'approved',
          dedication: dedication || '',
          slot_assigned: slotAssignedStr,
        })
        .select()
        .single()

      if (memorialError) {
        console.error('Error guardando memorial:', memorialError)
      } else {
        console.log('Memorial guardado:', memorial.id)
      }

      // 2. Registrar/actualizar los slots en mural_slots
      if (finalX !== null && finalY !== null) {
        const size = plan === 'corazon_eterno' ? 3 : plan === 'estrella_brillante' ? 2 : 1
        const slotsToUpsert = []

        for (let dx = 0; dx < size; dx++) {
          for (let dy = 0; dy < size; dy++) {
            slotsToUpsert.push({
              x: finalX + dx,
              y: finalY + dy,
              status: 'occupied', // En BD el enum es 'occupied' (no 'ocupado')
              memorial_id: memorial?.id || null,
              plan_type: planDb,
              thumbnail_url: thumbnailUrl || '',
            })
          }
        }

        const { error: slotError } = await (supabase
          .from('mural_slots') as any)
          .upsert(slotsToUpsert, { onConflict: 'x,y' })

        if (slotError) {
          console.error('Error actualizando slots:', slotError)
        } else {
          console.log(`Slots de tamaño ${size}x${size} registrados/actualizados en (${finalX}, ${finalY})`)
        }
      }

      // 3. Crear registro en certificates
      const { error: certError } = await (supabase
        .from('certificates') as any)
        .insert({
          order_id: orderId,
          user_email: email,
          pet_name: petName,
          plan: planDb,
          upload_token: uploadToken,
          status: 'pending',
          pet_photo_url: photoUrl || '', // Campo obligatorio en la BD
        })

      if (certError) {
        console.error('Error creando certificado:', certError)
      } else {
        console.log('Certificado pendiente creado:', orderId)

        // Enviar emails transaccionales
        try {
          // EMAIL 1 -> USUARIO (confirmación de compra)
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: email,
            subject: '✨ Su recuerdo ya brilla en el cielo',
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e0f0;font-family:Arial,Helvetica,sans-serif;">

<!-- Preheader oculto -->
<div style="display:none;max-height:0;overflow:hidden;">
  Gracias por crear un lugar eterno para tu angelito en el Mural de Ángeles.
</div>

<!-- Contenedor -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e0f0;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFF8F7;border-radius:16px;overflow:hidden;">

  <!-- HEADER IMAGEN -->
  <!-- Fallback local: /images/email/header-email.jpg -->
  <tr>
    <td bgcolor="#1E2A78" style="padding:0;">
      <img src="https://todaslasmascotasvanalcielo.com/images/email/header-email.jpg" 
           alt="Todas las mascotas van al cielo - Ángeles en el Cielo"
           width="600" height="200"
           style="display:block;max-width:100%;height:auto;">
    </td>
  </tr>

  <!-- CUERPO -->
  <tr>
    <td style="padding:40px 36px;background:#FFFFFF;">

      <!-- Saludo -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#706A95;margin:0 0 8px 0;">
        Hola,
      </p>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#25335F;line-height:1.3;margin:0 0 16px 0;">
        Tu ángel ya forma parte<br>del cielo ✨
      </h1>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#706A95;line-height:1.7;margin:0 0 12px 0;">
        Gracias por crear un lugar eterno para <strong style="color:#25335F;">tu angelito</strong>. 
        Su recuerdo ya ha sido recibido y formará parte del Mural de Ángeles.
      </p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#7B5EA9;line-height:1.7;font-style:italic;margin:0 0 32px 0;">
        Sabemos que no es solo una compra.<br>
        Es una forma preciosa de decir: sigues conmigo.
      </p>

      <!-- Resumen de compra -->
      <table width="100%" cellpadding="0" cellspacing="0" 
             style="background:#FFF8F7;border:1px solid #F3DCE7;border-radius:18px;margin:0 0 28px 0;">
        <tr>
          <td style="padding:24px;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#25335F;font-weight:700;margin:0 0 16px 0;">
              Resumen de tu recuerdo
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                  Mascota
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                  ${petName}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                  Plan
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                  ${plan === 'huellita' ? 'Huellita' : plan === 'estrella_brillante' ? 'Estrella Brillante' : 'Corazón Eterno'}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                  Luces en el cielo
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                  ${plan === 'corazon_eterno' ? '9' : plan === 'estrella_brillante' ? '4' : '1'} luces ✨
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;border-bottom:1px solid #F3DCE7;">
                  Fecha
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;border-bottom:1px solid #F3DCE7;">
                  ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#706A95;">
                  Importe
                </td>
                <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#25335F;font-weight:700;text-align:right;">
                  ${plan === 'corazon_eterno' ? '9,99 €' : plan === 'estrella_brillante' ? '4,99 €' : '1,99 €'}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Bloque emocional -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#F7E8FF;border-radius:18px;margin:0 0 28px 0;">
        <tr>
          <td style="padding:24px;text-align:center;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#7B5EA9;font-style:italic;font-weight:700;margin:0 0 8px 0;">
              Tu angelito de 4 patas ya tiene su espacio<br>en el cielo de las mascotas.
            </p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9B8FB0;line-height:1.6;margin:0;">
              Cada vez que alguien visite el mural,<br>su recuerdo seguirá brillando. ✨
            </p>
          </td>
        </tr>
      </table>

      <!-- Bloque certificado -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#FFF8F7;border:1px solid #F3DCE7;border-radius:18px;margin:0 0 28px 0;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#706A95;line-height:1.6;margin:0;">
              🎁 <strong style="color:#25335F;">Tu certificado memorial</strong> se enviará 
              en 48-72h al email del registro. 
              Incluye versión PDF para imprimir y PNG para compartir en redes sociales.
            </p>
          </td>
        </tr>
      </table>

      <!-- CTA principal -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr>
          <td align="center">
            <a href="${process.env.NEXT_PUBLIC_URL}/mural-global"
               style="display:inline-block;background:#F65F8F;color:#FFFFFF;padding:16px 40px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
              Ver su recuerdo ✦
            </a>
          </td>
        </tr>
      </table>

      <!-- Bloque ayuda -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#706A95;text-align:center;line-height:1.6;margin:24px 0 0 0;">
        Si necesitas modificar algún dato del recuerdo,<br>
        responde a este email o contáctanos en 
        <a href="mailto:hello@todaslasmascotasvanalcielo.com" 
           style="color:#7B5EA9;text-decoration:none;">
          hello@todaslasmascotasvanalcielo.com
        </a>
      </p>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td bgcolor="#1E2A78" style="padding:28px 36px;text-align:center;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#C9A961;font-weight:700;margin:0 0 6px 0;">
        Todas las mascotas van al cielo
      </p>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.50);line-height:1.6;margin:0 0 12px 0;">
        Este email confirma tu compra y la creación de tu recuerdo en Ángeles en el Cielo.
      </p>
      <p style="margin:0;font-size:11px;">
        <a href="${process.env.NEXT_PUBLIC_URL}/aviso-legal" 
           style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Aviso legal</a>
        <span style="color:rgba(255,255,255,0.20);">·</span>
        <a href="${process.env.NEXT_PUBLIC_URL}/privacidad" 
           style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Privacidad</a>
        <span style="color:rgba(255,255,255,0.20);">·</span>
        <a href="mailto:hello@todaslasmascotasvanalcielo.com" 
           style="color:rgba(201,169,97,0.70);text-decoration:none;margin:0 8px;">Contacto</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>
            `,
          })
          console.log('Email de confirmación enviado al usuario:', email)

          // EMAIL 2 -> ADMIN (notificación nuevo ángel)
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: process.env.ADMIN_EMAIL || 'admin@todaslasmascotasvanalcielo.com',
            subject: `🐾 Nuevo ángel: ${petName} (${plan})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; 
              margin: 0 auto; padding: 40px 20px;">
                <h2 style="color: #4A3F6B;">Nuevo ángel registrado</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; 
                    font-weight: 700;">Mascota</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${petName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; 
                    font-weight: 700;">Plan</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${plan}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; 
                    font-weight: 700;">Email</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; 
                    font-weight: 700;">Slot</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${slotId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: 700;">Sesión Stripe</td>
                    <td style="padding: 8px;">${session.id}</td>
                  </tr>
                </table>
                <p style="color: #9B8FB0; font-size: 13px; margin-top: 24px;">
                  Pendiente: crear y subir certificado en 24-72h
                </p>
              </div>
            `,
          })
          console.log('Email de notificación enviado al administrador')
        } catch (emailErr) {
          console.error('Error enviando emails a través de Resend:', emailErr)
        }
      }

    } catch (err) {
      console.error('Error procesando webhook:', err)
    }
  }

  return NextResponse.json({ received: true })
}
