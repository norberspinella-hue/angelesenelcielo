import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isValidWorldSpaceId } from '@/lib/world3d/contracts';
import { prepareWorld3DClaimToken } from '@/lib/world3d/spacesService';
import { sendWorld3DClaimMagicLink } from '@/lib/world3d/claimEmail';

export const dynamic = 'force-dynamic';

const NEUTRAL_CLAIM_MESSAGE =
  'Si existe un homenaje pagado compatible asociado a ese correo (del mismo plan y aún sin espacio 3D asignado), hemos enviado un enlace temporal de un solo uso para vincular este lugar.';

/**
 * Solicita un Magic Link de un solo uso en `world_3d_claim_tokens` para familias con un
 * homenaje ya pagado en el Mural Global (separado estrictamente de `community_guardian_tokens`).
 * Respuesta no enumeradora ante cualquier resultado de correo o elegibilidad.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const spaceId = typeof body?.spaceId === 'string' ? body.spaceId.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    if (!isValidWorldSpaceId(spaceId)) {
      return NextResponse.json({ success: false, error: 'INVALID_SPACE_ID' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'INVALID_EMAIL' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const outcome = await prepareWorld3DClaimToken(supabase, { spaceId, email });

    if (!outcome.spaceExists) {
      return NextResponse.json({ success: false, error: 'WORLD_SPACE_NOT_FOUND' }, { status: 404 });
    }

    if (!outcome.spaceFree) {
      return NextResponse.json(
        {
          success: false,
          error: outcome.internalReason,
          message: 'Este espacio 3D ya no está disponible para reclamar.',
        },
        { status: 409 }
      );
    }

    if (outcome.issued && outcome.rawToken && outcome.normalizedEmail) {
      await sendWorld3DClaimMagicLink({
        requestedEmail: outcome.normalizedEmail,
        petName: outcome.petName || 'tu angelito',
        spaceId,
        spaceDisplayName: outcome.spaceDisplayName || spaceId,
        rawToken: outcome.rawToken,
        appOrigin: req.nextUrl.origin,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: NEUTRAL_CLAIM_MESSAGE,
    });
  } catch (err: any) {
    console.error('Error en POST /api/world-3d/claim/request:', err);
    return NextResponse.json({ success: false, error: 'CLAIM_REQUEST_ERROR' }, { status: 500 });
  }
}
