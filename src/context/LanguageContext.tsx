"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, TRANSLATIONS } from "@/lib/i18n/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  toggleLang: () => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
  toggleLang: () => {},
  t: (k, d) => d || k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("fr");

  useEffect(() => {
    // 1. Check saved language preference
    const saved = localStorage.getItem("capten_lang") as Language | null;
    if (saved === "fr" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
      return;
    }

    // 2. Auto-detect browser language
    if (typeof navigator !== "undefined" && navigator.language?.startsWith("en")) {
      setLangState("en");
      document.documentElement.lang = "en";
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("capten_lang", l);
    document.cookie = `capten_lang=${l}; path=/; max-age=31536000`;
    document.documentElement.lang = l;
  };

  const toggleLang = () => {
    setLang(lang === "fr" ? "en" : "fr");
  };

  const t = (key: string, defaultText?: string): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    if (dict[key]) return dict[key];
    if (defaultText) return defaultText;
    // Fallback to FR
    return TRANSLATIONS.fr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
