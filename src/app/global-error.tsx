"use client";

// Garde-fou racine : capture toute exception client non gérée (ex. chunk JS
// périmé après un déploiement) et propose de recharger, au lieu de l'écran
// blanc "Application error".
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#0C0C0A", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 24, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,85,0,.15)", border: "1px solid rgba(255,85,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
            ⚡
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Oups, un petit accroc</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", maxWidth: 320, lineHeight: 1.5, margin: 0 }}>
            L&apos;app vient d&apos;être mise à jour. Recharge la page pour repartir sur la dernière version.
          </p>
          <button
            onClick={() => { reset(); if (typeof window !== "undefined") window.location.reload(); }}
            style={{ marginTop: 6, height: 48, padding: "0 28px", borderRadius: 999, border: "none", background: "#FF5500", color: "#fff", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", cursor: "pointer" }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
