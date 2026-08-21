"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Map, MapPin, Users, Globe, Wallet, Store,
  BarChart3, Sparkles, Ticket, ShieldCheck, 
  LogOut, Zap, LayoutDashboard, HelpCircle,
  MessageSquare, CreditCard, Shield, Plus, History, CloudRain, Wind, Droplets, Activity, Lock, PlayCircle, Flag, Sliders
} from "lucide-react";
import { logout } from "@/app/login/actions";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logo, setLogo] = useState("/logo.png");
  const [sessionMenuLabel, setSessionMenuLabel] = useState("Les Sorties");

  useEffect(() => {
    const updateBranding = () => {
      const savedLogo = localStorage.getItem("capten_logo");
      setLogo(savedLogo || "/logo.png");

      const savedType = localStorage.getItem("capten_community_type");
      if (savedType === "walk_club") {
        setSessionMenuLabel("Les Marches");
      } else if (savedType === "trail_hiking") {
        setSessionMenuLabel("Les Sorties Trail");
      } else {
        setSessionMenuLabel("Les Runs");
      }
    };

    updateBranding();
    
    window.addEventListener("capten_branding_change", updateBranding);
    return () => {
      window.removeEventListener("capten_branding_change", updateBranding);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const sections = [
    {
      title: "PILOTAGE",
      items: [
        { name: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.5} />, href: "/dashboard" },
        { name: "Crew", icon: <Users size={18} strokeWidth={1.5} />, href: "/dashboard/members" },
        { name: "Runs", icon: <Map size={18} strokeWidth={1.5} />, href: "/dashboard/events" },
        { name: "Messages", icon: <MessageSquare size={18} strokeWidth={1.5} />, href: "/messages" },
      ]
    },
    {
      title: "COMMUNAUTÉ",
      items: [
        { name: "Cagnotte", icon: <Wallet size={18} strokeWidth={1.5} />, href: "/dashboard/cagnotte" },
        { name: "Spots", icon: <MapPin size={18} strokeWidth={1.5} />, href: "/dashboard/spots" },
        { name: "Signalements", icon: <Flag size={18} strokeWidth={1.5} />, href: "/dashboard/signalements" },
      ]
    },
    {
      title: "COMPTE",
      items: [
        { name: "Réglages", icon: <Sliders size={18} strokeWidth={1.5} />, href: "/settings" },
      ]
    }
  ];

  return (
    <aside
      className="hidden lg:flex w-[280px] h-screen fixed left-0 top-0 flex-col z-[100] border-r-[1px] py-10 shadow-none"
      style={{ background: "var(--app-surface)", borderColor: "var(--app-border)" }}
    >
      <div className="px-5 py-4 max-h-[60px] flex items-center mb-10">
        <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-all">
          <img src={logo} alt="CAPTEN" className={`h-[36px] w-auto object-contain rounded-control ${logo === "/logo.png" ? "capten-logo" : ""}`} />
        </Link>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] text-[color:var(--app-text-muted)] font-black uppercase tracking-[0.3em] mb-4 px-8 italic opacity-70">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item: any) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")) ||
                  (item.href !== "/dashboard" && pathname === item.href);
                const isStaticOrExternal = item.href.endsWith(".html") || item.href.startsWith("http");
                
                const content = (
                  <>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FF5C00]" />}
                    <span className={isActive ? 'text-[#FF5C00]' : 'text-[color:var(--app-text-muted)]'}>
                      {item.icon}
                    </span>
                    <span className={`text-[13px] tracking-tight ${isActive ? 'text-[#FF5C00] font-bold' : 'text-[color:var(--app-text)] font-medium'}`}>
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
                      className="relative flex items-center gap-4 px-8 py-2.5 transition-all text-[color:var(--app-text)] hover:bg-[var(--app-hover)]"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-4 px-8 py-2.5 transition-all ${isActive ? 'bg-[var(--app-accent-soft)] text-[#FF5C00]' : 'text-[color:var(--app-text)] hover:bg-[var(--app-hover)]'}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t-[0.5px] px-6 space-y-2" style={{ borderColor: "var(--app-border)" }}>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">Thème</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[color:var(--app-text-muted)] hover:text-[#FF0000] hover:bg-[#FF0000]/5 rounded-control transition-all group"
        >
          <LogOut size={18} strokeWidth={1.5} className="text-[color:var(--app-text-muted)] group-hover:text-[#FF0000]" />
          <span className="text-[12px] font-bold uppercase tracking-widest">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
