"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — V12 · Fitframe-exact clone
   Palette  : #fbfcf2 cream · #0a0a0a dark · #FF5500 orange accent
   Fonts    : Bebas Neue (H1/H2) · Satoshi (H3/labels) · Inter (body)
   Sections : Nav · Hero+QR · Logos · Features · How it Works
              · Comparison · Story · Review · FAQ · CTA · Footer
═══════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');

  @font-face {
    font-family: 'Satoshi';
    src: url('https://framerusercontent.com/third-party-assets/fontshare/wf/LAFFD4SDUCDVQEXFPDC7C53EQ4ZELWQI/PXCT3G6LO6ICM5I3NTYENYPWJAECAWDD/GHM6WVH6MILNYOOCXHXB5GTSGNTMGXZR.woff2') format('woff2');
    font-weight: 700;
    font-display: swap;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #fbfcf2;
    color: #0a0a0a;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }
  img { display: block; max-width: 100%; }
  button { cursor: pointer; font-family: inherit; border: none; background: none; }

  /* ── Layout ── */
  .wrap { max-width: 1160px; margin: 0 auto; padding: 0 32px; }

  /* ── Bebas Neue Display ── */
  .bebas { font-family: 'Bebas Neue', 'Arial Black', sans-serif; letter-spacing: 0.01em; line-height: 0.95; }
  .satoshi { font-family: 'Satoshi', 'Inter', sans-serif; font-weight: 700; }

  /* ── Ticker ── */
  @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  .ticker-inner { animation: ticker 32s linear infinite; display: flex; gap: 0; width: max-content; }
  .ticker-wrap { overflow: hidden; }

  /* ── Float ── */
  @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
  .float { animation: float 4.5s ease-in-out infinite; }

  /* ── Pulse ── */
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5) }
    60% { box-shadow: 0 0 0 8px rgba(34,197,94,0) }
  }
  .pulse { animation: pulse-dot 2s ease-in-out infinite; }

  /* ── Fade Up ── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
  .fade-up { animation: fadeUp 0.6s ease both; }
  .d1 { animation-delay: 0.05s } .d2 { animation-delay: 0.15s }
  .d3 { animation-delay: 0.25s } .d4 { animation-delay: 0.4s }

  /* ── Cards ── */
  .card {
    background: #fff;
    border: 1px solid rgba(37,38,29,0.07);
    border-radius: 20px;
    overflow: hidden;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  .card:hover {
    box-shadow: 0 12px 40px rgba(37,38,29,0.09);
    transform: translateY(-4px);
  }
  .card-dark {
    background: #0a0a0a;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  .card-dark:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.4); transform: translateY(-4px); }

  /* ── Btn Primary ── */
  .btn-p {
    display: inline-flex; align-items: center; gap: 8px;
    background: #0a0a0a; color: #fbfcf2;
    padding: 14px 28px; border-radius: 100px;
    font-size: 15px; font-weight: 600;
    transition: background 0.2s, transform 0.2s;
    white-space: nowrap;
  }
  .btn-p:hover { background: #FF5500; transform: translateY(-1px); }

  /* ── Btn Secondary ── */
  .btn-s {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: #0a0a0a;
    padding: 13px 27px; border-radius: 100px;
    font-size: 15px; font-weight: 600;
    border: 1px solid rgba(37,38,29,0.15);
    transition: border-color 0.2s, transform 0.2s;
    white-space: nowrap;
  }
  .btn-s:hover { border-color: #0a0a0a; transform: translateY(-1px); }

  /* ── Divider ── */
  .divider { width: 100%; height: 1px; background: rgba(37,38,29,0.07); }

  /* ── Responsive ── */
  @media(max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
    .hero-cta { justify-content: center !important; }
    .hero-img { display: none; }
    .feat-grid { grid-template-columns: 1fr 1fr !important; }
    .how-grid { grid-template-columns: 1fr !important; }
    .comp-grid { grid-template-columns: 1fr !important; }
    .faq-grid { grid-template-columns: 1fr !important; }
    .hide-md { display: none !important; }
  }
  @media(max-width: 640px) {
    .feat-grid { grid-template-columns: 1fr !important; }
    .wrap { padding: 0 20px; }
    .bebas.hero-h1 { font-size: clamp(3.5rem, 16vw, 5rem) !important; }
  }
`;

/* ──────────────────────────────────────────────────────────────
   NAVBAR
────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? "rgba(251,252,242,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(37,38,29,0.07)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" alt="CAPTEN" style={{ height: 28 }} />
        </Link>

        <div className="hide-md" style={{ display: "flex", gap: 32 }}>
          {[["Fonctionnalités", "#features"], ["Comment ça marche", "#how"], ["FAQ", "#faq"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 14, fontWeight: 500, color: "#6b6a6a", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0a0a0a")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b6a6a")}>{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/login" className="btn-s" style={{ padding: "10px 22px", fontSize: 14 }}>
            Connexion
          </Link>
          <Link href="/login?mode=signup" className="btn-p" style={{ padding: "10px 22px", fontSize: 14 }}>
            Rejoindre la Bêta
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────────
   HERO
────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ paddingTop: 120, paddingBottom: 80, background: "#fbfcf2" }}>
      <div className="wrap hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

        {/* Left — text */}
        <div>
          <div className="fade-up d1" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,85,0,0.08)", border: "1px solid rgba(255,85,0,0.15)",
            borderRadius: 100, padding: "6px 14px", marginBottom: 24
          }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#FF5500" }}>Bêta ouverte — Accès gratuit</span>
          </div>

          <h1 className="bebas hero-h1 fade-up d2" style={{
            fontSize: "clamp(4.5rem, 9vw, 7.5rem)",
            color: "#0a0a0a", marginBottom: 20
          }}>
            Gère ton crew.<br />
            <span style={{ color: "#FF5500" }}>En sécurité.</span><br />
            Sans le chaos.
          </h1>

          <p className="fade-up d3" style={{
            fontSize: 17, color: "#6b6a6a", lineHeight: 1.7,
            maxWidth: 480, marginBottom: 36
          }}>
            Check-in GPS horodaté, fiches médicales ICE d'urgence, avantages partenaires. Tout ce dont un capitaine de crew sportif a besoin — en une seule app.
          </p>

          <div className="fade-up d4 hero-cta" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/login?mode=signup" className="btn-p" style={{ fontSize: 16, padding: "16px 34px" }}>
              Démarrer gratuitement →
            </Link>
            <a href="#how" className="btn-s" style={{ fontSize: 16, padding: "16px 30px" }}>
              Comment ça marche
            </a>
          </div>

          {/* Mini trust */}
          <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32 }}>
            <div style={{ display: "flex" }}>
              {["🏃", "🚶", "🥾", "🚴", "🏃"].map((e, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: i % 2 === 0 ? "#e8e8e0" : "#d8d8d0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, marginLeft: i === 0 ? 0 : -10,
                  border: "2px solid #fbfcf2",
                }}>{e}</div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "#8a8a8a" }}>+2 847 capitaines nous font confiance</span>
          </div>
        </div>

        {/* Right — visual */}
        <div className="hero-img" style={{ position: "relative" }}>
          <img
            src="/landing/fitframe-hero.png"
            alt="CAPTEN App"
            style={{
              width: "100%", borderRadius: 24,
              boxShadow: "0 20px 60px rgba(37,38,29,0.12)"
            }}
          />

          {/* QR floating card */}
          <div className="float" style={{
            position: "absolute", bottom: "10%", left: "-8%",
            background: "#fff",
            border: "1px solid rgba(37,38,29,0.07)",
            borderRadius: 18,
            padding: "18px 20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column", gap: 10,
            minWidth: 180,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#8a8a8a", letterSpacing: 1 }}>CHECK-IN LIVE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="pulse" style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0a0a0a" }}>47 présents</div>
                <div style={{ fontSize: 11, color: "#8a8a8a" }}>République · 19h30</div>
              </div>
            </div>
            {/* Mini QR */}
            <div style={{
              width: 56, height: 56, background: "#0a0a0a",
              borderRadius: 8, display: "grid",
              gridTemplateColumns: "repeat(4,1fr)", gap: 3, padding: 8
            }}>
              {[1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1].map((v, i) => (
                <div key={i} style={{ background: v ? "#fbfcf2" : "#0a0a0a", borderRadius: 1 }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#FF5500", fontWeight: 700 }}>Scanner pour s'enregistrer</div>
          </div>

          {/* ICE badge */}
          <div style={{
            position: "absolute", top: "8%", right: "-6%",
            background: "#0a0a0a",
            borderRadius: 14, padding: "12px 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Fiche ICE active</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>O+ · Contact 1-clic</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   LOGO STRIP (Social proof)
────────────────────────────────────────────────────────────── */
function LogoStrip() {
  const logos = ["Paris Run Club", "Urban Walkers", "Trail Squad Lyon", "Coffee Ride BDX", "Social Athletics", "Marseille Rando", "Run & Chill #42"];
  return (
    <section style={{ padding: "32px 0", borderTop: "1px solid rgba(37,38,29,0.07)", borderBottom: "1px solid rgba(37,38,29,0.07)" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: "#8a8a8a", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
          Ils nous font déjà confiance
        </span>
      </div>
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...logos, ...logos].map((l, i) => (
            <div key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "0 40px", color: "#c8c8c8", fontSize: 13,
              fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
              whiteSpace: "nowrap"
            }}>
              <span style={{ color: "#FF5500", fontSize: 8 }}>●</span> {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   FEATURES GRID
────────────────────────────────────────────────────────────── */
function Features() {
  return (
    <section id="features" style={{ padding: "96px 0", background: "#fbfcf2" }}>
      <div className="wrap">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#FF5500", marginBottom: 12, textTransform: "uppercase" }}>Fonctionnalités</p>
          <h2 className="bebas" style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", color: "#0a0a0a", marginBottom: 16 }}>
            See your crew clearly.
          </h2>
          <p style={{ fontSize: 17, color: "#6b6a6a", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
            Gérez tes rassemblements en 3 secondes, protège tes membres avec la fiche ICE et valorise ton impact local.
          </p>
        </div>

        <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

          {/* Card 1 — GPS Check-in — dark, tall */}
          <div className="card-dark" style={{ gridRow: "span 2", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "36px 32px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,85,0,0.15)", borderRadius: 100,
                padding: "5px 12px", marginBottom: 20
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#FF5500", letterSpacing: 1 }}>GPS CHECK-IN</span>
              </div>
              <h3 className="satoshi" style={{ fontSize: 22, color: "#fff", lineHeight: 1.3, marginBottom: 12 }}>
                Registre horodaté automatique
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 28 }}>
                Validation dès que le membre arrive au point de RDV. Émargement exportable PDF — preuve légale en cas de contrôle.
              </p>
              {["Géolocalisation auto", "Export PDF horodaté", "QR code de secours", "Mode hors-ligne"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(255,85,0,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#FF5500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflow: "hidden", minHeight: 200 }}>
              <img src="/landing/mockup-checkin.png" alt="Check-in" style={{ width: "80%", margin: "0 auto", objectFit: "contain" }} />
            </div>
          </div>

          {/* Card 2 — ICE */}
          <div className="card" style={{ padding: "28px 28px 24px" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🛡️</div>
            <h3 className="satoshi" style={{ fontSize: 18, color: "#0a0a0a", marginBottom: 8 }}>Fiche ICE d'urgence</h3>
            <p style={{ fontSize: 13, color: "#6b6a6a", lineHeight: 1.65, marginBottom: 20 }}>
              Groupe sanguin, allergies, contact 1-clic. Accessible hors-ligne en 3 secondes.
            </p>
            <div style={{ background: "#fef2f2", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: 0.5, marginBottom: 6 }}>⚠ FICHE ICE</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a" }}>Sarah M. · 32 ans</div>
                  <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, marginTop: 2 }}>Allergie : Pénicilline</div>
                </div>
                <div style={{ background: "#FF5500", color: "#fff", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 100 }}>O+</div>
              </div>
            </div>
          </div>

          {/* Card 3 — Multisport */}
          <div className="card" style={{ overflow: "hidden", padding: 0 }}>
            <div style={{ padding: "28px 28px 16px" }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🏃</div>
              <h3 className="satoshi" style={{ fontSize: 18, color: "#0a0a0a", marginBottom: 8 }}>4 sports supportés</h3>
              <p style={{ fontSize: 13, color: "#6b6a6a", lineHeight: 1.65 }}>
                Run Club, Social Walk, Trail & Rando, Cyclisme.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "0 4px 4px" }}>
              <img src="/landing/card-trail.png" alt="Trail" style={{ height: 100, objectFit: "cover", borderRadius: "0 0 0 16px" }} />
              <img src="/landing/card-walk.png" alt="Walk" style={{ height: 100, objectFit: "cover", borderRadius: "0 0 16px 0" }} />
            </div>
          </div>

          {/* Card 4 — Spots */}
          <div className="card-dark" style={{ padding: "28px 28px" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>☕</div>
            <h3 className="satoshi" style={{ fontSize: 18, color: "#fff", marginBottom: 8 }}>CAPTEN Spots</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 20 }}>
              Avantages exclusifs chez les partenaires locaux de votre quartier.
            </p>
            {[["Café du Cycliste", "-15%", "#FF5500"], ["Le Traileur", "-20%", "#22C55E"], ["Run Store", "-10%", "#3B82F6"]].map(([n, d, c]) => (
              <div key={n} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 10, padding: "9px 12px", marginBottom: 8
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{n}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c, background: `${c}18`, padding: "2px 10px", borderRadius: 100 }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Card 5 — Stats */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#8a8a8a", letterSpacing: 1.5, marginBottom: 20, textTransform: "uppercase" }}>
              En chiffres
            </div>
            {[
              { v: "2 847", l: "membres actifs", c: "#FF5500", i: "👥" },
              { v: "1 203", l: "sessions / mois", c: "#22C55E", i: "📍" },
              { v: "98.7%", l: "fiches ICE actives", c: "#3B82F6", i: "🛡️" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{s.i}</span>
                  <span style={{ fontSize: 13, color: "#6b6a6a" }}>{s.l}</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</span>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#999" }}>Places Bêta restantes</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#FF5500" }}>73 %</span>
              </div>
              <div style={{ height: 5, background: "#f0f0e8", borderRadius: 100 }}>
                <div style={{ width: "73%", height: "100%", background: "#FF5500", borderRadius: 100 }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   HOW IT WORKS
────────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Crée ton event", desc: "Configure ton rassemblement en 60 secondes : lieu, date, type de sport, nombre de participants max.", icon: "⚡" },
    { n: "02", title: "Partage le lien", desc: "Tes membres reçoivent un lien ou un QR Code. Ils remplissent leur fiche ICE en 30 secondes dans leur navigateur.", icon: "🔗" },
    { n: "03", title: "Check-in live", desc: "Le jour J, tu vois en temps réel qui est arrivé. Le registre horodaté se remplit automatiquement.", icon: "✅" },
  ];

  return (
    <section id="how" style={{ padding: "96px 0", background: "#fff" }}>
      <div className="wrap">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#FF5500", marginBottom: 12, textTransform: "uppercase" }}>Comment ça marche</p>
          <h2 className="bebas" style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", color: "#0a0a0a", marginBottom: 16 }}>
            Start your crew journey<br />in minutes.
          </h2>
          <p style={{ fontSize: 17, color: "#6b6a6a", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Trois étapes simples pour passer d'un groupe WhatsApp chaotique à un rassemblement professionnel et sécurisé.
          </p>
        </div>

        <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hide-md" style={{
                  position: "absolute", top: 28, left: "60%", right: "-44%",
                  height: 1, background: "rgba(37,38,29,0.12)", zIndex: 0
                }} />
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "#0a0a0a", display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: 24, fontSize: 24
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FF5500", letterSpacing: 1, marginBottom: 8 }}>{s.n}</div>
                <h3 className="satoshi" style={{ fontSize: 20, color: "#0a0a0a", marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#6b6a6a", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   COMPARISON
────────────────────────────────────────────────────────────── */
function Comparison() {
  return (
    <section style={{ padding: "96px 0", background: "#fbfcf2" }}>
      <div className="wrap">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#FF5500", marginBottom: 12, textTransform: "uppercase" }}>Comparatif</p>
          <h2 className="bebas" style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", color: "#0a0a0a", marginBottom: 16 }}>
            La différence CAPTEN.
          </h2>
        </div>

        <div className="comp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Without */}
          <div style={{ background: "#fff", border: "1px solid rgba(37,38,29,0.07)", borderRadius: 20, padding: "36px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2l8 8M10 2L2 10" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8a8a8a" }}>SANS CAPTEN (WhatsApp)</span>
            </div>
            {["Aucun registre de présence horodaté", "Responsabilité légale non couverte", "Données médicales introuvables en urgence", "80 messages / jour, informations perdues", "Aucun suivi de l'impact local du crew"].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🔴</span>
                <span style={{ fontSize: 14, color: "#8a8a8a", lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* With */}
          <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: "36px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,85,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l4 4 6-8" stroke="#FF5500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FF5500" }}>AVEC CAPTEN</span>
            </div>
            {["Check-in GPS auto · registre PDF horodaté", "Couverture légale claire pour l'organisateur", "Fiches ICE hors-ligne · contact en 1 clic", "Canal unique structuré · zéro bruit parasite", "Dashboard impact local + remises partenaires"].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>✅</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   STORY (full-width photo)
────────────────────────────────────────────────────────────── */
function Story() {
  return (
    <section style={{ padding: "0 0 96px", background: "#fbfcf2" }}>
      <div className="wrap">
        <div style={{ position: "relative", borderRadius: 28, overflow: "hidden" }}>
          <img src="/landing/community.png" alt="La communauté CAPTEN"
            style={{ width: "100%", height: 520, objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.15) 55%, transparent 100%)"
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "48px 56px", display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 24
          }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>
                La communauté
              </p>
              <h2 className="bebas" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", color: "#fff", lineHeight: 1.05 }}>
                Rejoins les capitaines<br />qui pensent autrement.
              </h2>
            </div>
            <Link href="/login?mode=signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#0a0a0a",
              padding: "15px 30px", borderRadius: 100,
              fontSize: 15, fontWeight: 700,
              transition: "all 0.2s", flexShrink: 0
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#FF5500"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0a0a0a"; }}>
              Rejoindre la Bêta →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   SINGLE REVIEW
────────────────────────────────────────────────────────────── */
function Review() {
  return (
    <section style={{ padding: "80px 0", background: "#fff", borderTop: "1px solid rgba(37,38,29,0.07)" }}>
      <div className="wrap" style={{ maxWidth: 760, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 24 }}>
          {[0,1,2,3,4].map(i => (
            <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FF5500">
              <path d="M10 1l2.4 7.4H20l-6.2 4.5 2.4 7.4L10 16 3.8 20.3l2.4-7.4L0 8.4h7.6z"/>
            </svg>
          ))}
        </div>
        <blockquote className="satoshi" style={{
          fontSize: "clamp(1.3rem, 3vw, 2rem)",
          color: "#0a0a0a", lineHeight: 1.45, marginBottom: 32
        }}>
          "Avant CAPTEN, chaque sortie trail c'était 3 groupes WhatsApp et un tableau Excel. Maintenant j'ouvre l'app, je partage le lien, et le registre se remplit tout seul. Mes 65 membres adorent."
        </blockquote>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF5500, #ff8844)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "#fff", fontWeight: 800,
          }}>M</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0a0a0a" }}>Marc D.</div>
            <div style={{ fontSize: 13, color: "#8a8a8a" }}>Capitaine · Trail Squad Lyon · 65 membres</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   FAQ
────────────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "Est-ce gratuit pendant la Bêta ?", a: "Oui, 100% gratuit pendant toute la période Bêta. Aucune carte bancaire. 21 jours d'essai complet, puis tarif Bêta préférentiel garanti." },
    { q: "Mes membres doivent-ils installer une app ?", a: "Non. Ils scannent un QR Code ou cliquent sur votre lien unique. La fiche ICE se remplit en 30 secondes dans leur navigateur mobile, sans téléchargement." },
    { q: "Comment les données médicales ICE sont-elles protégées ?", a: "Chiffrement bout-en-bout, conformité RGPD stricte. Les fiches ICE ne sont consultables que par le Capitaine en session active. Hébergement en Europe." },
    { q: "CAPTEN fonctionne-t-il hors réseau ?", a: "Oui. Les fiches ICE et registres sont mis en cache local. Parfait pour trail, rando et sorties en zone blanche sans signal." },
    { q: "Pour quels sports est fait CAPTEN ?", a: "Run Club, Social Walk, Trail & Rando, Cyclisme. L'interface s'adapte à chaque type de rassemblement sportif outdoor et urbain." },
  ];

  return (
    <section id="faq" style={{ padding: "96px 0", background: "#fbfcf2" }}>
      <div className="wrap">
        <div className="faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 80, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 96 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#FF5500", marginBottom: 16, textTransform: "uppercase" }}>FAQ</p>
            <h2 className="bebas" style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)", color: "#0a0a0a", marginBottom: 16, lineHeight: 1 }}>
              Toutes vos questions.
            </h2>
            <p style={{ fontSize: 15, color: "#6b6a6a", lineHeight: 1.7, marginBottom: 32 }}>
              Des doutes ? Voici les questions les plus fréquentes des capitaines qui nous rejoignent.
            </p>
            <Link href="/login?mode=signup" className="btn-p">
              Rejoindre la Bêta →
            </Link>
          </div>

          <div>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(37,38,29,0.08)" }}>
                <button onClick={() => setOpen(open === i ? null : i)} style={{
                  width: "100%", padding: "22px 0",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 16, fontSize: 16, fontWeight: 600, color: "#0a0a0a",
                  textAlign: "left"
                }}>
                  <span>{f.q}</span>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: open === i ? "#FF5500" : "rgba(37,38,29,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s"
                  }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
                      style={{ transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>
                      <path d="M5.5 1v9M1 5.5h9" stroke={open === i ? "#fff" : "#555"} strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                </button>
                {open === i && (
                  <div style={{ paddingBottom: 22, fontSize: 15, color: "#6b6a6a", lineHeight: 1.7 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   CTA FINAL
────────────────────────────────────────────────────────────── */
function CTAFinal() {
  return (
    <section style={{ background: "#0a0a0a", padding: "96px 0" }}>
      <div className="wrap" style={{ textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#FF5500", marginBottom: 20, textTransform: "uppercase" }}>
          Rejoindre la Bêta
        </p>
        <h2 className="bebas" style={{
          fontSize: "clamp(3rem, 7vw, 6rem)",
          color: "#fbfcf2", lineHeight: 0.95,
          maxWidth: 800, margin: "0 auto 20px"
        }}>
          Ton crew mérite mieux<br />qu'un fil de discussion.
        </h2>
        <p style={{ fontSize: 17, color: "rgba(251,252,242,0.45)", maxWidth: 480, margin: "0 auto 44px", lineHeight: 1.7 }}>
          Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs dès aujourd'hui.
        </p>

        <Link href="/login?mode=signup" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "18px 44px", borderRadius: 100,
          background: "#FF5500", color: "#fff",
          fontSize: 17, fontWeight: 700,
          boxShadow: "0 8px 32px rgba(255,85,0,0.4)",
          transition: "all 0.2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e04d00"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FF5500"; e.currentTarget.style.transform = "none"; }}>
          Commencer gratuitement →
        </Link>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#22C55E" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 13, color: "rgba(251,252,242,0.35)" }}>Gratuit pendant la Bêta · Aucune carte bancaire</span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   FOOTER
────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background: "#0a0a0a",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "32px 0"
    }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" alt="CAPTEN" style={{ height: 22, filter: "brightness(0) invert(1)" }} />
          <span style={{ fontSize: 13, color: "rgba(251,252,242,0.25)" }}>© 2026 CAPTEN</span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[["CGU", "/cgu"], ["RGPD", "/rgpd"], ["Mentions légales", "/mentions-legales"], ["Support", "/support"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 13, color: "rgba(251,252,242,0.3)", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(251,252,242,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(251,252,242,0.3)")}>
              {l}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN
────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <style>{CSS}</style>
      <Nav />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Comparison />
      <Story />
      <Review />
      <FAQ />
      <CTAFinal />
      <Footer />
    </>
  );
}
