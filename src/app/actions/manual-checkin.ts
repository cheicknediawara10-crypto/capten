"use server"

import { getSupabaseAdmin } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('votre-projet');

/**
 * Force manual validation (Master Pass) of a runner for a run.
 * Marks registration status as 'checked_in', method as 'manual_captain',
 * and checks them in at NOW().
 */
export async function manualCheckInRunner(registrationId: string) {
  try {
    if (!registrationId) {
      return { error: "ID d'inscription manquant." };
    }

    // Fallback/Demo mode
    if (!isSupabaseConfigured) {
      console.log(`[Mode Démo] Check-in manuel (Master Pass) de la registration ${registrationId}.`);
      return {
        success: true,
        message: "Pointage manuel validé avec succès (Mode Démo)."
      };
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return { error: "Client d'administration Supabase indisponible." };
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update({
        status: 'checked_in',
        check_in_method: 'manual_captain',
        checked_in_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) {
      console.error("Erreur SQL lors du check-in manuel :", error);
      return { error: `Erreur base de données : ${error.message}` };
    }

    return {
      success: true,
      message: "Coureur pointé manuellement avec succès.",
      registration: data
    };

  } catch (error: any) {
    console.error("Exception in manualCheckInRunner:", error);
    return { error: error.message || "Erreur interne lors de la validation manuelle." };
  }
}
