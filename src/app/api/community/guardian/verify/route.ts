import { NextRequest, NextResponse } from 'next/server';
import { verifyAndExchangeMagicLink } from '@/lib/community/tributesDb';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';
import { verifyCsrfOrigin } from '@/lib/community/csrfGuard';
import { enforceRateLimit } from '@/lib/community/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada' }, { status: 404 });
    }

    const csrfError = verifyCsrfOrigin(req);
    if (csrfError) return csrfError;

    const rateError = await enforceRateLimit(req, 'verify');
    if (rateError) return rateError;

    const { token, tributeSlug } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 400 });
    }

    const exchanged = await verifyAndExchangeMagicLink(token, tributeSlug);
    if (!exchanged) {
      return NextResponse.json({
        success: false,
        error: 'El enlace de acceso ha expirado, ya fue utilizado o no es válido.'
      }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      tributeSlug: exchanged.tributeSlug,
      petName: exchanged.petName
    });

    // Sesión independiente nueva (7 días), distinta del token efímero de 1 solo uso
    response.cookies.set('guardian_session', exchanged.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || req.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'No se pudo verificar el enlace.' }, { status: err.status || 500 });
  }
}
