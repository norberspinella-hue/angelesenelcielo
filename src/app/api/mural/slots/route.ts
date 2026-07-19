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
      .from('mural_slots')
      .select('x, y, status, plan_type, memorial_id, memorials(pet_name, photo_url, dedication)')
      .gte('x', minCol)
      .lte('x', maxCol)
      .gte('y', minRow)
      .lte('y', maxRow)
      .in('status', ['reserved_pending_payment', 'occupied']); // Only return active blocks

    if (error) {
      console.error('Error fetching mural slots:', error);
      return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }

    const mappedData = (data || []).map((slot: any) => ({
      col: slot.x,
      row: slot.y,
      width: 1,
      height: 1,
      status: slot.status,
      star_id: slot.memorial_id,
      photoUrl: slot.memorials?.photo_url || '',
      stars: {
        name: slot.memorials?.pet_name || '',
        message: slot.memorials?.dedication || '',
      }
    }));

    return NextResponse.json({
      data: mappedData,
      count: mappedData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Unexpected error in mural/slots API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
