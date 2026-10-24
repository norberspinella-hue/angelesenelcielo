import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET: Obtener recuerdos de la comunidad
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const species = searchParams.get('species'); // 'perro', 'gato', 'otro', o 'todos'
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const supabase = createAdminClient();

    let query = (supabase.from('memorials') as any)
      .select('id, pet_name, species, photo_url, dedication, story_answers, created_at, profile_slug')
      .eq('publication_status', 'published')
      .eq('visibility', 'public')
      .filter('story_answers->>isCommunity', 'eq', 'true')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (species && species !== 'todos') {
      if (species === 'otro') {
        query = query.not('species', 'in', '("perro","gato")');
      } else {
        query = query.eq('species', species);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching community memories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const memories = (data || []).map((m: any) => ({
      id: m.id,
      petName: m.pet_name,
      species: m.species,
      photoUrl: m.pet_name === 'Chloe' ? (m.photo_url || '/images/comunidad/chloe.jpg') : (m.photo_url || '/images/placeholders/first.webp'),
      message: m.dedication,
      authorName: m.story_answers?.authorName || `Familia de ${m.pet_name}`,
      yearsOrDates: m.story_answers?.yearsOrDates || '',
      instagram: m.story_answers?.instagram || '',
      tiktok: m.story_answers?.tiktok || '',
      candlesCount: m.story_answers?.candlesCount || 0,
      supportCount: m.story_answers?.supportCount || 0,
      hugsCount: m.story_answers?.hugsCount || 0,
      profileSlug: m.profile_slug,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ memories });
  } catch (err: any) {
    console.error('Unexpected error in community memories GET:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Publicar nuevo recuerdo en la comunidad
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { petName, message, species = 'perro', authorName, yearsOrDates, photoUrl, instagram, tiktok, isPublic = true } = body;

    if (!petName || !message) {
      return NextResponse.json({ error: 'El nombre y el mensaje son obligatorios' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const timestamp = Date.now();
    const cleanPetName = petName.trim();
    const cleanAuthor = authorName?.trim() || `Familia de ${cleanPetName}`;
    const cleanInstagram = instagram ? String(instagram).trim().replace(/^@+/, '') : '';
    const cleanTiktok = tiktok ? String(tiktok).trim().replace(/^@+/, '') : '';
    const slug = `${cleanPetName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`;

    const newRecord = {
      email: 'comunidad@todaslasmascotasvanalcielo.com',
      pet_name: cleanPetName,
      species: ['perro', 'gato', 'conejo', 'pajaro', 'caballo'].includes(species) ? species : 'otro',
      photo_url: photoUrl || '/images/placeholders/first.webp',
      death_date: new Date().toISOString().split('T')[0],
      dedication: message.trim(),
      story_answers: {
        isCommunity: true,
        authorName: cleanAuthor,
        yearsOrDates: yearsOrDates?.trim() || '',
        instagram: cleanInstagram,
        tiktok: cleanTiktok,
        candlesCount: 1, // La primera vela la enciende quien publica
        supportCount: 0,
        hugsCount: 0,
        isPublicAllowed: isPublic,
      },
      plan_type: 'recuerdo_inicial',
      price_paid: 0.0,
      currency: 'EUR',
      slots_count: 1,
      profile_slug: slug,
      visibility: isPublic ? 'public' : 'private',
      publication_status: 'published',
      moderation_status: 'approved',
      slot_assigned: null, // No ocupa casilla en el mural
    };

    const { data, error } = await (supabase.from('memorials') as any)
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('Error inserting community memory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      memory: {
        id: data.id,
        petName: data.pet_name,
        message: data.dedication,
        authorName: cleanAuthor,
        photoUrl: data.photo_url,
        instagram: cleanInstagram,
        tiktok: cleanTiktok,
        candlesCount: 1,
        supportCount: 0,
        hugsCount: 0,
      }
    });
  } catch (err: any) {
    console.error('Unexpected error in community memories POST:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
