import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient()
  
  const { count: occupied } = await (supabase
    .from('mural_slots') as any)
    .select('id', { count: 'exact', head: true })
    .eq('status', 'occupied')

  const { count: founders } = await (supabase
    .from('mural_slots') as any)
    .select('id', { count: 'exact', head: true })
    .eq('plan_type', 'recuerdo_eterno')
    .eq('status', 'occupied')

  const total = 1000000
  const free = total - (occupied || 0)

  return NextResponse.json({
    occupied: occupied || 0,
    free: free,
    founders: founders || 0,
  })
}
