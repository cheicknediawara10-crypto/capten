"use client";

// Garde-fou du dashboard fondateur : un accroc client affiche un message
// clair + recharge, au lieu de l'écran blanc brut.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--app-accent-soft)] border border-[color:var(--app-border)] flex items-center justify-center text-2xl">
        ⚡
      </div>
      <h1 className="text-lg font-black uppercase tracking-tight text-[color:var(--app-text)]">Oups, un petit accroc</h1>
      <p className="text-sm text-[color:var(--app-text-muted)] max-w-xs leading-relaxed">
        Recharge la page pour repartir sur la dernière version.
      </p>
      <button
        onClick={() => { reset(); if (typeof window !== "undefined") window.location.reload(); }}
        className="mt-1 h-12 px-7 rounded-full bg-[#FF5C00] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-colors"
      >
        Recharger
      </button>
    </div>
  );
}
