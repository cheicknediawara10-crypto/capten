import { getSupabase } from './supabase';

export interface Member {
  id: string;
  name: string;
  firstname: string;
  phone: string;
  streak: number;
}

// Mock database of members for demonstration/fallback
export const mockMembers: Member[] = [];

export interface BroadcastItem {
  id: string;
  run_id: string;
  recipient_id: string;
  recipient_name: string;
  target_type: 'group_broadcast' | 'individual_dm';
  message_content: string;
  send_at: string;
  status: 'hold' | 'pending' | 'processing' | 'sent' | 'cancelled';
}

// Templates de l'Option B d'Élite
export const DEFAULT_GROUP_TEMPLATE = "Nouveau run planifié ! 🏃‍♂️ Rendez-vous le {{date}} pour le run : *{{run_title}}*. Réservez votre place ici : {{url_inscription_capten}}";
export const DEFAULT_DM_TEMPLATE = "Hey {{firstname}} ! 👋 Le départ du run *{{run_title}}* est dans 15 minutes. Valide ta présence par satellite dès que tu as les pieds sur le bitume au point de rendez-vous : {{url_checkin_gps_unique}}";

export function formatGroupMessage(
  template: string,
  run: { title: string; date: string; url_inscription: string }
): string {
  return template
    .replace(/\{\{run_title\}\}/g, run.title)
    .replace(/\{\{date\}\}/g, run.date)
    .replace(/\{\{url_inscription_capten\}\}/g, run.url_inscription);
}

export function formatIndividualMessage(
  template: string,
  member: { firstname: string },
  run: { title: string; checkinUrl: string }
): string {
  return template
    .replace(/\{\{firstname\}\}/g, member.firstname)
    .replace(/\{\{run_title\}\}/g, run.title)
    .replace(/\{\{url_checkin_gps_unique\}\}/g, run.checkinUrl);
}

// Planification dans la file d'attente (Phase 1 immédiate, Phase 2 à H-15m)
export async function queueBroadcast(run: {
  id: string;
  title: string;
  date: string;
  date_start: string;
  location: string;
}) {
  const now = new Date().toISOString(); // Phase 1: Immédiat
  const runStartDate = new Date(run.date_start);
  const phase2ScheduledAt = new Date(runStartDate.getTime() - 15 * 60 * 1000).toISOString(); // Phase 2: H-15 minutes

  const urlInscription = `https://capten.app/runs?run=${run.id}`;

  const groupMessage = formatGroupMessage(DEFAULT_GROUP_TEMPLATE, {
    title: run.title,
    date: run.date,
    url_inscription: urlInscription
  });

  const groupBroadcastItem: Omit<BroadcastItem, 'id'> = {
    run_id: run.id,
    recipient_id: 'group_general_capten',
    recipient_name: 'CAPTEN RUN CLUB',
    target_type: 'group_broadcast',
    message_content: groupMessage,
    send_at: now, // Envoi immédiat (fini le hold de 10 min par défaut)
    status: 'pending' // 'pending' pour qu'il soit traité par le prochain job immédiatement
  };

  const phase2Messages: any[] = [];
  
  // Dans la réalité, on filtre sur 'status = registered'. 
  // Pour la démo, on simule l'envoi aux membres mockés.
  for (const member of mockMembers) {
    const urlCheckin = `https://capten.app/runs/${run.id}/checkin?athleteId=${member.id}`;
    
    const dmMessage = formatIndividualMessage(DEFAULT_DM_TEMPLATE, member, {
      title: run.title,
      checkinUrl: urlCheckin
    });

    phase2Messages.push({
      run_id: run.id,
      user_id: member.id, // Ou member.phone selon l'implémentation
      recipient_name: member.firstname,
      message_content: dmMessage,
      scheduled_at: phase2ScheduledAt,
      status: 'pending'
    });
  }

  const supabase = getSupabase();
  if (supabase) {
    // 1. Insertion de la Phase 1 (Groupe)
    const { error: groupError } = await supabase
      .from('broadcast_queue')
      .insert([groupBroadcastItem]);

    if (groupError) console.error("Erreur Phase 1 (Groupe):", groupError);

    // 2. Insertion de la Phase 2 (DMs)
    const { error: phase2Error } = await supabase
      .from('whatsapp_notification_queue')
      .insert(phase2Messages);

    if (phase2Error) console.error("Erreur Phase 2 (DMs):", phase2Error);

    return { success: true };
  } else {
    // Mode Fallback Local
    console.log("Supabase non connecté. Simulation Phase 1 (NOW) et Phase 2 (H-15m).");
    if (typeof window !== 'undefined') {
      const localQueue = JSON.parse(localStorage.getItem('capten_broadcast_queue') || '[]');
      const newGroupItem = { ...groupBroadcastItem, id: `local-group-msg-${Date.now()}` };
      localStorage.setItem('capten_broadcast_queue', JSON.stringify([newGroupItem, ...localQueue]));
      
      const localPhase2 = JSON.parse(localStorage.getItem('capten_whatsapp_notification_queue') || '[]');
      const newPhase2Items = phase2Messages.map((item, idx) => ({ ...item, id: `local-dm-${Date.now()}-${idx}` }));
      localStorage.setItem('capten_whatsapp_notification_queue', JSON.stringify([...newPhase2Items, ...localPhase2]));
    }
    return { success: true };
  }
}
