import { NextRequest, NextResponse } from 'next/server';
import { getTributeBySlug, validateGuardianSession } from '@/lib/community/tributesDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug requerido' }, { status: 400 });
    }

    const data = await getTributeBySlug(slug);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Homenaje no encontrado' }, { status: 404 });
    }

    // Verificar si el visitante actual es guardián de esta colección
    const sessionCookie = req.cookies.get('guardian_session')?.value || '';
    let isGuardian = false;
    if (sessionCookie) {
      const session = await validateGuardianSession(sessionCookie, slug);
      if (session) {
        isGuardian = true;
      }
    }

    return NextResponse.json({
      success: true,
      tribute: data.tribute,
      letters: data.letters,
      isGuardian
    });
  } catch (err: any) {
    console.error('Error al obtener colección:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
