import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'mock_key_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-04-22.dahlia' as any,
  typescript: true,
})
