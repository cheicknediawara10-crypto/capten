"use client";

import React, { useState } from "react";
import { Compass, X } from "lucide-react";
import CopilotePanel from "@/components/copilote/CopilotePanel";

// Launcher flottant bas-droite (façon assistant/chatbot), présent sur tout
// l'espace fondateur. Le panneau reste monté (caché) pour alimenter le badge.
export default function CopiloteWidget({ preview = false }: { preview?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <div className="fixed z-[95] bottom-24 right-4 lg:bottom-8 lg:right-8 print:hidden">
      {/* Popover (toujours monté pour le compteur ; visible si ouvert) */}
      <div
        className={`absolute bottom-[76px] right-0 w-[92vw] max-w-[380px] origin-bottom-right transition-all duration-200 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-3xl shadow-2xl max-h-[72vh] overflow-y-auto relative">
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors"
          >
            <X size={15} />
          </button>
          <CopilotePanel embedded preview={preview} onCount={setCount} />
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ton Copilote"
        className="relative w-14 h-14 rounded-full bg-[#FF5C00] text-white shadow-[0_8px_24px_rgba(255,92,0,0.4)] flex items-center justify-center hover:bg-[#E04B00] active:scale-95 transition-all"
      >
        {open ? <X size={22} /> : <Compass size={24} />}
        {!open && count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-white text-[#FF5C00] text-[11px] font-black flex items-center justify-center border-2 border-[var(--app-bg)]">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
