"use client";

import React from "react";
import CopilotePanel from "@/components/copilote/CopilotePanel";
import CopiloteWidget from "@/components/copilote/CopiloteWidget";

export default function ApercuCopilotePage() {
  return (
    <div className="min-h-screen px-6 py-12" style={{ background: "#0B0B0A" }} data-theme="dark">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[30px] font-display italic font-black uppercase tracking-tighter text-white mb-1">
          Copilote — aperçu
        </h1>
        <p className="text-[13px] text-white/50 mb-8">
          Assistant flottant en bas à droite (façon chatbot). Le contenu du popover ci-dessous, données de démo.
        </p>
        {/* Contenu du popover, montré à plat pour la revue */}
        <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-3xl">
          <CopilotePanel embedded preview />
        </div>
        <p className="text-[12px] text-white/40 mt-8">↘️ Le bouton rond orange en bas à droite = le launcher réel. Clique-le.</p>
      </div>
      {/* Le vrai widget flottant */}
      <CopiloteWidget preview />
    </div>
  );
}
