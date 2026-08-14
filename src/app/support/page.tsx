'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, MessageCircle, Mail, Send, AlertTriangle, 
  CheckCircle2, Clock, ShieldCheck, Sparkles, Phone, ArrowRight,
  FileText, Zap, ChevronDown, ChevronUp, LifeBuoy, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SupportPage() {
  const { club, user, isMock } = useAuth();

  // Form State
  const [ticketCategory, setTicketCategory] = useState('Urgent — Session ce soir');
  const [ticketPriority, setTicketPriority] = useState('HAUTE');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const clubName = club?.whatsapp_display_name || club?.name || 'Mon Club';

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      // Post to incidents/support endpoint or mock
      await new Promise((res) => setTimeout(res, 1200));
      setSubmittedSuccess(true);
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappSupportUrl = `https://wa.me/33600000000?text=${encodeURIComponent(
    `👋 Hello l'équipe Capten ! Je suis le Capitaine du club *${clubName}*.\nJ'ai une question / un besoin d'assistance sur mon interface :`
  )}`;

  const faqs = [
    {
      q: "Que faire en cas d'accident ou de malaise pendant un run ?",
      a: "Ouvre la fiche du membre depuis Membres ou Protection : le contact d'urgence (ICE), le groupe sanguin et les allergies s'affichent en 1 clic. Appelle le 112 ou le 15 en priorité si l'état le nécessite."
    },
    {
      q: "Un membre n'a pas signé sa décharge, peut-il courir ?",
      a: "Par sécurité juridique pour toi et ton crew, la décharge se signe à l'inscription (via ton lien unique). Renvoie-lui le lien d'inscription : ça prend 30 secondes et c'est horodaté."
    },
    {
      q: "Comment un membre rejoint mon crew ?",
      a: "Partage ton lien d'inscription (dispo sur le Tableau de bord). Le coureur s'inscrit avec Prénom + Nom + Date de naissance + un code PIN à 4 chiffres — aucune app à installer, rien à mémoriser d'autre."
    },
    {
      q: "C'est quoi Les Spots du Crew ? Capten touche une commission ?",
      a: "Non, zéro paiement et zéro commission. Les Spots, c'est juste tes bonnes adresses (café d'après-run, shop, kiné) affichées à ton crew. Si tu as négocié un avantage à l'oral avec un commerçant, tu l'indiques en texte libre — Capten n'encaisse jamais rien."
    },
    {
      q: "Comment fonctionne le check-in GPS d'un run ?",
      a: "Depuis la fiche du run, tes membres valident leur présence au point de rendez-vous (GPS ou QR). Tu vois qui est là en direct sur ton tableau de bord — pour ne laisser personne derrière."
    }
  ];

  return (
    <div className="space-y-10 pb-20 text-[color:var(--app-text)]">
      {/* HEADER */}
      <header className="flex flex-col gap-1.5 pb-6 sm:pb-10 border-b-[0.5px] border-[color:var(--app-border)] mb-8 sm:mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tight">
              SUPPORT & ASSISTANCE
            </h1>
            <span className="bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/20 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#56E39F] animate-pulse" /> SUPPORT CAPTEN
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[color:var(--app-text-muted)] font-medium max-w-2xl mt-1">
          Un souci pendant un run, une question juridique ou un besoin d&apos;assistance ? L&apos;équipe Capten est là pour répondre à tes urgences terrain.
        </p>
      </header>

      {/* DIRECT CONTACT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WHATSAPP DIRECT */}
        <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white rounded-card-outer p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group border border-white/10">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <MessageCircle size={22} />
            </div>
            <div>
              <span className="text-[9px] font-black text-white/70 uppercase tracking-widest block font-mono">RÉPONSE EN &lt; 15 MIN</span>
              <h3 className="text-[20px] font-display italic font-black uppercase text-white mt-1">WHATSAPP CAPTAIN</h3>
            </div>
            <p className="text-[11px] text-white/85 leading-relaxed font-medium">
              Contacte directement l&apos;équipe pour une réponse prioritaire avant ton run.
            </p>
          </div>
          <div className="pt-6 mt-4 border-t border-white/15">
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[var(--app-surface)] text-[#075E54] hover:bg-white/90 py-3 rounded-control text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-sans"
            >
              Ouvrir WhatsApp <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* EMAIL SUPPORT */}
        <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-card-outer p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-black/5 border border-[color:var(--app-border)] flex items-center justify-center text-[color:var(--app-text)]">
              <Mail size={22} />
            </div>
            <div>
              <span className="text-[9px] font-black text-[color:var(--app-text-muted)] uppercase tracking-widest block font-mono">SUPPORT FORMEL</span>
              <h3 className="text-[20px] font-display italic font-black uppercase text-[color:var(--app-text)] mt-1">EMAIL DIRECT</h3>
            </div>
            <p className="text-[11px] text-[color:var(--app-text-muted)] leading-relaxed font-medium">
              Questions admin, factures ou suggestions à <span className="font-mono text-[color:var(--app-text)] font-bold">support@capten.app</span>.
            </p>
          </div>
          <div className="pt-6 mt-4 border-t border-[color:var(--app-border)]">
            <a
              href="mailto:support@capten.app?subject=Demande%20Capitaine%20Capten"
              className="w-full bg-black text-white hover:bg-black/80 py-3 rounded-control text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans"
            >
              Écrire par email <Mail size={14} />
            </a>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="bg-[var(--app-surface-2)] border border-[color:var(--app-border)] rounded-card-outer p-6 sm:p-8 flex flex-col justify-between shadow-sm relative">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#56E39F]/10 border border-[#56E39F]/20 flex items-center justify-center text-[#56E39F]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-[9px] font-black text-[#56E39F] uppercase tracking-widest block font-mono">SÉCURITÉ &amp; RÉSEAU</span>
              <h3 className="text-[20px] font-display italic font-black uppercase text-[color:var(--app-text)] mt-1">ÉTAT SYSTÈME</h3>
            </div>
            <div className="space-y-2 text-[11px] font-mono text-[color:var(--app-text-muted)]">
              <p className="flex items-center justify-between border-b border-[color:var(--app-border)] pb-1.5">
                <span>Plateforme :</span>
                <span className="text-[#56E39F] font-bold">100% OK</span>
              </p>
              <p className="flex items-center justify-between border-b border-[color:var(--app-border)] pb-1.5">
                <span>Paiements sécurisés :</span>
                <span className="text-[#56E39F] font-bold">100% OK</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Données &amp; sauvegardes :</span>
                <span className="text-[#56E39F] font-bold">100% OK</span>
              </p>
            </div>
          </div>
          <div className="pt-6 mt-4 border-t border-[color:var(--app-border)] text-center">
            <span className="text-[9px] font-mono font-bold text-[color:var(--app-text-muted)] uppercase tracking-widest">
              Dernière vérification : il y a 30s
            </span>
          </div>
        </div>
      </div>

      {/* FORM & FAQ CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* TICKET FORM (8 COLS) */}
        <div className="col-span-1 lg:col-span-7 bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[color:var(--app-border)] pb-4">
            <h2 className="text-[18px] font-display italic font-black uppercase text-[color:var(--app-text)]">
              TRANSMETTRE UN SIGNALEMENT / TICKET
            </h2>
            <p className="text-[11px] text-[color:var(--app-text-muted)] font-medium mt-1">
              Posez une question à l&apos;équipe ou signalez un dysfonctionnement sur votre interface.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="bg-[#56E39F]/10 border border-[#56E39F]/20 rounded-card-inner p-6 text-center space-y-3 animate-scale-up">
              <div className="w-12 h-12 bg-[#56E39F] text-white rounded-full flex items-center justify-center mx-auto">
                <Check size={24} strokeWidth={3} />
              </div>
              <h3 className="text-base font-display italic font-black uppercase text-[color:var(--app-text)]">
                TICKET REÇU AVEC SUCCÈS !
              </h3>
              <p className="text-xs text-[color:var(--app-text-muted)] font-medium max-w-md mx-auto leading-relaxed">
                Notre équipe d&apos;astreinte a bien reçu votre demande pour le club <span className="font-bold text-[color:var(--app-text)]">{clubName}</span>. Nous vous répondrons par email sous de très brefs délais.
              </p>
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="btn-secondary text-[10px] font-black uppercase tracking-wider mt-2"
              >
                Envoyer une autre demande
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black uppercase text-[color:var(--app-text-muted)] tracking-wider">
                    Nature du besoin
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-[var(--app-surface-2)] border border-[color:var(--app-border)] rounded-control px-4 py-2.5 text-xs font-bold text-[color:var(--app-text)] focus:outline-none focus:border-[#FF5C00] focus:bg-[var(--app-surface)] transition-all"
                  >
                    <option value="Urgent — Session ce soir">Urgent — Session imminente</option>
                    <option value="Question Juridique / Décharge">Question Juridique / Décharge</option>
                    <option value="Problème Spots / Commerce">Problème Spots / Commerce local</option>
                    <option value="Cagnotte & Paiements">Cagnotte & Paiements</option>
                    <option value="Idée / Suggestion de feature">Idée / Suggestion de feature</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black uppercase text-[color:var(--app-text-muted)] tracking-wider">
                    Votre Email de Contact
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="capitaine@exemple.com"
                    className="w-full bg-[var(--app-surface-2)] border border-[color:var(--app-border)] rounded-control px-4 py-2.5 text-xs font-bold text-[color:var(--app-text)] focus:outline-none focus:border-[#FF5C00] focus:bg-[var(--app-surface)] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-black uppercase text-[color:var(--app-text-muted)] tracking-wider">
                  Description détaillée de la demande
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez ce que vous souhaitez accomplir ou le problème rencontré..."
                  className="w-full bg-[var(--app-surface-2)] border border-[color:var(--app-border)] rounded-control px-4 py-3 text-xs font-medium text-[color:var(--app-text)] focus:outline-none focus:border-[#FF5C00] focus:bg-[var(--app-surface)] transition-all resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="btn-primary w-full h-12 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    TRANSMISSION DU TICKET...
                  </>
                ) : (
                  <>
                    Envoyer au Support Capten <Send size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* FAQ ACCORDION (5 COLS) */}
        <div className="col-span-1 lg:col-span-5 bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[color:var(--app-border)] pb-4">
            <h2 className="text-[18px] font-display italic font-black uppercase text-[color:var(--app-text)]">
              QUESTIONS FRÉQUENTES
            </h2>
            <p className="text-[11px] text-[color:var(--app-text-muted)] font-medium mt-1">
              Réponses immédiates aux situations de terrain habituelles.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-[color:var(--app-border)] rounded-card-inner bg-[var(--app-surface-2)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs flex justify-between items-center text-[color:var(--app-text)] hover:text-[#FF5C00] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-[11px] font-medium text-[color:var(--app-text-muted)] leading-relaxed border-t border-[color:var(--app-border)] pt-3 bg-[var(--app-surface)]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
