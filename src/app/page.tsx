"use client";

import { useState, useEffect, useRef } from "react";

// ============================================================
// CAPTEN — SITE VITRINE FINAL
// Copywriting : langage de Sarah, pas de jargon
// Design : Light premium, blanc #FAFAF8, orange #FF5C00
// 3 vraies peurs : harcèlement, urgence médicale, chaos admin
// ============================================================

const C = {
  bg: "#FAFAF8",
  bgCard: "#FFFFFF",
  bgSection: "#F4F4F2",
  black: "#0F0F0D",
  gray: "#6B6B63",
  grayLight: "#9B9B93",
  border: "#E8E6E0",
  orange: "#FF5C00",
  orangeBg: "rgba(255,92,0,0.06)",
  orangeBorder: "rgba(255,92,0,0.2)",
  green: "#16A34A",
  greenBg: "rgba(22,163,74,0.06)",
  red: "#DC2626",
  redBg: "rgba(220,38,38,0.06)",
  shadow: "0 1px 4px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
`;

const CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.bg}; color: ${C.black}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  a { text-decoration: none; color: inherit; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .fade-up  { animation: fadeUp 0.7s ease both; }
  .d1 { animation-delay: 0.1s; }
  .d2 { animation-delay: 0.2s; }
  .d3 { animation-delay: 0.3s; }
  .d4 { animation-delay: 0.45s; }

  .btn-main {
    background: ${C.orange}; color: #fff; border: none;
    padding: 14px 28px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600;
    cursor: pointer; transition: all 0.15s ease; display: inline-flex;
    align-items: center; gap: 8px;
  }
  .btn-main:hover { background: #e84d00; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,92,0,0.25); }

  .btn-ghost {
    background: transparent; color: ${C.gray};
    border: 1px solid ${C.border}; padding: 14px 24px;
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 500; cursor: pointer;
    transition: all 0.15s ease;
  }
  .btn-ghost:hover { border-color: ${C.black}; color: ${C.black}; }

  .nav-link { color: ${C.gray}; font-size: 14px; font-weight: 500; transition: color 0.15s; }
  .nav-link:hover { color: ${C.black}; }

  .card {
    background: ${C.bgCard}; border: 1px solid ${C.border};
    border-radius: 14px; transition: all 0.2s ease;
  }
  .card:hover { border-color: rgba(255,92,0,0.3); box-shadow: 0 4px 20px rgba(255,92,0,0.08); transform: translateY(-2px); }

  .faq-item { border-bottom: 1px solid ${C.border}; }
  .faq-item:last-child { border-bottom: none; }

  @media (max-width: 768px) {
    .hero-grid { flex-direction: column !important; }
    .hero-title { font-size: 64px !important; }
    .sec-title  { font-size: 48px !important; }
    .nav-links  { display: none !important; }
    .feat-grid  { grid-template-columns: 1fr !important; }
    .proof-grid { grid-template-columns: 1fr 1fr !important; }
    .kit-layout { flex-direction: column !important; }
    .pricing-feats { grid-template-columns: 1fr !important; }
    .footer-row { flex-direction: column !important; text-align: center; gap: 16px !important; }
    .hero-btns  { flex-direction: column !important; }
    .problem-grid { flex-direction: column !important; }
  }
`;

// ── HELPERS ──────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<any>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [threshold]);
  return [ref, v] as const;
}

function Label({ children, color = C.orange }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500 }}>
        {children}
      </span>
    </div>
  );
}

function SecTitle({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 className="sec-title" style={{
      fontFamily: "'Barlow Condensed',sans-serif",
      fontWeight: 900, fontStyle: "italic",
      fontSize: 64, textTransform: "uppercase",
      lineHeight: 0.9, color: C.black, ...style
    }}>
      {children}
    </h2>
  );
}

// ── NAV ──────────────────────────────────────────────────────
function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 40px", height: 75,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: solid ? "rgba(250,250,248,0.95)" : "transparent",
      backdropFilter: solid ? "blur(16px)" : "none",
      borderBottom: solid ? `1px solid ${C.border}` : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <img src="/logo.png" style={{ height: 48, display: "block", transform: "translateY(16px)" }} alt="Capten" />
      </div>

      {/* Links */}
      <div className="nav-links" style={{ display: "flex", gap: 32 }}>
        {[["#pourquoi","Pourquoi"],["#comment","Comment"],["#templates","Templates"],["#tarif","Tarifs"]].map(([h,l]) => (
          <a key={l} href={h} className="nav-link">{l}</a>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: 10 }}>
        <a href="/login" className="btn-ghost" style={{ padding: "8px 16px", fontSize: 14, display: "inline-flex", alignItems: "center" }}>Se connecter</a>
        <a href="/login?mode=signup" className="btn-main" style={{ padding: "8px 18px", fontSize: 14 }}>Commencer gratuitement</a>
      </div>
    </nav>
  );
}

