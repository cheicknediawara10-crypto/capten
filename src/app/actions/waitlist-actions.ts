"use server"

import { getSupabase } from '@/lib/supabase';
import { mockMembers } from '@/lib/broadcast';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('votre-projet');

export async function cancelParticipantAndPromote(participantId: string) {
  try {
    const supabase = getSupabase();

    // 1. Mode Démo / Fallback Local
    if (!isSupabaseConfigured || !supabase || participantId.startsWith('demo-')) {
      console.warn(`[MODE DÉMO] Annulation du participant ${participantId}`);
      
      // Simuler la promotion
      const mockPromoted = mockMembers[0] || { id: 'm1', name: 'Petit Noah', firstname: 'Noah', phone: '+33 6 78 90 12 34', streak: 9 };
      
      return {
        success: true,
        demoMode: true,
        message: "Annulation et promotion de démonstration simulées avec succès.",
        promoted: mockPromoted.firstname,
        shifted: 0
      };
    }

    // 2. Appeler la procédure stockée atomique pour éviter les conditions de concurrence
    const { data: rpcResult, error: rpcError } = await supabase.rpc('fn_cancel_and_promote', {
      p_participant_id: participantId
    });

    if (rpcError || !rpcResult) {
      return { error: rpcError?.message || 'Erreur lors du traitement de la promotion.' };
    }

    // Si la procédure stockée a renvoyé une erreur logique
    if ('error' in rpcResult && rpcResult.error) {
      return { error: rpcResult.error };
    }

    if (rpcResult.already_cancelled) {
      return { success: true, message: rpcResult.message };
    }

    if (rpcResult.type === 'waitlisted_cancelled') {
      return {
        success: true,
        promoted: null,
        message: rpcResult.message
      };
    }

    if (rpcResult.type === 'cancelled_no_promotion') {
      return {
        success: true,
        promoted: null,
        message: 'Place libérée, aucun membre sur la liste d\'attente.'
      };
    }

    // Cas d'une promotion ('promoted')
    const { promoted_firstname } = rpcResult;

    // d. Envoyer l'alerte WhatsApp de promotion
    // Promotion effectuée en base de données.
    // L'envoi automatisé de SMS/WhatsApp tiers a été retiré.

    return {
      success: true,
      promoted: promoted_firstname || "Inconnu",
      shifted: 1
    };

  } catch (error: any) {
    console.error('Error in cancelParticipantAndPromote helper:', error);
    return { error: error.message || 'Erreur interne lors de l\'annulation / promotion.' };
  }
}
