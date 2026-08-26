"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Check, Search, QrCode, ShieldAlert, Phone, AlertCircle, Loader2,
  CheckCircle2, X, RefreshCw, Sparkles, MapPin, Calendar, Camera, UserCheck,
  ShieldCheck, Activity, ArrowUpRight, Download, Maximize2, Share2, MessageCircle
} from "lucide-react";
import {
  getStaffCockpitContext,
  staffSubmitCheckin,
  staffScanQrCheckin,
  staffGetRunnerIce,
} from "@/lib/staff/actions";
import { formatDateShort } from "@/lib/utils/format";
import { getAppUrl } from "@/lib/domain";
import dynamic from "next/dynamic";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((m) => ({ default: m.QRCodeSVG })), { ssr: false });

const QrScanner = dynamic(() => import("@/components/checkin/QrScanner"), {
  ssr: false,
  loading: () => (
    <div className="h-72 flex items-center justify-center bg-black/60 rounded-2xl border border-white/10">
      <Loader2 className="animate-spin text-[#FF5500]" size={32} />
    </div>
  ),
});

interface MemberItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  method: string | null;
  hasIce: boolean;
}

interface IceData {
  runner: { name: string; phone: string | null };
  ice: {
    contactName: string;
    contactPhone: string;
    relationship: string;
    bloodType: string;
    allergies: string;
    medicalNotes: string;
  } | null;
}

type TabMode = "qrcode" | "list" | "scanner";

