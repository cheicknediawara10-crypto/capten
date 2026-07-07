import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';
import { getActiveMembersCount, FREE_LIMITS } from '@/lib/plan-access';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const isMock = captainId === 'mock-captain-uuid';
    
    // For mock mode, count local storage runners if queried on client, 
    // but in API route context we might just read a mock value or fallback.
    // Let's pass isMock to count.
    const activeMembers = await getActiveMembersCount(captainId, isMock);

    // Resolve plan tier
    let plan = 'GRATUIT';
    if (!isMock) {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('clubs')
          .select('stripe_plan')
          .eq('id', captainId)
          .maybeSingle();
        if (!error && data) {
          plan = data.stripe_plan || 'GRATUIT';
        }
      }
    } else {
      const cookieStore = cookies();
      const planCookie = cookieStore.get('capten_plan');
      plan = planCookie?.value || 'GRATUIT';
    }

    const limit = FREE_LIMITS.MAX_ACTIVE_MEMBERS;
    const isOverLimit = plan === 'GRATUIT' && activeMembers > limit;

    return NextResponse.json({
      activeMembers,
      limit,
      isOverLimit,
      plan
    });
  } catch (err) {
    console.error('Error fetching active members API:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
