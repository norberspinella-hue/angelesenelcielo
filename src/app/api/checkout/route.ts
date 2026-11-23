import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPlan, LEGACY_STRIPE_PRICE_FALLBACKS, DEFAULT_STRIPE_PRICES } from '@/lib/plans'
import { createAdminClient } from '@/lib/supabase/server'
import { isValidWorldSpaceId } from '@/lib/world3d/contracts'

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
      instagram,
      tiktok,
      isSponsorship,
      sponsorName,
      sponsorPetName,
      shelterName,
      sponsoredPetId,
      worldSpaceId,
      worldHoldToken,
      integrationSource
    } = await req.json()
    currentPlan = plan

    const planCfg = getPlan(plan)
    let priceId = planCfg ? (process.env[planCfg.stripePriceEnvVar] || DEFAULT_STRIPE_PRICES[planCfg.id]) : undefined
    if (priceId && LEGACY_STRIPE_PRICE_FALLBACKS[priceId]) {
      priceId = LEGACY_STRIPE_PRICE_FALLBACKS[priceId]
    }
    currentPriceId = priceId

    if (!priceId || !planCfg) {
      return NextResponse.json(
        { error: 'Plan no válido' },
        { status: 400 }
      )
    }

    // Validación estricta si viene asociado a un espacio 3D coordinado
    let safeWorldSpaceId = ''
    let safeWorldHoldToken = ''
    if (typeof worldSpaceId === 'string' && worldSpaceId.trim()) {
      if (!isValidWorldSpaceId(worldSpaceId)) {
        return NextResponse.json({ error: 'Identificador de espacio 3D no válido' }, { status: 400 })
      }
      const supabase = createAdminClient()
      const { data: spaceRow } = await (supabase.from('world_spaces') as any)
        .select('space_id, plan_id')
        .eq('space_id', worldSpaceId.trim())
        .maybeSingle()

      if (!spaceRow) {
        return NextResponse.json({ error: 'El espacio 3D indicado no existe' }, { status: 404 })
      }
      if (spaceRow.plan_id !== planCfg.id) {
        return NextResponse.json(
          { error: 'El plan seleccionado no coincide con el plan del espacio 3D' },
          { status: 400 }
        )
      }
      safeWorldSpaceId = spaceRow.space_id
      safeWorldHoldToken = typeof worldHoldToken === 'string' ? worldHoldToken.trim().slice(0, 120) : ''
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
        instagram: (instagram || '').slice(0, 100),
        tiktok: (tiktok || '').slice(0, 100),
        isSponsorship: isSponsorship ? 'true' : 'false',
        sponsorName: (sponsorName || '').slice(0, 100),
        sponsorPetName: (sponsorPetName || '').slice(0, 100),
        shelterName: (shelterName || '').slice(0, 100),
        sponsoredPetId: (sponsoredPetId || '').slice(0, 100),
        ...(safeWorldSpaceId ? {
          worldSpaceId: safeWorldSpaceId.slice(0, 100),
          worldHoldToken: safeWorldHoldToken,
          integrationSource: typeof integrationSource === 'string' ? integrationSource.slice(0, 40) : 'cielo3d_to_mural',
        } : {}),
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
