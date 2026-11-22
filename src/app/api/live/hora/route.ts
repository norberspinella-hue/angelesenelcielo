import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  return NextResponse.json(
    { ahora: Date.now() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
