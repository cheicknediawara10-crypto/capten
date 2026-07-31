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
  PhoneCall,
  Sparkle
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Ultimate Interactive iPhone 15 Pro Product Tour
   Simulateur iPhone 15 Pro interactif en direct sur la Landing Page
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [phoneScreen, setPhoneScreen] = useState<"checkin" | "ice" | "spots">("checkin");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [membersCount, setMembersCount] = useState<number>(45);

  // Phone Simulation States
  const [phoneCheckinDone, setPhoneCheckinDone] = useState(false);
  const [phoneIceUnlocked, setPhoneIceUnlocked] = useState(false);
  const [phoneSpotScanned, setPhoneSpotScanned] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div className="fixed top-[600px] right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] pointer-events-none z-0" />

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
            <a href="#phone-simulator" className="hover:text-white transition-colors">Démo iPhone Live</a>
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
                href="#phone-simulator"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.05] border border-white/10 text-white font-extrabold text-sm hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
              >
                📱 Tester l'application sur iPhone ↓
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
         3. SIMULATEUR IPHONE 15 PRO INTERACTIF EN DIRECT
      ────────────────────────────────────────────────────────────── */}
      <section id="phone-simulator" className="py-24 bg-gradient-to-b from-[#070709] via-[#0C0C14] to-[#070709] border-y border-white/[0.08] relative z-10">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5500] uppercase bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full border border-[#FF5500]/20 inline-flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#FF5500]" /> SIMULATEUR IPHONE LIVE
            </span>
            <h2 className="font-syne text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Essayez CAPTEN directement sur iPhone !
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-medium max-w-xl mx-auto">
              Touchez les boutons de l'écran iPhone ci-dessous pour tester l'application mobile en temps réel.
            </p>
          </div>

          {/* Phone Screen Selector Tabs */}
          <div className="flex justify-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 max-w-md mx-auto">
            {[
              { id: "checkin", label: "1. Pointage GPS", icon: MapPin },
              { id: "ice", label: "2. Fiche ICE", icon: HeartPulse },
              { id: "spots", label: "3. Code Café", icon: Coffee },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPhoneScreen(tab.id as any)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  phoneScreen === tab.id
                    ? "bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* REALISTIC IPHONE 15 PRO FRAME MOCKUP */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* LEFT COLUMN: GUIDANCE BUBBLES FOR ORGANIZER (12-year-old style) */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                
                {phoneScreen === "checkin" && (
                  <motion.div
                    key="checkin-bubble"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 bg-white text-black p-6 rounded-3xl shadow-2xl border-2 border-[#FF5500]"
                  >
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#FF5500] bg-orange-50 px-2.5 py-1 rounded-md w-fit">
                      🎯 Étape 1 : Le Pointage Automatique
                    </div>
                    <h3 className="font-syne text-xl font-bold text-black">
                      Comment savoir qui est présent au rendez-vous ?
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                      Quand tes coureurs arrivent sur place, ils appuient sur le bouton orange sur leur écran. Le satellite vérifie qu'ils sont bien là (à moins de 100m) et les coche tout seul !
                    </p>
                    <div className="pt-2 text-xs font-bold text-[#FF5500] flex items-center gap-1">
                      👉 Touche le bouton orange sur l'écran de l'iPhone !
                    </div>
                  </motion.div>
                )}

                {phoneScreen === "ice" && (
                  <motion.div
                    key="ice-bubble"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 bg-white text-black p-6 rounded-3xl shadow-2xl border-2 border-rose-500"
                  >
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md w-fit">
                      🩹 Étape 2 : La Fiche d'Urgence ICE
                    </div>
                    <h3 className="font-syne text-xl font-bold text-black">
                      Si quelqu'un tombe ou se fait mal ?
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                      Tu n'as pas besoin de paniquer. Tu touches le prénom du coureur sur ton écran et tu vois tout de suite le téléphone de ses proches et ses allergies !
                    </p>
                    <div className="pt-2 text-xs font-bold text-rose-600 flex items-center gap-1">
                      👉 Touche le profil de Sarah sur l'iPhone !
                    </div>
                  </motion.div>
                )}

                {phoneScreen === "spots" && (
                  <motion.div
                    key="spots-bubble"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 bg-white text-black p-6 rounded-3xl shadow-2xl border-2 border-amber-500"
                  >
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md w-fit">
                      ☕ Étape 3 : Le Café après la course !
                    </div>
                    <h3 className="font-syne text-xl font-bold text-black">
                      Offre un petit cadeau à tes membres !
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                      Une fois l'entraînement fini, le téléphone débloque un code réduction (-15%) pour boire un café ou un jus d'orange ensemble chez votre commerçant préféré !
                    </p>
                    <div className="pt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
                      👉 Touche "Scanner le Code" sur l'iPhone !
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-zinc-400 font-semibold space-y-1">
                <div>✓ Fonctionne sans télécharger d'application</div>
                <div>✓ Compatible iPhone & Android en 30 secondes</div>
              </div>
            </div>

            {/* RIGHT COLUMN: THE INTERACTIVE IPHONE 15 MOCKUP */}
            <div className="flex justify-center">
              <div className="w-[300px] sm:w-[320px] h-[580px] bg-[#000000] rounded-[50px] p-3 border-4 border-zinc-700 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col justify-between">
                
                {/* Dynamic Island Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-end px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-900/50" />
                </div>

                {/* iPhone Screen Container */}
                <div className="bg-[#09090D] w-full h-full rounded-[40px] pt-8 px-4 pb-4 text-white font-sans flex flex-col justify-between relative overflow-hidden border border-white/10">
                  
                  {/* App Header Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#FF5C00] fill-[#FF5C00]" />
                      <span className="font-syne text-xs font-bold text-white">CAPTEN</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ● Live Session
                    </span>
                  </div>

                  {/* PHONE SCREEN CONTENT */}
                  <div className="my-auto space-y-4 text-center">
                    
                    {phoneScreen === "checkin" && (
                      <div className="space-y-4">
                        <div className="text-xs font-bold text-zinc-300">
                          Session Run & Chill #42
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Place de la République • Paris
                        </div>

                        {phoneCheckinDone ? (
                          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-2 bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                            <div className="text-xs font-bold text-emerald-400">POSITION VALIDÉE</div>
                            <div className="text-[9px] text-zinc-300">Distance : 12m • Émargé à 19:28</div>
                            <button
                              onClick={() => setPhoneCheckinDone(false)}
                              className="text-[9px] text-zinc-500 underline hover:text-white cursor-pointer mt-1"
                            >
                              Réinitialiser
                            </button>
                          </motion.div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#FF5C00] to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#FF5C00]/40 animate-pulse">
                              <MapPin className="w-8 h-8 text-white" />
                            </div>
                            <button
                              onClick={() => setPhoneCheckinDone(true)}
                              className="w-full py-3 rounded-xl bg-[#FF5C00] hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
                            >
                              POINTAGE SATELLITE →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {phoneScreen === "ice" && (
                      <div className="space-y-3 text-left">
                        <div className="text-xs font-bold text-white text-center">
                          Fiche Urgence Médicale ICE
                        </div>

                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-2 text-xs">
                          <div className="flex justify-between items-center font-bold">
                            <span>Sarah Marchand</span>
                            <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded font-extrabold">O+</span>
                          </div>
                          
                          {phoneIceUnlocked ? (
                            <div className="space-y-1 text-[10px]">
                              <div className="text-emerald-400 font-bold">Contact : 06 11 22 33 44 (Papa)</div>
                              <div className="text-amber-300 font-bold">⚠️ Allergie Pénicilline</div>
                              <a href="tel:0611223344" className="block text-center py-1.5 bg-rose-500 text-white rounded-lg font-bold mt-2 text-[10px]">
                                📞 Appeler la famille
                              </a>
                            </div>
                          ) : (
                            <button
                              onClick={() => setPhoneIceUnlocked(true)}
                              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              🔓 Déverrouiller les urgences
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {phoneScreen === "spots" && (
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-white">
                          CAPTEN Spot Réduction
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                          <div className="text-xs font-bold text-amber-400">Café du Cycliste</div>
                          <div className="text-[10px] text-zinc-300">-15% après le run</div>

                          {phoneSpotScanned ? (
                            <div className="p-2 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded-lg border border-emerald-500/30">
                              CAPTEN-15-OK
                            </div>
                          ) : (
                            <button
                              onClick={() => setPhoneSpotScanned(true)}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10px] rounded-xl cursor-pointer"
                            >
                              SCANNER LE CODE PROMO →
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Phone Home Bar */}
                  <div className="w-28 h-1 bg-white/30 rounded-full mx-auto" />
                </div>
              </div>
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
