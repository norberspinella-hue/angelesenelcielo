import { NextRequest, NextResponse } from 'next/server';
import { publishAuthorizedLetter } from '@/lib/community/tributesDb';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';
import { verifyCsrfOrigin } from '@/lib/community/csrfGuard';
import { enforceRateLimit } from '@/lib/community/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada en este entorno.' }, { status: 404 });
    }

    const csrfError = verifyCsrfOrigin(req);
    if (csrfError) return csrfError;

    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug requerido' }, { status: 400 });
    }

    const rateError = await enforceRateLimit(req, 'publish_letter', slug);
    if (rateError) return rateError;

    const sessionCookie = req.cookies.get('guardian_session')?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = sessionCookie || bearerToken;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado: se requiere sesión de guardián para escribir otra carta.'
      }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      content,
      authorName,
      envelopeColor,
      displayDate,
      idempotencyKey
    } = body;

    const reqIdemKey = idempotencyKey || req.headers.get('x-idempotency-key') || undefined;

    if (!title || !category || !content || !authorName || !envelopeColor) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos obligatorios para redactar la carta.'
      }, { status: 400 });
    }

    const result = await publishAuthorizedLetter({
      tributeSlug: slug,
      rawGuardianToken: token,
      title,
      category,
      content,
      authorName,
      envelopeColor,
      displayDate,
      idempotencyKey: reqIdemKey
    });

    return NextResponse.json({
      success: true,
      letter: result.letter,
      isDuplicate: result.isDuplicate
    }, { status: result.isDuplicate ? 200 : 201 });
  } catch (err: any) {
    console.error('Error al publicar carta adicional:', err);
    const status = err.status || 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
