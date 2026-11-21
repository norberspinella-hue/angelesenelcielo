import { NextRequest, NextResponse } from 'next/server';
import { revokeGuardianSession } from '@/lib/community/tributesDb';
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

    const rateError = await enforceRateLimit(req, 'revoke');
    if (rateError) return rateError;

    let revokeAll = false;
    try {
      const body = await req.json();
      revokeAll = Boolean(body?.revokeAll);
    } catch {
      // cuerpo opcional
    }

    const token = req.cookies.get('guardian_session')?.value;
    if (token) {
      await revokeGuardianSession(token, revokeAll);
    }

    const response = NextResponse.json({
      success: true,
      message: revokeAll ? 'Todas las sesiones han sido revocadas.' : 'Sesión revocada exitosamente.'
    });
    response.cookies.delete('guardian_session');
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'No se pudo revocar la sesión.' }, { status: err.status || 500 });
  }
}
