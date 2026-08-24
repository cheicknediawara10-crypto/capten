"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Phone, Shield, FileCheck, Calendar, CheckCircle2,
  Loader2, AlertTriangle, Cake, KeyRound, Copy, RotateCcw, Mail, Save,
} from "lucide-react";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils/format";
import { getMemberDetail, resetMemberPin, updateMemberContact } from "../actions";

interface MembreProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  created_at: string;
}

interface IceContact {
  contact_name: string;
  contact_phone: string;
  relationship: string | null;
}

interface Checkin {
  id: string;
  checked_in_at: string;
  is_valid: boolean;
  events: { title: string; event_date: string } | null;
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<MembreProfile | null>(null);
  const [ice, setIce] = useState<IceContact | null>(null);
  const [hasWaiver, setHasWaiver] = useState(false);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPin, setNewPin] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  async function handleResetPin() {
    if (!confirm("Générer un nouveau code PIN pour ce membre ? L'ancien ne fonctionnera plus.")) return;
    setResetting(true);
    const res = await resetMemberPin(id);
    setResetting(false);
    if ("error" in res) { alert(res.error); return; }
    setNewPin(res.pin);
  }

  async function handleSaveContact() {
    setSavingContact(true);
    const res = await updateMemberContact(id, { email, phone });
    setSavingContact(false);
    if ("error" in res) { alert(res.error); return; }
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2000);
  }

  useEffect(() => {
    async function load() {
      // Via server action (session cookies) → borné au crew, fiable sans contexte client.
      const res = await getMemberDetail(id);
      if (!("error" in res)) {
        setProfile(res.profile as MembreProfile | null);
        setEmail(res.profile?.email ?? "");
        setPhone(res.profile?.phone ?? "");
        setIce((res.ice as IceContact) || null);
        setHasWaiver(res.hasWaiver);
        setCheckins((res.checkins as unknown as Checkin[]) || []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24">
        <p className="text-[color:var(--app-text-muted)]">Membre introuvable.</p>
        <Link href="/dashboard/members" className="text-[#FF5500] mt-4 inline-block text-sm">← Retour</Link>
      </div>
    );
  }

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Membre";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const validCheckins = checkins.filter((c) => c.is_valid).length;

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <Link href="/dashboard/members"
        className="inline-flex items-center gap-1.5 text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors text-sm font-medium">
        <ArrowLeft size={15} />
        Membres
      </Link>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#FF5500]/10 flex items-center justify-center font-black text-[20px] text-[#FF5500] shrink-0">
            {initials || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
              {name}
            </h1>
            {profile.date_of_birth && (
              <p className="text-[12px] text-[color:var(--app-text-muted)] flex items-center gap-1 mt-1">
                <Cake size={10} />
                {formatDateShort(profile.date_of_birth)}
              </p>
            )}
          </div>
          {profile.phone && (
            <a href={`tel:${profile.phone}`}
              className="flex items-center gap-2 bg-[#FF5500] text-white px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all">
              <Phone size={13} />
              Appeler
            </a>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[color:var(--app-border)] grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[24px] font-display font-black italic text-[color:var(--app-text)] leading-none">{validCheckins}</p>
            <p className="text-[10px] text-[color:var(--app-text-muted)] uppercase tracking-wider mt-0.5">Check-ins</p>
          </div>
          <div>
            <p className={`text-[24px] font-display font-black italic leading-none ${hasWaiver ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
              {hasWaiver ? "OK" : "—"}
            </p>
            <p className="text-[10px] text-[color:var(--app-text-muted)] uppercase tracking-wider mt-0.5">Décharge</p>
          </div>
          <div>
            <p className="text-[13px] font-black text-[color:var(--app-text)] leading-none mt-1">{formatDateShort(profile.created_at)}</p>
            <p className="text-[10px] text-[color:var(--app-text-muted)] uppercase tracking-wider mt-0.5">Membre depuis</p>
          </div>
        </div>
      </motion.div>

      {/* Coordonnées — e-mail (sert au reset PIN par lien) + téléphone */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-9 h-9 rounded-xl bg-[var(--app-accent-soft)] flex items-center justify-center shrink-0">
            <Mail size={16} className="text-[#FF5500]" />
          </span>
          <div>
            <h2 className="text-[13px] font-black uppercase tracking-tight text-[color:var(--app-text)]">Coordonnées</h2>
            <p className="text-[11px] text-[color:var(--app-text-muted)]">L&apos;e-mail permet au coureur de réinitialiser son PIN par lien.</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] block mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coureur@exemple.fr"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] bg-[var(--app-surface-2)] text-sm font-medium text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-muted)] focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] block mb-1">Téléphone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] bg-[var(--app-surface-2)] text-sm font-medium text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-muted)] focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all" />
          </div>
          <button onClick={handleSaveContact} disabled={savingContact}
            className="flex items-center gap-2 px-5 h-10 rounded-full bg-[#FF5500] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all active:scale-95 disabled:opacity-50">
            {savingContact ? <Loader2 size={13} className="animate-spin" /> : contactSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
            {contactSaved ? "Enregistré" : "Enregistrer"}
          </button>
        </div>
      </motion.div>

      {/* Code PIN — dépannage : le PIN est haché, on ne peut que le régénérer */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[var(--app-accent-soft)] flex items-center justify-center shrink-0">
              <KeyRound size={16} className="text-[#FF5500]" />
            </span>
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-tight text-[color:var(--app-text)]">Code PIN</h2>
              <p className="text-[11px] text-[color:var(--app-text-muted)]">Oublié ? Génère-en un nouveau à lui transmettre.</p>
            </div>
          </div>
          {!newPin && (
            <button onClick={handleResetPin} disabled={resetting}
              className="flex items-center gap-2 px-4 h-10 rounded-full border border-[color:var(--app-border)] text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] hover:border-[#FF5500] hover:text-[color:var(--app-text)] transition-all disabled:opacity-50">
              {resetting ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
              Réinitialiser
            </button>
          )}
        </div>

        {newPin && (
          <div className="mt-4 flex items-center justify-between gap-3 bg-[var(--app-surface-2)] border border-[color:var(--app-border)] rounded-[16px] px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] mb-1">Nouveau code — à communiquer</p>
              <span className="text-[34px] font-display font-black italic tracking-[0.3em] text-[color:var(--app-text)] leading-none">{newPin}</span>
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(newPin); setPinCopied(true); setTimeout(() => setPinCopied(false), 1600); }}
              className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-[color:var(--app-border)] text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-text-muted)] hover:border-[#FF5500] hover:text-[color:var(--app-text)] transition-all shrink-0">
              {pinCopied ? <CheckCircle2 size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
              {pinCopied ? "Copié" : "Copier"}
            </button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ICE Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1.5">
              <Shield size={12} />
              Contact d'Urgence (ICE)
            </h2>
            {ice ? <CheckCircle2 size={16} className="text-[#22C55E]" /> : <AlertTriangle size={16} className="text-[#EF4444]" />}
          </div>

          {ice ? (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-[color:var(--app-text-muted)] uppercase tracking-wider">Nom</p>
                <p className="text-sm font-semibold text-[color:var(--app-text)]">{ice.contact_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-[color:var(--app-text-muted)] uppercase tracking-wider">Relation</p>
                <p className="text-sm font-semibold text-[color:var(--app-text)]">{ice.relationship || "Non précisé"}</p>
              </div>
              <a href={`tel:${ice.contact_phone}`}
                className="flex items-center gap-2 w-full justify-center bg-[#3DD68C]/15 text-[#3DD68C] px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#3DD68C] hover:text-black transition-all">
                <Phone size={13} />
                {ice.contact_phone}
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <AlertTriangle size={24} className="text-[#EF4444] mb-2" />
              <p className="text-[12px] text-[#EF4444] font-semibold">ICE non renseigné</p>
              <p className="text-[11px] text-[color:var(--app-text-muted)] mt-1">Ce membre n'a pas encore fourni de contact d'urgence.</p>
            </div>
          )}
        </motion.div>

        {/* Décharge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1.5 mb-4">
            <FileCheck size={12} />
            Décharge de responsabilité
          </h2>
          <div className="flex flex-col items-center py-6 text-center">
            {hasWaiver ? (
              <>
                <CheckCircle2 size={28} className="text-[#22C55E] mb-2" />
                <p className="text-[13px] font-semibold text-[#22C55E]">Décharge signée</p>
                <p className="text-[11px] text-[color:var(--app-text-muted)] mt-1">Preuve légale horodatée enregistrée.</p>
              </>
            ) : (
              <>
                <AlertTriangle size={28} className="text-[#F59E0B] mb-2" />
                <p className="text-[13px] font-semibold text-[#F59E0B]">Décharge manquante</p>
                <p className="text-[11px] text-[color:var(--app-text-muted)] mt-1">Ce membre n'a pas encore signé.</p>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Historique */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1.5">
            <Calendar size={12} />
            Historique des sorties ({checkins.length})
          </h2>
        </div>
        {checkins.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[12px] text-[color:var(--app-text-muted)]">Aucun historique.</p>
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--app-border)] mt-4">
            {checkins.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-6 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${c.is_valid ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[color:var(--app-text)] truncate">{c.events?.title || "Sortie"}</p>
                  <p className="text-[11px] text-[color:var(--app-text-muted)]">{formatDateShort(c.events?.event_date || c.checked_in_at)}</p>
                </div>
                {c.is_valid && <CheckCircle2 size={14} className="text-[#22C55E] shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
