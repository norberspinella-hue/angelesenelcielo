import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Helper para verificar si un bloque de tamaño size x size está completamente libre
async function isBlockFree(supabase: any, startX: number, startY: number, size: number): Promise<boolean> {
  const { data } = await supabase
    .from('mural_slots')
    .select('status')
    .gte('x', startX)
    .lt('x', startX + size)
    .gte('y', startY)
    .lt('y', startY + size);

  if (data && data.some((s: any) => s.status === 'occupied' || s.status === 'reserved_pending_payment')) {
    return false;
  }
  return true;
}

// Helper para encontrar un bloque 3x3 disponible cerca de la zona solidaria de protectoras
async function findAvailableShelterBlock(supabase: any, preferredX?: number, preferredY?: number): Promise<{ x: number; y: number }> {
  const size = 3;
  
  // Si se indican coordenadas y están libres, usarlas
  if (preferredX !== undefined && preferredY !== undefined) {
    const free = await isBlockFree(supabase, preferredX, preferredY, size);
    if (free) {
      return { x: preferredX, y: preferredY };
    }
  }

  // Zona asignada a protectoras: cuadrantes accesibles cerca del centro (x: 470-530, y: 480-540)
  const baseCenters = [
    { x: 476, y: 494 },
    { x: 518, y: 494 },
    { x: 498, y: 516 },
    { x: 476, y: 516 },
    { x: 518, y: 516 },
    { x: 486, y: 526 },
    { x: 508, y: 526 },
  ];

  for (const center of baseCenters) {
    const free = await isBlockFree(supabase, center.x, center.y, size);
    if (free) return center;
  }

  // Búsqueda en espiral desde (500, 500)
  for (let radius = 10; radius <= 100; radius += 4) {
    for (let dx = -radius; dx <= radius; dx += 4) {
      for (let dy = -radius; dy <= radius; dy += 4) {
        const x = 500 + dx;
        const y = 500 + dy;
        if (x < 10 || y < 10 || x > 990 || y > 990) continue;
        const free = await isBlockFree(supabase, x, y, size);
        if (free) return { x, y };
      }
    }
  }

  return { x: 500, y: 530 };
}

