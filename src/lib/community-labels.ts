export type CommunityType = 'run_club' | 'walk_club' | 'trail_hiking' | 'other';

export interface CommunityOption {
  id: CommunityType;
  label: string;
  icon: string;
  description: string;
}

export const COMMUNITY_OPTIONS: CommunityOption[] = [
  {
    id: 'run_club',
    label: 'Run Club',
    icon: '🏃',
    description: 'Courses à pied urbaines, fractionnés et sessions sociales'
  },
  {
    id: 'walk_club',
    label: 'Walk Club',
    icon: '🚶',
    description: 'Marches urbaines, Girls Who Walk et sorties à pied'
  },
  {
    id: 'trail_hiking',
    label: 'Trail & Rando',
    icon: '🏔️',
    description: 'Sorties trail en nature, rando active et dénivelé'
  },
  {
    id: 'other',
    label: 'Autre',
    icon: '✏️',
    description: 'Autre communauté sportive récurrente'
  }
];

export interface CommunityLabels {
  community_type: CommunityType;
  community_label: string;
  session_single: string;          // "un run", "une marche", "une sortie trail"
  session_single_cap: string;      // "Un run", "Une marche", "Une sortie trail"
  session_plural: string;          // "runs", "marches", "sorties trail"
  session_plural_cap: string;      // "Runs", "Marches", "Sorties trail"
  members_plural: string;          // "tes coureurs", "tes marcheurs", "ton groupe"
  members_plural_short: string;    // "coureurs", "marcheurs", "traileurs"
  members_plural_cap: string;      // "Coureurs", "Marcheurs", "Traileurs"
  member_singular: string;         // "coureur", "marcheur", "traileur"
  member_singular_cap: string;     // "Coureur", "Marcheur", "Traileur"
  session_named: string;           // "le run", "la marche", "la sortie trail"
  launch_session: string;          // "lancer un run", "organiser une marche", "planifier une sortie"
  launch_session_cap: string;      // "LANCER UN RUN", "ORGANISER UNE MARCHE", "PLANIFIER UNE SORTIE"
  plan_session: string;            // "Planifier un run", "Planifier une marche", "Planifier une sortie"
  no_session_planned: string;      // "AUCUN RUN PLANIFIÉ", "AUCUNE MARCHE PLANIFIÉE", "AUCUNE SORTIE PLANIFIÉE"
  next_session: string;            // "PROCHAIN RUN", "PROCHAINE MARCHE", "PROCHAINE SORTIE"
  session_leader: string;          // "RUN LEADER", "WALK LEADER", "TRAIL LEADER"
  pace: string;                    // "le pace", "l'allure de marche", "le rythme de groupe"
  pace_label: string;              // "ALLURE", "DURÉE / RYTHME", "DÉNIVELÉ / RYTHME"
  default_pace_value: string;      // "5:30/km", "1h15 · Chill", "+450m D+"
  sweeper: string;                 // "le serre-file"
  checkin_members: string;         // "check-in coureurs", "check-in marcheurs", "check-in groupe"
}

export function getCommunityLabels(
  type?: string | null,
  customType?: string | null
): CommunityLabels {
  const normalizedType = (type || 'run_club') as CommunityType;

  switch (normalizedType) {
    case 'walk_club':
      return {
        community_type: 'walk_club',
        community_label: 'social walk club',
        session_single: 'une marche',
        session_single_cap: 'Une marche',
        session_plural: 'marches',
        session_plural_cap: 'Marches',
        members_plural: 'tes marcheurs',
        members_plural_short: 'marcheurs',
        members_plural_cap: 'Marcheurs',
        member_singular: 'marcheur',
        member_singular_cap: 'Marcheur',
        session_named: 'la marche',
        launch_session: 'organiser une marche',
        launch_session_cap: 'ORGANISER UNE MARCHE',
        plan_session: 'Planifier une marche',
        no_session_planned: 'AUCUNE MARCHE PLANIFIÉE',
        next_session: 'PROCHAINE MARCHE',
        session_leader: 'WALK LEADER',
        pace: "l'allure de marche",
        pace_label: 'DURÉE / RYTHME',
        default_pace_value: '1h15 · Chill',
        sweeper: 'le serre-file',
        checkin_members: 'check-in marcheurs',
      };

    case 'trail_hiking':
      return {
        community_type: 'trail_hiking',
        community_label: 'groupe de trail et randonnée',
        session_single: 'une sortie trail',
        session_single_cap: 'Une sortie trail',
        session_plural: 'sorties trail',
        session_plural_cap: 'Sorties trail',
        members_plural: 'ton groupe',
        members_plural_short: 'traileurs',
        members_plural_cap: 'Traileurs',
        member_singular: 'traileur',
        member_singular_cap: 'Traileur',
        session_named: 'la sortie',
        launch_session: 'planifier une sortie',
        launch_session_cap: 'PLANIFIER UNE SORTIE',
        plan_session: 'Planifier une sortie',
        no_session_planned: 'AUCUNE SORTIE PLANIFIÉE',
        next_session: 'PROCHAINE SORTIE',
        session_leader: 'TRAIL LEADER',
        pace: 'le rythme de groupe',
        pace_label: 'DÉNIVELÉ / RYTHME',
        default_pace_value: '+450m D+',
        sweeper: 'le serre-file',
        checkin_members: 'check-in groupe',
      };

    case 'other':
      const label = customType?.trim() || 'communauté sportive';
      return {
        community_type: 'other',
        community_label: label,
        session_single: 'une session',
        session_single_cap: 'Une session',
        session_plural: 'sessions',
        session_plural_cap: 'Sessions',
        members_plural: 'tes membres',
        members_plural_short: 'membres',
        members_plural_cap: 'Membres',
        member_singular: 'membre',
        member_singular_cap: 'Membre',
        session_named: 'la session',
        launch_session: 'lancer une session',
        launch_session_cap: 'LANCER UNE SESSION',
        plan_session: 'Planifier une session',
        no_session_planned: 'AUCUNE SESSION PLANIFIÉE',
        next_session: 'PROCHAINE SESSION',
        session_leader: 'SESSION LEADER',
        pace: "l'allure",
        pace_label: 'RYTHME',
        default_pace_value: 'Tous niveaux',
        sweeper: 'le serre-file',
        checkin_members: 'check-in membres',
      };

    case 'run_club':
    default:
      return {
        community_type: 'run_club',
        community_label: 'social run club',
        session_single: 'un run',
        session_single_cap: 'Un run',
        session_plural: 'runs',
        session_plural_cap: 'Runs',
        members_plural: 'tes coureurs',
        members_plural_short: 'coureurs',
        members_plural_cap: 'Coureurs',
        member_singular: 'coureur',
        member_singular_cap: 'Coureur',
        session_named: 'le run',
        launch_session: 'lancer un run',
        launch_session_cap: 'LANCER UN RUN',
        plan_session: 'Planifier un run',
        no_session_planned: 'AUCUN RUN PLANIFIÉ',
        next_session: 'PROCHAIN RUN',
        session_leader: 'RUN LEADER',
        pace: 'le pace',
        pace_label: 'ALLURE',
        default_pace_value: '5:00/K',
        sweeper: 'le serre-file',
        checkin_members: 'check-in coureurs',
      };
  }
}
