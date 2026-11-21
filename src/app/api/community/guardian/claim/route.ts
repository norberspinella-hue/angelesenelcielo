import { NextRequest, NextResponse } from 'next/server';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';
import { verifyCsrfOrigin } from '@/lib/community/csrfGuard';
import { enforceRateLimit } from '@/lib/community/rateLimiter';
import { submitLegacyGuardianClaim } from '@/lib/community/tributesDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada.' }, { status: 404 });
    }

    const csrfError = verifyCsrfOrigin(req);
    if (csrfError) return csrfError;

    const rateError = await enforceRateLimit(req, 'recover');
    if (rateError) return rateError;

    const body = await req.json();
    const { slug, claimantEmail, proofEmail, proofDeletionToken, proofNote } = body || {};

    if (!slug || typeof slug !== 'string' || !claimantEmail || typeof claimantEmail !== 'string' || !claimantEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el identificador de colección y un correo válido.' },
        { status: 400 }
      );
    }

    const result = await submitLegacyGuardianClaim({
      slug: slug.trim(),
      claimantEmail: claimantEmail.trim(),
      proofEmail: typeof proofEmail === 'string' ? proofEmail : undefined,
      proofDeletionToken: typeof proofDeletionToken === 'string' ? proofDeletionToken : undefined,
      proofNote: typeof proofNote === 'string' ? proofNote : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        success: true,
        claimId: result.claimId,
        claimStatus: result.claimStatus,
        privateProofMatch: result.privateProofMatch,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error al registrar reclamación de custodia:', err);
    return NextResponse.json(
      { success: false, error: 'No se pudo registrar la solicitud de custodia.' },
      { status: err?.status || 500 }
    );
  }
}
