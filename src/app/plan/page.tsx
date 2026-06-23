'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Zap, Shield, Users, MessageSquare, Download, Headphones, Star, X, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function PlanPage() {
  const [currentPlan, setCurrentPlan] = useState("PRO");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const [profile, setProfile] = useState<any>({
    stripe_subscription_status: 'trialing',
    subscription_ends_at: null
  });

  const handleCancelTrial = async () => {
    const isActiveSub = profile?.stripe_subscription_status === 'active';
    const confirmMessage = isActiveSub 
      ? "Voulez-vous vraiment résilier votre abonnement CAPTEN PRO ? Vous perdrez l'accès aux fonctionnalités premium et repasserez immédiatement en formule gratuite."
      : "Voulez-vous vraiment résilier votre essai CAPTEN PRO ? Vous perdrez l'accès aux fonctionnalités premium et repasserez immédiatement en formule gratuite.";

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
              .update({ stripe_subscription_status: 'inactive' })
              .eq('id', user.id);
          }
        }
        
        // Set mock trial expiration cookie
        document.cookie = "capten_mock_trial_expired=true; path=/; max-age=31536000";

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('capten_branding_change'));
        }

        const alertMessage = isActiveSub 
          ? "Votre abonnement PRO a été résilié. Vous êtes repassé en formule gratuite."
          : "Votre essai PRO a été résilié. Vous êtes repassé en formule gratuite.";
        alert(alertMessage);
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
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            if (prof) {
              setProfile(prof);
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
    const params = new URLSearchParams(window.location.search);
    if (params.get('trial_expired') === 'true') {
      setTrialExpired(true);
    }

    const saved = localStorage.getItem('capten_plan');
    if (saved) {
      setCurrentPlan(saved);
    } else {
      localStorage.setItem('capten_plan', 'PRO');
      setCurrentPlan('PRO');
    }

    // Capture Stripe redirection success
    const sessionId = params.get('session_id');
    const success = params.get('success');
    const planNameParam = params.get('planName');

    if (success === 'true' && sessionId && planNameParam) {
      const mockPlan = {
        name: planNameParam,
        price: planNameParam === 'PRO' ? (billingInterval === 'yearly' ? '399€' : '49,99€') : '49,99€',
        period: billingInterval === 'yearly' ? '/an' : '/mois',
      };
      setSelectedPlan(mockPlan);
      setIsProcessing(true);

      // Verify payment with Stripe backend
      fetch(`/api/stripe/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.verified && data.metadata?.planName === planNameParam) {
            setIsProcessing(false);
            setIsSuccess(true);
            setCurrentPlan(planNameParam);
            localStorage.setItem('capten_plan', planNameParam);

            // Clean up the URL parameters
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

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
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingPlan(null);
        setIsSuccess(true);
        setCurrentPlan("GRATUIT");
        localStorage.setItem('capten_plan', 'GRATUIT');
        // Disable trial expiration mock if any
        document.cookie = "capten_mock_trial_expired=false; path=/; max-age=31536000";
        setTimeout(() => {
          setIsSuccess(false);
          // Redirect to settings page after successful activation
          window.location.href = '/settings';
        }, 1500);
      }, 1000);
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

  const plans = [
    {
      name: "PRO",
      price: billingInterval === 'monthly' ? "49,99€" : "39,99€",
      period: "/mois",
      billingNote: billingInterval === 'yearly' ? "Facturé 399€/an (2 mois offerts)" : "Facturé mensuellement",
      tag: billingInterval === 'yearly' ? "OFFRE ANNUELLE — 2 MOIS OFFERTS" : "14 JOURS D'ESSAI GRATUIT (SANS ENGAGEMENT)",
      desc: "La solution de pilotage ultime pour votre Run Club. Zéro charge mentale logistique.",
      features: [
        { t: "Tes coureurs s'inscrivent seuls.", d: "Tu ne touches à rien." },
        { t: "Si quelqu'un tombe ce soir :", d: "groupe sanguin, allergies, qui appeler.\nEn 2 secondes." },
        { t: "Il se comporte mal.", d: "Il a signé avant d'entrer.\nTu peux l'exclure maintenant." },
        { t: "50 check-ins. Simultanés.", d: "Toi tu cours déjà." },
        { t: "Le message du soir.", d: "1 clic. Tu colles dans WhatsApp.\nC'est tout." },
        { t: "La météo s'intègre automatiquement.", d: "Ton message s'adapte tout seul." },
        { t: "Le café post-run.", d: "Tes coureurs contribuent.\nCapten prend 0%." },
        { t: "Ton crew grandit.", d: "Le prix, lui, ne bouge pas." }
      ],
      button: currentPlan === "PRO" ? "VOTRE PLAN ACTUEL" : (billingInterval === 'yearly' ? "ACTIVER LE PLAN ANNUEL" : "COMMENCER L'ESSAI GRATUIT DE 14 JOURS"),
      type: currentPlan === "PRO" ? "current" : "upgrade"
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
      <div className="flex justify-center items-center gap-4 mb-4 bg-white/5 border border-black/5 rounded-[12px] p-4 max-w-[480px] mx-auto shadow-sm">
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

      {trialExpired && (
        <div className="bg-[#FFF5F5] border border-[#FF5C00]/20 rounded-xl p-5 flex items-start gap-4 animate-scale-up max-w-[480px] mx-auto">
          <AlertCircle size={20} className="text-[#FF5C00] shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <h4 className="text-xs font-mono font-black uppercase text-[#FF5C00] leading-none">PÉRIODE D'ESSAI EXPIRÉE</h4>
            <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide leading-relaxed pt-1">
              Votre période d'essai gratuit de 14 jours est terminée. Veuillez souscrire à l'abonnement CAPTEN PRO ci-dessous pour continuer à utiliser toutes les fonctionnalités de CAPTEN.
            </p>
          </div>
        </div>
      )}

      {/* PRICING GRID */}
      <div className="grid grid-cols-1 gap-8 max-w-[480px] mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <div key={idx} className={`relative bg-white border-[0.5px] w-full ${plan.name === currentPlan ? 'border-black ring-1 ring-black shadow-md' : 'border-[#FF5C00]'} rounded-[16px] p-6 sm:p-10 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all h-full`}>
            {plan.tag && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF5C00] text-white text-[9px] font-black px-5 py-1.5 rounded-full tracking-widest z-10 whitespace-nowrap">
                {plan.tag}
              </div>
            )}
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-[22px] sm:text-[24px] font-display italic font-black uppercase text-black tracking-tight">CAPTEN {plan.name}</h3>
                  {plan.name === currentPlan && <span className="text-[9px] font-black text-[#56E39F] bg-[#56E39F]/10 px-2.5 py-0.5 rounded-full tracking-widest">PLAN ACTUEL</span>}
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

              <p className="text-[11px] sm:text-[12px] font-medium text-[#737373] leading-relaxed uppercase tracking-wide">
                {plan.desc}
              </p>

              <div className="space-y-4 pt-4 border-t border-black/5">
                {plan.features.map(({ t, d }, i) => (
                  <div key={i} className="flex items-start gap-3 text-left">
                    <div className="w-5 h-5 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-black leading-tight">{t}</div>
                      <div className="text-[11px] text-neutral-500 font-medium leading-normal mt-1 whitespace-pre-line">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 sm:pt-12">
              <button 
                type="button"
                onClick={() => plan.name !== currentPlan && handleUpgradePlan(plan)}
                disabled={(plan.name === currentPlan) || isProcessing}
                className={`w-full py-4 rounded-[10px] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer active:scale-95 disabled:scale-100 disabled:cursor-default
                  ${plan.name === currentPlan 
                    ? 'bg-[#56E39F]/10 text-[#56E39F] border-[0.5px] border-[#56E39F]/20' 
                    : 'bg-[#FF5C00] text-white shadow-lg shadow-orange-500/20 hover:bg-black'}
                `}
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
              {currentPlan === 'PRO' && (
                <button
                  type="button"
                  onClick={handleCancelTrial}
                  className="w-full mt-4 text-[10px] font-black text-red-500 hover:text-red-750 hover:underline uppercase tracking-wider transition-all cursor-pointer text-center bg-transparent border-none outline-none"
                >
                  {profile?.stripe_subscription_status === 'active' ? "Résilier mon abonnement →" : "Résilier mon essai gratuit →"}
                </button>
              )}
            </div>
          </div>
        ))}
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
                <h4 className="text-[20px] font-display italic font-black uppercase text-black">PAIEMENT CONFIRMÉ !</h4>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-relaxed">
                  Votre infrastructure CAPTEN a été mise à jour en mode <span className="text-black">{selectedPlan.name}</span>.
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
                <div className="space-y-4 text-center py-4">
                  <p className="text-[12px] font-medium text-[#737373] uppercase tracking-wider">
                    Vous allez être redirigé vers l'interface de paiement sécurisée de Stripe pour finaliser votre abonnement.
                  </p>
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
                      VÉRIFICATION / REDIRECTION STRIPE...
                    </>
                  ) : (
                    `SOUSCRIRE AU PLAN ${selectedPlan.name} VIA STRIPE`
                  )}
                </button>

                <p className="text-[7.5px] font-bold text-[#A3A3A3] uppercase tracking-wider text-center">
                  Abonnement sécurisé en mode test Stripe. Aucun frais réel ne sera appliqué.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
