import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memoryId, reactionType } = body;

    if (!memoryId || !['candle', 'support', 'hug'].includes(reactionType)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await (supabase.from('memorials') as any)
      .select('id, story_answers')
      .eq('id', memoryId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Recuerdo no encontrado' }, { status: 404 });
    }

    const currentStory = (typeof data.story_answers === 'object' && data.story_answers !== null)
      ? data.story_answers
      : {};

    const updatedStory = {
      ...currentStory,
      candlesCount: reactionType === 'candle' ? (currentStory.candlesCount || 0) + 1 : (currentStory.candlesCount || 0),
      supportCount: reactionType === 'support' ? (currentStory.supportCount || 0) + 1 : (currentStory.supportCount || 0),
      hugsCount: reactionType === 'hug' ? (currentStory.hugsCount || 0) + 1 : (currentStory.hugsCount || 0),
    };

    const { error: updateError } = await (supabase.from('memorials') as any)
      .update({ story_answers: updatedStory })
      .eq('id', memoryId);

    if (updateError) {
      console.error('Error updating reaction:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      counts: {
        candlesCount: updatedStory.candlesCount,
        supportCount: updatedStory.supportCount,
        hugsCount: updatedStory.hugsCount,
      }
    });
  } catch (err: any) {
    console.error('Unexpected error in community react POST:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
