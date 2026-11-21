import { NextRequest, NextResponse } from 'next/server';

/**
 * Validación CSRF uniforme para todas las operaciones mutadoras (POST) del sistema multicarta.
 * No depende exclusivamente de SameSite: exige coincidencia explícita de Origin o Referer
 * frente al Host / orígenes permitidos configurados.
 */
export function verifyCsrfOrigin(req: NextRequest): NextResponse | null {
  const originHeader = req.headers.get('origin');
  const refererHeader = req.headers.get('referer');
  const hostHeader = req.headers.get('host');

  let requestOriginHost: string | null = null;

  if (originHeader) {
    try {
      requestOriginHost = new URL(originHeader).host.toLowerCase();
    } catch {
      return NextResponse.json({ success: false, error: 'CSRF denegado: cabecera Origin inválida.' }, { status: 403 });
    }
  } else if (refererHeader) {
    try {
      requestOriginHost = new URL(refererHeader).host.toLowerCase();
    } catch {
      return NextResponse.json({ success: false, error: 'CSRF denegado: cabecera Referer inválida.' }, { status: 403 });
    }
  } else {
    return NextResponse.json(
      { success: false, error: 'CSRF denegado: falta origen explícito en petición mutadora.' },
      { status: 403 }
    );
  }

  const allowedHosts = new Set<string>();

  if (hostHeader) {
    allowedHosts.add(hostHeader.toLowerCase());
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      allowedHosts.add(new URL(appUrl).host.toLowerCase());
    } catch {
      // ignorar URL malformada
    }
  }

  const extraOrigins = (process.env.COMMUNITY_ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  for (const o of extraOrigins) {
    try {
      allowedHosts.add(new URL(o).host.toLowerCase());
    } catch {
      allowedHosts.add(o.toLowerCase());
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (requestOriginHost.startsWith('127.0.0.1:') || requestOriginHost === '127.0.0.1') {
      allowedHosts.add(requestOriginHost);
    }
    if (requestOriginHost.startsWith('localhost:') || requestOriginHost === 'localhost') {
      allowedHosts.add(requestOriginHost);
    }
  }

  if (!allowedHosts.has(requestOriginHost)) {
    return NextResponse.json(
      { success: false, error: 'CSRF denegado: origen no autorizado.' },
      { status: 403 }
    );
  }

  return null;
}
