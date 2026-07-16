"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, X, LayoutDashboard, Users, Map, Sparkles, 
  MessageSquare, Ticket, Wallet, Store, ShieldCheck, CreditCard, Settings, LogOut, Globe, PlayCircle,
  Calendar, TrendingUp
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
        { name: "Le Crew", icon: <Users size={18} strokeWidth={1.5} />, href: "/athletes" },
        { name: "Les Runs", icon: <Map size={18} strokeWidth={1.5} />, href: "/runs" },
        { name: "Messages", icon: <MessageSquare size={18} strokeWidth={1.5} />, href: "/messages" },
      ]
    },
    {
      title: "Terrain",
      items: [
        { name: "Cagnotte", icon: <Wallet size={18} strokeWidth={1.5} />, href: "/cagnotte" },
        { name: "Spots (Explorer)", icon: <Store size={18} strokeWidth={1.5} />, href: "/spots/explorer" },
        { name: "Spots (Événements)", icon: <Calendar size={18} strokeWidth={1.5} />, href: "/spots/events" },
        { name: "Le Compteur", icon: <TrendingUp size={18} strokeWidth={1.5} />, href: "/spots/compteur" },
        { name: "Protection", icon: <ShieldCheck size={18} strokeWidth={1.5} />, href: "/securite" },
      ]
    },
    {
      title: "Compte",
      items: [
        { name: "Abonnement", icon: <CreditCard size={18} strokeWidth={1.5} />, href: "/plan" },
        { name: "Réglages", icon: <Settings size={18} strokeWidth={1.5} />, href: "/settings" },
      ]
    }
  ];

  return (
    <>
      {/* HEADER BAR */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b-[0.5px] border-[#E5E5E5] sticky top-0 z-[120] shadow-sm">
        <Link href="/" className="flex items-center gap-2.5 active:scale-95 transition-all">
          <img src={logo} alt="CAPTEN" className="h-[24px] w-auto object-contain rounded-control" />
        </Link>

        {/* Menu toggle button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          className="w-10 h-10 rounded-control border border-black/5 bg-[#F8F9FA] hover:bg-black/5 flex items-center justify-center text-black active:scale-90 transition-all cursor-pointer"
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
          <div className="relative w-[300px] max-w-[85vw] bg-white h-screen shadow-2xl flex flex-col pt-24 pb-6 overflow-y-auto animate-slide-in-right">
            <nav className="flex-1 px-6 space-y-6">
              {menuSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-[9px] text-[#A3A3A3] font-black uppercase tracking-[0.25em] pl-3 italic">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item: any) => {
                      const isActive = pathname === item.href;
                      const isStaticOrExternal = item.href.endsWith(".html") || item.href.startsWith("http");

                      const content = (
                        <>
                          <span className={isActive ? 'text-[#FF5C00]' : 'text-[#A3A3A3]'}>
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
                            className="flex items-center gap-3.5 px-4 py-3 rounded-control transition-all active:scale-98 text-[#555555] hover:bg-[#F8F9FA] hover:text-black"
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
                              ? 'bg-[#FFF0E8] text-[#FF5C00] font-bold' 
                              : 'text-[#555555] hover:bg-[#F8F9FA] hover:text-black'
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
