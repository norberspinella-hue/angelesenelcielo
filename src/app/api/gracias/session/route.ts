import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { fulfillPaidCheckoutSession } from '@/lib/mural/fulfillCheckoutSession'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
})

export const dynamic = 'force-dynamic';

function buildMemorialResponse(memorial: any) {
  const answers = memorial.story_answers || {}
  const isSponsorship = Boolean(
    answers.isSponsorship ||
    answers.isSponsored ||
    memorial.plan_type?.toLowerCase().includes('apadrinamiento')
  )
  return NextResponse.json({
    petName: memorial.pet_name || 'Tu ángel',
    petDate: memorial.death_date || '',
    plan: memorial.plan_type || '',
    email: memorial.email || '',
    photoUrl: memorial.photo_url || '',
    thumbnailUrl: memorial.photo_url || '',
    species: memorial.species || '',
    breed: memorial.breed || '',
    birthDate: memorial.birth_date || '',
    location: memorial.location || '',
    dedication: memorial.dedication || '',
    slug: memorial.profile_slug || '',
    slotId: memorial.slot_assigned || '',
    sponsorName: answers.sponsorName || 'Padrino Solidario',
    shelterName: answers.shelterName || 'Refugio Nueva Vida',
    shelterPetName: memorial.pet_name || 'Juliette',
    sponsorPetName: answers.sponsorPetName || answers.memorialPetName || '',
    isSponsorship,
  })
}

async function findMemorialInDb(sessionId: string) {
  const supabase = createAdminClient()
  let foundMemorial: any = null

  const { data: cert } = await (supabase.from('certificates') as any)
    .select('*')
    .eq('order_id', sessionId)
    .maybeSingle()

  if (cert) {
    if (cert.user_email && cert.pet_name) {
      const { data: mem } = await (supabase.from('memorials') as any)
        .select('*')
        .eq('email', cert.user_email)
        .eq('pet_name', cert.pet_name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (mem) foundMemorial = mem
    }
    if (!foundMemorial && cert.pet_name) {
      const { data: memByName } = await (supabase.from('memorials') as any)
        .select('*')
        .eq('pet_name', cert.pet_name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (memByName) foundMemorial = memByName
    }
  }

  if (!foundMemorial) {
    const { data: memBySession } = await (supabase.from('memorials') as any)
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()
    if (memBySession) foundMemorial = memBySession
  }

  if (!foundMemorial && sessionId.startsWith('order_')) {
    const suffix = sessionId.replace('order_', '')
    if (suffix.length >= 4) {
      const { data: memBySuffix } = await (supabase.from('memorials') as any)
        .select('*')
        .ilike('stripe_session_id', '%' + suffix)
        .maybeSingle()
      if (memBySuffix) foundMemorial = memBySuffix
    }
  }

  if (!foundMemorial) {
    const { data: memById } = await (supabase.from('memorials') as any)
      .select('*')
      .eq('id', sessionId)
      .maybeSingle()
    if (memById) foundMemorial = memById
  }

  if (!foundMemorial && (sessionId.startsWith('order_') || sessionId.startsWith('AEC-'))) {
    const { data: recentMems } = await (supabase.from('memorials') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    if (recentMems && recentMems.length > 0) {
      const match = recentMems.find((m: any) => m.story_answers?.isSponsorship || m.story_answers?.isSponsored)
      if (match) foundMemorial = match
    }
  }

  return foundMemorial
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID requerido' },
      { status: 400 }
    )
  }

  if (!sessionId.startsWith('cs_')) {
    const dbMemorial = await findMemorialInDb(sessionId)
    if (dbMemorial) {
      return buildMemorialResponse(dbMemorial)
    }
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      const dbMemorial = await findMemorialInDb(sessionId)
      if (dbMemorial) {
        return buildMemorialResponse(dbMemorial)
      }
      return NextResponse.json(
        { error: 'Sesión no encontrada en Stripe' },
        { status: 404 }
      )
    }

    const supabase = createAdminClient()
    const isPaid =
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required' ||
      session.status === 'complete'

    let finalSlotId = session.metadata?.slotId || ''
    let resolvedSlug = ''

    if (isPaid && session.metadata?.petName && session.metadata?.email) {
      const result = await fulfillPaidCheckoutSession(supabase, session, { source: 'gracias' })
      if (result.slotAssigned) finalSlotId = result.slotAssigned
      if (result.memorial?.profile_slug) resolvedSlug = result.memorial.profile_slug
    }

    return NextResponse.json({
      petName: session.metadata?.petName || 'Tu ángel',
      petDate: session.metadata?.petDate || '',
      plan: session.metadata?.plan || '',
      email: session.metadata?.email || '',
      photoUrl: session.metadata?.photoUrl || '',
      thumbnailUrl: session.metadata?.thumbnailUrl || '',
      species: session.metadata?.species || '',
      breed: session.metadata?.breed || '',
      birthDate: session.metadata?.birthDate || '',
      location: session.metadata?.location || '',
      dedication: session.metadata?.dedication || '',
      slug: resolvedSlug,
      slotId: finalSlotId,
      sponsorName: session.metadata?.sponsorName || session.customer_details?.name || 'Padrino Solidario',
      shelterName: session.metadata?.shelterName || 'Refugio Nueva Vida',
      shelterPetName: session.metadata?.shelterPetName || session.metadata?.petName || 'Juliette',
      sponsorPetName: session.metadata?.sponsorPetName || '',
      isSponsorship: session.metadata?.isSponsorship === 'true' ||
        session.metadata?.plan?.toLowerCase().includes('corazon') ||
        session.metadata?.plan?.toLowerCase().includes('apadrinamiento'),
    })
  } catch (error) {
    console.error('Error recuperando sesión de Stripe, probando búsqueda en base de datos:', error)
    const dbMemorial = await findMemorialInDb(sessionId)
    if (dbMemorial) {
      return buildMemorialResponse(dbMemorial)
    }
    return NextResponse.json(
      { error: 'Sesión no encontrada' },
      { status: 404 }
    )
  }
}
