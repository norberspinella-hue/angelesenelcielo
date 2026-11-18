import { NextRequest, NextResponse } from 'next/server';
import { publishAuthorizedLetter } from '@/lib/community/tributesDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug requerido' }, { status: 400 });
    }

    // 1. Obtener token de sesión de la cookie HttpOnly o encabezado Authorization
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

    // 2. Comprobar CSRF simple
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host && !originHost.includes('localhost') && !originHost.includes('127.0.0.1')) {
        return NextResponse.json({ success: false, error: 'CSRF denegado: origen no válido' }, { status: 403 });
      }
    }

    // 3. Obtener cuerpo y clave de idempotencia
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

    // 4. Publicar carta con autorización validada en el servicio
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
