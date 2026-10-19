import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = createAdminClient();
  
  const { count: occupied } = await (supabase
    .from('memorials') as any)
    .select('id', { count: 'exact', head: true })
    .eq('payment_status', 'paid');

  const { data: foundersData } = await (supabase
    .from('memorials') as any)
    .select('id, story_answers')
    .eq('payment_status', 'paid')
    .in('plan_type', ['recuerdo_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito']);

  const foundersCount = (foundersData || []).filter((p: any) => !p.story_answers?.isShelter).length;

  const total = 1000000;
  const free = total - (occupied || 0);

  return NextResponse.json(
    {
      occupied: occupied || 0,
      free: free,
      founders: foundersCount,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    }
  );
}
