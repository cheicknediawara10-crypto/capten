"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, Loader2, AlertTriangle, ArrowRight, CheckCircle2, 
  Trash2, User, Phone, Check, RefreshCw 
} from "lucide-react";

/* ── Design Colors ────────────────────────────────────── */
const C = {
  bg: "#0A0A0C",
  surface: "#121215",
  surfaceCard: "#18181C",
  orange: "#FF5C00",
  orangeHover: "#FF7233",
  orangeDim: "rgba(255,92,0,0.05)",
  orangeBorder: "rgba(255,92,0,0.15)",
  text: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textMuted: "#71717A",
  border: "rgba(255,255,255,0.08)",
  green: "#10B981",
  red: "#EF4444",
};

export default function RunnersGdprPage() {
  // Input fields for authentication
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [runner, setRunner] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Consent local states
  const [acceptHealth, setAcceptHealth] = useState(false);
  const [acceptPhoto, setAcceptPhoto] = useState(false);

  // Deletion double-check
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // 1. Identify Runner Profile
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/runners/gdpr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'identification.");
      }

      setRunner(data.runner);
      setAcceptHealth(data.runner.accept_health);
      setAcceptPhoto(data.runner.accept_photo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Save consent updates
  const handleSaveConsents = async () => {
    if (!runner) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/runners/gdpr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runner_id: runner.id,
          accept_health: acceptHealth,
          accept_photo: acceptPhoto,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Vos préférences de confidentialité ont été enregistrées avec succès.");
      setRunner({
        ...runner,
        accept_health: acceptHealth,
        accept_photo: acceptPhoto,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Delete Profile (Right to be Forgotten)
  const handleDeleteProfile = async () => {
    if (!runner) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/runners/gdpr?id=${encodeURIComponent(runner.id)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Toutes vos données personnelles ont été définitivement supprimées de nos serveurs.");
      setRunner(null);
      setName("");
      setPhone("");
      setShowConfirmDelete(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "var(--font-dm-sans), sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 500,
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: 24,
        padding: "36px 32px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 16,
            background: C.orangeDim,
            border: `1px solid ${C.orangeBorder}`,
            color: C.orange,
            marginBottom: 16,
          }}>
            <ShieldCheck size={24} />
          </div>
          <h1 style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 28,
            letterSpacing: -0.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}>
            Gestion des Données
          </h1>
          <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>
            Accédez à vos consentements GDPR, mettez-les à jour ou demandez la suppression de vos données personnelles.
          </p>
        </div>

        {/* Global Error message */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: `1px solid ${C.red}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 13,
            color: C.red,
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success message */}
        {success && (
          <div style={{
            background: "rgba(16,185,129,0.1)",
            border: `1px solid ${C.green}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 13,
            color: C.green,
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Step 1: Identification */}
        {!runner && (
          <form onSubmit={handleIdentify} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Votre Prénom et Nom
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 14px 14px 44px",
                    background: C.surfaceCard,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 14,
                    color: C.text,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Numéro de Téléphone
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
                <input
                  type="tel"
                  required
                  placeholder="Ex: +33612345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 14px 14px 44px",
                    background: C.surfaceCard,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 14,
                    color: C.text,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                background: C.orange,
                color: "#FFF",
                border: "none",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s",
                marginTop: 8,
              }}
            >
              {isLoading ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <>
                  Accéder à mes données
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Manage Consents & Deletion */}
        {runner && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{
              background: C.orangeDim,
              border: `1px solid ${C.orangeBorder}`,
              borderRadius: 16,
              padding: 16,
            }}>
              <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>
                Identifié en tant que : <strong style={{ color: C.text }}>{runner.name}</strong> ({runner.phone})
              </p>
            </div>

            {/* Consents Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px 0" }}>
                Vos Consentements Actifs
              </h3>

              {/* Case A: Terms */}
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", opacity: 0.8 }}>
                <input
                  type="checkbox"
                  disabled
                  checked={runner.signed_waiver}
                  style={{ marginTop: 4, accentColor: C.orange }}
                />
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong style={{ color: C.text, display: "block" }}>[Case A] Décharge de responsabilité et CGU</strong>
                  <span style={{ color: C.textSecondary }}>Requis pour participer aux sessions du club. Signé le {runner.waiver_date ? new Date(runner.waiver_date).toLocaleDateString() : 'N/A'}.</span>
                </div>
              </label>

              {/* Case B: Health Data */}
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acceptHealth}
                  onChange={(e) => setAcceptHealth(e.target.checked)}
                  style={{ marginTop: 4, accentColor: C.orange }}
                />
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong style={{ color: C.text, display: "block" }}>[Case B] Conservation des Données Médicales</strong>
                  <span style={{ color: C.textSecondary }}>Permet de conserver votre fiche d&apos;urgence de manière chiffrée. Décocher supprimera définitivement votre fiche médicale.</span>
                </div>
              </label>

              {/* Case C: Photo & WhatsApp */}
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acceptPhoto}
                  onChange={(e) => setAcceptPhoto(e.target.checked)}
                  style={{ marginTop: 4, accentColor: C.orange }}
                />
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong style={{ color: C.text, display: "block" }}>[Case C] Photos & Notifications</strong>
                  <span style={{ color: C.textSecondary }}>Permet l&apos;utilisation de votre image lors des runs du club et l&apos;envoi de messages de rappels WhatsApp.</span>
                </div>
              </label>

              <button
                onClick={handleSaveConsents}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: C.orange,
                  color: "#FFF",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {isLoading ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Mettre à jour mes choix
                  </>
                )}
              </button>
            </div>

            <div style={{ height: 1, background: C.border }} />

            {/* Right to be Forgotten Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>
                Droit à l&apos;oubli (Suppression de compte)
              </h3>
              
              {!showConfirmDelete ? (
                <>
                  <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5, margin: 0 }}>
                    Vous pouvez supprimer définitivement toutes vos données personnelles de CAPTEN à tout moment. Cette action est irréversible.
                  </p>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "transparent",
                      border: `1.5px solid ${C.red}`,
                      color: C.red,
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Trash2 size={14} />
                    Supprimer toutes mes données
                  </button>
                </>
              ) : (
                <div style={{
                  background: "rgba(239,68,68,0.05)",
                  border: `1px dashed ${C.red}`,
                  borderRadius: 16,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <AlertTriangle size={18} style={{ color: C.red, flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>
                      Attention : cette action supprimera définitivement votre profil runner, vos fiches d&apos;urgence chiffrées, vos pointages de présence et toutes vos décharges signées.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={handleDeleteProfile}
                      disabled={isLoading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: C.red,
                        color: "#FFF",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {isLoading ? "Suppression..." : "Oui, supprimer tout"}
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={isLoading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: C.surfaceCard,
                        color: C.text,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
