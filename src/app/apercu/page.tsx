"use client";

import React from "react";
import {
  LayoutDashboard, Users, Map, BarChart3, MapPin, ShieldCheck, Settings,
  CreditCard, HelpCircle, LogOut, Calendar, TrendingUp, Flame, Clock,
  ChevronRight, ArrowUpRight, Search, Shield, FileCheck, Phone, Plus,
  Siren, FileText, ArrowRight, Coffee, ShoppingBag, HeartPulse, Gift,
  ExternalLink, Check, MessageCircle, Mail, Send, Sparkles,
  MessageSquare, Copy, Share2,
} from "lucide-react";

// Palette premium autonome (la page force le dark showcase)
const BG = "#0B0B0A", SURF = "#151513", SURF2 = "#201F1C", BORD = "rgba(255,255,255,0.07)";
const TXT = "#F6F5F2", MUT = "#8E8A82", ORANGE = "#FF6A1A", GREEN = "#3DD68C", RED = "#F87171", AMBER = "#F59E0B";

const NAV_SECTIONS = [
  { title: "Pilotage", items: [
    { icon: LayoutDashboard, label: "Tableau de bord", active: true },
    { icon: Users, label: "Membres" },
    { icon: Map, label: "Les Runs" },
    { icon: BarChart3, label: "Statistiques" },
    { icon: MessageSquare, label: "Messages" },
  ] },
  { title: "Terrain", items: [
    { icon: MapPin, label: "Les Spots" },
    { icon: ShieldCheck, label: "Protection" },
  ] },
  { title: "Compte", items: [
    { icon: Settings, label: "Mon Crew" },
    { icon: CreditCard, label: "Abonnement" },
    { icon: HelpCircle, label: "Support & Aide" },
  ] },
];

const WEEKS = [8, 11, 9, 14, 12, 18, 16, 21];
const MONTHS = [{ m: "mars", c: 42, e: 4 }, { m: "avr", c: 58, e: 4 }, { m: "mai", c: 61, e: 5 }, { m: "juin", c: 74, e: 4 }, { m: "juil", c: 88, e: 5 }, { m: "août", c: 96, e: 4 }];
const MEMBERS = [
  { n: "Léa Moreau", p: "06 12 34 56 78", ice: true, w: true, c: 14 },
  { n: "Thomas Girard", p: "06 98 76 54 32", ice: true, w: false, c: 9 },
  { n: "Amina Diallo", p: "07 45 12 89 03", ice: false, w: true, c: 21 },
  { n: "Hugo Bernard", p: "06 55 44 33 22", ice: true, w: true, c: 6 },
  { n: "Clara Petit", p: "07 11 22 33 44", ice: false, w: false, c: 0 },
];
const RUNS = [
  { t: "Run du jeudi République", d: "Jeu. 19:00", loc: "Place de la République", st: "Publié", stc: GREEN },
  { t: "Sortie longue dimanche", d: "Dim. 09:00", loc: "Bois de Vincennes", st: "Publié", stc: GREEN },
  { t: "Fractionné piste", d: "Mar. 18:30", loc: "Stade Charléty", st: "Brouillon", stc: AMBER },
  { t: "Run récup lundi", d: "Lun. 19:00", loc: "Canal Saint-Martin", st: "Terminé", stc: MUT },
];
const SPOTS = [
  { n: "Café Central", cat: "Café", Icon: Coffee, mot: "Notre QG d'après-run, tous les jeudis.", av: "-10% sur présentation", adr: "12 rue de la Paix" },
  { n: "Runner's Store", cat: "Shop", Icon: ShoppingBag, mot: "Ils connaissent nos pieds par cœur.", av: "-15% sur les chaussures", adr: "45 bd Voltaire" },
  { n: "Kiné du Sport", cat: "Kiné", Icon: HeartPulse, mot: "Remet le crew sur pied.", av: "Bilan offert 1re séance", adr: "8 av. de la République" },
];

function Ring({ pct, size = 168, stroke = 14, color = ORANGE, center }: { pct: number; size?: number; stroke?: number; color?: string; center: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SURF2} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>
    </div>
  );
}

const cardStyle = { background: SURF, border: `1px solid ${BORD}` };
const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="font-display italic font-black uppercase tracking-tighter leading-none" style={{ fontSize: 40, color: TXT }}>{children}</h1>
);
const Sub = ({ children }: { children: React.ReactNode }) => <p className="text-[13px] mt-1" style={{ color: MUT }}>{children}</p>;

