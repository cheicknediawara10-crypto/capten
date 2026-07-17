"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Map, Users, Globe, Wallet, Store,
  BarChart3, Sparkles, Ticket, ShieldCheck, 
  LogOut, Zap, LayoutDashboard, Settings,
  MessageSquare, CreditCard, Shield, Plus, History, CloudRain, Wind, Droplets, Activity, Lock, PlayCircle
} from "lucide-react";
import { logout } from "@/app/login/actions";

export default function Sidebar() {
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
    return () => {
      window.removeEventListener("capten_branding_change", updateLogo);
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
        { name: "Tableau de bord", icon: <LayoutDashboard size={18} strokeWidth={1.5} />, href: "/dashboard" },
        { name: "Le Crew", icon: <Users size={18} strokeWidth={1.5} />, href: "/athletes" },
        { name: "Les Runs", icon: <Map size={18} strokeWidth={1.5} />, href: "/runs" },
        { name: "Messages", icon: <MessageSquare size={18} strokeWidth={1.5} />, href: "/messages" },
      ]
    },
    {
      title: "TERRAIN",
      items: [
        { name: "Spots", icon: <Store size={18} strokeWidth={1.5} />, href: "/spots/explorer" },
        { name: "Cagnotte", icon: <Wallet size={18} strokeWidth={1.5} />, href: "/cagnotte" },
        { name: "Protection", icon: <ShieldCheck size={18} strokeWidth={1.5} />, href: "/securite" },
      ]
    },
    {
      title: "COMPTE",
      items: [
        { name: "Abonnement", icon: <CreditCard size={18} strokeWidth={1.5} />, href: "/plan" },
        { name: "Réglages", icon: <Settings size={18} strokeWidth={1.5} />, href: "/settings" },
      ]
    }
  ];

  return (
    <aside className="hidden lg:flex w-[280px] bg-white h-screen fixed left-0 top-0 flex-col z-[100] border-r-[1px] border-black/5 py-10 shadow-none">
      <div className="px-5 py-4 max-h-[60px] flex items-center mb-10">
        <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-all">
          <img src={logo} alt="CAPTEN" className="h-[36px] w-auto object-contain rounded-control" />
        </Link>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] text-[#D1D1D1] font-black uppercase tracking-[0.3em] mb-4 px-8 italic">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item: any) => {
                const isActive = pathname === item.href || (item.href === '/spots/explorer' && pathname.startsWith('/spots'));
                const isStaticOrExternal = item.href.endsWith(".html") || item.href.startsWith("http");
                
                const content = (
                  <>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FF5C00]" />}
                    <span className={isActive ? 'text-[#FF5C00]' : 'text-[#A3A3A3]'}>
                      {item.icon}
                    </span>
                    <span className={`text-[13px] tracking-tight ${isActive ? 'text-[#FF5C00] font-bold' : 'text-[#555555] font-medium'}`}>
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
                      className="relative flex items-center gap-4 px-8 py-2.5 transition-all text-[#555555] hover:text-black hover:bg-gray-50"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-4 px-8 py-2.5 transition-all ${isActive ? 'bg-[#FFF0E8]/60 text-[#FF5C00]' : 'text-[#555555] hover:text-black hover:bg-gray-50'}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t-[0.5px] border-black/5 px-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[#A3A3A3] hover:text-[#FF0000] hover:bg-[#FF0000]/5 rounded-control transition-all group"
        >
          <LogOut size={18} strokeWidth={1.5} className="text-[#D1D1D1] group-hover:text-[#FF0000]" />
          <span className="text-[12px] font-bold uppercase tracking-widest">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
