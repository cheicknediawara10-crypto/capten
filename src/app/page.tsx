"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, AlertTriangle, Check, X,
  ChevronDown, ChevronUp, ArrowRight, QrCode, MapPin,
  Users, Sparkles, Coffee, PhoneCall, Shield, Activity
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Modern SaaS Landing Page V10
   - Clean, elegant typography (Inter / Plus Jakarta Sans)
   - NO slanted text, NO forced uppercase headings, NO developer jargon
   - High contrast, crisp card layouts with soft shadows
   - Beautiful product showcase without awkward bounding boxes
═══════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background-color: #FAFAFA;
    color: #0F172A;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }

  /* ── Container ── */
  .container-main {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ── Typography ── */
  .h1-hero {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 3.5rem; font-weight: 800; line-height: 1.12;
    letter-spacing: -0.03em; color: #0F172A;
    font-style: normal; text-transform: none;
  }
  .h2-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 2.25rem; font-weight: 800; line-height: 1.2;
    letter-spacing: -0.02em; color: #0F172A;
    font-style: normal; text-transform: none;
  }
  .h2-title-white {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 2.25rem; font-weight: 800; line-height: 1.2;
    letter-spacing: -0.02em; color: #FFFFFF;
    font-style: normal; text-transform: none;
  }
  .sub-hero {
    font-size: 1.15rem; font-weight: 400; color: #475569;
    line-height: 1.6; max-width: 620px; margin: 0 auto;
  }
  .text-orange { color: #FF5500; }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 15px 32px; border-radius: 9999px; border: none;
    background: #FF5500; color: #FFFFFF;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px;
    cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 4px 14px rgba(255, 85, 0, 0.3);
  }
  .btn-primary:hover {
    background: #E04D00; transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(255, 85, 0, 0.4);
  }
  .btn-primary.btn-nav {
    padding: 9px 20px; font-size: 14px; box-shadow: none;
  }

  .btn-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 15px 28px; border-radius: 9999px;
    background: #FFFFFF; color: #0F172A;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px;
    border: 1px solid #E2E8F0; cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  }
  .btn-secondary:hover {
    border-color: #CBD5E1; background: #F8FAFC; transform: translateY(-1px);
  }

  /* ── Cards System ── */
  .card-white {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    transition: all 0.25s ease;
  }
  .card-white:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
    border-color: #CBD5E1;
  }

  .card-dark {
    background: #0F172A;
    border: 1px solid #1E293B;
    border-radius: 20px;
    color: #FFFFFF;
  }

  /* ── Animations ── */
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  .animate-float { animation: floatSlow 4s ease-in-out infinite; }

  /* ── Ticker ── */
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ticker-wrap {
    display: flex; overflow: hidden; user-select: none;
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  }
  .ticker-move {
    display: flex; gap: 48px; flex-shrink: 0;
    animation: ticker 30s linear infinite;
    align-items: center;
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .h1-hero { font-size: 2.75rem; }
    .h2-title, .h2-title-white { font-size: 1.85rem; }
    .grid-3col { grid-template-columns: 1fr !important; }
    .grid-2col { grid-template-columns: 1fr !important; }
    .nav-links-d { display: none !important; }
  }
  @media (max-width: 640px) {
    .h1-hero { font-size: 2.15rem; }
    .h2-title, .h2-title-white { font-size: 1.6rem; }
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
      a: "Non. Vos membres scannent un QR Code au rassemblement ou cliquent sur votre lien unique. Leur fiche ICE est renseignée en 30 secondes directement dans le navigateur mobile."
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

      {/* ═══════════ NAVBAR ═══════════ */}
      <div style={{ position: "fixed", top: 16, left: 0, right: 0, zIndex: 100, padding: "0 24px" }}>
        <nav className="container-main" style={{
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: "1px solid #E2E8F0", borderRadius: 9999,
          padding: "0 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 24 }} />
          </Link>

          <div className="nav-links-d" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Fonctionnalités", "#features"], ["Sécurité ICE", "#security"], ["Comparatif", "#comparison"], ["FAQ", "#faq"]].map(([l, h], i) => (
              <a key={i} href={h} style={{ fontSize: 14, fontWeight: 500, color: "#64748B", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#FF5500"}
                onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>{l}</a>
            ))}
          </div>

          <Link href="/login?mode=signup" className="btn-primary btn-nav">
            Tester la Bêta
          </Link>
        </nav>
      </div>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <header style={{ paddingTop: 130, paddingBottom: 64, textAlign: "center" }}>
        <div className="container-main">
          {/* Tagline */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 9999,
            background: "#FFFFFF", border: "1px solid #E2E8F0",
            fontSize: 13, fontWeight: 600, color: "#0F172A",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)", marginBottom: 20
          }}>
            <span className="text-orange">⚡</span> La plateforme sécurité &amp; check-in des capitaines
          </div>

          {/* Sport Badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { emoji: "🏃", label: "Run Club" },
              { emoji: "🚶", label: "Social Walk" },
              { emoji: "🥾", label: "Trail & Rando" },
              { emoji: "🚴", label: "Cyclisme" }
            ].map((s, i) => (
              <span key={i} style={{
                background: "rgba(255, 85, 0, 0.08)", color: "#FF5500", border: "1px solid rgba(255, 85, 0, 0.15)",
                padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600
              }}>
                {s.emoji} {s.label}
              </span>
            ))}
          </div>

          {/* Title */}
          <div style={{ maxWidth: 840, margin: "0 auto 20px" }}>
            <h1 className="h1-hero">
              Tu as lancé ce crew pour bouger. <br />
              <span className="text-orange">Pas pour faire l&apos;admin.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="sub-hero" style={{ marginBottom: 32 }}>
            Gère tes rassemblements en 3 secondes, protège tes membres avec la fiche ICE et valorise ton impact local. Sans le chaos WhatsApp.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/login?mode=signup" className="btn-primary">
              Commencer Gratuitement <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn-secondary">
              Voir les fonctionnalités
            </a>
          </div>

          {/* Clean Mockup Display (No dark bounding box) */}
          <div style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
            <img
              src="/landing/hero-phones.png"
              alt="Application CAPTEN"
              style={{
                width: "100%", height: "auto", borderRadius: 20, display: "block",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)"
              }}
            />

            {/* Micro Badge 1 (Green) */}
            <div className="animate-float" style={{
              position: "absolute", top: "15%", left: "-2%",
              background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14,
              padding: "10px 16px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>🟢 42 présents</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>RDV République (19h30)</div>
              </div>
            </div>

            {/* Micro Badge 2 (Orange) */}
            <div className="animate-float" style={{
              position: "absolute", bottom: "12%", right: "-2%",
              background: "#0F172A", border: "1px solid #1E293B", borderRadius: 14,
              padding: "10px 16px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF"
            }}>
              <ShieldCheck size={18} color="#FF5500" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>🛡️ Fiches ICE vérifiées</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>Groupe O+ · Contact 1-clic</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ TICKER ═══════════ */}
      <section style={{ padding: "28px 0", background: "#FFFFFF", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
        <div className="ticker-wrap">
          <div className="ticker-move">
            {[
              "PARIS RUN CLUB", "URBAN WALKERS", "TRAIL SQUAD LYON", "COFFEE RIDE BORDEAUX",
              "SOCIAL ATHLETICS", "MARSEILLE RANDO", "RUN & CHILL #42", "CAPTEN SPOTS",
              "PARIS RUN CLUB", "URBAN WALKERS", "TRAIL SQUAD LYON", "COFFEE RIDE BORDEAUX"
            ].map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "#94A3B8", fontWeight: 700, fontSize: 13, letterSpacing: 1.5 }}>
                <span className="text-orange">●</span> {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM SECTION ═══════════ */}
      <section id="security" style={{ background: "#0F172A", color: "#FFFFFF", padding: "88px 0" }}>
        <div className="container-main text-center">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 9999,
            background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: 12, fontWeight: 600, color: "#EF4444", marginBottom: 16
          }}>
            <AlertTriangle size={14} /> Le risque de la responsabilité
          </div>

          <h2 className="h2-title-white" style={{ maxWidth: 720, margin: "0 auto 16px" }}>
            À 19h30 sur le trottoir, l&apos;amateurisme devient un risque.
          </h2>
          <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 560, margin: "0 auto 48px" }}>
            Ce qui sépare une simple sortie entre amis d&apos;un rassemblement sous votre responsabilité légale.
          </p>

          <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "left" }}>
            <div className="card-dark" style={{ padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FF5500", marginBottom: 12 }}>01. FLOU JURIDIQUE</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", marginBottom: 10 }}>Rassemblement non déclaré</h3>
              <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>
                Réunir 40 personnes sans registre d&apos;émargement horodaté engagerait votre responsabilité en cas d&apos;accident.
              </p>
            </div>

            <div className="card-dark" style={{ padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FF5500", marginBottom: 12 }}>02. URGENCE MÉDICALE</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", marginBottom: 10 }}>Antécédents inaccessibles</h3>
              <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>
                Un coureur chute. Les secours demandent ses allergies et son contact d&apos;urgence : personne dans le groupe ne sait répondre.
              </p>
            </div>

            <div className="card-dark" style={{ padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FF5500", marginBottom: 12 }}>03. CHAOS WHATSAPP</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", marginBottom: 10 }}>80 messages par jour</h3>
              <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>
                Les heures de RDV, tracés GPS et consignes de sécurité sont noyés au milieu des discussions sans fin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section id="features" style={{ padding: "88px 0" }}>
        <div className="container-main text-center">
          <h2 className="h2-title" style={{ maxWidth: 680, margin: "0 auto 16px" }}>
            Toutes les fonctionnalités dont votre club a besoin
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", maxWidth: 520, margin: "0 auto 48px" }}>
            Développé spécifiquement pour offrir une sérénité totale aux organisateurs de sports outdoor et urbains.
          </p>

          <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, textAlign: "left" }}>
            {/* Feature 1 */}
            <div className="card-white" style={{ padding: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,85,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500", marginBottom: 20 }}>
                <MapPin size={22} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>
                Check-in GPS &amp; Registre Horodaté
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, marginBottom: 20 }}>
                Validation automatique dès que le membre se trouve au point de RDV. Émargement conservé comme preuve officielle.
              </p>
              <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #E2E8F0" }}>
                <img src="/landing/card-step1.png" alt="Check-in GPS" style={{ width: "100%", height: 200, objectFit: "cover" }} />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card-dark" style={{ padding: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,85,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500", marginBottom: 20 }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 10 }}>
                Fiche ICE &amp; Gestes Réflexes
              </h3>
              <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, marginBottom: 20 }}>
                Groupe sanguin, allergies et contact 1-clic accessibles instantanément hors-ligne en cas d&apos;urgence.
              </p>
              <div style={{ background: "#1E293B", borderRadius: 14, padding: 16, border: "1px solid #334155" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Fiche Médicale d&apos;Urgence</div>
                <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4, fontWeight: 600 }}>⚠ Allergie : Pénicilline · Groupe O+</div>
                <div style={{ fontSize: 12, color: "#22C55E", marginTop: 8, fontWeight: 600 }}>💡 Rappel : PLS en cas de malaise</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card-white" style={{ padding: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,85,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500", marginBottom: 20 }}>
                <Coffee size={22} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>
                CAPTEN Spots &amp; Avantages
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, marginBottom: 20 }}>
                Valorisez votre volume de membres auprès des cafés et commerces de votre quartier avec des remises dédiées.
              </p>
              <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Café du Cycliste</div>
                  <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 600 }}>-15% consommations</div>
                </div>
                <span style={{ fontSize: 12, color: "#64748B", background: "#FFFFFF", padding: "4px 10px", borderRadius: 9999, border: "1px solid #E2E8F0" }}>34 cafés offerts</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card-white" style={{ padding: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,85,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500", marginBottom: 20 }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>
                Multisport &amp; Polyvalent
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, marginBottom: 20 }}>
                S&apos;adapte parfaitement à la rando en montagne, au trail technique, aux social walks et aux run clubs urbains.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <img src="/landing/trail-ridge-peak.jpg" alt="Trail" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 10 }} />
                <img src="/landing/community-happy-girls.jpg" alt="Social Walk" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 10 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ COMPARISON ═══════════ */}
      <section id="comparison" style={{ padding: "80px 0", background: "#FFFFFF" }}>
        <div className="container-main text-center">
          <h2 className="h2-title" style={{ maxWidth: 600, margin: "0 auto 16px" }}>
            La différence CAPTEN
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", maxWidth: 480, margin: "0 auto 48px" }}>
            Gérez votre communauté avec sérénité au lieu d&apos;improviser sur WhatsApp.
          </p>

          <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, textAlign: "left" }}>
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#EF4444", marginBottom: 20 }}>
                <X size={20} /> SANS CAPTEN (WhatsApp)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Aucun registre de présence horodaté en cas de contrôle",
                  "Stress permanent de la responsabilité en cas d'accident",
                  "Aucune donnée de santé ou contact d'urgence disponible",
                  "Discussions saturées de messages et infos perdues"
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#64748B" }}>
                    <span style={{ color: "#EF4444", fontWeight: 700 }}>✕</span> {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="card-dark" style={{ padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#FF5500", marginBottom: 20 }}>
                <Check size={20} /> AVEC CAPTEN
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Check-in GPS automatique & registre horodaté verrouillé",
                  "Couverture légale claire et sérénité pour l'organisateur",
                  "Fiches d'urgence ICE accessibles instantanément hors-ligne",
                  "Canal d'information structuré et remises commerçants"
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#F8FAFC", fontWeight: 500 }}>
                    <span style={{ color: "#22C55E", fontWeight: 700 }}>✓</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ & CTA ═══════════ */}
      <section id="faq" style={{ background: "#0F172A", color: "#FFFFFF", paddingTop: 88, paddingBottom: 56 }}>
        <div className="container-main">
          <div className="text-center" style={{ maxWidth: 600, margin: "0 auto 48px" }}>
            <h2 className="h2-title-white" style={{ marginBottom: 12 }}>
              Questions fréquentes
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 15 }}>
              Tout ce que vous devez savoir avant de lancer votre crew sur CAPTEN.
            </p>
          </div>

          <div style={{ maxWidth: 720, margin: "0 auto 80px" }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: "1px solid #1E293B" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: "100%", padding: "20px 0", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {f.q}
                  {openFaq === i ? <ChevronUp size={18} color="#FF5500" /> : <ChevronDown size={18} color="#64748B" />}
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 20, fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final CTA Box */}
          <div style={{
            background: "#1E293B", border: "1px solid #334155", borderRadius: 24,
            padding: "56px 32px", textAlign: "center"
          }}>
            <h2 className="h2-title-white" style={{ marginBottom: 16 }}>
              Ton crew mérite mieux qu&apos;un fil de discussion.
            </h2>
            <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 460, margin: "0 auto 32px" }}>
              Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements dès aujourd&apos;hui.
            </p>
            <Link href="/login?mode=signup" className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
              Commencer l&apos;expérience CAPTEN <ArrowRight size={16} />
            </Link>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 72, paddingTop: 32, borderTop: "1px solid #1E293B", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: 13, color: "#64748B" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/logo.png" alt="CAPTEN" style={{ height: 20, filter: "brightness(0) invert(1)" }} />
              <span>© 2026 CAPTEN. Tous droits réservés.</span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[["CGU", "/cgu"], ["RGPD", "/rgpd"], ["Mentions Légales", "/mentions-legales"], ["Support", "/support"]].map(([l, h], i) => (
                <Link key={i} href={h} style={{ color: "#64748B" }}>{l}</Link>
              ))}
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}
