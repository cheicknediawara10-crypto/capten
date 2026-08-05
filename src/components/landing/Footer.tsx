"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#F4F4EE] border-t border-[#1A1918]/8">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#FF5500] rounded-[7px] flex items-center justify-center shrink-0">
              <span className="font-display italic font-black text-black text-[11px] leading-none">C</span>
            </div>
            <div>
              <span className="font-display italic font-black text-[#1A1918] text-[15px] tracking-tighter uppercase">CAPTEN</span>
              <p className="text-[10px] text-[#1A1918]/35 font-medium mt-0.5">Made in France 🇫🇷</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[12px] font-medium text-[#1A1918]/45">
            <a href="#features" className="hover:text-[#1A1918] transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-[#1A1918] transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-[#1A1918] transition-colors">FAQ</a>
            <a href="mailto:hello@capten.app" className="hover:text-[#1A1918] transition-colors">Contact</a>
            <a href="https://instagram.com/capten.app" target="_blank" rel="noreferrer" className="hover:text-[#1A1918] transition-colors">Instagram</a>
          </nav>

          {/* Legal + copyright */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-[#1A1918]/30 font-medium">
            <Link href="/rgpd" className="hover:text-[#1A1918]/60 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-[#1A1918]/60 transition-colors">CGU</Link>
            <Link href="/mentions-legales" className="hover:text-[#1A1918]/60 transition-colors">Mentions légales</Link>
            <span>© 2026 CAPTEN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
