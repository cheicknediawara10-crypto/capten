"use client";

import React from "react";

export function FramerBadge() {
  return (
    <aside aria-label="Made in Framer Badge" className="fixed bottom-5 right-5 z-50 select-none">
      <a
        href="https://www.framer.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-2xl border border-black/10 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        {/* Framer Logo SVG */}
        <svg
          width="14"
          height="21"
          viewBox="0 0 14 21"
          fill="currentColor"
          className="w-[14px] h-[21px] shrink-0 text-black"
        >
          <path d="M0 0H14V7H0V0Z" />
          <path d="M0 7H14L7 14H0V7Z" />
          <path d="M0 14H7L0 21V14Z" />
        </svg>

        <span className="tracking-tight text-[15px] font-medium text-[#111111]">
          Made in Framer
        </span>
      </a>
    </aside>
  );
}
