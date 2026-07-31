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
  Eye
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Landing Page avec Démo Interactive Complète
   Inspirée des meilleures démos interactives (Linear, Raycast, Vercel)
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<"checkin" | "ice" | "pdf" | "spots">("checkin");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [membersCount, setMembersCount] = useState<number>(45);

  // Demo 1: Interactive Geofence State
  const [geoTested, setGeoTested] = useState(false);
  const [geoDistance, setGeoDistance] = useState(14);

  // Demo 2: Interactive ICE Card Reveal
  const [iceUnlocked, setIceUnlocked] = useState(false);

  // Demo 4: Interactive Spot Code Scan
  const [spotScanned, setSpotScanned] = useState(false);

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
            <a href="#interactive-demo" className="hover:text-white transition-colors">Démo Interactive</a>
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
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-24 z-10">
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
                href="#interactive-demo"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.05] border border-white/10 text-white font-extrabold text-sm hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
              >
                Tester la démo interactive ↓
              </a>
            </motion.div>

          </div>

          {/* ── HERO SHOWCASE MOCKUP IMAGE ── */}
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
                alt="Aperçu du Tableau de Bord CAPTEN Original"
                className="w-full h-auto rounded-[20px] shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
         3. SECTION DÉMO INTERACTIVE EN DIRECT (Linear / Raycast Style)
      ────────────────────────────────────────────────────────────── */}
      <section id="interactive-demo" className="py-24 bg-gradient-to-b from-[#070709] via-[#0D0D14] to-[#070709] border-y border-white/[0.08] relative z-10">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#FF5500] uppercase bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full border border-[#FF5500]/20 flex items-center gap-2 w-fit mx-auto">
              <Play className="w-3.5 h-3.5 text-[#FF5500] fill-[#FF5500]" /> DÉMO INTERACTIVE EN DIRECT
            </span>
            <h2 className="font-syne text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Testez le fonctionnement réel.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-medium max-w-xl mx-auto">
              Cliquez sur les onglets ci-dessous pour tester chaque fonctionnalité en direct dans votre navigateur.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {[
              { id: "checkin", label: "1. Check-in GPS Live", icon: Radio },
              { id: "ice", label: "2. Fiche ICE Urgence", icon: HeartPulse },
              { id: "pdf", label: "3. Registre Officiel PDF", icon: FileCheck },
              { id: "spots", label: "4. Code Promo Spot", icon: Coffee },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDemoTab(tab.id as any)}
                className={`p-4 rounded-2xl border text-xs font-extrabold flex flex-col items-start gap-2 transition-all cursor-pointer ${
                  activeDemoTab === tab.id
                    ? "bg-[#FF5500] text-white border-[#FF5500] shadow-xl shadow-[#FF5500]/25 scale-[1.02]"
                    : "bg-white/[0.03] text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Live Screen Sandbox */}
          <div className="max-w-4xl mx-auto bg-[#09090E] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* DEMO 1: GPS CHECK-IN */}
              {activeDemoTab === "checkin" && (
                <motion.div
                  key="checkin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#FF5500] animate-pulse" />
                      <span className="text-xs font-extrabold text-white">SIMULATEUR DE POINTAGE SATELLITE</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Seuil Geofence : 100m</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    
                    {/* Visual Radar */}
                    <div className="bg-[#070709] border border-white/10 rounded-2xl p-6 h-56 relative overflow-hidden flex items-center justify-center">
                      <div className="w-44 h-44 border border-[#FF5500]/30 rounded-full animate-ping opacity-40" style={{ animationDuration: '3s' }} />
                      <div className="w-28 h-28 border border-white/20 rounded-full" />
                      <div className="w-14 h-14 border border-white/10 rounded-full" />
                      <div className="w-4 h-4 bg-[#FF5500] rounded-full shadow-lg shadow-[#FF5500]/50" />

                      <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[9px] font-mono text-zinc-500">
                        <span>Lieu : Place République</span>
                        <span>Précision : ±8 mètres</span>
                      </div>
                    </div>

                    {/* Interactive Action Control */}
                    <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                      <h4 className="text-sm font-bold text-white">Testez la validation de présence :</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        L'athlète s'approche du point de ralliement. Cliquez ci-dessous pour lancer l'acquisition GPS.
                      </p>

                      {geoTested ? (
                        <div className="space-y-3 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" /> Présence Validée (Distance : 14m)
                          </div>
                          <p className="text-[11px] text-zinc-300">
                            ✓ Inscription ajoutée au registre officiel PDF<br />
                            ✓ Fiche d'urgence ICE débloquée
                          </p>
                          <button
                            onClick={() => setGeoTested(false)}
                            className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Recommencer le test
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setGeoTested(true)}
                          className="w-full py-3 rounded-xl bg-[#FF5500] hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg shadow-[#FF5500]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-4 h-4" /> Déclencher le Check-in GPS →
                        </button>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* DEMO 2: MEDICAL ICE CARD */}
              {activeDemoTab === "ice" && (
                <motion.div
                  key="ice"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-extrabold text-white">FICHE DE SÉCURITÉ MÉDICALE ICE</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">RGPD Chiffré</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    
                    {/* ICE Card Mockup */}
                    <div className="bg-gradient-to-br from-rose-950/30 via-zinc-900 to-zinc-950 border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Sarah Marchand</span>
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">O+</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase block">Contact Urgence :</span>
                          <span className="font-mono text-white font-bold">
                            {iceUnlocked ? "06 11 22 33 44 (Jean - Père)" : "06 •• •• •• •• (Protégé)"}
                          </span>
                        </div>

                        <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-300 font-bold">
                          ⚠️ Allergies : Pénicilline
                        </div>
                      </div>
                    </div>

                    {/* Interactive Action Control */}
                    <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                      <h4 className="text-sm font-bold text-white">Accès d'urgence 1-clic :</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        Les fiches médicales ne sont consultables que par le Capitaine pendant la session.
                      </p>

                      <button
                        onClick={() => setIceUnlocked(!iceUnlocked)}
                        className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4 text-rose-400" />
                        {iceUnlocked ? "Masquer la fiche ICE" : "Déverrouiller le contact d'urgence →"}
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* DEMO 3: OFFICIAL PDF REGISTRATION */}
              {activeDemoTab === "pdf" && (
                <motion.div
                  key="pdf"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-extrabold text-white">REGISTRE DE PRÉSENCE CERTIFIÉ</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Document Officiel Assurances</span>
                  </div>

                  <div className="bg-white text-black p-6 rounded-2xl space-y-4 font-mono text-xs shadow-2xl border border-zinc-200 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                      <div>
                        <div className="font-black text-sm uppercase">PARIS RUN CLUB</div>
                        <div className="text-[10px] text-zinc-500">Registre d'émargement #2026-42</div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-1 rounded">
                        OFFICIEL & HORODATÉ
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-zinc-700">
                      <div>• Événement : Session Run & Chill #42</div>
                      <div>• Lieu : Place de la République, Paris (48.8661° N, 2.3643° E)</div>
                      <div>• Total Émargés : 48 membres valides sous 100m</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DEMO 4: CAPTEN SPOTS CODES */}
              {activeDemoTab === "spots" && (
                <motion.div
                  key="spots"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-extrabold text-white">CAPTEN SPOTS & RÉDUCTIONS</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">-15% à -20%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
                      <div className="flex justify-between font-bold text-white text-sm">
                        <span>Café du Cycliste Paris</span>
                        <span className="text-[#FF5500] font-extrabold">-15% sur les consommations</span>
                      </div>
                      <p className="text-xs text-zinc-400">Débloqué automatiquement après le check-in GPS du run.</p>
                      
                      {spotScanned ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-mono text-emerald-400 font-bold">
                          CODE SCANNE : CAPTEN-PARIS-15 OFFICIEL
                        </div>
                      ) : (
                        <button
                          onClick={() => setSpotScanned(true)}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs transition-all cursor-pointer"
                        >
                          Simuler le scan du Code Promo →
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400 space-y-2 leading-relaxed">
                      <div className="font-bold text-white text-sm">Pourquoi vos membres vont adorer :</div>
                      <div>• Retrouvailles conviviales dans vos cafés préférés après les sorties</div>
                      <div>• Soutien direct des commerçants partenaires locaux de votre quartier</div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
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
