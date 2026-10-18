import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { DEFAULT_SHELTER_PETS, ShelterPet } from '@/components/solidario/ApadrinarDrawer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'available' | 'sponsored'

    // Consultar memoriales que sean de protectora o plan 'corazon_eterno'
    const { data: memorials, error } = await (supabase.from('memorials') as any)
      .select('id, pet_name, species, breed, photo_url, dedication, story_answers, slot_assigned, created_at, plan_type')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) {
      console.error('Error obteniendo angelitos de protectora en /api/shelter-pets:', error);
      // En caso de error en BD, devolvemos los pilotos por defecto para que la web siga funcionando
      return NextResponse.json({
        success: true,
        source: 'fallback',
        count: DEFAULT_SHELTER_PETS.length,
        pets: DEFAULT_SHELTER_PETS,
      });
    }

    // Filtrar los que pertenecen a protectoras
    const dbShelterMemorials = (memorials || []).filter((m: any) => 
      m.plan_type === 'corazon_eterno' ||
      m.story_answers?.isShelter === true ||
      Boolean(m.story_answers?.shelterName)
    );

    // Mapear al formato ShelterPet
    const mappedDbPets: ShelterPet[] = dbShelterMemorials.map((m: any) => {
      let coords: { x: number; y: number } | undefined;
      if (m.slot_assigned && m.slot_assigned.includes(',')) {
        const [x, y] = m.slot_assigned.split(',').map((val: string) => parseInt(val.trim(), 10));
        if (!isNaN(x) && !isNaN(y)) {
          coords = { x, y };
        }
      }

      const isSponsored = Boolean(m.story_answers?.isSponsored);

      return {
        id: m.id,
        name: m.pet_name,
        shelterName: m.story_answers?.shelterName || 'Refugio Colaborador',
        shelterCity: m.story_answers?.shelterCity || m.location || 'España',
        photoUrl: m.photo_url || '/images/placeholders/first.webp',
        storyPreview: m.story_answers?.storyPreview || m.dedication || 'Un angelito en el cielo que cuida de sus compañeros.',
        starsCount: m.story_answers?.starsCount || (isSponsored ? 9 : 1),
        isSponsored,
        sponsorName: m.story_answers?.sponsorName || '',
        memorialPetName: m.story_answers?.memorialPetName || '',
        sponsoredAt: m.story_answers?.sponsoredAt,
        muralCoords: coords,
      };
    });

    // Combinar con los pilotos si no existen en la BD (evitando duplicados por ID o nombre)
    const existingNames = new Set(mappedDbPets.map((p) => p.name.toLowerCase()));
    const finalPets: ShelterPet[] = [...mappedDbPets];

    for (const defaultPet of DEFAULT_SHELTER_PETS) {
      if (!existingNames.has(defaultPet.name.toLowerCase())) {
        finalPets.push(defaultPet);
      }
    }

    // Filtrar según query param si aplica
    let filteredList = finalPets;
    if (filter === 'available') {
      filteredList = finalPets.filter((p) => !p.isSponsored);
    } else if (filter === 'sponsored') {
      filteredList = finalPets.filter((p) => p.isSponsored);
    }

    return NextResponse.json({
      success: true,
      source: 'database',
      count: filteredList.length,
      pets: filteredList,
    });
  } catch (error: any) {
    console.error('Error no controlado en /api/shelter-pets:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      count: DEFAULT_SHELTER_PETS.length,
      pets: DEFAULT_SHELTER_PETS,
    });
  }
}
