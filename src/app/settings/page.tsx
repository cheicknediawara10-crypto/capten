'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Share2, Shield, Wallet, Users, Monitor, Globe, Bell, CheckCircle2, AlertTriangle, Plus, ArrowRight, Smartphone, Sliders, Sparkles, CreditCard, ExternalLink, Check, DollarSign } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [toast, setToast] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [whatsappStatus, setWhatsappStatus] = React.useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [whatsappPhone, setWhatsappPhone] = React.useState<string | null>(null);
  const [whatsappQr, setWhatsappQr] = React.useState<string | null>(null);
  const [showWhatsappModal, setShowWhatsappModal] = React.useState(false);
  const [isDemoMode, setIsDemoMode] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState("PRO");

  // Agnostic payments & Profiles states
  const [profile, setProfile] = React.useState<any>({
    stripe_subscription_status: 'trialing',
    subscription_ends_at: null
  });
  const [cagnotteUrl, setCagnotteUrl] = React.useState('');
  const [isSavingCagnotte, setIsSavingCagnotte] = React.useState(false);

  // New Interactive States for the Club Organizer
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = React.useState('#FF5C00');
  const [sosNumbers, setSosNumbers] = React.useState('17, 18, 112');
  const [safetyContact, setSafetyContact] = React.useState('+33 6 99 88 77 66 (Adjoint)');
  const [isSafeZoneActive, setIsSafeZoneActive] = React.useState(true);
  const [zeroPressureMode, setZeroPressureMode] = React.useState(true);
  const [autoRound, setAutoRound] = React.useState(true);
  const [showTeamModal, setShowTeamModal] = React.useState(false);
  const [coaches, setCoaches] = React.useState<Array<{name: string, email: string, role: string}>>([]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const fetchWhatsappStatus = async () => {
    try {
      const res = await fetch('/api/broadcast/whatsapp-status');
      const data = await res.json();
      if (data.success) {
        setWhatsappStatus(data.status);
        setIsDemoMode(!!data.demoMode);
        if (data.status === 'connected') {
          setWhatsappPhone(data.phone);
        } else {
          setWhatsappQr(data.qr);
        }
      } else {
        setWhatsappStatus('disconnected');
      }
    } catch (err) {
      console.error(err);
      setWhatsappStatus('disconnected');
    }
  };

  const handleDisconnectWhatsapp = async () => {
    if (confirm("Voulez-vous vraiment déconnecter votre compte WhatsApp de CAPTEN ? Les notifications automatiques ne seront plus envoyées.")) {
      try {
        const res = await fetch('/api/broadcast/whatsapp-status', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast("WHATSAPP DÉCONNECTÉ !");
          setWhatsappStatus('disconnected');
          setWhatsappPhone(null);
          fetchWhatsappStatus();
        } else {
          showToast("Erreur lors de la déconnexion.");
        }
      } catch (err) {
        showToast("Erreur réseau.");
      }
    }
  };

  React.useEffect(() => {
    // Load subscription plan
    const savedPlan = localStorage.getItem('capten_plan');
    if (savedPlan) {
      setCurrentPlan(savedPlan);
    } else {
      localStorage.setItem('capten_plan', 'PRO');
      setCurrentPlan('PRO');
    }

    // Load Local Settings
    const savedLogo = localStorage.getItem('capten_logo');
    if (savedLogo) setLogoUrl(savedLogo);

    const savedColor = localStorage.getItem('capten_primary_color');
    if (savedColor) setPrimaryColor(savedColor);

    const savedSos = localStorage.getItem('capten_sos_numbers');
    if (savedSos) setSosNumbers(savedSos);

    const savedSafety = localStorage.getItem('capten_safety_contact');
    if (savedSafety) setSafetyContact(savedSafety);

    const savedSafeZone = localStorage.getItem('capten_safezone_active');
    if (savedSafeZone !== null) setIsSafeZoneActive(savedSafeZone === 'true');

    const savedZeroPressure = localStorage.getItem('capten_zero_pressure');
    if (savedZeroPressure !== null) setZeroPressureMode(savedZeroPressure === 'true');

    const savedAutoRound = localStorage.getItem('capten_auto_round');
    if (savedAutoRound !== null) setAutoRound(savedAutoRound === 'true');

    const savedCagnotte = localStorage.getItem('capten_cagnotte_url');
    if (savedCagnotte) setCagnotteUrl(savedCagnotte);

    const savedCoaches = localStorage.getItem('capten_coaches');
    if (savedCoaches) {
      try {
        setCoaches(JSON.parse(savedCoaches));
      } catch (e) {
        setCoaches([
          { name: "Moi (Propriétaire)", email: "contact@capten.run", role: "Créateur" },
          { name: "Alexandre Dupont", email: "alex@capten.run", role: "Coach Principal" },
          { name: "Julie Martin", email: "julie@capten.run", role: "Meneuse d'Allure" }
        ]);
      }
    } else {
      const defaultCoaches = [
        { name: "Moi (Propriétaire)", email: "contact@capten.run", role: "Créateur" },
        { name: "Alexandre Dupont", email: "alex@capten.run", role: "Coach Principal" },
        { name: "Julie Martin", email: "julie@capten.run", role: "Meneuse d'Allure" }
      ];
      setCoaches(defaultCoaches);
      localStorage.setItem('capten_coaches', JSON.stringify(defaultCoaches));
    }

    const loadSupabaseData = async () => {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Fetch Stripe SaaS Profile
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            if (prof) {
              setProfile(prof);
            }

            // Fetch Club Cagnotte URL
            const { data: club } = await supabase
              .from('clubs')
              .select('cagnotte_url')
              .eq('id', user.id)
              .maybeSingle();
            if (club && club.cagnotte_url) {
              setCagnotteUrl(club.cagnotte_url);
            }
          }
        }
      } catch (e) {
        console.error("Error loading profile or club cagnotte:", e);
      }
    };
    loadSupabaseData();
    fetchWhatsappStatus();
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('capten_logo', logoUrl || '');
    localStorage.setItem('capten_primary_color', primaryColor);
    localStorage.setItem('capten_sos_numbers', sosNumbers);
    localStorage.setItem('capten_safety_contact', safetyContact);
    localStorage.setItem('capten_safezone_active', isSafeZoneActive.toString());
    localStorage.setItem('capten_zero_pressure', zeroPressureMode.toString());
    localStorage.setItem('capten_auto_round', autoRound.toString());
    localStorage.setItem('capten_cagnotte_url', cagnotteUrl);

    // Save cagnotte URL to Supabase
    const saveCagnotteToSupabase = async () => {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('clubs')
              .update({ cagnotte_url: cagnotteUrl })
              .eq('id', user.id);
          }
        }
      } catch (err) {
        console.error("Failed saving cagnotte_url:", err);
      }
    };
    saveCagnotteToSupabase();

    // Dispatch dynamic branding update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('capten_branding_change'));
    }

    setTimeout(() => {
      setIsSaving(false);
      showToast("SAUVEGARDE RÉUSSIE ! Tous les paramètres du club ont été enregistrés.");
    }, 1200);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
        localStorage.setItem('capten_logo', base64String);
        
        // Dispatch dynamic branding update event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('capten_branding_change'));
        }
        
        showToast("LOGO DU CLUB MIS À JOUR !");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelTrial = async () => {
    const isActiveSub = profile?.stripe_subscription_status === 'active';
    const confirmMessage = isActiveSub 
      ? "Voulez-vous vraiment résilier votre abonnement CAPTEN PRO ? Vous perdrez l'accès aux fonctionnalités premium et repasserez immédiatement en formule gratuite."
      : "Voulez-vous vraiment résilier votre essai CAPTEN PRO ? Vous perdrez l'accès aux fonctionnalités premium et repasserez immédiatement en formule gratuite.";

    if (confirm(confirmMessage)) {
      setIsSaving(true);
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

        const successMessage = isActiveSub ? "ABONNEMENT PRO RÉSILIÉ AVEC SUCCÈS !" : "ESSAI PRO RÉSILIÉ AVEC SUCCÈS !";
        showToast(successMessage);
      } catch (err) {
        console.error(err);
        showToast("Erreur lors de la résiliation.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRedirectToPortal = async () => {
    setIsSaving(true);
    showToast("REDIRECTION PORTAIL DE FACTURATION...");
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast("Impossible d'ouvrir le portail client Stripe.");
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur de connexion.");
      setIsSaving(false);
    }
  };

  const integrations = [
    { 
      name: "WHATSAPP AUTOMATION", 
      status: whatsappStatus === 'loading' ? 'CHARGEMENT' : (whatsappStatus === 'connected' ? 'CONNECTÉ' : 'DISPONIBLE'), 
      desc: whatsappStatus === 'connected' ? `Numéro : +${whatsappPhone}` : "Lier votre numéro WhatsApp direct", 
      color: "text-[#25D366]",
      action: () => setShowWhatsappModal(true)
    }
  ];

  const inputs = [
    { label: "Nom du club", key: "club_name", varTag: "{{club_name}}", type: "text" },
    { label: "Nom du run", key: "run_name", varTag: "{{run_name}}", type: "text" },
    { label: "Météo textuelle", key: "weather", varTag: "{{weather}}", type: "text" },
    { label: "URL check-in run", key: "run_url", varTag: "{{run_url}}", type: "text" },
    { label: "URL stats club", key: "stats_url", varTag: "{{stats_url}}", type: "text" },
  ];

  return (
    <div className="space-y-10 pb-20 px-4 sm:px-0">
      {/* HARMONIZED HEADER */}
      <header className="flex flex-col gap-3 pb-8 border-b-[0.5px] border-black/10 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
              <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tight">
                RÉGLAGES
              </h1>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto bg-black text-white px-5 py-3 rounded-[6px] text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FF5C00] transition-all cursor-pointer active:scale-95 disabled:bg-gray-400 shrink-0"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ENREGISTREMENT...
                </>
              ) : (
                "SAUVEGARDER LES PARAMÈTRES"
              )}
            </button>
          </div>
      </header>

      {/* SETTINGS GRID */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* BRANDING & IDENTITY */}
        <div className="col-span-12 md:col-span-4 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm">
           <div className="flex items-center gap-3 border-b-[0.5px] border-[#F4F5F7] pb-4">
              <Monitor size={18} className="text-[#D1D1D1]" />
              <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em] italic">TON CREW</h3>
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-6">
                 <label htmlFor="logo-upload" className="w-16 h-16 bg-[#F4F5F7] border-[0.5px] border-black/5 rounded-control flex items-center justify-center text-[#D1D1D1] shrink-0 cursor-pointer hover:border-[#FF5C00] hover:bg-black/5 overflow-hidden transition-all relative">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Logo Club" className="w-full h-full object-cover" />
                    ) : (
                      <Plus size={24} />
                    )}
                 </label>
                 <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={handleLogoChange} />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-black">LOGO DU CLUB</p>
                    <p className="text-[9px] font-medium text-[#A3A3A3] uppercase">Format PNG ou SVG (400px)</p>
                 </div>
              </div>
           </div>
        </div>

        {/* INTEGRATIONS HUB */}
        <div className="col-span-12 md:col-span-8 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm">
           <div className="flex items-center gap-3 border-b-[0.5px] border-[#F4F5F7] pb-4">
              <Share2 size={18} className="text-[#D1D1D1]" />
              <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em] italic">OUTILS CONNECTÉS</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WHATSAPP AUTOMATION CARD (GRAYED OUT / V2 PROMISE) */}
              <div className="p-4 bg-[#F4F5F7] border-[0.5px] border-black/5 rounded-card-inner flex justify-between items-center opacity-60 cursor-default select-none">
                 <div className="space-y-1">
                    <p className="text-[12px] font-display italic font-black uppercase text-[#A3A3A3]">WHATSAPP AUTOMATION</p>
                    <p className="text-[9px] font-medium text-[#A3A3A3] uppercase tracking-wider">L'automatisation WhatsApp arrive en V2.</p>
                 </div>
                 <span className="text-[9px] font-black italic tracking-widest text-[#A3A3A3]">
                    BIENTÔT
                 </span>
              </div>
           </div>
        </div>

        {/* SECURITY & SAFE ZONE */}
        <div className="col-span-12 md:col-span-6 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm">
           <div className="flex items-center gap-3 border-b-[0.5px] border-[#F4F5F7] pb-4">
              <Shield size={18} className="text-[#FF5C00]" />
              <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em] italic">SÉCURITÉ DU CREW</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-black">NUMÉROS SOS PRIORITAIRES</p>
                    <input 
                      type="text" 
                      value={sosNumbers}
                      onChange={(e) => setSosNumbers(e.target.value)}
                      className="w-full bg-[#F4F5F7] border border-black/5 rounded-control px-3 py-2 text-[12px] font-mono font-bold text-black focus:outline-none focus:border-[#FF5C00] focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00] transition-all"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-black">CONTACT D'URGENCE DE L'ORGANISATEUR</p>
                    <input 
                      type="text" 
                      value={safetyContact}
                      onChange={(e) => setSafetyContact(e.target.value)}
                      className="w-full bg-[#F4F5F7] border border-black/5 rounded-control px-3 py-2 text-[12px] font-mono font-bold text-black focus:outline-none focus:border-[#FF5C00] focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00] transition-all"
                    />
                 </div>
              </div>
              <div className="bg-[#F4F5F7] border border-black/5 rounded-card-inner p-5 flex flex-col justify-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF5C00]">
                    <AlertTriangle size={16} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-black">
                   NUMÉROS D'URGENCE
                 </p>
                 <p className="text-[10px] font-medium leading-relaxed text-[#6B6B63]">
                   Affichés sur ton portail d'inscription. Tes coureurs les voient avant chaque run.
                 </p>
              </div>
           </div>
        </div>

        {/* CAGNOTTE CONFIG */}
        <div className="col-span-12 md:col-span-6 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm">
           <div className="flex items-center gap-3 border-b-[0.5px] border-[#F4F5F7] pb-4">
              <Wallet size={18} className="text-[#FF5C00]" />
              <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em] italic">CAGNOTTE POST-RUN</h3>
           </div>
           <div className="space-y-4">
              <div className="space-y-2 text-left">
                 <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                    URL Cagnotte / Lien de Paiement
                 </label>
                 <input 
                   type="text" 
                   value={cagnotteUrl}
                   onChange={(e) => setCagnotteUrl(e.target.value)}
                   placeholder="https://sumeria.eu/collect/tonnom"
                   className="w-full bg-[#F4F5F7] border border-black/10 rounded-control px-3.5 py-2.5 text-[12px] font-mono font-bold text-black focus:outline-none focus:border-[#FF5C00] focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00] transition-all placeholder:text-neutral-450"
                 />
              </div>

              <div className="text-[9.5px] font-medium text-[#A3A3A3] leading-relaxed uppercase space-y-1 bg-[#F4F5F7]/30 border border-black/[0.03] p-3 rounded-card-inner text-left">
                 <p className="text-[8px] font-black text-neutral-400">Colle ici le lien de ta cagnotte ou de ton profil de paiement. Exemples acceptés :</p>
                 <p className="font-bold text-black/60 pt-0.5">• Sumeria → sumeria.eu/collect#tonnom</p>
                 <p className="font-bold text-black/60">• Revolut → revolut.me/tonnom</p>
                 <p className="font-bold text-black/60">• PayPal → paypal.me/tonnom</p>
              </div>

              <button 
                onClick={async () => {
                  setIsSavingCagnotte(true);
                  localStorage.setItem('capten_cagnotte_url', cagnotteUrl);
                  try {
                    const supabase = getSupabase();
                    if (supabase) {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase
                          .from('clubs')
                          .update({ cagnotte_url: cagnotteUrl })
                          .eq('id', user.id);
                        showToast("CAGNOTTE ENREGISTRÉE !");
                      }
                    } else {
                      showToast("CAGNOTTE ENREGISTRÉE LOCALEMENT !");
                    }
                  } catch (e) {
                    showToast("Erreur lors de la sauvegarde.");
                  } finally {
                    setIsSavingCagnotte(false);
                  }
                }}
                disabled={isSavingCagnotte}
                className="w-full bg-black text-white px-5 py-3.5 rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:bg-[#FF5C00] transition-all cursor-pointer active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isSavingCagnotte ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    SAUVEGARDE...
                  </>
                ) : (
                  "SAUVEGARDER LA CAGNOTTE"
                )}
              </button>
           </div>
        </div>

        {/* SUBSCRIPTION & ACCESS */}
        <div className="col-span-12 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between shadow-sm">
           <div className="flex items-center gap-6 text-left">
              <div className="w-12 h-12 bg-[#FF5C00]/10 rounded-control flex items-center justify-center text-[#FF5C00] shrink-0">
                 <CreditCard size={24} />
              </div>
              <div className="space-y-1">
                 <h4 className="text-[15px] sm:text-[16px] font-black uppercase text-black">
                   Mon Abonnement CAPTEN : <span className="text-[#FF5C00]">{currentPlan === 'PRO' ? (profile?.stripe_subscription_status === 'active' ? 'ACTIF PRO' : 'ESSAI EN COURS') : 'GRATUIT'}</span>
                 </h4>
                 <p className="text-[9px] sm:text-[10px] font-medium text-[#A3A3A3] uppercase tracking-widest leading-relaxed">
                   {currentPlan === 'PRO' 
                     ? (profile?.stripe_subscription_status === 'active' 
                       ? `Formule pro active • Facturation automatique active` 
                       : `Période d'essai gratuite active • 14 jours restants`)
                     : `Formule gratuite active • Fonctionnalités limitées`}
                 </p>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button 
                onClick={() => setShowTeamModal(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#F4F5F7] text-black text-[10px] font-black uppercase tracking-widest rounded-control hover:bg-black hover:text-white transition-all cursor-pointer text-center"
              >
                GÉRER L'ÉQUIPE
              </button>
              {currentPlan === 'PRO' && (
                <button 
                  onClick={handleCancelTrial}
                  className="w-full sm:w-auto px-6 py-3.5 bg-red-50 text-red-650 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-control transition-all cursor-pointer text-center"
                >
                  {profile?.stripe_subscription_status === 'active' ? "RÉSILIER L'ABONNEMENT" : "RÉSILIER L'ESSAI"}
                </button>
              )}
              <button 
                onClick={handleRedirectToPortal}
                className="w-full sm:w-auto px-6 py-3.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-control hover:bg-[#FF5C00] transition-all flex items-center justify-center cursor-pointer text-center"
              >
                GÉRER MON ABONNEMENT
              </button>
           </div>
        </div>

      </div>

      {/* TOAST NOTIFICATION OVERLAY */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 sm:px-8 py-4 rounded-card-outer border-[0.5px] border-white/20 shadow-2xl z-[300] flex items-center gap-3 animate-slide-up text-center w-[90%] max-w-[400px] justify-center">
          <CheckCircle2 size={16} className="text-[#56E39F] shrink-0" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{toast}</span>
        </div>
      )}

      {/* WHATSAPP CONNECTION MODAL */}
      {showWhatsappModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-card-outer max-w-[450px] w-full p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            {/* Glowing decorative border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#25D366] to-transparent animate-pulse" />

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-[18px] font-display italic font-black uppercase text-white tracking-wide">
                  INTÉGRATION WHATSAPP
                </h3>
                <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                  {isDemoMode ? "[MODE DÉMO] SIMULATEUR DE LIAISON" : "CONNEXION DIRECTE PAR CODE QR"}
                </p>
              </div>
              <button 
                onClick={() => setShowWhatsappModal(false)}
                className="text-white/40 hover:text-white transition-colors text-[18px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {whatsappStatus === 'connected' ? (
              <div className="space-y-6 py-4 text-center">
                <div className="w-16 h-16 bg-[#25D366]/10 border-[0.5px] border-[#25D366]/20 rounded-full flex items-center justify-center mx-auto text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.1)]">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-[16px] font-black text-white uppercase italic">
                    WHATSAPP LIÉ ET ACTIF !
                  </p>
                  <p className="text-[11px] font-mono text-white/60">
                    Numéro connecté : +{whatsappPhone}
                  </p>
                  {isDemoMode && (
                    <p className="text-[9px] font-medium text-[#FF5C00] uppercase tracking-wider bg-[#FF5C00]/10 py-1.5 px-3 rounded-control max-w-[300px] mx-auto">
                      Note : Vous êtes en mode démonstration.
                    </p>
                  )}
                </div>
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={fetchWhatsappStatus}
                    className="w-full py-3 border-[0.5px] border-white/10 hover:border-white/30 text-white rounded-control text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    ACTUALISER LE STATUT
                  </button>
                  <button
                    onClick={handleDisconnectWhatsapp}
                    className="w-full py-3 bg-[#FF0000]/10 border-[0.5px] border-[#FF0000]/20 hover:bg-[#FF0000] text-[#FF0000] hover:text-white rounded-control text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    DÉCONNECTER CET APPAREIL
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <p className="text-[11px] font-medium text-white/70 leading-relaxed uppercase tracking-wider text-left">
                  Pour connecter le WhatsApp du club, ouvrez WhatsApp sur votre téléphone :
                  <br /><span className="text-[#25D366] font-bold">Paramètres &gt; Appareils Connectés &gt; Lier un appareil</span>, puis scannez ce code.
                </p>

                <div className="bg-white p-4 rounded-card-inner w-56 h-56 mx-auto flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(37,211,102,0.15)] border-[0.5px] border-white/10">
                  {whatsappQr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={whatsappQr} 
                      alt="WhatsApp QR Code" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-black/20 border-t-[#25D366] rounded-full animate-spin" />
                      <p className="text-[9px] font-black text-black uppercase tracking-widest">GÉNÉRATION DU CODE...</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      fetchWhatsappStatus();
                      showToast("Vérification en cours...");
                    }}
                    className="flex-1 py-3 bg-[#25D366] text-black hover:bg-[#00E676] rounded-control text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                  >
                    VÉRIFIER LA CONNEXION
                  </button>
                  <button
                    onClick={() => setShowWhatsappModal(false)}
                    className="flex-1 py-3 border-[0.5px] border-white/10 hover:border-white/20 text-white rounded-control text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    FERMER
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEAM MANAGEMENT MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-card-outer max-w-[500px] w-full p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            {/* Glowing decorative border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5C00] to-transparent" />

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-[18px] font-display italic font-black uppercase text-white tracking-wide">
                  Gérer l'équipe des Coachs
                </h3>
                <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                  Membres autorisés à gérer le club et planifier les runs
                </p>
              </div>
              <button 
                onClick={() => setShowTeamModal(false)}
                className="text-white/40 hover:text-white transition-colors text-[18px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List of coaches */}
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {coaches.map((coach, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-control">
                  <div>
                    <p className="text-[12px] font-bold text-white">{coach.name}</p>
                    <p className="text-[10px] text-white/40">{coach.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono bg-[#FF5C00]/10 border border-[#FF5C00]/20 text-[#FF5C00] px-2 py-0.5 rounded uppercase">
                      {coach.role}
                    </span>
                    {coach.role !== "Créateur" && (
                      <button
                        onClick={() => {
                          const updated = coaches.filter((_, i) => i !== index);
                          setCoaches(updated);
                          localStorage.setItem('capten_coaches', JSON.stringify(updated));
                          showToast("MEMBRE RETIRÉ DE L'ÉQUIPE !");
                        }}
                        className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase transition-colors"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form to add coach */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const email = formData.get('email') as string;
                const role = formData.get('role') as string;
                if (!name || !email) return;

                const newCoach = { name, email, role };
                const updated = [...coaches, newCoach];
                setCoaches(updated);
                localStorage.setItem('capten_coaches', JSON.stringify(updated));
                showToast("NOUVEAU COACH INVITÉ !");
                e.currentTarget.reset();
              }}
              className="border-t border-white/10 pt-4 space-y-4"
            >
              <p className="text-[10px] font-black uppercase text-white/60 tracking-wider">Ajouter un membre à l'équipe</p>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Prénom & Nom"
                  required
                  className="bg-white/5 border border-white/10 rounded-control px-3 py-2 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-[#FF5C00] transition-all"
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Adresse Email"
                  required
                  className="bg-white/5 border border-white/10 rounded-control px-3 py-2 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-[#FF5C00] transition-all"
                />
              </div>
              <div className="flex gap-3 items-center">
                <select 
                  name="role"
                  defaultValue="Coach Principal"
                  className="flex-1 bg-white/5 border border-white/10 rounded-control px-3 py-2 text-[11px] text-white/80 focus:outline-none focus:border-[#FF5C00] transition-all cursor-pointer"
                >
                  <option value="Coach Principal" className="bg-[#0A0A0C] text-white">Coach Principal</option>
                  <option value="Meneur d'Allure" className="bg-[#0A0A0C] text-white">Meneur d'Allure</option>
                  <option value="Co-Organisateur" className="bg-[#0A0A0C] text-white">Co-Organisateur</option>
                </select>
                <button 
                  type="submit"
                  className="bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white px-5 py-2 rounded-control text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                >
                  AJOUTER
                </button>
              </div>
            </form>

            <div className="pt-2">
              <button
                onClick={() => setShowTeamModal(false)}
                className="w-full py-3 border-[0.5px] border-white/10 hover:border-white/20 text-white rounded-control text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                FERMER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
