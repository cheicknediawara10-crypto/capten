"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNav from "@/components/layout/MobileNav";
import CopilotBubble from "@/components/copilot/CopilotBubble";
import CopilotDrawer from "@/components/copilot/CopilotDrawer";

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const pathname = usePathname();

  const cleanPath = (pathname || "").split("?")[0];

  // Pages publiques sans sidebar ni header mobile admin
  const isPublicPage =
    cleanPath === "/" ||
    cleanPath === "/login" ||
    cleanPath.startsWith("/login") ||
    cleanPath.startsWith("/reset-password") ||
    cleanPath.startsWith("/waiver") ||
    cleanPath === "/cgu" ||
    cleanPath === "/mentions-legales" ||
    cleanPath === "/rgpd" ||
    cleanPath.includes("/checkin") ||
    cleanPath.startsWith("/runners/manage") ||
    cleanPath.startsWith("/securite/signaler") ||
    cleanPath.startsWith("/cagnotte/contribuer") ||
    cleanPath.startsWith("/cagnotte/sponsor") ||
    // Espace membre (auth PIN — système séparé de l'auth organisateur)
    cleanPath.startsWith("/mon-espace") ||
    // Nouvelles pages membres publiques (specs Phase D)
    cleanPath.startsWith("/join/") ||
    cleanPath.startsWith("/event/") ||
    cleanPath.startsWith("/p/") ||
    (cleanPath.startsWith("/spots") &&
     !cleanPath.startsWith("/spots/explorer") &&
     !cleanPath.startsWith("/spots/events") &&
     !cleanPath.startsWith("/spots/scan"));

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-white text-[#0F172A] overflow-x-hidden selection:bg-[#FF5C00]/20 selection:text-black">
        {children}
      </div>
    );
  }

  // Layout d'administration standard
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Fixed on the left */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#F4F5F7] lg:pl-[280px] overflow-x-hidden">
        {/* Mobile Header (Only on small screens) */}
        <MobileHeader />

        <div className="p-4 sm:p-6 lg:p-10 max-w-page-wide mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={cleanPath}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Navigation Bar (Bottom) */}
        <MobileNav />
      </main>

      {/* Copilote Persistant */}
      <CopilotBubble />
      <CopilotDrawer />
    </div>
  );
}
