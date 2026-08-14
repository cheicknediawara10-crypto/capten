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
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status
    const checkLogin = async () => {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          setIsLoggedIn(!!user);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkLogin();

    // Assign A/B test variant
    let assigned = localStorage.getItem('capten_signup_variant') as 'A' | 'B';
    if (!assigned || !['A', 'B'].includes(assigned)) {
      assigned = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem('capten_signup_variant', assigned);
    }
    setVariant(assigned);

    // Track pricing view
    fetch('/api/ab-test/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant: assigned, page: 'pricing' }),
    }).catch(err => console.error('Error tracking view:', err));
  }, []);

  const handleCancelSubscription = async () => {
    const confirmMessage = "Voulez-vous vraiment résilier votre abonnement CAPTEN ? Vous perdrez l'accès immédiat aux fonctionnalités avancées (check-in GPS, membres illimités, registre légal) et repasserez en formule gratuite.";

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
        price: planNameParam === 'CAPTEN' ? (billingInterval === 'yearly' ? '299€' : '29,99€') : '0€',
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

  const handleUpgradePlan = async (plan: any) => {
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
      setProcessingPlan(plan.name);
      setIsProcessing(true);
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'plan',
            planName: plan.name,
            billingInterval: billingInterval,
          }),
        });

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert(data.error || 'Erreur de redirection vers Stripe.');
          setIsProcessing(false);
          setProcessingPlan(null);
        }
      } catch (err) {
        console.error(err);
        alert('Erreur serveur lors de la connexion à Stripe.');
        setIsProcessing(false);
        setProcessingPlan(null);
      }
    }
  };

  const handleConfirmUpgrade = async () => {
    if (selectedPlan) {
      await handleUpgradePlan(selectedPlan);
    }
  };

  const displayPlans = [
    {
      name: "GRATUIT",
      price: "0€",
      period: "/mois",
      billingNote: "",
      desc: "Pour lancer ton crew.",
      features: [
        { t: "1 run par mois", d: "", included: true },
        { t: "20 membres max", d: "", included: true },
        { t: "Fiches ICE & décharges", d: "", included: true },
      ],
      button: currentPlan === "GRATUIT" ? "PLAN ACTUEL" : "COMMENCER GRATUITEMENT",
      type: currentPlan === "GRATUIT" ? "current" : "action"
    },
    {
      name: "CAPTEN",
      price: "29,99€",
      period: "/mois",
      billingNote: "",
      desc: "Tout, sans limite.",
      tag: "Populaire",
      features: [
        { t: "Membres & runs illimités", d: "", included: true },
        { t: "Check-in GPS natif", d: "", included: true },
        { t: "WhatsApp automatisé", d: "", included: true },
        { t: "Les Spots du Crew", d: "", included: true },
        { t: "Registre légal (PDF/CSV)", d: "", included: true },
        { t: "Support prioritaire", d: "", included: true },
      ],
      button: currentPlan === "CAPTEN" ? "PLAN ACTUEL" : "Passer à Captain Pro",
      type: currentPlan === "CAPTEN" ? "current" : "action"
    }
  ];

  return (
    <div className="space-y-10 pb-20 px-4 sm:px-0">
      {/* HEADER */}
      <header className="pb-6 border-b border-[color:var(--app-border)]">
        <h1 className="text-[30px] sm:text-[42px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tight">
          Abonnement
        </h1>
        <p className="text-[13px] text-[color:var(--app-text-muted)] mt-2">Ton plan Capten et ta facturation.</p>
      </header>

      {/* PRICING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
        {displayPlans.map((plan, idx) => {
          const isCapten = plan.name === "CAPTEN";
          const isCurrent = plan.name === currentPlan;

          return (
            <div
              key={idx}
              className="relative w-full rounded-3xl p-7 sm:p-9 flex flex-col justify-between h-full overflow-hidden"
              style={isCapten
                ? { background: 'linear-gradient(160deg, #FF6A1A, #E04B00)' }
                : { background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
            >
              {plan.tag && (
                <div className="absolute top-5 right-5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 text-white z-10 whitespace-nowrap">
                  <Sparkles size={10} /> {plan.tag}
                </div>
              )}

              <div className="space-y-7">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className={`text-[22px] font-display italic font-black uppercase tracking-tight ${isCapten ? 'text-white' : 'text-[color:var(--app-text)]'}`}>
                      {plan.name === 'CAPTEN' ? 'CAPTEN PRO' : 'CAPTEN GRATUIT'}
                    </h3>
                    {isCurrent && (
                      <span className={`shrink-0 text-[8px] font-black px-2.5 py-0.5 rounded-full tracking-widest ${isCapten ? 'bg-white/20 text-white' : 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/25'}`}>
                        PLAN ACTUEL
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                       <span className={`text-[40px] sm:text-[48px] font-display italic font-black leading-none ${isCapten ? 'text-white' : 'text-[color:var(--app-text)]'}`}>{plan.price}</span>
                       {plan.period && <span className={`text-[12px] sm:text-[14px] font-bold uppercase ${isCapten ? 'text-white/70' : 'text-[color:var(--app-text-muted)]'}`}>{plan.period}</span>}
                    </div>
                    {plan.billingNote && (
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isCapten ? 'text-white/85' : 'text-[#FF5C00]'}`}>
                        {plan.billingNote}
                      </p>
                    )}
                  </div>
                </div>

                <p className={`text-[12px] leading-relaxed text-left ${isCapten ? 'text-white/85' : 'text-[color:var(--app-text-muted)]'}`}>
                  {plan.desc}
                </p>

                <div className={`space-y-3.5 pt-6 border-t ${isCapten ? 'border-white/20' : 'border-[color:var(--app-border)]'}`}>
                  {plan.features.map(({ t, d, included }, i) => (
                    <div key={i} className={`flex items-start gap-3 text-left ${!included ? 'opacity-45' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isCapten
                          ? 'bg-white/20 text-white'
                          : included
                            ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/25'
                            : 'bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)] border border-[color:var(--app-border)]'
                      }`}>
                        {included ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          <Lock size={10} strokeWidth={2.5} />
                        )}
                      </div>
                      <div>
                        <div className={`text-[12px] font-bold leading-tight ${isCapten ? 'text-white' : included ? 'text-[color:var(--app-text)]' : 'text-[color:var(--app-text-muted)]'}`}>
                          {t}
                        </div>
                        {d && (
                          <div className={`text-[11px] font-medium leading-normal mt-1 whitespace-pre-line ${isCapten ? 'text-white/70' : 'text-[color:var(--app-text-muted)]'}`}>
                            {d}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                {isLoggedIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => !isCurrent && handleUpgradePlan(plan)}
                      disabled={isCurrent || isProcessing}
                      className={`w-full py-4 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer active:scale-95 disabled:scale-100 disabled:cursor-default ${
                        isCurrent
                          ? (isCapten ? 'bg-white/20 text-white' : 'bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)]')
                          : isCapten
                            ? 'bg-white text-[#E04B00] hover:bg-white/90'
                            : 'bg-[#FF5C00] text-white hover:bg-[#E04B00]'
                      }`}
                    >
                      {isProcessing && processingPlan === plan.name ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
                        className="w-full mt-4 text-[10px] font-black text-white/80 hover:text-white hover:underline uppercase tracking-wider transition-all cursor-pointer text-center bg-transparent border-none outline-none"
                      >
                        Résilier mon abonnement Capten →
                      </button>
                    )}
                  </>
                ) : (
                  /* Guest Visitor / Signup funnel */
                  <>
                    {plan.name === 'GRATUIT' ? (
                      variant === 'A' ? (
                        <Link
                          href="/login?mode=signup&variant=A"
                          className="w-full text-center py-4 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all bg-[#FF5C00] text-white hover:bg-[#E04B00] block cursor-pointer"
                        >
                          COMMENCER GRATUITEMENT
                        </Link>
                      ) : (
                        <div className="text-center py-4">
                          <Link
                            href="/login?mode=signup&variant=B&free=true"
                            className="text-[11px] font-black text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-all uppercase tracking-wider underline cursor-pointer"
                          >
                            ou continuer avec le plan gratuit
                          </Link>
                        </div>
                      )
                    ) : (
                      <div className="space-y-3 text-center">
                        <Link
                          href="/login?mode=signup&upgrade=true"
                          className="w-full text-center py-4 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all bg-white text-[#E04B00] hover:bg-white/90 block cursor-pointer"
                        >
                          {billingInterval === 'yearly' ? "ACTIVER LE PLAN ANNUEL" : "ESSAI 21 JOURS GRATUIT — ACCÈS COMPLET"}
                        </Link>
                        <Link
                          href="/login?mode=signup&free=true"
                          className="text-[10px] font-bold text-white/70 hover:text-white transition-all uppercase tracking-wider underline block pt-1 cursor-pointer"
                        >
                          ou continuer avec le plan gratuit
                        </Link>
                      </div>
                    )}
                  </>
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
