import { NextRequest, NextResponse } from 'next/server';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';
import { verifyCsrfOrigin } from '@/lib/community/csrfGuard';
import { enforceRateLimit } from '@/lib/community/rateLimiter';
import { submitLegacyGuardianClaim } from '@/lib/community/tributesDb';
import { sendStagingMagicLinkEmail } from '@/lib/community/stagingEmailAdapter';
import { captureDevMagicLinkEmail } from '@/lib/community/devEmailSink';

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

    // Si existe correo histórico verificable y coincide, enviar reto de control únicamente a esa dirección
    if (result.rawControlToken && result.legacyEmailForChallenge) {
      if (process.env.COMMUNITY_ALLOWED_ENV === 'staging' && process.env.COMMUNITY_EMAIL_SEND_ENABLED === 'true') {
        await sendStagingMagicLinkEmail({
          requestedEmail: result.legacyEmailForChallenge,
          tributeSlug: slug.trim(),
          petName: result.petName,
          rawToken: result.rawControlToken,
          kind: 'claim_control',
          appOrigin: req.nextUrl.origin,
        }).catch(() => {});
      } else if (process.env.NODE_ENV !== 'production') {
        captureDevMagicLinkEmail({
          tributeSlug: slug.trim(),
          emailBlindHint: result.claimId,
          rawToken: result.rawControlToken,
          kind: 'claim_control',
        });
      }
    }

    // Respuesta genérica sin filtrar si el correo histórico coincidió ni ningún dato privado
    return NextResponse.json(
      {
        success: true,
        claimId: result.claimId,
        claimStatus: result.claimStatus,
        message:
          'Hemos recibido tu solicitud de custodia (pendiente de revisión). Si la colección dispone de un correo histórico verificable y coincide, enviaremos un enlace de confirmación a esa dirección; si no existe correo verificable, nuestro equipo realizará una revisión supervisada.',
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
