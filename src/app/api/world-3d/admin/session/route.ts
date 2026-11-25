import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_3D_COOKIE_NAME,
  createWorld3DAdminToken,
  isAuthorizedAdminRoleEmail,
  resolveExplicitAdminSubject,
  verifyAdminPinSecret,
  type World3DAdminRole,
} from '@/lib/world3d/adminSession';

export const dynamic = 'force-dynamic';

/**
 * Emite una sesión administrativa separada (`__Host-aec_admin_3d`) para Bandeja de Cartas
 * o Curador de Jardín, verificando en servidor credencial administrativa + identidad explícita.
 * Nunca concede permisos únicamente por conocer un correo electrónico.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const adminKey =
      req.headers.get('x-admin-moderacion-key')?.trim() ||
      (typeof body?.adminKey === 'string' ? body.adminKey.trim() : '');
    const role: World3DAdminRole =
      body?.role === 'garden_curator' ? 'garden_curator' : 'cartas_admin';

    if (!verifyAdminPinSecret(adminKey)) {
      return NextResponse.json({ success: false, error: 'ADMIN_AUTH_REQUIRED' }, { status: 401 });
    }

    if (!isAuthorizedAdminRoleEmail(role, email)) {
      return NextResponse.json({ success: false, error: 'ADMIN_EMAIL_FORBIDDEN' }, { status: 403 });
    }

    const subject = resolveExplicitAdminSubject(role);
    if (!subject) {
      return NextResponse.json({ success: false, error: 'ADMIN_SUBJECT_NOT_LINKED' }, { status: 403 });
    }

    const token = createWorld3DAdminToken({ role, subject, email });
    if (!token) {
      return NextResponse.json({ success: false, error: 'ADMIN_SECRET_UNCONFIGURED' }, { status: 503 });
    }

    const res = NextResponse.json(
      { success: true, role, subject },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
    res.cookies.set(ADMIN_3D_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 4 * 60 * 60,
    });
    return res;
  } catch (err) {
    console.error('Error en POST /api/world-3d/admin/session:', err);
    return NextResponse.json({ success: false, error: 'ADMIN_SESSION_ERROR' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json(
    { signedOut: true },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
  res.cookies.set(ADMIN_3D_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
