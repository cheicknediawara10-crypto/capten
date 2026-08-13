"use client";

import React from "react";
import {
  LayoutDashboard, Users, Map, BarChart3, MapPin, ShieldCheck, Settings,
  Calendar, TrendingUp, Check, ArrowUpRight, Flame, Clock, ChevronRight,
} from "lucide-react";

// Palette premium (autonome — la page force le dark showcase)
const BG = "#0B0B0A", SURF = "#151513", SURF2 = "#201F1C", BORD = "rgba(255,255,255,0.07)";
const TXT = "#F6F5F2", MUT = "#8E8A82", ORANGE = "#FF6A1A", GREEN = "#3DD68C";

const NAV = [
  { icon: LayoutDashboard, label: "Tableau de bord", active: true },
  { icon: Users, label: "Membres" },
  { icon: Map, label: "Les Runs" },
  { icon: BarChart3, label: "Statistiques" },
  { icon: MapPin, label: "Les Spots" },
  { icon: ShieldCheck, label: "Protection" },
];

const WEEKS = [8, 11, 9, 14, 12, 18, 16, 21]; // check-ins / semaine (démo)

function Ring({ pct, size = 168, stroke = 14, color = ORANGE, center }: { pct: number; size?: number; stroke?: number; color?: string; center: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SURF2} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>
    </div>
  );
}

export default function ApercuPage() {
  const maxW = Math.max(...WEEKS);
  return (
    <div className="min-h-screen flex" style={{ background: BG, color: TXT }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col py-8 px-4 border-r" style={{ borderColor: BORD, background: SURF }}>
        <div className="flex items-center gap-2.5 px-3 mb-10">
          <img src="/logo.png" alt="" className="h-7 w-auto" />
          <span className="font-display italic font-black text-lg" style={{ color: TXT }}>CAPTEN</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] px-4 mb-3" style={{ color: MUT }}>Pilotage</p>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <div key={n.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium"
              style={n.active ? { background: "rgba(255,106,26,0.12)", color: ORANGE } : { color: MUT }}>
              <n.icon size={18} strokeWidth={1.6} />
              {n.label}
            </div>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: SURF2 }}>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: MUT }}>Thème</span>
          <div className="w-11 h-6 rounded-full flex items-center px-0.5" style={{ background: "#000" }}>
            <div className="w-5 h-5 rounded-full ml-auto" style={{ background: ORANGE }} />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[13px]" style={{ color: MUT }}>Salut Captain 👋</p>
            <h1 className="font-display italic font-black uppercase tracking-tighter leading-none" style={{ fontSize: 44, color: TXT }}>
              Night Runners Paris
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "rgba(255,106,26,0.14)", color: ORANGE }}>
            <Flame size={13} /> Captain Pro
          </span>
        </div>

        {/* Rangée 1 : anneau héro + prochain run */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Hero ring */}
          <div className="lg:col-span-2 rounded-3xl p-7 flex flex-col sm:flex-row items-center gap-8" style={{ background: SURF, border: `1px solid ${BORD}` }}>
            <Ring
              pct={0.86}
              center={
                <>
                  <span className="font-display italic font-black leading-none" style={{ fontSize: 46, color: TXT }}>43</span>
                  <span className="text-[11px] uppercase tracking-widest mt-1.5" style={{ color: MUT }}>membres actifs</span>
                </>
              }
            />
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: MUT }}>Ce mois-ci</span>
                <span className="inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ color: GREEN, background: "rgba(61,214,140,0.12)" }}>
                  <ArrowUpRight size={12} /> +18%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {[{ v: "12", l: "Runs" }, { v: "287", l: "Check-ins" }, { v: "92%", l: "Présence" }].map((m) => (
                  <div key={m.l}>
                    <p className="font-display italic font-black leading-none" style={{ fontSize: 32, color: TXT }}>{m.v}</p>
                    <p className="text-[10px] uppercase tracking-wider mt-1.5" style={{ color: MUT }}>{m.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prochain run */}
          <div className="rounded-3xl p-7 flex flex-col" style={{ background: `linear-gradient(160deg, ${ORANGE}, #E04B00)` }}>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Prochain run</span>
            <h3 className="font-display italic font-black uppercase text-white leading-tight mt-2" style={{ fontSize: 26 }}>Run du jeudi<br />République</h3>
            <div className="mt-auto pt-6 space-y-2 text-white/90 text-[13px] font-medium">
              <p className="flex items-center gap-2"><Clock size={14} /> Jeu. 19:00 · 8 km</p>
              <p className="flex items-center gap-2"><Users size={14} /> 28 inscrits · 6 en attente</p>
            </div>
            <button className="mt-5 h-11 rounded-xl bg-white text-[#E04B00] text-[13px] font-bold flex items-center justify-center gap-1.5">
              Gérer le run <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Rangée 2 : graphe d'activité + répartition */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar chart */}
          <div className="lg:col-span-2 rounded-3xl p-7" style={{ background: SURF, border: `1px solid ${BORD}` }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: MUT }}>Check-ins · 8 semaines</h3>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: GREEN }}>
                <TrendingUp size={14} /> en hausse
              </span>
            </div>
            <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: 150 }}>
              {WEEKS.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg" style={{
                    height: `${(v / maxW) * 130}px`,
                    background: i === WEEKS.length - 1 ? ORANGE : "rgba(255,106,26,0.28)",
                  }} />
                  <span className="text-[9px]" style={{ color: MUT }}>S{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition */}
          <div className="rounded-3xl p-7 flex flex-col items-center" style={{ background: SURF, border: `1px solid ${BORD}` }}>
            <h3 className="text-[13px] font-semibold uppercase tracking-widest self-start mb-4" style={{ color: MUT }}>Assiduité</h3>
            <Ring pct={0.72} size={140} stroke={12} color={GREEN}
              center={<><span className="font-display italic font-black leading-none" style={{ fontSize: 34, color: TXT }}>72%</span><span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: MUT }}>réguliers</span></>} />
            <p className="text-[12px] text-center mt-4 leading-snug" style={{ color: MUT }}>31 membres courent chaque semaine</p>
          </div>
        </div>

        <p className="text-center text-[12px] mt-10" style={{ color: MUT }}>
          Aperçu de design — données de démonstration. <span style={{ color: ORANGE }}>Valide ce style et je l'applique à ton vrai dashboard.</span>
        </p>
      </main>
    </div>
  );
}
