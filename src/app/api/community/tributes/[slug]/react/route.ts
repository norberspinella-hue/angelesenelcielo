import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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

    // Límite persistente por IP para frenar bots que descarten cookies
    const rateError = await enforceRateLimit(req, 'react', slug);
    if (rateError) return rateError;

    const body = await req.json();
    const reactionType = body?.reactionType;
    if (!['candle', 'hug', 'support'].includes(reactionType)) {
      return NextResponse.json({ success: false, error: 'Tipo de reacción inválido.' }, { status: 400 });
    }

    // Identificador pseudonimizado de navegador/dispositivo para permitir varias personas en una misma Wi-Fi/IP
    const existingVisitorId = req.cookies.get('community_react_id')?.value;
    const visitorId = existingVisitorId && /^[a-f0-9]{32}$/i.test(existingVisitorId)
      ? existingVisitorId
      : crypto.randomBytes(16).toString('hex');

    const ipHash = computeBlindIndex(`react:${extractClientIp(req)}:${visitorId}`);
    const result = await recordTributeReaction(slug, reactionType, ipHash);

    if (!result) {
      return NextResponse.json({ success: false, error: 'Homenaje no encontrado.' }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      recorded: result.recorded,
      alreadyReacted: result.alreadyReacted,
      counts: {
        candlesCount: result.candlesCount,
        hugsCount: result.hugsCount,
        supportCount: result.supportCount,
      }
    });

    if (!existingVisitorId) {
      response.cookies.set('community_react_id', visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || req.nextUrl.protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'No se pudo registrar la reacción.' }, { status: err.status || 500 });
  }
}
