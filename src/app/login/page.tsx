"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  Mail, Lock, ArrowRight, Loader2,
  MessageSquare, MapPin, Wallet, ShieldCheck, AlertCircle, CheckCircle2,
  Eye, EyeOff, ArrowLeft, Zap, Users, BarChart3, UserPlus, CreditCard, Calendar, Hash
} from "lucide-react";
import { loginWithPassword, loginWithOtp, resetPassword, signUp } from "./actions";

/* ── Design Tokens ─────────────────────────────────────── */
const C = {
  bg: "#FFFFFF",
  surface: "#FAFAFA",
  surface2: "#F4F4F5",
  orange: "#FF5C00",
  orangeHover: "#FF7233",
  orangeDim: "rgba(255,92,0,0.05)",
  orangeBorder: "rgba(255,92,0,0.15)",
  text: "#09090B",
  textSecondary: "#52525B",
  textMuted: "#71717A",
  textLight: "#A1A1AA",
  border: "rgba(0,0,0,0.08)",
  green: "#16A34A",
  red: "#DC2626",
};

/* ── CSS ───────────────────────────────────────────────── */
const LOGIN_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  .login-fade-up { animation: fadeUp 0.6s ease both; }
  .login-fade-up-1 { animation: fadeUp 0.6s ease 0.1s both; }
  .login-fade-up-2 { animation: fadeUp 0.6s ease 0.2s both; }
  .login-fade-up-3 { animation: fadeUp 0.6s ease 0.3s both; }
  .login-fade-up-4 { animation: fadeUp 0.6s ease 0.4s both; }
  .login-slide-left { animation: slideInLeft 0.7s ease 0.15s both; }

  .login-input {
    width: 100%;
    padding: 14px 14px 14px 48px;
    background: ${C.surface};
    border: 1.5px solid ${C.border};
    border-radius: 14px;
    font-size: 14px;
    font-weight: 500;
    color: ${C.text};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    font-family: var(--font-dm-sans), sans-serif;
  }
  .login-input::placeholder {
    color: ${C.textLight};
    font-weight: 400;
  }
  .login-input:focus {
    border-color: ${C.orange};
    box-shadow: 0 0 0 3px rgba(255,92,0,0.08);
    background: ${C.bg};
  }
  .login-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .login-btn {
    width: 100%;
    padding: 15px 24px;
    background: ${C.orange};
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    font-family: var(--font-dm-sans), sans-serif;
  }
  .login-btn:hover:not(:disabled) {
    background: ${C.orangeHover};
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(255,92,0,0.25);
  }
  .login-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .feature-card {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    transition: background 0.2s, border-color 0.2s;
  }
  .feature-card:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,92,0,0.3);
  }

  .eye-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: ${C.textLight};
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }
  .eye-toggle:hover {
    color: ${C.textSecondary};
  }

  .tab-toggle {
    display: flex;
    background: ${C.surface2};
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 32px;
  }
  .tab-toggle button {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    cursor: pointer;
    font-family: var(--font-dm-sans), sans-serif;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .tab-toggle button.active {
    background: ${C.bg};
    color: ${C.text};
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .tab-toggle button:not(.active) {
    background: transparent;
    color: ${C.textLight};
  }
  .tab-toggle button:not(.active):hover {
    color: ${C.textSecondary};
  }

  @media (max-width: 768px) {
    .login-split { flex-direction: column !important; }
    .login-right { display: none !important; }
    .login-left { width: 100% !important; padding: 32px 24px !important; }
  }
`;

/* ── Features Showcase ─────────────────────────────────── */
const FEATURES = [
  {
    icon: MessageSquare,
    title: "Automation WhatsApp",
    desc: "Rappels et notifications automatisés pour chaque session.",
  },
  {
    icon: MapPin,
    title: "Check-in GPS",
    desc: "Validation géolocalisée pour une assiduité vérifiée.",
  },
  {
    icon: Wallet,
    title: "Paiements Intégrés",
    desc: "Monétisez vos sessions via Stripe Connect.",
  },
  {
    icon: ShieldCheck,
    title: "Protection Juridique",
    desc: "Décharges numériques automatiques à l'inscription.",
  },
];

/* ── Stats ─────────────────────────────────────────────── */
const STATS = [
  { value: "500+", label: "Clubs Actifs" },
  { value: "15K", label: "Runners" },
  { value: "99.9%", label: "Uptime" },
];

/* ── Login Form Component ──────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";

  // URL Query Parameters
  const paramVariant = searchParams.get("variant") as 'A' | 'B' | null;
  const isFreePlanUrl = searchParams.get("free") === "true";
  const isUpgradeUrl = searchParams.get("upgrade") === "true";

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [ville, setVille] = useState("");
  const [membersCount, setMembersCount] = useState("");
  const [instagramLink, setInstagramLink] = useState("");

  // Step 2 Card states
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"password" | "signup" | "forgot">("password");

  // Persistent variant resolving
  const [assignedVariant, setAssignedVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    // Read from params or storage or roll
    let currentVariant = paramVariant;
    if (!currentVariant || !['A', 'B'].includes(currentVariant)) {
      currentVariant = localStorage.getItem('capten_signup_variant') as 'A' | 'B';
    }
    if (!currentVariant || !['A', 'B'].includes(currentVariant)) {
      currentVariant = Math.random() < 0.5 ? 'A' : 'B';
    }
    localStorage.setItem('capten_signup_variant', currentVariant);
    setAssignedVariant(currentVariant);

    // Track signup page view
    fetch('/api/ab-test/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant: currentVariant, page: 'signup' }),
    }).catch(err => console.error('Error tracking view:', err));
  }, [paramVariant]);

  const switchMode = (newMode: "password" | "signup" | "forgot") => {
    setMode(newMode);
    setSignupStep(1);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === "password") {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const result = await loginWithPassword(formData);

      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      } else {
        router.push(redirectedFrom);
        router.refresh();
      }
    } else if (mode === "signup") {
      // Step 1 validation
      if (password !== confirmPassword) {
        setErrorMessage("Les mots de passe ne correspondent pas.");
        return;
      }

      // Unless free plan URL (free=true), trial signup requires Step 2 (Card) for 21-day trial
      if (!isFreePlanUrl && signupStep === 1) {
        setSignupStep(2);
        return;
      }

      // Submission
      setIsLoading(true);
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("clubName", clubName);
      formData.append("ville", ville);
      formData.append("membersCount", membersCount);
      formData.append("instagramLink", instagramLink);
      formData.append("variant", assignedVariant);

      const targetPlan = !isFreePlanUrl ? 'trial' : 'free';
      formData.append("plan", targetPlan);

      const result = await signUp(formData);

      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      } else if (result.success) {
        if (result.isMock) {
          // Demo Mode - set mock states
          localStorage.setItem('capten_club_name', clubName.trim());
          localStorage.setItem('capten_plan', targetPlan === 'trial' ? 'CAPTEN' : 'GRATUIT');
          document.cookie = `capten_plan=${targetPlan === 'trial' ? 'CAPTEN' : 'GRATUIT'}; path=/; max-age=31536000`;
          
          if (targetPlan === 'trial') {
            const ends = new Date();
            ends.setDate(ends.getDate() + 21);
            localStorage.setItem('capten_trial_ends_at', ends.toISOString());
          }
          
          router.push('/dashboard');
          router.refresh();
        } else {
          // Supabase real mode
          if ((result as any).needsConfirmation) {
            setSuccessMessage(
              result.message || "Compte créé ! Vérifiez vos e-mails pour confirmer votre inscription."
            );
            setIsLoading(false);
          } else {
            // Check if we need to redirect to payment intent / subscription flow
            if (isUpgradeUrl && targetPlan === 'free') {
              router.push('/plan');
            } else {
              router.push('/dashboard');
              router.refresh();
            }
          }
        }
      }
    } else {
      // Forgot Password request
      setIsLoading(true);
      const formData = new FormData();
      formData.append("email", email);
      const result = await resetPassword(formData);

      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      } else {
        setSuccessMessage(
          result.message || "E-mail de réinitialisation envoyé ! Veuillez vérifier vos e-mails."
        );
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 400,
      margin: "0 auto",
    }}>
      {/* Tab Toggle (Login / Signup) */}
      {mode !== "forgot" && (
        <div className="login-fade-up tab-toggle">
          <button
            type="button"
            className={mode === "password" ? "active" : ""}
            onClick={() => switchMode("password")}
          >
            <Lock size={13} />
            Connexion
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => switchMode("signup")}
          >
            <UserPlus size={13} />
            Créer un compte
          </button>
        </div>
      )}

      {/* Header */}
      <div className="login-fade-up" style={{ marginBottom: 32 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: mode === "signup" 
            ? (assignedVariant === 'B' && !isFreePlanUrl 
                ? (signupStep === 1 ? "rgba(22,163,74,0.05)" : "rgba(255,92,0,0.05)")
                : "rgba(22,163,74,0.05)") 
            : C.orangeDim,
          border: `1px solid ${mode === "signup" 
            ? (assignedVariant === 'B' && !isFreePlanUrl
                ? (signupStep === 1 ? "rgba(22,163,74,0.18)" : "rgba(255,92,0,0.18)")
                : "rgba(22,163,74,0.18)")
            : C.orangeBorder}`,
          color: mode === "signup" 
            ? (assignedVariant === 'B' && !isFreePlanUrl
                ? (signupStep === 1 ? C.green : C.orange)
                : C.green)
            : C.orange,
          padding: "5px 14px",
          borderRadius: 100,
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 20,
        }}>
          {mode === "signup" 
            ? (assignedVariant === 'B' && !isFreePlanUrl 
                ? (signupStep === 1 ? <UserPlus size={10} /> : <CreditCard size={10} />)
                : <UserPlus size={10} />)
            : <Lock size={10} />}
          {mode === "password" 
            ? "Espace Sécurisé" 
            : mode === "signup" 
              ? (!isFreePlanUrl
                  ? (signupStep === 1 ? "Étape 1 sur 2" : "Étape 2 sur 2")
                  : "Nouveau Capitaine")
              : "Réinitialisation"}
        </div>

        <h1 style={{
          fontFamily: "var(--font-barlow), sans-serif",
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 42,
          lineHeight: 1.25,
          color: C.text,
          textTransform: "uppercase",
          letterSpacing: -1,
          marginBottom: 12,
        }}>
          {mode === "password" 
            ? "CONNEXION" 
            : mode === "signup" 
              ? (!isFreePlanUrl
                  ? (signupStep === 1 ? "INSCRIPTION" : "CARTE BANCAIRE")
                  : "INSCRIPTION")
              : "RÉINITIALISATION"}
        </h1>

        <p style={{
          fontSize: 15,
          color: C.textMuted,
          fontFamily: "var(--font-dm-sans), sans-serif",
          lineHeight: 1.6,
        }}>
          {mode === "password"
            ? "Accédez à votre tableau de bord et pilotez votre run club."
            : mode === "signup"
              ? (!isFreePlanUrl
                  ? (signupStep === 1 
                      ? "Saisissez vos informations de compte capitaine pour commencer votre essai."
                      : "Enregistrez votre carte pour activer l'essai de 21 jours. Aucun prélèvement aujourd'hui.")
                  : "Créez votre compte capitaine et lancez votre run club en 2 minutes.")
              : "Saisissez votre e-mail pour recevoir un lien de réinitialisation."}
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="login-fade-up" style={{
          background: "rgba(220,38,38,0.05)",
          border: "1px solid rgba(220,38,38,0.15)",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 24,
        }}>
          <AlertCircle size={16} style={{ color: C.red, flexShrink: 0, marginTop: 1 }} />
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.red,
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}>
            {errorMessage}
          </span>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="login-fade-up" style={{
          background: "rgba(22,163,74,0.05)",
          border: "1px solid rgba(22,163,74,0.15)",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 24,
        }}>
          <CheckCircle2 size={16} style={{ color: C.green, flexShrink: 0, marginTop: 1 }} />
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.green,
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}>
            {successMessage}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {mode === "signup" && signupStep === 1 && (
          <>
            {/* Club Name Field */}
            <div className="login-fade-up-1" style={{ marginBottom: 16 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: C.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}>
                Nom du Run Club
              </label>
              <div style={{ position: "relative" }}>
                <Users size={16} style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.textLight,
                }} />
                <input
                  type="text"
                  required
                  placeholder="Ex: Paris Running Crew"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  disabled={isLoading}
                  className="login-input"
                  id="signup-club-name"
                />
              </div>
            </div>

            {/* Extra fields for Variant B */}
            {assignedVariant === 'B' && (
              <>
                {/* Ville */}
                <div className="login-fade-up-1" style={{ marginBottom: 16 }}>
                  <label style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}>
                    Ville d'activité
                  </label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={16} style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.textLight,
                    }} />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Paris"
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      disabled={isLoading}
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Membres count */}
                <div className="login-fade-up-1" style={{ marginBottom: 16 }}>
                  <label style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}>
                    Nombre de membres actifs (estimation)
                  </label>
                  <div style={{ position: "relative" }}>
                    <Users size={16} style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.textLight,
                    }} />
                    <input
                      type="number"
                      required
                      placeholder="Ex: 40"
                      value={membersCount}
                      onChange={(e) => setMembersCount(e.target.value)}
                      disabled={isLoading}
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Instagram link */}
                <div className="login-fade-up-1" style={{ marginBottom: 16 }}>
                  <label style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}>
                    Lien Instagram (Optionnel)
                  </label>
                  <div style={{ position: "relative" }}>
                    <Zap size={16} style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.textLight,
                    }} />
                    <input
                      type="url"
                      placeholder="Ex: https://instagram.com/monclub"
                      value={instagramLink}
                      onChange={(e) => setInstagramLink(e.target.value)}
                      disabled={isLoading}
                      className="login-input"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 1 Fields: Email & Password (Login, Forgot, and Signup Step 1) */}
        {signupStep === 1 && (
          <>
            {/* Email Field */}
            <div className="login-fade-up-1" style={{ marginBottom: 16 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: C.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}>
                Adresse e-mail
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.textLight,
                }} />
                <input
                  type="email"
                  required
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="login-input"
                  id="login-email"
                />
              </div>
            </div>

            {/* Password Field (Login & Signup modes) */}
            {(mode === "password" || mode === "signup") && (
              <>
                <div className="login-fade-up-2" style={{ marginBottom: mode === "signup" ? 16 : 8 }}>
                  <label style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}>
                    Mot de passe
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.textLight,
                    }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="login-input"
                      id="login-password"
                      placeholder={mode === "signup" ? "6 caractères minimum" : "••••••••"}
                      minLength={mode === "signup" ? 6 : undefined}
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Signup only) */}
                {mode === "signup" && (
                  <div className="login-fade-up-2" style={{ marginBottom: 8 }}>
                    <label style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                      fontFamily: "var(--font-dm-sans), sans-serif",
                    }}>
                      Confirmer le mot de passe
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock size={16} style={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: C.textLight,
                      }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="login-input"
                        id="signup-confirm-password"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                {/* Forgot Password Link (Login mode only) */}
                {mode === "password" && (
                  <div className="login-fade-up-2" style={{
                    textAlign: "right",
                    marginBottom: 28,
                  }}>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      style={{
                        background: "none",
                        border: "none",
                        color: C.orange,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        padding: 0,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = C.orangeHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = C.orange)}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                {/* Signup spacing */}
                {mode === "signup" && <div style={{ marginBottom: 28 }} />}
              </>
            )}
          </>
        )}

        {/* Step 2 Fields: Card Details (Variant B Trial signup only) */}
        {mode === "signup" && signupStep === 2 && (
          <div className="login-fade-up space-y-4">
            {/* Trial Recap Panel */}
            <div style={{
              background: "#FDFCF8",
              border: "1px dashed #FF5C00",
              borderRadius: 14,
              padding: 18,
              marginBottom: 20,
            }}>
              <h4 style={{
                fontFamily: "var(--font-barlow), sans-serif",
                fontStyle: "italic",
                fontWeight: 900,
                fontSize: 15,
                color: "#000",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 10,
              }}>
                ESSAI CAPTEN — 21 JOURS
              </h4>
              <ul style={{
                fontSize: 12,
                color: C.textSecondary,
                paddingLeft: 16,
                listStyleType: "disc",
                lineHeight: 1.6,
                margin: 0,
              }}>
                <li>Accès complet premium immédiat sans restriction.</li>
                <li style={{ fontWeight: 800, color: C.text }}>Rien ne t'est prélevé aujourd'hui.</li>
                <li>Débit de 49,99 €/mois à partir du <span style={{ fontWeight: 700 }}>{new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</span>.</li>
                <li>Annulation en 1 clic sans justification depuis tes réglages.</li>
              </ul>
            </div>

            {/* Card Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: C.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}>
                Titulaire de la carte
              </label>
              <div style={{ position: "relative" }}>
                <Users size={16} style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.textLight,
                }} />
                <input
                  type="text"
                  required
                  placeholder="Jean Dupont"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  disabled={isLoading}
                  className="login-input"
                />
              </div>
            </div>

            {/* Card Number */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: C.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}>
                Numéro de carte bancaire
              </label>
              <div style={{ position: "relative" }}>
                <CreditCard size={16} style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.textLight,
                }} />
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                    let matches = v.match(/\d{4,16}/g);
                    let match = matches && matches[0] || '';
                    let parts = [];
                    for (let i=0, len=match.length; i<len; i+=4) {
                      parts.push(match.substring(i, i+4));
                    }
                    if (parts.length > 0) {
                      setCardNumber(parts.join(' '));
                    } else {
                      setCardNumber(v);
                    }
                  }}
                  disabled={isLoading}
                  className="login-input"
                />
              </div>
            </div>

            {/* Expiry & CVC Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8,
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}>
                  Date d'expiration
                </label>
                <div style={{ position: "relative" }}>
                  <Calendar size={16} style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.textLight,
                  }} />
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      if (v.length >= 2) {
                        setCardExpiry(v.substring(0, 2) + '/' + v.substring(2, 4));
                      } else {
                        setCardExpiry(v);
                      }
                    }}
                    disabled={isLoading}
                    className="login-input"
                  />
                </div>
              </div>
              <div>
                <label style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8,
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}>
                  CVC / CVV
                </label>
                <div style={{ position: "relative" }}>
                  <Hash size={16} style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.textLight,
                  }} />
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                    disabled={isLoading}
                    className="login-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="login-fade-up-3">
          <button
            type="submit"
            disabled={isLoading}
            className="login-btn"
            id="login-submit"
            style={mode === "signup" 
              ? { background: signupStep === 1 && assignedVariant === 'B' && !isFreePlanUrl ? C.orange : C.green } 
              : undefined}
            onMouseEnter={mode === "signup" ? (e) => { 
              e.currentTarget.style.background = signupStep === 1 && assignedVariant === 'B' && !isFreePlanUrl ? C.orangeHover : "#15803d"; 
              e.currentTarget.style.transform = "translateY(-1px)"; 
              e.currentTarget.style.boxShadow = signupStep === 1 && assignedVariant === 'B' && !isFreePlanUrl ? "0 8px 24px rgba(255,92,0,0.25)" : "0 8px 24px rgba(22,163,74,0.25)"; 
            } : undefined}
            onMouseLeave={mode === "signup" ? (e) => { 
              e.currentTarget.style.background = signupStep === 1 && assignedVariant === 'B' && !isFreePlanUrl ? C.orange : C.green; 
              e.currentTarget.style.transform = "none"; 
              e.currentTarget.style.boxShadow = "none"; 
            } : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Traitement en cours...
              </>
            ) : (
              <>
                {mode === "password" 
                  ? "Se connecter" 
                  : mode === "signup"
                    ? (assignedVariant === 'B' && !isFreePlanUrl
                        ? (signupStep === 1 ? "Continuer vers l'étape 2" : "Démarrer l'essai")
                        : "Créer mon compte")
                    : "Réinitialiser le mot de passe"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Back Link to Step 1 (Step 2 signup only) */}
        {mode === "signup" && signupStep === 2 && (
          <div className="login-fade-up-3" style={{ textAlign: "center", marginTop: 16 }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setSignupStep(1)}
              style={{
                background: "none",
                border: "none",
                color: C.textSecondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-dm-sans), sans-serif",
                textDecoration: "underline",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              ← Modifier les informations de compte
            </button>
          </div>
        )}

        {/* Back Link (Only shown in forgot mode) */}
        {mode === "forgot" && (
          <div className="login-fade-up-3" style={{ textAlign: "center", marginTop: 20 }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => switchMode("password")}
              style={{
                background: "none",
                border: "none",
                color: C.textSecondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-dm-sans), sans-serif",
                textDecoration: "underline",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </form>

      {/* Divider + Discover CTA (only in login/signup modes) */}
      {mode !== "forgot" && (
        <>
          <div className="login-fade-up-4" style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            margin: "28px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{
              fontSize: 11,
              color: C.textLight,
              fontWeight: 500,
              fontFamily: "var(--font-dm-sans), sans-serif",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              {mode === "password" 
                ? (assignedVariant === 'B' ? "Essai complet de 21 jours" : "Essai gratuit de 14 jours")
                : "Déjà un compte ?"}
            </span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          <div className="login-fade-up-4">
            {mode === "password" ? (
              <Link href="/" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "14px 24px",
                background: "transparent",
                border: `1.5px solid ${C.border}`,
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                color: C.textSecondary,
                textDecoration: "none",
                fontFamily: "var(--font-dm-sans), sans-serif",
                transition: "border-color 0.2s, color 0.2s, background 0.2s",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.text;
                  e.currentTarget.style.color = C.text;
                  e.currentTarget.style.background = C.surface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = String(C.border);
                  e.currentTarget.style.color = C.textSecondary;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Découvrir Capten
                <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("password")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "14px 24px",
                  background: "transparent",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.textSecondary,
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  transition: "border-color 0.2s, color 0.2s, background 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.text;
                  e.currentTarget.style.color = C.text;
                  e.currentTarget.style.background = C.surface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = String(C.border);
                  e.currentTarget.style.color = C.textSecondary;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Se connecter
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LOGIN_CSS }} />

      <div
        className="login-split"
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "var(--font-dm-sans), sans-serif",
        }}
      >
        {/* ── LEFT: Login Form ─────────────────────────── */}
        <div
          className="login-left"
          style={{
            width: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 60px",
            background: C.bg,
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Top: Logo + Back */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <Link href="/" style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}>
              <img
                src="/logo.png"
                alt="Capten"
                style={{ height: 56, display: "block" }}
              />
            </Link>

            <Link href="/" style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: C.textMuted,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}
            >
              <ArrowLeft size={14} />
              Retour au site
            </Link>
          </div>

          {/* Center: Form */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "40px 0" }}>
            <Suspense fallback={
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                width: "100%",
                padding: "80px 0",
              }}>
                <Loader2 size={28} style={{ color: C.orange, animation: "spin 1s linear infinite" }} />
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}>
                  Chargement...
                </span>
              </div>
            }>
              <LoginForm />
            </Suspense>
          </div>

          {/* Bottom: Footer */}
          <p style={{
            fontSize: 11,
            color: C.textLight,
            fontWeight: 500,
            textAlign: "center",
            fontFamily: "var(--font-dm-mono), monospace",
            letterSpacing: 0.5,
          }}>
            © {new Date().getFullYear()} CAPTEN — Tous droits réservés
          </p>
        </div>

        {/* ── RIGHT: Showcase Panel ────────────────────── */}
        <div
          className="login-right"
          style={{
            width: "55%",
            background: "#0A0A0B",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px",
          }}
        >
          {/* Background effects */}
          <div style={{
            position: "absolute",
            top: "-30%",
            right: "-20%",
            width: "60vw",
            height: "60vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,92,0,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            bottom: "-30%",
            left: "-20%",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(22,163,74,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Top: Badge */}
          <div className="login-slide-left" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            width: "fit-content",
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.green,
              position: "relative",
            }}>
              <span style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: C.green,
                animation: "pulse-ring 2s infinite",
              }} />
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: 2,
              fontFamily: "var(--font-dm-mono), monospace",
            }}>
              Plateforme Active
            </span>
          </div>

          {/* Center: Content */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 className="login-slide-left" style={{
              fontFamily: "var(--font-barlow), sans-serif",
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: 52,
              lineHeight: 1.25,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: -1,
              marginBottom: 16,
              maxWidth: 500,
            }}>
              VOTRE RUN CLUB
              <br />
              <span style={{ color: C.orange }}>MÉRITE MIEUX.</span>
            </h2>

            <p style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              maxWidth: 420,
              marginBottom: 48,
            }}>
              Gestion automatisée, communication intelligente et suivi en temps réel — tout ce dont un capitaine a besoin.
            </p>

            {/* Feature Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              maxWidth: 520,
            }}>
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="feature-card"
                  style={{
                    animation: mounted ? `fadeUp 0.5s ease ${0.3 + i * 0.1}s both` : "none",
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,92,0,0.08)",
                    border: "1px solid rgba(255,92,0,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <f.icon size={16} style={{ color: C.orange }} />
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "white",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}>
                      {f.title}
                    </h4>
                    <p style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      lineHeight: 1.5,
                      fontWeight: 400,
                    }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Stats + Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", gap: 40 }}>
              {STATS.map((s, i) => (
                <div key={i}>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 900,
                    fontFamily: "var(--font-barlow), sans-serif",
                    fontStyle: "italic",
                    color: "white",
                    letterSpacing: -0.5,
                  }}>
                    {s.value}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontFamily: "var(--font-dm-mono), monospace",
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "var(--font-dm-mono), monospace",
            }}>
              v1.0
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
