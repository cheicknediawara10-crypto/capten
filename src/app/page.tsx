"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck, HeartPulse, MapPin, Zap, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, ArrowRight, Check,
  MessageSquare, AlertCircle, UserCheck, Coffee, ShieldAlert
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   CAPTEN — Landing Page V3
   Inspiration : Linear · Vercel · Stripe · Raycast
   Aesthetic   : Clean centered hero, massive whitespace, 
                 subtle gradients, zero clutter
   Palette     : #FAFAFA (base) · #09090B (dark) · #FF5500 (accent 10%)
   Fonts       : Inter var (body+headings) · JetBrains Mono (mono)
────────────────────────────────────────────────────────────── */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #FAFAFA;
    color: #09090B;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }

  /* ── Animations ── */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes beacon {
    0%   { box-shadow: 0 0 0 0 rgba(255,85,0,0.6); }
    70%  { box-shadow: 0 0 0 10px rgba(255,85,0,0); }
    100% { box-shadow: 0 0 0 0 rgba(255,85,0,0); }
  }
  .fade-in { animation: fadeInUp 0.7s ease-out both; }
  .fade-in-d1 { animation: fadeInUp 0.7s ease-out 0.1s both; }
  .fade-in-d2 { animation: fadeInUp 0.7s ease-out 0.2s both; }
  .fade-in-d3 { animation: fadeInUp 0.7s ease-out 0.3s both; }
  .beacon { animation: beacon 2s infinite; }

  /* ── Utility ── */
  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .mono { font-family: 'JetBrains Mono', monospace; }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 12px; border: none;
    background: #FF5500; color: #fff; font-weight: 700; font-size: 15px;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 8px 20px -4px rgba(255,85,0,0.3);
  }
  .btn-primary:hover {
    background: #E84D00; transform: translateY(-1px);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 12px 28px -4px rgba(255,85,0,0.4);
  }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 12px;
    background: #fff; color: #09090B; font-weight: 700; font-size: 15px;
    border: 1px solid #E4E4E7; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .btn-secondary:hover {
    border-color: #A1A1AA; transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  /* ── Cards ── */
  .card {
    background: #fff; border: 1px solid #E4E4E7; border-radius: 20px;
    padding: 32px; transition: all 0.25s ease;
  }
  .card:hover {
    box-shadow: 0 8px 30px -8px rgba(0,0,0,0.08);
    border-color: #D4D4D8;
    transform: translateY(-2px);
  }
  .card-dark {
    background: rgba(18,18,21,0.96); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 32px; transition: all 0.25s ease;
    backdrop-filter: blur(12px);
  }
  .card-dark:hover {
    border-color: rgba(255,255,255,0.15);
    box-shadow: 0 8px 30px -8px rgba(0,0,0,0.6);
    transform: translateY(-2px);
  }

  /* ── Footer Links ── */
  .ft-link { color: #71717A; transition: color 0.2s; }
  .ft-link:hover { color: #fff; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .hero-grid  { grid-template-columns: 1fr !important; text-align: center; }
    .hero-ctas  { justify-content: center !important; }
    .hero-proof { justify-content: center !important; }
    .bento-2col { grid-template-columns: 1fr !important; }
    .vs-grid    { grid-template-columns: 1fr !important; }
    .spots-grid { grid-template-columns: 1fr !important; }
    .gallery-g  { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 640px) {
    .hero-title { font-size: 36px !important; letter-spacing: -0.8px !important; }
    .section-title { font-size: 28px !important; }
    .nav-links { display: none !important; }
    .gallery-g { grid-template-columns: 1fr !important; }
  }
`;

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const faqs = [
    { q: "Mes membres doivent-ils télécharger une application ?", a: "Non. Vos membres scannent un QR Code ou cliquent sur votre lien unique (ex\u00a0: capten.app/r/brc). Tout fonctionne instantanément dans le navigateur." },
    { q: "Comment sont protégées les données médicales (ICE) ?", a: "Les fiches ICE sont chiffrées et accessibles uniquement par le Capitaine en cas d'urgence terrain. Aucune donnée n'est revendue. Conformité RGPD complète." },
    { q: "CAPTEN fonctionne-t-il hors connexion ?", a: "Oui. Le registre et les fiches ICE de votre session sont mis en cache localement avant le départ. Consultables hors réseau en montagne ou en forêt." },
    { q: "Comment fonctionne l'essai de 21 jours ?", a: "Accès complet à toutes les fonctionnalités, sans carte bancaire. Testez sur vos sorties réelles avec votre crew." }
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: "flex", alignItems: "center",
        background: scrolled ? "rgba(250,250,250,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px) saturate(1.4)" : "none",
        borderBottom: scrolled ? "1px solid #E4E4E7" : "1px solid transparent",
        transition: "all 0.3s ease"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 32 }} />
          </Link>
          <nav className="nav-links" style={{ display: "flex", gap: 32 }}>
            {["Enjeux", "Fonctionnalités", "Tarifs"].map((l, i) => (
              <a key={i} href={`#${["enjeux","features","tarifs"][i]}`} style={{ fontSize: 14, fontWeight: 500, color: "#71717A", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#09090B"} onMouseLeave={e => e.currentTarget.style.color = "#71717A"}>{l}</a>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "#71717A", padding: "8px 12px" }}>Connexion</Link>
            <Link href="/login?mode=signup" className="btn-primary" style={{ padding: "8px 18px", fontSize: 13, borderRadius: 8 }}>Essai gratuit</Link>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{ paddingTop: 160, paddingBottom: 100, position: "relative", overflow: "hidden" }}>
        {/* Subtle radial glow */}
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,85,0,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative" }}>
          {/* Status pill */}
          <div className="fade-in" style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 100, background: "#fff", border: "1px solid #E4E4E7", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span className="beacon" style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF5500", display: "block" }} />
              <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#71717A", letterSpacing: 0.4 }}>Bêta ouverte · 21 jours offerts</span>
            </div>
          </div>

          {/* Headline — centered, massive, clean */}
          <h1 className="fade-in-d1 hero-title" style={{ textAlign: "center", fontSize: 56, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-1.5px", color: "#09090B", maxWidth: 780, margin: "0 auto 20px" }}>
            Gère ton crew.<br />
            <span style={{ color: "#FF5500" }}>Pas la paperasse.</span>
          </h1>

          <p className="fade-in-d2" style={{ textAlign: "center", fontSize: 18, lineHeight: 1.6, color: "#71717A", fontWeight: 500, maxWidth: 560, margin: "0 auto 40px" }}>
            Check-in GPS, fiches d&apos;urgence ICE, registre horodaté et avantages partenaires — tout ce qu&apos;il faut pour piloter une communauté sportive. Sans rien télécharger.
          </p>

          {/* CTAs */}
          <div className="fade-in-d3 hero-ctas" style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 48 }}>
            <Link href="/login?mode=signup" className="btn-primary">Créer mon crew <ArrowRight size={16} /></Link>
            <a href="#enjeux" className="btn-secondary">Découvrir</a>
          </div>

          {/* Social proof */}
          <div className="fade-in-d3 hero-proof" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "2px solid #FF5500", flexShrink: 0 }}>
                <img src="/landing/community-happy-girls.jpg" alt="Community" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#71717A" }}>120+ clubs actifs</span>
            </div>
            <span style={{ width: 1, height: 16, background: "#E4E4E7" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#71717A" }}>4 200+ membres sécurisés</span>
            <span style={{ width: 1, height: 16, background: "#E4E4E7" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#71717A" }}>0 incident non couvert</span>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRODUCT SHOWCASE (Faux browser frame — style Linear) ═══════════════ */}
      <section style={{ paddingBottom: 120 }}>
        <div className="container">
          <div style={{ background: "#09090B", borderRadius: 20, border: "1px solid #27272A", overflow: "hidden", boxShadow: "0 40px 80px -20px rgba(9,9,11,0.3)", maxWidth: 1000, margin: "0 auto" }}>
            {/* Browser chrome dots */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", borderBottom: "1px solid #27272A" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B3B3F" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B3B3F" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B3B3F" }} />
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <span className="mono" style={{ fontSize: 11, color: "#52525B", background: "#18181B", padding: "3px 16px", borderRadius: 6 }}>capten.app/dashboard</span>
              </div>
            </div>

            {/* App screen content */}
            <div style={{ padding: "28px 28px 0", display: "grid", gridTemplateColumns: "200px 1fr", gap: 0 }}>
              {/* Sidebar */}
              <div style={{ borderRight: "1px solid #27272A", paddingRight: 20, paddingBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#FF5500", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>RC</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Run &amp; Chill</span>
                </div>
                {[
                  { icon: "📊", label: "Dashboard", active: false },
                  { icon: "🏃", label: "Sorties", active: true },
                  { icon: "👥", label: "Membres", active: false },
                  { icon: "🛡️", label: "Sécurité", active: false },
                  { icon: "☕", label: "Spots", active: false },
                  { icon: "💬", label: "Messages", active: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, marginBottom: 2, background: item.active ? "rgba(255,85,0,0.12)" : "transparent", color: item.active ? "#FF5500" : "#71717A", fontSize: 13, fontWeight: item.active ? 600 : 500, cursor: "pointer" }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span> {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div style={{ paddingLeft: 24, paddingBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <span className="mono" style={{ fontSize: 10, color: "#FF5500", fontWeight: 600, letterSpacing: 1 }}>SESSION EN COURS</span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 2 }}>Sortie #42 — République</h3>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ background: "rgba(86,227,159,0.15)", color: "#56E39F", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>● LIVE</span>
                    <span style={{ background: "#27272A", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>19:30 Paris</span>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Présents", value: "42 / 45", color: "#56E39F" },
                    { label: "Fiches ICE", value: "100%", color: "#FF5500" },
                    { label: "Registre", value: "Verrouillé", color: "#818CF8" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#18181B", borderRadius: 12, padding: "14px 16px", border: "1px solid #27272A" }}>
                      <div style={{ fontSize: 11, color: "#71717A", fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Members list */}
                <div style={{ borderRadius: 12, border: "1px solid #27272A", overflow: "hidden" }}>
                  {[
                    { name: "Sophie Martin", status: "Validé GPS", blood: "O+", color: "#56E39F" },
                    { name: "Thomas Dubois", status: "Validé GPS", blood: "A-", color: "#56E39F" },
                    { name: "Alexandre V.", status: "En route…", blood: "B+", color: "#FBBF24" },
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < 2 ? "1px solid #27272A" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.color }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: "#71717A" }}>{m.status}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#A1A1AA", background: "#27272A", padding: "2px 6px", borderRadius: 4 }}>ICE {m.blood}</span>
                        <ShieldCheck size={14} color="#FF5500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION ENJEUX (Dark) ═══════════════ */}
      <section id="enjeux" style={{ background: "#09090B", color: "#fff", padding: "120px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/landing/urban-dusk-crew.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.1, pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 72px" }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#FF5500", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Pourquoi c&apos;est critique</span>
            <h2 className="section-title" style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-1px" }}>Le piège du club informel</h2>
            <p style={{ fontSize: 16, color: "#A1A1AA", marginTop: 14, lineHeight: 1.6 }}>
              &ldquo;On est juste un groupe de potes.&rdquo; L&apos;argument qui laisse les capitaines à découvert face à leur responsabilité civile.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { icon: <ShieldAlert size={24} />, color: "#EF4444", bg: "rgba(239,68,68,0.1)", title: "Responsabilité civile", desc: "40 personnes sur la voie publique sans registre officiel. En cas d'accident, c'est le capitaine qui est personnellement exposé." },
              { icon: <HeartPulse size={24} />, color: "#FF5500", bg: "rgba(255,85,0,0.12)", title: "Urgence médicale", desc: "Un malaise à 19h30. Impossible de communiquer le groupe sanguin, les allergies ou le contact ICE du membre aux secours." },
              { icon: <MessageSquare size={24} />, color: "#A1A1AA", bg: "rgba(161,161,170,0.12)", title: "Le chaos WhatsApp", desc: "60 messages par jour. Les infos de sécurité sont noyées entre les memes et les « c'est où le rdv ? » répétitifs." },
            ].map((c, i) => (
              <div key={i} className="card-dark">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, marginBottom: 20 }}>{c.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES — Bento Grid ═══════════════ */}
      <section id="features" style={{ padding: "120px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 64px" }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#FF5500", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Fonctionnalités</span>
            <h2 className="section-title" style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-1px", color: "#09090B" }}>Tout ce qu&apos;il faut pour piloter un crew</h2>
          </div>

          <div className="bento-2col" style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 20, marginBottom: 20 }}>
            {/* Feature 1 — Check-in & Registre */}
            <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ marginBottom: 24 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#FF5500", letterSpacing: 1 }}>01</span>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#09090B", marginTop: 4 }}>Check-in GPS &amp; Registre Horodaté</h3>
                <p style={{ fontSize: 14, color: "#71717A", marginTop: 6, lineHeight: 1.6, maxWidth: 420 }}>Validation automatique au point de RDV. Registre d&apos;émargement conservé en cas de contrôle.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderRadius: 16, overflow: "hidden", border: "1px solid #E4E4E7" }}>
                <div style={{ background: "#fff", padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <MapPin size={16} color="#FF5500" />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Point GPS</span>
                  </div>
                  <div style={{ background: "#F4F4F5", borderRadius: 10, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#71717A", fontWeight: 600 }}>📍 République, Paris</div>
                </div>
                <div style={{ background: "#09090B", color: "#fff", padding: 20 }}>
                  <div style={{ fontSize: 11, color: "#71717A", marginBottom: 8 }}>Émargement</div>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>47<span style={{ fontSize: 16, color: "#71717A" }}>/47</span></div>
                  <div style={{ fontSize: 11, color: "#56E39F", fontWeight: 600, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12} /> Verrouillé</div>
                </div>
              </div>
            </div>

            {/* Feature 2 — Fiches ICE */}
            <div className="card" style={{ background: "#09090B", color: "#fff", border: "1px solid #27272A", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ marginBottom: 24 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#FF5500", letterSpacing: 1 }}>02</span>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>Fiches d&apos;urgence ICE</h3>
                <p style={{ fontSize: 14, color: "#A1A1AA", marginTop: 6, lineHeight: 1.6 }}>Groupe sanguin, allergies, contact d&apos;urgence — accessibles en 1 tap par le capitaine.</p>
              </div>
              <div style={{ background: "#18181B", border: "1px solid rgba(255,85,0,0.25)", borderRadius: 16, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #27272A", paddingBottom: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#FF5500", display: "flex", alignItems: "center", gap: 4 }}><ShieldCheck size={14} /> FICHE ICE</span>
                  <span style={{ fontSize: 12, fontWeight: 900, background: "#FF5500", color: "#fff", padding: "1px 8px", borderRadius: 4 }}>O+</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Camille Laurent</div>
                <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 3 }}>ICE : 06 12 34 56 78 (Époux)</div>
                <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 600, marginTop: 10, background: "rgba(239,68,68,0.1)", padding: "5px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertCircle size={12} /> Allergie : Pénicilline
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 — CAPTEN Spots (full width) */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="spots-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", alignItems: "stretch" }}>
              <div style={{ padding: 40 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#FF5500", letterSpacing: 1 }}>03</span>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#09090B", marginTop: 4, marginBottom: 8 }}>CAPTEN Spots — Avantages partenaires</h3>
                <p style={{ fontSize: 14, color: "#71717A", lineHeight: 1.6, marginBottom: 24 }}>
                  Transformez la pause café d&apos;après-sortie en avantages exclusifs. Vos membres valident une remise en scannant un QR Code chez les commerces partenaires.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F4F4F5", borderRadius: 14, padding: 14, border: "1px solid #E4E4E7" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#09090B", color: "#FF5500", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Coffee size={20} /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Café du Cycliste</div>
                    <div style={{ fontSize: 11, color: "#71717A" }}>-15% sur les consommations</div>
                  </div>
                </div>
              </div>
              <div style={{ position: "relative", minHeight: 280 }}>
                <img src="/landing/cyclist-grass-phone.jpg" alt="Spots lifestyle" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(255,255,255,0.8) 0%, transparent 40%)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ COMMUNITY GALLERY ═══════════════ */}
      <section style={{ padding: "0 0 120px" }}>
        <div className="container">
          <div className="gallery-g" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { src: "/landing/community-happy-girls.jpg", label: "Ambiance & Communauté" },
              { src: "/landing/trail-ridge-peak.jpg", label: "Trail & Altitude" },
              { src: "/landing/urban-runclub.jpg", label: "Run Club Urbain" },
              { src: "/landing/trail-forest.jpg", label: "Forêt & Sentiers" },
            ].map((p, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden", position: "relative", aspectRatio: "4/3" }}>
                <img src={p.src} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 14px 12px", background: "linear-gradient(to top, rgba(9,9,11,0.7) 0%, transparent 100%)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{p.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ COMPARATIF ═══════════════ */}
      <section id="comparatif" style={{ padding: "80px 0 120px", borderTop: "1px solid #E4E4E7" }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#FF5500", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Comparaison</span>
            <h2 className="section-title" style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-1px", color: "#09090B" }}>WhatsApp seul vs CAPTEN</h2>
          </div>

          <div className="vs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <XCircle size={20} color="#EF4444" />
                <span style={{ fontSize: 16, fontWeight: 700 }}>Groupe WhatsApp</span>
              </div>
              {["60 messages/jour noyés", "Aucun registre de présences", "0 fiche de santé ni ICE", "Gestion manuelle épuisante", "Risque juridique personnel"].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#71717A", marginBottom: 10 }}>
                  <XCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} /> {t}
                </div>
              ))}
            </div>
            <div className="card" style={{ background: "#09090B", color: "#fff", border: "1px solid #27272A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <ShieldCheck size={20} color="#FF5500" />
                <span style={{ fontSize: 16, fontWeight: 700 }}>Avec CAPTEN</span>
              </div>
              {["Check-in GPS automatique", "Fiches ICE centralisées", "Validation en 3 secondes", "Automatisation complète", "Protection RGPD 1-clic"].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#E4E4E7", fontWeight: 500, marginBottom: 10 }}>
                  <CheckCircle2 size={16} color="#56E39F" style={{ flexShrink: 0, marginTop: 2 }} /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TARIFS ═══════════════ */}
      <section id="tarifs" style={{ padding: "80px 0 120px" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#FF5500", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Tarification</span>
            <h2 className="section-title" style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-1px", color: "#09090B" }}>Un prix. Tout inclus.</h2>
          </div>

          <div style={{ background: "#fff", border: "2px solid #FF5500", borderRadius: 24, padding: "44px 40px", textAlign: "center", position: "relative", boxShadow: "0 20px 50px -15px rgba(255,85,0,0.15)" }}>
            <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#FF5500", color: "#fff", padding: "3px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>21 JOURS GRATUITS</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#71717A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Offre Capitaine</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginBottom: 6 }}>
              <span style={{ fontSize: 56, fontWeight: 900, color: "#09090B", lineHeight: 1 }}>33</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#09090B" }}>,99 €</span>
              <span style={{ fontSize: 14, color: "#71717A", fontWeight: 500, marginLeft: 2 }}>/mois</span>
            </div>
            <p style={{ fontSize: 13, color: "#FF5500", fontWeight: 600, marginBottom: 28 }}>facturé annuellement · ou 49,99 €/mois</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left", marginBottom: 32, borderTop: "1px solid #F4F4F5", paddingTop: 24 }}>
              {["Membres illimités", "Check-in GPS", "Fiches ICE", "Spots partenaires", "Cagnotte (0% frais)", "Support 24/7"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
                  <Check size={14} color="#FF5500" /> {f}
                </div>
              ))}
            </div>
            <Link href="/login?mode=signup" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>Démarrer l&apos;essai gratuit</Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section style={{ padding: "0 0 120px" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 32 }}>Questions fréquentes</h3>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E4E4E7", borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#09090B" }}>
                {f.q}
                {openFaq === i ? <ChevronUp size={16} color="#FF5500" /> : <ChevronDown size={16} color="#A1A1AA" />}
              </button>
              {openFaq === i && <div style={{ padding: "0 20px 18px", fontSize: 14, color: "#71717A", lineHeight: 1.6, borderTop: "1px solid #F4F4F5", paddingTop: 12 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FOOTER CTA ═══════════════ */}
      <footer style={{ background: "#09090B", color: "#fff", padding: "100px 0 48px" }}>
        <div className="container">
          <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 24, padding: "64px 40px", textAlign: "center", marginBottom: 72 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 14 }}>Ton crew mérite mieux que WhatsApp.</h2>
            <p style={{ fontSize: 15, color: "#A1A1AA", maxWidth: 440, margin: "0 auto 32px" }}>Rejoins les capitaines qui sécurisent leurs rassemblements sportifs.</p>
            <Link href="/login?mode=signup" className="btn-primary" style={{ padding: "16px 36px", fontSize: 16 }}>Rejoindre la Bêta <ArrowRight size={18} /></Link>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, borderTop: "1px solid #27272A", paddingTop: 32, fontSize: 13, color: "#52525B" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/logo.png" alt="CAPTEN" style={{ height: 24, filter: "brightness(0) invert(1)" }} />
              <span>© 2026 CAPTEN</span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <Link href="/cgu" className="ft-link">CGU</Link>
              <Link href="/rgpd" className="ft-link">RGPD</Link>
              <Link href="/mentions-legales" className="ft-link">Mentions Légales</Link>
              <Link href="/support" className="ft-link">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
