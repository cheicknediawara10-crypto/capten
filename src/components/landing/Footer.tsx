"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#EBEBEB] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
          {/* Logo */}
          <Link href="/">
            <Image src="/logo.png" alt="CAPTEN" width={98} height={28} className="h-7 w-auto" />
          </Link>

          {/* Columns */}
          <div className="flex gap-16">
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#9CA3AF] mb-3">
                Connect
              </p>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-[#374151] hover:text-[#FF5500] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                Instagram
              </a>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#9CA3AF] mb-3">
                Legal
              </p>
              <div className="space-y-2">
                <Link href="/rgpd"
                  className="block text-[13px] text-[#374151] hover:text-[#111111] transition-colors">
                  Politique de confidentialité
                </Link>
                <Link href="/cgu"
                  className="block text-[13px] text-[#374151] hover:text-[#111111] transition-colors">
                  Conditions d&apos;utilisation
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion strip */}
        <div className="mt-10 rounded-2xl bg-[#F7F6F2] px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p
              className="text-[#1C1B18] leading-snug mb-1"
              style={{ fontSize: "18px", fontWeight: 1000, letterSpacing: "-0.5px" }}
            >
              Ton prochain dimanche soir sans stress commence ici.
            </p>
            <p className="text-[#6B6A6A] text-[14px]">
              Gratuit pour toujours · Pas de carte bancaire
            </p>
          </div>
          <a
            href="/login?mode=signup"
            className="shrink-0 inline-flex items-center justify-center h-11 px-6 rounded-xl bg-[#FF5500] text-white hover:bg-[#E04B00] transition-colors"
            style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.2px", whiteSpace: "nowrap" }}
          >
            Lancer mon crew →
          </a>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-5 border-t border-[#F0F0F0] flex items-center justify-between">
          <p className="text-[12px] text-[#9CA3AF]">© 2026 CAPTEN</p>
          <p className="text-[12px] text-[#C0BCBA]">Fait avec ❤️ pour les capitaines de Run Club</p>
        </div>
      </div>
    </footer>
  );
}
