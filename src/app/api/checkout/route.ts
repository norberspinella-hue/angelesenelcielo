import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPlan, LEGACY_STRIPE_PRICE_FALLBACKS, DEFAULT_STRIPE_PRICES } from '@/lib/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any, // Cast to any to avoid strict version mismatch if package version differs slightly, or just use the exact version string expected: '2026-04-22.dahlia'
})

export async function POST(req: NextRequest) {
  let currentPlan: string | undefined
  let currentPriceId: string | undefined
  try {
    const { 
      plan, 
      slotId, 
      petName, 
      email, 
      photoUrl, 
      thumbnailUrl, 
      petDate, 
      species, 
      breed, 
      birthDate, 
      location, 
      dedication, 
      shareOnSocials,
      socialHandle,
      isSponsorship,
      sponsorName,
      sponsorPetName,
      shelterName,
      sponsoredPetId
    } = await req.json()
    currentPlan = plan

    const planCfg = getPlan(plan)
    let priceId = planCfg ? (process.env[planCfg.stripePriceEnvVar] || DEFAULT_STRIPE_PRICES[planCfg.id]) : undefined
    if (priceId && LEGACY_STRIPE_PRICE_FALLBACKS[priceId]) {
      priceId = LEGACY_STRIPE_PRICE_FALLBACKS[priceId]
    }
    currentPriceId = priceId

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
      allow_promotion_codes: true,
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
        dedication: (dedication || '').slice(0, 490),
        shareOnSocials: shareOnSocials === 'true' || shareOnSocials === true ? 'true' : 'false',
        socialHandle: (socialHandle || '').slice(0, 100),
        isSponsorship: isSponsorship ? 'true' : 'false',
        sponsorName: (sponsorName || '').slice(0, 100),
        sponsorPetName: (sponsorPetName || '').slice(0, 100),
        shelterName: (shelterName || '').slice(0, 100),
        sponsoredPetId: (sponsoredPetId || '').slice(0, 100),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error for plan:', currentPlan, 'priceId:', currentPriceId, error)
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago' },
      { status: 500 }
    )
  }
}
