import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
})

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID requerido' },
      { status: 400 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
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
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Sesión no encontrada' },
      { status: 404 }
    )
  }
}
