import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const revalidate = 0

export async function GET() {
  const supabase = createAdminClient()

  // Últimos 8 añadidos
  const { data: latest } = await supabase
    .from('memorials')
    .select('id, pet_name, photo_url, profile_slug')
    .eq('payment_status', 'paid')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(8)

  // Últimos 8 fundadores
  const { data: founders } = await supabase
    .from('memorials')
    .select('id, pet_name, photo_url, profile_slug')
    .eq('payment_status', 'paid')
    .eq('plan_type', 'recuerdo_eterno')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(8)

  return NextResponse.json(
    { latest: latest || [], founders: founders || [] },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
