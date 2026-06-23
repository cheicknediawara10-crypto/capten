import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create lazy Supabase clients
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('votre-projet')) {
    return null;
  }
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const serviceKey = supabaseServiceKey || supabaseAnonKey; // Fallback to anon if service key is missing
  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('votre-projet')) {
    return null;
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return _supabaseAdmin;
}

// Types for the runs table
export interface Run {
  id: string;
  created_at: string;
  captain_id: string;
  title: string;
  description: string | null;
  date_start: string;
  location_start: string;
  gpx_route_url: string | null;
  is_paid: boolean;
  price_cents: number;
  stripe_product_id: string | null;
  max_slots: number | null;
  slots_taken: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Helper: format price from cents to display string
export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')}€`;
}

// Helper: check if slots are available
export function hasAvailableSlots(run: Run): boolean {
  if (run.max_slots === null) return true;
  return run.slots_taken < run.max_slots;
}

// Helper: get remaining slots
export function remainingSlots(run: Run): number | null {
  if (run.max_slots === null) return null;
  return run.max_slots - run.slots_taken;
}
