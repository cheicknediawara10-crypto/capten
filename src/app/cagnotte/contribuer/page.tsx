'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, ArrowRight, Loader2, AlertCircle, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function ContribuerPage() {
  const [cagnotteUrl, setCagnotteUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCagnotteUrl = async () => {
      // 1. Try search parameters for direct URL or cagnotteUrl parameter
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const queryCagnotte = params.get('cagnotteUrl') || params.get('cagnotte_url') || params.get('url');
        if (queryCagnotte) {
          setCagnotteUrl(queryCagnotte);
          setIsLoading(false);
          return;
        }
      }

      // 2. Try fetching from Supabase if we have a runner ID
      let runnerId = '';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        runnerId = params.get('runnerId') || params.get('athleteId') || params.get('runner_id') || params.get('athlete_id') || '';
        
        if (!runnerId) {
          const stored = localStorage.getItem('capten_runner_profile');
          if (stored) {
            try {
              const profile = JSON.parse(stored);
              runnerId = profile.id || '';
            } catch (e) {}
          }
        }
      }

      if (runnerId) {
        try {
          const res = await fetch(`/api/runners/profile?id=${encodeURIComponent(runnerId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.runner && data.runner.cagnotte_url) {
              setCagnotteUrl(data.runner.cagnotte_url);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Failed fetching from Supabase profile API:", err);
        }
      }

      // 3. Fallback to localStorage
      if (typeof window !== 'undefined') {
        const localUrl = localStorage.getItem('capten_cagnotte_url');
        if (localUrl) {
          setCagnotteUrl(localUrl);
        } else {
          setError("Aucun lien de cagnotte n'a été configuré par le capitaine.");
        }
      }
      setIsLoading(false);
    };

    fetchCagnotteUrl();
  }, []);

  useEffect(() => {
    if (cagnotteUrl) {
      // Small timeout to show the premium screen and explain the redirect
      const timer = setTimeout(() => {
        window.location.href = cagnotteUrl;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cagnotteUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#F4F5F7] flex flex-col items-center justify-center p-6 text-black">
      <div className="w-full max-w-[440px] bg-white border border-black/5 rounded-[24px] p-8 sm:p-10 shadow-2xl text-center space-y-8 animate-scale-up">
        
        {/* Branding header */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#FF5C00] rounded-full" />
          <span className="font-display italic font-black uppercase text-[15px] tracking-widest">CAPTEN</span>
        </div>

        {isLoading ? (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 bg-[#FF5C00]/10 rounded-full flex items-center justify-center text-[#FF5C00] mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" strokeWidth={2.5} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[18px] font-display italic font-black uppercase">RECHERCHE DE LA CAGNOTTE...</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Connexion sécurisée en cours
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-[#FF5C00] mx-auto animate-pulse">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[18px] font-display italic font-black uppercase text-black">CAGNOTTE INDISPONIBLE ☕</h3>
              <p className="text-xs text-neutral-600 font-bold uppercase tracking-wide leading-relaxed">
                Le capitaine du club n'a pas encore configuré son lien de paiement (Lydia, Sumeria, Revolut ou Wero).
              </p>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => window.close()}
                className="w-full py-3.5 bg-black text-white rounded-[10px] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all cursor-pointer"
              >
                FERMER L'ONGLET
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] mx-auto animate-bounce">
              <Coffee size={28} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[20px] font-display italic font-black uppercase text-black">SOUTENIR LE CLUB ⚡</h3>
              <p className="text-xs text-neutral-600 font-bold uppercase tracking-wide leading-relaxed">
                Redirection immédiate et sécurisée vers l&apos;espace de don ou de contribution en direct.
              </p>
            </div>
            
            <div className="bg-[#F8F9FA] rounded-[12px] p-4 border border-black/5 text-left flex items-center gap-3">
              <div className="bg-white p-2 rounded-control border border-black/5 shrink-0 text-black">
                <Wallet size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider">ESPACE DE TRANSACTION</p>
                <p className="font-mono text-[10.5px] font-bold text-neutral-800 truncate select-all">{cagnotteUrl}</p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <a 
                href={cagnotteUrl || '#'}
                className="w-full py-4 bg-[#FF5C00] text-white rounded-[10px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10"
              >
                ALLER SUR LA CAGNOTTE <ArrowRight size={12} strokeWidth={3} />
              </a>
              <p className="text-[7.5px] font-bold text-neutral-400 uppercase tracking-widest">
                0% COMMISSION PAR CAPTEN · TRANSACTION 100% DIRECTE
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
