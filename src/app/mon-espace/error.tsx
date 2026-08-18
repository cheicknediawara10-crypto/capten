"use client";

// Garde-fou de l'espace membre : un accroc client (chunk périmé, etc.)
// affiche un message clair + recharge, au lieu de l'écran blanc brut.
export default function MonEspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/25 flex items-center justify-center text-2xl">
        ⚡
      </div>
      <h1 className="text-lg font-extrabold text-[#111111]">Oups, un petit accroc</h1>
      <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">
        Recharge la page pour revenir à ton espace. Si ça persiste, préviens ton organisateur.
      </p>
      <button
        onClick={() => { reset(); if (typeof window !== "undefined") window.location.reload(); }}
        className="mt-1 h-12 px-7 rounded-full bg-[#FF5500] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-colors"
      >
        Recharger
      </button>
    </div>
  );
}
