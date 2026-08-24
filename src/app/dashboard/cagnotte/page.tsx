"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Check, ExternalLink, Copy, CheckCheck, 
  Sparkles, Heart, Plus, Target, Users, Search, 
  Trash2, ArrowUpRight, CheckCircle2, Clock, 
  TrendingUp, AlertCircle, Edit3, X, SlidersHorizontal, ArrowRight
} from "lucide-react";
import { 
  getCagnotteInfo, saveCagnotteSettings, 
  addContribution, deleteTransaction, 
  CagnotteData, CagnotteTransaction 
} from "./actions";

type Tab = "membres" | "historique" | "reglages";

const METHOD_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  helloasso: { label: "HelloAsso", icon: "🟢", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  lydia: { label: "Lydia / Sumeria", icon: "🟣", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  sumeria: { label: "Sumeria", icon: "🟣", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  paypal: { label: "PayPal", icon: "🔵", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  especes: { label: "Espèces", icon: "💶", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  virement: { label: "Virement", icon: "🏦", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  autre: { label: "Autre", icon: "💳", color: "bg-neutral-500/10 text-neutral-600 border-neutral-500/20" },
};

export default function CagnottePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof getCagnotteInfo>> | null>(null);
  const [tab, setTab] = useState<Tab>("membres");
  const [searchMember, setSearchMember] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [amount, setAmount] = useState<number>(20);
  const [method, setMethod] = useState<CagnotteTransaction["method"]>("helloasso");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings form state
  const [settingsUrl, setSettingsUrl] = useState("");
  const [settingsGoal, setSettingsGoal] = useState<number>(300);
  const [settingsGoalTitle, setSettingsGoalTitle] = useState("");
  const [settingsCotisation, setSettingsCotisation] = useState<number>(20);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = useCallback(async () => {
    const res = await getCagnotteInfo();
    if ("ok" in res && res.ok) {
      setData(res);
      setSettingsUrl(res.cagnotte.cagnotte_url);
      setSettingsGoal(res.cagnotte.goal);
      setSettingsGoalTitle(res.cagnotte.goal_title);
      setSettingsCotisation(res.cagnotte.cotisation_amount);
      setAmount(res.cagnotte.cotisation_amount || 20);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !data || !("ok" in data)) {
    return (
      <div className="space-y-6 pb-20 max-w-5xl animate-pulse">
        <div className="h-10 w-64 bg-black/5 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-black/5 rounded-[24px]" />
          <div className="h-32 bg-black/5 rounded-[24px]" />
          <div className="h-32 bg-black/5 rounded-[24px]" />
        </div>
      </div>
    );
  }

  const { cagnotte, members, club } = data;
  const progressPercent = Math.min(100, Math.round((cagnotte.balance / (cagnotte.goal || 1)) * 100));

  // Determine contributors count
  const upToDateMemberIds = new Set(
    cagnotte.contributors.filter((c) => c.is_up_to_date).map((c) => c.member_id)
  );
  // Also count any transactions with matching member_id
  cagnotte.transactions.forEach((tx) => {
    if (tx.member_id) upToDateMemberIds.add(tx.member_id);
  });

  const upToDateCount = members.filter((m) => upToDateMemberIds.has(m.membre_id)).length;

  const handleCopy = () => {
    if (!cagnotte.cagnotte_url) return;
    navigator.clipboard.writeText(cagnotte.cagnotte_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenAddModal = (member?: { membre_id: string; first_name: string; last_name: string }) => {
    if (member) {
      setSelectedMemberId(member.membre_id);
      setCustomName(`${member.first_name} ${member.last_name}`.trim());
    } else {
      setSelectedMemberId("");
      setCustomName("");
    }
    setAmount(cagnotte.cotisation_amount || 20);
    setNote("");
    setShowAddModal(true);
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || amount <= 0) return;

    setIsSubmitting(true);
    const res = await addContribution({
      member_id: selectedMemberId || null,
      name: customName.trim(),
      amount: Number(amount),
      method,
      note: note.trim() || undefined,
    });

    if ("ok" in res && res.ok) {
      showToast(`Contribution de ${amount} € enregistrée pour ${customName} !`);
      setShowAddModal(false);
      await loadData();
    } else {
      showToast("Erreur lors de l'enregistrement.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteTx = async (txId: string) => {
    if (!confirm("Voulez-vous supprimer ce versement ?")) return;
    const res = await deleteTransaction(txId);
    if ("ok" in res && res.ok) {
      showToast("Versement supprimé.");
      await loadData();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const res = await saveCagnotteSettings({
      cagnotte_url: settingsUrl,
      goal: Number(settingsGoal),
      goal_title: settingsGoalTitle,
      cotisation_amount: Number(settingsCotisation),
    });

    if ("ok" in res && res.ok) {
      showToast("Paramètres de cagnotte mis à jour !");
      await loadData();
    } else {
      showToast("Erreur de sauvegarde.");
    }
    setIsSavingSettings(false);
  };

  const filteredMembers = members.filter((m) => {
    const q = searchMember.toLowerCase();
    const name = `${m.first_name} ${m.last_name}`.toLowerCase();
    return name.includes(q) || (m.phone && m.phone.includes(q));
  });

  return (
    <div className="space-y-8 pb-24 max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-[#22C55E]" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] sm:text-[42px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
            Cagnotte &amp; Cotisations
          </h1>
          <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans mt-1">
            Suivi des adhésions annuelles, dons et budget de ton crew.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="h-11 px-5 rounded-2xl bg-[#FF5500] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E04B00] transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(255,85,0,0.25)] shrink-0"
        >
          <Plus size={16} strokeWidth={3} />
          Enregistrer un versement
        </button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 : Montant collecté */}
        <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[26px] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Total Collecté
            </span>
            <span className="w-8 h-8 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
              <Wallet size={16} />
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[color:var(--app-text)] tracking-tight">
                {cagnotte.balance} €
              </span>
              <span className="text-xs text-[color:var(--app-text-muted)] font-bold">
                / {cagnotte.goal} €
              </span>
            </div>
            <p className="text-xs font-bold text-[color:var(--app-text-muted)] mt-1 truncate">
              🎯 {cagnotte.goal_title}
            </p>
          </div>

          {/* Jauge */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-black text-[color:var(--app-text-muted)] uppercase mb-1.5">
              <span>Progression</span>
              <span className="text-[#FF5500] font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--app-surface-2)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF5500] to-[#22C55E] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2 : Membres cotisants */}
        <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[26px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Membres à jour
            </span>
            <span className="w-8 h-8 rounded-xl bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
              <Users size={16} />
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[color:var(--app-text)] tracking-tight">
                {upToDateCount}
              </span>
              <span className="text-xs text-[color:var(--app-text-muted)] font-bold">
                / {members.length} membres
              </span>
            </div>
            <p className="text-xs font-bold text-[color:var(--app-text-muted)] mt-1">
              Cotisation suggérée : <strong className="text-[color:var(--app-text)]">{cagnotte.cotisation_amount} €</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-[color:var(--app-border)] flex items-center justify-between text-[11px]">
            <span className="text-[color:var(--app-text-muted)] font-medium">Taux d&apos;adhésion :</span>
            <span className="font-extrabold text-[color:var(--app-text)]">
              {members.length > 0 ? Math.round((upToDateCount / members.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Card 3 : Lien de collecte actif */}
        <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[26px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Lien de Collecte
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ExternalLink size={16} />
            </span>
          </div>

          <div className="my-3">
            {cagnotte.cagnotte_url ? (
              <p className="text-xs font-mono font-bold text-[color:var(--app-text)] bg-[var(--app-surface-2)] p-2.5 rounded-xl truncate">
                {cagnotte.cagnotte_url}
              </p>
            ) : (
              <p className="text-xs text-[#9CA3AF] italic">
                Aucun lien de cagnotte (HelloAsso / Lydia) renseigné.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cagnotte.cagnotte_url ? (
              <>
                <button
                  onClick={handleCopy}
                  className="flex-1 h-9 rounded-xl border border-[color:var(--app-border)] text-xs font-bold text-[color:var(--app-text)] hover:border-[#FF5500] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <CheckCheck size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
                  {copied ? "Copié !" : "Copier"}
                </button>
                <a
                  href={cagnotte.cagnotte_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3.5 rounded-xl bg-[var(--app-surface-2)] text-xs font-bold text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors flex items-center justify-center gap-1"
                >
                  <ExternalLink size={13} />
                  Ouvrir
                </a>
              </>
            ) : (
              <button
                onClick={() => setTab("reglages")}
                className="w-full h-9 rounded-xl bg-[#FF5500]/10 text-[#FF5500] text-xs font-bold hover:bg-[#FF5500]/20 transition-colors"
              >
                + Configurer mon lien
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-[color:var(--app-border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setTab("membres")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            tab === "membres"
              ? "bg-[color:var(--app-text)] text-[color:var(--app-surface)] shadow-sm"
              : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
          }`}
        >
          👥 Cotisants &amp; Membres ({upToDateCount}/{members.length})
        </button>

        <button
          onClick={() => setTab("historique")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            tab === "historique"
              ? "bg-[color:var(--app-text)] text-[color:var(--app-surface)] shadow-sm"
              : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
          }`}
        >
          📜 Historique des Versements ({cagnotte.transactions.length})
        </button>

        <button
          onClick={() => setTab("reglages")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            tab === "reglages"
              ? "bg-[color:var(--app-text)] text-[color:var(--app-surface)] shadow-sm"
              : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
          }`}
        >
          ⚙️ Paramètres &amp; Objectif
        </button>
      </div>

      {/* ── TAB 1 : STATUT DES MEMBRES ── */}
      {tab === "membres" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-[var(--app-surface)] border border-[color:var(--app-border)] text-xs font-medium text-[color:var(--app-text)] outline-none focus:border-[#FF5500]"
              />
            </div>
            <span className="text-xs text-[color:var(--app-text-muted)] font-bold">
              {filteredMembers.length} membre{filteredMembers.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[26px] overflow-hidden shadow-sm">
            <div className="divide-y divide-[color:var(--app-border)]">
              {filteredMembers.map((m) => {
                const isUpToDate = upToDateMemberIds.has(m.membre_id);
                const contributor = cagnotte.contributors.find((c) => c.member_id === m.membre_id);
                const initials = `${m.first_name[0] || ""}${m.last_name[0] || ""}`.toUpperCase();

                return (
                  <div
                    key={m.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--app-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FF5500]/10 text-[#FF5500] font-extrabold flex items-center justify-center text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[color:var(--app-text)] leading-tight">
                          {m.first_name} {m.last_name}
                        </p>
                        <p className="text-[11px] text-[color:var(--app-text-muted)] truncate">
                          {m.email || m.phone || "Membre enregistré"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isUpToDate ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-xs font-black uppercase tracking-wider">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          À jour {contributor?.total_contributed ? `(${contributor.total_contributed} €)` : ""}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-500/10 text-neutral-500 border border-neutral-500/20 text-xs font-bold uppercase tracking-wider">
                          <Clock size={12} />
                          En attente
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenAddModal(m)}
                        className="h-8 px-3 rounded-xl bg-[var(--app-surface-2)] hover:bg-[#FF5500] hover:text-white text-xs font-bold text-[color:var(--app-text)] transition-colors cursor-pointer"
                      >
                        + Cotisation
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="p-8 text-center text-xs text-[color:var(--app-text-muted)]">
                  Aucun membre trouvé.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2 : HISTORIQUE DES VERSEMENTS ── */}
      {tab === "historique" && (
        <div className="space-y-4">
          <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[26px] overflow-hidden shadow-sm">
            <div className="divide-y divide-[color:var(--app-border)]">
              {cagnotte.transactions.map((tx) => {
                const methodInfo = METHOD_LABELS[tx.method] || METHOD_LABELS.autre;
                const formattedDate = new Date(tx.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--app-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{methodInfo.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[color:var(--app-text)] leading-tight">
                          {tx.name}
                        </p>
                        <p className="text-[11px] text-[color:var(--app-text-muted)] mt-0.5">
                          {formattedDate} {tx.note ? `· « ${tx.note} »` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${methodInfo.color}`}>
                        {methodInfo.label}
                      </span>
                      <span className="text-sm font-black text-[#22C55E]">
                        +{tx.amount} €
                      </span>
                      <button
                        onClick={() => handleDeleteTx(tx.id)}
                        className="w-8 h-8 rounded-xl hover:bg-red-500/10 text-neutral-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                        title="Supprimer cette entrée"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {cagnotte.transactions.length === 0 && (
                <div className="p-12 text-center space-y-2">
                  <span className="text-3xl block">💳</span>
                  <p className="text-sm font-extrabold text-[color:var(--app-text)]">
                    Aucun versement enregistré pour l&apos;instant
                  </p>
                  <p className="text-xs text-[color:var(--app-text-muted)] max-w-sm mx-auto">
                    Clique sur « Enregistrer un versement » pour ajouter les cotisations reçues par HelloAsso, Lydia ou espèces.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3 : RÉGLAGES & OBJECTIF ── */}
      {tab === "reglages" && (
        <form onSubmit={handleSaveSettings} className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[26px] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[color:var(--app-border)] pb-4">
            <h2 className="text-base font-extrabold uppercase tracking-tight text-[color:var(--app-text)]">
              Configuration de la Cagnotte
            </h2>
            <p className="text-xs text-[color:var(--app-text-muted)]">
              Définis tes objectifs, le montant annuel et la plateforme de paiement.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
                Lien de ta collecte (HelloAsso, Lydia, Sumeria, PayPal)
              </label>
              <input
                type="url"
                value={settingsUrl}
                onChange={(e) => setSettingsUrl(e.target.value)}
                placeholder="https://www.helloasso.com/associations/..."
                className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-mono font-medium text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
                  Objectif à atteindre (€)
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={settingsGoal}
                  onChange={(e) => setSettingsGoal(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-bold text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
                  Cotisation annuelle suggérée (€)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={settingsCotisation}
                  onChange={(e) => setSettingsCotisation(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-bold text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
                Titre du projet / objectif
              </label>
              <input
                type="text"
                value={settingsGoalTitle}
                onChange={(e) => setSettingsGoalTitle(e.target.value)}
                placeholder="Ex: T-shirts & Ravitaillement du Crew 2026"
                className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-medium text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="h-11 px-6 rounded-xl bg-[#FF5500] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E04B00] transition-colors cursor-pointer"
            >
              {isSavingSettings ? "Enregistrement..." : "Sauvegarder les paramètres"}
            </button>
          </div>
        </form>
      )}

      {/* ── MODAL : ENREGISTRER UNE CONTRIBUTION ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[28px] p-6 max-w-md w-full shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[color:var(--app-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
                  <Plus size={16} />
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-tight text-[color:var(--app-text)]">
                  Enregistrer une cotisation
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-500/10 text-neutral-400 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddContribution} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
                  Membre du crew (ou donateur)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Prénom Nom"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-bold text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
                    Montant (€)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-bold text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
                    Moyen de paiement
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-[var(--app-surface-2)] text-xs font-bold text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
                  >
                    <option value="helloasso">🟢 HelloAsso</option>
                    <option value="lydia">🟣 Lydia / Sumeria</option>
                    <option value="paypal">🔵 PayPal</option>
                    <option value="especes">💶 Espèces</option>
                    <option value="virement">🏦 Virement</option>
                    <option value="autre">💳 Autre</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
                  Note ou commentaire (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Adhésion 2026, don t-shirt..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-medium text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11 rounded-xl bg-[var(--app-surface-2)] text-xs font-bold text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-[#FF5500] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E04B00] transition-colors"
                >
                  {isSubmitting ? "Enregistrement..." : "Valider"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
