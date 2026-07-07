'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

export default function UpgradeBanner() {
  const [data, setData] = useState<{ activeMembers: number; limit: number; isOverLimit: boolean; plan: string } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/club/active-members');
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error('Error fetching member limits in banner:', err);
      }
    }
    fetchStats();
  }, []);

  if (!data || data.plan === 'CAPTEN') return null;

  const { activeMembers, limit, isOverLimit } = data;
  const isApproaching = activeMembers >= 20 && activeMembers <= limit;

  if (!isOverLimit && !isApproaching) return null;

  return (
    <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
      isOverLimit 
        ? 'bg-red-500/10 border-red-500/20 text-red-700' 
        : 'bg-[#FF5C00]/10 border-[#FF5C00]/20 text-[#FF5C00]'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2 rounded-lg ${isOverLimit ? 'bg-red-500/10' : 'bg-[#FF5C00]/10'}`}>
            {isOverLimit ? (
              <AlertTriangle className="h-5 w-5 animate-pulse text-red-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-[#FF5C00]" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight uppercase font-sans">
              {isOverLimit ? 'Crew au complet !' : 'Ton crew grandit !'}
            </h4>
            <p className="text-xs text-neutral-600 mt-0.5">
              {isOverLimit 
                ? `Tu as dépassé la limite gratuite avec ${activeMembers} membres actifs sur ${limit} max.` 
                : `Tu as déjà ${activeMembers}/${limit} membres actifs. Anticipe la croissance de ton club.`
              }
            </p>
          </div>
        </div>
        <Link 
          href="/plan" 
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 ${
            isOverLimit 
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm' 
              : 'bg-[#FF5C00] text-white hover:bg-[#FF5C00]/90 shadow-sm'
          }`}
        >
          Passer à Capten <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
