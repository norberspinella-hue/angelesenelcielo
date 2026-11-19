import { NextRequest, NextResponse } from 'next/server';
import { revokeGuardianSession } from '@/lib/community/tributesDb';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada' }, { status: 404 });
    }

    const token = req.cookies.get('guardian_session')?.value;
    if (token) {
      await revokeGuardianSession(token);
    }

    const response = NextResponse.json({ success: true, message: 'Sesión revocada exitosamente' });
    response.cookies.delete('guardian_session');
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
