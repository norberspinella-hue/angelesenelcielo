import { NextRequest, NextResponse } from 'next/server';
import {
  FAMILY_3D_COOKIE_NAME,
  readVerifiedFamily3DSessionFromCookies,
  signWorld3DServerAssertion,
  verifyFamily3DSessionToken,
} from '@/lib/world3d/familySession';

export const dynamic = 'force-dynamic';

/**
 * Consulta si existe sesión familiar verificada mediante Magic Link (cookie HttpOnly `aec_family_3d`).
 * Nunca expone correo ni secretos.
 */
export async function GET(req: NextRequest) {
  const session = readVerifiedFamily3DSessionFromCookies();
  if (!session) {
    return NextResponse.json({ signedIn: false, memorialIds: [] });
  }

  const memorialId = req.nextUrl.searchParams.get('memorialId')?.trim();
  const isOwner = memorialId ? session.memorialIds.includes(memorialId) : false;

  return NextResponse.json({
    signedIn: true,
    memorialIds: session.memorialIds,
    isOwner,
    expiresAt: new Date(session.exp * 1000).toISOString(),
  });
}

/**
 * Verificación servidor-a-servidor para que un Worker 3D (D1) compruebe titularidad real
 * sin confiar en cabeceras del navegador ni depender de cuentas de ChatGPT.
 */
export async function POST(req: NextRequest) {
  const expectedBridgeSecret = (
    process.env.WORLD3D_BRIDGE_SECRET ||
    process.env.COMMUNITY_HMAC_SECRET ||
    ''
  ).trim();
  const providedSecret = req.headers.get('x-world3d-bridge-secret') || '';

  if (!expectedBridgeSecret || providedSecret !== expectedBridgeSecret) {
    return NextResponse.json({ authorized: false, error: 'UNAUTHORIZED_BRIDGE' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const sessionToken = typeof body?.sessionToken === 'string' ? body.sessionToken : '';
  const memorialId = typeof body?.memorialId === 'string' ? body.memorialId.trim() : '';

  const session = verifyFamily3DSessionToken(sessionToken);
  if (!session) {
    return NextResponse.json({ authorized: false, signedIn: false }, { status: 200 });
  }

  const isOwner = memorialId ? session.memorialIds.includes(memorialId) : false;
  const assertion = memorialId
    ? signWorld3DServerAssertion({
        memorialId,
        emailHash: session.emailHash,
        isOwner,
        isAdmin: false,
      })
    : null;

  return NextResponse.json({
    authorized: true,
    signedIn: true,
    isOwner,
    memorialIds: session.memorialIds,
    assertion,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ signedOut: true });
  res.cookies.set(FAMILY_3D_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