export default function StaffCockpitPage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "checked">("all");
  const [activeMode, setActiveMode] = useState<TabMode>("qrcode");

  // Modal ICE
  const [iceModal, setIceModal] = useState<IceData | null>(null);
  const [iceLoading, setIceLoading] = useState(false);

  // Scan feedback popup & history
  const [scanFeedback, setScanFeedback] = useState<{ name: string; already?: boolean } | null>(null);
  const [recentScans, setRecentScans] = useState<Array<{ name: string; time: string }>>([]);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    if (!token) return;
    const res = await getStaffCockpitContext(token);
    if ("error" in res) {
      setErrorMsg(res.error || "Lien staff invalide.");
      setLoading(false);
      return;
    }
    setData(res);
    setMembers(res.members);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  // 1-tap Manual Check-in
  async function handleManualCheckin(memberId: string) {
    setCheckingInId(memberId);
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isCheckedIn: true, checkedInAt: new Date().toISOString() } : m))
    );

    const res = await staffSubmitCheckin(token, memberId);
    if ("error" in res) {
      alert(res.error);
      await loadContext();
    }
    setCheckingInId(null);
  }

  // Handle QR Scan (Camera)
  async function handleScan(scannedText: string) {
    if (!scannedText) return;
    const res = await staffScanQrCheckin(token, scannedText);
    if ("ok" in res) {
      const runnerName = res.runnerName || "Coureur";
      setScanFeedback({ name: runnerName, already: res.already });
      setRecentScans((prev) => [
        { name: runnerName, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) },
        ...prev.slice(0, 7),
      ]);
      await loadContext();
      setTimeout(() => setScanFeedback(null), 3000);
    } else {
      alert(res.error || "Erreur de scan");
    }
  }

  // Open ICE Modal
  async function handleOpenIce(memberId: string) {
    setIceLoading(true);
    const res = await staffGetRunnerIce(token, memberId);
    if ("error" in res) {
      alert(res.error);
    } else {
      setIceModal(res as IceData);
    }
    setIceLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0E] text-white flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={40} />
        <p className="text-sm text-white/60 font-medium tracking-wide">Chargement du Cockpit Staff...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-[#0C0C0E] text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight font-display">Accès Staff Introuvable</h1>
        <p className="text-sm text-white/60 max-w-md">
          {errorMsg || "Ce lien staff a expiré ou a été révoqué par le capitaine."}
        </p>
      </div>
    );
  }

  const checkedCount = members.filter((m) => m.isCheckedIn).length;
  const totalCount = members.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const checkinPublicUrl = `${getAppUrl()}/checkin/${data.event.id}`;

  const filteredMembers = members.filter((m) => {
    const full = `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase();
    const matchSearch = full.includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "checked") return m.isCheckedIn;
    if (filter === "pending") return !m.isCheckedIn;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#0C0C0E] text-white font-sans antialiased pb-24 selection:bg-[#FF5500] selection:text-white">
      
      {/* Glow Top Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-[#FF5500]/10 blur-[100px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-[#121215]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Club Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FF5500]/20 border border-[#FF5500]/30 flex items-center justify-center overflow-hidden shrink-0">
              {data.club.logoUrl ? (
                <img src={data.club.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">🏃</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white truncate">
                  {data.club.name}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF5500] text-white text-[9px] font-black uppercase tracking-widest shrink-0 shadow-sm">
                  <Sparkles size={9} /> {data.staffLabel || "Co-Capitaine"}
                </span>
              </div>
              <p className="text-[10px] text-white/50 truncate font-medium">
                Cockpit Terrain · Zéro mot de passe
              </p>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={loadContext}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5 flex items-center gap-1.5 text-xs font-bold"
            title="Rafraîchir les présences"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {/* Run Banner & Live Gauge */}
        <div className="bg-gradient-to-b from-[#18181D] to-[#131317] border border-white/10 rounded-[28px] p-5 sm:p-7 shadow-2xl space-y-5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap text-xs text-white/60 font-medium">
                <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                  <Calendar size={12} className="text-[#FF5500]" /> {formatDateShort(data.event.date)}
                </span>
                {data.event.address && (
                  <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <MapPin size={12} className="text-[#FF5500]" /> {data.event.address}
                  </span>
                )}
                {data.event.is_evenement && (
                  <span className="bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    ⚡ Événement
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tight text-white">
                {data.event.title}
              </h1>
            </div>

            {/* Gauge Counter */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl shrink-0">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Pointage en direct</p>
                <p className="text-3xl font-display font-black italic text-white leading-none mt-0.5">
                  <span className="text-[#3DD68C]">{checkedCount}</span>
                  <span className="text-white/40 text-xl font-normal"> / {totalCount}</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#3DD68C]/10 border border-[#3DD68C]/30 flex items-center justify-center text-[#3DD68C]">
                <Activity size={20} className="animate-pulse" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF5500] to-[#3DD68C] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/50 font-bold uppercase tracking-wider">
              <span>{checkedCount} pointé{checkedCount > 1 ? "s" : ""}</span>
              <span>{progressPercent}% complété</span>
            </div>
          </div>

          {/* 3 Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
            
            {/* Tab 1: Afficher le QR Code */}
            <button
              onClick={() => setActiveMode("qrcode")}
              className={`h-12 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                activeMode === "qrcode"
                  ? "bg-[#FF5500] text-white shadow-[0_4px_16px_rgba(255,85,0,0.35)] scale-[1.01]"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              <QrCode size={16} />
              <span>Afficher QR Code</span>
            </button>

            {/* Tab 2: Liste Coureurs */}
            <button
              onClick={() => setActiveMode("list")}
              className={`h-12 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                activeMode === "list"
                  ? "bg-[#FF5500] text-white shadow-[0_4px_16px_rgba(255,85,0,0.35)] scale-[1.01]"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              <Users size={16} />
              <span>Liste ({totalCount})</span>
            </button>

            {/* Tab 3: Scanner Caméra */}
            <button
              onClick={() => setActiveMode("scanner")}
              className={`h-12 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                activeMode === "scanner"
                  ? "bg-[#FF5500] text-white shadow-[0_4px_16px_rgba(255,85,0,0.35)] scale-[1.01]"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              <Camera size={16} />
              <span>Scanner Caméra</span>
            </button>

          </div>
        </div>

        {/* ── TAB 1 : AFFICHER LE QR CODE GÉANT DU RUN ── */}
        {activeMode === "qrcode" && (
          <div className="bg-[#18181D] border border-white/10 rounded-[28px] p-6 sm:p-8 text-center space-y-6 shadow-xl">
            
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-[10px] font-black uppercase tracking-widest border border-[#FF5500]/20">
                Pointage Rapide au Départ
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black italic uppercase tracking-tight text-white pt-1">
                Fais scanner ce QR Code aux coureurs
              </h2>
              <p className="text-xs text-white/60 max-w-md mx-auto">
                Les coureurs ouvrent l&apos;appareil photo de leur smartphone, scannent ce QR code et leur présence est validée immédiatement !
              </p>
            </div>

            {/* Plaque QR Code Blanche */}
            <div className="inline-block p-6 sm:p-7 bg-white rounded-3xl shadow-2xl border-4 border-white/20">
              <QRCodeSVG
                value={checkinPublicUrl}
                size={240}
                fgColor="#1A1918"
                bgColor="#FFFFFF"
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Lien Checkin */}
            <div className="max-w-sm mx-auto space-y-2">
              <p className="text-[11px] font-mono text-white/40 bg-white/5 py-2 px-3 rounded-xl border border-white/5 truncate">
                {checkinPublicUrl}
              </p>
            </div>

            {/* Boutons d'action QR Code */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Lien de check-in pour « ${data.event.title} » : ${checkinPublicUrl} 🖤`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <MessageCircle size={15} /> Envoyer sur WhatsApp
              </a>

              <button
                onClick={() => {
                  const svg = document.querySelector("svg");
                  if (!svg) return;
                  const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `qrcode-${data.event.title.replace(/\s+/g, "-").toLowerCase()}.svg`;
                  a.click();
                }}
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/10"
              >
                <Download size={15} /> Télécharger le QR Code
              </button>
            </div>

          </div>
        )}

        {/* ── TAB 2 : LISTE & RECHERCHE DES COUREURS ── */}
        {activeMode === "list" && (
          <div className="space-y-4">
            
            {/* Search Bar & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un prénom, nom ou téléphone..."
                  className="w-full h-12 pl-11 pr-10 rounded-2xl bg-[#18181D] border border-white/10 text-sm text-white placeholder:text-white/40 focus:border-[#FF5500] outline-none transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#18181D] border border-white/10 rounded-2xl shrink-0 overflow-x-auto">
                {[
                  { key: "all", label: `Tous (${totalCount})` },
                  { key: "pending", label: `À pointer (${totalCount - checkedCount})` },
                  { key: "checked", label: `Pointés (${checkedCount})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      filter === f.key
                        ? "bg-white text-black font-extrabold shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coureurs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredMembers.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-[#18181D]/50 border border-white/5 rounded-3xl space-y-2">
                  <Users size={32} className="mx-auto text-white/20" />
                  <p className="text-sm font-medium text-white/50">Aucun coureur ne correspond à la recherche.</p>
                </div>
              ) : (
                filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      m.isCheckedIn
                        ? "bg-[#3DD68C]/[0.08] border-[#3DD68C]/30 hover:border-[#3DD68C]/50"
                        : "bg-[#18181D] border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Runner Avatar & Name */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-xs shadow-inner ${
                          m.isCheckedIn
                            ? "bg-[#3DD68C] text-black"
                            : "bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="text-[11px] text-white/50 truncate flex items-center gap-2 mt-0.5">
                          {m.phone && <span>{m.phone}</span>}
                          {m.isCheckedIn && (
                            <span className="text-[#3DD68C] font-semibold flex items-center gap-0.5">
                              ✓ {m.method === "qr_code" ? "QR" : m.method === "gps" ? "GPS" : "Manuel"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      
                      {/* Emergency ICE Button */}
                      <button
                        onClick={() => handleOpenIce(m.id)}
                        disabled={iceLoading}
                        className={`h-10 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                          m.hasIce
                            ? "bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500 hover:text-white"
                            : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                        }`}
                        title="Consulter la fiche d'urgence (ICE)"
                      >
                        <ShieldAlert size={14} className={m.hasIce ? "text-red-400" : ""} />
                        <span className="text-[10px] font-black uppercase tracking-wider">ICE</span>
                      </button>

                      {/* Check-in Action Button */}
                      {m.isCheckedIn ? (
                        <div className="h-10 px-3.5 rounded-xl bg-[#3DD68C]/20 border border-[#3DD68C]/40 text-[#3DD68C] text-xs font-bold flex items-center gap-1.5">
                          <Check size={15} className="stroke-[3]" />
                          <span className="hidden xs:inline">Pointé</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleManualCheckin(m.id)}
                          disabled={checkingInId === m.id}
                          className="h-10 px-4 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                        >
                          {checkingInId === m.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Check size={14} /> Pointer
                            </>
                          )}
                        </button>
                      )}

                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ── TAB 3 : SCANNER AVEC LA CAMÉRA ── */}
        {activeMode === "scanner" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Camera Frame */}
            <div className="md:col-span-2 bg-[#18181D] border border-white/10 rounded-[28px] p-6 text-center space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Camera size={16} className="text-[#FF5500]" /> Scanner Caméra Actif
                </p>
                <span className="px-2.5 py-0.5 rounded-full bg-[#3DD68C]/10 text-[#3DD68C] text-[10px] font-bold uppercase tracking-wider">
                  En direct
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border-2 border-dashed border-white/20">
                <QrScanner onScan={handleScan} />
              </div>

              <p className="text-xs text-white/50">
                Pointe les téléphones des coureurs en continu. La validation est instantanée.
              </p>
            </div>

            {/* Recent Scans Feed */}
            <div className="bg-[#18181D] border border-white/10 rounded-[28px] p-5 space-y-3 flex flex-col shadow-xl">
              <p className="text-xs font-black uppercase tracking-wider text-white/80 border-b border-white/10 pb-3">
                Derniers Scans ({recentScans.length})
              </p>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-80">
                {recentScans.length === 0 ? (
                  <div className="py-12 text-center text-white/30 text-xs">
                    En attente des premiers scans...
                  </div>
                ) : (
                  recentScans.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white truncate">{s.name}</span>
                      <span className="text-[10px] text-[#3DD68C] font-mono shrink-0">✓ {s.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Toast Feedback Scan Réussi */}
      <AnimatePresence>
        {scanFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-4 right-4 max-w-md mx-auto bg-[#3DD68C] text-black font-bold p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle2 size={26} className="shrink-0" />
            <div>
              <p className="text-sm font-black uppercase tracking-tight">
                {scanFeedback.already ? "Déjà pointé !" : "Présence Validée ✓"}
              </p>
              <p className="text-xs font-medium opacity-90">{scanFeedback.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Fiche Urgence Médicale ICE */}
      <AnimatePresence>
        {iceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIceModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#18181D] border border-red-500/40 rounded-[28px] p-6 sm:p-7 space-y-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Header Alerte Rouge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white">
                      Fiche d&apos;Urgence Médicale (ICE)
                    </h3>
                    <p className="text-xs text-white/60 font-medium">
                      {iceModal.runner.name} {iceModal.runner.phone && `· ${iceModal.runner.phone}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIceModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {iceModal.ice ? (
                <div className="space-y-4">
                  {/* Contact d'Urgence Card */}
                  <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
                      Contact à prévenir en priorité
                    </p>
                    <p className="text-base font-bold text-white">
                      {iceModal.ice.contactName}{" "}
                      <span className="text-xs text-white/60 font-normal">({iceModal.ice.relationship})</span>
                    </p>
                    <a
                      href={`tel:${iceModal.ice.contactPhone.replace(/\s+/g, "")}`}
                      className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                      <Phone size={16} /> Appeler {iceModal.ice.contactPhone}
                    </a>
                  </div>

                  {/* Données Médicales */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                      <span className="text-white/50 uppercase font-bold">Groupe Sanguin</span>
                      <span className="font-bold text-white">{iceModal.ice.bloodType}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-white/50 uppercase font-bold block">Allergies connues</span>
                      <span className="font-medium text-white block">{iceModal.ice.allergies}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-white/50 uppercase font-bold block">Remarques médicales</span>
                      <span className="font-medium text-white block">{iceModal.ice.medicalNotes}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white/5 text-center text-white/50 text-xs">
                  Ce coureur n&apos;a pas encore complété sa fiche d&apos;urgence ICE.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
