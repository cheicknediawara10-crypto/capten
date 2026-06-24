'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trophy, Sparkles, Star, Users, Check, ArrowRight, Loader2, CreditCard, X, Building, CheckCircle2 } from 'lucide-react';

export default function SponsorPage() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');

  const sponsorPlans = [
    { 
      name: "Bronze Partner", 
      price: 500, 
      desc: "Visibilité locale et intégration communautaire pour les commerces de quartier.", 
      color: "#CD7F32",
      features: [
        "Logo sur la page d'accueil du club",
        "Visibilité dans l'onglet Avantages Membres",
        "1 publication dédiée sur le Social Wall",
        "Invitation VIP aux after-runs du Crew"
      ]
    },
    { 
      name: "Silver Partner", 
      price: 1500, 
      desc: "Idéal pour les marques de sport ou nutrition souhaitant engager activement.", 
      color: "#A3A3A3",
      features: [
        "Tous les avantages du pack Bronze",
        "Envoi de promotions WhatsApp personnalisées via Meta Cloud API",
        "Sponsoring officiel d'une sortie mensuelle",
        "Distribution d'échantillons ou flyers lors des débriefs"
      ]
    },
    { 
      name: "Gold Sponsor", 
      price: 3000, 
      desc: "Partenaire majeur avec visibilité premium sur l'infrastructure du club.", 
      color: "#FF5C00",
      features: [
        "Tous les avantages du pack Silver",
        "Bannière bento géante sur le Hub principal du Crew",
        "Sponsoring exclusif de l'événement phare de l'année",
        "Logo imprimé sur les maillots ou t-shirts officiels du club"
      ]
    }
  ];

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handleConfirmSponsor = () => {
    if (!contributorName || !contributorEmail) {
      alert("Veuillez renseigner le nom de votre entreprise et votre e-mail.");
      return;
    }
    setIsProcessing(true);

    setTimeout(() => {
      // Simulate transaction logging to local storage transparency logs
      try {
        const storedLogs = localStorage.getItem('capten_cagnotte_logs_v3');
        const logs = storedLogs ? JSON.parse(storedLogs) : [];
        const today = new Date();
        const monthNames = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
        const dateString = `${today.getDate()} ${monthNames[today.getMonth()]}`;

        const newLog = {
          date: dateString.toUpperCase(),
          desc: `Sponsoring B2B — ${contributorName.toUpperCase()} (${selectedPlan.name})`,
          amount: `+${selectedPlan.price}€`,
          type: 'in'
        };

        const updatedLogs = [newLog, ...logs];
        localStorage.setItem('capten_cagnotte_logs_v3', JSON.stringify(updatedLogs));

        // Add to top contributors if needed
        const storedContributors = localStorage.getItem('capten_cagnotte_contributors_v3');
        const contributors = storedContributors ? JSON.parse(storedContributors) : [];
        const newContributor = {
          name: contributorName,
          amount: `${selectedPlan.price}€`,
          img: ''
        };
        localStorage.setItem('capten_cagnotte_contributors_v3', JSON.stringify([newContributor, ...contributors]));

        // Trigger custom event to notify other tabs if any
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.warn("Could not save sponsor log locally:", e);
      }

      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setSelectedPlan(null);
        setContributorName('');
        setContributorEmail('');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#F4F5F7] flex flex-col items-center justify-center p-6 text-black">
      <div className="w-full max-w-[1000px] space-y-10 py-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#FF5C00] rounded-full animate-ping" />
            <span className="font-display italic font-black uppercase text-[15px] tracking-widest">CAPTEN B2B SPONSORING</span>
          </div>
          <h1 className="text-[32px] sm:text-[48px] font-display italic font-black uppercase leading-none text-black tracking-tight">
            DEVENIR PARTENAIRE DU CREW
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            Soutiens les activités de notre Social Run Club et touche une communauté engagée, locale et passionnée de running.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-6">
          {sponsorPlans.map((plan, idx) => (
            <div 
              key={idx} 
              className="bg-white border-[0.5px] border-[#E5E5E5] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 relative group overflow-hidden"
            >
              {plan.name === "Gold Sponsor" && (
                <div className="absolute top-0 right-0 bg-[#FF5C00] text-white text-[7.5px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-[12px]">
                  Recommandé
                </div>
              )}
              
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                    <h3 className="text-[18px] font-display italic font-black uppercase tracking-tight text-black">{plan.name}</h3>
                  </div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide leading-relaxed font-bold">{plan.desc}</p>
                </div>

                <div className="text-left border-b border-black/5 pb-4">
                  <span className="text-[36px] sm:text-[44px] font-display italic font-black text-black leading-none">{plan.price}€</span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mt-1">Paiement unique annuel</span>
                </div>

                <div className="space-y-3.5 text-left pt-2">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4.5 h-4.5 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] shrink-0 mt-0.5">
                        <Check size={10} strokeWidth={4} />
                      </div>
                      <span className="text-[10.5px] font-bold text-neutral-800 uppercase tracking-tight leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3.5 rounded-[10px] text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2 
                    ${plan.name === "Gold Sponsor" 
                      ? 'bg-[#FF5C00] text-white hover:bg-black shadow-lg shadow-orange-500/10' 
                      : 'bg-black text-white hover:bg-neutral-800'}`}
                >
                  DEVENIR PARTENAIRE <ArrowRight size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STRIPE SECURE MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setSelectedPlan(null)} />
          
          <div className="relative bg-white border-[0.5px] border-[#E5E5E5] w-full max-w-[460px] mx-auto rounded-[24px] shadow-2xl overflow-hidden z-10 flex flex-col animate-scale-up text-black">
            <header className="px-8 py-6 border-b-[0.5px] border-[#E5E5E5] flex justify-between items-center bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#635BFF] text-white p-1.5 rounded-[6px]">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="text-[14px] font-black uppercase text-black leading-none tracking-wider">STRIPE SECURE CHECKOUT</h3>
                  <span className="text-[8px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-1 block">SPONSORISATION SÉCURISÉE B2B</span>
                </div>
              </div>
              {!isProcessing && (
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#A3A3A3] hover:text-black transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </header>

            {isSuccess ? (
              <div className="p-10 text-center space-y-4 animate-scale-up">
                <div className="w-16 h-16 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] mx-auto animate-bounce">
                  <CheckCircle2 size={36} strokeWidth={3} />
                </div>
                <h4 className="text-[20px] font-display italic font-black uppercase text-black">PARTENARIAT ENREGISTRÉ !</h4>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-relaxed">
                  Merci ! Votre pack <span className="text-black">{selectedPlan.name}</span> a été validé. Le capitaine a été notifié.
                </p>
              </div>
            ) : (
              <div className="p-8 space-y-5">
                <div className="bg-[#F8F9FA] rounded-[12px] p-5 border-[0.5px] border-black/5 space-y-3">
                  <div className="flex justify-between items-center border-b border-black/5 pb-2.5">
                    <div>
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest">FORMULE B2B</p>
                      <p className="text-[13px] font-black text-black">{selectedPlan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[18px] font-display italic font-black text-black">{selectedPlan.price}€</p>
                      <p className="text-[7.5px] font-bold text-[#A3A3A3] uppercase tracking-wider">Paiement unique</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Nom de l&apos;entreprise / Marque *</label>
                    <input 
                      type="text" 
                      required 
                      value={contributorName} 
                      onChange={e => setContributorName(e.target.value)} 
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-black" 
                      placeholder="Ex: Nike Running Paris"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Adresse E-mail de contact *</label>
                    <input 
                      type="email" 
                      required 
                      value={contributorEmail} 
                      onChange={e => setContributorEmail(e.target.value)} 
                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-black" 
                      placeholder="Ex: marketing@nike.com"
                    />
                  </div>
                </div>

                <button
                  onClick={handleConfirmSponsor}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#635BFF] text-white rounded-[10px] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#453FBA] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      REDIRECTION STRIPE...
                    </>
                  ) : (
                    `LANCER LA SOUSCRIPTION VIA STRIPE`
                  )}
                </button>

                <p className="text-[7.5px] font-bold text-[#A3A3A3] uppercase tracking-wider text-center">
                  Simulation Stripe Checkout Sécurisée · Aucun débit réel.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
