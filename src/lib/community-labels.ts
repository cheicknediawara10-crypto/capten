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
  session_single: string;       // "un run", "une marche", "une sortie trail"
  session_single_cap: string;   // "Un run", "Une marche", "Une sortie trail"
  members_plural: string;       // "tes coureurs", "tes marcheurs", "ton groupe"
  member_singular: string;      // "coureur", "marcheur", "participant"
  session_named: string;        // "le run du mardi", "la marche du mardi"
  launch_session: string;       // "lancer un run", "organiser une marche"
  pace: string;                 // "le pace", "l'allure de marche", "le rythme de groupe"
  sweeper: string;              // "le serre-file"
  checkin_members: string;      // "check-in coureurs", "check-in participants"
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
        members_plural: 'tes marcheurs',
        member_singular: 'marcheur',
        session_named: 'la marche',
        launch_session: 'organiser une marche',
        pace: "l'allure de marche",
        sweeper: 'le serre-file',
        checkin_members: 'check-in participants',
      };

    case 'trail_hiking':
      return {
        community_type: 'trail_hiking',
        community_label: 'groupe de trail et randonnée',
        session_single: 'une sortie trail',
        session_single_cap: 'Une sortie trail',
        members_plural: 'ton groupe',
        member_singular: 'traileur',
        session_named: 'la sortie',
        launch_session: 'planifier une sortie',
        pace: 'le rythme de groupe',
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
        members_plural: 'tes membres',
        member_singular: 'membre',
        session_named: 'la session',
        launch_session: 'lancer une session',
        pace: "l'allure",
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
        members_plural: 'tes coureurs',
        member_singular: 'coureur',
        session_named: 'le run',
        launch_session: 'lancer un run',
        pace: 'le pace',
        sweeper: 'le serre-file',
        checkin_members: 'check-in coureurs',
      };
  }
}
