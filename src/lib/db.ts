import { getSupabase, getSupabaseAdmin } from './supabase';
import { mockMembers } from './broadcast';

export interface RunnerProfile {
  id: string;
  name: string;
  phone: string;
  signed_waiver: boolean;
  streak_count: number;
  created_at: string;
  emergency_name?: string;
  emergency_phone?: string;
  emergency_relation?: string;
  birth_date?: string;
  blood_type?: string;
  allergies?: string;
  health_issues?: string;
  insurance?: string;
  address?: string;
  is_blacklisted?: boolean;
}

export interface RunDetails {
  id: string;
  title: string;
  description: string | null;
  date_start: string;
  location_start: string;
  gpx_route_url: string | null;
  start_latitude?: number | null;
  start_longitude?: number | null;
  is_paid: boolean;
  price_cents: number;
  stripe_product_id: string | null;
  max_slots: number | null;
  slots_taken: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduled_at: string;
  reminder_offset_minutes: number;
  sms_sent: boolean;
  club_id: string;
}

export interface ClubDetails {
  id: string;
  name: string;
  whatsapp_display_name: string;
  twilio_messaging_service_sid?: string | null;
  credit_balance_euros: number;
  whatsapp_messages_sent_this_month: number;
  trial_ends_at: string;
  stripe_subscription_status?: string | null;
}

// -------------------------------------------------------------
// RUNNERS REPOSITORY
// -------------------------------------------------------------
export const RunnerRepository = {
  async getById(id: string): Promise<RunnerProfile | null> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      // Mock Fallback
      return {
        id,
        name: "Julien Rochedieu",
        phone: "0612345678",
        signed_waiver: id.includes('signed') || id.length > 20,
        streak_count: 5,
        created_at: new Date().toISOString(),
        emergency_name: "Valérie Rochedieu",
        emergency_phone: "0687654321",
        emergency_relation: "Conjoint",
        birth_date: "1990-05-15",
        blood_type: "O+",
        allergies: "Aucune",
        health_issues: "Aucun",
        insurance: "AXA",
        address: "15 Rue de la Paix, Paris",
        is_blacklisted: false
      };
    }

    const { data, error } = await supabaseAdmin
      .from('runners')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`[dbRunnerRepository.getById] Error fetching runner ${id}:`, error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<RunnerProfile>): Promise<boolean> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log(`[API Mock] Update runner ${id} with:`, updates);
      return true;
    }

    const { error } = await supabaseAdmin
      .from('runners')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error(`[dbRunnerRepository.update] Error updating runner ${id}:`, error);
      return false;
    }
    return true;
  },

  async isBlacklisted(id: string): Promise<boolean> {
    const profile = await this.getById(id);
    return !!profile?.is_blacklisted;
  }
};

// -------------------------------------------------------------
// RUNS REPOSITORY
// -------------------------------------------------------------
export const RunRepository = {
  async getById(id: string): Promise<RunDetails | null> {
    const supabase = getSupabase();
    if (!supabase) {
      // Mock Fallback
      return {
        id,
        title: "Speed Run & Intervals (Simulation)",
        description: "Entraînement de fractionnés du mardi soir.",
        date_start: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
        location_start: "Buttes-Chaumont, Paris",
        gpx_route_url: null,
        start_latitude: 48.8809,
        start_longitude: 2.3828,
        is_paid: false,
        price_cents: 0,
        stripe_product_id: null,
        max_slots: 50,
        slots_taken: 12,
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        reminder_offset_minutes: 30,
        sms_sent: false,
        club_id: "demo-club"
      };
    }

    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`[dbRunRepository.getById] Error fetching run ${id}:`, error);
      return null;
    }
    return data;
  },

  async updateStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return true;

    const { error } = await supabase
      .from('runs')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(`[dbRunRepository.updateStatus] Error updating run ${id}:`, error);
      return false;
    }
    return true;
  }
};

// -------------------------------------------------------------
// REGISTRATIONS REPOSITORY
// -------------------------------------------------------------
export const RegistrationRepository = {
  async getStatus(runId: string, runnerId: string): Promise<'registered' | 'waitlisted' | 'checked_in' | 'no_show' | null> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return null;

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('status')
      .eq('run_id', runId)
      .eq('runner_id', runnerId)
      .maybeSingle();

    if (error) {
      console.error(`[dbRegistrationRepository.getStatus] Error:`, error);
      return null;
    }
    return data?.status || null;
  },

  async checkIn(runId: string, runnerId: string, lat: number, lon: number): Promise<boolean> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return true;

    const { error } = await supabaseAdmin
      .from('registrations')
      .upsert({
        run_id: runId,
        runner_id: runnerId,
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        verified_latitude: lat,
        verified_longitude: lon
      }, { onConflict: 'run_id,runner_id' });

    if (error) {
      console.error(`[dbRegistrationRepository.checkIn] Error:`, error);
      return false;
    }
    return true;
  }
};

// -------------------------------------------------------------
// CLUBS REPOSITORY
// -------------------------------------------------------------
export const ClubRepository = {
  async getById(id: string): Promise<ClubDetails | null> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        id,
        name: "Paris Run Club",
        whatsapp_display_name: "PARIS RUN CLUB",
        credit_balance_euros: 15.00,
        whatsapp_messages_sent_this_month: 12,
        trial_ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days left
      };
    }

    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`[dbClubRepository.getById] Error:`, error);
      return null;
    }
    return data;
  },

  async updateSubscription(id: string, status: string): Promise<boolean> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return true;

    const { error } = await supabaseAdmin
      .from('clubs')
      .update({ stripe_subscription_status: status })
      .eq('id', id);

    if (error) {
      console.error(`[dbClubRepository.updateSubscription] Error:`, error);
      return false;
    }
    return true;
  }
};
