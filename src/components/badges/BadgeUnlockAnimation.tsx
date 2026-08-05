"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const BADGE_EMOJIS: Record<string, string> = {
  first_run:      "🎽",
  regular_runner: "🔥",
  legend:         "🏆",
  explorer:       "🗺️",
  ambassador:     "📣",
  early_member:   "⭐",
};

interface BadgeUnlockAnimationProps {
  badgeSlug: string;
  badgeName: string;
  onDone?: () => void;
}

export function BadgeUnlockAnimation({ badgeSlug, badgeName, onDone }: BadgeUnlockAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  const emoji = BADGE_EMOJIS[badgeSlug] || "🏅";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="flex flex-col items-center gap-5 text-center px-6"
          >
            {/* Glow rings */}
            <div className="relative">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[#FF5500]/30"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2 + i * 0.6, opacity: 0 }}
                  transition={{ duration: 1.6, delay: i * 0.25, repeat: Infinity }}
                />
              ))}

              <motion.div
                className="w-32 h-32 rounded-full bg-[#FF5500]/10 border-2 border-[#FF5500] flex items-center justify-center"
                animate={{ boxShadow: ["0 0 0px #FF5500", "0 0 60px #FF5500", "0 0 0px #FF5500"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.span
                  className="text-6xl"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20, delay: 0.2 }}
                >
                  {emoji}
                </motion.span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-[11px] font-black uppercase tracking-widest text-[#FF5500] mb-1">
                Badge débloqué !
              </p>
              <h2 className="text-[28px] font-display font-black italic uppercase text-white leading-tight">
                {badgeName}
              </h2>
            </motion.div>

            {/* Confetti particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ["#FF5500", "#FACC15", "#4ADE80", "#60A5FA", "#C084FC"][i % 5],
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: (Math.cos((i / 12) * Math.PI * 2) * 160),
                  y: (Math.sin((i / 12) * Math.PI * 2) * 160),
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
