import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { acquireWorldHold, releaseWorldHold } from '@/lib/world3d/spacesService';

export const dynamic = 'force-dynamic';

/**
 * Adquiere una reserva coordinada temporal (20 min por defecto) de plaza 3D + bloque del Mural Global.
 * Devuelve 409 en cualquier colisión, sin reubicación silenciosa.
 */
export async function POST(req: NextRequest) {
  if (process.env.WORLD3D_WRITES_PAUSED === '1') {
    return NextResponse.json(
      { success: false, error: 'WORLD3D_READONLY_MODE', message: 'Las reservas 3D están temporalmente desactivadas en modo consulta.' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } }
    );
  }
  try {
    const body = await req.json();
    const spaceId = typeof body?.spaceId === 'string' ? body.spaceId : '';
    const planId = typeof body?.planId === 'string' ? body.planId : '';
    const startX = Number(body?.startX);
    const startY = Number(body?.startY);
    const holdToken = typeof body?.holdToken === 'string' ? body.holdToken : undefined;
    const ttlMinutes = typeof body?.ttlMinutes === 'number' ? body.ttlMinutes : undefined;

    const supabase = createAdminClient();
    const result = await acquireWorldHold(supabase, {
      spaceId,
      planId,
      startX,
      startY,
      holdToken,
      ttlMinutes,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.reason,
          message:
            result.reason === 'MURAL_BLOCK_UNAVAILABLE'
              ? 'Las casillas elegidas en el Mural Global acaban de ocuparse. Por favor selecciona otro bloque manual.'
              : result.reason === 'PLAN_MISMATCH'
                ? 'El plan seleccionado no coincide con la categoría del espacio 3D.'
                : 'Este espacio 3D ya está reservado o bloqueado provisionalmente. Elige otro lugar.',
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      allocationId: result.allocationId,
      holdToken: result.holdToken,
      expiresAt: result.expiresAt,
      reason: result.reason,
    });
  } catch (err: any) {
    console.error('Error en POST /api/world-3d/hold:', err);
    return NextResponse.json({ success: false, error: 'HOLD_REQUEST_ERROR' }, { status: 500 });
  }
}

/**
 * Libera explícitamente un hold coordinado (ej. cancelación de checkout).
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const queryToken = new URL(req.url).searchParams.get('holdToken');
    const holdToken = typeof body?.holdToken === 'string' ? body.holdToken : (queryToken || '');

    if (!holdToken.trim()) {
      return NextResponse.json({ success: false, error: 'MISSING_HOLD_TOKEN' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const released = await releaseWorldHold(supabase, holdToken);
    return NextResponse.json({ success: true, released });
  } catch (err: any) {
    console.error('Error en DELETE /api/world-3d/hold:', err);
    return NextResponse.json({ success: false, error: 'HOLD_RELEASE_ERROR' }, { status: 500 });
  }
}
