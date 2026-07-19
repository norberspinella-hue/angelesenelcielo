import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any, // Cast to any to avoid strict version mismatch if package version differs slightly, or just use the exact version string expected: '2026-04-22.dahlia'
})

const PRICE_IDS: Record<string, string> = {
  huellita: process.env.STRIPE_PRICE_HUELLITA!,
  estrella_brillante: process.env.STRIPE_PRICE_ESTRELLA_BRILLANTE!,
  corazon_eterno: process.env.STRIPE_PRICE_CORAZON_ETERNO!,
}

export async function POST(req: NextRequest) {
  try {
    const { plan, slotId, petName, email, photoUrl, thumbnailUrl, petDate, species, breed, birthDate, location } = await req.json()

    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Plan no válido' },
        { status: 400 }
      )
    }

    // Recuperar detalles del precio para saber si es recurrente o de un solo pago
    const price = await stripe.prices.retrieve(priceId)
    const mode = price.type === 'recurring' ? 'subscription' : 'payment'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/gracias/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/mural-global`,
      customer_email: email,
      metadata: {
        plan,
        slotId,
        petName,
        email,
        photoUrl: (photoUrl && photoUrl.length <= 500) ? photoUrl : '',
        thumbnailUrl: (thumbnailUrl && thumbnailUrl.length <= 500) ? thumbnailUrl : '',
        petDate: petDate || '',
        species: species || 'otro',
        breed: (breed || '').slice(0, 100),
        birthDate: birthDate || '',
        location: (location || '').slice(0, 100),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago' },
      { status: 500 }
    )
  }
}
