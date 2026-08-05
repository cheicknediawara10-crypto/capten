export interface BadgeDefinition {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  category: "participation" | "discovery" | "community" | "loyalty";
  threshold: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: "first_run",
    name: "Premier Run",
    emoji: "🥉",
    description: "A participé à son premier événement avec succès.",
    category: "participation",
    threshold: 1,
  },
  {
    slug: "regular_runner",
    name: "Régulier",
    emoji: "🔥",
    description: "A participé à 10 événements.",
    category: "participation",
    threshold: 10,
  },
  {
    slug: "legend",
    name: "Légende",
    emoji: "🏆",
    description: "A participé à 100 événements.",
    category: "participation",
    threshold: 100,
  },
  {
    slug: "explorer",
    name: "Explorateur",
    emoji: "🌍",
    description: "A participé dans 5 lieux différents.",
    category: "discovery",
    threshold: 5,
  },
  {
    slug: "ambassador",
    name: "Ambassadeur",
    emoji: "🤝",
    description: "A parrainé 5 nouveaux membres.",
    category: "community",
    threshold: 5,
  },
  {
    slug: "early_member",
    name: "Early Member",
    emoji: "⭐",
    description: "A rejoint le club dans son premier mois.",
    category: "loyalty",
    threshold: 1,
  },
];

export function getBadgeBySlug(slug: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.slug === slug);
}

export async function checkAndAwardBadges(
  memberId: string,
  checkinCount: number,
  uniqueLocations: number,
  referralCount: number,
  supabase: any
): Promise<string[]> {
  const awarded: string[] = [];

  const checks = [
    { slug: "first_run", condition: checkinCount >= 1 },
    { slug: "regular_runner", condition: checkinCount >= 10 },
    { slug: "legend", condition: checkinCount >= 100 },
    { slug: "explorer", condition: uniqueLocations >= 5 },
    { slug: "ambassador", condition: referralCount >= 5 },
  ];

  for (const check of checks) {
    if (!check.condition) continue;

    const { data: badge } = await supabase
      .from("badges")
      .select("id")
      .eq("slug", check.slug)
      .single();

    if (!badge) continue;

    const { error } = await supabase.from("member_badges").insert({
      member_id: memberId,
      badge_id: badge.id,
    });

    if (!error) {
      awarded.push(check.slug);
    }
  }

  return awarded;
}
