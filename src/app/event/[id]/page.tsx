"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Users, CheckCircle2, Loader2, ArrowRight, Phone, Shield,
  Luggage, Gauge, Coffee, Sparkles, CreditCard, Link2, AlertCircle, X, ExternalLink
} from "lucide-react";
import { formatDateShort } from "@/lib/utils/format";
import { parsePracticalInfo } from "@/lib/utils/practical-info";
import { registerToEvent, declarePaymentByRunner, getPublicEventInfo } from "@/lib/evenements/actions";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  meeting_point_address: string | null;
  max_participants: number | null;
  status: string;
  checkin_radius_meters: number;
  club_id: string;
  is_evenement?: boolean;
  jauge_max?: number | null;
  prix?: number | null;
  devise?: string;
  lien_paiement?: string | null;
  description_evenement?: string | null;
  clubs: { name: string; logo_url: string | null; city: string | null } | null;
}

export default function PublicEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [inscritsCount, setInscritsCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);
  
  // États formulaire inscription
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    paceGroup: "🟢 Cool (6:00 - 6:30/km)",
  });

  // État résultat après inscription
  const [inscriptionResult, setInscriptionResult] = useState<{
    status: "registered" | "waitlisted";
    inscriptionId: string;
    position?: number | null;
    hasPaid: boolean;
  } | null>(null);

  useEffect(() => {
    async function load() {
      // Passe par une server action (clé service) : aucune lecture directe des
      // inscriptions par la clé anon → zéro fuite de PII des autres coureurs.
      const res = await getPublicEventInfo(id);
      if ("error" in res) { setEvent(null); setLoading(false); return; }
      setEvent(res.event);
      setInscritsCount(res.mainCount);
      setWaitlistCount(res.waitlistCount);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.prenom.trim() || !form.nom.trim()) {
      alert("Merci de renseigner ton prénom et ton nom.");
      return;
    }

    setSubmitting(true);
    const res = await registerToEvent({
      eventId: id,
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone,
      paceGroup: form.paceGroup,
    });

    if ("error" in res) {
      alert(res.error);
      setSubmitting(false);
      return;
    }

    setInscriptionResult({
      status: res.status as "registered" | "waitlisted",
      inscriptionId: res.inscription.id,
      position: res.position,
      hasPaid: false,
    });

    if (res.status === "registered") {
      setInscritsCount((c) => c + 1);
    } else {
      setWaitlistCount((c) => c + 1);
    }

    setSubmitting(false);
  }

  async function handleDeclarePayment() {
    if (!inscriptionResult) return;
    const res = await declarePaymentByRunner(inscriptionResult.inscriptionId);
    if (!("error" in res)) {
      setInscriptionResult((prev) => prev ? { ...prev, hasPaid: true } : null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4EE] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!event || event.status !== "published") {
    return (
      <div className="min-h-screen bg-[#F4F4EE] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-4xl">🙅</p>
        <h1 className="text-[20px] font-display font-black italic uppercase">Sortie indisponible</h1>
        <p className="text-[13px] text-[#666562]">Cette sortie n&apos;est pas accessible pour le moment.</p>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const practical = parsePracticalInfo(event.description);
  const isEvenement = !!event.is_evenement;
  const jaugeMax = event.jauge_max || event.max_participants || 0;
  const placesRestantes = jaugeMax > 0 ? Math.max(0, jaugeMax - inscritsCount) : null;
  const isComplet = jaugeMax > 0 && placesRestantes === 0;

  return (
    <div className="min-h-screen bg-[#F4F4EE] pb-32 font-sans">
      {/* Hero */}
      <div className="bg-black text-white px-6 pt-12 pb-10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #FF5500 0, #FF5500 1px, transparent 0, transparent 50%)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-lg mx-auto">
          
          {/* Badge Événement & Club */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            {event.clubs && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#FF5500]/20 flex items-center justify-center overflow-hidden">
                  {event.clubs.logo_url ? (
                    <img src={event.clubs.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : "🏃"}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                  {event.clubs.name}
                </span>
              </div>
            )}

            {isEvenement && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500] text-white text-[10px] font-black uppercase tracking-widest shadow-[0_2px_10px_rgba(255,85,0,0.4)]">
                <Sparkles size={11} /> Événement
              </span>
            )}
          </div>

          <h1 className="text-[32px] font-display font-black italic uppercase text-white leading-tight tracking-tighter">
            {event.title}
          </h1>

          {/* Prix bien visible pour les événements */}
          {isEvenement && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[26px] font-display font-black text-[#FF5500] tracking-tight">
                {event.prix ? `${event.prix} ${event.devise || "€"}` : "Gratuit"}
              </span>
              {jaugeMax > 0 && (
                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                  isComplet ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white/80"
                }`}>
                  {isComplet ? "Complet (Liste d'attente)" : `${placesRestantes} place${placesRestantes! > 1 ? "s" : ""} restante${placesRestantes! > 1 ? "s" : ""}`}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-5">
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              <Calendar size={13} className="text-[#FF5500]" />
              {formatDateShort(event.event_date)} · {eventDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {event.meeting_point_address && (
              <span className="flex items-center gap-1.5 text-[12px] text-white/70">
                <MapPin size={13} className="text-[#FF5500]" />
                {event.meeting_point_address}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              <Users size={13} className="text-[#FF5500]" />
              {inscritsCount}{jaugeMax ? ` / ${jaugeMax}` : ""} inscrits
              {waitlistCount > 0 && ` (${waitlistCount} en attente)`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-6 space-y-4">

        {/* Bloc Ce qui est inclus (Run Événement) */}
        {isEvenement && event.description_evenement && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-black/5 p-5 space-y-2 shadow-sm"
          >
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#FF5500] flex items-center gap-1.5">
              <Sparkles size={13} /> Ce qui est inclus
            </h2>
            <p className="text-[14px] text-[#111111] leading-relaxed font-medium">
              {event.description_evenement}
            </p>
          </motion.div>
        )}

        {/* Description générale */}
        {event.description && !isEvenement && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-black/5 p-5 shadow-sm"
          >
            <p className="text-[13px] text-[#4B5563] leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </motion.div>
        )}

        {/* Infos Pratiques Anti-Stress */}
        {(practical.bagDrop || practical.pace || practical.sweeper || practical.afterRun || practical.routeUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-black/5 p-5 space-y-3 shadow-sm"
          >
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#FF5500] flex items-center gap-1.5">
              <Luggage size={13} /> Infos Pratiques du Run
            </h2>
            <div className="space-y-2.5 pt-1">
              {practical.bagDrop && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8F8F6]">
                  <Luggage size={16} className="text-[#FF5500] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">Consigne sacs</p>
                    <p className="text-[12px] font-semibold text-[#111111]">{practical.bagDrop}</p>
                  </div>
                </div>
              )}
              {practical.pace && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8F8F6]">
                  <Gauge size={16} className="text-[#FF5500] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">Sas d&apos;allures</p>
                    <p className="text-[12px] font-semibold text-[#111111]">{practical.pace}</p>
                  </div>
                </div>
              )}
              {practical.sweeper && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7]">
                  <Shield size={16} className="text-[#166534] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#166534]/70">Serre-file officiel</p>
                    <p className="text-[12px] font-semibold text-[#166534]">{practical.sweeper}</p>
                  </div>
                </div>
              )}
              {practical.afterRun && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8F8F6]">
                  <Coffee size={16} className="text-[#FF5500] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">After-run</p>
                    <p className="text-[12px] font-semibold text-[#111111]">{practical.afterRun}</p>
                  </div>
                </div>
              )}
              {practical.routeUrl && (
                <a
                  href={practical.routeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 hover:bg-[#FF5500]/20 transition-all text-[#FF5500] group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-[#FF5500] shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#FF5500]/80">Tracé officiel</p>
                      <p className="text-[12px] font-bold text-[#111111] group-hover:text-[#FF5500]">Voir le parcours (Strava / GPX)</p>
                    </div>
                  </div>
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Check-in info */}
        {!isPast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[20px] border border-black/5 p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-[#FF5500]/10 flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-[#FF5500]" />
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-wider text-black">Check-in GPS</p>
              <p className="text-[11px] text-[#666562]">Rayon : {event.checkin_radius_meters}m depuis le point de RDV</p>
            </div>
            <Link
              href={`/checkin/${event.id}`}
              className="ml-auto px-3 py-1.5 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-widest text-[#666562] hover:border-black hover:text-black transition-all shrink-0"
            >
              Check-in
            </Link>
          </motion.div>
        )}
      </div>

      {/* Fixed CTA */}
      {!isPast && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 p-5 z-20">
          <div className="max-w-lg mx-auto">
            {inscriptionResult ? (
              inscriptionResult.status === "registered" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-[#DCFCE7] text-[#166534] rounded-2xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      <span className="text-[13px] font-black uppercase tracking-wider">Place Réservée (48h)</span>
                    </div>
                    {inscriptionResult.hasPaid && (
                      <span className="text-[11px] font-bold bg-[#166534] text-white px-2 py-0.5 rounded-full">
                        Paiement Déclaré ✓
                      </span>
                    )}
                  </div>

                  {event.lien_paiement && !inscriptionResult.hasPaid && (
                    <div className="flex flex-col gap-2">
                      <a
                        href={event.lien_paiement}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-[#FF5500] text-white text-[13px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all shadow-[0_4px_16px_rgba(255,85,0,0.25)]"
                      >
                        Payer maintenant ({event.prix} {event.devise || "€"}) <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={handleDeclarePayment}
                        className="w-full h-10 rounded-full border border-black/10 text-[12px] font-bold text-[#4B5563] hover:text-black transition-colors"
                      >
                        ✓ J&apos;ai payé (Informer l&apos;organisateur)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-center">
                  <p className="text-[13px] font-black uppercase tracking-wider">
                    Tu es #{inscriptionResult.position} sur la liste d&apos;attente
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    On te prévient par email dès qu&apos;une place se libère.
                  </p>
                </div>
              )
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className={`w-full flex items-center justify-center gap-2 h-14 rounded-full text-white text-[13px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  isComplet
                    ? "bg-[#1C1B18] hover:bg-[#FF5500]"
                    : "bg-[#FF5500] hover:bg-[#E04B00] shadow-[0_8px_24px_rgba(255,85,0,0.25)]"
                }`}
              >
                {isComplet ? "Rejoindre la liste d'attente" : (
                  <>
                    S&apos;inscrire {event.prix ? `· ${event.prix} ${event.devise || "€"}` : ""}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal / Bottom Sheet d'inscription rapide */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 space-y-5 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-display font-black uppercase tracking-tight text-[#111111]">
                    {isComplet ? "Liste d'attente" : "Inscription au Run"}
                  </h3>
                  <p className="text-[12px] text-[#6B7280]">
                    {event.title} · {formatDateShort(event.event_date)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:text-[#111111]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      placeholder="Thomas"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] text-sm font-medium focus:border-[#FF5500] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Nom *</label>
                    <input
                      type="text"
                      required
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      placeholder="Martin"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] text-sm font-medium focus:border-[#FF5500] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Email (pour ta confirmation) *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="thomas.martin@email.com"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] text-sm font-medium focus:border-[#FF5500] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Téléphone</label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] text-sm font-medium focus:border-[#FF5500] outline-none"
                  />
                </div>

                {/* Choix du Sas d'allure (Anti-lâchage) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                    Ton Sas d&apos;Allure estimé (Anti-lâchage 🏃)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "cool", label: "🟢 Cool", sub: "6:00 - 6:30/km" },
                      { id: "tempo", label: "🟡 Rythmé", sub: "5:15 - 5:45/km" },
                      { id: "fast", label: "🔴 Fast", sub: "sub-5:00/km" },
                      { id: "walk", label: "🚶 Run & Walk", sub: "Tous niveaux" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm({ ...form, paceGroup: `${p.label} (${p.sub})` })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          form.paceGroup === `${p.label} (${p.sub})`
                            ? "border-[#FF5500] bg-[#FF5500]/10 text-[#111111]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB]"
                        }`}
                      >
                        <p className="text-[11px] font-black">{p.label}</p>
                        <p className="text-[10px] text-[#9CA3AF] font-medium">{p.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {isEvenement && event.prix && (
                  <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E7EB] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#111111]">Montant de l&apos;événement</span>
                      <span className="text-[14px] font-black text-[#FF5500]">{event.prix} {event.devise || "€"}</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">
                      Ta place sera réservée pendant 48h. Tu pourras régler directement via le lien de l&apos;organisateur.
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] leading-snug pt-1 border-t border-[#EEEEEA] mt-1">
                      Le paiement se fait directement auprès de l&apos;organisateur, via son propre outil. Capten n&apos;encaisse aucun montant et n&apos;est pas responsable du paiement ni des remboursements.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full bg-[#FF5500] text-white text-[13px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,85,0,0.25)]"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isComplet ? (
                    "Valider mon inscription en liste d'attente"
                  ) : (
                    "Confirmer mon inscription"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
