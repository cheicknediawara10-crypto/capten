"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldAlert, ShieldCheck, HeartPulse, MapPin, Users, Zap, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, ArrowRight, Sparkles, Store, Lock,
  PhoneCall, Check, MessageSquare, Flame, AlertCircle, FileCheck, Smartphone,
  Coffee, Shield, Award, UserCheck, Activity, Compass, Footprints, Bike,
  Camera, Eye, Heart, QrCode
} from "lucide-react";

// ============================================================
// CAPTEN — LANDING PAGE SUPREME REDESIGN (Framer / Raycast Quality)
// World-class UI layout, high-contrast typography, rich product mockups
// Palette: Base #FAFAFA | Rupture #09090B | Accent #FF5500 (Neon Orange)
// Typography: Plus Jakarta Sans (Headings & Body) | JetBrains Mono (Tech)
// ============================================================

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
`;

const CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body { 
    background-color: #FAFAFA; 
    color: #09090B; 
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; 
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }

  /* Keyframe Animations */
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-8px) rotate(0.5deg); }
  }
  @keyframes floatReverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(8px) rotate(-0.5deg); }
  }
  @keyframes beaconPulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 85, 0, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(255, 85, 0, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 85, 0, 0); }
  }

  .animate-float { animation: floatSlow 5s ease-in-out infinite; }
  .animate-float-del { animation: floatReverse 6s ease-in-out infinite; }
  .animate-beacon { animation: beaconPulse 2s infinite; }

  /* Custom Glows & Shadows */
  .shadow-hero-mockup {
    box-shadow: 0 30px 70px -15px rgba(9, 9, 11, 0.25), 0 0 0 1px rgba(9, 9, 11, 0.08);
  }
  .shadow-dark-card {
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  /* Buttons */
  .btn-accent {
    background-color: #FF5500;
    color: #FFFFFF;
    font-weight: 700;
    border: none;
    border-radius: 14px;
    padding: 16px 32px;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 25px -5px rgba(255, 85, 0, 0.35);
  }
  .btn-accent:hover {
    background-color: #E04B00;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(255, 85, 0, 0.45);
  }
  .btn-accent:active {
    transform: translateY(0);
  }

  .btn-outline-dark {
    background: #FFFFFF;
    color: #09090B;
    font-weight: 700;
    border: 1px solid #E4E4E7;
    border-radius: 14px;
    padding: 16px 28px;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .btn-outline-dark:hover {
    border-color: #09090B;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  }

  /* Bento Grid Card Base */
  .bento-card {
    background: #FFFFFF;
    border: 1px solid #E4E4E7;
    border-radius: 28px;
    padding: 36px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .bento-card:hover {
    border-color: rgba(255, 85, 0, 0.3);
    box-shadow: 0 20px 45px -15px rgba(9, 9, 11, 0.09);
    transform: translateY(-3px);
  }

  .footer-link {
    color: #A1A1AA;
    transition: color 0.2s ease;
  }
  .footer-link:hover {
    color: #FFFFFF;
  }

  /* Responsive Adjustments */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
    .hero-ctas { justify-content: center !important; }
    .bento-grid { grid-template-columns: 1fr !important; }
    .bento-card { grid-column: span 12 !important; }
    .vs-grid { grid-template-columns: 1fr !important; }
    .spots-bento-grid { grid-template-columns: 1fr !important; }
    .gallery-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 640px) {
    .h1-hero { font-size: 42px !important; }
    .h2-section { font-size: 30px !important; }
    .nav-items { display: none !important; }
    .gallery-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function LandingPage() {
  const [activeSport, setActiveSport] = useState<string>("run");
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sports = [
    { id: "run", label: "Run Club", icon: "🏃" },
    { id: "walk", label: "Social Walk", icon: "🚶" },
    { id: "trail", label: "Trail & Rando", icon: "🥾" },
    { id: "bike", label: "Cyclisme (bientôt)", icon: "🚴", disabled: true }
  ];

  const faqs = [
    {
      q: "Comment fonctionne le respect de la vie privée et du RGPD ?",
      a: "Toutes les données médicales (fiches ICE) et coordonnées d'urgence sont chiffrées et uniquement accessibles par le Capitaine du club en cas de besoin terrain. Aucune donnée n'est revendue ni partagée."
    },
    {
      q: "Mes membres doivent-ils télécharger une application ?",
      a: "Non ! C'est la force de CAPTEN. Vos membres scannent un QR Code ou cliquent sur votre lien Web unique (ex: capten.app/r/brc). Tout s'ouvre instantanément dans leur navigateur en 3 secondes."
    },
    {
      q: "Puis-je utiliser CAPTEN même sans connexion Internet en montagne ou en forêt ?",
      a: "Oui. Le registre des membres enregistrés et les fiches d'urgence ICE de votre session s'enregistrent en cache local sur votre téléphone avant le départ. Accessible hors-ligne."
    },
    {
      q: "Comment fonctionne l'essai gratuit de 21 jours ?",
      a: "Vous bénéficiez d'un accès complet à toutes les fonctionnalités pendant 21 jours, sans carte bancaire requise. Vous testez sur vos sorties réelles avec votre crew."
    }
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ============================================================ */}
      {/* 1. HEADER & NAVBAR */}
      {/* ============================================================ */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 24px",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: scrolled ? "rgba(250, 250, 250, 0.94)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid #E4E4E7" : "1px solid transparent",
          transition: "all 0.3s ease"
        }}
      >
        <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 38, width: "auto" }} />
          </Link>

          {/* Navigation Links */}
          <nav className="nav-items" style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <a href="#probleme" style={{ fontSize: 14, fontWeight: 600, color: "#71717A", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#09090B"} onMouseLeave={(e) => e.currentTarget.style.color = "#71717A"}>Sécurité &amp; Enjeux</a>
            <a href="#fonctionnalites" style={{ fontSize: 14, fontWeight: 600, color: "#71717A", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#09090B"} onMouseLeave={(e) => e.currentTarget.style.color = "#71717A"}>Fonctionnalités</a>
            <a href="#communaute" style={{ fontSize: 14, fontWeight: 600, color: "#71717A", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#09090B"} onMouseLeave={(e) => e.currentTarget.style.color = "#71717A"}>Le Terrain</a>
            <a href="#comparatif" style={{ fontSize: 14, fontWeight: 600, color: "#71717A", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#09090B"} onMouseLeave={(e) => e.currentTarget.style.color = "#71717A"}>vs WhatsApp</a>
            <a href="#tarifs" style={{ fontSize: 14, fontWeight: 600, color: "#71717A", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#09090B"} onMouseLeave={(e) => e.currentTarget.style.color = "#71717A"}>Tarifs</a>
          </nav>

          {/* CTA Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "#09090B", padding: "8px 16px" }}>
              Se connecter
            </Link>
            <Link href="/login?mode=signup" className="btn-accent" style={{ padding: "10px 20px", fontSize: 14, borderRadius: 10 }}>
              Tester la Bêta
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 1. HERO SECTION (PERSPECTIVE 3D MOCKUP PRODUIT & PREUVE SOCIALE) */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: "#FAFAFA", paddingTop: 140, paddingBottom: 90, position: "relative", overflow: "hidden" }}>
        {/* Subtle Background Glow Accent */}
        <div style={{ position: "absolute", top: -100, right: "15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255, 85, 0, 0.07) 0%, rgba(250, 250, 250, 0) 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          {/* Sports Pill Selector */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 32 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: 1.5, marginRight: 4 }}>
              CONÇU POUR :
            </span>
            {sports.map((s) => (
              <button
                key={s.id}
                onClick={() => !s.disabled && setActiveSport(s.id)}
                disabled={s.disabled}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 600,
                  border: activeSport === s.id ? "1px solid #FF5500" : "1px solid #E4E4E7",
                  backgroundColor: activeSport === s.id ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)",
                  color: activeSport === s.id ? "#FF5500" : s.disabled ? "#A1A1AA" : "#09090B",
                  cursor: s.disabled ? "not-allowed" : "pointer",
                  boxShadow: activeSport === s.id ? "0 4px 12px rgba(255, 85, 0, 0.15)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 60, alignItems: "center" }}>
            {/* Left Hero Content */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, backgroundColor: "#FFFFFF", border: "1px solid #E4E4E7", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <span className="animate-beacon" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FF5500" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#09090B", textTransform: "uppercase", letterSpacing: 1 }}>
                  Bêta Capitaines Ouverte · 21 jours offerts
                </span>
              </div>

              {/* H1 Headline — Clean, Modern, Punchy Plus Jakarta Sans 900 */}
              <h1
                className="h1-hero"
                style={{
                  fontSize: 58,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: "-1.5px",
                  color: "#09090B",
                  marginBottom: 24
                }}
              >
                Tu as lancé ce crew pour bouger. <br />
                <span style={{ color: "#FF5500" }}>Pas pour faire l&apos;admin.</span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#71717A",
                  fontWeight: 500,
                  maxWidth: 580,
                  marginBottom: 36
                }}
              >
                La plateforme tout-en-un pour gérer vos rassemblements sportifs, sécuriser vos membres avec les fiches d&apos;urgence ICE et valoriser votre communauté.
              </p>

              {/* CTAs */}
              <div className="hero-ctas" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 32 }}>
                <Link href="/login?mode=signup" className="btn-accent">
                  Tester la Bêta gratuitement <ArrowRight size={18} />
                </Link>
                <a href="#probleme" className="btn-outline-dark">
                  Découvrir les enjeux
                </a>
              </div>

              {/* PHOTO 1 INTEGRATION: CARTE PREUVE SOCIALE (Hero / Sous CTA) */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 18px",
                  borderRadius: 100,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                  boxShadow: "0 10px 25px -5px rgba(9, 9, 11, 0.08)"
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid #FF5500", flexShrink: 0 }}>
                  <img src="/landing/community-happy-girls.jpg" alt="Communaute CAPTEN" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#09090B" }}>
                    « Conçu par des capitaines, pour des communautés vivantes. »
                  </div>
                  <div style={{ fontSize: 11, color: "#71717A", fontWeight: 600 }}>
                    120+ clubs &amp; 4 200+ membres actifs
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: MOCKUP SMARTPHONE PRODUIT PRINCIPAL + BADGES */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              {/* Smartphone Frame Chassis */}
              <div
                className="shadow-hero-mockup"
                style={{
                  width: 320,
                  backgroundColor: "#09090B",
                  borderRadius: 44,
                  padding: 12,
                  border: "4px solid #27272A",
                  position: "relative",
                  zIndex: 2
                }}
              >
                {/* Screen Inner */}
                <div style={{ backgroundColor: "#FAFAFA", borderRadius: 34, overflow: "hidden", border: "1px solid #18181B", minHeight: 560 }}>
                  {/* App Screen Header */}
                  <div style={{ backgroundColor: "#09090B", color: "#FFFFFF", padding: "20px 18px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#FF5500", fontWeight: 700, letterSpacing: 1 }}>SESSION EN COURS</span>
                      <span style={{ fontSize: 10, backgroundColor: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 100 }}>19:30 · PARIS</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>RUN &amp; CHILL #42</div>
                    <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 2 }}>Point de RDV : République</div>
                  </div>

                  {/* Body Screen Product Content */}
                  <div style={{ padding: 16 }}>
                    {/* Live Check-in Gauge */}
                    <div style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, border: "1px solid #E4E4E7", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#09090B" }}>CHECK-IN PRESENCE</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#FF5500" }}>42 / 45</span>
                      </div>
                      <div style={{ height: 8, backgroundColor: "#F4F4F5", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ width: "93%", height: "100%", backgroundColor: "#FF5500", borderRadius: 100 }} />
                      </div>
                    </div>

                    {/* Member Item Preview */}
                    {[
                      { name: "Sophie Martin", status: "Validé (GPS)", ice: "OK O+", badge: "🟢" },
                      { name: "Thomas Dubois", status: "Validé (GPS)", ice: "OK A-", badge: "🟢" },
                      { name: "Alexandre V.", status: "En route", ice: "Vérifié", badge: "🟠" }
                    ].map((m, idx) => (
                      <div key={idx} style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 10, border: "1px solid #F4F4F5", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12 }}>{m.badge}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#09090B" }}>{m.name}</div>
                            <div style={{ fontSize: 10, color: "#71717A" }}>{m.status}</div>
                          </div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, backgroundColor: "#F4F4F5", padding: "3px 7px", borderRadius: 6, color: "#09090B" }}>
                          ICE {m.ice}
                        </span>
                      </div>
                    ))}

                    <div style={{ marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: "#09090B", color: "#FFFFFF", textAlign: "center", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Zap size={14} color="#FF5500" /> Scanner un membre
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Micro Badge 1 (Top Left) */}
              <div
                className="animate-float"
                style={{
                  position: "absolute",
                  top: "8%",
                  left: "-12%",
                  zIndex: 3,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                  borderRadius: 18,
                  padding: "14px 20px",
                  boxShadow: "0 20px 40px -10px rgba(9, 9, 11, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A" }}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#09090B" }}>🟢 42 membres enregistrés</div>
                  <div style={{ fontSize: 11, color: "#71717A", fontWeight: 500 }}>Check-in horodaté en direct</div>
                </div>
              </div>

              {/* Floating Micro Badge 2 (Bottom Right) */}
              <div
                className="animate-float-del"
                style={{
                  position: "absolute",
                  bottom: "12%",
                  right: "-10%",
                  zIndex: 3,
                  backgroundColor: "#09090B",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 18,
                  padding: "16px 22px",
                  boxShadow: "0 25px 45px -10px rgba(0, 0, 0, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#FFFFFF"
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(255, 85, 0, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500" }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>🛡️ Fiche ICE vérifiée</div>
                  <div style={{ fontSize: 11, color: "#A1A1AA", fontWeight: 500 }}>Groupe sanguin &amp; Urgence 112</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. SECTION PROBLÈME / SÉCURITÉ (Fond Sombre #09090B avec Texture Photo Urban Crew #2 Overlay Opacity 0.15) */}
      {/* ============================================================ */}
      <section id="probleme" style={{ backgroundColor: "#09090B", color: "#FFFFFF", padding: "110px 24px", position: "relative", overflow: "hidden" }}>
        {/* PHOTO 2 INTEGRATION: Image de fond "Urban Crew de début de soirée" avec Opacity 0.15 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/landing/urban-dusk-crew.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            pointerEvents: "none",
            filter: "grayscale(30%)"
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Header Section */}
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 70px" }}>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF5500", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 12 }}>
              L&apos;ENJEU DE LA RESPONSABILITÉ
            </span>

            {/* Clean Modern H2 Title in Plus Jakarta Sans 800 */}
            <h2
              className="h2-section"
              style={{
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: "-0.8px",
                marginBottom: 16
              }}
            >
              Le piège du club informel.
            </h2>
            <p style={{ fontSize: 18, color: "#A1A1AA", fontWeight: 500, lineHeight: 1.6 }}>
              &ldquo;On est juste un groupe de potes.&rdquo; L&apos;erreur classique qui laisse les capitaines entièrement à découvert en cas de pépin.
            </p>
          </div>

          {/* 3 Dark Problem Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
            {/* Card 1 */}
            <div
              className="shadow-dark-card"
              style={{
                backgroundColor: "rgba(18, 18, 21, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 24,
                padding: 36,
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(239, 68, 68, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", marginBottom: 24 }}>
                <ShieldAlert size={26} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 12 }}>
                1. Le Flou Juridique
              </h3>
              <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6, fontWeight: 500 }}>
                Rassemblements hebdomadaires de 40 personnes sur la voie publique sans registre officiel des présences. En cas d&apos;accident, la responsabilité personnelle du capitaine peut être directement recherchée.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className="shadow-dark-card"
              style={{
                backgroundColor: "rgba(18, 18, 21, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 24,
                padding: 36,
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255, 85, 0, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500", marginBottom: 24 }}>
                <HeartPulse size={26} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 12 }}>
                2. L&apos;Urgence Médicale
              </h3>
              <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6, fontWeight: 500 }}>
                À 19h30, un membre fait une chute ou un malaise. Impossible de transmettre son groupe sanguin, ses allergies ou son contact d&apos;urgence ICE aux pompiers qui arrivent sur place.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="shadow-dark-card"
              style={{
                backgroundColor: "rgba(18, 18, 21, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 24,
                padding: 36,
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(161, 161, 170, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A1A1AA", marginBottom: 24 }}>
                <MessageSquare size={26} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 12 }}>
                3. Le Chaos WhatsApp
              </h3>
              <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6, fontWeight: 500 }}>
                60 notifications par jour pour des questions répétitives (&ldquo;C&apos;est où le RDV ?&rdquo;), des informations de sécurité indispensables complètement perdues dans le fil de discussion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SECTION FONCTIONNALITÉS — BENTO GRID (PRODUCT UI FOCUS) */}
      {/* ============================================================ */}
      <section id="fonctionnalites" style={{ backgroundColor: "#FAFAFA", padding: "110px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 60px" }}>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF5500", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 12 }}>
              DESIGNED FOR CAPTAINS
            </span>
            <h2
              className="h2-section"
              style={{
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#09090B",
                letterSpacing: "-0.8px",
                marginBottom: 16
              }}
            >
              Tout ce dont votre crew a besoin. Sans la lourdeur d&apos;une asso.
            </h2>
          </div>

          {/* Asymmetric Bento Grid Focus Interface */}
          <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>

            {/* BENTO CARDE A (Large 8/12) — Check-in GPS & Registre Horodaté (GROS ZOOM UI) */}
            <div className="bento-card" style={{ gridColumn: "span 8" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 28 }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF5500", textTransform: "uppercase", letterSpacing: 1.5 }}>
                    FONCTIONNALITÉ #1
                  </span>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: "#09090B", marginTop: 4 }}>
                    Check-in GPS &amp; Registre Horodaté
                  </h3>
                  <p style={{ fontSize: 14, color: "#71717A", fontWeight: 500, marginTop: 4, maxWidth: 440 }}>
                    Validez la présence de vos membres au point de RDV en 1-clic. Registre d&apos;émargement officiel conservé automatiquement.
                  </p>
                </div>
                <div style={{ backgroundColor: "#F4F4F5", padding: "8px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, color: "#09090B" }}>
                  📍 RDV : 19h30 République
                </div>
              </div>

              {/* Map & Live Counter UI ZOOM Mockup */}
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #E4E4E7", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 0 }}>
                {/* Left Mini Map Live UI */}
                <div style={{ backgroundColor: "#FFFFFF", padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin size={18} color="#FF5500" />
                      <span style={{ fontSize: 13, fontWeight: 800 }}>Point de Rassemblement GPS</span>
                    </div>
                    <span style={{ fontSize: 10, backgroundColor: "rgba(255,85,0,0.1)", color: "#FF5500", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>PÉRIMÈTRE 50M</span>
                  </div>
                  <div style={{ height: 120, backgroundColor: "#F4F4F7", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #E4E4E7", position: "relative" }}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#09090B", display: "block" }}>📍 Place de la République, Paris</span>
                      <span style={{ fontSize: 10, color: "#71717A", fontWeight: 600 }}>Validation automatique à l&apos;approche</span>
                    </div>
                    <span style={{ position: "absolute", top: "25%", left: "48%", width: 16, height: 16, backgroundColor: "#FF5500", borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 0 12px rgba(255,85,0,0.6)" }} />
                  </div>
                </div>

                {/* Right Live Counter UI */}
                <div style={{ backgroundColor: "#09090B", color: "#FFFFFF", padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#A1A1AA", fontWeight: 600 }}>EMARGEMENT DIRECT</span>
                    <span style={{ fontSize: 10, backgroundColor: "rgba(255,85,0,0.2)", color: "#FF5500", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>LIVE</span>
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: "#FFFFFF", margin: "10px 0" }}>
                    47 <span style={{ fontSize: 20, color: "#A1A1AA", fontWeight: 600 }}>/ 47</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#56E39F", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={16} /> Registre horodaté verrouillé
                  </div>
                </div>
              </div>
            </div>

            {/* BENTO CARDE B (4/12 - Sécurité & Fiches ICE - GROS ZOOM UI FICHE MÉDICALE) */}
            <div className="bento-card" style={{ gridColumn: "span 4", backgroundColor: "#09090B", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF5500", textTransform: "uppercase", letterSpacing: 1.5 }}>
                  FONCTIONNALITÉ #2
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginTop: 4, marginBottom: 8 }}>
                  Sécurité &amp; Fiches ICE
                </h3>
                <p style={{ fontSize: 13, color: "#A1A1AA", fontWeight: 500, marginBottom: 20 }}>
                  Accès en 1-clic aux antécédents médicaux d&apos;urgence et contacts des proches pour chaque participant.
                </p>
              </div>

              {/* ICE Card UI Zoom Detail */}
              <div style={{ backgroundColor: "#121215", border: "1px solid rgba(255,85,0,0.3)", borderRadius: 18, padding: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#FF5500", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={16} /> FICHE ICE URGENCE
                  </span>
                  <span style={{ fontSize: 11, backgroundColor: "#FF5500", color: "#fff", padding: "2px 8px", borderRadius: 6, fontWeight: 900 }}>O+</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>Camille Laurent</div>
                <div style={{ fontSize: 11, color: "#A1A1AA", marginTop: 4 }}>Contact ICE : 06 12 34 56 78 (Époux)</div>
                <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginTop: 8, backgroundColor: "rgba(239,68,68,0.12)", padding: "6px 10px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={14} /> Allergie : Pénicilline
                </div>
                <div style={{ marginTop: 12, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 8, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#FFFFFF", cursor: "pointer" }}>
                  📞 Appeler le 112 / Secours
                </div>
              </div>
            </div>

            {/* BENTO CARDE C (Full 12/12) — CAPTEN Spots (DASHBOARD PARTENAIRE UI ZOOM + PHOTO LIFESTYLE) */}
            <div className="bento-card" style={{ gridColumn: "span 12", padding: 0 }}>
              <div className="spots-bento-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", alignItems: "stretch" }}>
                <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF5500", textTransform: "uppercase", letterSpacing: 1.5 }}>
                    FONCTIONNALITÉ #3
                  </span>
                  <h3 style={{ fontSize: 26, fontWeight: 800, color: "#09090B", marginTop: 4, marginBottom: 12 }}>
                    CAPTEN Spots — Valorisez votre communauté auprès des commerces locaux
                  </h3>
                  <p style={{ fontSize: 15, color: "#71717A", fontWeight: 500, lineHeight: 1.6, marginBottom: 20 }}>
                    Transformez vos fins de sorties (cafés, shops, bars) en avantages exclusifs. Vos membres profitent de la pause pour consulter l&apos;application et valider leurs remises en 1 clic.
                  </p>

                  {/* UI Zoom Spot Coupon */}
                  <div style={{ backgroundColor: "#F4F4F5", borderRadius: 16, padding: 18, border: "1px solid #E4E4E7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#09090B", color: "#FF5500", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Coffee size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#09090B" }}>Café du Cycliste — Social Spot</div>
                        <div style={{ fontSize: 11, color: "#71717A", fontWeight: 600 }}>Avantage membre : -15% sur les consommations</div>
                      </div>
                    </div>
                    <span style={{ backgroundColor: "#FF5500", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                      Scanner QR Code
                    </span>
                  </div>
                </div>

                {/* PHOTO 4 INTEGRATION: Lifestyle Image (Sportif allongé sur l'herbe avec smartphone) */}
                <div style={{ position: "relative", minHeight: 320, overflow: "hidden" }}>
                  <img src="/landing/cyclist-grass-phone.jpg" alt="Detente apres effort Capten Spots" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(9,9,11,0.5) 0%, transparent 60%)" }} />
                  
                  {/* Floating Overlay Badge on Grass Photo */}
                  <div style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "rgba(9, 9, 11, 0.9)", color: "#FFFFFF", padding: "14px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Coffee size={18} color="#FF5500" />
                      <span style={{ fontSize: 13, fontWeight: 800 }}>Troisième Mi-Temps &amp; Café</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#A1A1AA" }}>
                      1-clic pour débloquer votre tarif partenaire au shop
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3.5. HUMAN COMMUNITY GALLERY ("SUR LE TERRAIN") */}
      {/* ============================================================ */}
      <section id="communaute" style={{ backgroundColor: "#FAFAFA", padding: "80px 24px", borderTop: "1px solid #E4E4E7" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 50px" }}>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF5500", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 10 }}>
              LA VRAIE VIE DES CLUBS
            </span>
            <h2
              className="h2-section"
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#09090B",
                letterSpacing: "-0.8px"
              }}
            >
              Sur le terrain avec plus de 120+ capitaines.
            </h2>
            <p style={{ fontSize: 16, color: "#71717A", fontWeight: 500, marginTop: 8 }}>
              Que ce soit sur la promenade en ville, sur les sentiers de forêt ou sur les marches en côte : CAPTEN est dans la poche des capitaines.
            </p>
          </div>

          {/* 4 Photos Mapped Grid */}
          <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {/* Photo 1: Community Happy Girls */}
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ height: 260, position: "relative" }}>
                <img src="/landing/community-happy-girls.jpg" alt="Ambiance & Communaute" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: 14, left: 14, backgroundColor: "rgba(9,9,11,0.85)", color: "#fff", padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700 }}>
                  🏃 AMBIANCE &amp; COMMUNAUTÉ
                </span>
              </div>
              <div style={{ padding: 20 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "#09090B" }}>Social Walkers &amp; Run Crew</h4>
                <p style={{ fontSize: 13, color: "#71717A", marginTop: 4, fontWeight: 500 }}>
                  L&apos;énergie positive d&apos;une communauté vivante. Des membres qui partagent l&apos;effort en toute sécurité.
                </p>
              </div>
            </div>

            {/* Photo 2: Trail Ridge Peak */}
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ height: 260, position: "relative" }}>
                <img src="/landing/trail-ridge-peak.jpg" alt="Trail & Rando Crête" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: 14, left: 14, backgroundColor: "rgba(9,9,11,0.85)", color: "#fff", padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700 }}>
                  🥾 TRAIL &amp; RANDO CRÊTE
                </span>
              </div>
              <div style={{ padding: 20 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "#09090B" }}>Peak Hikers · Altitude &amp; D+</h4>
                <p style={{ fontSize: 13, color: "#71717A", marginTop: 4, fontWeight: 500 }}>
                  Engagés sur les crêtes de montagne avec fiches médicales ICE accessibles même hors-réseau.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. COMPARATIF "WHATSAPP VS CAPTEN" */}
      {/* ============================================================ */}
      <section id="comparatif" style={{ backgroundColor: "#FAFAFA", padding: "90px 24px", borderTop: "1px solid #E4E4E7" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 50px" }}>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF5500", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 10 }}>
              LE CHOIX CLAIR
            </span>
            <h2
              className="h2-section"
              style={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#09090B",
                letterSpacing: "-0.8px"
              }}
            >
              Pourquoi remplacer les groupes WhatsApp illisibles ?
            </h2>
          </div>

          <div className="vs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "stretch" }}>
            {/* Left Card: WhatsApp Chaos */}
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 24, padding: 36, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", color: "#71717A" }}>
                  <XCircle size={22} color="#EF4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#09090B" }}>Groupe WhatsApp Seul</h3>
                  <span style={{ fontSize: 12, color: "#71717A", fontWeight: 500 }}>Le chaos au quotidien</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Fil de discussion noyé sous 60 messages/jour",
                  "Aucun registre horodaté des présences",
                  "Absence totale de fiches de santé & ICE",
                  "Gestion manuelle épuisante pour le capitaine",
                  "Risque juridique personnel en cas d'accident"
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#71717A", fontWeight: 500 }}>
                    <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card: CAPTEN Solution */}
            <div style={{ backgroundColor: "#09090B", color: "#FFFFFF", border: "1px solid #27272A", borderRadius: 24, padding: 36, position: "relative", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,85,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500" }}>
                  <ShieldCheck size={22} color="#FF5500" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF" }}>Avec CAPTEN</h3>
                  <span style={{ fontSize: 12, color: "#FF5500", fontWeight: 700 }}>Tranquillité &amp; Sécurité</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "1 Check-in GPS automatique au point de RDV",
                  "Fiches ICE urgence centralisées et vérifiées",
                  "Validation des présences en 3 secondes",
                  "0 secrétariat & automatisation complète",
                  "Protection juridique & décharges RGPD 1-clic"
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#FFFFFF", fontWeight: 600 }}>
                    <CheckCircle2 size={18} color="#56E39F" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. TARIFS & FAQ */}
      {/* ============================================================ */}
      <section id="tarifs" style={{ backgroundColor: "#FAFAFA", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* Section Title */}
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 50px" }}>
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#FF5500", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 10 }}>
              TARIFICATION CLAIRE
            </span>
            <h2
              className="h2-section"
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#09090B",
                letterSpacing: "-0.8px"
              }}
            >
              Un tarif fixe. Sans mauvaise surprise.
            </h2>
          </div>

          {/* Pricing Card */}
          <div
            className="shadow-dribbble"
            style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid #FF5500",
              borderRadius: 28,
              padding: 44,
              maxWidth: 640,
              margin: "0 auto 80px",
              textAlign: "center",
              position: "relative"
            }}
          >
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", backgroundColor: "#FF5500", color: "#FFFFFF", padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
              21 JOURS D&apos;ESSAI GRATUIT
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              OFFRE CAPITAINE COMPLÈTE
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 64, fontWeight: 900, color: "#09090B", lineHeight: 1 }}>33</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#09090B" }}>,99 €</span>
              <span style={{ fontSize: 14, color: "#71717A", fontWeight: 600 }}>/mois</span>
            </div>
            <p style={{ fontSize: 13, color: "#FF5500", fontWeight: 700, marginBottom: 32 }}>
              facturé annuellement (ou 49,99 €/mois sans engagement)
            </p>

            <div style={{ textAlign: "left", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 36, borderTop: "1px solid #F4F4F5", paddingTop: 28 }}>
              {[
                "Membres illimités",
                "Check-in GPS & Registres",
                "Fiches d'urgence ICE",
                "Spots & Avantages locaux",
                "Cagnotte intégrée (0% commission)",
                "Support prioritaire 24/7"
              ].map((feat, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#09090B" }}>
                  <Check size={16} color="#FF5500" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <Link href="/login?mode=signup" className="btn-accent" style={{ width: "100%", padding: "16px", fontSize: 16 }}>
              Lancer mon crew avec 21j gratuits →
            </Link>
          </div>

          {/* FAQ Section */}
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", textAlign: "center", marginBottom: 32 }}>
              Foire aux questions
            </h3>
            <div>
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E4E4E7",
                    borderRadius: 16,
                    marginBottom: 12,
                    overflow: "hidden"
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: "100%",
                      padding: "20px 24px",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#09090B"
                    }}
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={18} color="#FF5500" /> : <ChevronDown size={18} color="#71717A" />}
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: "0 24px 20px", fontSize: 14, color: "#71717A", lineHeight: 1.6, fontWeight: 500, borderTop: "1px solid #F4F4F5", paddingTop: 14 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. FOOTER & CTA FINAL (Fond Sombre #09090B) */}
      {/* ============================================================ */}
      <footer style={{ backgroundColor: "#09090B", color: "#FFFFFF", paddingTop: 100, paddingBottom: 50, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          {/* Final CTA Box */}
          <div
            style={{
              backgroundColor: "#121215",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 32,
              padding: "60px 40px",
              textAlign: "center",
              marginBottom: 80,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <h2
              className="h2-section"
              style={{
                fontSize: 44,
                fontWeight: 800,
                color: "#FFFFFF",
                marginBottom: 16
              }}
            >
              Ton crew mérite mieux que WhatsApp.
            </h2>
            <p style={{ fontSize: 16, color: "#A1A1AA", maxWidth: 540, margin: "0 auto 36px", fontWeight: 500 }}>
              Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs dès aujourd&apos;hui.
            </p>
            <Link href="/login?mode=signup" className="btn-accent" style={{ padding: "18px 38px", fontSize: 17 }}>
              Rejoindre la Bêta CAPTEN <ArrowRight size={20} />
            </Link>
          </div>

          {/* Bottom Footer links */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "#A1A1AA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.png" alt="CAPTEN" style={{ height: 28, filter: "brightness(0) invert(1)" }} />
              <span>© 2026 CAPTEN. Tous droits réservés.</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <Link href="/cgu" className="footer-link">CGU</Link>
              <Link href="/rgpd" className="footer-link">RGPD &amp; Vie Privée</Link>
              <Link href="/mentions-legales" className="footer-link">Mentions Légales</Link>
              <Link href="/support" className="footer-link">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
