"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  MapPin,
  CheckCircle2,
  Users,
  Award,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Coffee,
  HeartPulse,
  Flame,
  QrCode,
  Lock,
  Smartphone,
  Zap,
  Check,
  X,
  Compass,
  Star,
  Activity,
  UserCheck,
  Radio,
  FileCheck,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Globe,
  Play,
  RotateCcw,
  Eye,
  HelpCircle,
  ChevronLeft
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Landing Page avec Visite Guidée à Popups
   Concept : Démo pas-à-pas ultra simple avec infobulles/popups
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [tourStep, setTourStep] = useState<number>(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [membersCount, setMembersCount] = useState<number>(45);

  // Demo States
  const [demoCheckedIn, setDemoCheckedIn] = useState(false);
  const [demoIceUnlocked, setDemoIceUnlocked] = useState(false);
  const [demoSpotScanned, setDemoSpotScanned] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tourSteps = [
    {
      step: 1,
      tag: "🎯 Étape 1 sur 4",
      title: "Vérifier qui est vraiment là !",
      desc: "Quand tes coureurs arrivent au point de rendez-vous, leur téléphone vérifie automatiquement s'ils sont à moins de 100 mètres. Plus besoin de compter les têtes avec les doigts !",
      target: "gps",
      actionText: "Simuler l'arrivée d'un coureur →"
    },
    {
      step: 2,
      tag: "🩹 Étape 2 sur 4",
      title: "En cas de petit bobo ou de chute",
      desc: "Si un membre se tord la cheville, tu cliques sur son prénom et tu vois son groupe sanguin et le numéro de sa famille en 1 seconde. Tout est sécurisé !",
      target: "ice",
      actionText: "Déverrouiller le contact d'urgence →"
    },
    {
      step: 3,
      tag: "📑 Étape 3 sur 4",
      title: "Le document magique pour être tranquille",
      desc: "À la fin de chaque sortie, l'application fabrique toute seule la liste officielle avec l'heure exacte. Tu es protégé à 100% sans aucun papier à remplir !",
      target: "pdf",
      actionText: "Voir le registre fabriqué →"
    },
    {
      step: 4,
      tag: "☕ Étape 4 sur 4",
      title: "La récompense café après l'effort !",
      desc: "Après avoir bien couru ou marché, tous tes membres reçoivent un petit code sur leur téléphone pour avoir une réduction sur leur café ou jus d'orange !",
      target: "spots",
      actionText: "Débloquer le code promo →"
    }
  ];

  const currentStep = tourSteps.find(s => s.step === tourStep) || tourSteps[0];

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans antialiased selection:bg-[#FF5500]/30 selection:text-[#FF5500] overflow-x-hidden">
      
      {/* ── Google Fonts Import ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-syne { font-family: 'Syne', sans-serif; }
      `}</style>

      {/* ── Background Glow Meshes ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#FF5500]/15 via-orange-600/5 to-transparent blur-[140px] pointer-events-none z-0" />

      {/* ──────────────────────────────────────────────────────────────
         1. FLOATING GLASS NAVBAR
      ────────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3 bg-[#070709]/80 backdrop-blur-2xl border-b border-white/[0.08]" : "py-6 bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5500] to-orange-600 flex items-center justify-center text-white shadow-lg shadow-[#FF5500]/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-syne font-extrabold text-xl tracking-tight text-white leading-none">
                CAPTEN<span className="text-[#FF5500]">.</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">CREW OS</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <a href="#guided-tour" className="hover:text-white transition-colors">Comment ça marche ?</a>
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#calculator" className="hover:text-white transition-colors">Calculateur</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-xs font-bold text-zinc-400 hover:text-white transition-colors">
              Connexion
            </Link>
            <Link href="/login?mode=signup" className="relative group px-5 py-2.5 rounded-full bg-white text-black text-xs font-extrabold shadow-xl hover:bg-[#FF5500] hover:text-white transition-all duration-200 flex items-center gap-2">
              <span>Rejoindre la Bêta</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────
         2. HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 md:pt-48 md:pb-20 z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs font-bold text-zinc-300 shadow-2xl"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#FF5500] animate-ping" />
              <span className="text-white">CAPTEN 2026</span>
              <span className="text-zinc-600">•</span>
              <span className="text-[#FF5500]">Ultra Simple & Automatique</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-syne text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.02]"
            >
              Gère ton groupe sportif.<br />
              <span className="bg-gradient-to-r from-[#FF5500] via-orange-400 to-amber-400 bg-clip-text text-transparent">
                Sans aucun casse-tête.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed"
            >
              Fini les messages perdus sur WhatsApp. CAPTEN vérifie la présence de tes membres au rendez-vous et protège ton club en cas d'accident.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF5500] text-white font-extrabold text-sm shadow-xl shadow-[#FF5500]/30 hover:bg-orange-600 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#guided-tour"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.05] border border-white/10 text-white font-extrabold text-sm hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
              >
                🎈 Suivre la démo pas-à-pas ↓
              </a>
            </motion.div>

          </div>

          {/* ── HERO SHOWCASE IMAGE ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-14 max-w-5xl mx-auto relative group"
          >
            <div className="relative rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] p-1.5 border border-white/10 shadow-[0_32px_96px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/dashboard-preview.png"
                alt="Aperçu du Tableau de Bord CAPTEN"
                className="w-full h-auto rounded-[20px] shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         3. DÉMO PAS-À-PAS AVEC POPUPS INTERACTIFS (Expliqué simplement)
      ────────────────────────────────────────────────────────────── */}
      <section id="guided-tour" className="py-24 bg-gradient-to-b from-[#070709] via-[#0E0E16] to-[#070709] border-y border-white/[0.08] relative z-10">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5500] uppercase bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full border border-[#FF5500]/20 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> VISITE GUIDÉE POUR ORGANISATEUR
            </span>
            <h2 className="font-syne text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Comment ça marche ? Laisse-toi guider !
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-medium max-w-xl mx-auto">
              Suis les 4 étapes ci-dessous avec les popups interactifs pour comprendre l'application en 60 secondes.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex justify-center items-center gap-2 max-w-xl mx-auto">
            {[1, 2, 3, 4].map(s => (
              <button
                key={s}
                onClick={() => setTourStep(s)}
                className={`flex-1 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tourStep === s
                    ? "bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/30"
                    : s < tourStep
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-zinc-500 border border-white/10 hover:text-white"
                }`}
              >
                {s < tourStep ? <Check className="w-3.5 h-3.5" /> : null}
                <span>Étape {s}</span>
              </button>
            ))}
          </div>

          {/* Main Interactive Screen with Floating Explanatory Popup */}
          <div className="max-w-4xl mx-auto relative bg-[#09090E] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between">
            
            {/* FLOATING EXPLANATORY POPUP CARD */}
            <motion.div
              key={tourStep}
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white text-black p-6 rounded-2xl shadow-2xl border-2 border-[#FF5500] relative z-20 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5500] bg-orange-50 px-2.5 py-1 rounded-md">
                  {currentStep.tag}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={tourStep === 1}
                    onClick={() => setTourStep(prev => Math.max(1, prev - 1))}
                    className="p-1 rounded-md text-zinc-400 hover:text-black disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-zinc-500 font-mono">{tourStep} / 4</span>
                  <button
                    disabled={tourStep === 4}
                    onClick={() => setTourStep(prev => Math.min(4, prev + 1))}
                    className="p-1 rounded-md text-zinc-400 hover:text-black disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-syne text-lg font-bold text-black">{currentStep.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed mt-1">
                  {currentStep.desc}
                </p>
              </div>

              {/* Interactive Demo Button inside Popup */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100">
                {tourStep === 1 && (
                  <button
                    onClick={() => setDemoCheckedIn(!demoCheckedIn)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-orange-600 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    {demoCheckedIn ? "Réinitialiser le pointage" : "Tester le pointage d'un coureur →"}
                  </button>
                )}

                {tourStep === 2 && (
                  <button
                    onClick={() => setDemoIceUnlocked(!demoIceUnlocked)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <HeartPulse className="w-4 h-4" />
                    {demoIceUnlocked ? "Masquer la fiche ICE" : "Afficher la fiche médicale ICE →"}
                  </button>
                )}

                {tourStep === 3 && (
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Registre PDF fabriqué automatiquement !
                  </div>
                )}

                {tourStep === 4 && (
                  <button
                    onClick={() => setDemoSpotScanned(!demoSpotScanned)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-4 h-4" />
                    {demoSpotScanned ? "Réinitialiser le code promo" : "Débloquer la promo café -15% →"}
                  </button>
                )}

                {tourStep < 4 && (
                  <button
                    onClick={() => setTourStep(prev => prev + 1)}
                    className="text-xs font-extrabold text-black hover:text-[#FF5500] flex items-center gap-1 cursor-pointer"
                  >
                    Étape suivante <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* DEMO INTERFACE DISPLAY PREVIEW BELOW POPUP */}
            <div className="pt-6 relative z-10">
              
              {/* STEP 1 PREVIEW: GPS POINTAGE */}
              {tourStep === 1 && (
                <div className="bg-[#070709] border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                    <span>Point de Rendez-vous : Place de la République</span>
                    <span className="text-[#FF5500] font-mono">Rayon : 100 mètres</span>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                        TL
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Thomas Lefebvre</div>
                        <div className="text-[10px] text-zinc-400">Position : 14 mètres du RDV</div>
                      </div>
                    </div>

                    {demoCheckedIn ? (
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Émargé à 19:28
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        En attente d'arrivée
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2 PREVIEW: ICE MEDICAL */}
              {tourStep === 2 && (
                <div className="bg-gradient-to-r from-rose-950/20 to-zinc-900 border border-rose-500/20 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-white">
                    <span>Fiche d'Urgence Coureur : Sarah Marchand</span>
                    <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-extrabold">O+</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="text-[10px] text-zinc-400 font-bold block">CONTACT FAMILLE :</span>
                      <span className="font-mono text-white font-bold">
                        {demoIceUnlocked ? "06 11 22 33 44 (Papa)" : "06 •• •• •• •• (Masqué)"}
                      </span>
                    </div>

                    <div className="bg-amber-500/10 p-3 rounded-xl text-amber-300 font-bold">
                      ⚠️ ALLERGIE : Pénicilline
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 PREVIEW: PDF CERTIFICATE */}
              {tourStep === 3 && (
                <div className="bg-white text-black p-5 rounded-2xl text-xs font-mono space-y-2 border border-zinc-200">
                  <div className="flex justify-between items-center font-bold border-b border-zinc-200 pb-2">
                    <span>REGISTRE DE PRÉSENCE OFFICIEL #2026-42</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">CERTIFIÉ OK</span>
                  </div>
                  <div className="text-[11px] text-zinc-600">
                    • 48 coureurs émargés sous 100m • Horodatage satellite conforme assurances
                  </div>
                </div>
              )}

              {/* STEP 4 PREVIEW: SPOTS DISCOUNT */}
              {tourStep === 4 && (
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">Café du Cycliste Paris</div>
                    <div className="text-zinc-400 mt-0.5">-15% sur toutes les boissons après la sortie</div>
                  </div>

                  {demoSpotScanned ? (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono font-bold">
                      PROMO-15-OK
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold">
                      -15% Disponible
                    </span>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         4. BENTO GRID FEATURES
      ────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-36 relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5500] uppercase bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full border border-[#FF5500]/20">
              Fonctionnalités Clés
            </span>
            <h2 className="font-syne text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              Conçu pour la sécurité,<br />la simplicité et l'impact.
            </h2>
            <p className="text-base text-zinc-400 font-medium max-w-xl mx-auto">
              Chaque outil répond à un problème concret rencontré sur le terrain par les organisateurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: GPS Check-in */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 hover:border-[#FF5500]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/20 text-[#FF5500] flex items-center justify-center border border-[#FF5500]/30">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-syne text-xl font-bold text-white">Pointage Satellite GPS</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                Vérification de présence sous 100m. Aucun téléchargement d'application pour les coureurs.
              </p>
            </div>

            {/* Card 2: Medical ICE */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 hover:border-rose-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-syne text-xl font-bold text-white">Fiche d'Urgence ICE</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                Groupe sanguin, allergies et contact d'urgence consultables en 1-clic par le Capitaine.
              </p>
            </div>

            {/* Card 3: CAPTEN Spots */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 hover:border-amber-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-syne text-xl font-bold text-white">Avantages CAPTEN Spots</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                Offrez des réductions chez les commerçants et cafés de votre quartier après les sorties.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         5. TIME SAVINGS CALCULATOR (Interactive Tool)
      ────────────────────────────────────────────────────────────── */}
      <section id="calculator" className="py-24 bg-white/[0.01] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5500] uppercase bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full border border-[#FF5500]/20">
              Calculateur d'Impact
            </span>
            <h2 className="font-syne text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Combien de temps vas-tu économiser ?
            </h2>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Slider input */}
            <div className="space-y-6">
              <label className="text-sm font-bold text-zinc-300 block">
                Nombre de membres dans ton crew : <span className="text-[#FF5500] font-syne text-xl">{membersCount}</span>
              </label>
              
              <input
                type="range"
                min="10"
                max="200"
                value={membersCount}
                onChange={e => setMembersCount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
              />

              <div className="flex justify-between text-xs text-zinc-500 font-semibold">
                <span>10 membres</span>
                <span>100 membres</span>
                <span>200+ membres</span>
              </div>
            </div>

            {/* Impact Calculation */}
            <div className="space-y-4 bg-[#070709] p-6 rounded-2xl border border-white/5 text-center sm:text-left">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gain estimé par mois</div>
              
              <div className="text-4xl sm:text-5xl font-extrabold font-syne text-[#FF5500]">
                {Math.round(membersCount * 0.25)} heures <span className="text-sm font-sans font-bold text-white">économisées</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Moins de messages relances sur WhatsApp, aucun pointage manuel sur papier, et zéro stress administratif.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         6. FAQ ACCORDION
      ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 border-t border-white/[0.06] relative z-10">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5500] uppercase bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full border border-[#FF5500]/20">
              FAQ
            </span>
            <h2 className="font-syne text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Est-ce gratuit pendant la période Bêta ?",
                a: "Oui, l'accès est 100% gratuit pendant toute la période Bêta ouverte 2026. Aucune carte bancaire requise."
              },
              {
                q: "Mes membres doivent-ils télécharger une application ?",
                a: "Non. Vos membres accèdent à votre événement via un simple lien ou QR Code dans leur navigateur mobile en 30 secondes."
              },
              {
                q: "Comment sont protégées les données médicales ICE ?",
                a: "Les fiches ICE sont chiffrées au repos et ne sont accessibles que par le Capitaine lors des sessions actives, conformément au RGPD."
              },
              {
                q: "Que se passe-t-il si le réseau GPS est faible ?",
                a: "CAPTEN intègre un mode hors-ligne avec QR Code de secours pour valider les présentations même en zone blanche (trail, rando)."
              }
            ].map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 text-left font-bold text-base text-white flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
                    {activeFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-sm text-zinc-400 font-medium leading-relaxed border-t border-white/5 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         7. FINAL CTA & FOOTER
      ────────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#070709] relative overflow-hidden border-t border-white/[0.06]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF5500]/20 blur-[150px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="font-syne text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Prêt à structurer ton crew ?
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 font-medium max-w-xl mx-auto">
            Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs dès aujourd'hui.
          </p>
          <div className="pt-4">
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF5500] text-white font-extrabold text-base shadow-xl shadow-[#FF5500]/40 hover:bg-orange-600 hover:scale-105 transition-all"
            >
              Rejoindre la Bêta Gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-6 pt-24 mt-20 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-semibold">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FF5500]" />
            <span className="text-white font-bold">CAPTEN OS © 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/rgpd" className="hover:text-white transition-colors">RGPD</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
