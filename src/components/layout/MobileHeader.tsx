"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, LayoutDashboard, Users, Map, BarChart3, MapPin,
  MessageSquare, ShieldCheck, CreditCard, LogOut, HelpCircle
} from "lucide-react";
import { logout } from "@/app/login/actions";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [logo, setLogo] = useState("/logo.png");

  useEffect(() => {
    const updateLogo = () => {
      const savedLogo = localStorage.getItem("capten_logo");
      setLogo(savedLogo || "/logo.png");
    };

    updateLogo();
    window.addEventListener("capten_branding_change", updateLogo);
    return () => window.removeEventListener("capten_branding_change", updateLogo);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push("/login");
  };

  const menuSections = [
    {
      title: "Pilotage",
      items: [
        { name: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.5} />, href: "/dashboard" },
        { name: "Membres", icon: <Users size={18} strokeWidth={1.5} />, href: "/dashboard/members" },
        { name: "Les Runs", icon: <Map size={18} strokeWidth={1.5} />, href: "/dashboard/events" },
        { name: "Statistiques", icon: <BarChart3 size={18} strokeWidth={1.5} />, href: "/dashboard/stats" },
        { name: "Messages", icon: <MessageSquare size={18} strokeWidth={1.5} />, href: "/messages" },
      ]
    },
    {
      title: "Terrain",
      items: [
        { name: "Les Spots", icon: <MapPin size={18} strokeWidth={1.5} />, href: "/dashboard/spots" },
        { name: "Protection", icon: <ShieldCheck size={18} strokeWidth={1.5} />, href: "/securite" },
      ]
    },
    {
      title: "Compte",
      items: [
        { name: "Abonnement", icon: <CreditCard size={18} strokeWidth={1.5} />, href: "/plan" },
        { name: "Support", icon: <HelpCircle size={18} strokeWidth={1.5} />, href: "/support" },
      ]
    }
  ];

  return (
    <>
      {/* HEADER BAR */}
      <div className="lg:hidden flex items-center justify-between p-4 backdrop-blur-md border-b-[0.5px] sticky top-0 z-[120] shadow-sm" style={{ background: "color-mix(in srgb, var(--app-surface) 90%, transparent)", borderColor: "var(--app-border)" }}>
        <Link href="/" className="flex items-center gap-2.5 active:scale-95 transition-all">
          <img src={logo} alt="CAPTEN" className={`h-[24px] w-auto object-contain rounded-control ${logo === "/logo.png" ? "capten-logo" : ""}`} />
        </Link>

        {/* Menu toggle button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          className="w-10 h-10 rounded-control border flex items-center justify-center text-[color:var(--app-text)] active:scale-90 transition-all cursor-pointer"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* OVERLAY DRAWER */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-md animate-fade-in flex justify-end">
          {/* Backdrop click closer */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Drawer Menu */}
          <div className="relative w-[300px] max-w-[85vw] h-screen shadow-2xl flex flex-col pt-24 pb-6 overflow-y-auto animate-slide-in-right" style={{ background: "var(--app-surface)" }}>
            <nav className="flex-1 px-6 space-y-6">
              {menuSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-[9px] text-[color:var(--app-text-muted)] font-black uppercase tracking-[0.25em] pl-3 italic">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item: any) => {
                      const isActive = pathname === item.href;
                      const isStaticOrExternal = item.href.endsWith(".html") || item.href.startsWith("http");

                      const content = (
                        <>
                          <span className={isActive ? 'text-[#FF5C00]' : 'text-[color:var(--app-text-muted)]'}>
                            {item.icon}
                          </span>
                          <span className="text-[12px] uppercase tracking-wider font-bold">
                            {item.name}
                          </span>
                        </>
                      );

                      if (isStaticOrExternal) {
                        return (
                          <a 
                            key={item.name}
                            href={item.href}
                            target={item.target}
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3.5 px-4 py-3 rounded-control transition-all active:scale-98 text-[color:var(--app-text)] hover:bg-[var(--app-hover)]"
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <Link 
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3.5 px-4 py-3 rounded-control transition-all active:scale-98 ${
                            isActive 
                              ? 'bg-[var(--app-accent-soft)] text-[#FF5C00] font-bold' 
                              : 'text-[color:var(--app-text)] hover:bg-[var(--app-hover)]'
                          }`}
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Logout button */}
            <div className="mt-8 border-t border-[#F4F5F7] pt-6 px-6">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-3 border border-red-500/10 hover:border-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 rounded-control text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
