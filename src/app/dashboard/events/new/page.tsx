"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Repeat, Save, Send, Loader2, Luggage, Gauge, Coffee, Shield } from "lucide-react";
import Link from "next/link";
import { createRun } from "../actions";
import { formatPracticalDescription } from "@/lib/utils/practical-info";

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    bag_drop: "",
    pace: "",
    sweeper: "Présent — Personne n'est jamais lâché 🛡️",
    after_run: "",
    event_date: "",
    event_time: "",
    meeting_point_address: "",
    meeting_point_lat: null as number | null,
    meeting_point_lng: null as number | null,
    max_participants: "",
    distance_km: "",
    is_recurring: false,
    checkin_radius_meters: 200,
  });

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(status: "draft" | "published") {
    const eventDatetime = form.event_date && form.event_time
      ? new Date(`${form.event_date}T${form.event_time}`).toISOString()
      : null;

    if (!eventDatetime && status === "published") {
      alert("Veuillez sélectionner une date et heure.");
      return;
    }

    if (status === "published") setPublishing(true);
    else setSaving(true);

    const fullDescription = formatPracticalDescription(form.description, {
      bagDrop: form.bag_drop,
      pace: form.pace,
      sweeper: form.sweeper,
      afterRun: form.after_run,
    });

    // Création via server action : auth (cookies) + géocodage + insert côté serveur.
    const res = await createRun({
      title: form.title,
      description: fullDescription || null,
      event_date: eventDatetime || new Date().toISOString(),
      meeting_point_address: form.meeting_point_address || null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
      is_recurring: form.is_recurring,
      checkin_radius_meters: form.checkin_radius_meters,
      status,
    });

    if ("error" in res) {
      alert("Erreur lors de la création : " + res.error);
    } else {
      router.push(`/dashboard/events/${res.id}`);
    }

    setSaving(false);
    setPublishing(false);
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/events"
          className="flex items-center gap-2 text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>
        <h1 className="text-[24px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none">
          Nouveau Run
        </h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Infos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 space-y-4"
        >
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
            Informations
          </h2>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Titre du run
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Run & Chill #42 — République"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Description (optionnel)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Détails, niveau requis, équipement…"
              rows={3}
              className="w-full px-4 py-3 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all resize-none"
            />
          </div>
        </motion.div>

        {/* Infos Pratiques Anti-Stress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#FF5C00] flex items-center gap-1.5">
              <Luggage size={14} /> Infos Pratiques (Anti-Stress Coureurs)
            </h2>
            <span className="text-[10px] font-bold text-[color:var(--app-text-muted)] uppercase tracking-wider">
              Recommandé
            </span>
          </div>
          <p className="text-[12px] text-[color:var(--app-text-muted)] leading-snug">
            Réponds aux 3 questions que tous les nouveaux coureurs se posent pour maximiser les inscriptions.
          </p>

          {/* Consigne sacs */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1">
              <Luggage size={11} /> 1. Consigne sacs (Bag Drop)
            </label>
            <input
              type="text"
              value={form.bag_drop}
              onChange={(e) => update("bag_drop", e.target.value)}
              placeholder="Ex : Consigne possible au Café du coin · ou : Venir en tenue"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Consigne possible au QG / café", "Pas de consigne (venir en tenue)"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update("bag_drop", p)}
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] hover:border-[#FF5C00] border border-[color:var(--app-border)] transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Allure */}
          {/* Allure & Sas */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1">
              <Gauge size={11} /> 2. Sas d'Allures & Rythme du Crew
            </label>
            <input
              type="text"
              value={form.pace}
              onChange={(e) => update("pace", e.target.value)}
              placeholder="Ex : Sas 1 (5:00/km) · Sas 2 (5:45/km) · Sas 3 (6:30/km) · Débutants"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "Tous niveaux (6:00/km — zéro pression)",
                "3 Sas (5:00 · 5:45 · 6:30/km)",
                "Sas Débutant & Reprise douce",
                "Rythmé (5:00/km)",
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update("pace", p)}
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] hover:border-[#FF5C00] border border-[color:var(--app-border)] transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Serre-file & Sécurité Peloton */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#22C55E] flex items-center gap-1">
              <Shield size={11} /> 3. Serre-file & Encadrement (Anti-stress débutant)
            </label>
            <input
              type="text"
              value={form.sweeper}
              onChange={(e) => update("sweeper", e.target.value)}
              placeholder="Ex : Serre-file présent — Personne n'est jamais lâché"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 outline-none transition-all"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "Présent — Personne n'est jamais lâché 🛡️",
                "Meneur en tête + Serre-file à l'arrière",
                "Allure calée sur le dernier coureur",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("sweeper", s)}
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#22C55E]/30 hover:border-[#22C55E] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* After-run */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1">
              <Coffee size={11} /> 4. After-run / Moment convivial
            </label>
            <input
              type="text"
              value={form.after_run}
              onChange={(e) => update("after_run", e.target.value)}
              placeholder="Ex : Verre / café au Spot du Crew après les étirements"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Verre & étirements au Spot du Crew", "Café / boisson partagée", "Pas d'after (juste la session)"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update("after_run", p)}
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] hover:border-[#FF5C00] border border-[color:var(--app-border)] transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Date & Heure */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 space-y-4"
        >
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
            Date & Heure
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1">
                <Calendar size={10} />
                Date
              </label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => update("event_date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1">
                <Clock size={10} />
                Heure
              </label>
              <input
                type="time"
                value={form.event_time}
                onChange={(e) => update("event_time", e.target.value)}
                className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Point de rendez-vous */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 space-y-4"
        >
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
            Point de Rendez-vous
          </h2>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1">
              <MapPin size={10} />
              Adresse
            </label>
            <input
              type="text"
              value={form.meeting_point_address}
              onChange={(e) => update("meeting_point_address", e.target.value)}
              placeholder="Place de la République, Paris"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
          </div>

          <p className="text-[12px] text-[color:var(--app-text-muted)] leading-snug flex items-start gap-1.5">
            <MapPin size={13} className="text-[#FF5C00] shrink-0 mt-0.5" />
            L&apos;adresse suffit — Capten géolocalise le point tout seul pour le check-in GPS de tes coureurs.
          </p>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 space-y-4"
        >
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
            Options
          </h2>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1">
              <Users size={10} />
              Capacité maximale (optionnel)
            </label>
            <input
              type="number"
              value={form.max_participants}
              onChange={(e) => update("max_participants", e.target.value)}
              placeholder="50"
              min="1"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Distance du run (km) — optionnel
            </label>
            <input
              type="number"
              value={form.distance_km}
              onChange={(e) => update("distance_km", e.target.value)}
              placeholder="ex: 8"
              min="0"
              step="0.1"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => update("is_recurring", !form.is_recurring)}
              className={`w-10 h-6 rounded-full transition-all relative ${
                form.is_recurring ? "bg-[#FF5C00]" : "bg-[var(--app-surface-2)]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-[var(--app-surface)] rounded-full shadow transition-all ${
                  form.is_recurring ? "left-4" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-[13px] font-medium text-[color:var(--app-text)] flex items-center gap-1">
              <Repeat size={13} />
              Récurrence hebdomadaire
            </span>
          </div>
          {form.is_recurring && (
            <p className="text-[12px] text-[color:var(--app-text-muted)] leading-snug flex items-start gap-1.5 -mt-1">
              <Repeat size={13} className="text-[#FF5C00] shrink-0 mt-0.5" />
              Capten recréera ce run <b className="text-[color:var(--app-text)]">automatiquement chaque semaine</b> (même jour, même heure) — tu n'as plus rien à faire.
            </p>
          )}
        </motion.div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--app-surface)] border-t border-[color:var(--app-border)] p-4 flex justify-end gap-3 lg:pl-[280px]">
        <button
          onClick={() => submit("draft")}
          disabled={saving || publishing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[color:var(--app-border)] text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] hover:border-[#FF5C00] hover:text-[color:var(--app-text)] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Brouillon
        </button>
        <button
          onClick={() => submit("published")}
          disabled={saving || publishing || !form.title}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF5C00] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all active:scale-95 disabled:opacity-50"
        >
          {publishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Publier
        </button>
      </div>
    </div>
  );
}
