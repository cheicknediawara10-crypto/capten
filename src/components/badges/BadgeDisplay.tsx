"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Badge {
  slug: string;
  name: string;
  description: string;
  awarded_at?: string;
  locked?: boolean;
}

const BADGE_EMOJIS: Record<string, string> = {
  first_run:      "🎽",
  regular_runner: "🔥",
  legend:         "🏆",
  explorer:       "🗺️",
  ambassador:     "📣",
  early_member:   "⭐",
};

const BADGE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  first_run:      { bg: "#FFF7ED", border: "#FDBA74", glow: "rgba(251,146,60,0.4)" },
  regular_runner: { bg: "#FFF7ED", border: "#FF5500", glow: "rgba(255,85,0,0.4)" },
  legend:         { bg: "#FEFCE8", border: "#FACC15", glow: "rgba(250,204,21,0.5)" },
  explorer:       { bg: "#F0FDF4", border: "#4ADE80", glow: "rgba(74,222,128,0.4)" },
  ambassador:     { bg: "#EFF6FF", border: "#60A5FA", glow: "rgba(96,165,250,0.4)" },
  early_member:   { bg: "#FAF5FF", border: "#C084FC", glow: "rgba(192,132,252,0.5)" },
};

interface BadgeDisplayProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  animate?: boolean;
}

export function BadgeDisplay({ badge, size = "md", showTooltip = true, animate = false }: BadgeDisplayProps) {
  const [tooltip, setTooltip] = useState(false);
  const colors = BADGE_COLORS[badge.slug] || { bg: "#F4F4EE", border: "#D1D5DB", glow: "rgba(0,0,0,0.1)" };

  const sizes = {
    sm: { outer: "w-10 h-10", emoji: "text-xl", ring: 36 },
    md: { outer: "w-14 h-14", emoji: "text-3xl", ring: 52 },
    lg: { outer: "w-20 h-20", emoji: "text-4xl", ring: 72 },
  };
  const sz = sizes[size];

  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.div
        whileHover={!badge.locked ? { scale: 1.08 } : {}}
        whileTap={!badge.locked ? { scale: 0.95 } : {}}
        onHoverStart={() => showTooltip && setTooltip(true)}
        onHoverEnd={() => setTooltip(false)}
        className="relative"
      >
        {animate && !badge.locked && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 0 ${colors.glow}` }}
            animate={{ boxShadow: [`0 0 0 0px ${colors.glow}`, `0 0 0 12px transparent`] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        <div
          className={`${sz.outer} rounded-full flex items-center justify-center border-2 transition-all ${
            badge.locked ? "opacity-30 grayscale" : ""
          }`}
          style={{ backgroundColor: colors.bg, borderColor: badge.locked ? "#E5E7EB" : colors.border }}
        >
          <span className={sz.emoji} style={{ filter: badge.locked ? "grayscale(1)" : "none" }}>
            {BADGE_EMOJIS[badge.slug] || "🏅"}
          </span>
        </div>

        {badge.locked && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <span className="text-[10px]">🔒</span>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {tooltip && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-[#1A1918] text-white px-3 py-2 rounded-[10px] text-center whitespace-nowrap shadow-xl">
              <p className="text-[11px] font-black uppercase tracking-wider">{badge.name}</p>
              <p className="text-[10px] text-white/60 mt-0.5">{badge.description}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A1918]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
