import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  checkLiveRateLimit,
  recordLiveFailedAttempt,
  clearLiveAttemptsOnSuccess,
} from '@/lib/live-tiktok/rateLimit';

export const dynamic = 'force-dynamic';

// Credenciales previas comprometidas que quedan estrictamente prohibidas y revocadas
const COMPROMISED_PIN = '5a84545b';
const COMPROMISED_SECRET = '529ab53a1dd9fe03d3e2fd66ab97c75a3b45fb93e15c8e9c3c7bdd4d4c8a5095';

interface LiveAuthConfig {
  secret: string;
  expectedPin: string;
}

/**
 * Obtiene la configuración de autenticación exclusivamente desde las variables
 * de entorno del servidor. Falla de forma cerrada (Fail-Closed) si faltan o
 * si coinciden con los valores comprometidos anteriores.
 */
function getLiveAuthConfig(): LiveAuthConfig | null {
  const secret = process.env.LIVE_STREAM_SECRET;
  const pin = process.env.LIVE_STREAM_PIN;

  if (!secret || typeof secret !== 'string' || secret.trim().length < 32) {
    return null;
  }

  if (!pin || typeof pin !== 'string' || pin.trim().length < 6) {
    return null;
  }

  const cleanSecret = secret.trim();
  const cleanPin = pin.trim();

  // Bloqueo explícito de valores comprometidos
  if (cleanPin === COMPROMISED_PIN || cleanSecret === COMPROMISED_SECRET) {
    console.error('SEGURIDAD: Acceso denegado. Se detectó el uso de credenciales comprometidas revocadas.');
    return null;
  }

  return {
    secret: cleanSecret,
    expectedPin: cleanPin,
  };
}

/**
 * Comparación segura contra ataques de tiempo (Timing Attacks).
 */
function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Evita fuga de información por diferencia de longitud ejecutando una comparación simulada
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Genera un token firmado con HMAC-SHA256 para una ventana de tiempo de 12 horas.
 */
function generateSessionToken(secret: string, windowHours = 12): string {
  const timeBlock = Math.floor(Date.now() / (1000 * 60 * 60 * windowHours));
  return crypto.createHmac('sha256', secret).update(`live_stream_session_${timeBlock}`).digest('hex');
}

/**
 * Valida un token comprobando la ventana actual y la inmediatamente anterior
 * para evitar cortes involuntarios en los cambios de bloque.
 */
function isValidStreamToken(token: string, secret: string): boolean {
  if (!token || typeof token !== 'string') return false;
  // Solo se admiten tokens con formato hexadecimal SHA-256 de 64 caracteres
  if (!/^[a-f0-9]{64}$/i.test(token)) return false;

  const currentToken = generateSessionToken(secret);
  const prevTimeBlock = Math.floor(Date.now() / (1000 * 60 * 60 * 12)) - 1;
  const prevToken = crypto
    .createHmac('sha256', secret)
    .update(`live_stream_session_${prevTimeBlock}`)
    .digest('hex');

  const bufToken = Buffer.from(token);
  const bufCurr = Buffer.from(currentToken);
  const bufPrev = Buffer.from(prevToken);

  const matchCurr = bufToken.length === bufCurr.length && crypto.timingSafeEqual(bufToken, bufCurr);
  const matchPrev = bufToken.length === bufPrev.length && crypto.timingSafeEqual(bufToken, bufPrev);

  return matchCurr || matchPrev;
}

export async function POST(req: NextRequest) {
  try {
    const config = getLiveAuthConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Servicio de emisión no configurado o no disponible.' },
        { status: 503 }
      );
    }

    // 1. Limitación de tasa (Rate Limiting) compartido y atómico
    const rateLimit = await checkLiveRateLimit(req, config.secret);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error || 'Demasiados intentos fallidos. Inténtelo más tarde.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.remainingSeconds || 900),
          },
        }
      );
    }

    // 2. Extracción segura del cuerpo
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Formato de solicitud no válido.' }, { status: 400 });
    }

    const { pin } = body || {};
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'PIN requerido.' }, { status: 400 });
    }

    // 3. Verificación de credenciales con comparación temporal segura
    const isPinValid = timingSafeCompare(pin.trim(), config.expectedPin);
    if (!isPinValid) {
      await recordLiveFailedAttempt(req, config.secret);
      return NextResponse.json({ error: 'Credenciales de emisión no válidas.' }, { status: 401 });
    }

    // 4. Éxito: limpiar intentos y emitir token criptográfico
    await clearLiveAttemptsOnSuccess(req, config.secret);
    const token = generateSessionToken(config.secret);

    return NextResponse.json({
      success: true,
      token,
      expiresInHours: 12,
    });
  } catch (err: any) {
    console.error('Error interno en autenticación LIVE:', err?.message || err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const config = getLiveAuthConfig();
    if (!config) {
      return NextResponse.json({ valid: false });
    }

    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const valid = isValidStreamToken(token, config.secret);
    return NextResponse.json({ valid });
  } catch (err) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
