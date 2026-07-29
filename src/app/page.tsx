"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, Check,
  QrCode, Users, Star, ArrowRight
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Landing Page V6 (Pixel-Perfect Runna Replica)
   - Fonts: Manrope (Headings) + Inter (Body)
   - Real high-res generated mockups for Hero, Cards & Feature tabs
   - Exact Runna proportions, spacing, typography & colors
═══════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #FFFFFF;
    color: #161616;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }

  .font-heading { font-family: 'Manrope', -apple-system, sans-serif; }

  /* ── Runna Spacing System ── */
  .container-lg { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
  .container-md { max-width: 760px; margin: 0 auto; padding: 0 24px; }
  .text-center { text-align: center; }

  /* ── Buttons (Runna Salmon Pill) ── */
  .btn-salmon {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 36px; border-radius: 100px; border: none;
    background: #FF5500; color: #FFFFFF;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px;
    cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 4px 20px rgba(255, 85, 0, 0.25);
  }
  .btn-salmon:hover {
    background: #E04D00; transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(255, 85, 0, 0.35);
  }
  .btn-salmon.btn-nav {
    padding: 10px 22px; font-size: 14px; box-shadow: none;
  }

  .btn-outline-dark {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 15px 32px; border-radius: 100px;
    background: transparent; color: #FFFFFF;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer; transition: all 0.2s ease;
  }
  .btn-outline-dark:hover {
    border-color: #FFFFFF; background: rgba(255, 255, 255, 0.05);
  }

  /* ── Typography (Runna Specs) ── */
  .h1-title {
    font-family: 'Manrope', sans-serif;
    font-size: 3.75rem; font-weight: 800; line-height: 1.08;
    letter-spacing: -0.03em; color: #FFFFFF;
  }
  .h2-title {
    font-family: 'Manrope', sans-serif;
    font-size: 2.5rem; font-weight: 800; line-height: 1.15;
    letter-spacing: -0.02em; color: #161616;
  }
  .h2-title-dark {
    font-family: 'Manrope', sans-serif;
    font-size: 2.5rem; font-weight: 800; line-height: 1.15;
    letter-spacing: -0.02em; color: #FFFFFF;
  }
  .h3-title {
    font-family: 'Manrope', sans-serif;
    font-size: 1.35rem; font-weight: 700; line-height: 1.3;
    color: #161616;
  }

  .sub-text {
    font-size: 1.125rem; line-height: 1.6; color: rgba(255, 255, 255, 0.65);
    font-weight: 400;
  }
  .sub-text-dark {
    font-size: 1.125rem; line-height: 1.6; color: #666666;
    font-weight: 400;
  }

  .text-salmon { color: #FF5500; }

  /* ── Sections ── */
  .section-hero {
    background: #161616; color: #FFFFFF;
    padding-top: 140px; padding-bottom: 0;
    position: relative; overflow: hidden;
  }
  .section-white { background: #FFFFFF; padding: 100px 0; }
  .section-light { background: #F4F6F8; padding: 80px 0; }
  .section-dark  { background: #161616; color: #FFFFFF; padding: 100px 0; }

  /* ── Diagonal Divider SVG ── */
  .diagonal-divider {
    width: 100%; height: 60px; background: #161616;
    clip-path: polygon(0 0, 100% 0, 100% 0%, 0 100%);
  }

  /* ── Hero Wide Image Box ── */
  .hero-mockup-wrapper {
    max-width: 980px; margin: 56px auto 0;
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .hero-mockup-img {
    width: 100%; height: auto; display: block;
  }

  /* ── 3-Card Grid (Runna "Run your personal best" style) ── */
  .card-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
    margin-top: 48px;
  }
  .card-item {
    background: #FFFFFF; border-radius: 18px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid #EBEBEB;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    display: flex; flex-direction: column;
  }
  .card-item:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.09);
  }
  .card-img-container {
    width: 100%; aspect-ratio: 4/5; background: #F4F6F8; overflow: hidden;
    display: flex; alignItems: center; justifyContent: center;
  }
  .card-img-container img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .card-body { padding: 24px; text-align: left; }

  /* ── Reviews Split Card (Runna exact) ── */
  .reviews-split {
    display: grid; grid-template-columns: 1fr 1.2fr; gap: 0;
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid #E8E8E8;
  }
  .reviews-left { background: #FFFFFF; padding: 48px; text-align: left; }
  .reviews-right { background: #161616; color: #FFFFFF; padding: 48px; text-align: left; }

  /* ── Tabs Layout (Runna "Why use Runna?" exact) ── */
  .tabs-container {
    display: flex; gap: 64px; align-items: center; margin-top: 48px;
  }
  .tabs-media {
    flex: 0 0 420px; max-width: 420px;
    border-radius: 24px; overflow: hidden;
    box-shadow: 0 12px 36px rgba(0,0,0,0.1);
    background: #F4F6F8; padding: 12px;
  }
  .tabs-media img {
    width: 100%; height: auto; border-radius: 16px; display: block;
  }
  .tabs-list { flex: 1; text-align: left; }
  .tab-row {
    padding: 24px 0; border-bottom: 1px solid #EBEBEB;
    cursor: pointer; transition: all 0.2s ease;
  }
  .tab-row:last-child { border-bottom: none; }
  .tab-header { display: flex; gap: 16px; align-items: center; }
  .tab-badge {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid #D0D0D0; display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; color: #888888;
    flex-shrink: 0; transition: all 0.2s ease;
  }
  .tab-badge.active {
    border-color: #FF5500; color: #FF5500; background: rgba(255, 85, 0, 0.05);
  }
  .tab-title {
    font-family: 'Manrope', sans-serif; font-size: 1.15rem; font-weight: 700;
    color: #888888; transition: color 0.2s ease;
  }
  .tab-title.active { color: #161616; }
  .tab-body { margin-top: 12px; padding-left: 52px; }

  /* ── Category Cards (Runna 5K/10K/13.1/26.2 style) ── */
  .category-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    margin-top: 48px;
  }
  .category-card {
    border-radius: 18px; overflow: hidden; position: relative;
    aspect-ratio: 3/4; cursor: pointer; transition: transform 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .category-card:hover { transform: translateY(-6px); }
  .category-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .category-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%);
    padding: 24px; display: flex; flex-direction: column; justify-content: flex-end;
    text-align: left;
  }

  /* ── Pricing Card ── */
  .pricing-box {
    background: #FFFFFF; border: 2px solid #FF5500; border-radius: 28px;
    padding: 48px 40px; text-align: center; position: relative;
    box-shadow: 0 20px 50px rgba(255, 85, 0, 0.08); max-width: 580px; margin: 48px auto 0;
  }

  /* ── FAQ ── */
  .faq-row { border-bottom: 1px solid #EBEBEB; }
  .faq-button {
    width: 100%; padding: 24px 0; text-align: left; display: flex;
    justify-content: space-between; align-items: center;
    background: none; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif; font-size: 1.05rem; font-weight: 600; color: #161616;
  }

  /* ── Responsive ── */
  @media (max-width: 991px) {
    .h1-title { font-size: 2.75rem; }
    .h2-title, .h2-title-dark { font-size: 2rem; }
    .card-grid { grid-template-columns: 1fr; }
    .reviews-split { grid-template-columns: 1fr; }
    .tabs-container { flex-direction: column; }
    .tabs-media { max-width: 100%; }
    .category-grid { grid-template-columns: 1fr 1fr; }
    .nav-links-desktop { display: none !important; }
  }
  @media (max-width: 640px) {
    .h1-title { font-size: 2.25rem; }
    .category-grid { grid-template-columns: 1fr; }
  }
`;

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tabs = [
    {
      num: 1,
      title: "Check-in GPS & Registre horodaté",
      desc: "Validation automatique au point de rassemblement. Le registre d'émargement est verrouillé et conservé légalement.",
      img: "/landing/card-step1.png"
    },
    {
      num: 2,
      title: "Fiches d'urgence ICE en 1 tap",
      desc: "Groupe sanguin, allergies, antécédents et contact d'urgence — accessibles instantanément par le capitaine.",
      img: "/landing/feature-ice.png"
    },
    {
      num: 3,
      title: "Synchronisation sans téléchargement",
      desc: "Vos membres scannent un QR Code ou cliquent sur un lien. Pas d'app à installer. Fiche remplie en 30 secondes.",
      img: "/landing/hero-phones.png"
    },
    {
      num: 4,
      title: "Avantages partenaires CAPTEN Spots",
      desc: "Transformez la pause café d'après-sortie en remises exclusives chez les commerces partenaires de votre quartier.",
      img: "/landing/card-step3.png"
    },
  ];

  const faqs = [
    { q: "Mes membres doivent-ils télécharger une application ?", a: "Non. Vos membres scannent un QR Code ou cliquent sur votre lien unique. Tout fonctionne instantanément dans leur navigateur mobile." },
    { q: "Comment sont protégées les données médicales (ICE) ?", a: "Les fiches ICE sont chiffrées et accessibles uniquement par le Capitaine en cas d'urgence terrain. Conformité RGPD stricts." },
    { q: "CAPTEN fonctionne-t-il hors connexion ?", a: "Oui. Le registre et les fiches ICE sont mis en cache localement. Consultables en forêt ou en altitude sans réseau." },
    { q: "Comment fonctionne l'essai de 21 jours ?", a: "Accès complet sans carte bancaire. Testez sur vos sorties réelles avec votre crew pendant 3 semaines." },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ═══════════ NAV BAR ═══════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 72, display: "flex", alignItems: "center",
        background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div className="container-lg" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 28, filter: "brightness(0) invert(1)" }} />
          </Link>
          <div className="nav-links-desktop" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Fonctionnalités", "#features"], ["Comment ça marche", "#how"], ["Tarifs", "#pricing"]].map(([l, h], i) => (
              <a key={i} href={h} style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", padding: "8px 12px" }}>Connexion</Link>
            <Link href="/login?mode=signup" className="btn-salmon btn-nav">Essai gratuit</Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO SECTION (Runna Exact Layout) ═══════════ */}
      <section className="section-hero">
        <div className="container-lg text-center">
          <div className="container-md">
            <h1 className="h1-title">
              Gérer ton crew en toute <span className="text-salmon">simplicité</span>
            </h1>
            <div style={{ height: 20 }} />
            <p className="sub-text" style={{ maxWidth: 620, margin: "0 auto" }}>
              Check-in GPS, fiches d&apos;urgence ICE, registre horodaté et avantages partenaires. Tout ce qu&apos;il faut pour piloter une communauté sportive.
            </p>
            <div style={{ height: 36 }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/login?mode=signup" className="btn-salmon">
                Démarrer l&apos;essai gratuit <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn-outline-dark">
                En savoir plus
              </a>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 14 }}>
              21 jours offerts · Sans carte bancaire · Configuré en 3 min
            </div>
          </div>

          {/* High-Res Hero Mockup Image */}
          <div className="hero-mockup-wrapper">
            <img src="/landing/hero-phones.png" alt="CAPTEN Application Showcase" className="hero-mockup-img" />
          </div>
        </div>
        <div className="diagonal-divider" />
      </section>

      {/* ═══════════ 3-CARD FEATURE GRID ("Run your personal best" style) ═══════════ */}
      <section id="features" className="section-white">
        <div className="container-lg text-center">
          <div className="container-md">
            <h2 className="h2-title">Pilotez votre communauté en toute sécurité</h2>
            <div style={{ height: 16 }} />
            <p className="sub-text-dark">
              Vous avez créé votre club pour courir et partager, pas pour gérer des fichiers Excel ou des groupes WhatsApp désorganisés.
            </p>
          </div>

          <div className="card-grid">
            {/* Card 1 */}
            <div className="card-item">
              <div className="card-img-container">
                <img src="/landing/card-step1.png" alt="Check-in GPS" />
              </div>
              <div className="card-body">
                <h3 className="h3-title" style={{ marginBottom: 8 }}>Check-in GPS &amp; Présence</h3>
                <p className="sub-text-dark" style={{ fontSize: "0.95rem" }}>
                  Validation automatique au point de rassemblement. Horodatage officiel conservé comme registre d&apos;émargement.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card-item">
              <div className="card-img-container">
                <img src="/landing/feature-ice.png" alt="Fiche d'urgence ICE" />
              </div>
              <div className="card-body">
                <h3 className="h3-title" style={{ marginBottom: 8 }}>Fiche d&apos;urgence ICE</h3>
                <p className="sub-text-dark" style={{ fontSize: "0.95rem" }}>
                  Groupe sanguin, allergies et contact d&apos;urgence accessibles en 1 tap par le Capitaine en cas d&apos;incident.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card-item">
              <div className="card-img-container">
                <img src="/landing/card-step3.png" alt="CAPTEN Spots" />
              </div>
              <div className="card-body">
                <h3 className="h3-title" style={{ marginBottom: 8 }}>Avantages CAPTEN Spots</h3>
                <p className="sub-text-dark" style={{ fontSize: "0.95rem" }}>
                  Réductions exclusives chez les cafés et commerces locaux partenaires pour valoriser vos membres après la séance.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <Link href="/login?mode=signup" className="btn-salmon">
              Créer mon club gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ REVIEWS & SOCIAL PROOF ═══════════ */}
      <section className="section-light">
        <div className="container-lg">
          <div className="reviews-split">
            {/* Left: Stats & Ratings */}
            <div className="reviews-left">
              <h2 className="h2-title" style={{ fontSize: "2rem", marginBottom: 20 }}>
                Approuvé par les capitaines
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#FF5500" color="#FF5500" />)}
                <span style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Manrope", marginLeft: 4 }}>4.9 / 5</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { stat: "120+", label: "Clubs & Crews actifs" },
                  { stat: "4 200+", label: "Membres sécurisés" },
                  { stat: "0", label: "Incident non couvert" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Manrope", color: "#FF5500", width: 75 }}>{s.stat}</span>
                    <span className="sub-text-dark" style={{ fontSize: "0.95rem" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quotes */}
            <div className="reviews-right">
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>
                  &ldquo;CAPTEN a totalement changé notre organisation. Plus besoin de pointer à la main ni de stresser en forêt : chaque membre est identifié et protégé.&rdquo;
                </p>
                <div style={{ fontWeight: 700, color: "#FFFFFF" }}>Maxime R.</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Capitaine · Run &amp; Chill Paris (140 membres)</div>
              </div>

              <div>
                <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>
                  &ldquo;Quand une participante a fait une chute en rando, sa fiche ICE m&apos;a donné direct son contact d&apos;urgence et ses allergies. Indispensable.&rdquo;
                </p>
                <div style={{ fontWeight: 700, color: "#FFFFFF" }}>Sarah L.</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Fondatrice · Social Walk Lyon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ "WHY USE CAPTEN" TABS (Runna Exact Replica) ═══════════ */}
      <section className="section-white">
        <div className="container-lg">
          <div className="text-center" style={{ maxWidth: 640, margin: "0 auto 48px" }}>
            <h2 className="h2-title">Pourquoi utiliser CAPTEN ?</h2>
          </div>

          <div className="tabs-container">
            {/* Left: Dynamic Phone Showcase */}
            <div className="tabs-media">
              <img src={tabs[activeTab].img} alt={tabs[activeTab].title} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            {/* Right: Interactive Tabs */}
            <div className="tabs-list">
              {tabs.map((tab, i) => (
                <div key={i} className="tab-row" onClick={() => setActiveTab(i)}>
                  <div className="tab-header">
                    <div className={`tab-badge ${activeTab === i ? "active" : ""}`}>{tab.num}</div>
                    <div className={`tab-title ${activeTab === i ? "active" : ""}`}>{tab.title}</div>
                  </div>
                  {activeTab === i && (
                    <div className="tab-body">
                      <p className="sub-text-dark" style={{ fontSize: "0.95rem" }}>{tab.desc}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SPORTS CATEGORIES (Runna 5K/10K/13.1/26.2 style) ═══════════ */}
      <section className="section-dark">
        <div className="container-lg text-center">
          <div className="container-md">
            <h2 className="h2-title-dark">Conçu pour tous les terrains</h2>
            <div style={{ height: 12 }} />
            <p className="sub-text">
              Que vous organisiez un Run Club urbain, un Social Walk convivial ou des sorties Trail techniques.
            </p>
          </div>

          <div className="category-grid">
            {[
              { emoji: "🏃", sport: "Run Club", sub: "Courses urbaines & afterwork", img: "/landing/urban-runclub.jpg" },
              { emoji: "🚶", sport: "Social Walk", sub: "Marches conviviales & bien-être", img: "/landing/community-happy-girls.jpg" },
              { emoji: "🥾", sport: "Trail & Rando", sub: "Sentiers & altitude", img: "/landing/trail-ridge-peak.jpg" },
              { emoji: "🚴", sport: "Cyclisme", sub: "Bientôt disponible", img: "/landing/cyclist-grass-phone.jpg" },
            ].map((cat, i) => (
              <div key={i} className="category-card">
                <img src={cat.img} alt={cat.sport} />
                <div className="category-overlay">
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{cat.emoji}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Manrope", color: "#FFFFFF" }}>{cat.sport}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{cat.sub}</div>
                </div>
                {i === 3 && (
                  <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700, color: "#FFFFFF" }}>
                    Bientôt
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48 }}>
            <Link href="/login?mode=signup" className="btn-salmon">
              Démarrer mon essai gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING SECTION ═══════════ */}
      <section id="pricing" className="section-white">
        <div className="container-lg text-center">
          <div className="container-md">
            <h2 className="h2-title">Un tarif simple. Tout inclus.</h2>
            <div style={{ height: 12 }} />
            <p className="sub-text-dark">Testez gratuitement avec votre club pendant 3 semaines.</p>
          </div>

          <div className="pricing-box">
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#FF5500", color: "#FFFFFF", padding: "4px 18px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
              21 JOURS GRATUITS
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
              Offre Capitaine Complète
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 64, fontWeight: 800, fontFamily: "Manrope", color: "#161616", lineHeight: 1 }}>33</span>
              <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "Manrope", color: "#161616" }}>,99 €</span>
              <span style={{ fontSize: 15, color: "#888888", fontWeight: 500, marginLeft: 4 }}>/mois</span>
            </div>
            <p style={{ fontSize: 13, color: "#FF5500", fontWeight: 600, marginBottom: 32 }}>facturé annuellement · ou 49,99 €/mois</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, textAlign: "left", marginBottom: 36, borderTop: "1px solid #F0F0F0", paddingTop: 24 }}>
              {["Membres illimités", "Check-in GPS", "Fiches ICE d'urgence", "Spots partenaires", "Cagnotte (0% frais)", "Support prioritaire"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#333333" }}>
                  <Check size={16} color="#FF5500" /> {f}
                </div>
              ))}
            </div>

            <Link href="/login?mode=signup" className="btn-salmon" style={{ width: "100%", justifyContent: "center" }}>
              Démarrer l&apos;essai gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ SECTION ═══════════ */}
      <section className="section-light">
        <div className="container-md">
          <h2 className="h2-title text-center" style={{ marginBottom: 40 }}>Questions fréquentes</h2>
          {faqs.map((f, i) => (
            <div key={i} className="faq-row">
              <button className="faq-button" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                {openFaq === i ? <ChevronUp size={18} color="#FF5500" /> : <ChevronDown size={18} color="#888888" />}
              </button>
              {openFaq === i && (
                <div style={{ paddingBottom: 24, fontSize: 15, color: "#666666", lineHeight: 1.6 }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="section-dark text-center">
        <div className="container-md">
          <h2 className="h1-title" style={{ fontSize: "3rem" }}>
            Prêt à piloter ton crew avec <span className="text-salmon">CAPTEN</span> ?
          </h2>
          <div style={{ height: 16 }} />
          <p className="sub-text" style={{ maxWidth: 520, margin: "0 auto" }}>
            Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs. 21 jours d&apos;essai gratuit.
          </p>
          <div style={{ height: 32 }} />
          <Link href="/login?mode=signup" className="btn-salmon" style={{ fontSize: 18, padding: "18px 44px" }}>
            Créer mon crew gratuitement <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ background: "#0E0E0E", color: "#888888", padding: "48px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container-lg" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 22, filter: "brightness(0) invert(1)" }} />
            <span>© 2026 CAPTEN. Tous droits réservés.</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["CGU", "/cgu"], ["RGPD", "/rgpd"], ["Mentions Légales", "/mentions-legales"], ["Support", "/support"]].map(([l, h], i) => (
              <Link key={i} href={h} style={{ color: "#888888", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
                onMouseLeave={e => e.currentTarget.style.color = "#888888"}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
