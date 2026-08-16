import { getSupabase } from './supabase';

export type PlanTier = 'GRATUIT' | 'CAPTEN';

export type Feature = 'gps' | 'cagnotte' | 'copilote' | 'visuels' | 'export_registre' | 'stats_avancees' | 'spots_vip';

// Modèle freemium + essai. Runs & membres ILLIMITÉS pour tous (jamais de mur
// sur la croissance). Gratuit : QR check-in, ICE, décharges, Messages, Spots
// basiques. Pro (et débloqué pendant l'essai) : GPS, Visuels, Copilote, export
// registre, stats avancées, Spots VIP.
export const PLAN_FEATURES: Record<PlanTier, Feature[]> = {
  GRATUIT: [],
  CAPTEN: ['gps', 'cagnotte', 'copilote', 'visuels', 'export_registre', 'stats_avancees', 'spots_vip'],
};

export const FREE_LIMITS = {
  // Membres illimités en gratuit (fini le mur sur la croissance du crew).
  MAX_ACTIVE_MEMBERS: 100000,
};

// ─── Entitlements : essai Captain Pro de 14 jours à la création du crew ───────
export const TRIAL_DAYS = 14;
const DAY_MS = 86_400_000;

type ClubLike = {
  stripe_plan?: string | null;
  stripe_subscription_status?: string | null;
  plan?: string | null;
  created_at?: string | null;
} | null | undefined;

export function isPaidPlan(club: ClubLike): boolean {
  return (
    String(club?.stripe_plan || "").toUpperCase() === "CAPTEN" ||
    club?.stripe_subscription_status === "active" ||
    String(club?.plan || "").toLowerCase() === "pro"
  );
}

export function trialEndsAt(club: ClubLike): number | null {
  const c = club?.created_at ? new Date(club.created_at).getTime() : null;
  return c && !Number.isNaN(c) ? c + TRIAL_DAYS * DAY_MS : null;
}

/** Accès aux features Pro = plan payant OU essai encore actif. */
export function hasProAccess(club: ClubLike): boolean {
  if (isPaidPlan(club)) return true;
  const end = trialEndsAt(club);
  return end != null && Date.now() < end;
}

/** Sur l'essai (accès Pro sans payer). */
export function isOnTrial(club: ClubLike): boolean {
  return !isPaidPlan(club) && hasProAccess(club);
}

/** Jours d'essai restants (0 si payant ou essai fini). */
export function trialDaysLeft(club: ClubLike): number {
  if (isPaidPlan(club)) return 0;
  const end = trialEndsAt(club);
  if (end == null) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / DAY_MS));
}

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
    // Membres actifs = inscrits actifs du crew (tables membre_* du V1)
    const { count, error } = await supabase
      .from('membre_club')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching active member count:', error);
      return 0;
    }

    return count || 0;
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
    // Sorties actives = events publiés à venir (modèle réel)
    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString());

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

/**
 * Compte les runs créés par le club depuis le début du mois calendaire.
 * Sert au mur gratuit « 4 runs / mois ».
 */
export async function getRunsThisMonthCount(clubId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  try {
    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .gte('created_at', startOfMonth);
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}
