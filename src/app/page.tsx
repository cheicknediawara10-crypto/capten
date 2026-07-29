"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck, HeartPulse, MapPin, CheckCircle2,
  ChevronDown, ChevronUp, ArrowRight, Check,
  QrCode, ShieldAlert, AlertCircle, Coffee, Users, Star
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Landing Page V5
   EXACT Runna.com clone structure adapted for CAPTEN
   Font     : Manrope (headings) + Inter (body) — same as Runna
   Colors   : #161616 (dark bg) · #f2f5f7 (light bg) · #FF5500 (accent = Runna salmon equivalent)
   Layout   : Every section mirrors Runna's homepage exactly
═══════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #fff;
    color: #161616;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }
  h1, h2, h3, h4, h5, h6 { font-family: 'Manrope', sans-serif; }

  /* ── Spacers matching Runna ── */
  .spacer-s { height: 16px; }
  .spacer-m { height: 24px; }
  .spacer-l { height: 48px; }
  .spacer-xl { height: 80px; }

  /* ── Container matching Runna's max-width ── */
  .container-lg { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
  .container-md { max-width: 860px; margin: 0 auto; padding: 0 32px; }
  .text-center { text-align: center; }

  /* ── Button matching Runna's salmon button ── */
  .btn-salmon {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 32px; border-radius: 100px; border: none;
    background: #FF5500; color: #fff;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px;
    cursor: pointer; transition: all 0.2s ease;
    text-decoration: none;
  }
  .btn-salmon:hover { background: #e04d00; transform: scale(1.02); }
  .btn-salmon.is-nav { padding: 10px 24px; font-size: 14px; }

  .btn-dark {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 32px; border-radius: 100px; border: 2px solid #333;
    background: transparent; color: #fff;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px;
    cursor: pointer; transition: all 0.2s ease;
    text-decoration: none;
  }
  .btn-dark:hover { border-color: #FF5500; color: #FF5500; }

  .btn-white-outline {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 28px; border-radius: 100px;
    background: transparent; color: #161616;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px;
    border: 2px solid #ddd; cursor: pointer; transition: all 0.2s ease;
    text-decoration: none;
  }
  .btn-white-outline:hover { border-color: #FF5500; color: #FF5500; }

  /* ── Typography matching Runna ── */
  .h1 { font-size: 3.5rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
  .h2 { font-size: 2.25rem; font-weight: 700; line-height: 1.15; letter-spacing: -0.01em; }
  .h3 { font-size: 1.5rem; font-weight: 700; line-height: 1.3; }
  .h4 { font-size: 1.125rem; font-weight: 700; line-height: 1.4; }
  .text-lg { font-size: 1.125rem; line-height: 1.6; }
  .text-md { font-size: 1rem; line-height: 1.6; }
  .text-sm { font-size: 0.875rem; line-height: 1.5; }
  .text-salmon { color: #FF5500; }
  .text-grey { color: #666; }
  .text-light { color: rgba(255,255,255,0.6); }
  .text-white { color: #fff; }

  /* ── Sections matching Runna ── */
  .section-dark { background: #161616; color: #fff; }
  .section-light { background: #f2f5f7; }
  .section-white { background: #fff; }
  .padding-section { padding: 96px 0; }
  .padding-section-sm { padding: 64px 0; }

  /* ── Diagonal divider like Runna ── */
  .diagonal-divider {
    height: 60px; background: #161616; position: relative; z-index: 1;
    clip-path: polygon(0 0, 100% 0, 100% 0%, 0 100%);
  }

  /* ── Feature tabs (Runna "Why use" section) ── */
  .feature-number {
    width: 32px; height: 32px; border-radius: 50%;
    border: 2px solid #ddd; display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #999;
    flex-shrink: 0; transition: all 0.2s;
  }
  .feature-number.active { border-color: #FF5500; color: #FF5500; }

  .tab-load-bar {
    width: 100%; height: 3px; background: #eee; border-radius: 4px; overflow: hidden; margin-top: 12px;
  }
  .tab-load-bar-fill {
    height: 100%; background: #FF5500; border-radius: 4px; transition: width 6s linear;
  }

  /* ── Phone mock for the hero wide image ── */
  .hero-wide-img {
    width: 100%; max-width: 1100px; margin: 0 auto; border-radius: 16px;
    overflow: hidden; display: flex; background: #0e0e0e;
    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.4);
  }

  /* ── Estimated time cards like Runna ── */
  .est-card {
    background: #fff; border-radius: 16px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    transition: transform 0.25s;
  }
  .est-card:hover { transform: translateY(-4px); }
  .est-card-img { width: 100%; aspect-ratio: 288/585; background: #0e0e0e; overflow: hidden; position: relative; }

  /* ── Plan badge cards like Runna's 5K/10K/13.1/26.2 ── */
  .plan-badge {
    border-radius: 16px; overflow: hidden; position: relative;
    aspect-ratio: 3/4; cursor: pointer; transition: transform 0.3s;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .plan-badge:hover { transform: translateY(-6px); }
  .plan-badge img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ── Testimonial layout matching Runna ── */
  .testimonial-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 16px; overflow: hidden; }
  .testimonial-ratings { background: #fff; padding: 48px; }
  .testimonial-quotes { background: #161616; color: #fff; padding: 48px; }

  /* ── FAQ ── */
  .faq-item {
    border-bottom: 1px solid #e5e5e5; transition: all 0.2s;
  }
  .faq-btn {
    width: 100%; padding: 24px 0; text-align: left; display: flex;
    justify-content: space-between; align-items: center;
    background: none; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: #161616;
  }

  /* ── Footer matching Runna ── */
  .footer-link { color: rgba(255,255,255,0.5); font-size: 14px; transition: color 0.15s; }
  .footer-link:hover { color: #fff; }

  /* ── Marquee scroll for logos ── */
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(calc(-100% - 48px)); } }
  .marquee { display: flex; overflow: hidden; gap: 48px; }
  .marquee-track { display: flex; gap: 48px; animation: marquee 20s linear infinite; flex-shrink: 0; align-items: center; }

  /* ── Responsive ── */
  @media (max-width: 991px) {
    .h1 { font-size: 2.5rem; }
    .h2 { font-size: 1.75rem; }
    .hero-wide-img { flex-direction: column; }
    .testimonial-layout { grid-template-columns: 1fr; }
    .tabs-layout { flex-direction: column !important; }
    .tabs-img { max-width: 100% !important; order: -1; }
    .est-grid { grid-template-columns: 1fr !important; }
    .plan-grid { grid-template-columns: 1fr 1fr !important; }
    .steps-g { grid-template-columns: 1fr !important; }
    .nav-links-d { display: none !important; }
  }
  @media (max-width: 479px) {
    .h1 { font-size: 2rem; }
    .plan-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Auto-rotate tabs like Runna
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab(t => (t + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    {
      num: 1,
      title: "Check-in GPS & Registre horodaté",
      desc: "Validation automatique au point de rassemblement. Le registre d'émargement est verrouillé et conservé comme preuve en cas de contrôle.",
    },
    {
      num: 2,
      title: "Fiches d'urgence ICE accessibles en 1 tap",
      desc: "Groupe sanguin, allergies, antécédents et contact d'urgence — tout est centralisé et accessible instantanément par le capitaine.",
    },
    {
      num: 3,
      title: "Synchronisation sans téléchargement",
      desc: "Vos membres scannent un QR Code ou cliquent sur un lien. Pas d'app à installer. La fiche ICE est remplie en 30 secondes.",
    },
    {
      num: 4,
      title: "Avantages partenaires CAPTEN Spots",
      desc: "Transformez la pause café d'après-sortie en remises exclusives chez les commerces partenaires de votre quartier.",
    },
  ];

  const faqs = [
    { q: "Mes membres doivent-ils télécharger une application ?", a: "Non. Vos membres scannent un QR Code ou cliquent sur votre lien unique. Tout fonctionne dans le navigateur, sans téléchargement." },
    { q: "Comment sont protégées les données médicales (ICE) ?", a: "Les fiches ICE sont chiffrées et accessibles uniquement par le Capitaine en cas d'urgence terrain. Conformité RGPD complète." },
    { q: "CAPTEN fonctionne-t-il hors connexion ?", a: "Oui. Le registre et les fiches ICE sont mis en cache localement. Consultables en montagne ou en forêt, sans réseau." },
    { q: "Comment fonctionne l'essai de 21 jours ?", a: "Accès complet sans carte bancaire. Testez sur vos sorties réelles avec votre crew pendant 3 semaines." },
    { q: "Que se passe-t-il après l'essai ?", a: "Vous choisissez l'offre Capitaine à 33,99 €/mois (facturé annuellement). Membres illimités, toutes les fonctionnalités incluses." },
  ];

  // Tab phone screens content
  const tabScreens = [
    /* 0: Check-in GPS */
    <div key={0} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(180deg, #FF5500, #cc4400)", padding: "32px 24px 24px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>CHECK-IN GPS</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginTop: 4, fontFamily: "Manrope" }}>Point de Rassemblement</div>
      </div>
      <div style={{ padding: "20px 20px", flex: 1 }}>
        <div style={{ background: "#f2f5f7", borderRadius: 14, height: 100, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, position: "relative" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>📍 République, Paris</span>
        </div>
        <div style={{ background: "#161616", borderRadius: 14, padding: 20, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "#999" }}>Émargement</span>
            <span style={{ fontSize: 11, color: "#56E39F", fontWeight: 700 }}>● LIVE</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "Manrope" }}>47<span style={{ fontSize: 16, color: "#999", fontWeight: 500 }}> / 47</span></div>
          <div style={{ fontSize: 12, color: "#56E39F", fontWeight: 600, marginTop: 8 }}>✓ Registre horodaté verrouillé</div>
        </div>
      </div>
    </div>,
    /* 1: Fiches ICE */
    <div key={1} style={{ padding: "24px 20px", height: "100%" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid rgba(255,85,0,0.3)", borderRadius: 18, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2a2a2a", paddingBottom: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#FF5500" }}>🛡️ FICHE ICE</span>
          <span style={{ fontSize: 13, fontWeight: 900, background: "#FF5500", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>O+</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "Manrope" }}>Camille Laurent</div>
        <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>Née le 12/03/1992</div>
        <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>ICE : Marc Laurent · 06 12 34 56 78</div>
        <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, marginTop: 14, background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: 8 }}>
          ⚠ Allergie : Pénicilline
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 12, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>📞 Contact ICE</div>
          <div style={{ background: "#FF5500", borderRadius: 10, padding: 12, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>🚨 Appeler 112</div>
        </div>
      </div>
    </div>,
    /* 2: QR Code */
    <div key={2} style={{ padding: "24px 20px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <QrCode size={80} color="#FF5500" style={{ marginBottom: 20 }} />
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", textAlign: "center", fontFamily: "Manrope" }}>Scannez pour rejoindre</div>
      <div style={{ fontSize: 13, color: "#999", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>Aucune app à télécharger.<br />Fiche ICE remplie en 30s.</div>
      <div style={{ background: "#FF5500", borderRadius: 12, padding: "12px 24px", marginTop: 20, fontSize: 14, fontWeight: 700, color: "#fff" }}>capten.app/r/brc</div>
    </div>,
    /* 3: Spots */
    <div key={3} style={{ padding: "20px", height: "100%" }}>
      <div style={{ fontSize: 12, color: "#FF5500", fontWeight: 700, marginBottom: 16 }}>☕ CAPTEN SPOTS</div>
      {[
        { name: "Café du Cycliste", offer: "-15% consommations", icon: "☕" },
        { name: "Sport Corner", offer: "-20% équipement", icon: "🏋️" },
        { name: "Le Comptoir Bio", offer: "-10% smoothies", icon: "🥤" },
      ].map((s, i) => (
        <div key={i} style={{ background: "#1a1a1a", borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#56E39F", fontWeight: 500 }}>{s.offer}</div>
          </div>
        </div>
      ))}
    </div>,
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ═══════════ NAV — Exact Runna style ═══════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 72, display: "flex", alignItems: "center",
        background: "#161616",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        transition: "all 0.3s"
      }}>
        <div className="container-lg" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 28, filter: "brightness(0) invert(1)" }} />
          </Link>
          <div className="nav-links-d" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Fonctionnalités", "#why"], ["Tarifs", "#pricing"], ["Support", "/support"]].map(([l, h], i) => (
              <a key={i} href={h} style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.7)", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>{l}</a>
            ))}
          </div>
          <Link href="/login?mode=signup" className="btn-salmon is-nav">Démarrer</Link>
        </div>
      </nav>

      {/* ═══════════ HERO — Dark, centered (Runna exact) ═══════════ */}
      <header className="section-dark" style={{ paddingTop: 160, paddingBottom: 0, position: "relative", overflow: "hidden" }}>
        <div className="container-lg text-center">
          <div className="container-md">
            <h1 className="h1 text-white" style={{ marginBottom: 24 }}>
              Gérer ton crew en toute <span className="text-salmon">simplicité</span>
            </h1>
            <div className="spacer-s" />
            <p className="text-lg text-light" style={{ maxWidth: 560, margin: "0 auto" }}>
              Check-in GPS, fiches d&apos;urgence ICE, registre horodaté et avantages partenaires. Tout ce qu&apos;il faut pour piloter une communauté sportive sans rien télécharger.
            </p>
          </div>
          <div className="spacer-m" />
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Link href="/login?mode=signup" className="btn-salmon">Créer mon crew gratuitement</Link>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>21 jours offerts · Sans carte bancaire</div>

          <div className="spacer-xl" />

          {/* Hero wide image — 3 phone mockups side by side (like Runna's hero image) */}
          <div className="hero-wide-img">
            {/* Phone 1 - Session */}
            <div style={{ flex: 1, padding: "32px 16px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 220, background: "#1a1a1a", borderRadius: 28, padding: 8, border: "2px solid #333" }}>
                <div style={{ background: "#0e0e0e", borderRadius: 22, overflow: "hidden" }}>
                  <div style={{ background: "linear-gradient(180deg, #FF5500, #cc4400)", padding: "18px 14px 14px" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>SESSION EN COURS</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "Manrope" }}>Run &amp; Chill #42</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      {[{ n: "42/45", l: "Présents" }, { n: "100%", l: "ICE" }].map((s, i) => (
                        <div key={i} style={{ flex: 1, background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{s.n}</div>
                          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {[
                    { name: "Sophie M.", st: "Validé", c: "#56E39F" },
                    { name: "Thomas D.", st: "Validé", c: "#56E39F" },
                    { name: "Camille L.", st: "En route", c: "#FBBF24" },
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid #1a1a1a" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{m.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{m.name}</div>
                        <div style={{ fontSize: 9, color: m.c }}>{m.st}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone 2 - ICE Card */}
            <div style={{ flex: 1, padding: "20px 16px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 240, background: "#1a1a1a", borderRadius: 32, padding: 8, border: "2px solid #333" }}>
                <div style={{ background: "#0e0e0e", borderRadius: 26, overflow: "hidden", padding: 14 }}>
                  <div style={{ background: "#1a1a1a", border: "1px solid rgba(255,85,0,0.3)", borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #2a2a2a" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#FF5500" }}>🛡️ FICHE ICE</span>
                      <span style={{ fontSize: 11, fontWeight: 900, background: "#FF5500", color: "#fff", padding: "1px 6px", borderRadius: 4 }}>O+</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "Manrope" }}>Camille Laurent</div>
                    <div style={{ fontSize: 10, color: "#999", marginTop: 3 }}>ICE : Marc · 06 12 34 56 78</div>
                    <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, marginTop: 10, background: "rgba(239,68,68,0.1)", padding: "5px 8px", borderRadius: 6 }}>⚠ Allergie : Pénicilline</div>
                  </div>
                  <div style={{ background: "#FF5500", borderRadius: 10, padding: 10, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#fff", marginTop: 10 }}>📞 Appeler le contact ICE</div>
                </div>
              </div>
            </div>

            {/* Phone 3 - Spots */}
            <div style={{ flex: 1, padding: "32px 16px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 220, background: "#1a1a1a", borderRadius: 28, padding: 8, border: "2px solid #333" }}>
                <div style={{ background: "#0e0e0e", borderRadius: 22, overflow: "hidden", padding: 14 }}>
                  <div style={{ fontSize: 10, color: "#FF5500", fontWeight: 700, marginBottom: 10 }}>☕ CAPTEN SPOTS</div>
                  {[
                    { name: "Café du Cycliste", offer: "-15%", icon: "☕" },
                    { name: "Sport Corner", offer: "-20%", icon: "🏋️" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#1a1a1a", borderRadius: 10, padding: 10, marginBottom: 6, display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "#56E39F" }}>{s.offer}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: "#56E39F", borderRadius: 10, padding: 8, textAlign: "center", fontSize: 10, fontWeight: 800, color: "#0e0e0e", marginTop: 8 }}>☕ -15% Validé !</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="diagonal-divider" />
      </header>

      {/* ═══════════ SECTION: "Que proposons-nous" (like Runna "Run your personal best") ═══════════ */}
      <section className="section-white padding-section">
        <div className="container-lg text-center">
          <div className="container-md">
            <h2 className="h2">Révélez le potentiel de votre communauté</h2>
            <div className="spacer-s" />
            <p className="text-lg text-grey">Vous avez lancé votre crew pour bouger, pas pour gérer de la paperasse. CAPTEN automatise tout ce qui freine un capitaine de club sportif.</p>
          </div>
          <div className="spacer-l" />
          <div className="est-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
            {[
              { title: "Créez votre club", desc: "Nommez votre crew, choisissez votre sport et générez votre lien unique d'inscription.", icon: <Users size={28} color="#FF5500" />, bg: "rgba(255,85,0,0.08)" },
              { title: "Vos membres s'inscrivent", desc: "Un scan QR Code ou un clic. Fiche ICE remplie en 30 secondes. Zéro app à télécharger.", icon: <QrCode size={28} color="#FF5500" />, bg: "rgba(255,85,0,0.08)" },
              { title: "Pilotez en sécurité", desc: "Check-in GPS, registre horodaté, fiches d'urgence accessibles en 1 tap. Vous êtes couvert.", icon: <ShieldCheck size={28} color="#FF5500" />, bg: "rgba(255,85,0,0.08)" },
            ].map((c, i) => (
              <div key={i} className="est-card" style={{ padding: 32, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>{c.icon}</div>
                <h3 className="h4" style={{ marginBottom: 8 }}>{c.title}</h3>
                <p className="text-md text-grey">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="spacer-l" />
          <Link href="/login?mode=signup" className="btn-salmon">Créer mon crew</Link>
        </div>
      </section>

      {/* ═══════════ REVIEWS (like Runna testimonial layout: ratings + quotes) ═══════════ */}
      <section className="section-light padding-section-sm">
        <div className="container-lg">
          <div className="testimonial-layout" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
            <div className="testimonial-ratings">
              <h3 className="h3" style={{ marginBottom: 24 }}>Ce que disent les capitaines</h3>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="#FF5500" color="#FF5500" />)}
                  <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "Manrope", marginLeft: 4 }}>4.9</span>
                </div>
                <p className="text-sm text-grey">Basé sur 120+ avis de capitaines actifs</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { stat: "120+", label: "Clubs actifs" },
                  { stat: "4 200+", label: "Membres sécurisés" },
                  { stat: "0", label: "Incident non couvert" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "Manrope", color: "#FF5500", width: 70 }}>{s.stat}</span>
                    <span className="text-md text-grey">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="testimonial-quotes">
              {[
                { text: "CAPTEN a changé ma façon de gérer mon Run Club. Plus de stress sur les présences ou les urgences — tout est automatisé.", name: "Maxime R.", role: "Capitaine · Run & Chill Paris" },
                { text: "Quand un membre a fait un malaise, j'avais sa fiche ICE en 1 seconde. Groupe sanguin, allergies, contact d'urgence. CAPTEN m'a sauvé.", name: "Sarah L.", role: "Capitaine · Social Walk Lyon" },
              ].map((q, i) => (
                <div key={i} style={{ marginBottom: i === 0 ? 32 : 0 }}>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 12 }}>&ldquo;{q.text}&rdquo;</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{q.name}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{q.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ "WHY USE CAPTEN" — Tabs layout (EXACT Runna "Why use Runna?" section) ═══════════ */}
      <section id="why" className="section-white padding-section">
        <div className="container-lg">
          <div className="tabs-layout" style={{ display: "flex", gap: 64, alignItems: "flex-start" }}>
            {/* Left: Phone mockup */}
            <div className="tabs-img" style={{ flex: "0 0 400px", maxWidth: 400 }}>
              <div style={{ background: "#f2f5f7", borderRadius: 20, overflow: "hidden", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 260, background: "#1a1a1a", borderRadius: 36, padding: 10, border: "2px solid #333" }}>
                  <div style={{ background: "#0e0e0e", borderRadius: 28, overflow: "hidden", minHeight: 420 }}>
                    {tabScreens[activeTab]}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Tabs */}
            <div style={{ flex: 1 }}>
              <h2 className="h2" style={{ marginBottom: 32 }}>Pourquoi utiliser CAPTEN ?</h2>
              {tabs.map((tab, i) => (
                <div key={i} onClick={() => setActiveTab(i)} style={{ cursor: "pointer", marginBottom: 24, paddingBottom: i < 3 ? 24 : 0, borderBottom: i < 3 ? "1px solid #eee" : "none" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div className={`feature-number ${activeTab === i ? "active" : ""}`}>{tab.num}</div>
                    <div style={{ flex: 1 }}>
                      <h3 className="h4" style={{ color: activeTab === i ? "#161616" : "#999", transition: "color 0.2s" }}>{tab.title}</h3>
                      {activeTab === i && (
                        <>
                          <div className="tab-load-bar"><div className="tab-load-bar-fill" style={{ width: "100%" }} /></div>
                          <p className="text-md text-grey" style={{ marginTop: 12 }}>{tab.desc}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PLANS SECTION — like Runna's 5K/10K/13.1/26.2 cards ═══════════ */}
      <section className="section-dark padding-section">
        <div className="container-lg text-center">
          <div className="container-md">
            <h2 className="h2 text-white" style={{ marginBottom: 8 }}>Conçu pour tous les terrains</h2>
            <p className="text-lg text-light">Que vous pilotiez un Run Club, un Social Walk ou un Trail — CAPTEN s&apos;adapte à votre sport.</p>
          </div>
          <div className="spacer-l" />
          <div className="plan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { emoji: "🏃", sport: "Run Club", sub: "Courses urbaines & afterwork", img: "/landing/urban-runclub.jpg" },
              { emoji: "🚶", sport: "Social Walk", sub: "Marches conviviales & bien-être", img: "/landing/community-happy-girls.jpg" },
              { emoji: "🥾", sport: "Trail & Rando", sub: "Sentiers & altitude", img: "/landing/trail-ridge-peak.jpg" },
              { emoji: "🚴", sport: "Cyclisme", sub: "Bientôt disponible", img: "/landing/cyclist-grass-phone.jpg" },
            ].map((s, i) => (
              <div key={i} className="plan-badge">
                <img src={s.img} alt={s.sport} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Manrope", color: "#fff" }}>{s.sport}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.sub}</div>
                </div>
                {i === 3 && <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, color: "#fff", backdropFilter: "blur(8px)" }}>Bientôt</div>}
              </div>
            ))}
          </div>
          <div className="spacer-l" />
          <Link href="/login?mode=signup" className="btn-salmon">Commencer gratuitement</Link>
        </div>
      </section>

      {/* ═══════════ PRICING — Clean, centered (like Runna pricing) ═══════════ */}
      <section id="pricing" className="section-white padding-section">
        <div className="container-lg" style={{ maxWidth: 620, margin: "0 auto", padding: "0 32px" }}>
          <div className="text-center" style={{ marginBottom: 48 }}>
            <h2 className="h2">Un prix. Tout inclus.</h2>
            <div className="spacer-s" />
            <p className="text-lg text-grey">Pas de paliers. Pas de frais cachés. Tout est inclus dès le premier jour.</p>
          </div>
          <div style={{ background: "#fff", border: "2px solid #FF5500", borderRadius: 24, padding: "48px 40px", textAlign: "center", position: "relative", boxShadow: "0 20px 60px rgba(255,85,0,0.08)" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#FF5500", color: "#fff", padding: "4px 18px", borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>21 JOURS GRATUITS</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Offre Capitaine</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: 60, fontWeight: 800, fontFamily: "Manrope", color: "#161616", lineHeight: 1 }}>33</span>
              <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "Manrope", color: "#161616" }}>,99 €</span>
              <span style={{ fontSize: 16, color: "#999", fontWeight: 500, marginLeft: 4 }}>/mois</span>
            </div>
            <p style={{ fontSize: 14, color: "#FF5500", fontWeight: 600, marginBottom: 32 }}>facturé annuellement · ou 49,99 €/mois</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "left", marginBottom: 32, borderTop: "1px solid #f0f0f0", paddingTop: 24 }}>
              {["Membres illimités", "Check-in GPS", "Fiches ICE d'urgence", "Spots partenaires", "Cagnotte (0% frais)", "Support prioritaire"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
                  <Check size={16} color="#FF5500" /> {f}
                </div>
              ))}
            </div>
            <Link href="/login?mode=signup" className="btn-salmon" style={{ width: "100%", justifyContent: "center" }}>Démarrer mon essai gratuit</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ — Clean (like Runna) ═══════════ */}
      <section className="section-light padding-section">
        <div className="container-lg" style={{ maxWidth: 760, margin: "0 auto", padding: "0 32px" }}>
          <h2 className="h2 text-center" style={{ marginBottom: 48 }}>Questions fréquentes</h2>
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                {openFaq === i ? <ChevronUp size={18} color="#FF5500" /> : <ChevronDown size={18} color="#ccc" />}
              </button>
              {openFaq === i && <div style={{ paddingBottom: 24, fontSize: 15, color: "#666", lineHeight: 1.6 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FINAL CTA — Dark (like Runna bottom CTA) ═══════════ */}
      <section className="section-dark padding-section text-center">
        <div className="container-md">
          <h2 className="h1 text-white" style={{ marginBottom: 16 }}>Ton crew mérite mieux que <span className="text-salmon">WhatsApp</span></h2>
          <p className="text-lg text-light" style={{ maxWidth: 500, margin: "0 auto 32px" }}>
            Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs. 21 jours d&apos;essai gratuit.
          </p>
          <Link href="/login?mode=signup" className="btn-salmon" style={{ fontSize: 18, padding: "18px 40px" }}>Créer mon crew gratuitement</Link>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>Sans carte bancaire · Annulation en 1 clic</div>
        </div>
      </section>

      {/* ═══════════ FOOTER — Dark (Runna exact) ═══════════ */}
      <footer style={{ background: "#0e0e0e", padding: "48px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container-lg" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 22, filter: "brightness(0) invert(1)" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>© 2026 CAPTEN. Tous droits réservés.</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["CGU", "/cgu"], ["RGPD", "/rgpd"], ["Mentions Légales", "/mentions-legales"], ["Support", "/support"]].map(([l, h], i) => (
              <Link key={i} href={h} className="footer-link">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
