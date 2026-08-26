export interface EventInscription {
  id: string;
  event_id: string;
  membre_id?: string | null;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  statut_paiement: 'en_attente' | 'paye' | 'rembourse';
  position_liste_attente?: number | null;
  confirme_par_coureur: boolean;
  confirme_par_fondateur: boolean;
  expires_at?: string | null;
  promoted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunEvenementData {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  event_date: string;
  meeting_point_address: string | null;
  meeting_point_lat: number | null;
  meeting_point_lng: number | null;
  status: string;
  is_evenement: boolean;
  jauge_max: number | null;
  prix: number | null;
  devise: string;
  lien_paiement: string | null;
  description_evenement: string | null;
  inscriptions_count?: number;
  paid_count?: number;
  waiting_count?: number;
  waitlist_count?: number;
}
