import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export interface PublicCommunityMemoryDto {
  id: string;
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  photoUrl: string;
  message: string;
  authorName: string;
  yearsOrDates: string;
  instagram: string;
  tiktok: string;
  candlesCount: number;
  supportCount: number;
  hugsCount: number;
  profileSlug: string | null;
  createdAt: string;
}

function sanitizeToPublicMemory(m: any): PublicCommunityMemoryDto {
  const isChloe = String(m.pet_name || '').toLowerCase() === 'chloe';
  const rawStory = (typeof m.story_answers === 'object' && m.story_answers !== null) ? m.story_answers : {};

  return {
    id: String(m.id || ''),
    petName: String(m.pet_name || ''),
    species: m.species === 'gato' ? 'gato' : m.species === 'perro' ? 'perro' : 'otro',
    photoUrl: isChloe 
      ? (m.photo_url || '/images/comunidad/chloe.jpg') 
      : (m.photo_url || '/images/comunidad/pet-max.webp'),
    message: String(m.dedication || ''),
    authorName: String(rawStory.authorName || `Familia de ${m.pet_name || 'tu ángel'}`),
    yearsOrDates: String(rawStory.yearsOrDates || ''),
    instagram: String(rawStory.instagram || ''),
    tiktok: String(rawStory.tiktok || ''),
    candlesCount: Number(rawStory.candlesCount || 0),
    supportCount: Number(rawStory.supportCount || 0),
    hugsCount: Number(rawStory.hugsCount || 0),
    profileSlug: m.profile_slug ? String(m.profile_slug) : null,
    createdAt: String(m.created_at || ''),
  };
}

// GET: Obtener recuerdos de la comunidad con lista explícita de campos públicos (Whitelisting estricto)
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

    // Filtrar mediante whitelist estricta: NUNCA se expone story_answers completo, ni emails, ni identificadores privados
    const memories: PublicCommunityMemoryDto[] = (data || []).map(sanitizeToPublicMemory);

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
    const { 
      petName, 
      message, 
      species = 'perro', 
      authorName, 
      yearsOrDates, 
      photoUrl, 
      instagram, 
      tiktok, 
      isPublic = true,
      socialShareAllowed = false,
      anniversaryDate = '',
      anniversaryEmail = '',
    } = body;

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
        socialShareAllowed: Boolean(socialShareAllowed),
        anniversaryDate: anniversaryDate ? String(anniversaryDate).trim() : '',
        anniversaryEmail: anniversaryEmail ? String(anniversaryEmail).trim() : '',
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
