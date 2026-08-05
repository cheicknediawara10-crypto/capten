"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function DashboardMockup() {
  return (
    <div className="bg-[#101010] border border-white/10 rounded-[20px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)] w-full">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6 bg-[#0A0A0A]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <div className="ml-4 flex-1 bg-white/6 rounded-[5px] px-3 py-1 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-[10px] text-white/25 font-mono">capten.app/dashboard</span>
        </div>
      </div>

      {/* Sidebar + main split */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-[160px] shrink-0 border-r border-white/5 p-3 space-y-1 hidden sm:block">
          <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#FF5500]/15 mb-3">
            <div className="w-5 h-5 bg-[#FF5500] rounded-[5px]" />
            <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-wide">CAPTEN</span>
          </div>
          {[
            { label: "Dashboard", active: true },
            { label: "Sorties", active: false },
            { label: "Membres", active: false },
            { label: "Stats", active: false },
            { label: "Spots", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-[8px] ${item.active ? "bg-white/8 text-white" : "text-white/25"}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-[#FF5500]" : "bg-white/15"}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Club du 18ème Run</p>
              <p className="text-[12px] font-black text-white italic uppercase">DASHBOARD</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#22C55E]/15 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[9px] text-[#22C55E] font-bold uppercase tracking-wide">Live</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Membres", value: "187", delta: "+12", color: "text-[#FF5500]" },
              { label: "Sorties", value: "24", delta: "ce mois", color: "text-white/40" },
              { label: "Check-ins", value: "1 247", delta: "validés", color: "text-[#22C55E]" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white/4 rounded-[10px] p-3 border border-white/5">
                <p className="text-[8px] text-white/30 uppercase tracking-widest">{kpi.label}</p>
                <p className="text-[18px] font-black italic text-white leading-tight">{kpi.value}</p>
                <p className={`text-[9px] font-bold ${kpi.color}`}>{kpi.delta}</p>
              </div>
            ))}
          </div>

          {/* Recent check-ins */}
          <div className="space-y-1.5">
            <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Check-ins récents</p>
            {[
              { name: "Marie L.", time: "2 min", emoji: "🔥", badge: "Légende" },
              { name: "Thomas B.", time: "5 min", emoji: "⭐", badge: "Regular" },
              { name: "Léa P.", time: "8 min", emoji: "🎽", badge: "Premier run" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2.5 bg-white/3 rounded-[8px] px-3 py-2 border border-white/4">
                <div className="w-6 h-6 rounded-full bg-[#FF5500]/20 flex items-center justify-center text-[11px] shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">{item.name}</p>
                  <p className="text-[8px] text-white/25">il y a {item.time}</p>
                </div>
                <div className="px-1.5 py-0.5 rounded-[4px] bg-[#FF5500]/15 text-[8px] text-[#FF5500] font-bold shrink-0">
                  {item.badge}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0C0C0C] flex flex-col justify-center overflow-hidden">
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Orange glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF5500] rounded-full opacity-[0.06] blur-[120px]" />
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 pt-24 pb-16 lg:pb-24">
        <div className="max-w-[900px] mx-auto">

          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0, 0, 1] }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur text-[11px] font-mono text-white/50">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              500+ organisateurs actifs · Paris · Lyon · Bordeaux · Montréal
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0, 0, 1] }}
          >
            <h1 className="font-display text-[clamp(52px,9vw,110px)] leading-[0.9] tracking-tighter italic font-black uppercase text-white mb-6">
              TU COURS VITE.<br />
              <span className="text-white/20">TON ORGA</span>{" "}
              <span className="text-[#FF5500]">AUSSI.</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0, 0, 1] }}
            className="text-[15px] sm:text-[17px] text-white/50 font-medium leading-relaxed max-w-[540px] mb-10"
          >
            La plateforme tout-en-un pour les fondateurs de run clubs, walk social, trail et rando.
            Check-in GPS, fiches ICE, badges, revenus. Zéro appli pour tes membres.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0, 0, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-white text-black text-[14px] font-black uppercase tracking-wide rounded-[12px] px-7 py-4 transition-all duration-200 hover:scale-[1.02] shadow-[0_0_40px_rgba(255,85,0,0.3)]"
            >
              Lancer mon crew — gratuit
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-[14px] text-white/50 hover:text-white transition-colors font-medium group"
            >
              Voir en 30 secondes
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>

          {/* Social proof microcopy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 text-[12px] text-white/25 font-mono"
          >
            Gratuit pour toujours · Pas de CB requise · En ligne en 2 minutes
          </motion.p>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0, 0, 1] }}
          className="mt-16 lg:mt-20 max-w-[820px] mx-auto"
          style={{ perspective: "1200px" }}
        >
          <div style={{ transform: "rotateX(4deg)" }}>
            <DashboardMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