// ── HERO ─────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "140px 40px 60px", maxWidth: 1200, margin: "0 auto" }}>
      <div className="hero-grid" style={{ display: "flex", gap: 60, alignItems: "flex-start", width: "100%" }}>

        {/* Left */}
        <div style={{ flex: 1 }}>
          {/* Badge */}
          <div className="fade-up" style={{ marginBottom: 24 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: C.orangeBg, border: `1px solid ${C.orangeBorder}`,
              color: C.orange, padding: "5px 13px", borderRadius: 100,
              fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange, animation: "pulse 2s infinite" }} />
              V1 disponible · 14 jours gratuits
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up d1 hero-title" style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 900, fontStyle: "italic",
            fontSize: 96, lineHeight: 0.88,
            textTransform: "uppercase", letterSpacing: -1,
            marginBottom: 28,
          }}>
            TU AS LANCÉ CE CREW<br />
            <span style={{ color: C.orange }}>POUR COURIR.</span><br />
            PAS POUR FAIRE<br />
            <span style={{ color: C.orange }}>L&apos;ADMIN.</span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up d2" style={{ fontSize: 17, color: C.gray, lineHeight: 1.75, marginBottom: 32, maxWidth: 440 }}>
            Pendant que tu cours, Capten gère les inscriptions, protège tes coureurs si quelque chose tourne mal, et te donne les outils pour agir si quelqu'un se comporte mal.
            <strong style={{ color: C.black }}> Toi tu cours. Capten fait le reste.</strong>
          </p>

          {/* CTAs */}
          <div className="fade-up d3 hero-btns" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <a href="/login?mode=signup" className="btn-main" style={{ fontSize: 16, padding: "14px 28px" }}>
              Lancer mon crew gratuitement →
            </a>
            <a href="#pourquoi" className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Voir comment ça marche</a>
          </div>

          <p className="fade-up d4" style={{ fontSize: 12, color: C.grayLight, fontFamily: "'DM Mono',monospace" }}>
            Essai 14 jours · Aucune carte bancaire · Annulable en 1 clic
          </p>

          {/* Social proof */}
          <div className="fade-up d4" style={{ display: "flex", gap: 24, marginTop: 40, paddingTop: 32, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            {[
              { val: "0%",  label: "Commission cagnottes" },
              { val: "50",  label: "Check-ins simultanés" },
              { val: "14j", label: "Essai gratuit" },
            ].map(({ val, label }) => (
              <div key={label}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontStyle: "italic", fontSize: 34, color: C.orange }}>{val}</div>
                <div style={{ fontSize: 12, color: C.grayLight, fontFamily: "'DM Mono',monospace" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Dashboard mockup */}
        <div className="fade-up d3" style={{ flex: 1, maxWidth: 520 }}>
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: 18, overflow: "hidden",
      boxShadow: "0 24px 64px rgba(0,0,0,0.10)",
    }}>
      {/* Chrome */}
      <div style={{ background: "#F0EEE8", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
        {["#FF5F57","#FFBD2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        <div style={{ marginLeft: 8, background: C.bgCard, borderRadius: 5, padding: "3px 12px", fontSize: 11, color: C.grayLight, fontFamily: "monospace" }}>capten.app/dashboard</div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 2, color: C.orange, textTransform: "uppercase" }}>PARIS RUN CLUB</div>
            <div style={{ fontSize: 11, color: C.grayLight, fontFamily: "'DM Mono',monospace" }}>Paris · 47 coureurs</div>
          </div>
          <div style={{ background: C.greenBg, border: "1px solid rgba(22,163,74,0.3)", color: C.green, padding: "3px 10px", borderRadius: 100, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>● ACTIF</div>
        </div>

        {/* 3 peurs résolues */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {/* Urgence */}
          <div style={{ background: "#FFF7F5", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, color: C.red, fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 2 }}>EN CAS D'URGENCE</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>47/47 coureurs protégés</div>
              <div style={{ fontSize: 11, color: C.gray }}>Groupe sanguin · Qui appeler · Allergies</div>
            </div>
            <span style={{ fontSize: 22 }}>🚨</span>
          </div>

          {/* Harcèlement */}
          <div style={{ background: "#F5F0FF", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, color: "#7C3AED", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 2 }}>CHARTE SIGNÉE</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>47/47 engagements signés</div>
              <div style={{ fontSize: 11, color: C.gray }}>Comportement déplacé → exclusion immédiate</div>
            </div>
            <span style={{ fontSize: 22 }}>🛡️</span>
          </div>

          {/* Run ce soir */}
          <div style={{ background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: C.orange, fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>RUN CE SOIR</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15 }}>AFTERWORK CANAL</div>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 8 }}>19h30 · 7km · République · 🌤️ 17°C</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[["Hard","#DC2626"],["Tempo","#D97706"],["Easy","#16A34A"]].map(([g,c]) => (
                <span key={g} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, border: `1px solid ${c}40`, color: c, fontFamily: "'DM Mono',monospace" }}>{g}</span>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 11, color: C.green }}>✓ Voiture balai assignée</span>
            </div>
          </div>

          {/* Message kit */}
          <div style={{ background: C.bgSection, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: C.grayLight, fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>MESSAGE DU SOIR — PRÊT</div>
            <button style={{ width: "100%", background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, color: C.orange, padding: "8px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              📋 Copier le rappel → WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SECTION PROBLÈME ──────────────────────────────────────────
function ProblemSection() {
  const [ref, v] = useInView();
  return (
    <section id="comment" ref={ref} style={{ padding: "100px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <Label>Le dimanche soir d'une fondatrice</Label>
        <SecTitle style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(16px)", transition: "all 0.7s ease" }}>
          Tu stresses.<br />
          <span style={{ color: C.orange }}>On le sait.</span>
        </SecTitle>
      </div>

      {/* Le monologue de Sarah */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: "40px 48px", marginBottom: 40,
        borderLeft: `4px solid ${C.orange}`,
        opacity: v ? 1 : 0, transition: "opacity 0.8s 0.2s ease",
      }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏃‍♀️</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 1, color: C.orange, marginBottom: 12 }}>SARAH · FONDATRICE · CITY RUNNERS · PARIS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { time: "Dimanche 22h", msg: "Je prépare le run de lundi. Qui est inscrit ? J'ai une liste quelque part sur mon téléphone.", emoji: "📱" },
                { time: "Lundi 12h", msg: "Je passe ma pause déj à répondre aux mêmes questions dans le groupe. Même heure, même endroit que d'habitude.", emoji: "💬" },
                { time: "Lundi 18h30", msg: "Une fille que j'ai jamais vue arrive. Elle dit qu'elle s'est inscrite. Je retrouve pas son nom.", emoji: "😰" },
                { time: "Lundi 19h45", msg: "Quelqu'un trébuche au 4ème km. Il va bien. Mais pendant 10 secondes j'ai eu une bouffée d'angoisse. Je connaissais même pas son groupe sanguin.", emoji: "🚨" },
                { time: "Mardi matin", msg: "Une fille m'envoie un message privé. Un mec du groupe lui a envoyé des trucs déplacés après le run. Je peux rien faire. Il a rien signé.", emoji: "😤" },
              ].map(({ time, msg, emoji }) => (
                <div key={time} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{emoji}</span>
                  <div>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: C.grayLight }}>{time} · </span>
                    <span style={{ fontSize: 14, color: C.gray, lineHeight: 1.7 }}>{msg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Avant / Après */}
      <div className="problem-grid" style={{ display: "flex", gap: 20 }}>
        {/* Avant */}
        <div style={{ flex: 1, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, opacity: v ? 1 : 0, transition: "opacity 0.7s 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red }} />
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.gray }}>SANS CAPTEN</span>
          </div>
          {[
            "Liste d'inscriptions sur une note iPhone",
            "Si quelqu'un tombe : tu n'as aucune info",
            "Un mec se comporte mal : tu ne peux rien faire",
            "Impossible de savoir qui vient vraiment",
            "23 messages non lus le lundi matin",
            "Copier-coller la météo manuellement",
            "Cagnotte complexe ou frais abusifs",
            "Prix qui augmente quand le crew grandit",
          ].map(t => (
            <div key={t} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ color: C.red, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✕</span>
              <span style={{ fontSize: 13, color: C.gray, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* Après */}
        <div style={{ flex: 1, background: C.bgCard, border: `1.5px solid ${C.orange}`, borderRadius: 14, padding: 24, opacity: v ? 1 : 0, transition: "opacity 0.7s 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.orange }}>AVEC CAPTEN</span>
          </div>
          {[
            "Portail d'inscription — tes coureurs gèrent seuls",
            "Groupe sanguin et contact en 2 secondes",
            "Charte signée → exclusion immédiate si nécessaire",
            "50 check-ins simultanés, zero file d'attente",
            "Le message du soir rédigé en 1 clic",
            "La météo s'intègre automatiquement dans ton texte",
            "Le café post-run — Capten prend 0% de frais",
            "Ton crew grandit, le prix lui ne bouge pas",
          ].map(t => (
            <div key={t} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ color: C.green, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: C.black, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SECTION 3 PEURS ──────────────────────────────────────────
function FearsSection() {
  const [ref, v] = useInView();
  const fears = [
    {
      icon: "🚨",
      color: C.red,
      colorBg: C.redBg,
      colorBorder: "rgba(220,38,38,0.2)",
      tag: "Si quelqu'un tombe",
      title: "Tu saurais quoi dire aux secours ?",
      desc: "Groupe sanguin. Allergies. Qui appeler en urgence. Chaque coureur le remplit à l'inscription depuis son téléphone. Toi tu l'as en 2 secondes si ça tourne mal.",
      detail: "Rempli par le coureur lui-même · Accessible uniquement par toi · Jamais visible par les autres membres",
    },
    {
      icon: "🛡️",
      color: "#7C3AED",
      colorBg: "#F5F0FF",
      colorBorder: "rgba(124,58,237,0.2)",
      tag: "Si quelqu'un se comporte mal",
      title: "Il a signé avant d'entrer.",
      desc: "Chaque coureur signe une charte de bienveillance à l'inscription. Comportement déplacé, messages inappropriés, remarques sexistes — tu as une trace. Tu peux agir. Immédiatement.",
      detail: "Signature numérique horodatée · Charte personnalisable · Exclusion en 1 clic",
    },
    {
      icon: "⚡",
      color: C.orange,
      colorBg: C.orangeBg,
      colorBorder: C.orangeBorder,
      tag: "Le reste du temps",
      title: "Toi tu cours. Capten gère.",
      desc: "Inscriptions, rappels, check-in de 50 coureurs simultanément, messages WhatsApp pré-rédigés, météo intégrée, cagnottes pour le café. Tout automatique. Zéro WhatsApp de ta part.",
      detail: "25 templates · Check-in GPS simultané · Météo auto · 0% commission",
    },
  ];

  return (
    <section id="pourquoi" ref={ref} style={{ padding: "80px 40px 100px", background: C.bgSection }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Label>Ce que Capten résout</Label>
          <SecTitle style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(16px)", transition: "all 0.7s ease" }}>
            Trois choses<br />
            <span style={{ color: C.orange }}>qui t'empêchent<br />de dormir.</span>
          </SecTitle>
        </div>

        <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {fears.map(({ icon, color, colorBg, colorBorder, tag, title, desc, detail }, i) => (
            <div key={tag} className="card" style={{
              padding: 28, cursor: "default",
              opacity: v ? 1 : 0,
              transform: v ? "none" : "translateY(16px)",
              transition: `all 0.6s ${i * 0.1}s ease`,
            }}>
              {/* Tag */}
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  background: colorBg, border: `1px solid ${colorBorder}`,
                  color, padding: "4px 10px", borderRadius: 100,
                  fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase"
                }}>{tag}</span>
              </div>

              {/* Icon + Title */}
              <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
              <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontStyle: "italic", fontSize: 22, textTransform: "uppercase", lineHeight: 1.1, marginBottom: 12, color: C.black }}>{title}</h3>

              {/* Desc */}
              <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.75, marginBottom: 16 }}>{desc}</p>

              {/* Detail */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: C.grayLight, lineHeight: 1.8 }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SECTION TEMPLATES ─────────────────────────────────────────
function TemplatesSection() {
  const [active, setActive] = useState(0);
  const [ref, v] = useInView();

  const cats = [
    {
      label: "Avant le run", icon: "⏰",
      templates: ["Rappel standard", "Météo difficile", "Run complet", "J-1 rappel", "Place libérée", "Premier run"],
      preview: `PARIS RUN CLUB 🏃

Ce soir 19h30 au Canal. 7km, session tempo.
🌤️ 17°C — conditions parfaites.

Valide ta présence :
capten.app/parisrunclub/run/ce-soir`,
    },
    {
      label: "Pendant le run", icon: "🏃",
      templates: ["Départ dans 5 min", "Run annulé météo", "Run annulé report"],
      preview: `PARIS RUN CLUB ⏱️

Départ dans 5 minutes. On part à l'heure.
Si tu arrives après 19h35, rejoins le groupe
Easy au Canal.`,
    },
    {
      label: "Après le run", icon: "✅",
      templates: ["Débrief standard", "Record de présence", "Avec cagnotte", "Challenge complété"],
      preview: `PARIS RUN CLUB ✅

42 présents hier soir. Bien joué.
Ton score d'assiduité a été mis à jour.

capten.app/parisrunclub/stats`,
    },
    {
      label: "Social Spot", icon: "☕",
      templates: ["Annonce du café", "Cagnotte collectée", "Débrief café"],
      preview: `PARIS RUN CLUB ☕

Après le run ce soir, on se retrouve
au Boot Café — 92 rue du Fg Saint-Martin.

On se retrouve tous là-bas !`,
    },
  ];

  const cat = cats[active];

  return (
    <section id="templates" ref={ref} style={{ padding: "100px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <Label>Communication</Label>
        <SecTitle style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(16px)", transition: "all 0.7s ease", marginBottom: 16 }}>
          25 messages.<br />
          <span style={{ color: C.orange }}>Zéro à écrire.</span>
        </SecTitle>
        <p style={{ color: C.gray, fontSize: 17, maxWidth: 460, margin: "0 auto", opacity: v ? 1 : 0, transition: "opacity 0.7s 0.2s ease" }}>
          Capten génère le message parfait selon la situation. Tu copies, tu colles dans ton groupe. C'est tout.
        </p>
      </div>

      <div className="kit-layout" style={{ display: "flex", gap: 32 }}>
        {/* Left */}
        <div style={{ flex: 1 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {cats.map((c, i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: active === i ? C.orange : C.bgCard,
                border: `1px solid ${active === i ? C.orange : C.border}`,
                color: active === i ? "#fff" : C.gray,
                padding: "7px 14px", borderRadius: 8, fontSize: 13,
                fontWeight: active === i ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          {/* Template list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {cat.templates.map(t => (
              <div key={t} style={{
                background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,92,0,0.3)"; e.currentTarget.style.background = C.orangeBg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgCard; }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{cat.icon} {t}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, color: C.orange, padding: "2px 9px", borderRadius: 5, fontFamily: "'DM Mono',monospace" }}>Copier</span>
                  <span style={{ fontSize: 11, background: "#128C7E15", border: "1px solid #128C7E30", color: "#25D366", padding: "2px 9px", borderRadius: 5, fontFamily: "'DM Mono',monospace" }}>WhatsApp</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Preview */}
        <div style={{ width: 360, flexShrink: 0 }}>
          <div style={{ background: C.bgCard, border: `1.5px solid ${C.orangeBorder}`, borderRadius: 16, overflow: "hidden" }}>
            {/* WhatsApp header */}
            <div style={{ background: "#128C7E", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 13 }}>P</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>PARIS RUN CLUB</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Groupe WhatsApp · 47 membres</div>
              </div>
            </div>

            {/* Message */}
            <div style={{ padding: 20 }}>
              <div style={{ background: "#1F2C34", borderRadius: "12px 12px 12px 2px", padding: 16, marginBottom: 12 }}>
                <div style={{ color: "#E9EDE9", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-line" }}>{cat.preview}</div>
                <div style={{ textAlign: "right", marginTop: 8, fontSize: 10, color: "#8696A0" }}>18:30 ✓✓</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, color: C.orange, padding: "9px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📋 Copier</button>
                <button style={{ flex: 1, background: "#128C7E15", border: "1px solid #128C7E30", color: "#25D366", padding: "9px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📱 Ouvrir WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SECTION GPS ───────────────────────────────────────────────
function GPSSection() {
  const [count, setCount] = useState(0);
  const [ref, v] = useInView();
  useEffect(() => {
    if (!v) return;
    const t = setInterval(() => setCount(p => p < 50 ? p + 1 : p), 60);
    return () => clearInterval(t);
  }, [v]);

  return (
    <section style={{ padding: "100px 40px", background: C.bgSection }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div ref={ref} style={{ display: "flex", gap: 80, alignItems: "center" }}>
          {/* Left */}
          <div style={{ flex: 1 }}>
            <Label>Check-in</Label>
            <h2 style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontStyle: "italic",
              fontSize: 60, textTransform: "uppercase", lineHeight: 0.88, marginBottom: 24,
              opacity: v ? 1 : 0, transform: v ? "none" : "translateX(-20px)", transition: "all 0.8s ease",
            }}>
              50 coureurs.<br />
              <span style={{ color: C.orange }}>Zéro file<br />d'attente.</span>
            </h2>
            <p style={{ color: C.gray, fontSize: 16, lineHeight: 1.8, marginBottom: 28, maxWidth: 420, opacity: v ? 1 : 0, transition: "opacity 0.7s 0.2s ease" }}>
              Chaque coureur reçoit son lien dans le groupe WhatsApp. Il arrive au parc. Il clique. Sa présence est validée à moins de 50 mètres du départ. En 2 secondes. Toi tu cours déjà.
            </p>
            {[
              { icon: "📍", text: "Validation à moins de 50m du point de départ" },
              { icon: "⚡", text: "50 check-ins simultanés — personne n'attend derrière toi" },
              { icon: "🔒", text: "Zéro tracking pendant le run — vie privée respectée" },
              { icon: "✋", text: "Validation manuelle si quelqu'un est en panne de batterie" },
            ].map(({ icon, text }, i) => (
              <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14, opacity: v ? 1 : 0, transition: `opacity 0.6s ${0.3 + i * 0.1}s ease` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <span style={{ color: C.gray, fontSize: 15, lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Right — GPS viz */}
          <div style={{ flex: 1, maxWidth: 440 }}>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, boxShadow: C.shadowMd }}>
              {/* Map */}
              <div style={{ position: "relative", height: 240, background: "#0F1A0F", borderRadius: 12, overflow: "hidden", marginBottom: 16, border: "1px solid rgba(22,163,74,0.2)" }}>
                {[20,40,60,80].map(p => <div key={p} style={{ position:"absolute", left:`${p}%`, top:0, bottom:0, width:1, background:"rgba(255,255,255,0.04)" }} />)}
                {[33,66].map(p => <div key={p} style={{ position:"absolute", top:`${p}%`, left:0, right:0, height:1, background:"rgba(255,255,255,0.04)" }} />)}

                {/* Center */}
                <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)" }}>
                  <div style={{ width:14, height:14, borderRadius:"50%", background: C.orange, border:"3px solid rgba(255,92,0,0.3)" }} />
                  <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:80, height:80, borderRadius:"50%", border:"1px dashed rgba(255,92,0,0.2)" }} />
                </div>

                {/* Dots */}
                {Array.from({length:20},(_,i) => ({
                  x: 12 + (i%5)*18, y: 18 + Math.floor(i/5)*22
                })).map((d,i) => {
                  const active = i < Math.floor(count * 20 / 50);
                  return (
                    <div key={i} style={{ position:"absolute", left:`${d.x}%`, top:`${d.y}%`, transform:"translate(-50%,-50%)", opacity: active ? 1 : 0.15, transition:"opacity 0.3s" }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", background: active ? "rgba(22,163,74,0.9)" : "rgba(255,255,255,0.1)", border:`1.5px solid ${active ? "rgba(22,163,74,0.5)" : "rgba(255,255,255,0.1)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#fff", fontWeight:700 }}>
                        {String.fromCharCode(65+i)}
                      </div>
                    </div>
                  );
                })}

                {/* Counter */}
                <div style={{ position:"absolute", top:12, right:12, background:"rgba(250,250,248,0.95)", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontStyle:"italic", fontSize:32, color:C.orange, lineHeight:1 }}>{count}/50</div>
                  <div style={{ fontSize:9, color:C.grayLight, fontFamily:"'DM Mono',monospace" }}>CHECK-IN GPS</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[{icon:"⚡",v:`${count}`,l:"Simultanés"},{icon:"⏱️",v:"2s",l:"Par coureur"},{icon:"🏃",v:"Libre",l:"Le fondateur"}].map(({icon,v:val,l}) => (
                  <div key={l} style={{ textAlign:"center", background:C.bgSection, borderRadius:8, padding:10 }}>
                    <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontStyle:"italic", fontSize:24, color:C.orange }}>{val}</div>
                    <div style={{ fontSize:10, color:C.grayLight, fontFamily:"'DM Mono',monospace" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SECTION PRICING ───────────────────────────────────────────
function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const [ref, v] = useInView();

  return (
    <section id="tarif" ref={ref} style={{ padding: "100px 40px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <Label>Tarif</Label>
        <SecTitle style={{ marginBottom: 16, opacity: v ? 1 : 0, transform: v ? "none" : "translateY(16px)", transition: "all 0.7s ease" }}>
          Un prix.<br /><span style={{ color: C.orange }}>Tout inclus.</span>
        </SecTitle>
        <p style={{ color: C.gray, fontSize: 16, marginBottom: 12, opacity: v ? 1 : 0, transition: "opacity 0.7s 0.2s ease" }}>
          Si tu organises 2 runs par mois,<br />Capten coûte moins qu'un café par run.
        </p>
        <p style={{ color: C.grayLight, fontSize: 13, marginBottom: 40, fontFamily: "'DM Mono',monospace", opacity: v ? 1 : 0, transition: "opacity 0.7s 0.3s ease" }}>
          Pas de limites de coureurs · Pas d'options cachées
        </p>

        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 40, opacity: v ? 1 : 0, transition: "opacity 0.7s 0.3s ease" }}>
          <span style={{ fontSize: 14, color: !annual ? C.black : C.grayLight, fontWeight: !annual ? 600 : 400 }}>Mensuel</span>
          <div onClick={() => setAnnual(!annual)} style={{ width: 44, height: 24, background: annual ? C.orange : C.border, borderRadius: 100, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 3, left: annual ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: 14, color: annual ? C.black : C.grayLight, fontWeight: annual ? 600 : 400 }}>
            Annuel <span style={{ background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, color: C.orange, padding: "1px 7px", borderRadius: 100, fontSize: 11, marginLeft: 4 }}>−2 mois</span>
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: C.bgCard, border: `2px solid ${C.orange}`,
          borderRadius: 20, padding: 44, position: "relative",
          boxShadow: "0 8px 32px rgba(255,92,0,0.12)",
          opacity: v ? 1 : 0, transition: "opacity 0.7s 0.4s ease",
        }}>
          <div style={{ position: "absolute", top: 16, right: 16, background: C.orange, color: "#fff", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>
            14 JOURS GRATUITS
          </div>

          {/* Price */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontStyle: "italic", fontSize: 80, lineHeight: 1, color: C.black }}>
                {annual ? "33" : "49"}
              </span>
              <div>
                <div style={{ fontSize: 24, color: C.gray }}>,99€</div>
                <div style={{ fontSize: 13, color: C.grayLight }}>/mois</div>
              </div>
            </div>
            {annual && <div style={{ fontSize: 13, color: C.orange, marginTop: 4 }}>facturé 399€/an</div>}
          </div>

          {/* Features */}
          <div className="pricing-feats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px", marginBottom: 32, textAlign: "left" }}>
            {[
              { t: "Tes coureurs s'inscrivent seuls.", d: "Tu ne touches à rien." },
              { t: "Si quelqu'un tombe ce soir :", d: "groupe sanguin, allergies, qui appeler.\nEn 2 secondes." },
              { t: "Il se comporte mal.", d: "Il a signé avant d'entrer.\nTu peux l'exclure maintenant." },
              { t: "50 check-ins. Simultanés.", d: "Toi tu cours déjà." },
              { t: "Le message du soir.", d: "1 clic. Tu colles dans WhatsApp.\nC'est tout." },
              { t: "La météo s'intègre automatiquement.", d: "Ton message s'adapte tout seul." },
              { t: "Le café post-run.", d: "Tes coureurs contribuent.\nCapten prend 0%." },
              { t: "Ton crew grandit.", d: "Le prix, lui, ne bouge pas." }
            ].map(({ t, d }) => (
              <div key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#16A34A", flexShrink: 0, marginTop: 2, fontSize: 16 }}>✓</span>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#0F0F0D", fontWeight: 600, lineHeight: 1.3 }}>{t}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B6B63", fontWeight: 400, lineHeight: 1.4, whiteSpace: "pre-line", marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          <a href="/login?mode=signup" className="btn-main" style={{ width: "100%", justifyContent: "center", padding: "16px", fontFamily: "'Barlow Condensed',sans-serif", fontStyle: "italic", fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>
            Lancer mon crew gratuitement →
          </a>
          <p style={{ marginTop: 12, fontSize: 12, color: C.grayLight, fontFamily: "'DM Mono',monospace" }}>
            Aucune carte bancaire · Annulable en 1 clic
          </p>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const [ref, v] = useInView();

  const faqs = [
    {
      q: "Est-ce que mes coureurs doivent télécharger une app ?",
      a: "Non. Jamais. Ton coureur reçoit un lien dans le groupe WhatsApp. Il clique. Il s'inscrit, remplit ses infos, signe la charte. Tout dans son navigateur. Aucune app à installer.",
    },
    {
      q: "Qui voit les informations médicales de mes coureurs ?",
      a: "Toi uniquement. Personne d'autre dans le crew n'y a accès. Ces informations ne sont là que pour toi, si quelque chose tourne mal pendant un run.",
    },
    {
      q: "Est-ce que je peux exclure quelqu'un du crew facilement ?",
      a: "Oui. Et parce que chaque coureur a signé la charte de bienveillance à l'inscription, tu as une trace de son engagement. Tu peux l'exclure immédiatement, sans discussion.",
    },
    {
      q: "Je peux garder mon groupe WhatsApp ?",
      a: "Oui. Capten génère les messages parfaits. Toi tu les copies et tu les colles dans ton groupe habituel. Tu gardes la relation humaine avec tes coureurs, Capten fait le travail administratif.",
    },
    {
      q: "Comment fonctionne la cagnotte pour le café ?",
      a: "Tu colles ton lien Lydia ou Revolut dans les réglages. Tes coureurs contribuent depuis le portail d'inscription. L'argent arrive directement sur ton téléphone. Capten ne prend aucune commission.",
    },
    {
      q: "Que se passe-t-il après les 14 jours gratuits ?",
      a: "Tu repasses en accès limité automatiquement. Aucune carte débitée sans ton accord explicite. Pas de surprise. Pas de piège.",
    },
  ];

  return (
    <section ref={ref} style={{ padding: "80px 40px 100px", background: C.bgSection }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Label>Questions</Label>
          <SecTitle style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(16px)", transition: "all 0.7s ease" }}>
            Ce que tu<br /><span style={{ color: C.orange }}>te demandes.</span>
          </SecTitle>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: "100%", padding: "20px 24px", display: "flex",
                justifyContent: "space-between", alignItems: "center",
                background: "transparent", border: "none", cursor: "pointer",
                textAlign: "left", transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.bgSection}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.black, paddingRight: 20 }}>{f.q}</span>
                <span style={{ fontSize: 20, color: C.orange, flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 24px 20px", animation: "fadeIn 0.2s ease" }}>
                  <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.75, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FOOTER FINAL CTA ─────────────────────────────────────────
function FooterCTA() {
  return (
    <section style={{ background: C.black, padding: "80px 40px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontStyle: "italic",
          fontSize: 72, textTransform: "uppercase", lineHeight: 0.88,
          color: "#fff", marginBottom: 20,
        }}>
          Ton crew mérite<br />
          <span style={{ color: C.orange }}>mieux que<br />WhatsApp.</span>
        </h2>
        <p style={{ color: "#888", fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
          Rejoins les fondateurs qui ont décidé de courir<br />sans stresser pour l'admin. 14 jours pour le voir.
        </p>
        <a href="/login?mode=signup" className="btn-main" style={{ padding: "16px 40px", fontFamily: "'Barlow Condensed',sans-serif", fontStyle: "italic", fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, display: "inline-flex", justifyContent: "center" }}>
          Lancer mon crew gratuitement →
        </a>
        <p style={{ marginTop: 14, fontSize: 12, color: "#555", fontFamily: "'DM Mono',monospace" }}>
          Aucune carte bancaire · Annulable en 1 clic
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "28px 40px" }}>
      <div className="footer-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo.png" style={{ height: 28, display: "block" }} alt="Capten" />
        </div>
        <p style={{ fontSize: 13, color: C.grayLight }}>
          © {new Date().getFullYear()} Capten. Tous droits réservés.
        </p>
        <div style={{ display: "flex", gap: 24, fontSize: 13, color: C.gray }}>
          <a href="/mentions-legales" className="nav-link">Mentions Légales</a>
          <a href="/cgu" className="nav-link">CGU</a>
          <a href="/rgpd" className="nav-link">RGPD</a>
        </div>
      </div>
    </footer>
  );
}

// ── PAGE PRINCIPALE ──────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ background: C.bg, color: C.black, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
        <Nav />
        <Hero />
        <FearsSection />
        <ProblemSection />
        <TemplatesSection />
        <GPSSection />
        <PricingSection />
        <FAQ />
        <FooterCTA />
        <Footer />
      </div>
    </>
  );
}
