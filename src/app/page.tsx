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
  ChevronLeft,
  MessageCircle,
  Volume2
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Landing Page avec VRAI Popup Modal Flottant
   Un vrai modal popup interactif s'ouvre au premier plan avec sombre backdrop
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [membersCount, setMembersCount] = useState<number>(45);

  // Interactive Demo States inside Popup Modal
  const [modalGpsDone, setModalGpsDone] = useState(false);
  const [modalIceUnlocked, setModalIceUnlocked] = useState(false);
  const [modalSpotScanned, setModalSpotScanned] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const popupData = [
    {
      step: 1,
      tag: "🎯 POPUP 1 SUR 4 • LE POINTAGE GPS",
      title: "Comment savoir qui est là au rendez-vous ?",
      desc: "C'est super simple ! Quand tes coureurs arrivent sur le lieu de rendez-vous, leur téléphone vérifie tout seul s'ils sont à moins de 100 mètres. Plus besoin de compter les têtes avec les doigts !",
      icon: MapPin
    },
    {
      step: 2,
      tag: "🩹 POPUP 2 SUR 4 • LA FICHE D'URGENCE ICE",
      title: "En cas de petite chute ou de bobo ?",
      desc: "Si un membre se tord la cheville, tu n'as pas besoin de paniquer. Tu touches son prénom sur ton écran et tu vois son groupe sanguin et le numéro de sa famille en 1 seconde !",
      icon: HeartPulse
    },
    {
      step: 3,
      tag: "📑 POPUP 3 SUR 4 • LE REGISTRE MAGIQUE",
      title: "Le document certifié pour être tranquille",
      desc: "À la fin de la sortie, CAPTEN fabrique une liste officielle imprimable avec l'heure exacte. Tu es 100% protégé auprès des assurances sans aucun papier !",
      icon: FileCheck
    },
    {
      step: 4,
      tag: "☕ POPUP 4 SUR 4 • LE CAFÉ / CHOCOLAT CHAUD",
      title: "La récompense après l'effort !",
      desc: "Après avoir bien couru ou marché, tous tes membres reçoivent un petit code sur leur téléphone pour avoir une réduction (-15%) sur leur café chez le commerçant du quartier !",
      icon: Coffee
    }
  ];

  const currentPopupData = popupData.find(p => p.step === activeStep) || popupData[0];

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
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "py-3 bg-[#070709]/80 backdrop-blur-2xl border-b border-white/[0.08]" : "py-6 bg-transparent"}`}>
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
            <button onClick={() => { setShowPopupModal(true); setActiveStep(1); }} className="hover:text-white transition-colors cursor-pointer text-[#FF5500] font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Lancer les Popups
            </button>
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
              <button
                onClick={() => { setShowPopupModal(true); setActiveStep(1); }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF5500] text-white font-extrabold text-sm shadow-xl shadow-[#FF5500]/40 hover:bg-orange-600 hover:scale-105 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                Ouvrir la Démo à Popups (Visite Guidée)
              </button>
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.05] border border-white/10 text-white font-extrabold text-sm hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
              >
                Créer un compte gratuit →
              </Link>
            </motion.div>

          </div>

          {/* ── HERO SHOWCASE IMAGE ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-14 max-w-5xl mx-auto relative group cursor-pointer"
            onClick={() => { setShowPopupModal(true); setActiveStep(1); }}
          >
            <div className="relative rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] p-1.5 border border-white/10 shadow-[0_32px_96px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/dashboard-preview.png"
                alt="Aperçu du Tableau de Bord CAPTEN"
                className="w-full h-auto rounded-[20px] shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
              
              {/* Overlay Prompt to Click */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-[#FF5500] text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Cliquez pour lancer les popups interactifs !
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         3. VRAI POPUP MODAL INTERACTIF (FLOATING OVERLAY WITH BACKDROP)
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPopupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            
            {/* DARK BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopupModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* FLOATING POPUP WINDOW */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 bg-white text-black rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_32px_96px_rgba(0,0,0,0.9)] border-4 border-[#FF5500] space-y-6 overflow-hidden"
            >
              {/* Top Bar inside Popup */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5500] block">
                      {currentPopupData.tag}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 font-mono">
                      Visite Guidée Organisateurs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-zinc-400 font-mono bg-zinc-100 px-2.5 py-1 rounded-lg">
                    {activeStep} / 4
                  </span>
                  <button
                    onClick={() => setShowPopupModal(false)}
                    className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Popup Title & Child-Friendly Explanation */}
              <div className="space-y-2">
                <h3 className="font-syne text-xl sm:text-2xl font-black text-black leading-tight flex items-center gap-2">
                  <currentPopupData.icon className="w-6 h-6 text-[#FF5500] shrink-0" />
                  {currentPopupData.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                  {currentPopupData.desc}
                </p>
              </div>

              {/* POPUP INTERACTIVE SANDBOX DEMO */}
              <div className="bg-zinc-900 text-white rounded-2xl p-5 border border-zinc-800 space-y-3">
                
                {activeStep === 1 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-zinc-300 flex justify-between">
                      <span>Lieu : Place de la République</span>
                      <span className="text-[#FF5500] font-mono">Précision : 100m</span>
                    </div>

                    {modalGpsDone ? (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-1">
                        <div className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Thomas Lefebvre est Émargé ! (14m du RDV)
                        </div>
                        <div className="text-[10px] text-zinc-300">Horodatage : 19:28:14 • Signal GPS Fort</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setModalGpsDone(true)}
                        className="w-full py-3 rounded-xl bg-[#FF5500] hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        Appuie ici pour simuler l'arrivée d'un coureur →
                      </button>
                    )}
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-white flex justify-between">
                      <span>Profil Coureur : Sarah Marchand</span>
                      <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-extrabold">O+</span>
                    </div>

                    {modalIceUnlocked ? (
                      <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl space-y-1 text-xs">
                        <div className="font-bold text-white">📞 Contact Urgence : 06 11 22 33 44 (Papa)</div>
                        <div className="text-amber-300 font-bold text-[11px]">⚠️ Allergie : Pénicilline</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setModalIceUnlocked(true)}
                        className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <HeartPulse className="w-4 h-4" />
                        Appuie ici pour voir le numéro du Papa/Maman →
                      </button>
                    )}
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="bg-white text-black p-4 rounded-xl text-xs font-mono space-y-1 border border-zinc-200">
                    <div className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> REGISTRE DE PRÉSENCE CERTIFIÉ #2026-42
                    </div>
                    <div className="text-[11px] text-zinc-600">
                      • 48 membres valides sous 100m • Horodatage satellite imprimable en 1-clic.
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-amber-400 flex justify-between">
                      <span>Café du Cycliste Paris</span>
                      <span>-15% après le run</span>
                    </div>

                    {modalSpotScanned ? (
                      <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-center text-xs font-mono font-bold text-amber-300">
                        CODE SCANNE : PROMO-15-OK
                      </div>
                    ) : (
                      <button
                        onClick={() => setModalSpotScanned(true)}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Coffee className="w-4 h-4" />
                        Appuie ici pour débloquer le code café →
                      </button>
                    )}
                  </div>
                )}

              </div>

              {/* Bottom Navigation Buttons inside Popup */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-xs disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>

                {activeStep < 4 ? (
                  <button
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg shadow-[#FF5500]/30 transition-all cursor-pointer flex items-center gap-1"
                  >
                    Popup Suivant (Étape {activeStep + 1}) <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPopupModal(false)}
                    className="px-6 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    Terminer la visite ✓
                  </button>
                )}
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

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
                  className="w-full p-6 text-left font-bold text-[#FFFFFF] flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors"
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
