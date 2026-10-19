import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { FOUNDER_CONFIG } from '@/lib/founderConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: foundersData, error } = await (supabase
      .from('memorials') as any)
      .select('id, story_answers')
      .eq('payment_status', 'paid')
      .in('plan_type', ['recuerdo_eterno', 'angelito_protector', 'galaxia_amor', 'vinculo_infinito']);

    if (error) {
      console.error('Error fetching founders count:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const count = (foundersData || []).filter((p: any) => !p.story_answers?.isShelter).length;

    return NextResponse.json(
      {
        count,
        maxFounders: FOUNDER_CONFIG.maxFounders,
        available: count < FOUNDER_CONFIG.maxFounders
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );
  } catch (error: any) {
    console.error('Error in founders API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
