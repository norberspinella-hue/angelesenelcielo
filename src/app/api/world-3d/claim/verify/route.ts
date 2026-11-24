import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { SPECIAL_PROTECTED_MEMORIAL_IDS, hashClaimToken } from '@/lib/world3d/spacesService';
import {
  FAMILY_3D_COOKIE_NAME,
  createFamily3DSessionToken,
} from '@/lib/world3d/familySession';

export const dynamic = 'force-dynamic';

/**
 * Canjea un token opaco de `world_3d_claim_tokens` (de un solo uso) mediante la función transaccional
 * `claim_world_space_with_token`. Nunca acepta `community_guardian_tokens` ni `community_free`.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawToken = typeof body?.token === 'string' ? body.token.trim() : '';

    if (rawToken.length < 16 || rawToken.length > 256) {
      return NextResponse.json({ success: false, error: 'TOKEN_INVALID' }, { status: 400 });
    }

    const tokenHash = hashClaimToken(rawToken);
    const supabase = createAdminClient();

    // Comprobación previa explícita para garantizar bloqueo inamovible de Chloé y Juliette
    const { data: tokPreview } = await (supabase.from('world_3d_claim_tokens') as any)
      .select('memorial_id')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (tokPreview?.memorial_id && SPECIAL_PROTECTED_MEMORIAL_IDS.has(tokPreview.memorial_id)) {
      return NextResponse.json(
        { success: false, error: 'SPECIAL_MEMORIAL_PROTECTED' },
        { status: 403 }
      );
    }

    const { data, error } = await (supabase as any).rpc('claim_world_space_with_token', {
      p_token_hash: tokenHash,
    });

    if (error) {
      console.error('Error RPC claim_world_space_with_token:', error);
      return NextResponse.json({ success: false, error: 'CLAIM_VERIFY_ERROR' }, { status: 500 });
    }

    const row: any = Array.isArray(data) ? data[0] : data;
    if (!row || !row.claimed) {
      const reason = row?.reason || 'TOKEN_INVALID';
      const status =
        reason === 'TOKEN_EXPIRED' ? 410 :
        reason === 'TOKEN_ALREADY_USED' || reason === 'SPACE_NOT_FREE' || reason === 'CONFLICT' || reason === 'MEMORIAL_ALREADY_HAS_WORLD_SPACE' ? 409 :
        reason === 'COMMUNITY_FREE_NO_3D_RIGHT' || reason === 'MEMORIAL_INELIGIBLE' || reason === 'MEMORIAL_EXPIRED' ? 403 :
        400;

      return NextResponse.json(
        {
          success: false,
          error: reason,
          memorialId: row?.memorial_id || null,
          spaceId: row?.space_id || null,
        },
        { status }
      );
    }

    const res = NextResponse.json({
      success: true,
      reason: row.reason || 'CLAIMED',
      allocationId: row.allocation_id,
      memorialId: row.memorial_id,
      spaceId: row.space_id,
      planId: row.plan_id,
    });

    // Emitir sesión familiar firmada HttpOnly (sin dependencia de ChatGPT ni secretos en URL)
    try {
      const { data: claimedMem } = await (supabase.from('memorials') as any)
        .select('id, email')
        .eq('id', row.memorial_id)
        .maybeSingle();

      if (claimedMem?.email) {
        const normalizedEmail = String(claimedMem.email).trim().toLowerCase();
        const { data: familyMems } = await (supabase.from('memorials') as any)
          .select('id, story_answers')
          .ilike('email', normalizedEmail)
          .eq('payment_status', 'paid')
          .eq('publication_status', 'published');

        const eligibleIds = (familyMems || [])
          .filter((m: any) => !m.story_answers?.isCommunity)
          .map((m: any) => m.id);

        const sessionCookie = createFamily3DSessionToken({
          emailHash: hashClaimToken(normalizedEmail),
          memorialIds: eligibleIds.length > 0 ? eligibleIds : [row.memorial_id],
        });

        if (sessionCookie) {
          res.cookies.set(FAMILY_3D_COOKIE_NAME, sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
          });
        }
      }
    } catch {
      // No bloquear la reclamación si falla el cookie opcional de sesión 3D
    }

    return res;
  } catch (err: any) {
    console.error('Error en POST /api/world-3d/claim/verify:', err);
    return NextResponse.json({ success: false, error: 'CLAIM_VERIFY_INTERNAL_ERROR' }, { status: 500 });
  }
}
