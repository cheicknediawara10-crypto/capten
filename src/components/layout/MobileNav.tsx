"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Map, MapPin, MessageSquare } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const [sessionLabel, setSessionLabel] = useState("Runs");

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

  const items = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} strokeWidth={1.75} />, href: "/dashboard" },
    { name: "Crew", icon: <Users size={20} strokeWidth={1.75} />, href: "/dashboard/members" },
    { name: sessionLabel, icon: <Map size={20} strokeWidth={1.75} />, href: "/dashboard/events" },
    { name: "Messages", icon: <MessageSquare size={20} strokeWidth={1.75} />, href: "/messages" },
    { name: "Spots", icon: <MapPin size={20} strokeWidth={1.75} />, href: "/dashboard/spots" },
  ];

  return (
    <nav
      aria-label="Navigation mobile principale"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe-bottom backdrop-blur-xl border-t-[0.5px] select-none shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{
        background: "color-mix(in srgb, var(--app-surface) 92%, transparent)",
        borderColor: "var(--app-border)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2.5 max-w-md mx-auto">
        {items.map((item) => {
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
      </div>
    </nav>
  );
}
