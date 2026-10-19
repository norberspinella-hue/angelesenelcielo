import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = createAdminClient()

  // Últimos 8 añadidos (excluyendo protectoras para homenajes de familias)
  const { data: latestData } = await (supabase
    .from('memorials') as any)
    .select('id, pet_name, photo_url, profile_slug, story_answers')
    .eq('payment_status', 'paid')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(16)

  const latest = (latestData || [])
    .filter((p: any) => !p.story_answers?.isShelter)
    .slice(0, 8);

  // Últimos 8 fundadores
  const { data: foundersData } = await (supabase
    .from('memorials') as any)
    .select('id, pet_name, photo_url, profile_slug, story_answers')
    .eq('payment_status', 'paid')
    .in('plan_type', ['recuerdo_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito'])
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(16)

  const founders = (foundersData || [])
    .filter((p: any) => !p.story_answers?.isShelter)
    .slice(0, 8);

  return NextResponse.json(
    { latest, founders },
    { 
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      } 
    }
  )
}
