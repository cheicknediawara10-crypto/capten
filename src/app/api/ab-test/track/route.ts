import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { variant, page } = body;

    if (!variant || !['A', 'B'].includes(variant)) {
      return NextResponse.json({ error: 'Invalid or missing variant' }, { status: 400 });
    }

    if (!page || !['pricing', 'signup'].includes(page)) {
      return NextResponse.json({ error: 'Invalid or missing page' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase
        .from('ab_test_views')
        .insert([{ variant, page }]);

      if (error) {
        console.error('Failed to insert AB test view:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      console.log(`[MOCK TRACKING] Variant ${variant} viewed ${page}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('AB Test Track Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
