"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Plus, Pencil, Trash2, Loader2, ExternalLink,
  MoreHorizontal, X, Check, ArrowUp, ArrowDown, Gift,
} from "lucide-react";
import Link from "next/link";
import { hasProAccess } from "@/lib/plan-access";
import { SPOT_CATEGORIES, getSpotCategory, type SpotCategorie } from "@/lib/spot-categories";
import { getMySpots, saveSpot, deleteSpot, reorderSpots } from "./actions";

// ── Types ───────────────────────────────────────────────────────────────────

type Categorie = SpotCategorie;

interface CrewSpot {
  id: string;
  club_id: string;
  nom: string;
  categorie: Categorie;
  adresse: string | null;
  lien_maps: string | null;
  mot_du_fondateur: string | null;
  avantage: string | null;
  ordre: number;
  created_at: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = SPOT_CATEGORIES;
const getCat = getSpotCategory;

// ── Empty form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  nom: "",
  categorie: "cafe" as Categorie,
  adresse: "",
  lien_maps: "",
  mot_du_fondateur: "",
  avantage: "",
};

// ── Modal d'ajout / édition ──────────────────────────────────────────────────

function SpotModal({
  initial,
  onSave,
  onClose,
  isPro,
}: {
  initial?: CrewSpot;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
  onClose: () => void;
  isPro: boolean;
}) {
  const [form, setForm] = useState(
    initial
      ? {
          nom: initial.nom,
          categorie: initial.categorie,
          adresse: initial.adresse ?? "",
          lien_maps: initial.lien_maps ?? "",
          mot_du_fondateur: initial.mot_du_fondateur ?? "",
          avantage: initial.avantage ?? "",
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) { setErr("Le nom du lieu est obligatoire."); return; }
    setSaving(true);
    try { await onSave(form); } catch { setErr("Erreur lors de la sauvegarde."); }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="w-full max-w-lg bg-[var(--app-surface)] rounded-[28px] shadow-2xl overflow-hidden border border-[color:var(--app-border)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-[color:var(--app-border)]">
          <h2 className="text-[20px] font-display font-black italic uppercase tracking-tight text-[color:var(--app-text)]">
            {initial ? "Modifier le spot" : "Ajouter un spot"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center hover:bg-[var(--app-hover)] transition-colors">
            <X size={14} className="text-[color:var(--app-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Nom du lieu <span className="text-[#FF5C00]">*</span>
            </label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Café Central, Running Store…"
              className="w-full bg-[var(--app-surface-2)] border border-transparent focus:border-[#FF5C00] focus:bg-[var(--app-surface)] rounded-[14px] px-4 py-3 text-[14px] text-[color:var(--app-text)] outline-none transition-all"
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">Catégorie</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set("categorie", c.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-[14px] border transition-all text-center ${
                    form.categorie === c.value
                      ? "bg-[#FF5C00] border-[#FF5C00] text-white"
                      : "bg-[var(--app-surface-2)] border-transparent text-[color:var(--app-text-muted)] hover:bg-[var(--app-hover)]"
                  }`}
                >
                  <c.Icon size={18} strokeWidth={2} />
                  <span className="text-[9px] font-bold leading-tight">{c.short}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">Adresse (optionnel)</label>
            <input
              type="text"
              value={form.adresse}
              onChange={(e) => set("adresse", e.target.value)}
              placeholder="12 rue de la Paix, Paris"
              className="w-full bg-[var(--app-surface-2)] border border-transparent focus:border-[#FF5C00] focus:bg-[var(--app-surface)] rounded-[14px] px-4 py-3 text-[14px] text-[color:var(--app-text)] outline-none transition-all"
            />
          </div>

          {/* Lien Maps */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">Lien Google Maps (optionnel)</label>
            <input
              type="url"
              value={form.lien_maps}
              onChange={(e) => set("lien_maps", e.target.value)}
              placeholder="https://maps.google.com/…"
              className="w-full bg-[var(--app-surface-2)] border border-transparent focus:border-[#FF5C00] focus:bg-[var(--app-surface)] rounded-[14px] px-4 py-3 text-[14px] text-[color:var(--app-text)] outline-none transition-all"
            />
          </div>

          {/* Mot du fondateur */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">Ton mot (optionnel)</label>
            <input
              type="text"
              value={form.mot_du_fondateur}
              onChange={(e) => set("mot_du_fondateur", e.target.value)}
              placeholder="Notre QG d'après-run, On y va tous les jeudis…"
              className="w-full bg-[var(--app-surface-2)] border border-transparent focus:border-[#FF5C00] focus:bg-[var(--app-surface)] rounded-[14px] px-4 py-3 text-[14px] text-[color:var(--app-text)] outline-none transition-all"
            />
          </div>

          {/* Avantage */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Avantage pour le crew (optionnel)
            </label>
            {isPro ? (
              <>
                <input
                  type="text"
                  value={form.avantage}
                  onChange={(e) => set("avantage", e.target.value)}
                  placeholder="-10% sur présentation de la page Capten"
                  className="w-full bg-[var(--app-surface-2)] border border-transparent focus:border-[#FF5C00] focus:bg-[var(--app-surface)] rounded-[14px] px-4 py-3 text-[14px] text-[color:var(--app-text)] outline-none transition-all"
                />
                <p className="text-[11px] text-[color:var(--app-text-muted)]">
                  Texte libre — c'est toi qui l'as négocié avec le commerçant. Capten affiche juste l'info.
                </p>
              </>
            ) : (
              <Link
                href="/plan"
                className="flex items-center gap-2 rounded-[14px] border border-dashed border-[color:var(--app-border)] px-4 py-3 text-[13px] text-[color:var(--app-text-muted)] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors"
              >
                🔒 Avantages VIP — réservé à Captain Pro. Débloque pour afficher les perks négociés (‑10% café, deals shop…).
              </Link>
            )}
          </div>

          {err && <p className="text-[12px] text-red-500 font-medium">{err}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-[14px] bg-[#FF5C00] text-white font-black uppercase tracking-widest text-[13px] hover:bg-[#E04B00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {initial ? "Enregistrer" : "Ajouter ce spot"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Carte spot ───────────────────────────────────────────────────────────────

function SpotCard({
  spot,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  spot: CrewSpot;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const cat = getCat(spot.categorie);
  const [menu, setMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-5 relative group hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all"
    >
      {/* Menu kebab */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setMenu((m) => !m)}
          className="w-7 h-7 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--app-hover)]"
        >
          <MoreHorizontal size={13} className="text-[color:var(--app-text-muted)]" />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-9 bg-[var(--app-surface)] rounded-[16px] border border-[color:var(--app-border)] shadow-xl overflow-hidden z-10 min-w-[140px]"
            >
              <button
                onClick={() => { setMenu(false); onEdit(); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-semibold text-[color:var(--app-text)] hover:bg-[var(--app-surface-2)] transition-colors"
              >
                <Pencil size={12} className="text-[color:var(--app-text-muted)]" />
                Modifier
              </button>
              {!isFirst && (
                <button
                  onClick={() => { setMenu(false); onMoveUp(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-semibold text-[color:var(--app-text)] hover:bg-[var(--app-surface-2)] transition-colors"
                >
                  <ArrowUp size={12} className="text-[color:var(--app-text-muted)]" />
                  Monter
                </button>
              )}
              {!isLast && (
                <button
                  onClick={() => { setMenu(false); onMoveDown(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-semibold text-[color:var(--app-text)] hover:bg-[var(--app-surface-2)] transition-colors"
                >
                  <ArrowDown size={12} className="text-[color:var(--app-text-muted)]" />
                  Descendre
                </button>
              )}
              <button
                onClick={() => { setMenu(false); onDelete(); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={12} />
                Supprimer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Icône catégorie */}
      <div className="w-10 h-10 rounded-[14px] bg-[#FF5C00]/[0.08] flex items-center justify-center mb-3">
        <cat.Icon size={19} strokeWidth={2} className="text-[#FF5C00]" />
      </div>

      <h3 className="text-[15px] font-black uppercase tracking-tight text-[color:var(--app-text)] leading-tight mb-0.5">
        {spot.nom}
      </h3>

      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[color:var(--app-text-muted)] mb-3">
        {cat.label}
      </span>

      {spot.mot_du_fondateur && (
        <p className="text-[12px] text-[color:var(--app-text-muted)] italic mb-3 leading-snug">
          « {spot.mot_du_fondateur} »
        </p>
      )}

      {spot.adresse && (
        <div className="flex items-center gap-1 text-[11px] text-[color:var(--app-text-muted)] mb-2">
          <MapPin size={10} />
          <span className="truncate">{spot.adresse}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {spot.avantage && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5C00] text-white text-[11px] font-bold">
            <Gift size={11} strokeWidth={2.4} />
            {spot.avantage}
          </span>
        )}
        {spot.lien_maps && (
          <a
            href={spot.lien_maps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[color:var(--app-border)] text-[11px] font-medium text-[color:var(--app-text-muted)] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors"
          >
            <ExternalLink size={9} />
            Voir sur la carte
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────

export default function CrewSpotsPage() {
  const [club, setClub] = useState<any>(null);
  const [spots, setSpots] = useState<CrewSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing?: CrewSpot }>({ open: false });

  const load = useCallback(async () => {
    const res = await getMySpots();
    if (!("error" in res)) {
      setSpots((res.spots as CrewSpot[]) || []);
      setClub(res.club);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(form: typeof EMPTY_FORM) {
    await saveSpot(
      {
        nom: form.nom,
        categorie: form.categorie,
        adresse: form.adresse,
        lien_maps: form.lien_maps,
        mot_du_fondateur: form.mot_du_fondateur,
        avantage: form.avantage,
        ordre: spots.length,
      },
      modal.editing?.id
    );
    setModal({ open: false });
    load();
  }

  async function handleDelete(id: string) {
    await deleteSpot(id);
    setSpots((s) => s.filter((x) => x.id !== id));
  }

  async function handleMove(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= spots.length) return;

    // Swap in local state for instant feedback
    const reordered = [...spots];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSpots(reordered);

    await reorderSpots(reordered.map((s) => s.id));
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
            Les Spots du Crew
          </h1>
          <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans mt-1">
            Tes adresses recommandées — café, shop, kiné, ostéo…
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#FF5C00] text-white text-[13px] font-black uppercase tracking-wider hover:bg-[#E04B00] transition-colors"
        >
          <Plus size={15} />
          Ajouter
        </button>
      </div>

      {/* Banner info */}
      <div className="bg-[var(--app-surface-2)] rounded-[20px] px-5 py-4 flex items-start gap-3">
        <span className="shrink-0 w-9 h-9 rounded-[12px] bg-[var(--app-surface)] flex items-center justify-center">
          <MapPin size={18} strokeWidth={2} className="text-[#FF5C00]" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-[color:var(--app-text)]">L'after-run, les soins, l'équipement</p>
          <p className="text-[12px] text-[color:var(--app-text-muted)] mt-0.5 leading-snug">
            Ces spots apparaîtront sur la page d'inscription de ton crew et sur la fiche de chaque membre.
            Les avantages sont des accords que <em>tu</em> as négociés à l'oral — Capten affiche juste l'info.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#FF5C00]" size={28} />
        </div>
      ) : spots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-20 text-center"
        >
          <span className="w-16 h-16 rounded-[20px] bg-[#FF5C00]/[0.08] flex items-center justify-center mb-1">
            <MapPin size={30} strokeWidth={1.8} className="text-[#FF5C00]" />
          </span>
          <p className="text-[15px] font-black uppercase tracking-tight text-[color:var(--app-text)]">
            Aucun spot encore
          </p>
          <p className="text-[12px] text-[color:var(--app-text-muted)] max-w-xs">
            Ajoute le café où ton crew se retrouve après le run, le shop où vous achetez vos pompes, ou le kiné qui vous remet sur pied.
          </p>
          <button
            onClick={() => setModal({ open: true })}
            className="mt-2 inline-flex items-center gap-2 h-10 px-6 rounded-full bg-[#FF5C00] text-white text-[12px] font-black uppercase tracking-wider hover:bg-[#E04B00] transition-colors"
          >
            <Plus size={14} />
            Ajouter mon premier spot
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {spots.map((spot, i) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onEdit={() => setModal({ open: true, editing: spot })}
                onDelete={() => handleDelete(spot.id)}
                onMoveUp={() => handleMove(i, -1)}
                onMoveDown={() => handleMove(i, 1)}
                isFirst={i === 0}
                isLast={i === spots.length - 1}
              />
            ))}
          </AnimatePresence>

          {/* Add card */}
          <motion.button
            layout
            onClick={() => setModal({ open: true })}
            className="border-2 border-dashed border-[color:var(--app-border)] rounded-[24px] p-5 flex flex-col items-center justify-center gap-2 text-[color:var(--app-text-muted)] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors min-h-[160px]"
          >
            <Plus size={22} />
            <span className="text-[12px] font-black uppercase tracking-wider">Ajouter un spot</span>
          </motion.button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <SpotModal
            initial={modal.editing}
            onSave={handleSave}
            onClose={() => setModal({ open: false })}
            isPro={hasProAccess(club)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
