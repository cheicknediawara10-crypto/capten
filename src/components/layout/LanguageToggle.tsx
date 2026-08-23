"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  variant?: "pill" | "minimal" | "compact";
  className?: string;
}

export default function LanguageToggle({ variant = "pill", className = "" }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1 bg-[var(--app-surface-2)] p-1 rounded-xl border border-[color:var(--app-border)] ${className}`}>
        <button
          type="button"
          onClick={() => setLang("fr")}
          className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            lang === "fr"
              ? "bg-[#FF5C00] text-white shadow-sm"
              : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
          }`}
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            lang === "en"
              ? "bg-[#FF5C00] text-white shadow-sm"
              : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
          }`}
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-[var(--app-surface-2)] p-1 rounded-full border border-[color:var(--app-border)] ${className}`}>
      <span className="pl-1.5 text-[color:var(--app-text-muted)]">
        <Globe size={13} />
      </span>
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
          lang === "fr"
            ? "bg-[#111111] text-white dark:bg-white dark:text-black shadow-sm"
            : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
          lang === "en"
            ? "bg-[#111111] text-white dark:bg-white dark:text-black shadow-sm"
            : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
