"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  X,
  Check,
  ChevronDown,
  Plus,
  Minus,
  MapPin,
  HeartPulse,
  Coffee,
  Smartphone,
  ShieldCheck,
  Radio,
  FileCheck,
  TrendingUp,
  Users,
  Award,
  Download,
  AlertTriangle
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Landing Page Redesign
   Aesthetic: SaaS Clean Light (#F4F5F7 canvas, white 24px rounded cards)
   100% faithful to reference screenshot (eternal-storm-019622.framer.app)
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#121211] font-sans antialiased selection:bg-[#FF5500]/20 selection:text-[#FF5500]">
      
      {/* ── Custom Typography Imports ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800;1,900&display=swap');
        
        body { 
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; 
          background-color: #F4F5F7;
        }

        .font-headline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-style: italic;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: -0.03em;
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────────
         HEADER / NAVIGATION
      ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#F4F5F7]/90 backdrop-blur-md border-b border-black/5 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF5500] flex items-center justify-center text-white shadow-md shadow-[#FF5500]/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="font-headline text-2xl text-[#121211] tracking-tight">
              CAPTEN<span className="text-[#FF5500]">.</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#6B7280]">
            <a href="#features" className="hover:text-[#121211] transition-colors">Fonctionnalités</a>
            <a href="#impact" className="hover:text-[#121211] transition-colors">Sécurité</a>
            <a href="#comparison" className="hover:text-[#121211] transition-colors">Pourquoi CAPTEN</a>
            <a href="#faq" className="hover:text-[#121211] transition-colors">FAQ</a>
          </nav>

          {/* Header Action Button */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-block text-xs font-bold text-[#6B7280] hover:text-[#121211] transition-colors px-3 py-2">
              Connexion
            </Link>
            <Link
              href="/login?mode=signup"
              className="px-5 py-2.5 rounded-full bg-[#FF5500] hover:bg-black text-white text-xs font-extrabold shadow-lg shadow-[#FF5500]/25 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>LANCER UN RUN +</span>
            </Link>
          </div>

        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────
         BLOC 1 : HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section className="pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          
          {/* Badge Supérieur */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-bold text-[#121211] shadow-sm"
          >
            <span className="text-[#FF5500]">⚡</span>
            <span>Le logiciel web réservé aux organisateurs de Run Clubs</span>
            <span className="text-[#6B7280] font-normal">• 100% Web</span>
          </motion.div>

          {/* Titre H1 */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] text-[#121211] max-w-4xl mx-auto"
          >
            TU AS CRÉÉ CE CREW POUR PARTAGER UNE PASSION.<br />
            <span className="text-[#FF5500]">PAS POUR JOUER LES SECRÉTAIRES.</span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-[#6B7280] font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Automatise ton registre de présence, centralise les fiches d'urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n'ont rien à installer.
          </motion.p>

          {/* CTAs Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/login?mode=signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF5500] hover:bg-black text-white font-extrabold text-sm shadow-xl shadow-[#FF5500]/30 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Lancer mon crew →</span>
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-neutral-300 text-[#121211] font-bold text-sm hover:bg-neutral-100 transition-all text-center"
            >
              Voir les fonctionnalités
            </a>
          </motion.div>

          {/* Visuel Hero : Capture d'Écran Dashboard SaaS */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-10 max-w-5xl mx-auto"
          >
            <div className="bg-white p-3 sm:p-4 rounded-[28px] border border-neutral-200 shadow-2xl shadow-black/5 relative overflow-hidden group">
              
              {/* Dashboard Preview Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/dashboard-preview.png"
                alt="Tableau de Bord CAPTEN - Le Hub du Crew"
                className="w-full h-auto rounded-[20px] border border-neutral-100 shadow-sm transition-transform duration-500 group-hover:scale-[1.005]"
              />

              {/* Floating Real-Time Indicator Tag */}
              <div className="absolute top-8 right-8 bg-[#121211] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border border-white/10 hidden sm:flex">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>COCKPIT AUTOMATISÉ LIVE</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         BLOC 2 : URGENCE & SÉCURITÉ (Cartes d'Impact avec photos)
      ────────────────────────────────────────────────────────────── */}
      <section id="impact" className="py-16 md:py-24 bg-white border-y border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5500] bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full">
              Sécurité & Responsabilité
            </span>
            <h2 className="font-headline text-3xl sm:text-5xl font-extrabold text-[#121211]">
              À 19H30 SUR LE TROTTOIR, L'AMATEURISME DEVIENT UN RISQUE.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Carte 1 : Le Cauchemar Logistique */}
            <div className="relative rounded-[24px] overflow-hidden min-h-[360px] flex flex-col justify-between p-8 text-white shadow-lg group">
              {/* Photo de fond avec overlay dégradé */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('/assets/running_action.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

              {/* Badge Puce '1' */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-sm">
                1
              </div>

              {/* Contenu bas */}
              <div className="relative z-10 space-y-2">
                <h3 className="font-headline text-2xl font-bold uppercase text-white">
                  Le cauchemar logistique
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                  Les minutes précieuses perdues au départ à compter les têtes, les relances manuelles sur WhatsApp et l'absence de fiches d'urgence médicales quand un coureur fait une mauvaise chute.
                </p>
              </div>
            </div>

            {/* Carte 2 : Le Risque Juridique */}
            <div className="relative rounded-[24px] overflow-hidden min-h-[360px] flex flex-col justify-between p-8 text-white shadow-lg group">
              {/* Photo de fond avec overlay dégradé */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('/assets/runners_trail.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

              {/* Badge Puce '2' */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-sm">
                2
              </div>

              {/* Contenu bas */}
              <div className="relative z-10 space-y-2">
                <h3 className="font-headline text-2xl font-bold uppercase text-white">
                  Le risque juridique
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                  Organiser un groupe sur la voie publique implique votre responsabilité en cas d'accident. Sans registre d'émargement officiel ni décharge, vous restez sans protection légale.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         BLOC 3 : BENTO GRID (4 Fonctionnalités)
      ────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl sm:text-5xl font-extrabold text-[#121211] leading-tight">
              LA SÉRÉNITÉ D'UN CLUB PRO. LA LIBERTÉ D'UN CREW INFORMEL.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium leading-relaxed">
              Centralise tes sorties, réjouis tes membres et génère des revenus pour ton club. Tout est automatisé, tes membres n'ont pas à télécharger la moindre application pour venir.
            </p>

            <div className="pt-2">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FF5500] hover:bg-black text-white text-xs font-extrabold shadow-lg shadow-[#FF5500]/25 transition-all"
              >
                <span>Lancer mon crew →</span>
              </Link>
            </div>
          </div>

          {/* Grille 2x2 de cartes blanches avec icônes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature 1: Check-in GPS */}
            <div className="bg-white border border-neutral-200 rounded-[24px] p-8 space-y-4 shadow-sm hover:shadow-md hover:border-[#FF5500]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center font-bold">
                <Radio className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">Pointage Automatique</div>
                <h3 className="font-headline text-xl font-bold text-[#121211]">Check-in GPS instantané</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280] font-medium leading-relaxed">
                Validation automatique des membres arrivés au point de rendez-vous sous 100m. Horodatage officiel certifié pour l'assurance du club.
              </p>
            </div>

            {/* Feature 2: Fiche Santé / ICE */}
            <div className="bg-white border border-neutral-200 rounded-[24px] p-8 space-y-4 shadow-sm hover:shadow-md hover:border-[#FF5500]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-rose-500 uppercase tracking-wider">Urgence Médicale</div>
                <h3 className="font-headline text-xl font-bold text-[#121211]">Base de données Santé / ICE</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280] font-medium leading-relaxed">
                Chaque membre renseigne son groupe sanguin, ses allergies et son contact d'urgence. Accessibilité 1-clic réservée au Capitaine en session.
              </p>
            </div>

            {/* Feature 3: Commissions Spots */}
            <div className="bg-white border border-neutral-200 rounded-[24px] p-8 space-y-4 shadow-sm hover:shadow-md hover:border-[#FF5500]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Coffee className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Revenus Partenaires</div>
                <h3 className="font-headline text-xl font-bold text-[#121211]">Commissions Spots (10 %)</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280] font-medium leading-relaxed">
                Transforme l'après-run en revenu. Touche 10% de commission automatiquement sur les consommations de tes membres chez tes commerçants partenaires.
              </p>
            </div>

            {/* Feature 4: 100% Web */}
            <div className="bg-white border border-neutral-200 rounded-[24px] p-8 space-y-4 shadow-sm hover:shadow-md hover:border-[#FF5500]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Zéro Friction</div>
                <h3 className="font-headline text-xl font-bold text-[#121211]">100 % Web (0 application)</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280] font-medium leading-relaxed">
                Aucune application à télécharger pour tes membres. Tout s'effectue directement depuis leur navigateur mobile via QR code ou lien WhatsApp.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         BLOC 4 : TABLEAU COMPARATIF (La Carte Flottante)
      ────────────────────────────────────────────────────────────── */}
      <section id="comparison" className="py-20 md:py-32 bg-white border-y border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl sm:text-6xl font-extrabold text-[#121211]">
              POURQUOI CAPTEN ?
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium leading-relaxed">
              CAPTEN est le premier logiciel supersportif spécialement pensé pour la gestion des crews. Il remplace WhatsApp pour la logistique et centralise tout ce qui est vraiment utile pour vos membres.
            </p>
          </div>

          {/* Tableau de Comparaison avec CARTE FLOTTANTE SUPERPOSÉE */}
          <div className="relative pt-6">
            
            {/* Le Tableau de Fond (Gris/Beige) */}
            <div className="bg-[#EAEAE4] rounded-[28px] p-6 sm:p-10 border border-neutral-300">
              
              {/* En-tête Tableau */}
              <div className="grid grid-cols-2 pb-6 border-b border-neutral-300/60 text-xs font-bold uppercase tracking-wider">
                <div className="text-[#121211]">Fonctionnalités du système</div>
                <div className="text-right text-[#6B7280] pr-4 sm:pr-8">WhatsApp Seul</div>
              </div>

              {/* Lignes du Tableau */}
              <div className="divide-y divide-neutral-300/50 text-xs sm:text-sm font-semibold">
                {[
                  "Informations d'urgence accessibles en 1-clic",
                  "Vérification du rôle et présence au lieu par GPS",
                  "Rapports de commissions mensuels des commerçants",
                  "Recommandations de sécurité sur le trajet",
                  "100% Web (0 application à installer)",
                  "Téléchargement du registre de présence en PDF",
                  "10% de commission sur la consommation café"
                ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 py-4 items-center">
                    <div className="text-[#121211] pr-4">{item}</div>
                    <div className="text-right pr-6 sm:pr-10 text-neutral-400">
                      <span className="inline-block w-5 h-5 rounded-full bg-neutral-300/60 text-neutral-500 text-center leading-5 text-xs">✕</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* LA CARTE NOIRE FLOTTANTE SUPERPOSÉE AU MILIEU */}
            <div className="w-full md:w-[320px] lg:w-[360px] md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mt-6 md:mt-0 bg-[#121211] text-white rounded-[24px] p-6 sm:p-8 space-y-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 z-20">
              
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-[#FF5500] flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <span className="font-headline text-lg italic text-white">CAPTEN PRO</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm font-semibold">
                {[
                  "Centralisé sur le dashboard",
                  "Validation GPS temps réel",
                  "100 % Web (SaaS)",
                  "10 % reversés sur les cafés",
                  "Registre officiel certifié PDF"
                ].map((checkItem, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{checkItem}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/login?mode=signup"
                  className="w-full py-3.5 rounded-full bg-[#FF5500] hover:bg-white hover:text-black text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Lancer mon crew →
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         BLOC 5 : FAQ & FOOTER
      ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Colonne gauche : Titre FAQ */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF5500] bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full">
                FAQ & Aide
              </span>
              <h2 className="font-headline text-3xl sm:text-5xl font-extrabold text-[#121211] leading-tight">
                DES RONSES SIMPLES À TOUTES VOS QUESTIONS
              </h2>
              <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
                Les réponses aux questions les plus fréquentes proposées par les capitaines de clubs.
              </p>
            </div>

            {/* Colonne droite : Accordéon FAQ */}
            <div className="md:col-span-7 space-y-4">
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
              ].map((faqItem, fIdx) => (
                <div key={fIdx} className="bg-white border border-neutral-200 rounded-[20px] overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleFaq(fIdx)}
                    className="w-full p-6 text-left font-bold text-sm sm:text-base text-[#121211] flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                  >
                    <span>{faqItem.q}</span>
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-[#121211]">
                      {openFaq === fIdx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openFaq === fIdx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6 text-xs sm:text-sm text-[#6B7280] font-medium leading-relaxed border-t border-neutral-100 pt-4"
                      >
                        {faqItem.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>

          {/* BANNIÈRE FINALE FOOTER */}
          <div className="bg-[#121211] text-white rounded-[28px] p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="font-headline text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                TON CREW MÉRITE MIEUX QU'UN SIMPLE FIL WHATSAPP.
              </h2>
              <p className="text-xs sm:text-base text-neutral-400 font-medium leading-relaxed">
                Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs dès aujourd'hui.
              </p>
              <div className="pt-4">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF5500] hover:bg-white hover:text-black text-white font-extrabold text-sm shadow-xl shadow-[#FF5500]/30 transition-all active:scale-95"
                >
                  <span>Créer mon espace organisateur →</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER LIENS & COPYRIGHT */}
      <footer className="bg-white border-t border-neutral-200 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-[#6B7280]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#FF5500] flex items-center justify-center text-white text-[10px]">
              ⚡
            </div>
            <span className="text-[#121211] font-extrabold">CAPTEN SaaS © 2026</span>
          </div>

          <div className="flex gap-6">
            <Link href="/cgu" className="hover:text-[#121211] transition-colors">CGU</Link>
            <Link href="/rgpd" className="hover:text-[#121211] transition-colors">Politique de confidentialité</Link>

            <Link href="/mentions-legales" className="hover:text-[#121211] transition-colors">Mentions Légales</Link>
            <Link href="/support" className="hover:text-[#121211] transition-colors">Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
