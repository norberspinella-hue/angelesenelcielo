import { NextRequest, NextResponse } from 'next/server';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';
import { verifyCsrfOrigin } from '@/lib/community/csrfGuard';
import { enforceRateLimit } from '@/lib/community/rateLimiter';
import { verifyLegacyClaimEmailControl } from '@/lib/community/tributesDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada.' }, { status: 404 });
    }

    const csrfError = verifyCsrfOrigin(req);
    if (csrfError) return csrfError;

    const rateError = await enforceRateLimit(req, 'verify');
    if (rateError) return rateError;

    const body = await req.json();
    const token = body?.token;
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'Token de verificación obligatorio.' }, { status: 400 });
    }

    const res = await verifyLegacyClaimEmailControl(token);
    if (!res.ok) {
      return NextResponse.json({ success: false, error: res.error }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      claimId: res.claimId,
      claimStatus: res.claimStatus,
      message: 'Control de correo histórico confirmado. Tu solicitud pasa ahora a aprobación administrativa.',
    });
  } catch (err: any) {
    console.error('Error al verificar control de correo en reclamación:', err);
    return NextResponse.json(
      { success: false, error: 'No se pudo verificar el enlace.' },
      { status: err?.status || 500 }
    );
  }
}
