import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET: Listar memoriales con filtros, búsqueda y paginación
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'public' | 'hidden' | 'shelter' | 'standard'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '25', 10)));
    const offset = (page - 1) * limit;

    let query = supabase
      .from('memorials')
      .select('id, pet_name, species, breed, email, location, dedication, photo_url, plan_type, price_paid, visibility, moderation_status, slot_assigned, profile_slug, story_answers, created_at', { count: 'exact' });

    // Filtros
    if (filter === 'public') {
      query = query.eq('visibility', 'public').neq('moderation_status', 'rejected');
    } else if (filter === 'hidden') {
      query = query.or('visibility.eq.private,moderation_status.eq.rejected');
    }

    // Búsqueda por nombre de mascota o email
    if (search) {
      query = query.or(`pet_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Orden por más reciente
    query = query.order('created_at', { ascending: false });

    // Paginación
    query = query.range(offset, offset + limit - 1);

    const { data: memorials, count, error } = await (query as any);

    if (error) {
      console.error('Error en GET /api/admin/moderacion:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filtrado en memoria para protectoras vs particulares si aplica
    let filteredMemorials = memorials || [];
    if (filter === 'shelter') {
      filteredMemorials = filteredMemorials.filter((m: any) => 
        m.story_answers?.isShelter === true || Boolean(m.story_answers?.shelterName)
      );
    } else if (filter === 'standard') {
      filteredMemorials = filteredMemorials.filter((m: any) => 
        !m.story_answers?.isShelter && !m.story_answers?.shelterName
      );
    }

    // Estadísticas globales rápidas
    const { data: allStats } = await (supabase
      .from('memorials') as any)
      .select('visibility, moderation_status, story_answers');

    const totalCount = allStats?.length || 0;
    const publicCount = (allStats || []).filter((m: any) => m.visibility === 'public' && m.moderation_status !== 'rejected').length;
    const hiddenCount = (allStats || []).filter((m: any) => m.visibility === 'private' || m.moderation_status === 'rejected').length;
    const shelterCount = (allStats || []).filter((m: any) => m.story_answers?.isShelter || m.story_answers?.shelterName).length;

    return NextResponse.json({
      success: true,
      memorials: filteredMemorials,
      total: count || totalCount,
      page,
      limit,
      totalPages: Math.ceil((count || totalCount) / limit),
      stats: {
        totalCount,
        publicCount,
        hiddenCount,
        shelterCount,
      },
    });
  } catch (error: any) {
    console.error('Error no controlado en /api/admin/moderacion:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

// PATCH: Actualizar visibilidad, estado de moderación o dedicatoria
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const { id, visibility, moderation_status, dedication, pet_name, socialHandle } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID del memorial es obligatorio' }, { status: 400 });
    }

    // Mapear visibilidad al enum de postgres: 'public' o 'private'
    let dbVisibility: 'public' | 'private' | undefined = undefined;
    if (visibility !== undefined) {
      dbVisibility = (visibility === 'hidden' || visibility === 'private') ? 'private' : 'public';
    }

    // Mapear estado de moderación acorde
    let dbModeration = moderation_status;
    if (dbVisibility === 'private' && !moderation_status) {
      dbModeration = 'rejected';
    } else if (dbVisibility === 'public' && !moderation_status) {
      dbModeration = 'approved';
    }

    const updatePayload: any = {};
    if (dbVisibility !== undefined) updatePayload.visibility = dbVisibility;
    if (dbModeration !== undefined) updatePayload.moderation_status = dbModeration;
    if (dedication !== undefined) updatePayload.dedication = dedication;
    if (pet_name !== undefined) updatePayload.pet_name = pet_name;

    if (socialHandle !== undefined) {
      const { data: current } = await (supabase
        .from('memorials') as any)
        .select('story_answers')
        .eq('id', id)
        .single();
      const currentStoryAnswers = current?.story_answers || {};
      updatePayload.story_answers = {
        ...currentStoryAnswers,
        socialHandle: socialHandle ? socialHandle.replace(/^@/, '').trim() : '',
      };
    }

    // 1. Actualizar la tabla memorials
    const { data: updated, error } = await (supabase
      .from('memorials') as any)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar memorial en moderación:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Si cambia la visibilidad, sincronizar los slots en mural_slots
    if (dbVisibility !== undefined) {
      const slotStatus = dbVisibility === 'private' ? 'blocked_admin' : 'occupied';
      const { error: slotErr } = await (supabase
        .from('mural_slots') as any)
        .update({ status: slotStatus })
        .eq('memorial_id', id);

      if (slotErr) {
        console.error('Error al sincronizar mural_slots en moderación:', slotErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Memorial actualizado con éxito',
      memorial: updated,
    });
  } catch (error: any) {
    console.error('Error no controlado en PATCH /api/admin/moderacion:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
