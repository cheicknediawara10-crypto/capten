"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

const C = {
  bg: "#FDFCF8", // Warm light background
  orange: "#FF5C00", // Capten Signature Orange
  orangeHover: "#E55200",
  text: "#09090B",
  textSecondary: "#52525B",
  textMuted: "#A1A1AA",
  border: "rgba(0,0,0,0.08)",
  cardBg: "#FFFFFF",
  errorBg: "rgba(239,68,68,0.05)",
  errorBorder: "#EF4444",
  successBg: "rgba(16,185,129,0.05)",
  successBorder: "#10B981"
};

export default function CheckRetourPage({ params }: { params: { short_code: string } }) {
  const shortCode = params.short_code;

  // States
  const [runInfo, setRunInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Form Fields
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");

  // Submit Result
  const [result, setResult] = useState<{
    status: "confirmed" | "already" | "not_found" | "expired" | "ambiguous" | "error" | "rate_limited";
    prenom?: string;
    total?: number;
    message?: string;
  } | null>(null);

  // Load run details on mount
  useEffect(() => {
    async function fetchRunInfo() {
      try {
        const res = await fetch(`/api/check-retour/confirm?short_code=${shortCode}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Impossible de charger les détails du run.");
        }
        
        setRunInfo(data.run);
      } catch (err: any) {
        setInitError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (shortCode) {
      fetchRunInfo();
    }
  }, [shortCode]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim() || !dateNaissance) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/check-retour/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          short_code: shortCode,
          prenom: prenom.trim(),
          nom: nom.trim(),
          date_naissance: dateNaissance
        })
      });

      const data = await res.json();

      if (res.status === 429) {
        setResult({ status: "rate_limited", message: data.error });
      } else if (!res.ok && data.status !== "not_found" && data.status !== "ambiguous" && data.status !== "already" && data.status !== "expired") {
        throw new Error(data.error || "Une erreur est survenue.");
      } else {
        setResult({
          status: data.status,
          prenom: data.prenom,
          total: data.total,
          message: data.error
        });
      }
    } catch (err: any) {
      setResult({ status: "error", message: err.message || "Erreur réseau." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}>
        <Loader2 size={36} style={{ color: C.orange, animation: "spin 1.s linear infinite" }} />
        <p style={{ color: C.textSecondary, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 16 }}>
          Chargement du check retour...
        </p>
      </div>
    );
  }

  // Verification Error Screen (Run not found, expired, cancelled)
  if (initError) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "var(--font-dm-sans), sans-serif"
      }}>
        <div style={{
          width: "100%",
          maxWidth: 440,
          background: C.cardBg,
          border: `1.5px solid ${C.border}`,
          borderRadius: 24,
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 16,
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}20`,
            color: C.errorBorder,
            marginBottom: 20
          }}>
            <AlertTriangle size={24} />
          </div>
          
          <h1 style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 26,
            lineHeight: 1.1,
            textTransform: "uppercase",
            color: C.text,
            marginBottom: 12
          }}>
            Lien Invalide
          </h1>
          
          <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6, marginBottom: 0 }}>
            {initError}
          </p>
        </div>
      </div>
    );
  }

  // Render Page
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "var(--font-dm-sans), sans-serif",
      color: C.text
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: C.cardBg,
        border: `1.5px solid ${C.border}`,
        borderRadius: 24,
        padding: "32px 28px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
      }}>
        {/* Header Metadata */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 900,
            color: C.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            marginBottom: 6
          }}>
            {runInfo?.club_name || "CAPTEN CREW"} · RUN DU {runInfo?.run_date ? new Date(runInfo.run_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ""}
          </span>
          <h1 style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 28,
            lineHeight: 1,
            textTransform: "uppercase",
            color: C.text,
            margin: 0
          }}>
            Tu es bien rentré(e) ?
          </h1>
        </div>

        {/* Success States */}
        {result && (result.status === "confirmed" || result.status === "already") && (
          <div style={{ textAlign: "center", animation: "fadeIn 0.4s ease-out" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 20,
              background: C.successBg,
              border: `1px solid ${C.successBorder}20`,
              color: C.successBorder,
              marginBottom: 20
            }}>
              <CheckCircle2 size={30} />
            </div>

            {result.status === "confirmed" ? (
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 10px 0", lineHeight: 1.3 }}>
                Merci {result.prenom} ! <br />
                Bien rentré(e). Bonne nuit 🖤
              </h2>
            ) : (
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 10px 0", lineHeight: 1.3 }}>
                Tu as déjà confirmé. <br />
                Bonne nuit 🖤
              </h2>
            )}

            <div style={{
              background: "#F4F5F7",
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "12px 16px",
              display: "inline-block",
              marginTop: 8
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>
                🏠 {result.total || runInfo?.check_retour_total || 0} coureurs confirmés bien rentrés.
              </span>
            </div>
          </div>
        )}

        {/* Rejection / Validation Errors States */}
        {result && result.status !== "confirmed" && result.status !== "already" && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            animation: "fadeIn 0.3s ease-out"
          }}>
            <AlertTriangle size={18} style={{ color: C.errorBorder, flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, lineHeight: 1.5, color: C.errorBorder }}>
              {result.status === "not_found" && (
                <>
                  <strong>Profil non trouvé.</strong> On ne te trouve pas parmi les inscrits à ce run. Vérifie ton prénom, ton nom et ta date de naissance.
                </>
              )}
              {result.status === "ambiguous" && (
                <>
                  <strong>Homonyme détecté.</strong> Plusieurs coureurs correspondent. Contacte directement le capitaine du crew pour te valider.
                </>
              )}
              {result.status === "expired" && (
                <>
                  Ce check retour est expiré.
                </>
              )}
              {result.status === "rate_limited" && (
                <>
                  {result.message}
                </>
              )}
              {result.status === "error" && (
                <>
                  {result.message || "Une erreur est survenue."}
                </>
              )}
            </div>
          </div>
        )}

        {/* Saisie Formulaire */}
        {(!result || (result.status !== "confirmed" && result.status !== "already")) && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Input Prénom */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.textSecondary, marginBottom: 6 }}>
                Ton prénom
              </label>
              <input
                type="text"
                required
                autoComplete="given-name"
                placeholder="Ex: Léa"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 16px",
                  background: "#F4F5F7",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  fontSize: 14,
                  outline: "none",
                  transition: "border 0.2s, background 0.2s",
                  color: C.text
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = C.orange;
                  e.target.style.background = "#FFF";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.background = "#F4F5F7";
                }}
              />
            </div>

            {/* Input Nom */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.textSecondary, marginBottom: 6 }}>
                Ton nom
              </label>
              <input
                type="text"
                required
                autoComplete="family-name"
                placeholder="Ex: Dupré"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 16px",
                  background: "#F4F5F7",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  fontSize: 14,
                  outline: "none",
                  transition: "border 0.2s, background 0.2s",
                  color: C.text
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = C.orange;
                  e.target.style.background = "#FFF";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.background = "#F4F5F7";
                }}
              />
            </div>

            {/* Input Date de Naissance */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.textSecondary, marginBottom: 6 }}>
                Ta date de naissance
              </label>
              <input
                type="date"
                required
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 16px",
                  background: "#F4F5F7",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  fontSize: 14,
                  outline: "none",
                  transition: "border 0.2s, background 0.2s",
                  color: C.text
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = C.orange;
                  e.target.style.background = "#FFF";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.background = "#F4F5F7";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                height: 52,
                background: C.orange,
                color: "#FFF",
                border: "none",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 8,
                transition: "background 0.2s, transform 0.1s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.orangeHover}
              onMouseLeave={(e) => e.currentTarget.style.background = C.orange}
            >
              {isSubmitting ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                "✅ Bien rentré(e)"
              )}
            </button>

            {/* Notice */}
            <p style={{ fontSize: 11, color: C.textMuted, textAlign: "center", margin: "12px 0 0 0", lineHeight: 1.4 }}>
              Ces infos servent juste à vérifier que c'est bien toi. <br /> Elles restent privées.
            </p>
          </form>
        )}
      </div>
      
      {/* Footer */}
      <footer style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6, opacity: 0.6 }}>
        <ShieldCheck size={14} style={{ color: C.textSecondary }} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.textSecondary }}>
          Sécurisé par CAPTEN
        </span>
      </footer>
    </div>
  );
}
