import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FOUNDER_CONFIG } from '@/lib/founderConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count, error } = await supabase
      .from('mural_slots')
      .select('id', { count: 'exact', head: true })
      .eq('plan', 'corazon_eterno')
      .eq('is_founder', true);

    if (error) {
      console.error('Error fetching founders count:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: count || 0,
      maxFounders: FOUNDER_CONFIG.maxFounders,
      available: (count || 0) < FOUNDER_CONFIG.maxFounders
    });
  } catch (error: any) {
    console.error('Error in founders API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
