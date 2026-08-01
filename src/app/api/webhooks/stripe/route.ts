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

    // Generar order_id único
    const orderId = `AEC-${Date.now()}`

    // Generar upload_token único para el certificado
    const uploadToken = crypto.randomUUID()

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
        })
        .select()
        .single()

      if (memorialError) {
        console.error('Error guardando memorial:', memorialError)
      } else {
        console.log('Memorial guardado:', memorial.id)
      }

      // 2. Registrar/actualizar los slots en mural_slots
      if (slotId && slotId !== 'auto') {
        const [xStr, yStr] = slotId.split(',')
        const xVal = parseInt(xStr)
        const yVal = parseInt(yStr)

        if (!isNaN(xVal) && !isNaN(yVal)) {
          const size = plan === 'corazon_eterno' ? 3 : plan === 'estrella_brillante' ? 2 : 1
          const slotsToUpsert = []

          for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
              slotsToUpsert.push({
                x: xVal + dx,
                y: yVal + dy,
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
            console.log(`Slots de tamaño ${size}x${size} registrados/actualizados en (${xVal}, ${yVal})`)
          }
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
              <div style="font-family: Georgia, serif; max-width: 600px; 
              margin: 0 auto; padding: 40px 20px; 
              background: linear-gradient(160deg, #ffe8f0, #f5e8ff);">
                <h1 style="color: #4A3F6B; font-size: 28px;">
                  Su recuerdo ya brilla en el cielo ✨
                </h1>
                <p style="color: #7B6F9A; font-size: 16px; line-height: 1.6;">
                  Gracias por darle un lugar eterno a <strong>${petName}</strong> 
                  en el mural global.
                </p>
                <p style="color: #7B6F9A; font-size: 16px; line-height: 1.6;">
                  Plan elegido: <strong>${plan}</strong>
                </p>
                <p style="color: #7B6F9A; font-size: 16px; line-height: 1.6;">
                  Tu certificado estará listo en 24-72h y te lo 
                  enviaremos a este email.
                </p>
                <div style="margin: 32px 0; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_URL}/mural-global" 
                     style="background: linear-gradient(90deg, #ff82ad, #ec5f96);
                     color: white; padding: 14px 28px; border-radius: 999px;
                     text-decoration: none; font-weight: 700; font-size: 16px;">
                    Ver en el mural ✦
                  </a>
                </div>
                <p style="color: #B8B0CC; font-size: 12px; text-align: center;">
                  Ángeles en el Cielo · todaslasmascotasvanalcielo.com
                </p>
              </div>
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