// Bandeau séparateur entre chaque écran
function ScreenLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 mt-16 first:mt-0">
      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black" style={{ background: "rgba(255,106,26,0.14)", color: ORANGE }}>{n}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: MUT }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: BORD }} />
    </div>
  );
}

export default function ApercuPage() {
  const maxW = Math.max(...WEEKS), maxC = Math.max(...MONTHS.map((m) => m.c)), maxE = Math.max(...MONTHS.map((m) => m.e));

  return (
    <div className="min-h-screen flex" style={{ background: BG, color: TXT }}>
      {/* Sidebar complète */}
      <aside className="hidden lg:flex w-[264px] shrink-0 flex-col py-8 px-4 border-r sticky top-0 h-screen overflow-y-auto" style={{ borderColor: BORD, background: SURF }}>
        <div className="flex items-center gap-2.5 px-3 mb-10">
          <img src="/logo.png" alt="" className="h-7 w-auto" />
          <span className="font-display italic font-black text-lg" style={{ color: TXT }}>CAPTEN</span>
        </div>
        <nav className="space-y-7 flex-1">
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.title}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] px-4 mb-3 italic opacity-70" style={{ color: MUT }}>{sec.title}</p>
              <div className="space-y-1">
                {sec.items.map((n) => (
                  <div key={n.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium" style={(n as any).active ? { background: "rgba(255,106,26,0.12)", color: ORANGE } : { color: MUT }}>
                    <n.icon size={18} strokeWidth={1.6} />
                    {n.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-6 pt-6 border-t space-y-2" style={{ borderColor: BORD }}>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: MUT }}>Thème</span>
            <div className="w-11 h-6 rounded-full flex items-center px-0.5" style={{ background: "#000" }}><div className="w-5 h-5 rounded-full ml-auto" style={{ background: ORANGE }} /></div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest" style={{ color: MUT }}>
            <LogOut size={18} strokeWidth={1.6} /> Déconnexion
          </div>
        </div>
      </aside>

      {/* Main — tous les écrans empilés */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 max-w-[1200px]">
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ background: SURF2, color: MUT }}>
          <Sparkles size={13} style={{ color: ORANGE }} /> Aperçu design — fais défiler pour voir chaque onglet
        </div>

        {/* ══ 1 · DASHBOARD ══ */}
        <ScreenLabel n={1} label="Tableau de bord" />
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[13px]" style={{ color: MUT }}>Salut Captain 👋</p>
            <H1>Night Runners Paris</H1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ background: "rgba(255,106,26,0.14)", color: ORANGE }}><Flame size={13} /> Captain Pro</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 rounded-3xl p-7 flex flex-col sm:flex-row items-center gap-8" style={cardStyle}>
            <Ring pct={0.86} center={<><span className="font-display italic font-black leading-none" style={{ fontSize: 46, color: TXT }}>43</span><span className="text-[11px] uppercase tracking-widest mt-1.5" style={{ color: MUT }}>sur 50 membres</span></>} />
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: MUT }}>Ce mois-ci</span>
                <span className="inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ color: GREEN, background: "rgba(61,214,140,0.12)" }}><ArrowUpRight size={12} /> +18%</span>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {[{ v: "12", l: "Runs" }, { v: "287", l: "Check-ins" }, { v: "7", l: "Places libres" }].map((m) => (
                  <div key={m.l}><p className="font-display italic font-black leading-none" style={{ fontSize: 32, color: TXT }}>{m.v}</p><p className="text-[10px] uppercase tracking-wider mt-1.5" style={{ color: MUT }}>{m.l}</p></div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-3xl p-7 flex flex-col" style={{ background: `linear-gradient(160deg, ${ORANGE}, #E04B00)` }}>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Prochain run</span>
            <h3 className="font-display italic font-black uppercase text-white leading-tight mt-2" style={{ fontSize: 26 }}>Run du jeudi<br />République</h3>
            <div className="mt-auto pt-6 space-y-2 text-white/90 text-[13px] font-medium">
              <p className="flex items-center gap-2"><Clock size={14} /> Jeu. 19:00 · 8 km</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> Place de la République</p>
            </div>
            <span className="mt-5 h-11 rounded-xl bg-white text-[#E04B00] text-[13px] font-bold flex items-center justify-center gap-1.5">Gérer le run <ChevronRight size={15} /></span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-3xl p-7" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: MUT }}>Check-ins · 8 semaines</h3>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: GREEN }}><TrendingUp size={14} /> 287 total</span>
            </div>
            <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: 150 }}>
              {WEEKS.map((v, i) => <div key={i} className="flex-1 flex flex-col items-center gap-2"><div className="w-full rounded-t-lg" style={{ height: `${(v / maxW) * 130}px`, background: i === WEEKS.length - 1 ? ORANGE : "rgba(255,106,26,0.28)" }} /><span className="text-[9px]" style={{ color: MUT }}>S{i + 1}</span></div>)}
            </div>
          </div>
          <div className="rounded-3xl p-7 flex flex-col items-center" style={cardStyle}>
            <h3 className="text-[13px] font-semibold uppercase tracking-widest self-start mb-4" style={{ color: MUT }}>Assiduité</h3>
            <Ring pct={0.72} size={140} stroke={12} color={GREEN} center={<><span className="font-display italic font-black leading-none" style={{ fontSize: 34, color: TXT }}>72%</span><span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: MUT }}>réguliers</span></>} />
            <p className="text-[12px] text-center mt-4 leading-snug" style={{ color: MUT }}>31 membres courent chaque semaine</p>
          </div>
        </div>

        {/* ══ 2 · MEMBRES ══ */}
        <ScreenLabel n={2} label="Membres" />
        <div className="mb-6"><H1>Les Membres</H1><Sub>43 membres dans ton crew</Sub></div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: MUT }} />
            <div className="w-full h-11 pl-10 pr-4 rounded-full flex items-center text-sm" style={{ ...cardStyle, color: MUT }}>Nom, téléphone…</div>
          </div>
          <div className="flex gap-1 rounded-full p-1 h-fit" style={cardStyle}>
            {["Tous", "Sans ICE", "Sans décharge", "ICE OK"].map((f, i) => <span key={f} className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={i === 0 ? { background: ORANGE, color: "#fff" } : { color: MUT }}>{f}</span>)}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[{ l: "Sans ICE", v: 2, c: RED }, { l: "Sans décharge", v: 2, c: AMBER }, { l: "Ont couru", v: 4, c: GREEN }].map((s) => (
            <div key={s.l} className="rounded-2xl p-4 text-center" style={cardStyle}><p className="font-display font-black italic leading-none" style={{ fontSize: 28, color: s.c }}>{s.v}</p><p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: MUT }}>{s.l}</p></div>
          ))}
        </div>
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          {MEMBERS.map((m, i) => (
            <div key={m.n} className="flex items-center gap-4 p-4" style={{ borderTop: i ? `1px solid ${BORD}` : "none" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-[12px]" style={{ background: "rgba(255,106,26,0.14)", color: ORANGE }}>{m.n.split(" ").map((x) => x[0]).join("")}</div>
              <div className="flex-1 min-w-0"><p className="text-[14px] font-semibold" style={{ color: TXT }}>{m.n}</p><p className="text-[11px] flex items-center gap-1" style={{ color: MUT }}><Phone size={9} /> {m.p}</p></div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: m.ice ? "rgba(61,214,140,0.15)" : "rgba(248,113,113,0.12)" }}><Shield size={11} style={{ color: m.ice ? GREEN : RED }} /></span>
                <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: m.w ? "rgba(61,214,140,0.15)" : "rgba(248,113,113,0.12)" }}><FileCheck size={11} style={{ color: m.w ? GREEN : RED }} /></span>
                {m.c > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: SURF2, color: MUT }}>{m.c}</span>}
              </div>
              <ChevronRight size={14} style={{ color: MUT }} />
            </div>
          ))}
        </div>

        {/* ══ 3 · LES RUNS ══ */}
        <ScreenLabel n={3} label="Les Runs" />
        <div className="flex items-start justify-between mb-6">
          <div><H1>Les Runs</H1><Sub>2 runs à venir</Sub></div>
          <span className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest" style={{ background: ORANGE }}><Plus size={14} /> Nouveau Run</span>
        </div>
        <div className="flex items-center gap-1 rounded-full p-1 w-fit mb-6" style={cardStyle}>
          {["Toutes", "À venir", "Passées", "Brouillons"].map((t, i) => <span key={t} className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider" style={i === 0 ? { background: ORANGE, color: "#fff" } : { color: MUT }}>{t}</span>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RUNS.map((r) => (
            <div key={r.t} className="rounded-3xl p-6" style={cardStyle}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: MUT }}><Calendar size={13} style={{ color: ORANGE }} /> {r.d}</div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ color: r.stc, background: `${r.stc}22` }}>{r.st}</span>
              </div>
              <h3 className="text-[16px] font-black uppercase mb-3 leading-tight tracking-tight" style={{ color: TXT }}>{r.t}</h3>
              <div className="flex items-center gap-2 text-[12px]" style={{ color: MUT }}><MapPin size={12} /> {r.loc}</div>
              <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${BORD}` }}><span className="text-[10px] uppercase tracking-wider" style={{ color: MUT }}>Voir les détails</span><ChevronRight size={14} style={{ color: MUT }} /></div>
            </div>
          ))}
        </div>

        {/* ══ 4 · STATISTIQUES ══ */}
        <ScreenLabel n={4} label="Statistiques" />
        <div className="mb-6"><H1>Statistiques</H1><Sub>L'activité de ton crew en un coup d'œil.</Sub></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[{ l: "Membres", v: 43, I: Users }, { l: "Runs", v: 24, I: Calendar }, { l: "Check-ins", v: 419, I: FileCheck }, { l: "Moy. par run", v: 17, I: TrendingUp }].map((k) => (
            <div key={k.l} className="rounded-3xl p-5" style={cardStyle}>
              <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-black uppercase tracking-widest" style={{ color: MUT }}>{k.l}</span><k.I size={18} style={{ color: ORANGE }} /></div>
              <p className="font-display font-black italic leading-none" style={{ fontSize: 38, color: TXT }}>{k.v}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl p-6 mb-5" style={cardStyle}>
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-6" style={{ color: MUT }}>Check-ins — 6 derniers mois</h3>
          <div className="flex items-end justify-between gap-3" style={{ height: 180 }}>
            {MONTHS.map((m) => <div key={m.m} className="flex-1 flex flex-col items-center gap-2"><div className="w-2.5 rounded-full" style={{ height: `${(m.c / maxC) * 150}px`, background: ORANGE }} /><span className="text-[10px]" style={{ color: MUT }}>{m.m}</span></div>)}
          </div>
        </div>
        <div className="rounded-3xl p-6" style={cardStyle}>
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-6" style={{ color: MUT }}>Runs par mois</h3>
          <div className="flex items-end justify-between gap-3" style={{ height: 140 }}>
            {MONTHS.map((m) => <div key={m.m} className="flex-1 flex flex-col items-center gap-2"><div className="w-full rounded-t-lg" style={{ height: `${(m.e / maxE) * 110}px`, background: "rgba(255,106,26,0.85)" }} /><span className="text-[10px]" style={{ color: MUT }}>{m.m}</span></div>)}
          </div>
        </div>

        {/* ══ 5 · MESSAGES ══ */}
        <ScreenLabel n={5} label="Messages · Templates WhatsApp" />
        <div className="mb-6"><H1>Messages</H1><Sub>25 modèles prêts à copier-coller dans ton WhatsApp — zéro frais, zéro Twilio.</Sub></div>
        <div className="flex flex-wrap gap-2 mb-6">
          {["Avant le run", "Pendant", "Après le run", "Social spot", "Accueil"].map((t, i) => (
            <span key={t} className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider" style={i === 0 ? { background: ORANGE, color: "#fff" } : { background: SURF2, color: MUT }}>{t}</span>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cartes templates */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "1.1", cat: "Avant run", label: "Rappel session J-0", hint: "30-60 min avant le run.", text: "NIGHT RUNNERS 📍 Ce soir 19:00, run habituel. 8 km, ciel dégagé." },
              { id: "1.3", cat: "Avant run", label: "Météo difficile", hint: "Pluie, froid — le run a lieu quand même.", text: "NIGHT RUNNERS 🌧️ Ce soir on court quand même. Tenue adaptée, on y va ensemble." },
              { id: "3.1", cat: "Après run", label: "Débrief standard", hint: "Le lendemain matin, sobre.", text: "NIGHT RUNNERS ✅ Merci d'être venus, on était 14 ! Stats à jour 👇" },
              { id: "3.6", cat: "Social spot", label: "After au spot", hint: "Après un run convivial.", text: "NIGHT RUNNERS 🍺 Merci pour l'ambiance ! On file au Café Central." },
            ].map((tpl) => (
              <div key={tpl.id} className="rounded-[20px] p-5 flex flex-col justify-between" style={cardStyle}>
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,106,26,0.1)", color: ORANGE, border: `1px solid rgba(255,106,26,0.2)` }}>{tpl.id}</span>
                    <span className="text-[9px] uppercase tracking-wider" style={{ color: MUT }}>{tpl.cat}</span>
                  </div>
                  <h3 className="font-display font-black italic uppercase text-lg leading-tight tracking-tight" style={{ color: TXT }}>{tpl.label}</h3>
                  <p className="text-[10px] italic mt-1" style={{ color: MUT }}>{tpl.hint}</p>
                  <div className="rounded-xl p-3 text-[11px] italic mt-3 leading-snug" style={{ background: SURF2, color: MUT, border: `1px solid ${BORD}` }}>{tpl.text}</div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${BORD}` }}>
                  <span className="text-[10px] font-bold flex items-center gap-1.5" style={{ color: ORANGE }}>🎯 Sélectionner <ArrowRight size={11} /></span>
                  <span className="text-[9px]" style={{ color: MUT }}>Copie & Partage</span>
                </div>
              </div>
            ))}
          </div>
          {/* Aperçu WhatsApp + actions */}
          <div className="rounded-3xl p-6 flex flex-col items-center" style={cardStyle}>
            <h3 className="text-[11px] font-black uppercase tracking-widest self-start mb-4" style={{ color: MUT }}>Aperçu WhatsApp</h3>
            <div className="w-full rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORD}` }}>
              <div className="flex items-center gap-2 px-3 py-2 text-white" style={{ background: "#075E54" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: "#12131C", color: ORANGE }}>NR</div>
                <div className="flex-1 min-w-0"><p className="text-[11px] font-black truncate">Night Runners Paris</p><p className="text-[8px] text-white/70">Groupe WhatsApp</p></div>
                <span className="text-white/70 text-xs">⋮</span>
              </div>
              <div className="p-3" style={{ background: "#E5DDD5" }}>
                <div className="max-w-[92%] rounded-lg rounded-tl-none p-3 shadow" style={{ background: "#fff", color: "#111" }}>
                  <p className="text-[11px] leading-relaxed font-medium">NIGHT RUNNERS 📍<br />Ce soir 19:00, run habituel.<br />8 km, ciel dégagé.<br />capten.app/nrp/run/xyz</p>
                  <div className="flex justify-end items-center gap-1 mt-1"><span className="text-[7.5px] text-[#8a8]">17:48</span><span className="text-[#34B7F1] text-[9px] font-black">✓✓</span></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full mt-4">
              <span className="flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-white" style={{ background: "#000" }}><Copy size={14} /> Copier</span>
              <span className="flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-white" style={{ background: "#25D366" }}><Share2 size={14} /> WhatsApp</span>
            </div>
            <p className="text-[10px] text-center mt-3 leading-snug" style={{ color: MUT }}>Copie le texte et colle-le dans ton groupe. C'est tout.</p>
          </div>
        </div>

        {/* ══ 6 · LES SPOTS ══ */}
        <ScreenLabel n={6} label="Les Spots du Crew" />
        <div className="flex items-start justify-between gap-4 mb-6">
          <div><H1>Les Spots du Crew</H1><Sub>Tes adresses recommandées — café, shop, kiné, ostéo…</Sub></div>
          <span className="shrink-0 inline-flex items-center gap-2 h-10 px-5 rounded-full text-white text-[13px] font-black uppercase tracking-wider" style={{ background: ORANGE }}><Plus size={15} /> Ajouter</span>
        </div>
        <div className="rounded-3xl px-5 py-4 flex items-start gap-3 mb-6" style={{ background: SURF2 }}>
          <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: SURF }}><MapPin size={18} style={{ color: ORANGE }} /></span>
          <div><p className="text-[13px] font-bold" style={{ color: TXT }}>L'after-run, les soins, l'équipement</p><p className="text-[12px] mt-0.5 leading-snug" style={{ color: MUT }}>Ces spots apparaissent sur la page d'inscription et la fiche de chaque membre.</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPOTS.map((s) => (
            <div key={s.n} className="rounded-[24px] p-5" style={cardStyle}>
              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center mb-3" style={{ background: "rgba(255,106,26,0.1)" }}><s.Icon size={19} style={{ color: ORANGE }} /></div>
              <h3 className="text-[15px] font-black uppercase tracking-tight leading-tight mb-0.5" style={{ color: TXT }}>{s.n}</h3>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: MUT }}>{s.cat}</span>
              <p className="text-[12px] italic mb-3 leading-snug" style={{ color: MUT }}>« {s.mot} »</p>
              <div className="flex items-center gap-1 text-[11px] mb-3" style={{ color: MUT }}><MapPin size={10} /> {s.adr}</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[11px] font-bold" style={{ background: ORANGE }}><Gift size={11} /> {s.av}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ border: `1px solid ${BORD}`, color: MUT }}><ExternalLink size={9} /> Carte</span>
              </div>
            </div>
          ))}
        </div>

        {/* ══ 7 · PROTECTION ══ */}
        <ScreenLabel n={7} label="Protection" />
        <div className="mb-6"><H1>Protection</H1><Sub>Tes réflexes de sécurité et les contacts d'urgence de ton crew.</Sub></div>
        <div className="rounded-3xl p-7 mb-5" style={{ background: "linear-gradient(160deg, #1C1B18, #121110)" }}>
          <div className="flex items-center gap-2.5 mb-5"><span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ORANGE }}><Siren size={18} className="text-white" /></span><h2 className="text-[13px] font-black uppercase tracking-widest text-white">Numéros d'urgence</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["17 (Police)", "18 (Pompiers)", "112 (Urgences EU)"].map((l) => <div key={l} className="flex items-center gap-2.5 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)" }}><Phone size={15} style={{ color: ORANGE }} /><span className="text-[13px] font-semibold text-white">{l}</span></div>)}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ I: Users, t: "Fiches ICE", d: "Contact prioritaire et infos médicales, en 1 clic.", cta: "Voir les membres" }, { I: FileText, t: "Décharges signées", d: "Chaque membre signe une décharge horodatée — preuve légale.", cta: "Vérifier" }, { I: ShieldCheck, t: "Check-in au RDV", d: "Valide qui est présent au départ, personne derrière.", cta: "Les runs" }].map((c) => (
            <div key={c.t} className="rounded-3xl p-5 flex flex-col" style={cardStyle}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,106,26,0.1)", color: ORANGE }}><c.I size={18} /></div>
              <h3 className="text-[15px] font-black uppercase tracking-tight mb-1" style={{ color: TXT }}>{c.t}</h3>
              <p className="text-[12px] leading-snug flex-1" style={{ color: MUT }}>{c.d}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: ORANGE }}>{c.cta} <ArrowRight size={12} /></span>
            </div>
          ))}
        </div>

        {/* ══ 8 · ABONNEMENT ══ */}
        <ScreenLabel n={8} label="Abonnement" />
        <div className="mb-6"><H1>Abonnement</H1><Sub>Ton plan Capten et ta facturation.</Sub></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Découverte */}
          <div className="rounded-3xl p-7 flex flex-col" style={cardStyle}>
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: MUT }}>Découverte</span>
            <div className="flex items-end gap-1 mt-3 mb-1"><span className="font-display italic font-black leading-none" style={{ fontSize: 44, color: TXT }}>0€</span><span className="text-[12px] mb-1.5" style={{ color: MUT }}>/ mois</span></div>
            <p className="text-[12px] mb-5" style={{ color: MUT }}>Pour lancer ton crew.</p>
            <div className="space-y-2.5 flex-1">
              {["1 run par mois", "20 membres max", "Fiches ICE & décharges"].map((f) => <p key={f} className="flex items-center gap-2 text-[13px]" style={{ color: TXT }}><Check size={14} style={{ color: GREEN }} /> {f}</p>)}
            </div>
            <span className="mt-6 h-11 rounded-xl flex items-center justify-center text-[12px] font-bold uppercase tracking-widest" style={{ background: SURF2, color: MUT }}>Plan actuel</span>
          </div>
          {/* Captain Pro */}
          <div className="rounded-3xl p-7 flex flex-col relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${ORANGE}, #E04B00)` }}>
            <span className="absolute top-5 right-5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white"><Flame size={11} /> Populaire</span>
            <span className="text-[11px] font-black uppercase tracking-widest text-white/80">Captain Pro</span>
            <div className="flex items-end gap-1 mt-3 mb-1"><span className="font-display italic font-black leading-none text-white" style={{ fontSize: 44 }}>29,99€</span><span className="text-[12px] mb-1.5 text-white/80">/ mois</span></div>
            <p className="text-[12px] text-white/85 mb-5">Tout, sans limite.</p>
            <div className="space-y-2.5 flex-1">
              {["Membres & runs illimités", "Check-in GPS natif", "WhatsApp automatisé", "Les Spots du Crew", "Registre légal (PDF/CSV)", "Support prioritaire"].map((f) => <p key={f} className="flex items-center gap-2 text-[13px] font-medium text-white"><Check size={14} className="text-white" /> {f}</p>)}
            </div>
            <span className="mt-6 h-11 rounded-xl bg-white text-[#E04B00] text-[13px] font-bold flex items-center justify-center gap-1.5">Passer à Captain Pro <ArrowRight size={15} /></span>
          </div>
        </div>

        {/* ══ 9 · SUPPORT ══ */}
        <ScreenLabel n={9} label="Support & Assistance" />
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <H1>Support & Assistance</H1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: "rgba(255,106,26,0.1)", color: ORANGE, border: `1px solid rgba(255,106,26,0.2)` }}><span className="w-2 h-2 rounded-full" style={{ background: GREEN }} /> Support Capten</span>
        </div>
        <p className="text-[13px] mb-6 max-w-2xl" style={{ color: MUT }}>Un souci pendant un run, une question juridique ou un besoin d'assistance ? L'équipe Capten est là pour répondre à tes urgences terrain.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-3xl p-7 flex flex-col justify-between text-white" style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
            <div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.12)" }}><MessageCircle size={22} /></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Réponse en &lt; 15 min</span>
              <h3 className="text-[20px] font-display italic font-black uppercase mt-1">WhatsApp Captain</h3>
              <p className="text-[11px] text-white/85 mt-3 leading-relaxed">Contacte directement l'équipe pour une réponse prioritaire avant ton run.</p>
            </div>
            <span className="mt-6 h-11 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider" style={{ background: "#fff", color: "#075E54" }}>Ouvrir WhatsApp <ArrowRight size={14} /></span>
          </div>
          <div className="rounded-3xl p-7 flex flex-col justify-between" style={cardStyle}>
            <div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: SURF2, color: TXT }}><Mail size={22} /></div>
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: MUT }}>Support formel</span>
              <h3 className="text-[20px] font-display italic font-black uppercase mt-1" style={{ color: TXT }}>Email direct</h3>
              <p className="text-[11px] mt-3 leading-relaxed" style={{ color: MUT }}>Questions admin, factures ou suggestions à <span style={{ color: TXT }}>support@capten.app</span>.</p>
            </div>
            <span className="mt-6 h-11 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-white" style={{ background: "#000" }}>Écrire par email <Mail size={14} /></span>
          </div>
          <div className="rounded-3xl p-7 flex flex-col justify-between" style={{ background: SURF2, border: `1px solid ${BORD}` }}>
            <div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(61,214,140,0.1)", color: GREEN }}><ShieldCheck size={22} /></div>
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: GREEN }}>Sécurité & réseau</span>
              <h3 className="text-[20px] font-display italic font-black uppercase mt-1" style={{ color: TXT }}>État système</h3>
              <div className="space-y-2 mt-4 text-[11px]">
                {["Plateforme", "Paiements sécurisés", "Données & sauvegardes"].map((l) => <p key={l} className="flex items-center justify-between pb-1.5" style={{ borderBottom: `1px solid ${BORD}`, color: MUT }}><span>{l}</span><span className="font-bold" style={{ color: GREEN }}>100% OK</span></p>)}
              </div>
            </div>
            <span className="mt-5 text-[9px] font-bold uppercase tracking-widest text-center" style={{ color: MUT }}>Dernière vérif : il y a 30s</span>
          </div>
        </div>

        <p className="text-center text-[12px] mt-16" style={{ color: MUT }}>
          Fin de l'aperçu — données de démonstration. <span style={{ color: ORANGE }}>Valide et je pousse tout en prod.</span>
        </p>
      </main>
    </div>
  );
}
