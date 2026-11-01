import { NextRequest, NextResponse } from 'next/server';
import { CandlesService } from '@/lib/altar/candlesService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 400 });
    }

    const success = await CandlesService.unsubscribe(token);
    if (!success) {
      return NextResponse.json({ error: 'Token no encontrado o ya tramitado' }, { status: 404 });
    }

    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Baja confirmada · Ángeles en el Cielo</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFFDFB; color: #2D0F31; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
            .card { background: white; border: 1px solid #F2DEE9; border-radius: 24px; padding: 40px 24px; max-width: 460px; box-shadow: 0 10px 30px rgba(140,60,110,0.08); }
            h1 { font-size: 24px; margin-bottom: 12px; color: #8C3F71; }
            p { font-size: 15px; line-height: 1.6; color: #523A4E; }
            a { display: inline-block; margin-top: 24px; padding: 12px 28px; background: #B83C7E; color: white; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Baja confirmada ♡</h1>
            <p>Has dejado de recibir recordatorios por correo sobre tu vela. Tu homenaje conmemorativo permanece intacto en el altar y podrás reavivarlo cuando desees.</p>
            <a href="/cielo-lleno-de-luces">Volver a Cielo de Luces</a>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err: any) {
    console.error('Error in candles unsubscribe route:', err);
    return NextResponse.json({ error: err.message || 'Error al tramitar baja' }, { status: 500 });
  }
}
