"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck, HeartPulse, MapPin, Zap, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, ArrowRight, Check,
  MessageSquare, AlertCircle, UserCheck, Coffee, ShieldAlert,
  QrCode, Users, Clock, Shield, Smartphone, Star
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN — Landing Page V4
   Style : Runna-inspired fitness SaaS landing
   Layout : Dark hero + alternating dark/light sections
          + phone mockups as primary visuals
          + gradient text accents
   Palette: #0A0A0A (dark) · #FFFFFF (light) · #FF5500 (accent)
   Font   : Inter
═══════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #FFFFFF;
    color: #0A0A0A;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .fade-up { animation: fadeUp 0.6s ease-out both; }
  .fade-up-d1 { animation: fadeUp 0.6s ease-out 0.1s both; }
  .fade-up-d2 { animation: fadeUp 0.6s ease-out 0.2s both; }
  .fade-up-d3 { animation: fadeUp 0.6s ease-out 0.35s both; }
  .float-slow { animation: float 4s ease-in-out infinite; }

  .gradient-text {
    background: linear-gradient(135deg, #FF5500, #FF8A50, #FFB088);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 50px; border: none;
    background: #FF5500; color: #fff; font-weight: 700; font-size: 15px;
    cursor: pointer; transition: all 0.25s;
    box-shadow: 0 4px 16px rgba(255,85,0,0.3);
  }
  .btn-primary:hover { background: #E84D00; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,85,0,0.4); }

  .btn-white {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 50px;
    background: #fff; color: #0A0A0A; font-weight: 700; font-size: 15px;
    border: none; cursor: pointer; transition: all 0.25s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .btn-white:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }

  .btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 50px;
    background: transparent; color: #fff; font-weight: 600; font-size: 15px;
    border: 1px solid rgba(255,255,255,0.25); cursor: pointer; transition: all 0.25s;
  }
  .btn-outline:hover { border-color: #fff; background: rgba(255,255,255,0.05); }

  /* Phone mockup */
  .phone-frame {
    width: 280px; background: #1A1A1A; border-radius: 40px;
    padding: 10px; border: 3px solid #333;
    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
  }
  .phone-screen {
    background: #0A0A0A; border-radius: 32px; overflow: hidden;
    min-height: 500px;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .hero-phones { display: none !important; }
    .feature-row { flex-direction: column !important; text-align: center; }
    .feature-row > * { max-width: 100% !important; }
    .feature-phone { align-self: center !important; }
    .steps-grid { grid-template-columns: 1fr !important; }
    .sport-cards { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 640px) {
    .hero-title { font-size: 36px !important; }
    .section-title { font-size: 30px !important; }
    .nav-links { display: none !important; }
    .sport-cards { grid-template-columns: 1fr !important; }
    .phone-frame { width: 240px; }
  }
`;

/* ── Phone Mockup Component ── */
function PhoneMockup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`phone-frame ${className}`}>
      <div className="phone-screen">{children}</div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const faqs = [
    { q: "Mes membres doivent-ils télécharger une application ?", a: "Non. Vos membres scannent un QR Code ou cliquent sur votre lien unique. Tout fonctionne dans le navigateur, sans téléchargement." },
    { q: "Comment sont protégées les données médicales ?", a: "Les fiches ICE sont chiffrées et accessibles uniquement par le Capitaine en cas d'urgence terrain. Conformité RGPD complète." },
    { q: "CAPTEN fonctionne-t-il hors connexion ?", a: "Oui. Le registre et les fiches ICE sont mis en cache localement. Consultables en montagne ou en forêt, sans réseau." },
    { q: "Comment fonctionne l'essai de 21 jours ?", a: "Accès complet sans carte bancaire. Testez sur vos sorties réelles avec votre crew pendant 3 semaines." }
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ═══════════ NAVBAR ═══════════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: "flex", alignItems: "center",
        background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        transition: "all 0.3s"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 30, filter: "brightness(0) invert(1)" }} />
          </Link>
          <nav className="nav-links" style={{ display: "flex", gap: 32 }}>
            {[["Fonctionnalités", "#features"], ["Comment ça marche", "#how"], ["Tarifs", "#pricing"]].map(([l, h], i) => (
              <a key={i} href={h} style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>{l}</a>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", padding: "8px 12px" }}>Connexion</Link>
            <Link href="/login?mode=signup" className="btn-primary" style={{ padding: "8px 20px", fontSize: 13, borderRadius: 50 }}>Essai gratuit</Link>
          </div>
        </div>
      </header>

      {/* ═══════════ HERO — DARK SECTION ═══════════ */}
      <section style={{
        background: "linear-gradient(180deg, #0A0A0A 0%, #141414 100%)",
        color: "#fff", paddingTop: 140, paddingBottom: 100,
        position: "relative", overflow: "hidden", textAlign: "center"
      }}>
        {/* Subtle gradient orb */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,85,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative" }}>
          <h1 className="fade-up hero-title" style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 24, maxWidth: 700, margin: "0 auto 24px" }}>
            Gérer ton crew en toute <span className="gradient-text">simplicité.</span>
          </h1>

          <p className="fade-up-d1" style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", fontWeight: 400, lineHeight: 1.6, maxWidth: 520, margin: "0 auto 40px" }}>
            Check-in GPS, fiches d&apos;urgence ICE, registre horodaté et avantages partenaires. Tout pour piloter une communauté sportive.
          </p>

          <div className="fade-up-d2" style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 64 }}>
            <Link href="/login?mode=signup" className="btn-primary" style={{ padding: "16px 32px", fontSize: 16 }}>
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn-outline" style={{ padding: "16px 28px", fontSize: 16 }}>
              En savoir plus
            </a>
          </div>

          {/* Phone mockups — 3 phones in perspective */}
          <div className="fade-up-d3 hero-phones" style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 24, position: "relative" }}>
            {/* Left phone (tilted) */}
            <div style={{ transform: "perspective(1000px) rotateY(8deg) scale(0.9)", opacity: 0.7 }}>
              <PhoneMockup>
                <div style={{ padding: 16 }}>
                  <div style={{ background: "#1A1A1A", borderRadius: 16, padding: 14, marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#FF5500", fontWeight: 700, marginBottom: 8 }}>🛡️ FICHE ICE</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Sophie Martin</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Groupe sanguin : O+</div>
                    <div style={{ fontSize: 11, color: "#888" }}>Contact : 06 12 34 56 78</div>
                    <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 600, marginTop: 8, background: "rgba(239,68,68,0.1)", padding: "4px 8px", borderRadius: 6 }}>⚠ Allergie : Pénicilline</div>
                  </div>
                  <div style={{ background: "#1A1A1A", borderRadius: 16, padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#888", fontWeight: 600, marginBottom: 6 }}>CONTACT D&apos;URGENCE</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Marc Martin (Époux)</div>
                    <div style={{ background: "#FF5500", borderRadius: 10, padding: "8px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 10 }}>📞 Appeler</div>
                  </div>
                </div>
              </PhoneMockup>
            </div>

            {/* Center phone (main — larger) */}
            <div className="float-slow" style={{ zIndex: 2 }}>
              <PhoneMockup>
                {/* App header */}
                <div style={{ background: "linear-gradient(180deg, #FF5500, #CC4400)", padding: "24px 18px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Session en cours</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Run &amp; Chill #42</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700, color: "#fff" }}>● LIVE</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ n: "42/45", l: "Présents" }, { n: "100%", l: "ICE" }, { n: "19:32", l: "Heure" }].map((s, i) => (
                      <div key={i} style={{ flex: 1, background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{s.n}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Members list */}
                <div style={{ padding: "12px 14px" }}>
                  {[
                    { name: "Sophie Martin", status: "Validé", badge: "O+" },
                    { name: "Thomas Dubois", status: "Validé", badge: "A-" },
                    { name: "Camille L.", status: "En route", badge: "B+" },
                    { name: "Alexandre V.", status: "Validé", badge: "AB+" },
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 3 ? "1px solid #1A1A1A" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.name[0]}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: m.status === "En route" ? "#FBBF24" : "#56E39F" }}>{m.status}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, background: "#1A1A1A", color: "#FF5500", padding: "3px 6px", borderRadius: 4 }}>{m.badge}</span>
                    </div>
                  ))}
                  <div style={{ background: "#FF5500", borderRadius: 14, padding: 12, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <QrCode size={16} /> Scanner un membre
                  </div>
                </div>
              </PhoneMockup>
            </div>

            {/* Right phone (tilted) */}
            <div style={{ transform: "perspective(1000px) rotateY(-8deg) scale(0.9)", opacity: 0.7 }}>
              <PhoneMockup>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: "#FF5500", fontWeight: 700, marginBottom: 12 }}>☕ CAPTEN SPOTS</div>
                  {[
                    { name: "Café du Cycliste", offer: "-15% consommations", members: "142 visites" },
                    { name: "Sport Corner", offer: "-20% équipement", members: "89 visites" },
                    { name: "Le Comptoir Bio", offer: "-10% smoothies", members: "203 visites" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#1A1A1A", borderRadius: 14, padding: 14, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "#56E39F", fontWeight: 500 }}>{s.offer}</div>
                        </div>
                        <div style={{ fontSize: 10, color: "#888" }}>{s.members}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: "rgba(255,85,0,0.1)", border: "1px solid rgba(255,85,0,0.2)", borderRadius: 12, padding: 12, textAlign: "center", marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#FF5500" }}>Ajouter un partenaire →</div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ "QUE PROPOSONS-NOUS ?" — LIGHT SECTION ═══════════ */}
      <section style={{ background: "#FFFFFF", padding: "120px 0" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 640, marginBottom: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#FF5500", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Que proposons-nous ?</p>
          <h2 className="section-title" style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-1px", color: "#0A0A0A" }}>
            Pilotez votre communauté sportive avec <span className="gradient-text">confiance.</span>
          </h2>
          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, marginTop: 16 }}>
            CAPTEN remplace les tableurs, les groupes WhatsApp et les papiers volants par une plateforme unique construite pour les capitaines de clubs sportifs.
          </p>
        </div>
      </section>

      {/* ═══════════ FEATURE 1 — ALTERNATING (Image left, Text right) ═══════════ */}
      <section id="features" style={{ background: "#FFFFFF", padding: "0 0 120px" }}>
        <div className="container">
          {/* Feature 1: Check-in GPS */}
          <div className="feature-row" style={{ display: "flex", alignItems: "center", gap: 80, marginBottom: 120 }}>
            <div className="feature-phone" style={{ flexShrink: 0 }}>
              <PhoneMockup>
                <div style={{ background: "linear-gradient(180deg, #FF5500, #CC4400)", padding: "20px 16px 16px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>CHECK-IN GPS</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 2 }}>Point de Rassemblement</div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ background: "#F4F4F5", borderRadius: 14, height: 120, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, position: "relative" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>📍 République, Paris</span>
                    <span style={{ position: "absolute", top: "30%", left: "55%", width: 14, height: 14, background: "#FF5500", borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 0 10px rgba(255,85,0,0.5)" }} />
                  </div>
                  <div style={{ background: "#0A0A0A", borderRadius: 14, padding: 16, color: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#888" }}>Émargement</span>
                      <span style={{ fontSize: 10, color: "#56E39F", fontWeight: 700 }}>● LIVE</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900 }}>47 <span style={{ fontSize: 14, color: "#888", fontWeight: 500 }}>/ 47</span></div>
                    <div style={{ fontSize: 11, color: "#56E39F", fontWeight: 600, marginTop: 6 }}>✓ Registre horodaté verrouillé</div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
            <div style={{ flex: 1, maxWidth: 480 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#FF5500", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Fonctionnalité #1</p>
              <h2 className="section-title" style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.8px", color: "#0A0A0A", marginBottom: 16 }}>
                Validez la présence de chaque membre en <span className="gradient-text">1 seconde.</span>
              </h2>
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7 }}>
                Le check-in GPS automatique valide la présence de vos membres dès qu&apos;ils arrivent au point de rassemblement. Le registre d&apos;émargement horodaté est conservé automatiquement comme preuve juridique.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
                {["Validation automatique au GPS", "Registre horodaté verrouillé", "Export PDF pour assurances"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "#333" }}>
                    <CheckCircle2 size={18} color="#FF5500" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 2: Fiches ICE (Text left, Image right) */}
          <div className="feature-row" style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 80, marginBottom: 120 }}>
            <div className="feature-phone" style={{ flexShrink: 0 }}>
              <PhoneMockup>
                <div style={{ padding: 16 }}>
                  <div style={{ background: "#1A1A1A", border: "1px solid rgba(255,85,0,0.3)", borderRadius: 18, padding: 18, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2A2A2A", paddingBottom: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#FF5500" }}>🛡️ FICHE ICE URGENCE</span>
                      <span style={{ fontSize: 12, fontWeight: 900, background: "#FF5500", color: "#fff", padding: "1px 8px", borderRadius: 4 }}>O+</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Camille Laurent</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Née le 12/03/1992</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>ICE : Marc Laurent · 06 12 34 56 78</div>
                    <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginTop: 12, background: "rgba(239,68,68,0.1)", padding: "8px 10px", borderRadius: 8 }}>
                      ⚠ Allergie : Pénicilline
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 10, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>📞 Contact ICE</div>
                      <div style={{ background: "#FF5500", borderRadius: 10, padding: 10, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>🚨 Appeler 112</div>
                    </div>
                  </div>
                  <div style={{ background: "#1A1A1A", borderRadius: 14, padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>ANTÉCÉDENTS</div>
                    <div style={{ fontSize: 12, color: "#ccc" }}>Asthme léger · Entorse cheville G (2023)</div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
            <div style={{ flex: 1, maxWidth: 480 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#FF5500", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Fonctionnalité #2</p>
              <h2 className="section-title" style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.8px", color: "#0A0A0A", marginBottom: 16 }}>
                Accédez aux <span className="gradient-text">fiches d&apos;urgence</span> en 1 tap.
              </h2>
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7 }}>
                Groupe sanguin, allergies, antécédents médicaux et contact d&apos;urgence ICE — tout est centralisé et accessible instantanément par le capitaine en cas de besoin terrain.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
                {["Groupe sanguin & allergies", "Contact ICE en 1 tap", "Accessible hors-ligne"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "#333" }}>
                    <CheckCircle2 size={18} color="#FF5500" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3: CAPTEN Spots (Image left, Text right) */}
          <div className="feature-row" style={{ display: "flex", alignItems: "center", gap: 80 }}>
            <div className="feature-phone" style={{ flexShrink: 0 }}>
              <PhoneMockup>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: "#FF5500", fontWeight: 700, marginBottom: 14 }}>☕ CAPTEN SPOTS</div>
                  <div style={{ background: "#1A1A1A", borderRadius: 16, padding: 16, marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Café du Cycliste</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Social Spot · Partenaire actif</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 800, color: "#FF5500" }}>142</div><div style={{ fontSize: 9, color: "#888" }}>Membres</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 800, color: "#56E39F" }}>380€</div><div style={{ fontSize: 9, color: "#888" }}>Remises</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 800, color: "#818CF8" }}>4.8★</div><div style={{ fontSize: 9, color: "#888" }}>Note</div></div>
                    </div>
                  </div>
                  <div style={{ background: "#56E39F", borderRadius: 14, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0A0A0A" }}>☕ -15% Validé !</div>
                    <div style={{ fontSize: 10, color: "rgba(0,0,0,0.5)", marginTop: 2 }}>Offre utilisée il y a 5 min</div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
            <div style={{ flex: 1, maxWidth: 480 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#FF5500", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Fonctionnalité #3</p>
              <h2 className="section-title" style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.8px", color: "#0A0A0A", marginBottom: 16 }}>
                La troisième mi-temps avec des <span className="gradient-text">avantages.</span>
              </h2>
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7 }}>
                Transformez la pause café d&apos;après-sortie en avantages exclusifs. Vos membres scannent un QR Code chez les commerces partenaires pour débloquer leurs remises.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
                {["Remises exclusives partenaires", "QR Code validation 1-clic", "Tableau de bord commerçant"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "#333" }}>
                    <CheckCircle2 size={18} color="#FF5500" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SPORTS CARDS — DARK SECTION (like "5K / 10K / 13.1 / 26.2") ═══════════ */}
      <section style={{ background: "#0A0A0A", color: "#fff", padding: "120px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="section-title" style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>
            Conçu pour <span className="gradient-text">tous les terrains.</span>
          </h2>
          <p style={{ fontSize: 16, color: "#888", maxWidth: 480, margin: "0 auto 56px" }}>
            Que vous pilotiez un Run Club, un Social Walk, un Trail ou du Cyclisme — CAPTEN s&apos;adapte.
          </p>

          <div className="sport-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { emoji: "🏃", sport: "Run Club", desc: "Courses urbaines & afterwork", img: "/landing/urban-runclub.jpg" },
              { emoji: "🚶", sport: "Social Walk", desc: "Marches conviviales & bien-être", img: "/landing/community-happy-girls.jpg" },
              { emoji: "🥾", sport: "Trail & Rando", desc: "Sentiers & altitude", img: "/landing/trail-ridge-peak.jpg" },
              { emoji: "🚴", sport: "Cyclisme", desc: "Bientôt disponible", img: "/landing/cyclist-grass-phone.jpg" },
            ].map((s, i) => (
              <div key={i} style={{ borderRadius: 20, overflow: "hidden", position: "relative", aspectRatio: "3/4", cursor: "pointer", transition: "transform 0.3s", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <img src={s.img} alt={s.sport} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{s.sport}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.desc}</div>
                </div>
                {i === 3 && <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 600, color: "#fff", backdropFilter: "blur(8px)" }}>Bientôt</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS — LIGHT SECTION ═══════════ */}
      <section id="how" style={{ background: "#FFFFFF", padding: "120px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 64px" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#FF5500", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Comment ça marche ?</p>
            <h2 className="section-title" style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", color: "#0A0A0A" }}>
              Opérationnel en <span className="gradient-text">3 minutes.</span>
            </h2>
          </div>

          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { step: "01", icon: <Smartphone size={24} />, title: "Créez votre club", desc: "Renseignez le nom de votre crew, choisissez votre sport et invitez vos premiers membres via un lien unique." },
              { step: "02", icon: <QrCode size={24} />, title: "Vos membres s'inscrivent", desc: "Un scan QR Code ou un clic sur votre lien. Pas d'app à télécharger. Fiche ICE remplie en 30 secondes." },
              { step: "03", icon: <ShieldCheck size={24} />, title: "Pilotez en sécurité", desc: "Check-in GPS au RDV, registre horodaté automatique, fiches d'urgence accessibles en 1 tap. Vous êtes couvert." },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "32px 24px" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,85,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5500", margin: "0 auto 20px" }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FF5500", marginBottom: 8 }}>ÉTAPE {s.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0A0A0A", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF — DARK SECTION ═══════════ */}
      <section style={{ background: "#0A0A0A", color: "#fff", padding: "80px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 48 }}>
            {[
              { value: "120+", label: "Clubs actifs" },
              { value: "4 200+", label: "Membres sécurisés" },
              { value: "0", label: "Incident non couvert" },
              { value: "< 3s", label: "Temps de check-in" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: "#FF5500" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#888", fontWeight: 500, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING — LIGHT SECTION ═══════════ */}
      <section id="pricing" style={{ background: "#FFFFFF", padding: "120px 0" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#FF5500", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Tarification</p>
            <h2 className="section-title" style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", color: "#0A0A0A" }}>
              Un prix. <span className="gradient-text">Tout inclus.</span>
            </h2>
          </div>

          <div style={{ background: "#fff", border: "2px solid #FF5500", borderRadius: 28, padding: "44px 36px", textAlign: "center", position: "relative", boxShadow: "0 20px 60px rgba(255,85,0,0.1)" }}>
            <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#FF5500", color: "#fff", padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>21 JOURS GRATUITS</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Offre Capitaine Complète</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginBottom: 6 }}>
              <span style={{ fontSize: 60, fontWeight: 900, color: "#0A0A0A", lineHeight: 1 }}>33</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A" }}>,99 €</span>
              <span style={{ fontSize: 14, color: "#888", fontWeight: 500, marginLeft: 4 }}>/mois</span>
            </div>
            <p style={{ fontSize: 13, color: "#FF5500", fontWeight: 600, marginBottom: 28 }}>facturé annuellement · ou 49,99 €/mois</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left", marginBottom: 32, borderTop: "1px solid #F0F0F0", paddingTop: 24 }}>
              {["Membres illimités", "Check-in GPS", "Fiches ICE d'urgence", "Spots partenaires", "Cagnotte (0% frais)", "Support prioritaire"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#333" }}>
                  <Check size={14} color="#FF5500" /> {f}
                </div>
              ))}
            </div>
            <Link href="/login?mode=signup" className="btn-primary" style={{ width: "100%", justifyContent: "center", borderRadius: 14 }}>
              Démarrer mon essai gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ — LIGHT SECTION ═══════════ */}
      <section style={{ background: "#F8F8F8", padding: "100px 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <h3 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 40, letterSpacing: "-0.5px" }}>Questions fréquentes</h3>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E8E8E8", borderRadius: 16, marginBottom: 10, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "20px 24px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#0A0A0A" }}>
                {f.q}
                {openFaq === i ? <ChevronUp size={16} color="#FF5500" /> : <ChevronDown size={16} color="#AAA" />}
              </button>
              {openFaq === i && <div style={{ padding: "0 24px 20px", fontSize: 14, color: "#666", lineHeight: 1.6, borderTop: "1px solid #F0F0F0", paddingTop: 14 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FINAL CTA — DARK SECTION WITH PHONES ═══════════ */}
      <section style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #141414 100%)", color: "#fff", padding: "120px 0", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", marginBottom: 14 }}>
            Prêt à piloter ton crew avec <span className="gradient-text">CAPTEN</span> ?
          </h2>
          <p style={{ fontSize: 16, color: "#888", maxWidth: 480, margin: "0 auto 40px" }}>
            Rejoins les capitaines qui sécurisent et automatisent leurs rassemblements sportifs. 21 jours d&apos;essai gratuit, sans carte bancaire.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Link href="/login?mode=signup" className="btn-primary" style={{ padding: "16px 36px", fontSize: 16 }}>
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ background: "#0A0A0A", color: "#fff", padding: "48px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: 13, color: "#555" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="CAPTEN" style={{ height: 22, filter: "brightness(0) invert(1)" }} />
            <span>© 2026 CAPTEN. Tous droits réservés.</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["CGU", "/cgu"], ["RGPD", "/rgpd"], ["Mentions Légales", "/mentions-legales"], ["Support", "/support"]].map(([l, h], i) => (
              <Link key={i} href={h} style={{ color: "#555", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#555"}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
