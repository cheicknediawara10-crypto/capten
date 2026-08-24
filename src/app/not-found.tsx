"use client";

import Link from "next/link";
import { Home, ArrowLeft, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[var(--app-bg)]">
      <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] mb-4 shadow-lg">
        <Zap className="w-7 h-7 fill-[#FF5500]" />
      </div>

      <h1 className="text-4xl font-display italic font-black text-[color:var(--app-text)] tracking-tight uppercase mb-2">
        Page introuvable (404)
      </h1>

      <p className="text-sm text-[color:var(--app-text-muted)] max-w-md mb-8 font-medium">
        La page que tu cherches n'existe pas ou a été déplacée. Retourne à ton tableau de bord ou à l'accueil.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF5500]/25 transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Tableau de bord
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--app-surface-2)] border border-[color:var(--app-border)] hover:border-[#FF5500] text-[color:var(--app-text)] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
      </div>
    </div>
  );
}
