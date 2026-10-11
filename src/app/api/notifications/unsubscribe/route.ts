import { NextRequest, NextResponse } from 'next/server';
import { optOutEmail } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (email) {
    await optOutEmail(email.trim().toLowerCase());
  }

  // Devolver página HTML elegante de confirmación
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preferencias Actualizadas - Ángeles en el Cielo</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8e0f0;
      font-family: Arial, Helvetica, sans-serif;
      color: #4A3F6B;
    }
    .card {
      background: #FFFFFF;
      max-width: 500px;
      width: 90%;
      padding: 40px 30px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 16px 40px rgba(100, 70, 150, 0.15);
      border: 1px solid #EED8C5;
    }
    h1 {
      font-family: Georgia, serif;
      color: #25335F;
      font-size: 24px;
      margin: 16px 0 12px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #706A95;
      margin: 0 0 24px;
    }
    .btn {
      display: inline-block;
      background: #F65F8F;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: bold;
      padding: 14px 28px;
      border-radius: 999px;
      font-size: 14px;
      box-shadow: 0 6px 18px rgba(246, 95, 143, 0.35);
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px;">🕊️</div>
    <h1>Preferencias actualizadas</h1>
    <p>
      Hemos registrado tu solicitud. Ya no recibirás más notificaciones de nuevos compañeros en tu correo electrónico.
    </p>
    <p style="font-size: 13px; color: #9B8FB0; margin-bottom: 30px;">
      El recuerdo y la estrella de tu angelito seguirán brillando intactos para siempre en el mural.
    </p>
    <a href="https://todaslasmascotasvanalcielo.com/mural-global" class="btn">
      Volver al Mural Global ✨
    </a>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
