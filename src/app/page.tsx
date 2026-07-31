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
  BellRing
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Masterpiece Landing Page
   Featured Product Mockup Image: /dashboard-preview.png
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<"checkin" | "ice" | "spots">("checkin");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [membersCount, setMembersCount] = useState<number>(45);

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
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-white transition-colors">Comment ça marche</a>
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
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 z-10">
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
              <span className="text-white">CAPTEN 2.4 Release</span>
              <span className="text-zinc-600">•</span>
              <span className="text-[#FF5500] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gratuit pendant la Bêta
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-syne text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.02]"
            >
              Le système d'exploitation<br />
              <span className="bg-gradient-to-r from-[#FF5500] via-orange-400 to-amber-400 bg-clip-text text-transparent">
                des crews sportifs.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed"
            >
              Check-in GPS satellite, fiches d'urgence médicales ICE chiffrées et réductions partenaires. Automatise tes rassemblements Run, Trail, Walk & Bike.
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
                Créer ton club gratuitement
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.05] border border-white/10 text-white font-extrabold text-sm hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
              >
                Voir les fonctionnalités
              </a>
            </motion.div>

            {/* Live Stats Pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Conforme RGPD</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#FF5500]" />
                <span>Pointage GPS sous 100m</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Zéro téléchargement d'app</span>
              </div>
            </motion.div>

          </div>

          {/* ── HERO SHOWCASE MOCKUP IMAGE (Original CAPTEN Dashboard) ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 max-w-5xl mx-auto relative group"
          >
            <div className="relative rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] p-1.5 border border-white/10 shadow-[0_32px_96px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/dashboard-preview.png"
                alt="Aperçu du Tableau de Bord CAPTEN Original"
                className="w-full h-auto rounded-[20px] shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         3. LOGO STRIP (Partenaires & Clubs)
      ────────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/[0.06] bg-[#070709]">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Utilisé par les capitaines des plus grands clubs outdoor
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all font-syne">
            {["Paris Run Club", "Urban Walkers", "Trail Squad Lyon", "Coffee Ride BDX", "Marseille Rando", "Social Athletics"].map((name, i) => (
              <span key={i} className="text-sm md:text-base font-extrabold text-white tracking-wider uppercase">
                {name}
              </span>
            ))}
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

          {/* Interactive Feature Tabs */}
          <div className="flex justify-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 max-w-md mx-auto">
            {[
              { id: "checkin", label: "Check-in GPS", icon: MapPin },
              { id: "ice", label: "Fiche ICE Urgence", icon: HeartPulse },
              { id: "spots", label: "CAPTEN Spots", icon: Coffee },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id as any)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  activeFeatureTab === tab.id
                    ? "bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Content Display */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              
              {activeFeatureTab === "checkin" && (
                <motion.div
                  key="checkin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/20 text-[#FF5500] flex items-center justify-center border border-[#FF5500]/30">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className="font-syne text-2xl sm:text-3xl font-bold text-white">
                    Pointage Satellite GPS sous 100m
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Le serveur valide l'émargement uniquement si le membre se trouve physiquement sur le lieu de rendez-vous grâce à la formule mathématique d'Haversine. Un registre horodaté est généré automatiquement.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {[
                      "Aucune installation d'application requise",
                      "Export PDF conforme pour les assurances",
                      "Délai de pointage restreint (-15m/+3h)",
                      "Compteur d'assiduité (Streak) automatique"
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeFeatureTab === "ice" && (
                <motion.div
                  key="ice"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <h3 className="font-syne text-2xl sm:text-3xl font-bold text-white">
                    Fiche Médicale d'Urgence (In Case of Emergency)
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    En cas de malaise ou de chute, le capitaine accède instantanément au groupe sanguin, aux allergies et au contact d'urgence du membre. Les données sont chiffrées au repos et protégées RGPD.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {[
                      "Accès réservé au Capitaine en session",
                      "Fonctionne hors réseau dans les zones blanches",
                      "Bouton d'appel d'urgence 1-clic",
                      "Données chiffrées en base de données"
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeFeatureTab === "spots" && (
                <motion.div
                  key="spots"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <h3 className="font-syne text-2xl sm:text-3xl font-bold text-white">
                    CAPTEN Spots & Avantages Locaux
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Offrez des réductions exclusives à vos membres chez les cafés, magasins de sport et partenaires locaux après les sorties. Valorisez l'impact économique de votre communauté.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {[
                      "Réductions automatiques après check-in",
                      "Partenariats commerçants de quartier",
                      "Valorisation du club auprès des sponsors",
                      "Statistiques de fréquentation"
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
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
         6. COMPARISON MATRIX
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 relative z-10">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          
          <div className="text-center space-y-4">
            <h2 className="font-syne text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Le chaos WhatsApp vs La clarté CAPTEN.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Sans CAPTEN */}
            <div className="bg-white/[0.02] border border-rose-500/20 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
                <div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-rose-400" />
                </div>
                Groupe WhatsApp & Fichiers Excel
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-zinc-400 font-medium">
                {[
                  "Aucune preuve juridique d'émargement",
                  "Fiches médicales introuvables en urgence",
                  "Messages importants noyés sous 200 notifications",
                  "Responsabilité pénale floue pour le capitaine",
                  "Aucun avantage ou réduction chez les commerçants"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avec CAPTEN */}
            <div className="bg-gradient-to-b from-[#FF5500]/15 to-transparent border border-[#FF5500]/30 rounded-3xl p-8 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 text-[#FF5500] font-extrabold text-xs uppercase tracking-wider">
                <div className="w-7 h-7 rounded-full bg-[#FF5500]/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#FF5500]" />
                </div>
                Avec l'application CAPTEN
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-white font-medium">
                {[
                  "Registre horodaté officiel conforme assurances",
                  "Fiche ICE d'urgence consultable en 1-clic",
                  "Canal d'information structuré sans bruit",
                  "Protection juridique complète avec décharge numérique",
                  "Dashboard d'assiduité + réductions partenaires"
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
         7. FAQ ACCORDION
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
         8. FINAL CTA & FOOTER
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
