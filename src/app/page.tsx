"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  HeartPulse,
  Coffee,
  Smartphone,
  Radio,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Exact Replica of Reference Framer Template
   Target URL: https://eternal-storm-019622.framer.app/
   Clean Upright Typography, Warm Off-White #F8F8F6, Photo Cards,
   Comparison Table with Central Floating Black Highlight Card & Warm FAQ.
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#1A1918] font-sans antialiased selection:bg-[#FF5500]/20 selection:text-[#FF5500]">
      
      {/* ── Custom Fonts & Global Styles ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { 
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          background-color: #F8F8F6;
          color: #1A1918;
        }

        .heading-font {
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────────
         1. HEADER / NAVIGATION
      ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#F8F8F6]/90 backdrop-blur-md py-4 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center text-white shadow-sm shadow-[#FF5500]/20 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-extrabold text-xl text-[#1A1918] tracking-tight">
              CAPTEN
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#666562]">
            <a href="#features" className="hover:text-[#1A1918] transition-colors">Fonctionnalités</a>
            <a href="#impact" className="hover:text-[#1A1918] transition-colors">Sécurité</a>
            <a href="#comparison" className="hover:text-[#1A1918] transition-colors">Pourquoi CAPTEN</a>
            <a href="#faq" className="hover:text-[#1A1918] transition-colors">FAQ</a>
          </nav>

          {/* Header CTA Button */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-block text-xs font-bold text-[#666562] hover:text-[#1A1918] transition-colors">
              Connexion
            </Link>
            <Link
              href="/login?mode=signup"
              className="px-5 py-2.5 rounded-full bg-[#FF5500] hover:bg-black text-white text-xs font-extrabold shadow-md shadow-[#FF5500]/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>LANCER UN RUN +</span>
            </Link>
          </div>

        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────
         2. HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          
          {/* Badge Supérieur */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFEFE9] border border-black/5 text-xs font-bold text-[#555450] shadow-sm"
          >
            <span>Le logiciel web réservé aux organisateurs de Run Clubs</span>
            <span className="text-[#999893]">•</span>
            <span className="text-[#FF5500] font-extrabold">100% Web</span>
          </motion.div>

          {/* Titre H1 (Clean Upright Sentence Case) */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-font text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] text-[#1A1918] max-w-3xl mx-auto"
          >
            Tu as créé ce crew pour partager une passion.<br />
            <span className="text-[#FF5500]">Pas pour jouer les secrétaires.</span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#666562] font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Automatise ton registre de présence, centralise les fiches d'urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n'ont rien à installer, tu gères tout depuis ton espace.
          </motion.p>

          {/* CTAs Hero (Rounded Pills) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/login?mode=signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FF5500] hover:bg-black text-white font-extrabold text-xs shadow-lg shadow-[#FF5500]/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Lancer mon crew →</span>
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-neutral-300 text-[#1A1918] font-bold text-xs hover:bg-neutral-100 transition-all text-center"
            >
              Voir les fonctionnalités
            </a>
          </motion.div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         3. HERO PHOTO CARDS (Le Cauchemar vs Le Risque)
      ────────────────────────────────────────────────────────────── */}
      <section id="impact" className="pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Carte 1 : Le Cauchemar Logistique */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[28px] overflow-hidden min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-8 text-white shadow-xl group border border-black/5"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('/assets/running_action.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              {/* Badge Puce '1' / Icon */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-sm">
                ⚓
              </div>

              {/* Contenu Bas */}
              <div className="relative z-10 space-y-2">
                <h3 className="heading-font text-2xl font-bold text-white">
                  Le cauchemar logistique
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                  Les minutes précieuses perdues au départ à compter les têtes, les relances manuelles sur WhatsApp et l'absence de fiches d'urgence médicales quand un coureur fait une mauvaise chute.
                </p>
              </div>
            </motion.div>

            {/* Carte 2 : Le Risque Juridique */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="relative rounded-[28px] overflow-hidden min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-8 text-white shadow-xl group border border-black/5"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('/assets/runners_trail.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              {/* Badge Puce '2' / Icon */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-sm">
                ⚖️
              </div>

              {/* Contenu Bas */}
              <div className="relative z-10 space-y-2">
                <h3 className="heading-font text-2xl font-bold text-white">
                  Le risque juridique
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                  Organiser un groupe sur la voie publique implique votre responsabilité en cas d'accident. Sans registre d'émargement officiel ni décharge, vous restez sans protection légale.
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         4. FEATURE SECTION ("La sérénité d'un club pro...")
      ────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-32 bg-white border-y border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF5500] bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full">
              SÉRÉNITÉ & AUTONOMIE
            </span>

            <h2 className="heading-font text-3xl sm:text-5xl font-extrabold text-[#1A1918] leading-[1.1]">
              La sérénité d'un club pro.<br />La liberté d'un crew informel.
            </h2>

            <p className="text-sm sm:text-base text-[#666562] font-medium leading-relaxed max-w-2xl mx-auto">
              Centralise tes sorties, réjouis tes membres et génère des revenus pour ton club. Tout est automatisé, tes membres n'ont pas à télécharger la moindre application pour venir.
            </p>

            <div className="pt-2">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FF5500] hover:bg-black text-white text-xs font-extrabold shadow-md shadow-[#FF5500]/25 transition-all"
              >
                <span>Lancer mon crew →</span>
              </Link>
            </div>
          </div>

          <p className="text-base sm:text-xl font-bold text-[#1A1918] leading-relaxed max-w-3xl mx-auto pt-6 border-t border-neutral-100">
            Automatise ton registre de présence, centralise les fiches d'urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n'ont rien à installer, tu gères tout depuis ton espace.
          </p>

          {/* 3 COLUMNS FEATURE LIST */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 text-left">
            
            {/* Feature 1 */}
            <div className="space-y-3 p-6 bg-[#F8F8F6] rounded-[24px] border border-black/5">
              <div className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">01. Revenus</div>
              <h3 className="heading-font text-lg font-bold text-[#1A1918]">
                10% de commission automatiquement
              </h3>
              <p className="text-xs text-[#666562] font-medium leading-relaxed">
                Touche de la commission automatiquement quand tes membres vont consommer chez les cafés partenaires.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-3 p-6 bg-[#F8F8F6] rounded-[24px] border border-black/5">
              <div className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">02. Présence</div>
              <h3 className="heading-font text-lg font-bold text-[#1A1918]">
                Check-in GPS instantané
              </h3>
              <p className="text-xs text-[#666562] font-medium leading-relaxed">
                Valide la présence de tes membres au point de RDV via leur position géolocalisée quand ils sont sous un rayon paramétrable.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-3 p-6 bg-[#F8F8F6] rounded-[24px] border border-black/5">
              <div className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">03. Sécurité</div>
              <h3 className="heading-font text-lg font-bold text-[#1A1918]">
                Fiche Santé / ICE
              </h3>
              <p className="text-xs text-[#666562] font-medium leading-relaxed">
                Chaque membre enregistre son groupe sanguin et son contact d'urgence disponible 1-clic pendant les sessions.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         5. COMPARISON TABLE ("Pourquoi CAPTEN") WITH FLOATING BLACK HIGHLIGHT CARD
      ────────────────────────────────────────────────────────────── */}
      <section id="comparison" className="py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          
          {/* Main Box : Warm Off-White / Beige Container */}
          <div className="bg-[#EFEFE9] rounded-[32px] p-6 sm:p-12 border border-black/5 space-y-10 relative">
            
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="heading-font text-3xl sm:text-5xl font-extrabold text-[#1A1918]">
                Pourquoi CAPTEN
              </h2>
              <p className="text-xs sm:text-sm text-[#666562] font-medium leading-relaxed">
                CAPTEN est le premier logiciel supersportif spécialement pensé pour la gestion des crews. Il remplace WhatsApp pour la logistique et centralise tout ce qui est vraiment utile pour vos membres.
              </p>
            </div>

            {/* Comparison Grid & Overlay Container */}
            <div className="relative pt-4">
              
              {/* Background Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-4 border-b border-black/10 text-xs font-bold text-[#666562] uppercase tracking-wider">
                  <span>Fonctionnalités du système</span>
                  <span className="pr-4 sm:pr-8">WhatsApp seul</span>
                </div>

                {[
                  "Informations d'urgence accessibles en 1-clic",
                  "Vérification du rôle et présence au lieu par GPS",
                  "Rapports de commissions mensuels des commerçants",
                  "Recommandations de sécurité sur le trajet",
                  "100% Web (0 application à installer)",
                  "Téléchargement du registre de présence en PDF",
                  "10% de commission sur la consommation café"
                ].map((rowText, rIdx) => (
                  <div key={rIdx} className="bg-[#E4E4DC] p-4 rounded-xl flex justify-between items-center text-xs sm:text-sm font-medium text-[#1A1918]">
                    <span className="pr-4">{rowText}</span>
                    <span className="pr-6 sm:pr-10 text-neutral-400 font-bold">✕</span>
                  </div>
                ))}
              </div>

              {/* FLOATING BLACK CARD OVERLAY IN THE CENTER */}
              <div className="w-full md:w-[320px] lg:w-[360px] md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mt-6 md:mt-0 bg-[#181716] text-white rounded-[28px] p-6 sm:p-8 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10 z-20">
                
                {/* Logo top */}
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5500] flex items-center justify-center">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <span className="font-extrabold text-sm text-white tracking-wider">CAPTEN OS</span>
                </div>

                {/* 7 Checkmarks List */}
                <div className="space-y-3 text-xs font-medium text-neutral-200">
                  {[
                    "Informations d'urgence",
                    "Vérification GPS",
                    "Rapports commissions",
                    "Recommandations",
                    "100% Web (0 app)",
                    "Registre PDF certifié",
                    "10% commission café"
                  ].map((cText, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✓
                      </div>
                      <span>{cText}</span>
                    </div>
                  ))}
                </div>

                {/* Pill Button at bottom */}
                <div className="pt-2">
                  <Link
                    href="/login?mode=signup"
                    className="w-full py-3.5 rounded-full bg-white text-[#1A1918] hover:bg-[#FF5500] hover:text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Lancer mon crew →</span>
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         6. FAQ SECTION & ACCORDION
      ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-32 bg-white border-y border-neutral-200">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Left Column : Title & Subtitle */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF5500] bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full">
                FAITES LE PREMIER PAS
              </span>

              <h2 className="heading-font text-3xl sm:text-5xl font-extrabold text-[#1A1918] leading-[1.1]">
                Des réponses simples à toutes vos questions
              </h2>

              <p className="text-xs sm:text-sm text-[#666562] font-medium leading-relaxed">
                Les réponses aux questions les plus fréquentes proposées par les capitaines.
              </p>
            </div>

            {/* Right Column : 5 Beige Accordion Cards (#EFEFE9) */}
            <div className="md:col-span-7 space-y-3">
              {[
                {
                  q: "Est-ce que mes membres doivent créer un compte sur le logiciel ?",
                  a: "Non. Vos membres n'ont aucun compte à créer ni application à télécharger. Ils scannent le QR code du run ou cliquent sur le lien WhatsApp pour renseigner leur fiche et émarger en 30 secondes."
                },
                {
                  q: "Comment fonctionne la collecte des fiches d'urgence ?",
                  a: "Lors de leur première inscription à un run, le membre saisit son contact ICE (Emergency) et ses informations médicales. Ces données sont chiffrées et consultables uniquement par le Capitaine en session active."
                },
                {
                  q: "Comment suivre l'argent généré par CAPTEN Spots ?",
                  a: "Votre dashboard affiche en temps réel les commissions générées par vos membres chez les commerçants partenaires. Les fonds sont versés chaque mois sur votre compte ou cagnotte de club."
                },
                {
                  q: "Si un membre a un problème de réseau ou plus de batterie au RDV, ça bloque son registre ?",
                  a: "Non. Le Capitaine dispose d'une fonction d'émargement manuel 1-clic depuis son propre dashboard pour valider un coureur en cas d'imprévu."
                },
                {
                  q: "L'agrément, qui est responsable en cas d'accident, passion ou run ?",
                  a: "CAPTEN génère un registre d'émargement certifié et une décharge de responsabilité numérique signée par chaque membre, attestant qu'il participe sous sa propre responsabilité civile."
                }
              ].map((faq, fIdx) => (
                <div key={fIdx} className="bg-[#EFEFE9] rounded-[20px] overflow-hidden border border-black/5">
                  <button
                    onClick={() => toggleFaq(fIdx)}
                    className="w-full p-5 text-left font-bold text-xs sm:text-sm text-[#1A1918] flex items-center justify-between gap-4 hover:bg-[#EAEAE3] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center shrink-0 text-[#1A1918]">
                      {openFaq === fIdx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openFaq === fIdx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 text-xs text-[#666562] font-medium leading-relaxed border-t border-black/5 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         7. FOOTER BANNER & FOOTER BAR
      ────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          
          {/* Black Banner Box (#181716) */}
          <div className="bg-[#181716] text-white rounded-[32px] p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="heading-font text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                TON CREW MÉRITE MIEUX QU'UN SIMPLE FIL WHATSAPP.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
                Automatise la gestion de tes sorties dès aujourd'hui et offre une vraie expérience professionnelle à tes membres.
              </p>
              <div className="pt-4">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FF5500] hover:bg-white hover:text-black text-white font-extrabold text-xs shadow-lg shadow-[#FF5500]/25 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Créer mon espace organisateur →</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Bar Links */}
          <footer className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-black/10 text-xs font-bold text-[#666562]">
            
            {/* Logo left */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#FF5500] flex items-center justify-center text-white text-[10px]">
                <Zap className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="text-[#1A1918] font-extrabold">CAPTEN</span>
            </div>

            {/* Center / Right Links */}
            <div className="flex items-center gap-8">
              <div className="space-x-3">
                <span className="text-[#1A1918] font-extrabold">CONTACT</span>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#1A1918] transition-colors">Instagram</a>
              </div>
              <div className="space-x-4">
                <span className="text-[#1A1918] font-extrabold">LÉGAL</span>
                <Link href="/rgpd" className="hover:text-[#1A1918] transition-colors">Politique de confidentialité</Link>
                <Link href="/cgu" className="hover:text-[#1A1918] transition-colors">Conditions d'utilisation</Link>
              </div>
            </div>

          </footer>

        </div>
      </section>

    </div>
  );
}
