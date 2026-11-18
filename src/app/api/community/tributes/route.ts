import { NextRequest, NextResponse } from 'next/server';
import { getPublicTributes, createTributeWithFirstLetter, ensureTributesSchema, seedStagingTributes } from '@/lib/community/tributesDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureTributesSchema();
    await seedStagingTributes();

    const { searchParams } = new URL(req.url);
    const species = searchParams.get('species') || 'todos';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const tributes = await getPublicTributes({ species, limit });
    return NextResponse.json({ success: true, tributes });
  } catch (err: any) {
    console.error('Error al obtener homenajes públicos:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTributesSchema();

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

    // Fijar cookie HttpOnly para el guardián
    response.cookies.set('guardian_session', result.rawSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

    return response;
  } catch (err: any) {
    console.error('Error al crear homenaje con primera carta:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
