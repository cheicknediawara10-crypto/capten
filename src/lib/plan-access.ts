import { getSupabase } from './supabase';

export type PlanTier = 'GRATUIT' | 'CAPTEN';

export type Feature = 
  | 'messages_auto' 
  | 'cagnotte' 
  | 'copilote' 
  | 'runs_illimites' 
  | 'membres_illimites';

// Matrix defining which plan has access to which feature
export const PLAN_FEATURES: Record<PlanTier, Feature[]> = {
  GRATUIT: [], // Basic emergency sheet and 1 active run are standard, not in matrix
  CAPTEN: ['messages_auto', 'cagnotte', 'copilote', 'runs_illimites', 'membres_illimites'],
};

export const FREE_LIMITS = {
  MAX_ACTIVE_MEMBERS: 25,
  MAX_ACTIVE_RUNS: 1,
};

/**
 * Checks if a plan tier has access to a specific feature.
 */
export function hasFeatureAccess(plan: PlanTier | string | null | undefined, feature: Feature): boolean {
  const normalizedPlan = (plan || 'GRATUIT').toUpperCase() as PlanTier;
  if (normalizedPlan === 'CAPTEN') return true;
  return PLAN_FEATURES[normalizedPlan]?.includes(feature) || false;
}

/**
 * Counts the unique active members (runners who checked in to at least 1 run in the last 60 days)
 */
export async function getActiveMembersCount(clubId: string, isMock: boolean = false): Promise<number> {
  if (isMock) {
    if (typeof window !== 'undefined') {
      try {
        const localRunners = JSON.parse(localStorage.getItem('capten_runners_v3') || '[]');
        return localRunners.length;
      } catch {
        return 12;
      }
    }
    return 12;
  }

  const supabase = getSupabase();
  if (!supabase) return 0;

  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Query registrations where status is checked_in and the run belongs to this club
    const { data, error } = await supabase
      .from('registrations')
      .select('runner_id, runs!inner(club_id)')
      .eq('status', 'checked_in')
      .eq('runs.club_id', clubId)
      .gte('checked_in_at', sixtyDaysAgo.toISOString());

    if (error) {
      console.error('Error fetching registrations for active member count:', error);
      return 0;
    }

    if (!data) return 0;

    // Filter to get unique runner count
    const uniqueRunners = new Set(data.map((r: any) => r.runner_id));
    return uniqueRunners.size;
  } catch (err) {
    console.error('Error in getActiveMembersCount:', err);
    return 0;
  }
}

/**
 * Counts the active runs of a club (runs with status 'scheduled')
 */
export async function getActiveRunsCount(clubId: string, isMock: boolean = false): Promise<number> {
  if (isMock) {
    if (typeof window !== 'undefined') {
      try {
        const localRuns = JSON.parse(localStorage.getItem('capten_runs') || '[]');
        const active = localRuns.filter((r: any) => r.status === 'scheduled');
        return active.length;
      } catch {
        return 1;
      }
    }
    return 1;
  }

  const supabase = getSupabase();
  if (!supabase) return 0;

  try {
    const { count, error } = await supabase
      .from('runs')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('status', 'scheduled');

    if (error) {
      console.error('Error fetching active runs count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error in getActiveRunsCount:', err);
    return 0;
  }
}