// GET: Listar los angelitos de protectora dados de alta recientemente
export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Obtener memoriales que sean de protectora
    const { data: memorials, error } = await supabase
      .from('memorials')
      .select('id, pet_name, species, breed, photo_url, dedication, story_answers, slot_assigned, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error listando angelitos:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const shelterPets = (memorials || []).filter((m: any) => 
      m.story_answers?.isShelter === true || m.story_answers?.shelterName
    );

    return NextResponse.json({
      success: true,
      count: shelterPets.length,
      shelterPets,
    });
  } catch (error: any) {
    console.error('Error en GET /api/admin/onboarding-protectora:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

// POST: Dar de alta un nuevo angelito de protectora
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const contentType = req.headers.get('content-type') || '';

    let petName = '';
    let species = 'perro';
    let breed = '';
    let shelterName = '';
    let shelterCity = '';
    let shelterContact = '';
    let storyPreview = '';
    let status = 'disponible_apadrinar'; // 'disponible_apadrinar' | 'ya_apadrinado'
    let sponsorName = '';
    let sponsorPetName = '';
    let preferredSlotStr = '';
    let photoUrl = '';
    let thumbnailUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      petName = (formData.get('petName') as string) || '';
      species = (formData.get('species') as string) || 'perro';
      breed = (formData.get('breed') as string) || '';
      shelterName = (formData.get('shelterName') as string) || '';
      shelterCity = (formData.get('shelterCity') as string) || '';
      shelterContact = (formData.get('shelterContact') as string) || '';
      storyPreview = (formData.get('storyPreview') as string) || '';
      status = (formData.get('status') as string) || 'disponible_apadrinar';
      sponsorName = (formData.get('sponsorName') as string) || '';
      sponsorPetName = (formData.get('sponsorPetName') as string) || '';
      preferredSlotStr = (formData.get('preferredSlot') as string) || '';
      const directUrl = (formData.get('photoUrl') as string) || '';

      const file = formData.get('photoFile') as File | null;

      if (file && file.size > 0) {
        const timestamp = Date.now();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1. Imagen Original
        const originalBuffer = await sharp(buffer)
          .rotate()
          .jpeg({ quality: 90 })
          .toBuffer();

        const originalPath = `pets/original/shelter_${timestamp}.jpg`;
        await supabase.storage
          .from('pet-photos')
          .upload(originalPath, originalBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        // 2. Thumbnail cuadrado para el Canvas
        const thumbnailBuffer = await sharp(buffer)
          .rotate()
          .resize(160, 160, { fit: 'cover', position: 'centre' })
          .webp({ quality: 90 })
          .toBuffer();

        const thumbnailPath = `pets/thumbnails/shelter_${timestamp}.webp`;
        await supabase.storage
          .from('pet-photos')
          .upload(thumbnailPath, thumbnailBuffer, {
            contentType: 'image/webp',
            upsert: true,
          });

        const { data: origData } = supabase.storage.from('pet-photos').getPublicUrl(originalPath);
        const { data: thumbData } = supabase.storage.from('pet-photos').getPublicUrl(thumbnailPath);
        photoUrl = origData.publicUrl;
        thumbnailUrl = thumbData.publicUrl;
      } else if (directUrl) {
        photoUrl = directUrl;
        thumbnailUrl = directUrl;
      }
    } else {
      const body = await req.json();
      petName = body.petName || '';
      species = body.species || 'perro';
      breed = body.breed || '';
      shelterName = body.shelterName || '';
      shelterCity = body.shelterCity || '';
      shelterContact = body.shelterContact || '';
      storyPreview = body.storyPreview || '';
      status = body.status || 'disponible_apadrinar';
      sponsorName = body.sponsorName || '';
      sponsorPetName = body.sponsorPetName || '';
      preferredSlotStr = body.preferredSlot || '';
      photoUrl = body.photoUrl || '';
      thumbnailUrl = body.thumbnailUrl || body.photoUrl || '';
    }

    if (!petName.trim()) {
      return NextResponse.json({ error: 'El nombre del angelito es obligatorio' }, { status: 400 });
    }
    if (!shelterName.trim()) {
      return NextResponse.json({ error: 'El nombre de la protectora es obligatorio' }, { status: 400 });
    }

    // Coordenadas preferidas
    let prefX: number | undefined;
    let prefY: number | undefined;
    if (preferredSlotStr && preferredSlotStr.includes(',')) {
      const [px, py] = preferredSlotStr.split(',').map((s) => parseInt(s.trim(), 10));
      if (!isNaN(px) && !isNaN(py)) {
        prefX = px;
        prefY = py;
      }
    }

    // 1. Encontrar bloque 3x3 disponible
    const block = await findAvailableShelterBlock(supabase, prefX, prefY);
    const finalSlotAssignedStr = `${block.x},${block.y}`;

    // 2. Insertar en tabla memorials
    const profileSlug = `protectora-${petName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const isSponsored = status === 'ya_apadrinado';

    const { data: memorial, error: memorialError } = await (supabase.from('memorials') as any)
      .insert({
        pet_name: petName.trim(),
        species: species as any,
        breed: breed.trim() || 'Mestizo',
        email: 'protectoras@todaslasmascotasvanalcielo.com',
        location: shelterCity.trim() || 'España',
        photo_url: photoUrl || '/images/placeholders/first.webp',
        death_date: new Date().toISOString().split('T')[0],
        dedication: storyPreview.trim() || 'Esperando en el cielo con amor eterno.',
        plan_type: 'recuerdo_eterno',
        slots_count: isSponsored ? 9 : 1,
        price_paid: 0,
        currency: 'EUR',
        payment_status: 'paid',
        visibility: 'public',
        publication_status: 'published',
        moderation_status: 'approved',
        slot_assigned: finalSlotAssignedStr,
        profile_slug: profileSlug,
        story_answers: {
          isShelter: true,
          shelterName: shelterName.trim(),
          shelterCity: shelterCity.trim() || 'España',
          shelterContact: shelterContact.trim(),
          storyPreview: storyPreview.trim(),
          starsCount: isSponsored ? 9 : 1,
          isSponsored,
          sponsorName: sponsorName.trim() || '',
          sponsorPetName: sponsorPetName.trim() || '',
          onboardedAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (memorialError) {
      console.error('Error insertando memorial de protectora:', memorialError);
      return NextResponse.json({ error: memorialError.message }, { status: 500 });
    }

    // 3. Registrar los 9 slots en mural_slots
    const slotsToUpsert = [];
    for (let dx = 0; dx < 3; dx++) {
      for (let dy = 0; dy < 3; dy++) {
        slotsToUpsert.push({
          x: block.x + dx,
          y: block.y + dy,
          status: 'occupied',
          memorial_id: memorial.id,
          plan_type: 'recuerdo_eterno',
          thumbnail_url: thumbnailUrl || photoUrl || '/images/placeholders/first.webp',
        });
      }
    }

    const { error: slotsError } = await (supabase.from('mural_slots') as any)
      .upsert(slotsToUpsert, { onConflict: 'x,y' });

    if (slotsError) {
      console.error('Error reservando slots de protectora:', slotsError);
    }

    return NextResponse.json({
      success: true,
      message: `¡${petName} ha sido dado de alta con éxito en el mural!`,
      memorialId: memorial.id,
      slotAssigned: finalSlotAssignedStr,
      coords: block,
      profileSlug: memorial.profile_slug,
      muralUrl: `/mural-global?highlight=${block.x},${block.y}&zoom=true`,
    });
  } catch (error: any) {
    console.error('Error en POST /api/admin/onboarding-protectora:', error);
    return NextResponse.json({ error: error.message || 'Error procesando alta' }, { status: 500 });
  }
}
