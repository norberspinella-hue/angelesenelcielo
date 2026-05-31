import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minCol = parseInt(searchParams.get('minCol') || '0');
    const maxCol = parseInt(searchParams.get('maxCol') || '1000');
    const minRow = parseInt(searchParams.get('minRow') || '0');
    const maxRow = parseInt(searchParams.get('maxRow') || '1000');

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch occupied blocks within the requested coordinate range
    const { data, error } = await supabase
      .from('mural_blocks')
      .select('col, row, width, height, status, star_id, stars(name, photo_url)')
      .gte('col', minCol)
      .lte('col', maxCol)
      .gte('row', minRow)
      .lte('row', maxRow)
      .in('status', ['reserved', 'occupied']); // Only return active blocks

    if (error) {
      console.error('Error fetching mural slots:', error);
      return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Unexpected error in mural/slots API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
