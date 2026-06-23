'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff 
} from "lucide-react";
import { updatePassword } from "../login/actions";

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
const RESET_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .login-fade-up { animation: fadeUp 0.6s ease both; }
  .login-fade-up-1 { animation: fadeUp 0.6s ease 0.1s both; }
  .login-fade-up-2 { animation: fadeUp 0.6s ease 0.2s both; }

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
    box-shadow: 0 4px 12px rgba(255,92,0,0.15);
    font-family: var(--font-dm-sans), sans-serif;
  }
  .login-btn:hover:not(:disabled) {
    background: ${C.orangeHover};
    box-shadow: 0 6px 16px rgba(255,92,0,0.25);
  }
  .login-btn:active:not(:disabled) {
    transform: translateY(1px);
  }
  .login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("password", password);

    const result = await updatePassword(formData);

    if (result.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
    } else {
      setSuccessMessage(result.message || "Mot de passe mis à jour ! Redirection...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RESET_CSS }} />
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#09090B",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow effect */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(255,92,0,0.15) 0%, rgba(0,0,0,0) 70%)",
          zIndex: 1,
          pointerEvents: "none",
        }} />

        <div className="login-fade-up" style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 450,
          background: "#FFFFFF",
          borderRadius: 24,
          padding: "48px 40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,92,0,0.08)",
              border: "1px solid rgba(255,92,0,0.15)",
              color: C.orange,
              fontSize: 10,
              fontWeight: 900,
              padding: "5px 12px",
              borderRadius: 20,
              textTransform: "uppercase",
              marginBottom: 20,
              fontFamily: "var(--font-dm-sans), sans-serif",
            }}>
              <Lock size={10} />
              Sécurité CAPTEN
            </div>

            <h1 style={{
              fontFamily: "var(--font-barlow), sans-serif",
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: 32,
              lineHeight: 1.15,
              color: C.text,
              textTransform: "uppercase",
              letterSpacing: -0.5,
              marginBottom: 12,
            }}>
              NOUVEAU MOT DE PASSE
            </h1>

            <p style={{
              fontSize: 14,
              color: C.textMuted,
              fontFamily: "var(--font-dm-sans), sans-serif",
              lineHeight: 1.5,
            }}>
              Définissez un mot de passe robuste pour accéder à votre cockpit capitaine.
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
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Password */}
            <div className="login-fade-up-1">
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
                Nouveau mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.textLight,
                  display: "flex",
                  alignItems: "center",
                }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: C.textLight,
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="login-fade-up-2">
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
                <div style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.textLight,
                  display: "flex",
                  alignItems: "center",
                }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="login-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: C.textLight,
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn"
              disabled={isLoading || !password || !confirmPassword}
              style={{ marginTop: 12 }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  Enregistrer le mot de passe
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
