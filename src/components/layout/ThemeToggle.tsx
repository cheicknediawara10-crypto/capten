"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("capten_theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("capten_theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Passer en clair" : "Passer en sombre"}
      className="relative inline-flex items-center h-8 w-[58px] rounded-full border transition-colors"
      style={{ borderColor: "var(--app-border)", background: "var(--app-surface-2)" }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300"
        style={{
          background: "var(--app-surface)",
          transform: dark ? "translateX(26px)" : "translateX(0)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      >
        {dark ? <Moon size={13} className="text-[#FF6A1A]" /> : <Sun size={13} className="text-[#FF5C00]" />}
      </span>
    </button>
  );
}
