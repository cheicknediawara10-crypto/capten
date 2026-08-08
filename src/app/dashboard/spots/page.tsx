"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Plus, Pencil, Trash2, Loader2, ExternalLink,
  Coffee, ShoppingBag, Activity, Zap, MoreHorizontal, X, Check,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// ── Types ───────────────────────────────────────────────────────────────────

type Categorie = "cafe" | "shop" | "kine" | "osteo" | "autre";

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

const CATEGORIES: { value: Categorie; label: string; emoji: string; icon: React.ReactNode }[] = [
  { value: "cafe",  label: "Café / Bar",       emoji: "☕", icon: <Coffee size={14} /> },
  { value: "shop",  label: "Shop Running",      emoji: "👟", icon: <ShoppingBag size={14} /> },
  { value: "kine",  label: "Kiné / Physio",     emoji: "🦵", icon: <Activity size={14} /> },
  { value: "osteo", label: "Ostéo / Récup",     emoji: "🤸", icon: <Zap size={14} /> },
  { value: "autre", label: "Autre",             emoji: "📍", icon: <MapPin size={14} /> },
];

const getCat = (v: string) => CATEGORIES.find((c) => c.value === v) ?? CATEGORIES[4];

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
}: {
  initial?: CrewSpot;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
  onClose: () => void;
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
        className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-black/5">
          <h2 className="text-[20px] font-display font-black italic uppercase tracking-tight text-black">
            {initial ? "Modifier le spot" : "Ajouter un spot"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F4F4EE] flex items-center justify-center hover:bg-[#EAEADF] transition-colors">
            <X size={14} className="text-[#555]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">
              Nom du lieu <span className="text-[#FF5C00]">*</span>
            </label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Café Central, Running Store…"
              className="w-full bg-[#F4F4EE] border border-transparent focus:border-[#FF5C00] focus:bg-white rounded-[14px] px-4 py-3 text-[14px] text-black outline-none transition-all"
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">Catégorie</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set("categorie", c.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-[14px] border transition-all text-center ${
                    form.categorie === c.value
                      ? "bg-[#FF5C00] border-[#FF5C00] text-white"
                      : "bg-[#F4F4EE] border-transparent text-[#555] hover:bg-[#EAEADF]"
                  }`}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <span className="text-[9px] font-bold leading-tight">{c.label.split(" /")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">Adresse (optionnel)</label>
            <input
              type="text"
              value={form.adresse}
              onChange={(e) => set("adresse", e.target.value)}
              placeholder="12 rue de la Paix, Paris"
              className="w-full bg-[#F4F4EE] border border-transparent focus:border-[#FF5C00] focus:bg-white rounded-[14px] px-4 py-3 text-[14px] text-black outline-none transition-all"
            />
          </div>

          {/* Lien Maps */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">Lien Google Maps (optionnel)</label>
            <input
              type="url"
              value={form.lien_maps}
              onChange={(e) => set("lien_maps", e.target.value)}
              placeholder="https://maps.google.com/…"
              className="w-full bg-[#F4F4EE] border border-transparent focus:border-[#FF5C00] focus:bg-white rounded-[14px] px-4 py-3 text-[14px] text-black outline-none transition-all"
            />
          </div>

          {/* Mot du fondateur */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">Ton mot (optionnel)</label>
            <input
              type="text"
              value={form.mot_du_fondateur}
              onChange={(e) => set("mot_du_fondateur", e.target.value)}
              placeholder="Notre QG d'après-run, On y va tous les jeudis…"
              className="w-full bg-[#F4F4EE] border border-transparent focus:border-[#FF5C00] focus:bg-white rounded-[14px] px-4 py-3 text-[14px] text-black outline-none transition-all"
            />
          </div>

          {/* Avantage */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">
              Avantage pour le crew (optionnel)
            </label>
            <input
              type="text"
              value={form.avantage}
              onChange={(e) => set("avantage", e.target.value)}
              placeholder="-10% sur présentation de la page Capten"
              className="w-full bg-[#F4F4EE] border border-transparent focus:border-[#FF5C00] focus:bg-white rounded-[14px] px-4 py-3 text-[14px] text-black outline-none transition-all"
            />
            <p className="text-[11px] text-[#A3A3A3]">
              Texte libre — c'est toi qui l'as négocié avec le commerçant. Capten affiche juste l'info.
            </p>
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
}: {
  spot: CrewSpot;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cat = getCat(spot.categorie);
  const [menu, setMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[24px] border border-black/5 p-5 relative group hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all"
    >
      {/* Menu kebab */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setMenu((m) => !m)}
          className="w-7 h-7 rounded-full bg-[#F4F4EE] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#EAEADF]"
        >
          <MoreHorizontal size={13} className="text-[#555]" />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-9 bg-white rounded-[16px] border border-black/5 shadow-xl overflow-hidden z-10 min-w-[140px]"
            >
              <button
                onClick={() => { setMenu(false); onEdit(); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-semibold text-[#333] hover:bg-[#F4F4EE] transition-colors"
              >
                <Pencil size={12} className="text-[#A3A3A3]" />
                Modifier
              </button>
              <button
                onClick={() => { setMenu(false); onDelete(); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} />
                Supprimer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emoji catégorie */}
      <div className="w-10 h-10 rounded-[14px] bg-[#F4F4EE] flex items-center justify-center text-xl mb-3">
        {cat.emoji}
      </div>

      <h3 className="text-[15px] font-black uppercase tracking-tight text-black leading-tight mb-0.5">
        {spot.nom}
      </h3>

      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] mb-3">
        {cat.label}
      </span>

      {spot.mot_du_fondateur && (
        <p className="text-[12px] text-[#666562] italic mb-3 leading-snug">
          « {spot.mot_du_fondateur} »
        </p>
      )}

      {spot.adresse && (
        <div className="flex items-center gap-1 text-[11px] text-[#A3A3A3] mb-2">
          <MapPin size={10} />
          <span className="truncate">{spot.adresse}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {spot.avantage && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF5C00] text-white text-[11px] font-bold">
            🎁 {spot.avantage}
          </span>
        )}
        {spot.lien_maps && (
          <a
            href={spot.lien_maps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-black/10 text-[11px] font-medium text-[#555] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors"
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
  const { club } = useAuth();
  const [spots, setSpots] = useState<CrewSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing?: CrewSpot }>({ open: false });

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !club) { setLoading(false); return; }
    const { data } = await supabase
      .from("crew_spots")
      .select("*")
      .eq("club_id", club.id)
      .order("ordre")
      .order("created_at");
    setSpots((data as CrewSpot[]) || []);
    setLoading(false);
  }, [club]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(form: typeof EMPTY_FORM) {
    const supabase = getSupabase();
    if (!supabase || !club) return;

    if (modal.editing) {
      await supabase
        .from("crew_spots")
        .update({
          nom: form.nom.trim(),
          categorie: form.categorie,
          adresse: form.adresse.trim() || null,
          lien_maps: form.lien_maps.trim() || null,
          mot_du_fondateur: form.mot_du_fondateur.trim() || null,
          avantage: form.avantage.trim() || null,
        })
        .eq("id", modal.editing.id);
    } else {
      await supabase
        .from("crew_spots")
        .insert({
          club_id: club.id,
          nom: form.nom.trim(),
          categorie: form.categorie,
          adresse: form.adresse.trim() || null,
          lien_maps: form.lien_maps.trim() || null,
          mot_du_fondateur: form.mot_du_fondateur.trim() || null,
          avantage: form.avantage.trim() || null,
          ordre: spots.length,
        });
    }
    setModal({ open: false });
    load();
  }

  async function handleDelete(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("crew_spots").delete().eq("id", id);
    setSpots((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[36px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
            Les Spots du Crew
          </h1>
          <p className="text-[13px] text-[#A3A3A3] font-sans mt-1">
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
      <div className="bg-[#F4F4EE] rounded-[20px] px-5 py-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">🗺️</span>
        <div>
          <p className="text-[13px] font-bold text-[#1A1918]">L'after-run, les soins, l'équipement</p>
          <p className="text-[12px] text-[#666562] mt-0.5 leading-snug">
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
          <span className="text-5xl">📍</span>
          <p className="text-[15px] font-black uppercase tracking-tight text-black">
            Aucun spot encore
          </p>
          <p className="text-[12px] text-[#A3A3A3] max-w-xs">
            Ajoute le café où ton crew se retrouve après le run, le shop où vous achetez vos pompes, ou le kiné qui vous remet sur pied.
          </p>
          <button
            onClick={() => setModal({ open: true })}
            className="mt-2 inline-flex items-center gap-2 h-10 px-6 rounded-full bg-black text-white text-[12px] font-black uppercase tracking-wider hover:bg-[#FF5C00] transition-colors"
          >
            <Plus size={14} />
            Ajouter mon premier spot
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {spots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onEdit={() => setModal({ open: true, editing: spot })}
                onDelete={() => handleDelete(spot.id)}
              />
            ))}
          </AnimatePresence>

          {/* Add card */}
          <motion.button
            layout
            onClick={() => setModal({ open: true })}
            className="border-2 border-dashed border-black/10 rounded-[24px] p-5 flex flex-col items-center justify-center gap-2 text-[#A3A3A3] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors min-h-[160px]"
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
