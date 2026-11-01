import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY =
  process.env.LIVE_STREAM_SECRET || '529ab53a1dd9fe03d3e2fd66ab97c75a3b45fb93e15c8e9c3c7bdd4d4c8a5095';
const EXPECTED_PIN = process.env.LIVE_STREAM_PIN || '5a84545b';

function generateSessionToken(windowHours = 12): string {
  // Genera un token firmado para una ventana de tiempo de 12 horas
  const timeBlock = Math.floor(Date.now() / (1000 * 60 * 60 * windowHours));
  return crypto.createHmac('sha256', SECRET_KEY).update(`live_stream_session_${timeBlock}`).digest('hex');
}

function isValidStreamToken(token: string): boolean {
  if (!token) return false;
  // Permitir ventana actual y ventana inmediatamente anterior para evitar desincronización en cambios de bloque
  const currentToken = generateSessionToken();
  const prevToken = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`live_stream_session_${Math.floor(Date.now() / (1000 * 60 * 60 * 12)) - 1}`)
    .digest('hex');

  return token === currentToken || token === prevToken;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'PIN requerido' }, { status: 400 });
    }

    if (pin.trim() !== EXPECTED_PIN) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }

    const token = generateSessionToken();
    return NextResponse.json({
      success: true,
      token,
      expiresInHours: 12,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al autenticar' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const valid = isValidStreamToken(token);
  return NextResponse.json({ valid });
}
