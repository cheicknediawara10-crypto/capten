"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  {
    id: "checkin",
    label: "Check-in GPS",
    emoji: "📍",
    headline: "Présence validée sur le terrain, pas sur WhatsApp.",
    body: "Tes membres arrivent au point de RDV, leur téléphone valide la présence par GPS. Rayon configurable (50m à 500m). Fallback QR code si réseau coupé. Le registre se remplit en temps réel.",
    tags: ["GPS haversine", "QR code fallback", "Rayon configurable", "Temps réel"],
    mockup: (
      <div className="bg-[#1A1918] rounded-[16px] overflow-hidden aspect-[4/3] relative flex flex-col items-center justify-center p-8">
        {/* Map simulation */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 400 300">
            {/* Map grid */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="white" strokeWidth="0.5" strokeDasharray="2,4"/>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="300" stroke="white" strokeWidth="0.5" strokeDasharray="2,4"/>
            ))}
            {/* Roads */}
            <path d="M50,150 Q200,100 350,160" stroke="white" strokeWidth="3" fill="none"/>
            <path d="M0,80 Q150,90 200,150 Q250,200 400,180" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        </div>

        {/* Geofence circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-2 border-[#FF5500]/50 bg-[#FF5500]/10 animate-pulse" />
          <div className="absolute w-48 h-48 rounded-full border border-[#FF5500]/20" />
        </div>

        {/* Center pin */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5500] rounded-full flex items-center justify-center text-black text-lg shadow-[0_0_20px_rgba(255,85,0,0.5)]">
            📍
          </div>
          <div className="bg-white/10 backdrop-blur rounded-[10px] px-4 py-2 text-center border border-white/10">
            <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Tu es dans la zone</p>
            <p className="text-[20px] font-black italic text-white uppercase">Check-in ✓</p>
            <p className="text-[11px] text-[#22C55E] font-bold mt-1">Distance: 47m · Rayon: 200m</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ice",
    label: "Membres & ICE",
    emoji: "🆘",
    headline: "En cas d'urgence, tu sais qui appeler en 1 seconde.",
    body: "Chaque membre renseigne sa fiche ICE lors de l'onboarding : contact d'urgence, groupe sanguin, allergies, traitements. Accessible en 1 clic depuis ton dashboard. Chiffré. RGPD.",
    tags: ["Contact d'urgence", "Groupe sanguin", "Allergies", "RGPD compliant"],
    mockup: (
      <div className="bg-[#1A1918] rounded-[16px] overflow-hidden aspect-[4/3] p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Fiche membre</p>
          <div className="bg-[#EF4444]/15 text-[#EF4444] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">ICE</div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 rounded-[10px] p-3 border border-white/8">
          <div className="w-10 h-10 bg-[#FF5500]/20 rounded-full flex items-center justify-center text-lg">🏃</div>
          <div>
            <p className="text-[13px] font-bold text-white">Marie Leclerc</p>
            <p className="text-[10px] text-white/40">Membre depuis janv. 2026 · 18 sorties</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Contact ICE", value: "Jean Leclerc • 06 12 34 56 78" },
            { label: "Groupe sanguin", value: "A+" },
            { label: "Allergie", value: "Aspirine" },
            { label: "Traitement", value: "Aucun" },
          ].map((field) => (
            <div key={field.label} className="bg-white/4 rounded-[8px] p-2.5 border border-white/6">
              <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">{field.label}</p>
              <p className="text-[11px] font-semibold text-white">{field.value}</p>
            </div>
          ))}
        </div>
        <button className="w-full bg-[#EF4444] text-white text-[11px] font-black uppercase rounded-[8px] py-2.5 tracking-wide flex items-center justify-center gap-2">
          🆘 Appeler le contact ICE
        </button>
      </div>
    ),
  },
  {
    id: "badges",
    label: "Badges",
    emoji: "🏆",
    headline: "La gamification qui fidélise ton crew.",
    body: "6 badges automatiques qui se débloquent sur les milestones de tes membres : premier run, 10e sortie, 50 sorties, explorateur, ambassadeur, early member. Une surprise à chaque check-in.",
    tags: ["6 badges auto", "Milestones personnalisés", "Animation unlock", "Profil public"],
    mockup: (
      <div className="bg-[#1A1918] rounded-[16px] overflow-hidden aspect-[4/3] p-6">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">Tes badges</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "🎽", label: "Premier Run", earned: true, color: "#22C55E" },
            { emoji: "🔥", label: "Regular Runner", earned: true, color: "#FF5500" },
            { emoji: "👑", label: "Légende", earned: true, color: "#F59E0B" },
            { emoji: "🗺️", label: "Explorateur", earned: false, color: "#6366F1" },
            { emoji: "📣", label: "Ambassadeur", earned: false, color: "#EC4899" },
            { emoji: "⭐", label: "Early Member", earned: true, color: "#06B6D4" },
          ].map((badge) => (
            <div
              key={badge.label}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-[10px] border transition-all ${
                badge.earned
                  ? "bg-white/6 border-white/12"
                  : "bg-white/2 border-white/4 opacity-40 grayscale"
              }`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: badge.earned ? `${badge.color}22` : "transparent", boxShadow: badge.earned ? `0 0 16px ${badge.color}33` : "none" }}
              >
                {badge.emoji}
              </div>
              <p className="text-[8px] text-white/60 text-center leading-tight font-medium">{badge.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-[8px] p-2.5 flex items-center gap-2">
          <span className="text-base">👑</span>
          <div>
            <p className="text-[10px] font-bold text-[#F59E0B]">Badge Légende débloqué !</p>
            <p className="text-[9px] text-white/30">50 sorties atteintes · Partage ton profil</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "spots",
    label: "CAPTEN Spots",
    emoji: "💰",
    headline: "Ton crew génère des revenus. Automatiquement.",
    body: "Tes membres consomment chez les partenaires locaux (cafés, sports, nutrition), 10% reviennent automatiquement dans la cagnotte de ton club. Zéro gestion. Suivi en temps réel.",
    tags: ["10% automatique", "Partenaires locaux", "Cagnotte club", "Virement mensuel"],
    mockup: (
      <div className="bg-[#1A1918] rounded-[16px] overflow-hidden aspect-[4/3] p-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Cagnotte du club</p>
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
        </div>
        <div className="bg-white/5 rounded-[10px] p-4 border border-white/8">
          <p className="text-[10px] text-white/30 mb-1">Solde disponible</p>
          <p className="text-[32px] font-black italic text-white leading-none">247 <span className="text-[#FF5500]">€</span></p>
          <p className="text-[10px] text-[#22C55E] mt-1 font-bold">+63€ ce mois · +34% vs mois dernier</p>
        </div>
        <p className="text-[9px] text-white/30 uppercase tracking-widest">Partenaires actifs</p>
        <div className="space-y-1.5">
          {[
            { name: "Café du Coin", cat: "Café", amount: "+12€", emoji: "☕" },
            { name: "Sport Passion", cat: "Équipement", amount: "+28€", emoji: "👟" },
            { name: "Bio Express", cat: "Nutrition", amount: "+23€", emoji: "🥗" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-2 bg-white/3 rounded-[7px] px-3 py-2 border border-white/5">
              <span className="text-base">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white">{p.name}</p>
                <p className="text-[8px] text-white/25">{p.cat}</p>
              </div>
              <span className="text-[10px] font-bold text-[#22C55E]">{p.amount}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function Product() {
  const [active, setActive] = useState(0);

  return (
    <section id="features" className="bg-[#F4F4EE] py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] mb-4"
          >
            Le produit
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.05 }}
            className="font-display text-[clamp(40px,5.5vw,68px)] italic font-black uppercase text-[#1A1918] leading-[0.95] tracking-tighter max-w-2xl"
          >
            TOUT CE DONT<br />
            <span className="text-[#1A1918]/25">TU AS BESOIN.</span>
          </motion.h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-bold transition-all duration-200 ${
                active === i
                  ? "bg-[#1A1918] text-white shadow-lg"
                  : "bg-[#1A1918]/8 text-[#1A1918]/60 hover:bg-[#1A1918]/14 hover:text-[#1A1918]"
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {TABS.map((tab, i) =>
            active === i ? (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
                className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              >
                {/* Text side */}
                <div className="space-y-6 order-2 lg:order-1">
                  <h3 className="text-[22px] sm:text-[28px] font-bold text-[#1A1918] leading-snug">
                    {tab.headline}
                  </h3>
                  <p className="text-[15px] text-[#1A1918]/55 leading-relaxed font-medium">
                    {tab.body}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tab.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-[7px] bg-[#1A1918]/6 text-[11px] font-mono text-[#1A1918]/60 border border-[#1A1918]/8"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 text-[14px] font-bold text-[#FF5500] hover:text-[#1A1918] transition-colors group"
                  >
                    Essayer maintenant
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                      <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>

                {/* Mockup side */}
                <div className="order-1 lg:order-2">
                  {tab.mockup}
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
