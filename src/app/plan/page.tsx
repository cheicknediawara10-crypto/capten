'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Check, Lock, Sparkles, X, CreditCard, ShieldCheck, HelpCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function PlanPage() {
  const { refreshClub } = useAuth();
  const [currentPlan, setCurrentPlan] = useState("GRATUIT");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const [profile, setProfile] = useState<any>({
    stripe_subscription_status: 'inactive',
    subscription_ends_at: null
  });

  const handleCancelSubscription = async () => {
    const confirmMessage = "Voulez-vous vraiment résilier votre abonnement CAPTEN ? Vous perdrez l'accès immédiat aux fonctionnalités avancées (Copilote, Cagnotte, Messages auto) et repasserez en formule gratuite.";

    if (confirm(confirmMessage)) {
      setIsProcessing(true);
      try {
        localStorage.setItem('capten_plan', 'GRATUIT');
        setCurrentPlan('GRATUIT');
        setProfile((prev: any) => ({
          ...prev,
          stripe_subscription_status: 'canceled'
        }));
        
        const supabase = getSupabase();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('profiles')
              .update({ stripe_subscription_status: 'canceled' })
              .eq('id', user.id);

            await supabase
              .from('clubs')
              .update({ 
                stripe_plan: 'GRATUIT',
                stripe_subscription_status: 'inactive' 
              })
              .eq('id', user.id);
          }
        }
        
        // Remove mock trial expiration
        document.cookie = "capten_mock_trial_expired=false; path=/; max-age=31536000";
        document.cookie = "capten_plan=GRATUIT; path=/; max-age=31536000";

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('capten_branding_change'));
        }
        await refreshClub();

        alert("Ton abonnement a été résilié. Tu es repassé en formule gratuite.");
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la résiliation.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    const loadSupabaseProfile = async () => {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            if (user.email?.toLowerCase() === 'cheicknediawara10@gmail.com') {
              setCurrentPlan('CAPTEN');
              localStorage.setItem('capten_plan', 'CAPTEN');
              document.cookie = "capten_plan=CAPTEN; path=/; max-age=31536000";
              setProfile({
                stripe_subscription_status: 'active',
                subscription_ends_at: '2099-12-31'
              });
              return;
            }
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            if (prof) {
              setProfile(prof);
            }
            
            const { data: club } = await supabase
              .from('clubs')
              .select('stripe_plan')
              .eq('id', user.id)
              .maybeSingle();
            if (club?.stripe_plan) {
              setCurrentPlan(club.stripe_plan);
              localStorage.setItem('capten_plan', club.stripe_plan);
              document.cookie = `capten_plan=${club.stripe_plan}; path=/; max-age=31536000`;
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile in PlanPage:", err);
      }
    };
    loadSupabaseProfile();
  }, []);

  useEffect(() => {
    const checkVipAndParams = async () => {
      const supabase = getSupabase();
      let isVip = false;
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email?.toLowerCase() === 'cheicknediawara10@gmail.com') {
          isVip = true;
        }
      }

      if (isVip) {
        setCurrentPlan('CAPTEN');
        localStorage.setItem('capten_plan', 'CAPTEN');
        document.cookie = "capten_plan=CAPTEN; path=/; max-age=31536000";
        return;
      }

      const saved = localStorage.getItem('capten_plan');
      if (saved) {
        setCurrentPlan(saved);
      } else {
        localStorage.setItem('capten_plan', 'GRATUIT');
        setCurrentPlan('GRATUIT');
      }
    };

    checkVipAndParams();

    // Capture Stripe redirection success
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const sessionId = params.get('session_id');
    const success = params.get('success');
    const planNameParam = params.get('planName');

    if (success === 'true' && sessionId && planNameParam) {
      const mockPlan = {
        name: planNameParam,
        price: planNameParam === 'CAPTEN' ? (billingInterval === 'yearly' ? '499€' : '49,99€') : '0€',
        period: billingInterval === 'yearly' ? '/an' : '/mois',
      };
      setSelectedPlan(mockPlan);
      setIsProcessing(true);

      // Verify payment with Stripe backend
      fetch(`/api/stripe/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (data.verified) {
            setIsProcessing(false);
            setIsSuccess(true);
            setCurrentPlan('CAPTEN');
            localStorage.setItem('capten_plan', 'CAPTEN');
            document.cookie = "capten_plan=CAPTEN; path=/; max-age=31536000";

            // Clean up the URL parameters
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            await refreshClub();

            setTimeout(() => {
              setIsSuccess(false);
              setSelectedPlan(null);
            }, 3000);
          } else {
            alert('La vérification de paiement a échoué.');
            setIsProcessing(false);
            setSelectedPlan(null);
          }
        })
        .catch((err) => {
          console.error(err);
          alert('Erreur réseau lors de la vérification.');
          setIsProcessing(false);
          setSelectedPlan(null);
        });
    }
  }, [billingInterval]);

  const handleUpgradePlan = (plan: any) => {
    if (plan.name === "GRATUIT") {
      setProcessingPlan("GRATUIT");
      setIsProcessing(true);
      setTimeout(async () => {
        setIsProcessing(false);
        setProcessingPlan(null);
        setIsSuccess(true);
        setCurrentPlan("GRATUIT");
        localStorage.setItem('capten_plan', 'GRATUIT');
        document.cookie = "capten_plan=GRATUIT; path=/; max-age=31536000";
        await refreshClub();
        setTimeout(() => {
          setIsSuccess(false);
        }, 1500);
      }, 800);
    } else {
      setSelectedPlan(plan);
    }
  };

  const handleConfirmUpgrade = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          planName: selectedPlan.name,
          billingInterval: billingInterval,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Erreur de redirection vers Stripe.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur lors de la connexion à Stripe.');
      setIsProcessing(false);
    }
  };

  const displayPlans = [
    {
      name: "GRATUIT",
      price: "0€",
      period: "",
      billingNote: "Pour lancer ton crew.",
      desc: "Idéal pour les petits crews qui démarrent et veulent tester l'infrastructure.",
      features: [
        { t: "Page publique du crew", d: "Inscriptions rapides en 1 lien partagé.", included: true },
        { t: "1 run actif à la fois", d: "Planification standard.", included: true },
        { t: "Fiche d'urgence de base", d: "Sécurité et contacts d'urgence.", included: true },
        { t: "Jusqu'à 25 membres actifs", d: "Coureurs ayant participé aux 60 derniers jours.", included: true },
        { t: "Messages auto WhatsApp", d: "Modèles de messages intelligents verrouillés.", included: false },
        { t: "Cagnotte de Squad", d: "Soutien et after-runs verrouillés.", included: false },
        { t: "Le Copilote IA", d: "Assistant d'entraînement personnel verrouillé.", included: false },
        { t: "Runs illimités", d: "Historiques et planifications multiples verrouillés.", included: false }
      ],
      button: currentPlan === "GRATUIT" ? "PLAN ACTUEL" : "COMMENCER GRATUITEMENT",
      type: currentPlan === "GRATUIT" ? "current" : "action"
    },
    {
      name: "CAPTEN",
      price: billingInterval === 'monthly' ? "49,99€" : "41,58€",
      period: "/mois",
      billingNote: billingInterval === 'yearly' ? "Facturé 499€/an (2 mois offerts)" : "Facturé mensuellement",
      desc: "Le cockpit de pilotage ultime pour structurer ton crew et le faire grandir comme un pro.",
      tag: billingInterval === 'yearly' ? "RECOMMANDÉ — 2 MOIS OFFERTS" : "RECOMMANDÉ (SANS ENGAGEMENT)",
      features: [
        { t: "Page publique du crew", d: "Inscriptions rapides en 1 lien partagé.", included: true },
        { t: "Runs illimités", d: "Planifie autant de sorties simultanées que tu veux.", included: true },
        { t: "Fiche d'urgence de base", d: "Sécurité et contacts d'urgence.", included: true },
        { t: "Membres actifs illimités", d: "Aucune limite de croissance pour ton club.", included: true },
        { t: "Messages auto WhatsApp", d: "Génère des templates de diffusion parfaits en 1 clic.", included: true },
        { t: "Cagnotte de Squad", d: "Collecte de dons sans commission (Sumeria, PayPal...).", included: true },
        { t: "Le Copilote IA", d: "Briefing crew météo/présence quotidien + création de séances.", included: true }
      ],
      button: currentPlan === "CAPTEN" ? "PLAN ACTUEL" : (billingInterval === 'yearly' ? "ACTIVER LE PLAN ANNUEL" : "PASSER À CAPTEN"),
      type: currentPlan === "CAPTEN" ? "current" : "action"
    }
  ];

  return (
    <div className="space-y-12 pb-20 px-4 sm:px-0">
      {/* HARMONIZED HEADER */}
      <header className="flex flex-col gap-3 pb-8 border-b-[1px] border-black/5 mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
            <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tight">
              PLAN & INFRASTRUCTURE
            </h1>
          </div>
        </div>
      </header>

      {/* BILLING TOGGLE */}
      <div className="flex justify-center items-center gap-4 mb-4 bg-white/60 border border-black/5 rounded-[12px] p-4 max-w-[480px] mx-auto shadow-sm">
        <button 
          type="button"
          onClick={() => setBillingInterval('monthly')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-[6px] transition-all cursor-pointer ${billingInterval === 'monthly' ? 'bg-black text-white' : 'bg-transparent text-neutral-400 hover:text-black'}`}
        >
          Mensuel
        </button>
        <button 
          type="button"
          onClick={() => setBillingInterval('yearly')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-[6px] transition-all cursor-pointer flex items-center gap-2 ${billingInterval === 'yearly' ? 'bg-black text-white' : 'bg-transparent text-neutral-400 hover:text-black'}`}
        >
          Annuel
          <span className="bg-[#FF5C00] text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest">
            -17% (2 MOIS OFFERTS)
          </span>
        </button>
      </div>

      {/* PRICING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {displayPlans.map((plan, idx) => {
          const isCapten = plan.name === "CAPTEN";
          const isCurrent = plan.name === currentPlan;
          
          return (
            <div 
              key={idx} 
              className={`relative bg-white border w-full rounded-[24px] p-6 sm:p-10 flex flex-col justify-between shadow-lg transition-all h-full ${
                isCapten 
                  ? 'border-[#FF5C00] ring-1 ring-[#FF5C00]/20' 
                  : 'border-[#E5E5E5]'
              } ${isCurrent ? 'border-black ring-2 ring-black/10' : ''}`}
            >
              {plan.tag && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF5C00] text-white text-[9px] font-black px-5 py-1.5 rounded-full tracking-widest z-10 whitespace-nowrap">
                  {plan.tag}
                </div>
              )}
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[24px] font-display italic font-black uppercase text-black tracking-tight">
                      CAPTEN {plan.name}
                    </h3>
                    {isCurrent && (
                      <span className="text-[8px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full tracking-widest">
                        PLAN ACTUEL
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                       <span className="text-[40px] sm:text-[48px] font-display italic font-black text-black leading-none">{plan.price}</span>
                       {plan.period && <span className="text-[12px] sm:text-[14px] font-bold text-[#A3A3A3] uppercase">{plan.period}</span>}
                    </div>
                    {plan.billingNote && (
                      <p className="text-[9px] font-black text-[#FF5C00] uppercase tracking-wider mt-0.5">
                        {plan.billingNote}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-[12px] font-sans text-neutral-600 leading-relaxed text-left">
                  {plan.desc}
                </p>

                <div className="space-y-4 pt-6 border-t border-black/5">
                  {plan.features.map(({ t, d, included }, i) => (
                    <div key={i} className={`flex items-start gap-3 text-left ${!included ? 'opacity-40' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        included 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                      }`}>
                        {included ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          <Lock size={10} strokeWidth={2.5} />
                        )}
                      </div>
                      <div>
                        <div className={`text-[12px] font-bold leading-tight ${included ? 'text-black' : 'text-neutral-400'}`}>
                          {t}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium leading-normal mt-1 whitespace-pre-line">
                          {d}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 sm:pt-12">
                <button 
                  type="button"
                  onClick={() => !isCurrent && handleUpgradePlan(plan)}
                  disabled={isCurrent || isProcessing}
                  className={`w-full py-4 rounded-[10px] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer active:scale-95 disabled:scale-100 disabled:cursor-default ${
                    isCurrent 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : isCapten
                        ? 'bg-[#FF5C00] text-white shadow-lg shadow-orange-500/20 hover:bg-black'
                        : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  {isProcessing && processingPlan === plan.name ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ACTIVATION...
                    </div>
                  ) : (
                    plan.button
                  )}
                </button>
                {isCurrent && isCapten && (
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    className="w-full mt-4 text-[10px] font-black text-red-500 hover:text-red-700 hover:underline uppercase tracking-wider transition-all cursor-pointer text-center bg-transparent border-none outline-none"
                  >
                    Résilier mon abonnement Capten →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* STRIPE UPGRADE MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setSelectedPlan(null)} />
          
          <div className="relative bg-white border-[0.5px] border-[#E5E5E5] w-full max-w-[460px] mx-auto rounded-[24px] shadow-2xl overflow-hidden z-10 flex flex-col animate-fade-in text-black">
            {/* Stripe branded header */}
            <header className="px-8 py-6 border-b-[0.5px] border-[#E5E5E5] flex justify-between items-center bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#635BFF] text-white p-1.5 rounded-[6px]">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="text-[14px] font-black uppercase text-black leading-none tracking-wider">STRIPE SECURE CHECKOUT</h3>
                  <span className="text-[8px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-1 block">PAIEMENT SÉCURISÉ HTTPS</span>
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
                  <ShieldCheck size={32} strokeWidth={3} />
                </div>
                <h4 className="text-[20px] font-display italic font-black uppercase text-black">ABONNEMENT ACTIVÉ !</h4>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-relaxed">
                  Votre infrastructure CAPTEN a été mise à jour avec succès en formule <span className="text-black">{selectedPlan.name}</span>.
                </p>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                {/* Product summary */}
                <div className="bg-[#F8F9FA] rounded-[12px] p-5 border-[0.5px] border-black/5 space-y-3">
                  <div className="flex justify-between items-center border-b border-black/5 pb-2.5">
                    <div>
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest">ABONNEMENT</p>
                      <p className="text-[13px] font-black text-black">CAPTEN {selectedPlan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[18px] font-display italic font-black text-black">{selectedPlan.price}</p>
                      {selectedPlan.period && <p className="text-[7.5px] font-bold text-[#A3A3A3] uppercase tracking-wider">{selectedPlan.period}</p>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                    <span>Mise en service</span>
                    <span className="text-[#56E39F]">Immédiate</span>
                  </div>
                </div>

                {/* Redirect Information */}
                <div className="space-y-4 text-center py-4 text-xs font-medium text-neutral-600 leading-relaxed">
                  Tu vas être redirigé vers l'interface sécurisée de Stripe pour finaliser ton abonnement Capten.
                </div>

                {/* CTA */}
                <button
                  onClick={handleConfirmUpgrade}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#635BFF] text-white rounded-[10px] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#453FBA] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      REDIRECTION STRIPE...
                    </>
                  ) : (
                    `SOUSCRIRE AU PLAN ${selectedPlan.name} VIA STRIPE`
                  )}
                </button>

                <p className="text-[7.5px] font-bold text-[#A3A3A3] uppercase tracking-wider text-center">
                  Abonnement sécurisé en mode test Stripe. Aucun débit réel ne sera effectué.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
