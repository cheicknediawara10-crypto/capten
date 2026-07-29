"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, AlertTriangle, MessageSquare, Check, X,
  ChevronDown, ChevronUp, ArrowRight, QrCode, MapPin,
  Users, HeartPulse, Sparkles, Activity, Coffee, Shield, PhoneCall
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Landing Page V7 (SaaS Premium 2026)
   - Palette: #F4F4F5 canvas · #FFFFFF cards (rounded-3xl) · #09090B dark sections · #FF5500 neon accent
   - Typography: Plus Jakarta Sans (Headings & Body)
   - Layout: Sticky Glassmorphism Nav, 3D Hero + Overlaid Badges, Ticker Marquee,
             Dark Problem Section, Bento Grid Solution, Split Comparison, FAQ & Dark Final CTA.
═══════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background-color: #F4F4F5;
    color: #09090B;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }

  /* ── Spacing Container ── */
  .container-custom {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ── Buttons ── */
  .btn-orange {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 36px; border-radius: 9999px; border: none;
    background: #FF5500; color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 16px;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 25px -5px rgba(255, 85, 0, 0.4);
  }
  .btn-orange:hover {
    background: #E04B00; transform: translateY(-2px);
    box-shadow: 0 16px 32px -6px rgba(255, 85, 0, 0.5);
  }
  .btn-orange-sm {
    padding: 10px 22px; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 85, 0, 0.25);
  }

  .btn-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 32px; border-radius: 9999px;
    background: #FFFFFF; color: #09090B;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 16px;
    border: 1px solid #E4E4E7; cursor: pointer; transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .btn-secondary:hover {
    border-color: #A1A1AA; transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  }

  /* ── Card Base ── */
  .card-premium {
    background: #FFFFFF;
    border: 1px solid #E4E4E7;
    border-radius: 24px;
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  .card-premium:hover {
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.08);
  }

  /* ── Float Animation ── */
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

  /* ── Marquee Ticker ── */
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
    animation: ticker 25s linear infinite;
    align-items: center;
  }

  /* ── Typography Helpers ── */
  .h1-hero {
    font-size: 3.5rem; font-weight: 800; line-height: 1.1;
    letter-spacing: -0.03em; color: #09090B;
  }
  .h2-section {
    font-size: 2.5rem; font-weight: 800; line-height: 1.15;
    letter-spacing: -0.02em;
  }
  .body-lead {
    font-size: 1.15rem; font-weight: 500; color: #52525B; line-height: 1.6;
  }

  /* ── Bento Grid Responsive ── */
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
  }
  .col-8 { grid-column: span 8; }
  .col-4 { grid-column: span 4; }
  .col-6 { grid-column: span 6; }

  @media (max-width: 1024px) {
    .h1-hero { font-size: 2.75rem; }
    .h2-section { font-size: 2rem; }
    .col-8, .col-4, .col-6 { grid-column: span 12; }
    .bento-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .h1-hero { font-size: 2.15rem; }
    .h2-section { font-size: 1.65rem; }
    .nav-links-d { display: none !important; }
  }
