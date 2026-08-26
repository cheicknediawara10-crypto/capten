"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Check, Search, QrCode, ShieldAlert, Phone, AlertCircle, Loader2,
  CheckCircle2, X, RefreshCw, Sparkles, MapPin, Calendar, Camera, UserCheck
} from "lucide-react";
import {
  getStaffCockpitContext,
  staffSubmitCheckin,
  staffScanQrCheckin,
  staffGetRunnerIce,
} from "@/lib/staff/actions";
import { formatDateShort } from "@/lib/utils/format";
import dynamic from "next/dynamic";

const QrScanner = dynamic(() => import("@/components/checkin/QrScanner"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-black/40 rounded-2xl">
      <Loader2 className="animate-spin text-[#FF5500]" size={28} />
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

export default function StaffCockpitPage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "checked" | "pending">("all");
  const [activeMode, setActiveMode] = useState<"list" | "scanner">("list");

  // Modal ICE
  const [iceModal, setIceModal] = useState<IceData | null>(null);
  const [iceLoading, setIceLoading] = useState(false);

  // Scan feedback popup
  const [scanFeedback, setScanFeedback] = useState<{ name: string; already?: boolean } | null>(null);
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
    // Optimistic UI update
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

  // Handle QR Scan
  async function handleScan(scannedText: string) {
    if (!scannedText) return;
    const res = await staffScanQrCheckin(token, scannedText);
    if ("ok" in res) {
      setScanFeedback({ name: res.runnerName || "Coureur", already: res.already });
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
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={36} />
        <p className="text-sm text-white/60 font-medium">Chargement du Cockpit Staff...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle size={40} className="text-red-400" />
        <h1 className="text-xl font-bold uppercase tracking-tight">Accès Staff Introuvable</h1>
        <p className="text-sm text-white/60 max-w-sm">
          {errorMsg || "Ce lien staff a expiré ou a été révoqué par le capitaine."}
        </p>
      </div>
    );
  }

  const checkedCount = members.filter((m) => m.isCheckedIn).length;
  const totalCount = members.length;

  const filteredMembers = members.filter((m) => {
    const full = `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase();
    const matchSearch = full.includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "checked") return m.isCheckedIn;
    if (filter === "pending") return !m.isCheckedIn;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans antialiased pb-28">
      {/* Top Header Staff */}
      <header className="bg-[#1A1918] border-b border-white/10 px-5 pt-8 pb-5 sticky top-0 z-30 shadow-md">
        <div className="max-w-md mx-auto space-y-3">
          
          {/* Badge Staff & Club */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF5500]/20 flex items-center justify-center overflow-hidden">
                {data.club.logoUrl ? (
                  <img src={data.club.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : "🏃"}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                {data.club.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500] text-white text-[10px] font-black uppercase tracking-widest shadow-[0_2px_10px_rgba(255,85,0,0.3)]">
              <Sparkles size={11} /> {data.staffLabel || "Staff Terrain"}
            </div>
          </div>

          {/* Titre du Run & Infos */}
          <div>
            <h1 className="text-xl font-display font-black italic uppercase tracking-tight text-white leading-tight">
              {data.event.title}
            </h1>
            <p className="text-xs text-white/60 flex items-center gap-2 mt-1">
              <span>{formatDateShort(data.event.date)}</span>
              {data.event.address && <span>· {data.event.address}</span>}
            </p>
          </div>

          {/* Compteur Synthétique Live */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Pointage en direct</p>
              <p className="text-2xl font-display font-black italic text-white leading-none mt-0.5">
                <span className="text-[#3DD68C]">{checkedCount}</span>
                <span className="text-white/40 text-lg font-normal"> / {totalCount}</span>
              </p>
            </div>
            <button
              onClick={loadContext}
              className="p-2 rounded-xl bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Sélecteur de Mode : Scanner vs Liste */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setActiveMode("list")}
              className={`h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeMode === "list"
                  ? "bg-[#FF5500] text-white shadow-[0_4px_12px_rgba(255,85,0,0.3)]"
                  : "bg-white/5 text-white/60 hover:text-white border border-white/5"
              }`}
            >
              <Users size={15} /> Liste Coureurs ({totalCount})
            </button>
            <button
              onClick={() => setActiveMode("scanner")}
              className={`h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeMode === "scanner"
                  ? "bg-[#FF5500] text-white shadow-[0_4px_12px_rgba(255,85,0,0.3)]"
                  : "bg-white/5 text-white/60 hover:text-white border border-white/5"
              }`}
            >
              <QrCode size={15} /> Scanner QR
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* MODE 1: LISTE DE POINTAGE */}
        {activeMode === "list" && (
          <div className="space-y-3">
            
            {/* Barre de Recherche */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par prénom, nom ou tél..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:border-[#FF5500] outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtres de Statut */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { key: "all", label: `Tous (${totalCount})` },
                { key: "pending", label: `À pointer (${totalCount - checkedCount})` },
                { key: "checked", label: `Pointés (${checkedCount})` },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    filter === f.key
                      ? "bg-white text-black font-extrabold"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Liste des Coureurs */}
            <div className="space-y-2 pt-1">
              {filteredMembers.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-sm">
                  Aucun coureur trouvé.
                </div>
              ) : (
                filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      m.isCheckedIn
                        ? "bg-[#3DD68C]/10 border-[#3DD68C]/30"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                        m.isCheckedIn ? "bg-[#3DD68C] text-black" : "bg-white/10 text-white"
                      }`}>
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="text-[11px] text-white/50 truncate flex items-center gap-1.5 mt-0.5">
                          {m.phone && <span>{m.phone}</span>}
                          {m.isCheckedIn && (
                            <span className="text-[#3DD68C] font-semibold">
                              ✓ {m.method === "qr_code" ? "QR" : m.method === "gps" ? "GPS" : "Manuel"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions Staff */}
                    <div className="flex items-center gap-2 shrink-0">
                      
                      {/* Bouton ICE Urgence */}
                      <button
                        onClick={() => handleOpenIce(m.id)}
                        disabled={iceLoading}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                          m.hasIce
                            ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500 hover:text-white"
                            : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                        }`}
                        title="Consulter la fiche ICE"
                      >
                        <ShieldAlert size={15} />
                        <span className="text-[10px] font-black uppercase">ICE</span>
                      </button>

                      {/* Bouton Check-in */}
                      {m.isCheckedIn ? (
                        <div className="w-9 h-9 rounded-xl bg-[#3DD68C]/20 border border-[#3DD68C]/40 text-[#3DD68C] flex items-center justify-center">
                          <Check size={16} className="stroke-[3]" />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleManualCheckin(m.id)}
                          disabled={checkingInId === m.id}
                          className="px-3.5 h-9 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm active:scale-95"
                        >
                          {checkingInId === m.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <>
                              <Check size={13} /> Pointer
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

        {/* MODE 2: SCANNER QR CONTINU */}
        {activeMode === "scanner" && (
          <div className="space-y-4">
            <div className="bg-black/60 border border-white/10 rounded-2xl p-4 text-center space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                Pointe les téléphones des coureurs en continu
              </p>
              <div className="overflow-hidden rounded-xl">
                <QrScanner onScan={handleScan} />
              </div>
              <p className="text-[11px] text-white/40">
                Place le QR code du coureur dans le cadre pour le valider instantanément.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Toast Feedback Scan Réussi */}
      <AnimatePresence>
        {scanFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-4 right-4 max-w-md mx-auto bg-[#3DD68C] text-black font-bold p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle2 size={24} className="shrink-0" />
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
              className="relative w-full max-w-md bg-[#1C1B18] border border-red-500/40 rounded-[28px] p-6 space-y-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Header Alerte Rouge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white">
                      Fiche d&apos;Urgence (ICE)
                    </h3>
                    <p className="text-xs text-white/60 font-medium">
                      {iceModal.runner.name}
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
                  {/* Contact d'Urgence */}
                  <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
                      Contact à prévenir en priorité
                    </p>
                    <p className="text-base font-bold text-white">
                      {iceModal.ice.contactName}{" "}
                      <span className="text-xs text-white/60 font-normal">({iceModal.ice.relationship})</span>
                    </p>
                    <a
                      href={`tel:${iceModal.ice.contactPhone.replace(/\s+/g, "")}`}
                      className="mt-2 w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                      <Phone size={16} /> Appeler {iceModal.ice.contactPhone}
                    </a>
                  </div>

                  {/* Données Médicales */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                      <span className="text-white/50 uppercase font-bold">Groupe Sanguin</span>
                      <span className="font-bold text-white">{iceModal.ice.bloodType}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-white/50 uppercase font-bold block">Allergies connues</span>
                      <span className="font-medium text-white block">{iceModal.ice.allergies}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-white/50 uppercase font-bold block">Remarques médicales</span>
                      <span className="font-medium text-white block">{iceModal.ice.medicalNotes}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white/5 text-center text-white/50 text-xs">
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
