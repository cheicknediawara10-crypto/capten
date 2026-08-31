"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "/#features" },
  { label: "Tarifs", href: "/#tarifs" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? "bg-white shadow-[0_1px_0_0_#E8E8E8]" : "bg-white/0"
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <Image src="/logo.png" alt="CAPTEN" width={90} height={24} className="h-6 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}
              className="text-[13px] font-medium text-[#374151] hover:text-[#111111] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/mon-espace"
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#111111] transition-colors">
            Espace membre
          </a>
          <a href="/login?mode=signup"
            className="inline-flex items-center h-9 px-4 rounded-xl bg-[#FF5500] text-white text-[13px] font-semibold hover:bg-[#E04B00] transition-colors">
            Lancer mon crew
          </a>
        </div>

        {/* Mobile burger */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={() => setOpen((o) => !o)} className="p-2 -mr-2 text-[#111111]">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-[#E8E8E8] px-6 py-5 space-y-4 overflow-hidden"
          >
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block text-sm font-medium text-[#374151] hover:text-[#111111] py-0.5">
                {l.label}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              <a href="/mon-espace"
                className="block text-sm font-medium text-[#6B7280]">
                Espace membre
              </a>
              <a href="/login?mode=signup"
                className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-[#FF5500] text-white text-sm font-semibold hover:bg-[#E04B00] transition-colors">
                Lancer mon crew
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