`;

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Est-ce gratuit pendant la phase Bêta ?",
      a: "Oui ! L'accès à CAPTEN est 100% gratuit pendant toute la période Bêta pour les créateurs et capitaines de club. Vous bénéficiez de 21 jours d'essai complet sans carte bancaire."
    },
    {
      q: "Mes membres doivent-ils télécharger une application ?",
      a: "Non. C'est l'un des points forts de CAPTEN : vos membres scannent un QR Code au rassemblement ou cliquent sur un lien. La fiche ICE est remplie en 30 secondes directement dans le navigateur."
    },
    {
      q: "Comment sont protégées les données médicales (ICE) ?",
      a: "Les fiches ICE sont chiffrées de bout en bout et hébergées conformément au RGPD. Elles ne sont consultables que par le Capitaine lors d'une session active et verrouillée."
    },
    {
      q: "L'application fonctionne-t-elle sans réseau (hors-ligne) ?",
      a: "Absolument. Les données de votre session et les fiches d'urgence ICE de vos membres sont sauvegardées localement sur votre téléphone. Utile en rando, trail ou montagne."
    }
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ═══════════ 1. NAVIGATION STICKY (Glassmorphism) ═══════════ */}
      <div style={{ position: "fixed", top: 20, left: 0, right: 0, zIndex: 100, padding: "0 24px" }}>
        <nav className="container-custom" style={{
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(228, 228, 231, 0.8)", borderRadius: 9999,
          padding: "0 24px", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 26 }} />
          </Link>

          {/* Links */}
          <div className="nav-links-d" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Sécurité ICE", "#problem"], ["Fonctionnalités", "#solution"], ["Comparatif", "#comparison"], ["FAQ", "#faq"]].map(([l, h], i) => (
              <a key={i} href={h} style={{ fontSize: 14, fontWeight: 600, color: "#52525B", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#FF5500"}
                onMouseLeave={e => e.currentTarget.style.color = "#52525B"}>{l}</a>
            ))}
          </div>

          {/* CTA */}
          <Link href="/login?mode=signup" className="btn-orange btn-orange-sm">
            Tester la Bêta
          </Link>
        </nav>
      </div>

      {/* ═══════════ 2. HERO SECTION ═══════════ */}
      <header style={{ paddingTop: 140, paddingBottom: 80, position: "relative" }}>
        <div className="container-custom text-center">
          {/* Top Tagline Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 9999,
            background: "#FFFFFF", border: "1px solid #E4E4E7",
            fontSize: 13, fontWeight: 700, color: "#09090B",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 20
          }}>
            <span style={{ color: "#FF5500" }}>⚡</span> La plateforme Bêta pour Capitaines &amp; Organisateurs
          </div>

          {/* Multisports Pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { emoji: "🏃", label: "Run Club" },
              { emoji: "🚶", label: "Social Walk" },
              { emoji: "🥾", label: "Trail & Rando" },
              { emoji: "🚴", label: "Cyclisme" }
            ].map((s, i) => (
              <span key={i} style={{
                background: "rgba(255, 85, 0, 0.08)", color: "#FF5500", border: "1px solid rgba(255, 85, 0, 0.15)",
                padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700
              }}>
                {s.emoji} {s.label}
              </span>
            ))}
          </div>

          {/* H1 Heading */}
          <div style={{ maxWidth: 860, margin: "0 auto 20px" }}>
            <h1 className="h1-hero">
              Tu as lancé ce crew pour bouger. <br style={{ display: "none" }} />
              <span style={{ color: "#FF5500" }}>Pas pour faire l&apos;admin.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="body-lead" style={{ maxWidth: 640, margin: "0 auto 36px" }}>
            Gère tes rassemblements, protège tes membres avec la fiche ICE et valorise ton impact local. Sans le chaos WhatsApp.
          </p>

          {/* CTA Block */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 60 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/login?mode=signup" className="btn-orange">
                Commencer Gratuitement <ArrowRight size={18} />
              </Link>
              <a href="#solution" className="btn-secondary">
                Voir la démonstration
              </a>
            </div>

            {/* Micro Social Proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <div style={{ display: "flex" }}>
                {["/landing/urban-runclub.jpg", "/landing/community-happy-girls.jpg", "/landing/trail-ridge-peak.jpg"].map((src, i) => (
                  <img key={i} src={src} alt="Capitaine" style={{
                    width: 30, height: 30, borderRadius: "50%", border: "2px solid #FFFFFF", objectFit: "cover",
                    marginLeft: i > 0 ? -10 : 0
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#71717A" }}>
                Utilisé par <strong style={{ color: "#09090B" }}>150+ crews</strong> en France
              </span>
            </div>
          </div>

          {/* 3D Hero Mockup with Overlaid Micro-Widgets */}
          <div style={{ position: "relative", maxWidth: 940, margin: "0 auto" }}>
            {/* Phone Base Image */}
            <div className="card-premium" style={{ overflow: "hidden", padding: 12, background: "#09090B", borderColor: "#27272A" }}>
              <img src="/landing/hero-phones.png" alt="CAPTEN App Showcase" style={{ width: "100%", height: "auto", borderRadius: 16, display: "block" }} />
            </div>

            {/* Overlaid Micro-Widget 1 (Green - Live Presence) */}
            <div className="animate-float" style={{
              position: "absolute", top: "18%", left: "-4%", zIndex: 10,
              background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 16,
              padding: "12px 18px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 10px #22C55E" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#09090B" }}>🟢 42 présents</div>
                <div style={{ fontSize: 11, color: "#71717A", fontWeight: 500 }}>RDV République (19h30)</div>
              </div>
            </div>

            {/* Overlaid Micro-Widget 2 (Orange - ICE Verified) */}
            <div className="animate-float-reverse" style={{
              position: "absolute", bottom: "14%", right: "-4%", zIndex: 10,
              background: "#09090B", border: "1px solid #27272A", borderRadius: 16,
              padding: "12px 18px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
              display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF"
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255, 85, 0, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500" }}>
                <ShieldCheck size={20} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>🛡️ Fiche ICE vérifiée</div>
                <div style={{ fontSize: 11, color: "#A1A1AA" }}>Groupe O+ · Contact urgence 1-clic</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ 3. BANDEAU DE PROUVES SOCIALES (Ticker) ═══════════ */}
      <section style={{ padding: "36px 0", background: "#FFFFFF", borderTop: "1px solid #E4E4E7", borderBottom: "1px solid #E4E4E7" }}>
        <div className="ticker-wrap">
          <div className="ticker-move">
            {[
              "PARIS RUN CLUB", "URBAN WALKERS", "TRAIL SQUAD LYON", "COFFEE RIDE BORDEAUX",
              "SOCIAL ATHLETICS", "MARSEILLE RANDO", "RUN & CHILL #42", "CAPTEN SPOTS",
              "PARIS RUN CLUB", "URBAN WALKERS", "TRAIL SQUAD LYON", "COFFEE RIDE BORDEAUX"
            ].map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.5, fontWeight: 800, fontSize: 14, letterSpacing: 1.5 }}>
                <span style={{ color: "#FF5500" }}>●</span> {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4. SECTION PROBLÈME — "LE PIÈGE DU CLUB INFORMEL" (Dark #09090B) ═══════════ */}
      <section id="problem" style={{ background: "#09090B", color: "#FFFFFF", padding: "100px 0" }}>
        <div className="container-custom text-center">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 9999,
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
            fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 16
          }}>
            <AlertTriangle size={14} /> Le risque invisible
          </div>

          <h2 className="h2-section" style={{ color: "#FFFFFF", maxWidth: 760, margin: "0 auto 16px" }}>
            À 19h30 sur le trottoir, l&apos;amateurisme devient un risque.
          </h2>
          <p style={{ fontSize: 16, color: "#A1A1AA", maxWidth: 560, margin: "0 auto 56px" }}>
            Quand vous rassemblez 40 personnes chaque semaine sous le nom de votre club, vous n&apos;êtes plus juste des amis qui courent. Vous devenez responsable.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "left" }}>
            {/* Problem Card 1 */}
            <div style={{
              background: "#18181B", border: "1px solid #27272A", borderRadius: 24, padding: 32, textAlign: "left"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FF5500", marginBottom: 16 }}>01. LE FLOU JURIDIQUE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>Rassemblement non déclaré</h3>
              <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6 }}>
                Réunir 50 personnes sur la voie publique sans registre ni responsable identifié engage directement la responsabilité civile et pénale de l&apos;organisateur en cas d&apos;accident.
              </p>
            </div>

            {/* Problem Card 2 */}
            <div style={{
              background: "#18181B", border: "1px solid #27272A", borderRadius: 24, padding: 32, textAlign: "left"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FF5500", marginBottom: 16 }}>02. L&apos;URGENCE AVEUGLE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>Aucun antécédent sous la main</h3>
              <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6 }}>
                Un coureur fait un malaise à 19h30. Les pompiers arrivent et demandent ses allergies et son contact d&apos;urgence. Personne dans le groupe ne sait répondre.
              </p>
            </div>

            {/* Problem Card 3 */}
            <div style={{
              background: "#18181B", border: "1px solid #27272A", borderRadius: 24, padding: 32, textAlign: "left"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FF5500", marginBottom: 16 }}>03. LA NOYADE WHATSAPP</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>80 messages par jour</h3>
              <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6 }}>
                Les heures de RDV, les parcours et les consignes de sécurité sont constamment noyés au milieu des discussions. L&apos;information critique est toujours perdue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 5. SECTION SOLUTION — BENTO GRID DYNAMIQUE (#F4F4F5) ═══════════ */}
      <section id="solution" style={{ padding: "100px 0" }}>
        <div className="container-custom text-center">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 9999,
            background: "#FFFFFF", border: "1px solid #E4E4E7",
            fontSize: 12, fontWeight: 700, color: "#FF5500", marginBottom: 16
          }}>
            <Sparkles size={14} /> La suite tout-en-un
          </div>

          <h2 className="h2-section" style={{ maxWidth: 700, margin: "0 auto 16px" }}>
            Tout ce dont ton crew a besoin. <br />Dans une seule interface.
          </h2>
          <p className="body-lead" style={{ maxWidth: 540, margin: "0 auto 56px" }}>
            Conçu spécifiquement pour les capitaines de communauté sportive. Zéro superflu, 100% efficacité.
          </p>

          {/* BENTO GRID */}
          <div className="bento-grid">
            {/* Card 1: Check-in GPS (2/3 Width = col-8) */}
            <div className="col-8 card-premium" style={{ padding: 40, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "inline-block", background: "rgba(255,85,0,0.1)", color: "#FF5500", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                  ÉMARGEMENT AUTOMATIQUE
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#09090B", marginBottom: 12 }}>
                  Check-in GPS &amp; Registre Horodaté
                </h3>
                <p style={{ fontSize: 15, color: "#52525B", lineHeight: 1.6, maxWidth: 500 }}>
                  Validation automatique au point de rassemblement. Le registre d&apos;émargement est horodaté et verrouillé automatiquement pour vous fournir une preuve juridique de présence.
                </p>
              </div>
              <div style={{ marginTop: 32, borderRadius: 16, overflow: "hidden", border: "1px solid #E4E4E7", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }}>
                <img src="/landing/card-step1.png" alt="Check-in GPS" style={{ width: "100%", height: 260, objectFit: "cover", objectPosition: "top" }} />
              </div>
            </div>

            {/* Card 2: Fiche ICE (1/3 Width = col-4 - Medical Dark Style) */}
            <div className="col-4 card-premium" style={{ background: "#09090B", color: "#FFFFFF", borderColor: "#27272A", padding: 32, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#FF5500", letterSpacing: 1 }}>🛡️ SÉCURITÉ ICE</span>
                  <span style={{ background: "#FF5500", color: "#FFFFFF", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 900 }}>O+</span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 10 }}>Fiche d&apos;Urgence 1-Clic</h3>
                <p style={{ fontSize: 13, color: "#A1A1AA", lineHeight: 1.5, marginBottom: 20 }}>
                  Groupe sanguin, allergies et contact ICE accessibles en 1 tap par le Capitaine.
                </p>

                {/* Emergency Card Preview Widget */}
                <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>Sarah Jenkins</div>
                  <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginTop: 4 }}>⚠ Allergie : Pénicilline</div>
                  <div style={{ fontSize: 11, color: "#A1A1AA", marginTop: 2 }}>ICE : Marc (06 12 34 56 78)</div>
                </div>

                {/* First Aid Reminders */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12, fontSize: 11, color: "#D4D4D8", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontWeight: 700, color: "#56E39F" }}>💡 Rappel Gestes de Secours :</div>
                  <div>• Malaise : PLS (Position Latérale de Sécurité)</div>
                  <div>• Chute de tension : Jambes relevées à 45°</div>
                </div>
              </div>

              <div style={{ marginTop: 24, background: "#FF5500", borderRadius: 12, padding: "10px", textAlign: "center", fontSize: 12, fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <PhoneCall size={14} /> Contact Urgence Direct
              </div>
            </div>

            {/* Card 3: CAPTEN Spots (1/2 Width = col-6) */}
            <div className="col-6 card-premium" style={{ padding: 36, textAlign: "left" }}>
              <div style={{ display: "inline-block", background: "rgba(255,85,0,0.1)", color: "#FF5500", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                COMMERÇANTS LOCAUX
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#09090B", marginBottom: 10 }}>CAPTEN Spots &amp; Avantages</h3>
              <p style={{ fontSize: 14, color: "#52525B", lineHeight: 1.6, marginBottom: 20 }}>
                Valorisez la présence de votre club auprès des cafés et shops de votre quartier. Preuve de passage mesurable et remises exclusives.
              </p>
              <div style={{ background: "#F4F4F5", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>☕</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#09090B" }}>Café du Cycliste</div>
                    <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 700 }}>-15% consommations</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#71717A", background: "#FFFFFF", padding: "6px 12px", borderRadius: 9999 }}>
                  34 cafés offerts ce mois-ci
                </div>
              </div>
            </div>

            {/* Card 4: Multisport Native (1/2 Width = col-6) */}
            <div className="col-6 card-premium" style={{ padding: 36, textAlign: "left", overflow: "hidden", position: "relative" }}>
              <div style={{ display: "inline-block", background: "rgba(255,85,0,0.1)", color: "#FF5500", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                100% POLYVALENT
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#09090B", marginBottom: 10 }}>Multisport Native</h3>
              <p style={{ fontSize: 14, color: "#52525B", lineHeight: 1.6, marginBottom: 20 }}>
                Créé pour s&apos;adapter à toutes les disciplines : course à pied, randonnée en montagne, marche urbaine ou cyclisme.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ borderRadius: 14, overflow: "hidden", height: 110 }}>
                  <img src="/landing/trail-ridge-peak.jpg" alt="Trail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ borderRadius: 14, overflow: "hidden", height: 110 }}>
                  <img src="/landing/community-happy-girls.jpg" alt="Social Walk" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 6. COMPARATIF "SANS CAPTEN vs AVEC CAPTEN" (Split Cards) ═══════════ */}
      <section id="comparison" style={{ padding: "80px 0", background: "#FFFFFF" }}>
        <div className="container-custom text-center">
          <h2 className="h2-section" style={{ maxWidth: 640, margin: "0 auto 16px" }}>
            Pourquoi changer vos habitudes ?
          </h2>
          <p className="body-lead" style={{ maxWidth: 500, margin: "0 auto 48px" }}>
            Découvrez la différence entre gérer un groupe à l&apos;instinct et piloter un crew avec CAPTEN.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, textAlign: "left" }}>
            {/* Left: SANS CAPTEN */}
            <div style={{
              background: "#FAFAFA", border: "1px solid #E4E4E7", borderRadius: 24, padding: 40
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: "#EF4444", marginBottom: 24 }}>
                <X size={22} color="#EF4444" /> SANS CAPTEN (Club Informel)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Registre de présence inexistant ou papier volant perdu",
                  "Stress permanent de la responsabilité en cas d'accident",
                  "Aucune donnée médicale disponible en urgence à 19h30",
                  "Discussions WhatsApp saturées (80 messages par jour)",
                  "Zero valeur mesurable à présenter aux cafés ou sponsors"
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "#71717A", fontWeight: 500 }}>
                    <span style={{ color: "#EF4444", fontWeight: 800 }}>✕</span> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: AVEC CAPTEN */}
            <div style={{
              background: "#09090B", color: "#FFFFFF", border: "1px solid #27272A", borderRadius: 24, padding: 40,
              boxShadow: "0 20px 40px -10px rgba(255,85,0,0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: "#FF5500", marginBottom: 24 }}>
                <Check size={22} color="#FF5500" /> AVEC CAPTEN (Capitaine Sérénité)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Check-in GPS automatique & registre horodaté verrouillé",
                  "Tranquillité d'esprit totale et couverture légale claire",
                  "Fiches d'urgence ICE accessibles en 1 tap hors-ligne",
                  "Canal d'information structuré sans spam de messages",
                  "Remises exclusives et impact mesurable chez les commerçants"
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "#E4E4E7", fontWeight: 600 }}>
                    <span style={{ color: "#22C55E", fontWeight: 800 }}>✓</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 7. FAQ & FOOTER (Dark #09090B) ═══════════ */}
      <section id="faq" style={{ background: "#09090B", color: "#FFFFFF", paddingTop: 100, paddingBottom: 60 }}>
        <div className="container-custom">
          {/* FAQ Header */}
          <div className="text-center" style={{ maxWidth: 640, margin: "0 auto 56px" }}>
            <h2 className="h2-section" style={{ color: "#FFFFFF", marginBottom: 12 }}>
              Questions fréquentes
            </h2>
            <p style={{ color: "#A1A1AA", fontSize: 16 }}>
              Tout ce que vous devez savoir avant de lancer votre crew sur CAPTEN.
            </p>
          </div>

          {/* Accordion */}
          <div style={{ maxWidth: 760, margin: "0 auto 90px" }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: "1px solid #27272A" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: "100%", padding: "24px 0", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#FFFFFF",
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  {f.q}
                  {openFaq === i ? <ChevronUp size={18} color="#FF5500" /> : <ChevronDown size={18} color="#71717A" />}
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 24, fontSize: 14, color: "#A1A1AA", lineHeight: 1.6 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Call to Action */}
          <div style={{
            background: "linear-gradient(135deg, #18181B 0%, #09090B 100%)",
            border: "1px solid #27272A", borderRadius: 32, padding: "64px 32px",
            textAlign: "center", position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
              width: 500, height: 300, background: "radial-gradient(circle, rgba(255,85,0,0.15) 0%, transparent 70%)",
              pointerEvents: "none"
            }} />

            <h2 className="h2-section" style={{ color: "#FFFFFF", marginBottom: 16 }}>
              Ton crew mérite mieux qu&apos;un fil de discussion.
            </h2>
            <p style={{ fontSize: 16, color: "#A1A1AA", maxWidth: 480, margin: "0 auto 36px" }}>
              Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs dès aujourd&apos;hui.
            </p>
            <Link href="/login?mode=signup" className="btn-orange" style={{ fontSize: 17, padding: "18px 44px" }}>
              Rejoindre la Bêta Gratuite <ArrowRight size={18} />
            </Link>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 80, paddingTop: 40, borderTop: "1px solid #27272A", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: 13, color: "#71717A" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.png" alt="CAPTEN" style={{ height: 22, filter: "brightness(0) invert(1)" }} />
              <span>© 2026 CAPTEN. Tous droits réservés.</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {[["CGU", "/cgu"], ["RGPD", "/rgpd"], ["Mentions Légales", "/mentions-legales"], ["Support", "/support"]].map(([l, h], i) => (
                <Link key={i} href={h} style={{ color: "#71717A", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
                  onMouseLeave={e => e.currentTarget.style.color = "#71717A"}>{l}</Link>
              ))}
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}
