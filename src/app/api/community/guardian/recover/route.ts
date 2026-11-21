import { NextRequest, NextResponse } from 'next/server';
import { requestGuardianRecovery } from '@/lib/community/tributesDb';
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

    const rateError = await enforceRateLimit(req, 'recover');
    if (rateError) return rateError;

    const { email, tributeSlug } = await req.json();
    if (!email || !tributeSlug) {
      return NextResponse.json({
        success: false,
        error: 'Email y slug de homenaje requeridos.'
      }, { status: 400 });
    }

    const result = await requestGuardianRecovery(email, tributeSlug);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'No se pudo procesar la solicitud.' }, { status: err.status || 500 });
  }
}
