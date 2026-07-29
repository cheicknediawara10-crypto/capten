"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, AlertTriangle, Check, X,
  ChevronDown, ChevronUp, ArrowRight, QrCode, MapPin,
  Users, Sparkles, Coffee, PhoneCall, Shield, Activity
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Ultra-Luxurious SaaS Landing Page V9 (2026 Standards)
   - Canvas        : Deep Anthracite #08080A + Mesh Gradient Radial Halos
   - Glassmorphism : Backdrop blur, 1px white/10 borders, rounded-3xl
   - Typography    : Plus Jakarta Sans (Headings) + Inter (Body Copy)
   - Accents       : Neon Orange #FF5500 (10% primary) + Gradient Text Clips
   - Components    : Floating Nav, 3D Hero Mockup with Micro-Widgets,
                     Marquee Ticker, Dark Rupture Problem Section,
                     Asymmetrical Bento Grid 2026, Split Comparison, FAQ, Dark CTA
═══════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background-color: #08080A;
    color: #F8FAFC;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }

  /* ── Canvas Mesh Background ── */
  .bg-mesh-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: 
      radial-gradient(circle at 50% -20%, rgba(255, 85, 0, 0.15), transparent 60%),
      radial-gradient(circle at 85% 40%, rgba(255, 85, 0, 0.06), transparent 50%),
      radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 28px 28px;
  }

  /* ── Spacing Container ── */
  .container-lux {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 1;
  }

  /* ── Buttons ── */
  .btn-neon-orange {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    padding: 16px 36px; border-radius: 9999px; border: none;
    background: linear-gradient(135deg, #FF5500 0%, #FF7733 100%);
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 16px;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 30px -5px rgba(255, 85, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.3);
  }
  .btn-neon-orange:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px -5px rgba(255, 85, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.4);
  }
  .btn-neon-orange.btn-nav {
    padding: 10px 22px; font-size: 14px; box-shadow: 0 4px 16px rgba(255, 85, 0, 0.3);
  }

  .btn-glass-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 32px; border-radius: 9999px;
    background: rgba(255, 255, 255, 0.05); color: #F8FAFC;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12); cursor: pointer; transition: all 0.25s ease;
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  }
  .btn-glass-secondary:hover {
    border-color: rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  /* ── Glassmorphism Cards ── */
  .card-glass {
    background: rgba(18, 18, 22, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.5);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .card-glass:hover {
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-4px);
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px -10px rgba(255, 85, 0, 0.15);
  }

  /* ── Typography & Gradients ── */
  .text-gradient-white {
    background: linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-gradient-orange {
    background: linear-gradient(135deg, #FF5500 0%, #FFA066 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .h1-lux {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 3.75rem; font-weight: 800; line-height: 1.08;
    letter-spacing: -0.035em;
  }
  .h2-lux {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 2.5rem; font-weight: 800; line-height: 1.18;
    letter-spacing: -0.025em;
  }
  .body-text {
    font-family: 'Inter', sans-serif;
    font-size: 1.1rem; font-weight: 400; color: #94A3B8; line-height: 1.65;
  }

  /* ── Animations ── */
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes floatReverse {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(8px); }
  }
  .animate-float { animation: floatSlow 5s ease-in-out infinite; }
  .animate-float-reverse { animation: floatReverse 6s ease-in-out infinite; }

  /* ── Ticker ── */
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ticker-wrap {
    display: flex; overflow: hidden; user-select: none;
    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  }
  .ticker-move {
    display: flex; gap: 48px; flex-shrink: 0;
    animation: ticker 28s linear infinite;
    align-items: center;
  }

  /* ── Bento Grid ── */
  .bento-grid-lux {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
  }
  .col-span-8 { grid-column: span 8; }
  .col-span-4 { grid-column: span 4; }
  .col-span-6 { grid-column: span 6; }

  @media (max-width: 1024px) {
    .h1-lux { font-size: 2.75rem; }
    .h2-lux { font-size: 2rem; }
    .col-span-8, .col-span-4, .col-span-6 { grid-column: span 12; }
    .bento-grid-lux { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .h1-lux { font-size: 2.15rem; }
    .h2-lux { font-size: 1.65rem; }
    .nav-desktop-links { display: none !important; }
  }
`;

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Est-ce gratuit pendant la phase Bêta ?",
      a: "Oui ! L'accès à CAPTEN est 100% gratuit pendant toute la période Bêta pour les créateurs et capitaines de crew. Vous bénéficiez de 21 jours d'essai complet sans carte bancaire."
    },
    {
      q: "Mes membres doivent-ils télécharger une application ?",
      a: "Non. Vos membres scannent un QR Code au point de rassemblement ou cliquent sur votre lien unique. Leur fiche ICE est renseignée en 30 secondes directement dans le navigateur mobile."
    },
    {
      q: "Comment sont protégées les données médicales (ICE) ?",
      a: "Les fiches ICE sont chiffrées de bout en bout et conservées en stricte conformité RGPD. Elles ne sont consultables que par le Capitaine lors d'une session active et verrouillée."
    },
    {
      q: "CAPTEN fonctionne-t-il hors connexion (sans réseau) ?",
      a: "Absolument. Les données de session et les fiches d'urgence ICE de vos membres sont conservées en cache local sur votre smartphone. Idéal pour les sorties rando, trail et montagne."
    }
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* Canvas Mesh Overlay */}
      <div className="bg-mesh-overlay" />

      {/* ═══════════ 1. NAVBAR (Floating Glassmorphic Pill) ═══════════ */}
      <div style={{ position: "fixed", top: 20, left: 0, right: 0, zIndex: 100, padding: "0 24px" }}>
        <nav className="container-lux" style={{
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: 9999,
          padding: "0 24px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 26, filter: "brightness(0) invert(1)" }} />
          </Link>

          {/* Links */}
          <div className="nav-desktop-links" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Fonctionnalités", "#features"], ["Risque & Sécurité", "#risk"], ["Comparatif", "#comparison"], ["FAQ", "#faq"]].map(([l, h], i) => (
              <a key={i} href={h} style={{ fontSize: 14, fontWeight: 600, color: "#94A3B8", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#FF5500"}
                onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>{l}</a>
            ))}
          </div>

          {/* CTA */}
          <Link href="/login?mode=signup" className="btn-neon-orange btn-nav">
            Tester la Bêta
          </Link>
        </nav>
      </div>

      {/* ═══════════ 2. HERO SECTION ═══════════ */}
      <header style={{ paddingTop: 150, paddingBottom: 80, position: "relative" }}>
        <div className="container-lux text-center">
          {/* Top Tagline Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 18px", borderRadius: 9999,
            background: "rgba(255, 85, 0, 0.1)", border: "1px solid rgba(255, 85, 0, 0.25)",
            fontSize: 12, fontWeight: 700, color: "#FF5500",
            marginBottom: 24, boxShadow: "0 0 20px rgba(255,85,0,0.15)"
          }}>
            <span>⚡</span> L&apos;outil de sécurité &amp; check-in des capitaines
          </div>

          {/* Multisports Pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
            {[
              { emoji: "🏃", label: "Run Club" },
              { emoji: "🚶", label: "Social Walk" },
              { emoji: "🥾", label: "Trail & Rando" },
              { emoji: "🚴", label: "Cyclisme" }
            ].map((s, i) => (
              <span key={i} style={{
                background: "rgba(255, 255, 255, 0.05)", color: "#CBD5E1", border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "5px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 600
              }}>
                {s.emoji} {s.label}
              </span>
            ))}
          </div>

          {/* H1 Headline */}
          <div style={{ maxWidth: 900, margin: "0 auto 24px" }}>
            <h1 className="h1-lux text-gradient-white">
              Tu as lancé ce crew pour bouger. <br />
              <span className="text-gradient-orange">Pas pour faire l&apos;admin.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="body-text" style={{ maxWidth: 640, margin: "0 auto 40px" }}>
            Gère tes rassemblements en 3 secondes, protège tes membres avec la fiche ICE et valorise ton impact local. Sans le chaos WhatsApp.
          </p>

          {/* CTA Zone */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 64 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/login?mode=signup" className="btn-neon-orange">
                Rejoindre la Bêta Gratuite <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-glass-secondary">
                Voir la démonstration
              </a>
            </div>

            {/* Micro Reassurance */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <div style={{ display: "flex" }}>
                {["/landing/urban-runclub.jpg", "/landing/community-happy-girls.jpg", "/landing/trail-ridge-peak.jpg"].map((src, i) => (
                  <img key={i} src={src} alt="Capitaine" style={{
                    width: 32, height: 32, borderRadius: "50%", border: "2px solid #08080A", objectFit: "cover",
                    marginLeft: i > 0 ? -12 : 0
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>
                Adopté par <strong style={{ color: "#FFFFFF" }}>150+ crews</strong> en France
              </span>
            </div>
          </div>

          {/* Hero Mockup iPhone 16 Pro avec Micro-Widgets 3D */}
          <div style={{ position: "relative", maxWidth: 960, margin: "0 auto" }}>
            <div className="card-glass" style={{ padding: 12, borderRadius: 28 }}>
              <img src="/landing/hero-phones.png" alt="Interface CAPTEN" style={{ width: "100%", height: "auto", borderRadius: 20, display: "block" }} />
            </div>

            {/* Bulle 1 (Verte - Présents) */}
            <div className="animate-float" style={{
              position: "absolute", top: "18%", left: "-3%", zIndex: 10,
              background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: 20,
              padding: "14px 20px", boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 12px #22C55E" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>🟢 42 présents</div>
                <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>RDV République (19h30)</div>
              </div>
            </div>

            {/* Bulle 2 (Orange - ICE Verification) */}
            <div className="animate-float-reverse" style={{
              position: "absolute", bottom: "14%", right: "-3%", zIndex: 10,
              background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 85, 0, 0.4)", borderRadius: 20,
              padding: "14px 20px", boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(255,85,0,0.15)",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255, 85, 0, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500" }}>
                <ShieldCheck size={22} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>🛡️ Fiches ICE d&apos;urgence prêtes</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>Groupe O+ · Contact 1-clic</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ 3. MARQUEE TICKER ═══════════ */}
      <section style={{ padding: "36px 0", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="ticker-wrap">
          <div className="ticker-move">
            {[
              "PARIS RUN CLUB", "URBAN WALKERS", "TRAIL SQUAD LYON", "COFFEE RIDE BORDEAUX",
              "SOCIAL ATHLETICS", "MARSEILLE RANDO", "RUN & CHILL #42", "CAPTEN SPOTS",
              "PARIS RUN CLUB", "URBAN WALKERS", "TRAIL SQUAD LYON", "COFFEE RIDE BORDEAUX"
            ].map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, color: "#64748B", fontWeight: 800, fontSize: 13, letterSpacing: 2 }}>
                <span style={{ color: "#FF5500" }}>●</span> {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4. PROBLEM SECTION ("LE PIÈGE DU CLUB INFORMEL") ═══════════ */}
      <section id="risk" style={{ padding: "110px 0" }}>
        <div className="container-lux text-center">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 9999,
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)",
            fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 20
          }}>
            <AlertTriangle size={14} /> Le piège de l&apos;amateurisme
          </div>

          <h2 className="h2-lux text-gradient-white" style={{ maxWidth: 780, margin: "0 auto 16px" }}>
            À 19h30 sur le trottoir, l&apos;amateurisme devient un risque.
          </h2>
          <p className="body-text" style={{ maxWidth: 580, margin: "0 auto 60px" }}>
            Ce qui sépare une simple sortie entre amis d&apos;un rassemblement sous votre responsabilité légale.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "left" }}>
            {/* Card 1 */}
            <div className="card-glass" style={{ padding: 36 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FF5500", marginBottom: 16, letterSpacing: 1 }}>01. FLOU JURIDIQUE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>40 personnes sans registre</h3>
              <p className="body-text" style={{ fontSize: "0.95rem" }}>
                Rassemblement sur la voie publique sans preuve d&apos;émargement horodatée = responsabilité civile et pénale de l&apos;organisateur engagée en cas de litige.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-glass" style={{ padding: 36 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FF5500", marginBottom: 16, letterSpacing: 1 }}>02. URGENCE MÉDICALE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>Antécédents inaccessibles</h3>
              <p className="body-text" style={{ fontSize: "0.95rem" }}>
                Un membre chute. Les secours demandent ses allergies et le contact de ses proches : au milieu du groupe, personne ne possède l&apos;information.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-glass" style={{ padding: 36 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FF5500", marginBottom: 16, letterSpacing: 1 }}>03. CHAOS WHATSAPP</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>80 messages par jour</h3>
              <p className="body-text" style={{ fontSize: "0.95rem" }}>
                Les heures de RDV, les tracés GPS et les consignes de sécurité sont constamment noyés. L&apos;information critique finit toujours par être perdue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 5. BENTO GRID SOLUTION ═══════════ */}
      <section id="features" style={{ padding: "110px 0" }}>
        <div className="container-lux text-center">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 9999,
            background: "rgba(255, 85, 0, 0.1)", border: "1px solid rgba(255, 85, 0, 0.25)",
            fontSize: 12, fontWeight: 700, color: "#FF5500", marginBottom: 20
          }}>
            <Sparkles size={14} /> La solution tout-en-un
          </div>

          <h2 className="h2-lux text-gradient-white" style={{ maxWidth: 740, margin: "0 auto 16px" }}>
            Bento Grid Fonctionnalités
          </h2>
          <p className="body-text" style={{ maxWidth: 560, margin: "0 auto 60px" }}>
            Une suite d&apos;outils ultra-clean développée pour offrir une sérénité totale aux organisateurs.
          </p>

          {/* BENTO GRID */}
          <div className="bento-grid-lux">
            {/* Carte 1 (Col-span-8) */}
            <div className="col-span-8 card-glass" style={{ padding: 44, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "inline-block", background: "rgba(255,85,0,0.12)", color: "#FF5500", padding: "4px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                  CHECK-IN GPS AUTOMATIQUE
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>
                  Check-in GPS &amp; Registre Horodaté
                </h3>
                <p className="body-text" style={{ maxWidth: 540 }}>
                  Validation automatique dès que le membre se trouve à moins de 50 mètres du point de RDV. Émargement verrouillé conservé comme preuve juridique.
                </p>
              </div>
              <div style={{ marginTop: 36, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
                <img src="/landing/card-step1.png" alt="Check-in GPS" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "top" }} />
              </div>
            </div>

            {/* Carte 2 (Col-span-4 - Medical ICE Accent) */}
            <div className="col-span-4 card-glass" style={{ padding: 36, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(180deg, rgba(255,85,0,0.08) 0%, rgba(18,18,22,0.85) 100%)", borderColor: "rgba(255,85,0,0.25)" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#FF5500", letterSpacing: 1.5 }}>🛡️ SÉCURITÉ ICE</span>
                  <span style={{ background: "#FF5500", color: "#FFFFFF", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 900 }}>O+</span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 10 }}>Fiche ICE &amp; Gestes Réflexes</h3>
                <p className="body-text" style={{ fontSize: "0.95rem", marginBottom: 20 }}>
                  Accédez au groupe sanguin, allergies et contact 1-clic, avec les rappels réflexes.
                </p>

                {/* Emergency Preview */}
                <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>Sarah Jenkins</div>
                  <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginTop: 4 }}>⚠ Allergie : Pénicilline</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>ICE : Marc (06 12 34 56 78)</div>
                </div>

                {/* Gestes Réflexes */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 12, fontSize: 11, color: "#CBD5E1", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontWeight: 700, color: "#22C55E" }}>💡 Fiches Réflexes de Secours :</div>
                  <div>• Malaise : PLS (Position Latérale)</div>
                  <div>• Chute de tension : Jambes relevées à 45°</div>
                </div>
              </div>

              <div style={{ marginTop: 24, background: "#FF5500", borderRadius: 14, padding: "12px", textAlign: "center", fontSize: 13, fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(255,85,0,0.3)" }}>
                <PhoneCall size={16} /> Bouton Appel Urgence (15/18)
              </div>
            </div>

            {/* Carte 3 (Col-span-6) */}
            <div className="col-span-6 card-glass" style={{ padding: 40, textAlign: "left" }}>
              <div style={{ display: "inline-block", background: "rgba(255,85,0,0.12)", color: "#FF5500", padding: "4px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                ÉCONOMIE LOCALE
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", marginBottom: 10 }}>CAPTEN Spots</h3>
              <p className="body-text" style={{ fontSize: "0.98rem", marginBottom: 24 }}>
                Graphiques et badges prouvant l&apos;impact de votre volume de membres auprès des cafés et shops partenaires.
              </p>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 18, padding: 18, border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>☕</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>Café du Cycliste</div>
                    <div style={{ fontSize: 13, color: "#22C55E", fontWeight: 700 }}>-15% consommations</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1", background: "rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: 9999 }}>
                  34 cafés débloqués
                </div>
              </div>
            </div>

            {/* Carte 4 (Col-span-6) */}
            <div className="col-span-6 card-glass" style={{ padding: 40, textAlign: "left" }}>
              <div style={{ display: "inline-block", background: "rgba(255,85,0,0.12)", color: "#FF5500", padding: "4px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                UNIFORME &amp; UNIVERSEL
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", marginBottom: 10 }}>Multisport par Nature</h3>
              <p className="body-text" style={{ fontSize: "0.98rem", marginBottom: 24 }}>
                Gestion uniforme conçue aussi bien pour le trail, la randonnée en altitude que les marches sociales en ville.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ borderRadius: 16, overflow: "hidden", height: 115, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <img src="/landing/trail-ridge-peak.jpg" alt="Trail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ borderRadius: 16, overflow: "hidden", height: 115, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <img src="/landing/community-happy-girls.jpg" alt="Social Walk" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 6. COMPARATIF "SANS vs AVEC CAPTEN" ═══════════ */}
      <section id="comparison" style={{ padding: "90px 0" }}>
        <div className="container-lux text-center">
          <h2 className="h2-lux text-gradient-white" style={{ maxWidth: 660, margin: "0 auto 16px" }}>
            Pourquoi adopter CAPTEN ?
          </h2>
          <p className="body-text" style={{ maxWidth: 520, margin: "0 auto 52px" }}>
            La différence entre l&apos;improvisation sur WhatsApp et une gestion professionnelle.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, textAlign: "left" }}>
            {/* Gauche (Incomplet) */}
            <div className="card-glass" style={{ padding: 44, opacity: 0.85 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: "#EF4444", marginBottom: 24 }}>
                <X size={22} color="#EF4444" /> SANS CAPTEN (WhatsApp)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  "Zéro registre de présence horodaté en cas de contrôle",
                  "Stress permanent de la responsabilité en cas d'accident",
                  "Aucune donnée de santé ou contact d'urgence disponible",
                  "Châtiment WhatsApp : 80 messages/jour pour un lieu de RDV",
                  "Aucune valeur mesurable à faire valoir auprès des partenaires"
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "#94A3B8", fontWeight: 500 }}>
                    <span style={{ color: "#EF4444", fontWeight: 800 }}>✕</span> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Droite (CAPTEN) */}
            <div className="card-glass" style={{
              padding: 44, borderColor: "rgba(255, 85, 0, 0.4)",
              background: "linear-gradient(180deg, rgba(255,85,0,0.06) 0%, rgba(18,18,22,0.9) 100%)",
              boxShadow: "0 25px 50px -10px rgba(255,85,0,0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: "#FF5500", marginBottom: 24 }}>
                <Check size={22} color="#FF5500" /> AVEC CAPTEN (Sérénité)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  "Check-in GPS automatique & registre horodaté verrouillé",
                  "Couverture légale claire et sérénité totale pour l'admin",
                  "Fiches d'urgence ICE accessibles instantanément hors-ligne",
                  "Logistique centralisée sans pollution de discussions",
                  "Remises exclusives et impact commerçant mesuré"
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "#F8FAFC", fontWeight: 600 }}>
                    <span style={{ color: "#22C55E", fontWeight: 800 }}>✓</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 7. FAQ & FINAL CTA ═══════════ */}
      <section id="faq" style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div className="container-lux">
          {/* FAQ Header */}
          <div className="text-center" style={{ maxWidth: 640, margin: "0 auto 56px" }}>
            <h2 className="h2-lux text-gradient-white" style={{ marginBottom: 12 }}>
              Questions fréquentes
            </h2>
            <p className="body-text" style={{ fontSize: 16 }}>
              Les réponses essentielles avant de rejoindre la Bêta.
            </p>
          </div>

          {/* Accordion */}
          <div style={{ maxWidth: 780, margin: "0 auto 90px" }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: "100%", padding: "24px 0", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#FFFFFF",
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  {f.q}
                  {openFaq === i ? <ChevronUp size={18} color="#FF5500" /> : <ChevronDown size={18} color="#94A3B8" />}
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 24, fontSize: 14, color: "#94A3B8", lineHeight: 1.65 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Call to Action Box */}
          <div className="card-glass" style={{
            padding: "72px 40px", textAlign: "center", position: "relative", overflow: "hidden",
            borderColor: "rgba(255, 85, 0, 0.3)",
            background: "radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.18) 0%, rgba(18,18,22,0.95) 70%)"
          }}>
            <h2 className="h2-lux text-gradient-white" style={{ marginBottom: 16 }}>
              Ton crew mérite mieux qu&apos;un fil de discussion.
            </h2>
            <p className="body-text" style={{ maxWidth: 500, margin: "0 auto 40px" }}>
              Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements dès aujourd&apos;hui.
            </p>
            <Link href="/login?mode=signup" className="btn-neon-orange" style={{ fontSize: 18, padding: "18px 48px" }}>
              Commencer l&apos;expérience CAPTEN <ArrowRight size={18} />
            </Link>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 90, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: 13, color: "#64748B" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.png" alt="CAPTEN" style={{ height: 22, filter: "brightness(0) invert(1)" }} />
              <span>© 2026 CAPTEN. Tous droits réservés.</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {[["CGU", "/cgu"], ["RGPD", "/rgpd"], ["Mentions Légales", "/mentions-legales"], ["Support", "/support"]].map(([l, h], i) => (
                <Link key={i} href={h} style={{ color: "#64748B", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
                  onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>{l}</Link>
              ))}
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}
