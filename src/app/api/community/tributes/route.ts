import { NextRequest, NextResponse } from 'next/server';
import { getPublicTributes, createTributeWithFirstLetter } from '@/lib/community/tributesDb';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';
import { verifyCsrfOrigin } from '@/lib/community/csrfGuard';
import { enforceRateLimit } from '@/lib/community/rateLimiter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada en este entorno.' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const species = searchParams.get('species') || 'todos';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const tributes = await getPublicTributes({ species, limit });
    return NextResponse.json({ success: true, tributes });
  } catch (err: any) {
    console.error('Error al obtener homenajes públicos:', err);
    return NextResponse.json({ success: false, error: 'Error al consultar homenajes.' }, { status: err.status || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada en este entorno.' }, { status: 404 });
    }

    const csrfError = verifyCsrfOrigin(req);
    if (csrfError) return csrfError;

    const rateError = await enforceRateLimit(req, 'create_tribute');
    if (rateError) return rateError;

    const body = await req.json();
    const {
      petName,
      species,
      authorName,
      email,
      yearsOrDates,
      photoUrl,
      firstLetterTitle,
      firstLetterCategory,
      firstLetterContent,
      firstLetterEnvelopeColor,
      displayDate
    } = body;

    if (!petName || !species || !authorName || !email || !firstLetterContent) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos obligatorios para registrar el homenaje y su primera carta.'
      }, { status: 400 });
    }

    const result = await createTributeWithFirstLetter({
      petName,
      species,
      authorName,
      email,
      yearsOrDates,
      photoUrl,
      firstLetterTitle: firstLetterTitle || `Para ${petName}`,
      firstLetterCategory: firstLetterCategory || 'despedida',
      firstLetterContent,
      firstLetterEnvelopeColor: firstLetterEnvelopeColor || 'crema',
      displayDate
    });

    const response = NextResponse.json({
      success: true,
      tribute: result.tribute,
      letter: result.letter
    }, { status: 201 });

    response.cookies.set('guardian_session', result.rawSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || req.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    console.error('Error al crear homenaje con primera carta:', err);
    return NextResponse.json({ success: false, error: 'No se pudo registrar el homenaje.' }, { status: err.status || 500 });
  }
}
