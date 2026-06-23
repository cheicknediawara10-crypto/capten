'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { 
  Wallet, History, Globe, Trophy, Zap, ArrowRight, Sun, Coffee, 
  X, ShieldCheck, Check, CreditCard, Building, Award,
  Info, Eye, Copy, MessageCircle
} from 'lucide-react';

interface ContributionLog {
  date: string;
  desc: string;
  amount: string;
  type: 'in' | 'out';
}

interface Contributor {
  name: string;
  amount: string;
  img: string;
}

export default function CagnottePage() {
  const [solde, setSolde] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };
  const [targetAmount] = useState(2000);
  const [berlinRaised, setBerlinRaised] = useState(0);
  const [origin, setOrigin] = useState('');
  const [cagnotteUrl, setCagnotteUrl] = useState('');

  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [logs, setLogs] = useState<ContributionLog[]>([]);

  // Load from local storage on mount and fetch Supabase details
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      const storedSolde = localStorage.getItem('capten_solde_v3');
      if (storedSolde) setSolde(parseInt(storedSolde));
      
      const storedBerlin = localStorage.getItem('capten_berlin_v3');
      if (storedBerlin) setBerlinRaised(parseInt(storedBerlin));

      const storedLogs = localStorage.getItem('capten_cagnotte_logs_v3');
      if (storedLogs) setLogs(JSON.parse(storedLogs));

      const storedContributors = localStorage.getItem('capten_cagnotte_contributors_v3');
      if (storedContributors) setContributors(JSON.parse(storedContributors));

      const savedCagnotte = localStorage.getItem('capten_cagnotte_url');
      if (savedCagnotte) setCagnotteUrl(savedCagnotte);
    }

    const loadCagnotteUrl = async () => {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: club } = await supabase
              .from('clubs')
              .select('cagnotte_url')
              .eq('id', user.id)
              .maybeSingle();
            if (club && club.cagnotte_url) {
              setCagnotteUrl(club.cagnotte_url);
              localStorage.setItem('capten_cagnotte_url', club.cagnotte_url);
            }
          }
        }
      } catch (e) {
        console.error("Error loading club cagnotte:", e);
      }
    };
    loadCagnotteUrl();
  }, []);

  // Modals state
  const [isVirementModalOpen, setIsVirementModalOpen] = useState(false);
  const [isGererFluxModalOpen, setIsGererFluxModalOpen] = useState(false);

  // Virement form state
  const [virementAmount, setVirementAmount] = useState('500');
  const [virementRef, setVirementRef] = useState('CAPTEN-SQUAD-12');
  const [isProcessingVirement, setIsProcessingVirement] = useState(false);
  const [virementSuccess, setVirementSuccess] = useState(false);

  // Gerer Flux state
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const handleDeclareVirement = () => {
    setIsProcessingVirement(true);
    setVirementSuccess(false);

    setTimeout(() => {
      setIsProcessingVirement(false);
      setVirementSuccess(true);

      const amount = parseInt(virementAmount) || 0;
      const newSolde = solde + amount;
      setSolde(newSolde);
      localStorage.setItem('capten_solde_v3', String(newSolde));

      // Append to Transparency logs
      const today = new Date();
      const monthNames = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
      const dateString = `${today.getDate()} ${monthNames[today.getMonth()]}`;
      
      const newLog: ContributionLog = {
        date: dateString.toUpperCase(),
        desc: `Virement Bancaire reçu (Réf: ${virementRef})`,
        amount: `+${amount}€`,
        type: 'in'
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem('capten_cagnotte_logs_v3', JSON.stringify(updatedLogs));

      setTimeout(() => {
        setIsVirementModalOpen(false);
        setVirementSuccess(false);
      }, 1500);
    }, 2000);
  };

  const handleProcessPayout = () => {
    setIsProcessingPayout(true);
    setPayoutSuccess(false);

    setTimeout(() => {
      setIsProcessingPayout(false);
      setPayoutSuccess(true);

      // Save state and update localStorage
      const oldSolde = solde;
      const newSolde = 0;
      setSolde(newSolde);
      localStorage.setItem('capten_solde_v3', String(newSolde));

      // Append to Transparency logs
      const today = new Date();
      const monthNames = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
      const dateString = `${today.getDate()} ${monthNames[today.getMonth()]}`;
      
      const newLog: ContributionLog = {
        date: dateString.toUpperCase(),
        desc: "Virement sortant (Stripe Payout vers Banque)",
        amount: `-${oldSolde}€`,
        type: 'out'
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem('capten_cagnotte_logs_v3', JSON.stringify(updatedLogs));

      setTimeout(() => {
        setIsGererFluxModalOpen(false);
        setPayoutSuccess(false);
      }, 1500);
    }, 2000);
  };

  const B2BPlans = [
    { name: "Bronze Partner", price: 500, desc: "Visibilité dans le club avantages membres & logo sur la page d'accueil du club.", color: "#CD7F32" },
    { name: "Silver Partner", price: 1500, desc: "Bronze + Envoi de promotions WhatsApp personnalisées (via notre API Meta Cloud).", color: "#A3A3A3" },
    { name: "Gold Sponsor", price: 3000, desc: "Silver + Bannière bento géante sur le Hub du Crew et sponsoring officiel des sorties.", color: "#FF5C00" }
  ];

  return (
    <div className="space-y-10 pb-20">
        <header className="flex flex-col gap-1.5 pb-6 sm:pb-10 border-b-[0.5px] border-black/10 mb-8 sm:mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tight">
                LA CAGNOTTE
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button 
                onClick={() => {
                  setIsVirementModalOpen(true);
                }}
                className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-1.5"
              >
                <Info size={14} /> Comment ça marche ?
              </button>
              <button 
                onClick={() => {
                  setPayoutSuccess(false);
                  setIsGererFluxModalOpen(true);
                }}
                className="w-full sm:w-auto btn-primary"
              >
                <Wallet size={14} /> GÉRER LE FLUX
              </button>
            </div>
          </div>
      </header>

      {/* STRATEGIC ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BIG BALANCE & GROWTH TREND */}
        <div className="col-span-1 lg:col-span-8 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 flex flex-col justify-between min-h-[300px] sm:min-h-[400px] h-full shadow-sm">
           <div className="flex justify-between items-start">
             <div className="space-y-1 text-left">
                <p className="text-[10px] font-black text-[#D1D1D1] uppercase tracking-[0.2em]">CAGNOTTE DU CREW</p>
                {solde === 0 ? (
                  <div className="space-y-2 mt-1">
                    <h2 className="text-[32px] sm:text-[48px] font-display italic font-black text-[#9B9B93] leading-none tracking-tight">—</h2>
                    <p className="text-[12px] font-medium text-[#6B6B63]">Ajoute ton lien pour commencer</p>
                  </div>
                ) : (
                  <h2 className="text-[32px] sm:text-[48px] font-display italic font-black text-black leading-none tracking-tight">{solde}<span className="text-[0.75em] ml-1.5 sm:ml-2">€</span></h2>
                )}
             </div>
             {logs.length > 0 && (
               <div className="flex items-center gap-6">
                  <div className="text-right">
                     <p className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-widest">ÉVOLUTION SOCIALE</p>
                     <p className="text-[20px] font-display italic font-black text-[#56E39F]">
                       {logs.length >= 2 ? `+${Math.min(999, Math.round(logs.filter(l => l.type === 'in').length * 18))}%` : `+${logs.filter(l => l.type === 'in').length * 100}%`}
                     </p>
                  </div>
               </div>
             )}
           </div>

           {/* Trend Chart (SVG) or Empty State */}
           {solde > 0 || logs.length > 0 ? (
             <div className="h-40 w-full relative mt-4">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FF5C00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,80 Q50,75 100,60 T200,40 T300,20 T400,10" 
                    fill="none" 
                    stroke="#FF5C00" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M0,80 Q50,75 100,60 T200,40 T300,20 T400,10 V100 H0 Z" 
                    fill="url(#gradient)" 
                  />
                </svg>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center py-8 opacity-40">
                <Wallet size={32} className="text-black/20 mb-3" />
                <p className="text-[11px] font-black text-[#A3A3A3] uppercase tracking-widest">AUCUNE TRANSACTION</p>
                <p className="text-[9px] font-medium text-[#A3A3A3] uppercase tracking-widest mt-1">Les contributions apparaîtront ici</p>
             </div>
           )}
         </div>

        {/* AGNOSTIC PAYMENT LINK CARD */}
        <div className="col-span-1 lg:col-span-4 min-h-[350px] sm:min-h-[400px] h-full">
           <div className="bg-gradient-to-br from-[#FF5C00] to-[#E05200] text-white rounded-card-outer p-6 sm:p-8 h-full flex flex-col justify-between shadow-lg relative overflow-hidden border border-white/10">
              <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none text-white">
                 <Wallet size={120} />
              </div>
              <div className="space-y-4 relative z-10 text-left">
                 <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-control bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                       <Globe size={16} />
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="font-sans font-black tracking-tight text-white text-[15px] italic uppercase">Compatible partout</span>
                       <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          0% Commission
                       </span>
                    </div>
                 </div>
                 <h3 className="text-[16px] sm:text-[18px] font-display italic font-black uppercase leading-tight text-white">
                   Liens de Cagnotte Direct
                 </h3>
                 <p className="text-[10px] text-white/95 leading-relaxed font-medium">
                   CAPTEN ne gère aucun flux financier. Vos coureurs cliquent sur votre bouton en debrief et sont redirigés directement sur votre Sumeria, Revolut, PayPal ou Wero.
                 </p>
              </div>
              
              <div className="flex flex-col gap-3.5 z-10 mt-auto">
                {/* Configured link info */}
                <div className="bg-white/10 rounded-card-inner p-3.5 text-[10px] font-semibold leading-relaxed text-white/95 border border-white/10 text-left">
                   <p className="text-[8px] font-black text-white/70 uppercase">Lien Actif de Cagnotte :</p>
                   <p className="font-mono text-[11px] font-bold pt-1 break-all select-all">
                     {cagnotteUrl || 'Non configuré (Settings)'}
                   </p>
                </div>

                <div className="space-y-2">
                  <Link 
                    href="/settings"
                    className="w-full h-11 bg-white hover:bg-white/95 text-[#FF5C00] rounded-control text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 font-bold"
                  >
                    ⚙️ Configurer mon lien
                  </Link>
                  <button 
                    onClick={() => {
                      if (cagnotteUrl) {
                        navigator.clipboard.writeText(cagnotteUrl);
                        showToast("LIEN DE CAGNOTTE COPIÉ !");
                      } else {
                        showToast("Aucun lien configuré !");
                      }
                    }}
                    className="w-full h-11 bg-transparent border border-white/30 text-white rounded-control text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy size={12} strokeWidth={2.5} />
                    Copier mon lien
                  </button>
                </div>

                <div className="pt-3 border-t border-white/15 text-left">
                   <a 
                     href={cagnotteUrl
                       ? `https://wa.me/?text=${encodeURIComponent(`👋 Hello ! Pour soutenir le club et financer nos projets et after-runs, tu peux faire une contribution libre à la cagnotte en 2 secondes ici :\n\n👉 ${cagnotteUrl}`)}`
                       : '#'
                     }
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full py-2.5 bg-black/20 hover:bg-black/30 text-white rounded-control text-[9px] font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                   >
                     <MessageCircle size={11} strokeWidth={2.5} />
                     Partager mon lien sur WhatsApp
                   </a>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* IA ADVISORY & STATS — Only show if there are contributions */}
      {(berlinRaised > 0 || logs.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* FOCUS PROJECT */}
           <div className="col-span-1 lg:col-span-12 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 flex flex-col justify-between min-h-[260px] sm:h-[300px] shadow-sm relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                 <p className="text-[10px] font-black text-[#D1D1D1] uppercase tracking-[0.2em]">AVENTURE COLLECTIVE</p>
                 <h3 className="text-[36px] sm:text-[48px] font-display italic font-black uppercase leading-none tracking-tight text-black">BERLIN MARATHON <br /> <span className="text-[#FF5C00]">SQUAD 2026</span></h3>
              </div>
              <div className="space-y-3 relative z-10">
                 <div className="flex justify-between items-end">
                    <span className="text-[24px] sm:text-[32px] font-display italic font-black text-black">{berlinRaised}<span className="text-[0.75em] ml-1">€</span> <span className="text-[#D1D1D1]">/ {targetAmount}<span className="text-[0.75em] ml-0.5">€</span></span></span>
                    <span className="text-[11px] font-black text-[#FF5C00] uppercase italic tracking-widest">{Math.round((berlinRaised/targetAmount)*100)}% ATTEINT</span>
                 </div>
                 <div className="h-1.5 bg-[#F4F5F7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF5C00]" style={{ width: `${(berlinRaised/targetAmount)*100}%` }} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* LEADERBOARD & LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* LEADERBOARD */}
         <div className="col-span-1 lg:col-span-5 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b-[0.5px] border-[#F4F5F7] pb-4">
               <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em] italic">TOP GÉNÉROSITÉ</h3>
               <Trophy size={16} className="text-[#FFD700]" />
            </div>
            {contributors.length > 0 ? (
              <div className="flex flex-col gap-4">
                {contributors.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-[#D1D1D1] italic">{idx + 1}.</span>
                       <img src={c.img} alt={c.name} className="w-8 h-8 rounded-full grayscale hover:grayscale-0 transition-all border-[0.5px] border-black/5" />
                       <span className="text-[12px] font-bold text-black uppercase tracking-tight">{c.name}</span>
                    </div>
                    <span className="text-[14px] font-display italic font-black text-black">{c.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 opacity-50">
                 <p className="text-[11px] font-black text-[#A3A3A3] uppercase tracking-widest text-center">AUCUN CONTRIBUTEUR<br/>LES DONATEURS APPARAÎTRONT ICI</p>
              </div>
            )}
         </div>

         {/* TRANSPARENCY LOG */}
         <div className="col-span-1 lg:col-span-7 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b-[0.5px] border-[#F4F5F7] pb-4">
               <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em] italic">REGISTRE DE TRANSPARENCE</h3>
               <History size={16} className="text-[#D1D1D1]" />
            </div>
            {logs.length > 0 ? (
              <div className="space-y-4 overflow-x-auto">
                 {logs.map((log, idx) => (
                   <div key={idx} className="flex items-center justify-between py-3 border-b-[0.5px] border-[#F4F5F7] last:border-0 min-w-[320px]">
                     <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-[#D1D1D1] italic w-12">{log.date}</span>
                       <span className="text-[11px] font-bold text-black uppercase tracking-tight">{log.desc}</span>
                     </div>
                     <span className={`text-[14px] font-display italic font-black ${log.type === 'in' ? 'text-[#56E39F]' : 'text-[#FF0000]'}`}>
                       {log.amount}
                     </span>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 opacity-50">
                 <p className="text-[11px] font-black text-[#A3A3A3] uppercase tracking-widest text-center">AUCUNE TRANSACTION<br/>L&apos;HISTORIQUE APPARAÎTRA ICI</p>
              </div>
            )}
         </div>
      </div>





      {/* HELP / COMMENT CA MARCHE MODAL */}
      {isVirementModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsVirementModalOpen(false)} />
          <div className="relative bg-white border-[0.5px] border-[#E5E5E5] w-full max-w-form-single rounded-modal-box shadow-2xl overflow-hidden z-10 flex flex-col animate-scale-up text-black max-h-[90vh] overflow-y-auto">
            <header className="px-8 py-6 border-b-[0.5px] border-[#E5E5E5] flex justify-between items-center bg-[#F8F9FA]">
              <div>
                <h3 className="text-[18px] font-display italic font-black uppercase text-black leading-none">COMMENT ÇA MARCHE ?</h3>
                <span className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-1 block">LOGISTIQUE FINANCIÈRE DE CAPTEN</span>
              </div>
              <button 
                onClick={() => setIsVirementModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#A3A3A3] hover:text-black transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </header>

            <div className="p-8 space-y-6 text-left">
              <div className="space-y-4">
                <h4 className="text-[16px] font-display italic font-black uppercase text-[#FF5C00]">Capten ne touche pas ton argent.</h4>
                <p className="text-[13px] font-sans font-medium text-neutral-600 leading-relaxed">
                  Tes coureurs cliquent sur ton lien Sumeria (ex Lydia), Revolut ou Wero. L&apos;argent arrive directement sur ton téléphone.
                </p>
              </div>
              <div className="bg-[#F4F5F7] rounded-card-inner p-4 border border-black/5 space-y-3 font-medium text-[11px] text-neutral-650">
                <p className="flex gap-2"><span>🛡️</span> <span>Zéro intermédiaire financier, 0% commission.</span></p>
                <p className="flex gap-2"><span>📲</span> <span>Liaison directe avec ton compte personnel ou professionnel.</span></p>
              </div>
              <button
                onClick={() => setIsVirementModalOpen(false)}
                className="w-full bg-[#FF5C00] text-white py-3 rounded-control text-[11px] font-black uppercase tracking-wider hover:bg-black transition-all shadow-sm active:scale-95"
              >
                J'AI COMPRIS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRIPE CONNECT PAYOUT MODAL */}
      {isGererFluxModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGererFluxModalOpen(false)} />
          <div className="relative bg-white border-[0.5px] border-[#E5E5E5] w-full max-w-form-single rounded-modal-box shadow-2xl overflow-hidden z-10 flex flex-col animate-scale-up text-black max-h-[90vh] overflow-y-auto">
            <header className="px-8 py-6 border-b-[0.5px] border-[#E5E5E5] flex justify-between items-center bg-[#F8F9FA]">
              <div>
                <h3 className="text-[18px] font-display italic font-black uppercase text-black leading-none">POSTE DE CONTRÔLE STRIPE</h3>
                <span className="text-[9px] font-bold text-[#635BFF] uppercase tracking-widest mt-1 block">LOGISTIQUE DES FLUX ET PAYOUTS DIRECTS</span>
              </div>
              <button 
                onClick={() => setIsGererFluxModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#A3A3A3] hover:text-black transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </header>

            {payoutSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] animate-bounce">
                  <Check size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-[20px] font-display italic font-black uppercase text-black leading-none">VIREMENT ENVOYÉ !</h3>
                  <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-2">Les fonds ont été transférés avec succès vers ton compte bancaire associé.</p>
                </div>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F4F5F7] rounded-card-inner p-5 border border-black/5">
                    <span className="thin-label block">Disponible Stripe</span>
                    <span className="text-[28px] font-display italic font-black text-black leading-none mt-1 block">{solde}<span className="text-[0.75em] ml-1">€</span></span>
                  </div>
                  <div className="bg-[#F4F5F7] rounded-card-inner p-5 border border-black/5">
                    <span className="thin-label block">Frais Opérationnels</span>
                    <span className="text-[28px] font-display italic font-black text-[#56E39F] leading-none mt-1 block">0%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="thin-label block">Banque de destination</label>
                    <div className="bg-[#F4F5F7] p-4 rounded-card-inner border border-black/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black">
                          <Building size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-black uppercase">QONTO BUSINESS ACCT</p>
                          <p className="text-[9px] font-medium text-[#A3A3A3] font-mono">FR76 •••• •••• 9012</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-[#56E39F] bg-[#56E39F]/10 px-2 py-0.5 rounded-full">Vérifié</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="thin-label block">Fréquence de virement automatique</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['QUOTIDIEN', 'HEBDOMADAIRE', 'MENSUEL'].map((freq, i) => (
                        <button 
                          key={freq}
                          className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-control border ${
                            i === 1 ? 'border-black bg-black text-white' : 'border-black/5 bg-[#F4F5F7] text-[#A3A3A3] hover:text-black'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProcessPayout}
                  disabled={solde <= 0 || isProcessingPayout}
                  className="btn-lg-cta bg-[#635BFF] hover:bg-black text-white"
                >
                  {isProcessingPayout ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      PAYOUT VERS LA BANQUE EN COURS...
                    </>
                  ) : (
                    <>VIRER LES {solde} € VERS LA BANQUE</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION OVERLAY */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 sm:px-8 py-4 rounded-[12px] border-[0.5px] border-white/20 shadow-2xl z-[300] flex items-center gap-3 animate-slide-up text-center w-[90%] max-w-[400px] justify-center">
          <Check size={16} className="text-[#56E39F] shrink-0" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{toast}</span>
        </div>
      )}
    </div>
  );
}
