"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, AlertTriangle, Check, X,
  ChevronDown, ChevronUp, ArrowRight, QrCode, MapPin,
  Users, Sparkles, Coffee, PhoneCall, Shield
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Landing Page (Dribbble 2026 Mobile-First SaaS Standards)
   - Canvas Background : #F8F9FA (Off-white / Light Slate)
   - Dark Rupture     : #0F172A (Dark Slate) & bg-slate-900/80
   - Accent Primary   : #FF5500 (Vibrant Neon Orange - 10% max)
   - Cards Light      : #FFFFFF + border 1px solid rgba(0,0,0,0.06) + rounded-3xl (24px)
   - Shadow           : 0 20px 40px -15px rgba(0,0,0,0.05)
   - Typography       : Plus Jakarta Sans (Headings & Body)
═══════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background-color: #F8F9FA;
    color: #0F172A;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }

  /* ── Spacing Container ── */
  .container-dribbble {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ── Buttons (10% Orange Neon Accent) ── */
  .btn-orange-pill {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    padding: 16px 36px; border-radius: 9999px; border: none;
    background: #FF5500; color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 16px;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 12px 28px -6px rgba(255, 85, 0, 0.4);
  }
  .btn-orange-pill:hover {
    background: #E04B00; transform: translateY(-2px);
    box-shadow: 0 18px 36px -6px rgba(255, 85, 0, 0.5);
  }
  .btn-orange-pill.btn-nav {
    padding: 10px 22px; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 85, 0, 0.25);
  }

  .btn-white-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 32px; border-radius: 9999px;
    background: #FFFFFF; color: #0F172A;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 16px;
    border: 1px solid rgba(0, 0, 0, 0.08); cursor: pointer; transition: all 0.25s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }
  .btn-white-secondary:hover {
    border-color: rgba(0, 0, 0, 0.18); transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  /* ── Cards Dribbble 2026 Style ── */
  .card-dribbble {
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 24px;
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .card-dribbble:hover {
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.09);
    border-color: rgba(0, 0, 0, 0.12);
  }

  .card-dark-slate {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid #1E293B;
    border-radius: 24px;
    color: #FFFFFF;
    transition: all 0.3s ease;
  }
  .card-dark-slate:hover {
    border-color: #334155;
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

  /* ── Typography (Dribbble 2026 Standards) ── */
  .h1-dribbble {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 3.6rem; font-weight: 800; line-height: 1.1;
    letter-spacing: -0.035em; color: #0F172A;
  }
  .h2-dribbble {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 2.5rem; font-weight: 800; line-height: 1.18;
    letter-spacing: -0.025em; color: #0F172A;
  }
  .h2-dribbble-white {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 2.5rem; font-weight: 800; line-height: 1.18;
    letter-spacing: -0.025em; color: #FFFFFF;
  }
  .sub-dribbble {
    font-size: 1.15rem; font-weight: 500; color: #64748B; line-height: 1.65;
  }
  .text-body {
    font-size: 0.975rem; font-weight: 500; color: #4B5563; line-height: 1.6;
  }

  /* ── Bento Grid ── */
  .bento-grid-2026 {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
  }
  .bento-col-8 { grid-column: span 8; }
  .bento-col-4 { grid-column: span 4; }
  .bento-col-6 { grid-column: span 6; }

  @media (max-width: 1024px) {
    .h1-dribbble { font-size: 2.75rem; }
    .h2-dribbble, .h2-dribbble-white { font-size: 2rem; }
    .bento-col-8, .bento-col-4, .bento-col-6 { grid-column: span 12; }
    .bento-grid-2026 { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .h1-dribbble { font-size: 2.15rem; }
    .h2-dribbble, .h2-dribbble-white { font-size: 1.65rem; }
    .nav-links-dribbble { display: none !important; }
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
      a: "Non. C'est l'une des forces majeures de CAPTEN : vos membres scannent un QR Code au rassemblement ou cliquent sur votre lien unique. Leur fiche ICE est renseignée en 30 secondes dans le navigateur."
    },
    {
      q: "Comment sont protégées les données médicales (ICE) ?",
      a: "Les fiches ICE sont chiffrées de bout en bout et conservées en stricte conformité RGPD. Elles ne sont visibles que par le Capitaine lors d'une session active et verrouillée."
    },
    {
      q: "CAPTEN fonctionne-t-il hors connexion (sans réseau) ?",
      a: "Absolument. Les données de session et les fiches d'urgence ICE de vos membres sont conservées en cache local sur votre smartphone. Idéal pour les sorties rando, trail et montagne."
    }
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ═══════════ 1. NAVBAR (Floating Glassmorphism) ═══════════ */}
      <div style={{ position: "fixed", top: 20, left: 0, right: 0, zIndex: 100, padding: "0 24px" }}>
        <nav className="container-dribbble" style={{
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 0, 0, 0.06)", borderRadius: 9999,
          padding: "0 24px", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 26 }} />
          </Link>

          {/* Links */}
          <div className="nav-links-dribbble" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Fonctionnalités", "#features"], ["Risque & Sécurité", "#risk"], ["Comparatif", "#comparison"], ["FAQ", "#faq"]].map(([l, h], i) => (
              <a key={i} href={h} style={{ fontSize: 14, fontWeight: 600, color: "#64748B", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#FF5500"}
                onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>{l}</a>
            ))}
          </div>

          {/* CTA */}
          <Link href="/login?mode=signup" className="btn-orange-pill btn-nav">
            Tester la Bêta
          </Link>
        </nav>
      </div>

      {/* ═══════════ 2. HERO SECTION (Layout Asymétrique Premium) ═══════════ */}
      <header style={{ paddingTop: 140, paddingBottom: 80, position: "relative" }}>
        <div className="container-dribbble text-center">
          {/* Top Tagline Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 9999,
            background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)",
            fontSize: 13, fontWeight: 700, color: "#0F172A",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: 20
          }}>
            <span style={{ color: "#FF5500" }}>⚡</span> L&apos;outil de sécurité et check-in des capitaines
          </div>

          {/* Multisports Pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { emoji: "🏃", label: "Run" },
              { emoji: "🚶", label: "Social Walk" },
              { emoji: "🥾", label: "Trail & Rando" },
              { emoji: "🚴", label: "Cyclisme" }
            ].map((s, i) => (
              <span key={i} style={{
                background: "rgba(255, 85, 0, 0.08)", color: "#FF5500", border: "1px solid rgba(255, 85, 0, 0.15)",
                padding: "4px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 700
              }}>
                {s.emoji} {s.label}
              </span>
            ))}
          </div>

          {/* H1 Heading */}
          <div style={{ maxWidth: 880, margin: "0 auto 20px" }}>
            <h1 className="h1-dribbble">
              Tu as lancé ce crew pour bouger. <br />
              <span style={{ color: "#FF5500" }}>Pas pour faire l&apos;admin.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="sub-dribbble" style={{ maxWidth: 620, margin: "0 auto 36px" }}>
            Gère tes rassemblements en 3 secondes, protège tes membres avec la fiche ICE et valorise ton impact local.
          </p>

          {/* CTA Zone */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 60 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/login?mode=signup" className="btn-orange-pill">
                Rejoindre la Bêta Gratuite <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-white-secondary">
                Voir la démonstration
              </a>
            </div>

            {/* Micro Reassurance */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <div style={{ display: "flex" }}>
                {["/landing/urban-runclub.jpg", "/landing/community-happy-girls.jpg", "/landing/trail-ridge-peak.jpg"].map((src, i) => (
                  <img key={i} src={src} alt="Capitaine" style={{
                    width: 30, height: 30, borderRadius: "50%", border: "2px solid #FFFFFF", objectFit: "cover",
                    marginLeft: i > 0 ? -10 : 0
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>
                Adopté par <strong style={{ color: "#0F172A" }}>150+ crews</strong> en France
              </span>
            </div>
          </div>

          {/* Visuel Hero iPhone 16 Pro avec Micro-Widgets 3D */}
          <div style={{ position: "relative", maxWidth: 940, margin: "0 auto" }}>
            <div className="card-dribbble" style={{ overflow: "hidden", padding: 12, background: "#0F172A", borderColor: "#1E293B" }}>
              <img src="/landing/hero-phones.png" alt="Interface CAPTEN" style={{ width: "100%", height: "auto", borderRadius: 16, display: "block" }} />
            </div>

            {/* Bulle 1 (Verte - Présents) */}
            <div className="animate-float" style={{
              position: "absolute", top: "18%", left: "-4%", zIndex: 10,
              background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 18,
              padding: "12px 18px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 10px #22C55E" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>🟢 42 présents</div>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>RDV République (19h30)</div>
              </div>
            </div>

            {/* Bulle 2 (Orange - ICE Verification) */}
            <div className="animate-float-reverse" style={{
              position: "absolute", bottom: "14%", right: "-4%", zIndex: 10,
              background: "#0F172A", border: "1px solid #1E293B", borderRadius: 18,
              padding: "12px 18px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
              display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF"
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255, 85, 0, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500" }}>
                <ShieldCheck size={20} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>🛡️ Fiches ICE d&apos;urgence prêtes</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>Groupe O+ · Contact 1-clic</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ 3. SECTION 2 — "LE PIÈGE DU CLUB INFORMEL" (Dark Slate #0F172A) ═══════════ */}
      <section id="risk" style={{ background: "#0F172A", color: "#FFFFFF", padding: "100px 0" }}>
        <div className="container-dribbble text-center">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 9999,
            background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)",
            fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 16
          }}>
            <AlertTriangle size={14} /> Le risque de la responsabilité
          </div>

          <h2 className="h2-dribbble-white" style={{ maxWidth: 760, margin: "0 auto 16px" }}>
            À 19h30 sur le trottoir, l&apos;amateurisme devient un risque.
          </h2>
          <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 580, margin: "0 auto 56px" }}>
            Ce qui sépare une simple sortie entre amis d&apos;un rassemblement sous votre responsabilité.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "left" }}>
            {/* Card 1 */}
            <div className="card-dark-slate" style={{ padding: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FF5500", marginBottom: 16, letterSpacing: 1 }}>01. FLOU JURIDIQUE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>40 personnes sans registre</h3>
              <p className="text-body" style={{ color: "#94A3B8" }}>
                Rassemblement sur la voie publique sans preuve d&apos;émargement horodatée = responsabilité civile et pénale de l&apos;organisateur engagée en cas de litige.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-dark-slate" style={{ padding: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FF5500", marginBottom: 16, letterSpacing: 1 }}>02. URGENCE MÉDICALE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>Antécédents inaccessibles</h3>
              <p className="text-body" style={{ color: "#94A3B8" }}>
                Un membre chute. Les secours demandent ses allergies et le contact de ses proches : au milieu du groupe, personne ne possède l&apos;information.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-dark-slate" style={{ padding: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FF5500", marginBottom: 16, letterSpacing: 1 }}>03. CHAOS WHATSAPP</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 12 }}>80 messages par jour</h3>
              <p className="text-body" style={{ color: "#94A3B8" }}>
                Les heures de RDV, les tracés GPS et les consignes de sécurité sont constamment noyés. L&apos;information critique finit toujours par être perdue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 4. SECTION 3 — BENTO GRID FONCTIONNALITÉS (#F8F9FA) ═══════════ */}
      <section id="features" style={{ padding: "100px 0" }}>
        <div className="container-dribbble text-center">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 9999,
            background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)",
            fontSize: 12, fontWeight: 700, color: "#FF5500", marginBottom: 16
          }}>
            <Sparkles size={14} /> La solution moderne
          </div>

          <h2 className="h2-dribbble" style={{ maxWidth: 700, margin: "0 auto 16px" }}>
            Bento Grid Fonctionnalités
          </h2>
          <p className="sub-dribbble" style={{ maxWidth: 540, margin: "0 auto 56px" }}>
            Une suite d&apos;outils ultra-clean développée pour offrir une sérénité totale aux organisateurs.
          </p>

          {/* BENTO GRID ASYMMÉTRIQUE */}
          <div className="bento-grid-2026">
            {/* Carte 1 (2/3 Width = bento-col-8) */}
            <div className="bento-col-8 card-dribbble" style={{ padding: 40, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "inline-block", background: "rgba(255,85,0,0.08)", color: "#FF5500", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                  CHECK-IN GPS AUTOMATIQUE
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
                  Check-in GPS &amp; Registre Horodaté
                </h3>
                <p className="text-body" style={{ maxWidth: 520 }}>
                  Validation automatique dès que le membre se trouve à moins de 50 mètres du point de RDV. Émargement verrouillé conservé comme preuve juridique.
                </p>
              </div>
              <div style={{ marginTop: 32, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
                <img src="/landing/card-step1.png" alt="Check-in GPS" style={{ width: "100%", height: 260, objectFit: "cover", objectPosition: "top" }} />
              </div>
            </div>

            {/* Carte 2 (1/3 Width = bento-col-4 - Dark Slate Accent) */}
            <div className="bento-col-4 card-dark-slate" style={{ padding: 32, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#FF5500", letterSpacing: 1 }}>🛡️ SÉCURITÉ ICE</span>
                  <span style={{ background: "#FF5500", color: "#FFFFFF", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 900 }}>O+</span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 10 }}>Fiche ICE &amp; Gestes Réflexes</h3>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5, marginBottom: 20 }}>
                  Accédez au groupe sanguin, allergies et contact 1-clic, avec les rappels réflexes.
                </p>

                {/* Emergency Card Preview */}
                <div style={{ background: "#09090B", border: "1px solid #1E293B", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>Sarah Jenkins</div>
                  <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginTop: 4 }}>⚠ Allergie : Pénicilline</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>ICE : Marc (06 12 34 56 78)</div>
                </div>

                {/* Gestes Réflexes */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12, fontSize: 11, color: "#CBD5E1", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontWeight: 700, color: "#22C55E" }}>💡 Fiches Réflexes de Secours :</div>
                  <div>• Malaise : PLS (Position Latérale de Sécurité)</div>
                  <div>• Chute de tension : Jambes relevées à 45°</div>
                </div>
              </div>

              <div style={{ marginTop: 24, background: "#FF5500", borderRadius: 12, padding: "10px", textAlign: "center", fontSize: 12, fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <PhoneCall size={14} /> Bouton Appel Urgence (15/18)
              </div>
            </div>

            {/* Carte 3 (1/2 Width = bento-col-6) */}
            <div className="bento-col-6 card-dribbble" style={{ padding: 36, textAlign: "left" }}>
              <div style={{ display: "inline-block", background: "rgba(255,85,0,0.08)", color: "#FF5500", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                ÉCONOMIE LOCALE
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>CAPTEN Spots</h3>
              <p className="text-body" style={{ marginBottom: 20 }}>
                Graphiques et badges prouvant l&apos;impact de votre volume de membres auprès des cafés et shops partenaires.
              </p>
              <div style={{ background: "#F8F9FA", borderRadius: 16, padding: 16, border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>☕</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Café du Cycliste</div>
                    <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 700 }}>-15% consommations</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", background: "#FFFFFF", padding: "6px 12px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.06)" }}>
                  34 cafés débloqués
                </div>
              </div>
            </div>

            {/* Carte 4 (1/2 Width = bento-col-6) */}
            <div className="bento-col-6 card-dribbble" style={{ padding: 36, textAlign: "left" }}>
              <div style={{ display: "inline-block", background: "rgba(255,85,0,0.08)", color: "#FF5500", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                UNIFORME &amp; UNIVERSEL
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>Multisport par Nature</h3>
              <p className="text-body" style={{ marginBottom: 20 }}>
                Gestion uniforme conçue aussi bien pour le trail, la randonnée en altitude que les marches sociales en ville.
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

      {/* ═══════════ 5. COMPARATIF "SANS vs AVEC CAPTEN" (Cartes Split) ═══════════ */}
      <section id="comparison" style={{ padding: "80px 0", background: "#FFFFFF" }}>
        <div className="container-dribbble text-center">
          <h2 className="h2-dribbble" style={{ maxWidth: 640, margin: "0 auto 16px" }}>
            Pourquoi adopter CAPTEN ?
          </h2>
          <p className="sub-dribbble" style={{ maxWidth: 500, margin: "0 auto 48px" }}>
            La différence entre l&apos;improvisation sur WhatsApp et une gestion professionnelle.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, textAlign: "left" }}>
            {/* Gauche (Style Incomplet) */}
            <div style={{
              background: "#F8F9FA", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 24, padding: 40
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: "#EF4444", marginBottom: 24 }}>
                <X size={22} color="#EF4444" /> SANS CAPTEN (WhatsApp)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Zéro registre de présence horodaté en cas de contrôle",
                  "Stress permanent de la responsabilité en cas d'accident",
                  "Aucune donnée de santé ou contact d'urgence disponible",
                  "Châtiment WhatsApp : 80 messages/jour pour un lieu de RDV",
                  "Aucune valeur mesurable à faire valoir auprès des partenaires"
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "#64748B", fontWeight: 500 }}>
                    <span style={{ color: "#EF4444", fontWeight: 800 }}>✕</span> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Droite (Style CAPTEN) */}
            <div className="card-dark-slate" style={{
              padding: 40, boxShadow: "0 20px 40px -10px rgba(255,85,0,0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: "#FF5500", marginBottom: 24 }}>
                <Check size={22} color="#FF5500" /> AVEC CAPTEN (Sérénité)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Check-in GPS automatique & registre horodaté verrouillé",
                  "Couverture légale claire et sérénité totale pour l'admin",
                  "Fiches d'urgence ICE accessibles instantanément hors-ligne",
                  "Logistique centralisée sans pollution de discussions",
                  "Remises exclusives et impact commerçant mesuré"
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "#E2E8F0", fontWeight: 600 }}>
                    <span style={{ color: "#22C55E", fontWeight: 800 }}>✓</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 6. FOOTER MASSIF & CTA FINAL (#0F172A) ═══════════ */}
      <section id="faq" style={{ background: "#0F172A", color: "#FFFFFF", paddingTop: 100, paddingBottom: 60 }}>
        <div className="container-dribbble">
          {/* FAQ Header */}
          <div className="text-center" style={{ maxWidth: 640, margin: "0 auto 56px" }}>
            <h2 className="h2-dribbble-white" style={{ marginBottom: 12 }}>
              Questions fréquentes
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16 }}>
              Les réponses essentielles avant de rejoindre la Bêta.
            </p>
          </div>

          {/* Accordion */}
          <div style={{ maxWidth: 760, margin: "0 auto 90px" }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: "1px solid #1E293B" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: "100%", padding: "24px 0", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#FFFFFF",
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  {f.q}
                  {openFaq === i ? <ChevronUp size={18} color="#FF5500" /> : <ChevronDown size={18} color="#64748B" />}
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 24, fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Call to Action */}
          <div style={{
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            border: "1px solid #334155", borderRadius: 32, padding: "64px 32px",
            textAlign: "center", position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
              width: 500, height: 300, background: "radial-gradient(circle, rgba(255,85,0,0.18) 0%, transparent 70%)",
              pointerEvents: "none"
            }} />

            <h2 className="h2-dribbble-white" style={{ marginBottom: 16 }}>
              Ton crew mérite mieux qu&apos;un fil de discussion.
            </h2>
            <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 480, margin: "0 auto 36px" }}>
              Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements dès aujourd&apos;hui.
            </p>
            <Link href="/login?mode=signup" className="btn-orange-pill" style={{ fontSize: 17, padding: "18px 44px" }}>
              Commencer l&apos;expérience CAPTEN <ArrowRight size={18} />
            </Link>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 80, paddingTop: 40, borderTop: "1px solid #1E293B", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: 13, color: "#64748B" }}>
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
