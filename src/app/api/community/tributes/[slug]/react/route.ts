import { NextRequest, NextResponse } from 'next/server';
import { computeBlindIndex, recordTributeReaction } from '@/lib/community/tributesDb';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';
import { verifyCsrfOrigin } from '@/lib/community/csrfGuard';
import { enforceRateLimit, extractClientIp } from '@/lib/community/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada.' }, { status: 404 });
    }

    const csrfError = verifyCsrfOrigin(req);
    if (csrfError) return csrfError;

    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug requerido.' }, { status: 400 });
    }

    const rateError = await enforceRateLimit(req, 'react', slug);
    if (rateError) return rateError;

    const body = await req.json();
    const reactionType = body?.reactionType;
    if (!['candle', 'hug', 'support'].includes(reactionType)) {
      return NextResponse.json({ success: false, error: 'Tipo de reacción inválido.' }, { status: 400 });
    }

    const ipHash = computeBlindIndex(`react:${extractClientIp(req)}`);
    const result = await recordTributeReaction(slug, reactionType, ipHash);

    if (!result) {
      return NextResponse.json({ success: false, error: 'Homenaje no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      recorded: result.recorded,
      alreadyReacted: result.alreadyReacted,
      counts: {
        candlesCount: result.candlesCount,
        hugsCount: result.hugsCount,
        supportCount: result.supportCount,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'No se pudo registrar la reacción.' }, { status: err.status || 500 });
  }
}
