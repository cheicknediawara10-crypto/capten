"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, Map, Sparkles, 
  MessageSquare, Ticket, Wallet, ShieldCheck, CreditCard, Settings, Lock 
} from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTrialExpired, setIsTrialExpired] = React.useState(false);

  React.useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const savedPlan = localStorage.getItem("capten_plan");
      const mockExpired = typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('capten_mock_trial_expired='));
      const isMockExpired = mockExpired ? mockExpired.split('=')[1] === 'true' : false;

      if (savedPlan === 'GRATUIT' || isMockExpired) {
        setIsTrialExpired(true);
        return;
      }

      try {
        const { getSupabase } = await import('@/lib/supabase');
        const supabase = getSupabase();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            if (user.email?.toLowerCase() === 'cheicknediawara10@gmail.com') {
              setIsTrialExpired(false);
              localStorage.setItem('capten_plan', 'PRO');
              return;
            }

            const { data: club } = await supabase
              .from('clubs')
              .select('trial_ends_at, stripe_subscription_status')
              .eq('id', user.id)
              .maybeSingle();
            
            if (club) {
              const now = new Date();
              const trialEnds = new Date(club.trial_ends_at);
              const expired = 
                (club.stripe_subscription_status !== 'active' && club.stripe_subscription_status !== 'trialing') ||
                (now > trialEnds && club.stripe_subscription_status !== 'active');
              
              setIsTrialExpired(expired);
              if (expired) {
                localStorage.setItem('capten_plan', 'GRATUIT');
              }
            }
          }
        }
      } catch (err) {
        console.error("MobileNav subscription check error:", err);
      }
    };

    checkSubscriptionStatus();
    window.addEventListener("capten_branding_change", checkSubscriptionStatus);
    return () => window.removeEventListener("capten_branding_change", checkSubscriptionStatus);
  }, []);

  const items = [
    { name: "Tableau de bord", icon: <LayoutDashboard size={18} strokeWidth={1.5} />, href: "/dashboard" },
    { name: "Le Crew", icon: <Users size={18} strokeWidth={1.5} />, href: "/athletes" },
    { name: "Les Runs", icon: <Map size={18} strokeWidth={1.5} />, href: "/runs" },
    { name: "Messages", icon: <MessageSquare size={18} strokeWidth={1.5} />, href: "/messages" },
    { name: "Cagnotte", icon: <Wallet size={18} strokeWidth={1.5} />, href: "/cagnotte" },
    { name: "Protection", icon: <ShieldCheck size={18} strokeWidth={1.5} />, href: "/securite" },
    { name: "Abonnement", icon: <CreditCard size={18} strokeWidth={1.5} />, href: "/plan" },
    { name: "Réglages", icon: <Settings size={18} strokeWidth={1.5} />, href: "/settings" },
  ];

  // Auto-scroll active item into the viewport center
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [pathname]);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-[0.5px] border-[#E5E5E5] z-[100] pb-safe-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.06)] select-none">
      
      {/* Hide Scrollbars CSS Injection */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Horizontal Fade Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

      {/* Sliding Scroll Container */}
      <div 
        ref={containerRef}
        className="flex items-center gap-6 overflow-x-auto scroll-smooth py-3 px-8 no-scrollbar w-full"
      >
        {items.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = isTrialExpired && item.href !== '/plan' && item.href !== '/settings';
          
          if (isLocked) {
            return (
              <button 
                key={item.name}
                onClick={() => {
                  window.location.href = '/plan?trial_expired=true';
                }}
                className="flex flex-col items-center gap-1 shrink-0 transition-all duration-300 relative px-1 opacity-60 active:scale-95 text-[#A3A3A3] text-left bg-transparent border-none outline-none"
              >
                <div className="transition-all duration-300 text-neutral-300">
                  <Lock size={18} strokeWidth={1.5} />
                </div>
                <span className="text-[8.5px] font-black uppercase tracking-widest text-neutral-400">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link 
              key={item.name}
              href={item.href}
              data-active={isActive ? "true" : "false"}
              className={`flex flex-col items-center gap-1 shrink-0 transition-all duration-300 relative px-1 active:scale-95 ${
                isActive ? "text-[#FF5C00]" : "text-[#A3A3A3]"
              }`}
            >
              {/* Selected Highlight Line */}
              {isActive && (
                <span className="absolute -top-[13px] left-0 right-0 h-[2px] bg-[#FF5C00] rounded-full animate-fade-in" />
              )}
              
              <div className={`transition-all duration-300 ${isActive ? "scale-110 text-[#FF5C00]" : "text-[#A3A3A3]"}`}>
                {item.icon}
              </div>
              <span className={`text-[8.5px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive ? "text-[#FF5C00]" : "text-[#A3A3A3]"
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
