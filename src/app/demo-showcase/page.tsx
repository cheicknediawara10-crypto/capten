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
  ChevronDown,
  UserCheck,
  AlertTriangle,
  FileCheck,
  Clock,
  Zap,
  TrendingUp,
  Filter,
  Check,
  Plus,
  Radio
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Interface Fictive Intégrée au Dashboard Admin
   Rendu à l'intérieur de la disposition Admin avec la Sidebar
   URL: /demo-showcase
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
    <div className="space-y-8 font-sans pb-12">
      
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-card-outer border border-black/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-black">
              Tableau de Bord Capitaine
            </h1>
            <span className="bg-[#FF5C00]/10 text-[#FF5C00] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PARIS RUN CLUB
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-semibold mt-1">
            Pilotage opérationnel, émargements satellite & sécurité médicale ICE.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-black text-xs font-bold rounded-control transition-all flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4 text-[#FF5C00]" /> Export Registre PDF
          </button>
          <button className="px-4 py-2.5 bg-[#FF5C00] hover:bg-black text-white text-xs font-bold rounded-control transition-all flex items-center gap-2 shadow-md">
            <Plus className="w-4 h-4" /> Programmer un Run
          </button>
        </div>
      </div>

      {/* ── SESSION EN COURS BANNER ── */}
      <div className="bg-[#09090B] text-white rounded-card-outer p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              SESSION EN COURS LIVE
            </span>
            <span className="text-xs text-neutral-400 font-semibold">• Départ 19h30</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Session Run & Chill #42 — Place de la République
          </h2>
          <p className="text-xs text-neutral-400 font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF5C00]" /> 10 km • Allure 5'30"/km • Point de ralliement : Statue de la République
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10 shrink-0">
          <div className="bg-white/10 border border-white/10 rounded-card-inner p-4 text-center min-w-[120px]">
            <div className="text-2xl font-extrabold text-white">48 / 50</div>
            <div className="text-[9px] text-neutral-400 font-bold uppercase mt-0.5">Présents Émargés</div>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-card-inner p-4 text-center min-w-[120px]">
            <div className="text-2xl font-extrabold text-emerald-400">96 %</div>
            <div className="text-[9px] text-neutral-400 font-bold uppercase mt-0.5">Taux de Présence</div>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Membres du Club", val: "148", change: "+12 ce mois", icon: Users, color: "text-[#FF5C00] bg-[#FF5C00]/10" },
          { label: "Check-in GPS Valides", val: "98.4%", change: "Seuil 100m OK", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Fiches ICE Médicales", val: "100%", change: "Chiffrées RGPD", icon: HeartPulse, color: "text-rose-500 bg-rose-500/10" },
          { label: "Impact Commerces", val: "1 840 €", change: "42 codes scannés", icon: Coffee, color: "text-amber-500 bg-amber-500/10" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-black/5 rounded-card-outer p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">{kpi.label}</span>
              <div className="text-2xl font-black text-black">{kpi.val}</div>
              <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> {kpi.change}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-card-inner ${kpi.color} flex items-center justify-center border border-black/5 shrink-0`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: MEMBER LIST & ICE SAFETY TABLE */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-black/5 rounded-card-outer overflow-hidden shadow-sm">
            
            {/* Table Controls */}
            <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black uppercase text-black">Registre des Présences & Fiches ICE</h3>
                <p className="text-xs text-neutral-400 font-semibold">Pointage satellite horodaté et contacts d'urgence</p>
              </div>

              <div className="flex bg-neutral-100 p-1 rounded-control text-xs font-bold">
                {[
                  { id: "all", label: "Tous (7)" },
                  { id: "checked", label: "Émargés (6)" },
                  { id: "ice", label: "⚠️ Allergies (2)" }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-control transition-all ${filter === f.id ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-neutral-50 text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-3.5">Membre</th>
                    <th className="px-4 py-3.5">Téléphone</th>
                    <th className="px-4 py-3.5">Groupe Sanguin</th>
                    <th className="px-4 py-3.5">Allergie / Risque</th>
                    <th className="px-4 py-3.5">Statut GPS</th>
                    <th className="px-6 py-3.5 text-right">Assiduité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-semibold">
                  {filteredRunners.map(r => (
                    <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                            {r.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-black">{r.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">ICE: {r.iceRelation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-neutral-500">{r.phone}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${r.blood.includes('+') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                          {r.blood}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {r.allergy !== "Aucune" ? (
                          <span className="text-amber-700 flex items-center gap-1 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-100">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> {r.allergy}
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Aucun risque</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {r.status === "checked_in" ? (
                          <div>
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Émargé ({r.distance}m)
                            </span>
                            <div className="text-[9px] text-neutral-400 font-mono mt-0.5">{r.time}</div>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 animate-spin" /> En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full font-bold">
                          <Award className="w-3 h-3 text-[#FF5C00]" /> {r.streak} runs
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
          <div className="bg-white border border-black/5 rounded-card-outer p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-black flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF5C00]" /> Radar Satellite Geofence
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                GPS Actif
              </span>
            </div>

            {/* Visual Radar Mockup */}
            <div className="bg-[#09090B] rounded-card-inner h-48 border border-black/10 relative overflow-hidden flex items-center justify-center">
              <div className="w-36 h-36 border border-[#FF5C00]/40 rounded-full animate-ping opacity-30" style={{ animationDuration: '3s' }} />
              <div className="w-24 h-24 border border-white/20 rounded-full" />
              <div className="w-12 h-12 border border-white/10 rounded-full" />
              <div className="w-3.5 h-3.5 bg-[#FF5C00] rounded-full shadow-lg shadow-[#FF5C00]/50 animate-pulse" />
              
              <div className="absolute top-10 left-12 w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute bottom-8 right-16 w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute top-16 right-12 w-2 h-2 bg-emerald-400 rounded-full" />

              <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[9px] text-neutral-400 font-mono">
                <span>RDV : République</span>
                <span>Rayon : 100 mètres</span>
              </div>
            </div>
          </div>

          {/* CAPTEN Spots Discounts Card */}
          <div className="bg-white border border-black/5 rounded-card-outer p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-black flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-500" /> CAPTEN Spots (Avantages)
              </h4>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                3 Partenaires
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: "Café du Cycliste Paris", disc: "-15% après le run", scanned: "18 scannés ce soir" },
                { name: "Le Traileur Shop République", disc: "-20% sur l'équipement", scanned: "12 scannés ce soir" },
                { name: "Run Store Bastille", disc: "-10% rayon nutrition", scanned: "8 scannés ce soir" }
              ].map((s, i) => (
                <div key={i} className="p-3 bg-neutral-50 border border-neutral-100 rounded-control space-y-1">
                  <div className="flex justify-between font-bold text-black">
                    <span>{s.name}</span>
                    <span className="text-[#FF5C00] font-extrabold">{s.disc}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">{s.scanned}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
