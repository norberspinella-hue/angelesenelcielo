import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const status = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    resend: !!process.env.RESEND_API_KEY,
    vision: !!process.env.GOOGLE_VISION_API_KEY,
    dbConnection: false,
  }

  // Check DB connection
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('mural_slots').select('id').limit(1)
    if (!error) {
      status.dbConnection = true
    }
  } catch (err) {
    console.error('DB Health Check failed:', err)
  }

  return NextResponse.json({
    status: 'ok',
    environment: status,
    timestamp: new Date().toISOString()
  })
}
