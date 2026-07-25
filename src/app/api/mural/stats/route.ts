import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { count: occupied } = await (supabase
    .from('memorials') as any)
    .select('id', { count: 'exact', head: true })
    .eq('payment_status', 'paid')

  const { count: founders } = await (supabase
    .from('memorials') as any)
    .select('id', { count: 'exact', head: true })
    .eq('payment_status', 'paid')
    .eq('plan_type', 'recuerdo_eterno')

  const total = 1000000
  const free = total - (occupied || 0)

  return NextResponse.json(
    {
      occupied: occupied || 0,
      free: free,
      founders: founders || 0,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    }
  )
}
