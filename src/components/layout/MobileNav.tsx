"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Map, MessageSquare, MoreHorizontal,
  MapPin, Wallet, Flag, Sliders, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();
  const [sessionLabel, setSessionLabel] = useState("Runs");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const updateBranding = () => {
      const savedType = typeof window !== "undefined" ? localStorage.getItem("capten_community_type") : null;
      if (savedType === "walk_club") setSessionLabel("Marches");
      else if (savedType === "trail_hiking") setSessionLabel("Trail");
      else setSessionLabel("Runs");
    };
    updateBranding();
    if (typeof window !== "undefined") {
      window.addEventListener("capten_branding_change", updateBranding);
      return () => window.removeEventListener("capten_branding_change", updateBranding);
    }
  }, []);

  // Ferme le tiroir "Plus" au changement de page
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const primaryItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} strokeWidth={1.75} />, href: "/dashboard" },
    { name: "Crew", icon: <Users size={20} strokeWidth={1.75} />, href: "/dashboard/members" },
    { name: sessionLabel, icon: <Map size={20} strokeWidth={1.75} />, href: "/dashboard/events" },
    { name: "Messages", icon: <MessageSquare size={20} strokeWidth={1.75} />, href: "/messages" },
  ];

  const secondaryItems = [
    { name: "Spots du Crew", desc: "Partenaires & points de chute", icon: <MapPin size={18} />, href: "/dashboard/spots" },
    { name: "Cagnotte", desc: "Cashback et solde du club", icon: <Wallet size={18} />, href: "/dashboard/cagnotte" },
    { name: "Signalements", desc: "Safe Crew & bienveillance", icon: <Flag size={18} />, href: "/dashboard/signalements" },
    { name: "Réglages", desc: "Identité, logo et compte", icon: <Sliders size={18} />, href: "/settings" },
  ];

  const isMoreActive = secondaryItems.some((item) => pathname === item.href || pathname.startsWith(item.href));

  return (
    <>
      {/* ── TIROIR "PLUS" SUR MOBILE ── */}
      <AnimatePresence>
        {moreOpen && (
          <div className="lg:hidden fixed inset-0 z-[140] flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full bg-[var(--app-surface)] rounded-t-[28px] border-t border-[color:var(--app-border)] p-6 pb-28 shadow-2xl z-10 space-y-4"
            >
              {/* Grab handle */}
              <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20 mx-auto mb-2" />

              <div className="flex items-center justify-between pb-2 border-b border-[color:var(--app-border)]">
                <p className="text-[12px] font-black uppercase tracking-wider text-[color:var(--app-text-muted)]">
                  Autres rubriques du crew
                </p>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="w-7 h-7 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {secondaryItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                        isActive
                          ? "bg-[#FF5C00]/10 border-[#FF5C00] text-[#FF5C00]"
                          : "bg-[var(--app-surface-2)] border-[color:var(--app-border)] hover:border-[#FF5C00]/40 text-[color:var(--app-text)]"
                      }`}
                    >
                      <span className="w-9 h-9 rounded-xl bg-white dark:bg-black/30 flex items-center justify-center text-[#FF5C00] shrink-0 shadow-xs">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold truncate leading-tight">{item.name}</p>
                        <p className="text-[11px] text-[color:var(--app-text-muted)] truncate mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── BARRE FIXE DU BAS ── */}
      <nav
        aria-label="Navigation mobile principale"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe-bottom backdrop-blur-xl border-t-[0.5px] select-none shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{
          background: "color-mix(in srgb, var(--app-surface) 92%, transparent)",
          borderColor: "var(--app-border)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2.5 max-w-md mx-auto">
          {primaryItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-150 active:scale-90 ${
                  isActive
                    ? "text-[#FF5C00] font-black"
                    : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] font-semibold"
                }`}
              >
                <div className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight leading-none">{item.name}</span>
              </Link>
            );
          })}

          {/* Bouton "Plus" */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              moreOpen || isMoreActive
                ? "text-[#FF5C00] font-black"
                : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] font-semibold"
            }`}
          >
            <div className={`transition-transform duration-150 ${moreOpen || isMoreActive ? "scale-110" : ""}`}>
              <MoreHorizontal size={20} strokeWidth={1.75} />
            </div>
            <span className="text-[10px] tracking-tight leading-none">Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
}
