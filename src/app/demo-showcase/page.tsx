"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  MapPin,
  CheckCircle2,
  Users,
  Award,
  Download,
  QrCode,
  HeartPulse,
  Coffee,
  Activity,
  Flame,
  Search,
  Bell,
  ChevronDown,
  UserCheck,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  Clock,
  Sparkles,
  Zap,
  Filter,
  Check,
  TrendingUp
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Mockup Interface Fictive Haute Définition
   URL: /demo-showcase
   Conçu spécialement pour capturer des screenshots & démonstrations
═══════════════════════════════════════════════════════════════ */

export default function DemoShowcasePage() {
  const [filter, setFilter] = useState<"all" | "checked" | "ice">("all");
  const [search, setSearch] = useState("");

  const runners = [
    { id: 1, name: "Thomas Lefebvre", phone: "06 14 22 89 10", blood: "A+", icePhone: "06 88 12 34 56", iceRelation: "Épouse (Marie)", allergy: "Aucune", status: "checked_in", distance: 12, time: "19:28:14", streak: 14 },
    { id: 2, name: "Sarah Marchand", phone: "06 98 77 12 34", blood: "O+", icePhone: "06 11 22 33 44", iceRelation: "Père (Jean)", allergy: "Allergie Pénicilline", status: "checked_in", distance: 8, time: "19:29:02", streak: 22 },
    { id: 3, name: "Alexandre Bernard", phone: "06 45 11 22 33", blood: "B-", icePhone: "06 77 88 99 00", iceRelation: "Sœur (Clara)", allergy: "Asthme léger (Ventoline)", status: "checked_in", distance: 24, time: "19:29:45", streak: 8 },
    { id: 4, name: "Élodie Petit", phone: "06 33 22 11 00", blood: "AB+", icePhone: "06 55 44 33 22", iceRelation: "Frère (Lucas)", allergy: "Aucune", status: "checked_in", distance: 18, time: "19:30:10", streak: 31 },
    { id: 5, name: "Julien Rochedieu", phone: "06 78 90 12 34", blood: "O-", icePhone: "06 99 88 77 66", iceRelation: "Mère (Chantal)", allergy: "Allergie Fruits à coque", status: "checked_in", distance: 15, time: "19:30:52", streak: 19 },
    { id: 6, name: "Camille Rousseau", phone: "06 12 34 56 78", blood: "A-", icePhone: "06 44 33 22 11", iceRelation: "Conjoint (David)", allergy: "Aucune", status: "pending", distance: null, time: "-", streak: 5 },
    { id: 7, name: "Maxime Fournier", phone: "06 87 65 43 21", blood: "B+", icePhone: "06 22 11 00 99", iceRelation: "Ami (Antoine)", allergy: "Aucune", status: "checked_in", distance: 31, time: "19:31:20", streak: 12 },
  ];

  const filteredRunners = runners.filter(r => {
    if (filter === "checked") return r.status === "checked_in";
    if (filter === "ice") return r.allergy !== "Aucune";
    return true;
  }).filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans antialiased selection:bg-[#FF5500]/30 selection:text-[#FF5500]">
      
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-syne { font-family: 'Syne', sans-serif; }
      `}</style>

      {/* ── TOP APP NAVBAR ── */}
      <header className="bg-[#0D0D12] border-b border-white/10 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Club Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5500] to-orange-600 flex items-center justify-center text-white shadow-lg shadow-[#FF5500]/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-syne text-lg font-bold text-white leading-none">PARIS RUN CLUB</h1>
                <span className="bg-[#FF5500]/20 text-[#FF5500] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#FF5500]/30">PRO</span>
              </div>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">Espace Capitaine • Marc Dupont</p>
            </div>
          </div>

          {/* Center Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher un membre, une fiche ICE..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5500]"
            />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 transition-all">
              <Download className="w-4 h-4 text-[#FF5500]" /> Export Registre PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#FF5500] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FF5500]/25 transition-all">
              <QrCode className="w-4 h-4" /> QR Code Session
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN DASHBOARD CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* ── SESSION LIVE BANNER ── */}
        <div className="bg-gradient-to-r from-zinc-900 via-[#12121A] to-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5500]/10 blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                SESSION EN COURS • EN DIRECT
              </span>
              <span className="text-xs text-zinc-500 font-semibold">• Début 19h30</span>
            </div>
            <h2 className="font-syne text-2xl sm:text-3xl font-extrabold text-white">
              Session Run & Chill #42 — Place de la République
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF5500]" /> Parcours 10km • Allure 5'30"/km • Point de ralliement : Statue de la République
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10 shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[130px]">
              <div className="text-2xl font-extrabold font-syne text-white">48 / 50</div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Présents Émargés</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[130px]">
              <div className="text-2xl font-extrabold font-syne text-emerald-400">96 %</div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Taux de Présence</div>
            </div>
          </div>
        </div>

        {/* ── KPI METRICS CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Membres du Club", val: "148", change: "+12 ce mois", icon: Users, color: "text-[#FF5500] bg-[#FF5500]/10" },
            { label: "Check-in GPS Valides", val: "98.4%", change: "Seuil 100m OK", icon: Radio, color: "text-emerald-400 bg-emerald-500/10" },
            { label: "Fiches ICE Médicales", val: "100%", change: "Chiffrées RGPD", icon: HeartPulse, color: "text-rose-400 bg-rose-500/10" },
            { label: "Impact Commerces", val: "1 840 €", change: "42 codes scannés", icon: Coffee, color: "text-amber-400 bg-amber-500/10" },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">{kpi.label}</span>
                <div className="text-2xl font-extrabold font-syne text-white">{kpi.val}</div>
                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> {kpi.change}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${kpi.color} flex items-center justify-center border border-white/5 shrink-0`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: MEMBER LIST & ICE SAFETY */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Table Card */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              
              {/* Table Header Controls */}
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-syne text-lg font-bold text-white">Registre des Présences & Fiches ICE</h3>
                  <p className="text-xs text-zinc-400">Vérification satellite horodatée en direct</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold">
                  {[
                    { id: "all", label: "Tous (7)" },
                    { id: "checked", label: "Émargés (6)" },
                    { id: "ice", label: "⚠️ Allergies (2)" }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${filter === f.id ? "bg-[#FF5500] text-white shadow-md" : "text-zinc-400 hover:text-white"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-white/[0.02] text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Membre</th>
                      <th className="px-4 py-4">Téléphone</th>
                      <th className="px-4 py-4">Groupe Sanguin</th>
                      <th className="px-4 py-4">Allergie / Risque</th>
                      <th className="px-4 py-4">Statut GPS</th>
                      <th className="px-6 py-4 text-right">Assiduité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-semibold">
                    {filteredRunners.map(r => (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center font-bold text-white text-xs">
                              {r.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-bold text-white">{r.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">ICE: {r.iceRelation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-zinc-400">{r.phone}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${r.blood.includes('+') ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                            {r.blood}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {r.allergy !== "Aucune" ? (
                            <span className="text-amber-400 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[11px] border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" /> {r.allergy}
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[11px]">Aucun risque</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {r.status === "checked_in" ? (
                            <div>
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Émargé ({r.distance}m)
                              </span>
                              <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{r.time}</div>
                            </div>
                          ) : (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 animate-spin" /> En attente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-zinc-300 bg-white/5 px-2.5 py-1 rounded-full font-bold">
                            <Award className="w-3 h-3 text-[#FF5500]" /> {r.streak} runs
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: RADAR & PARTNER SPOTS */}
          <div className="space-y-6">
            
            {/* Live GPS Radar Card */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#FF5500]" /> Radar Geofence Satellite
                </h4>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  GPS Actif
                </span>
              </div>

              {/* Visual Radar Mockup */}
              <div className="bg-[#070709] rounded-2xl h-48 border border-white/5 relative overflow-hidden flex items-center justify-center">
                <div className="w-40 h-40 border border-[#FF5500]/30 rounded-full animate-ping opacity-30" style={{ animationDuration: '3s' }} />
                <div className="w-28 h-28 border border-white/20 rounded-full" />
                <div className="w-16 h-16 border border-white/10 rounded-full" />
                <div className="w-4 h-4 bg-[#FF5500] rounded-full shadow-lg shadow-[#FF5500]/50 animate-pulse" />
                
                {/* Simulated dots */}
                <div className="absolute top-12 left-16 w-2 h-2 bg-emerald-400 rounded-full" />
                <div className="absolute bottom-10 right-20 w-2 h-2 bg-emerald-400 rounded-full" />
                <div className="absolute top-20 right-14 w-2 h-2 bg-emerald-400 rounded-full" />

                <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>Centre : Statue République</span>
                  <span>Rayon : 100 mètres</span>
                </div>
              </div>
            </div>

            {/* CAPTEN Spots Discounts Card */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="font-syne text-sm font-bold text-white flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-400" /> CAPTEN Spots (Avantages)
                </h4>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  3 Partenaires
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { name: "Café du Cycliste Paris", disc: "-15% après le run", scanned: "18 scannés ce soir" },
                  { name: "Le Traileur Shop République", disc: "-20% sur l'équipement", scanned: "12 scannés ce soir" },
                  { name: "Run Store Bastille", disc: "-10% rayon nutrition", scanned: "8 scannés ce soir" }
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{s.name}</span>
                      <span className="text-[#FF5500] font-extrabold">{s.disc}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">{s.scanned}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
