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
  UserCheck
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN V13 — Ultra-Modern 2026 SaaS Landing Page
   Inspired by Linear.app, Fitframe & Raycast.com
   Tech: Tailwind CSS + Framer Motion + Lucide SVG Icons
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"captain" | "member">("captain");
  const [simulatedCheckin, setSimulatedCheckin] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#09090B] font-sans antialiased selection:bg-[#FF5C00]/20 selection:text-[#FF5C00] overflow-x-hidden">
      {/* ── Google Fonts Import ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
      `}</style>

      {/* ── Background Radial Glow Halos ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#FF5C00]/10 via-[#FF5C00]/5 to-transparent blur-[120px] pointer-events-none z-0" />

      {/* ──────────────────────────────────────────────────────────────
         1. NAVIGATION BAR (Glassmorphism Pill)
      ────────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] shadow-sm" : "py-5 bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-[#FF5C00] fill-[#FF5C00]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-black">
              CAPTEN<span className="text-[#FF5C00]">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-600">
            <a href="#features" className="hover:text-black transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-black transition-colors">Comment ça marche</a>
            <a href="#comparison" className="hover:text-black transition-colors">Comparatif</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-bold text-zinc-700 hover:text-black transition-colors">
              Connexion
            </Link>
            <Link href="/login?mode=signup" className="relative group overflow-hidden px-5 py-2.5 rounded-full bg-black text-white text-sm font-bold shadow-lg shadow-black/10 hover:shadow-black/20 transition-all">
              <span className="relative z-10 flex items-center gap-2">
                Rejoindre la Bêta <ArrowRight className="w-4 h-4 text-[#FF5C00] group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────
         2. HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-32 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-sm text-xs font-bold text-zinc-800"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Bêta Ouverte 2026</span>
              <span className="text-zinc-300">•</span>
              <span className="text-[#FF5C00]">Accès 100% Gratuit</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.08]"
            >
              Gère ton crew.<br />
              <span className="bg-gradient-to-r from-[#FF5C00] via-orange-500 to-amber-500 bg-clip-text text-transparent">
                En toute sécurité.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-zinc-600 font-medium max-w-2xl mx-auto leading-relaxed"
            >
              Check-in GPS horodaté, fiches médicales ICE d'urgence et avantages partenaires local. L'application tout-en-un pour les créateurs de crews sportifs.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/login?mode=signup" className="w-full sm:w-auto px-8 py-4 rounded-full bg-black text-white font-bold text-base shadow-xl shadow-black/10 hover:bg-[#FF5C00] hover:shadow-[#FF5C00]/25 transition-all flex items-center justify-center gap-2 group">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-black/10 text-zinc-800 font-bold text-base shadow-sm hover:bg-zinc-50 hover:border-black/20 transition-all flex items-center justify-center gap-2">
                Découvrir l'application
              </a>
            </motion.div>

            {/* Social Proof Avatars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-8 flex items-center justify-center gap-3 text-xs font-semibold text-zinc-500"
            >
              <div className="flex -space-x-2">
                {[
                  "bg-gradient-to-tr from-orange-400 to-amber-300",
                  "bg-gradient-to-tr from-emerald-400 to-teal-300",
                  "bg-gradient-to-tr from-blue-400 to-indigo-300",
                  "bg-gradient-to-tr from-purple-400 to-pink-300"
                ].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${bg} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                    {["RC", "SW", "TS", "CR"][i]}
                  </div>
                ))}
              </div>
              <span>Rejoint par <strong>+2 800 capitaines & coureurs</strong> en France</span>
            </motion.div>
          </div>

          {/* ── Interactive Hero Showcase Widget ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl bg-white border border-black/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-4 sm:p-8 overflow-hidden">
              
              {/* Top Bar Control */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold text-zinc-400">CAPTEN OS v2.4</span>
                </div>
                
                {/* Switcher Tab */}
                <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setActiveTab("captain")}
                    className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === "captain" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
                  >
                    Vue Capitaine
                  </button>
                  <button
                    onClick={() => setActiveTab("member")}
                    className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === "member" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
                  >
                    Vue Membre
                  </button>
                </div>
              </div>

              {/* Dynamic Content preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* Left Card: Session Info */}
                <div className="space-y-4 bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5C00] bg-[#FF5C00]/10 px-2.5 py-1 rounded-md">
                      SESSION CE SOIR
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-black">Session Run & Chill #42</h3>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" /> République, Paris • 19h30
                    </p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-600">
                      <span>Présences enregistrées</span>
                      <span className="text-black font-extrabold">47 / 50</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#FF5C00] h-full rounded-full w-[94%]" />
                    </div>
                  </div>
                </div>

                {/* Center Card: Interactive Check-in Simulator */}
                <div className="bg-black text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center justify-center min-h-[220px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5C00]/20 blur-2xl pointer-events-none" />
                  
                  {simulatedCheckin ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3">
                      <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-base text-white">Check-in Validé !</h4>
                      <p className="text-xs text-zinc-400">Position vérifiée à 12m du RDV • Fiche ICE active</p>
                      <button onClick={() => setSimulatedCheckin(false)} className="text-[11px] font-bold text-zinc-500 hover:text-white underline mt-2">
                        Réinitialiser la démo
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4 w-full">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                        <QrCode className="w-6 h-6 text-[#FF5C00]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Scanner / Pointer GPS</h4>
                        <p className="text-xs text-zinc-400 mt-1">Testez le check-in en 1 clic</p>
                      </div>
                      <button
                        onClick={() => setSimulatedCheckin(true)}
                        className="w-full py-2.5 rounded-xl bg-[#FF5C00] text-white text-xs font-bold hover:bg-orange-600 transition-all shadow-lg shadow-[#FF5C00]/30"
                      >
                        Simuler le Check-in →
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Card: Security & ICE Badge */}
                <div className="space-y-3 bg-rose-50/50 border border-rose-100 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs tracking-wider uppercase">
                    <Shield className="w-4 h-4" /> Fiche Urgence ICE
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-rose-100 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-black">
                      <span>Sarah M.</span>
                      <span className="bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded text-[10px]">O+</span>
                    </div>
                    <p className="text-[11px] text-rose-600 font-semibold">Allergie : Pénicilline</p>
                    <p className="text-[10px] text-zinc-400">Contact Urgence : 06 12 ••• ••</p>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium leading-normal">
                    Accessible en 3 secondes par le Capitaine en cas de pépin sur le parcours.
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         3. LOGO TICKER (Social Proof)
      ────────────────────────────────────────────────────────────── */}
      <section className="py-10 border-y border-black/[0.06] bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-6">
            Utilisé par les meilleurs crews sportifs
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            {["Paris Run Club", "Urban Walkers", "Trail Squad Lyon", "Coffee Ride BDX", "Marseille Rando"].map((name, i) => (
              <span key={i} className="text-sm md:text-base font-extrabold tracking-wider text-black uppercase">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         4. BENTO GRID FEATURES SECTION
      ────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32 bg-[#FAFAFC]">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5C00] uppercase bg-[#FF5C00]/10 px-3 py-1 rounded-full">
              Fonctionnalités Clés
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
              Tout ce dont ton crew a besoin. En un seul endroit.
            </h2>
            <p className="text-base text-zinc-600 font-medium">
              Fini le désordre des groupes WhatsApp et des fichiers Excel éparpillés.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: GPS Check-in (Tall, Dark Card) */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-1 md:row-span-2 bg-[#09090B] text-white rounded-3xl p-8 border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-xl"
            >
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5C00]/20 text-[#FF5C00] flex items-center justify-center border border-[#FF5C00]/30">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#FF5C00] tracking-wider uppercase">Vérification Automatique</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">Check-in GPS Horodaté</h3>
                </div>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                  Validation instantanée dès que le coureur arrive au point de rendez-vous. Génération automatique du registre de présence légal.
                </p>

                <div className="space-y-3 pt-4">
                  {[
                    "Précision GPS sous les 100 mètres",
                    "Export PDF horodaté conforme",
                    "QR Code de secours pour hors-ligne",
                    "Détection d'assiduité (Streak)"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Visual Mockup inside Card */}
              <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Registre Officiel</div>
                      <div className="text-[10px] text-zinc-400">47 présents valides</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">PDF OK</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Medical ICE Card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-8 border border-black/[0.08] shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-black">Fiche Médicale ICE</h3>
                <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                  Groupe sanguin, allergies et contact d'urgence accessibles en 1 clic par le capitaine en cas de besoin.
                </p>
              </div>

              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-black">
                  <span>Informations Urgence</span>
                  <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded font-extrabold text-[10px]">RGPD Chiffré</span>
                </div>
                <div className="text-xs text-zinc-600 font-semibold space-y-1">
                  <div>• Contact : Proche 1er rang</div>
                  <div>• Allergies & Pathologies en clair</div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: CAPTEN Spots (Partner Discounts) */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-8 border border-black/[0.08] shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-black">CAPTEN Spots</h3>
                <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                  Avantages exclusifs et réductions chez vos cafés, magasins de sport et partenaires locaux préférés.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Café du Cycliste", discount: "-15%", color: "text-[#FF5C00] bg-orange-50" },
                  { name: "Le Traileur Shop", discount: "-20%", color: "text-emerald-600 bg-emerald-50" }
                ].map((spot, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs font-bold">
                    <span className="text-zinc-800">{spot.name}</span>
                    <span className={`px-2.5 py-1 rounded-full font-extrabold ${spot.color}`}>{spot.discount}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card 4: Multi-sport Support (Wide Card) */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-2 bg-white rounded-3xl p-8 border border-black/[0.08] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-black">Adapté à tous les sports outdoor</h3>
                <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                  Run Club, Social Walk, Trail & Rando, Cyclisme. L'interface s'adapte spécifiquement aux besoins de chaque discipline.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto shrink-0">
                {[
                  { label: "Run Club", count: "1 400+ runs" },
                  { label: "Social Walk", count: "650+ walks" },
                  { label: "Trail & Rando", count: "420+ sorties" },
                  { label: "Cyclisme", count: "380+ rides" }
                ].map((item, i) => (
                  <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3 text-center min-w-[120px]">
                    <div className="text-xs font-extrabold text-black">{item.label}</div>
                    <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">{item.count}</div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         5. HOW IT WORKS (3 Simple Steps)
      ────────────────────────────────────────────────────────────── */}
      <section id="how" className="py-24 bg-white border-y border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5C00] uppercase bg-[#FF5C00]/10 px-3 py-1 rounded-full">
              Simplicité Totale
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
              Prêt en 3 minutes chrono.
            </h2>
            <p className="text-base text-zinc-600 font-medium">
              Aucune configuration complexe. Tout se passe directement dans votre navigateur mobile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Crée ton événement",
                desc: "Renseigne le lieu de RDV, la date, l'heure et le type de sport en 60 secondes.",
                icon: Sparkles
              },
              {
                step: "02",
                title: "Partage le lien unique",
                desc: "Tes coureurs s'inscrivent et remplissent leur fiche ICE en 30 secondes sans télécharger d'application.",
                icon: Smartphone
              },
              {
                step: "03",
                title: "Check-in GPS automatique",
                desc: "Le jour J, le registre horodaté se remplit tout seul à l'arrivée des membres au point de RDV.",
                icon: CheckCircle2
              }
            ].map((s, i) => (
              <div key={i} className="bg-[#FAFAFC] rounded-3xl p-8 border border-black/[0.06] space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-[#FF5C00] tracking-tight">{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center border border-black/5 shadow-sm">
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-black">{s.title}</h3>
                <p className="text-sm text-zinc-600 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         6. COMPARISON SECTION (WhatsApp vs CAPTEN)
      ────────────────────────────────────────────────────────────── */}
      <section id="comparison" className="py-24 bg-[#FAFAFC]">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
              Pourquoi quitter les fils WhatsApp ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Sans CAPTEN */}
            <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-rose-600 font-extrabold text-sm uppercase tracking-wider">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </div>
                Sans CAPTEN (WhatsApp / Excel)
              </div>
              <ul className="space-y-4 text-sm text-zinc-600 font-medium">
                {[
                  "Aucun registre de présence légal en cas de contrôle",
                  "Données médicales introuvables en cas d'accident",
                  "Message important noyé sous 150 discussions",
                  "Responsabilité juridique floue pour l'organisateur",
                  "Impossible de mesurer l'assiduité réelle des coureurs"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avec CAPTEN */}
            <div className="bg-black text-white rounded-3xl p-8 border border-white/10 shadow-xl space-y-6">
              <div className="flex items-center gap-3 text-[#FF5C00] font-extrabold text-sm uppercase tracking-wider">
                <div className="w-8 h-8 rounded-full bg-[#FF5C00]/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#FF5C00]" />
                </div>
                Avec CAPTEN
              </div>
              <ul className="space-y-4 text-sm text-zinc-300 font-medium">
                {[
                  "Registre horodaté officiel et exportable en PDF",
                  "Fiche ICE d'urgence consultable en 1 clic",
                  "Canal d'information clair et structuré sans bruit",
                  "Couverture juridique complète avec décharge numérique",
                  "Dashboard d'assiduité + réductions chez les partenaires"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         7. FAQ ACCORDION SECTION
      ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white border-t border-black/[0.06]">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5C00] uppercase bg-[#FF5C00]/10 px-3 py-1 rounded-full">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
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
              <div key={i} className="border border-black/[0.08] rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 text-left font-bold text-base text-black flex items-center justify-between gap-4 hover:bg-zinc-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                    {activeFaq === i ? <Minus className="w-4 h-4 text-black" /> : <Plus className="w-4 h-4 text-black" />}
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-sm text-zinc-600 font-medium leading-relaxed"
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
         8. FINAL CTA & FOOTER
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF5C00]/15 blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Prêt à faire passer ton crew au niveau supérieur ?
          </h2>
          <p className="text-lg text-zinc-400 font-medium max-w-xl mx-auto">
            Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs dès aujourd'hui.
          </p>
          <div className="pt-4">
            <Link href="/login?mode=signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF5C00] text-white font-extrabold text-base shadow-xl shadow-[#FF5C00]/30 hover:bg-orange-600 hover:scale-105 transition-all">
              Rejoindre la Bêta Gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-6xl mx-auto px-6 pt-20 mt-20 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-semibold">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FF5C00]" />
            <span className="text-white font-bold">CAPTEN © 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/rgpd" className="hover:text-white transition-colors">RGPD</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
