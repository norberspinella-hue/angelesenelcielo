import { NextRequest } from 'next/server';

const ALLOWED_WORLD3D_ORIGINS = new Set([
  'https://todaslasmascotasvanalcielo.com',
  'https://www.todaslasmascotasvanalcielo.com',
  'https://cielo-jardin-de-los-recuerdos.norber-spinella.chatgpt.site',
  'https://cielo3d-piloto-75-1.vercel.app',
  'https://angelesenelcielo-git-feat-int-cda2e0-todoslasmascotasvanalcielo.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8787',
]);

/**
 * Cabeceras CORS compartidas para endpoints públicos de lectura del Mundo 3D.
 */
export function world3dCorsHeaders(
  req: NextRequest,
  methods: string = 'GET, OPTIONS'
): HeadersInit {
  const origin = req.headers.get('origin') || '';
  let configuredOrigin = '';
  try {
    if (process.env.NEXT_PUBLIC_WORLD3D_URL) {
      configuredOrigin = new URL(process.env.NEXT_PUBLIC_WORLD3D_URL).origin;
    }
  } catch {
    // Ignorar URL inválida
  }

  const allowOrigin =
    ALLOWED_WORLD3D_ORIGINS.has(origin) || (configuredOrigin && origin === configuredOrigin)
      ? origin
      : 'https://cielo3d-piloto-75-1.vercel.app';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}
