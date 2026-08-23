"use client";

import React, { useState, useEffect } from "react";
import { Compass, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CopilotePanel from "@/components/copilote/CopilotePanel";

export default function CopiloteWidget({ preview = false }: { preview?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open && typeof window !== "undefined" && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ── MOBILE BOTTOM SHEET (Modal tiroir style ChatGPT/Claude) ── */}
      <AnimatePresence>
        {open && (
          <div className="lg:hidden fixed inset-0 z-[150] flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-h-[88vh] bg-[var(--app-surface)] rounded-t-[32px] border-t border-[color:var(--app-border)] shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Grab handle */}
              <div className="w-full flex items-center justify-center pt-3 pb-1 shrink-0 cursor-grab">
                <div className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/20" />
              </div>

              {/* Close Button Header */}
              <div className="flex items-center justify-between px-6 py-2 border-b border-[color:var(--app-border)] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#FF5C00]/10 flex items-center justify-center text-[#FF5C00]">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-wider text-[color:var(--app-text)]">
                      Copilote du Crew
                    </h3>
                    <p className="text-[10px] text-[color:var(--app-text-muted)] font-medium">Assistant de terrain 🖤</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
                <CopilotePanel embedded preview={preview} onCount={setCount} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DESKTOP POPOVER & LAUNCHER BUTTON ── */}
      <div className="fixed z-[95] bottom-20 right-4 lg:bottom-8 lg:right-8 print:hidden">
        {/* Desktop Popover */}
        <div
          className={`hidden lg:block absolute bottom-[72px] right-0 w-[420px] origin-bottom-right transition-all duration-200 ${
            open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
          aria-hidden={!open}
        >
          <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-3xl shadow-2xl max-h-[75vh] overflow-y-auto relative">
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
            <CopilotePanel embedded preview={preview} onCount={setCount} />
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Ton Copilote"
          className="relative w-14 h-14 rounded-full bg-[#FF5C00] text-white shadow-[0_8px_24px_rgba(255,92,0,0.4)] flex items-center justify-center hover:bg-[#E04B00] active:scale-95 transition-all cursor-pointer"
        >
          {open ? <X size={22} /> : <Compass size={24} />}
          {!open && count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-white text-[#FF5C00] text-[11px] font-black flex items-center justify-center border-2 border-[var(--app-bg)]">
              {count}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
