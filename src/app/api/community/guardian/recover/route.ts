import { NextRequest, NextResponse } from 'next/server';
import { requestGuardianRecovery } from '@/lib/community/tributesDb';
import { isMulticartaFeatureEnabled } from '@/lib/community/featureFlags';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!isMulticartaFeatureEnabled(req)) {
      return NextResponse.json({ success: false, error: 'Funcionalidad no habilitada' }, { status: 404 });
    }

    const { email, tributeSlug } = await req.json();
    if (!email || !tributeSlug) {
      return NextResponse.json({
        success: false,
        error: 'Email y slug de homenaje requeridos.'
      }, { status: 400 });
    }

    const result = await requestGuardianRecovery(email, tributeSlug);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
