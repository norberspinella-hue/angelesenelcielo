import { NextRequest, NextResponse } from 'next/server';
import { validateGuardianSession } from '@/lib/community/tributesDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('guardian_session')?.value;
    if (!token) {
      return NextResponse.json({ isAuthenticated: false });
    }

    const session = await validateGuardianSession(token);
    if (!session) {
      return NextResponse.json({ isAuthenticated: false });
    }

    return NextResponse.json({
      isAuthenticated: true,
      tributeSlug: session.tributeSlug,
      petName: session.petName,
      expiresAt: session.expiresAt
    });
  } catch (err: any) {
    return NextResponse.json({ isAuthenticated: false, error: err.message }, { status: 500 });
  }
}
