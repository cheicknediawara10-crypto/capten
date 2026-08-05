"use client";

import { motion } from "framer-motion";
import { BadgeDisplay } from "./BadgeDisplay";

const ALL_BADGES = [
  { slug: "first_run",      name: "Premier Run",    description: "Participe à ta 1ère sortie" },
  { slug: "regular_runner", name: "Régulier",       description: "5 check-ins validés" },
  { slug: "legend",         name: "Légende",        description: "50 check-ins validés" },
  { slug: "explorer",       name: "Explorateur",    description: "Check-in dans 3 villes différentes" },
  { slug: "ambassador",     name: "Ambassadeur",    description: "3 parrainages réussis" },
  { slug: "early_member",   name: "Early Member",   description: "Membre fondateur CAPTEN" },
];

interface BadgeGridProps {
  earnedSlugs: string[];
  size?: "sm" | "md" | "lg";
  showLocked?: boolean;
  columns?: number;
}

export function BadgeGrid({ earnedSlugs, size = "md", showLocked = true, columns = 3 }: BadgeGridProps) {
  const earnedSet = new Set(earnedSlugs);

  const badges = showLocked
    ? ALL_BADGES
    : ALL_BADGES.filter((b) => earnedSet.has(b.slug));

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-3xl mb-2">🎽</p>
        <p className="text-[12px] text-[#A3A3A3]">Aucun badge encore — cours pour en décrocher !</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {badges.map((badge, i) => {
        const earned = earnedSet.has(badge.slug);
        return (
          <motion.div
            key={badge.slug}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col items-center gap-2"
          >
            <BadgeDisplay
              badge={{ ...badge, locked: !earned }}
              size={size}
              animate={earned}
            />
            <div className="text-center">
              <p className={`text-[10px] font-black uppercase tracking-wider leading-tight ${
                earned ? "text-[#1A1918]" : "text-[#D1D5DB]"
              }`}>
                {badge.name}
              </p>
              {!earned && (
                <p className="text-[9px] text-[#D1D5DB] mt-0.5 leading-tight">{badge.description}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
