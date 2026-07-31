"use client";

import Link from "next/link";
import { ArrowLeft, Home, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FF5C00]/10 border border-[#FF5C00]/20 flex items-center justify-center text-[#FF5C00] mb-4 shadow-lg">
        <Zap className="w-7 h-7 fill-[#FF5C00]" />
      </div>

      <h1 className="text-4xl font-black text-[#0F172A] tracking-tight uppercase mb-2">
        Page Introuvable (404)
      </h1>
      
      <p className="text-sm text-slate-500 max-w-md mb-8 font-medium">
        La page que vous recherchez n'existe pas ou a été déplacée. Vous pouvez retourner au tableau de bord ou à l'accueil.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-[#FF5C00] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF5C00]/25 transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Tableau de Bord
        </Link>
        <Link
          href="/demo-showcase"
          className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Zap className="w-4 h-4 text-[#FF5C00]" /> Voir la Démo Showcase
        </Link>
      </div>
    </div>
  );
}
