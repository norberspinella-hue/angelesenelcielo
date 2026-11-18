import { NextRequest, NextResponse } from 'next/server';
import { getTributeBySlug } from '@/lib/community/tributesDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug requerido' }, { status: 400 });
    }

    const data = await getTributeBySlug(slug);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Homenaje no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      petName: data.tribute.petName,
      lettersCount: data.letters.length,
      lettersSummary: data.letters.map(l => ({
        seq: l.letterSeqNum,
        title: l.title,
        color: l.envelopeColor,
        date: l.displayDate
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
