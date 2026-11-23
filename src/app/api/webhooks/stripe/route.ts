import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { fulfillPaidCheckoutSession } from '@/lib/mural/fulfillCheckoutSession'

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

  const isPaidCheckoutEvent =
    event.type === 'checkout.session.async_payment_succeeded' ||
    event.type === 'checkout.session.completed'

  if (isPaidCheckoutEvent) {
    const session = event.data.object as Stripe.Checkout.Session
    if (
      event.type === 'checkout.session.completed' &&
      session.payment_status &&
      session.payment_status !== 'paid' &&
      session.payment_status !== 'no_payment_required'
    ) {
      return NextResponse.json({ received: true, awaitingPayment: true })
    }

    try {
      const supabase = createAdminClient()
      const result = await fulfillPaidCheckoutSession(supabase, session, { source: 'webhook' })
      return NextResponse.json({
        received: true,
        memorialId: result.memorial?.id || null,
        alreadyProcessed: result.duplicateMemorialConflict || result.duplicateCertificateConflict,
      })
    } catch (err) {
      console.error('Error procesando webhook:', err)
      return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
