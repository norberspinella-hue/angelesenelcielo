import { NextRequest, NextResponse } from 'next/server';

const MAINTENANCE_HTML = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ángeles en el Cielo 3D · Mantenimiento breve</title>
  <meta name="robots" content="noindex, nofollow" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 1.5rem;
      background: radial-gradient(circle at top, #1f2b5a 0%, #10162f 55%, #090d1c 100%);
      color: #f7f2e7; font-family: Georgia, "Times New Roman", serif;
    }
    main {
      max-width: 34rem; width: 100%; padding: 2.2rem 2rem; border-radius: 1.25rem;
      background: rgba(18, 25, 54, 0.88); border: 1px solid rgba(235, 211, 155, 0.35);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45); text-align: center;
    }
    h1 { margin: 0 0 0.85rem; font-size: clamp(1.5rem, 3.5vw, 2rem); color: #f6dfad; font-weight: 600; }
    p { margin: 0 0 1rem; line-height: 1.6; font-family: system-ui, -apple-system, sans-serif; color: #e2e6f3; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-top: 1.5rem; }
    a {
      display: inline-block; padding: 0.7rem 1.25rem; border-radius: 999px; text-decoration: none;
      font-family: system-ui, -apple-system, sans-serif; font-weight: 600; font-size: 0.95rem;
    }
    .primary { background: #e8c77b; color: #151b38; }
    .secondary { border: 1px solid rgba(246, 223, 173, 0.45); color: #f7f2e7; }
  </style>
</head>
<body>
  <main>
    <h1>El Jardín 3D está en mantenimiento breve</h1>
    <p>Estamos realizando tareas técnicas de conservación para proteger todos los recuerdos, cartas y homenajes.</p>
    <p>El Mural Global, tus luces y Cartas al Cielo siguen funcionando con total normalidad.</p>
    <div class="actions">
      <a class="primary" href="/mural-global">Ir al Mural Global</a>
      <a class="secondary" href="/comunidad">Ir a Cartas al Cielo</a>
    </div>
  </main>
</body>
</html>`;

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const world3dOrigin = (process.env.WORLD3D_REWRITE_ORIGIN || '').trim().replace(/\/$/, '');
  const maintenanceMode = process.env.WORLD3D_MAINTENANCE_MODE === '1' || !world3dOrigin;

  if (maintenanceMode) {
    if (pathname.startsWith('/api/') || pathname === '/jardin-homenajes' || pathname === '/cielo3d/notas') {
      return NextResponse.json(
        {
          success: false,
          maintenance: true,
          error: 'El mundo 3D está temporalmente en mantenimiento. Tus recuerdos permanecen intactos.',
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'private, no-store, max-age=0',
            'Retry-After': '300',
          },
        }
      );
    }
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store, max-age=0',
        'Retry-After': '300',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // Pasarela exclusivamente servidor-a-servidor: elimina cualquier cabecera forjada por cliente
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete('x-world3d-gateway-secret');
  const gatewaySecret = (process.env.WORLD3D_GATEWAY_SECRET || '').trim();
  if (gatewaySecret) {
    requestHeaders.set('x-world3d-gateway-secret', gatewaySecret);
  }

  const targetPath = pathname === '/cielo3d' ? '/cielo3d/' : pathname;
  const destination = new URL(`${targetPath}${search}`, world3dOrigin);

  return NextResponse.rewrite(destination, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/cielo3d',
    '/cielo3d/:path*',
    '/jardin-homenajes',
    '/api/jardin/:path*',
    '/api/espacios-3d',
  ],
};
