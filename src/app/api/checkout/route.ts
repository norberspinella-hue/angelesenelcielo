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
      if (!safeWorldHoldToken) {
        return NextResponse.json(
          { error: 'Se requiere una reserva temporal activa (hold) para este espacio 3D' },
          { status: 409 }
        )
      }
      const { data: holdCheck } = await (supabase.from('world_space_allocations') as any)
        .select('id, status, expires_at')
        .eq('hold_token', safeWorldHoldToken)
        .eq('space_id', safeWorldSpaceId)
        .eq('status', 'reserved_pending_payment')
        .maybeSingle()

      if (!holdCheck || (holdCheck.expires_at && Date.parse(holdCheck.expires_at) <= Date.now())) {
        return NextResponse.json(
          { error: 'La reserva temporal del espacio 3D ha caducado o ya no está disponible' },
          { status: 409 }
        )
      }
    }

    // Recuperar detalles del precio para saber si es recurrente o de un solo pago
    const price = await stripe.prices.retrieve(priceId)
    const mode = price.type === 'recurring' ? 'subscription' : 'payment'
    const baseUrl = (process.env.NEXT_PUBLIC_URL || req.nextUrl.origin).replace(/\/$/, '')
    const cancelUrl = safeWorldSpaceId
      ? `${baseUrl}/mural-global?space_id=${encodeURIComponent(safeWorldSpaceId)}&plan=${encodeURIComponent(planCfg.id)}&source=cielo3d`
      : `${baseUrl}/mural-global`
    // Stripe Checkout admite expires_at entre 30 min y 24h; usamos exactamente 30 min en flujo 3D
    const checkoutExpiresAt = Math.floor(Date.now() / 1000) + 30 * 60

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: mode,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      ...(safeWorldSpaceId ? { expires_at: checkoutExpiresAt } : {}),
      success_url: `${baseUrl}/gracias/{CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
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

    if (safeWorldSpaceId && safeWorldHoldToken) {
      try {
        const supabase = createAdminClient()
        await (supabase as any).rpc('extend_coordinated_hold_for_checkout', {
          p_hold_token: safeWorldHoldToken,
          p_space_id: safeWorldSpaceId,
          p_stripe_session_id: session.id,
          p_ttl_minutes: 35,
        })
      } catch (extErr) {
        console.error('Error extendiendo hold 35 min tras crear sesión Checkout:', extErr)
      }
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      expiresAt: session.expires_at,
    })
  } catch (error) {
    console.error('Stripe checkout error for plan:', currentPlan, 'priceId:', currentPriceId, error)
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago' },
      { status: 500 }
    )
  }
}
