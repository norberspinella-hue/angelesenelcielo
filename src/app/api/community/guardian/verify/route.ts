import { NextRequest, NextResponse } from 'next/server';
import { validateGuardianSession } from '@/lib/community/tributesDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token, tributeSlug } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 400 });
    }

    const session = await validateGuardianSession(token, tributeSlug);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'El enlace de acceso ha expirado o no es válido.'
      }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      tributeSlug: session.tributeSlug,
      petName: session.petName
    });

    response.cookies.set('guardian_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
