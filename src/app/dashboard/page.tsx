'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, MapPin, Wallet, Zap, MessageSquare, ArrowRight, Plus, Trophy, Activity, Globe, Heart, Flame, CheckCircle2, RefreshCw } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

// === HELPERS MÉTÉO ===
function getCoordinates(location: string): { latitude: number; longitude: number } {
  const loc = (location || '').toLowerCase();
  if (loc.includes('paris')) return { latitude: 48.8566, longitude: 2.3522 };
  if (loc.includes('lyon')) return { latitude: 45.7640, longitude: 4.8357 };
  if (loc.includes('marseille')) return { latitude: 43.2965, longitude: 5.3698 };
  if (loc.includes('bordeaux')) return { latitude: 44.8378, longitude: -0.5792 };
  if (loc.includes('strasbourg')) return { latitude: 48.5734, longitude: 7.7521 };
  if (loc.includes('lille')) return { latitude: 50.6292, longitude: 3.0573 };
  if (loc.includes('nice')) return { latitude: 43.7102, longitude: 7.2620 };
  if (loc.includes('toulouse')) return { latitude: 43.6047, longitude: 1.4442 };
  if (loc.includes('nantes')) return { latitude: 47.2184, longitude: -1.5536 };
  if (loc.includes('montpellier')) return { latitude: 43.6108, longitude: 3.8767 };
  return { latitude: 48.8566, longitude: 2.3522 }; // Paris par défaut
}

function getWeatherDesc(code: number): { emoji: string; desc: string; isStorm: boolean } {
  if (code === 0) return { emoji: '☀️', desc: 'Ciel dégagé', isStorm: false };
  if (code <= 2) return { emoji: '🌤️', desc: 'Partiellement nuageux', isStorm: false };
  if (code === 3) return { emoji: '☁️', desc: 'Couvert', isStorm: false };
  if (code <= 49) return { emoji: '🌫️', desc: 'Brouillard', isStorm: false };
  if (code <= 59) return { emoji: '🌦️', desc: 'Bruine', isStorm: false };
  if (code <= 65) return { emoji: '🌧️', desc: 'Pluie', isStorm: false };
  if (code <= 77) return { emoji: '❄️', desc: 'Neige', isStorm: false };
  if (code <= 82) return { emoji: '🌧️', desc: 'Averses', isStorm: false };
  if (code <= 99) return { emoji: '⛈️', desc: 'Orage', isStorm: true };
  return { emoji: '🌡️', desc: 'Inconnu', isStorm: false };
}
// === FIN HELPERS MÉTÉO ===

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function DashboardPage() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [time, setTime] = useState<Date | null>(null);


  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Victory Checklist & Onboarding Demo States
  const [clubName, setClubName] = useState('');
  const [hasLogo, setHasLogo] = useState(false);
  const [hasRuns, setHasRuns] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);
  const [checklistCollapsed, setChecklistCollapsed] = useState(false);
  const [isChecklistVisible, setIsChecklistVisible] = useState(true);
  const [cagnotteUrl, setCagnotteUrl] = useState<string | null>(null);
  const [spotName, setSpotName] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [weatherInfo, setWeatherInfo] = useState<{ emoji: string; temp: number; desc: string; windspeed: number; isStorm: boolean; isExtreme: boolean } | null>(null);

  // Onboarding States
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingClubName, setOnboardingClubName] = useState('');
  const [skipOnboarding, setSkipOnboarding] = useState(false);

  useEffect(() => {
    // Load Onboarding States
    const savedStep = localStorage.getItem('capten_onboarding_step');
    if (savedStep) setOnboardingStep(parseInt(savedStep));

    const skipped = localStorage.getItem('capten_onboarding_skipped') === 'true';
    setSkipOnboarding(skipped);

    // Load Brand Setup Status
    const savedName = localStorage.getItem('capten_club_name') || localStorage.getItem('capten_onboarding_s2_name') || '';
    setClubName(savedName);
    if (savedName) setOnboardingClubName(savedName);
    
    const savedLogo = localStorage.getItem('capten_logo') || '';
    setHasLogo(!!savedLogo);

    // Load Plan Run Status
    const storedRuns = localStorage.getItem('capten_runs_v3');
    if (storedRuns) {
      try {
        const parsed = JSON.parse(storedRuns);
        if (Array.isArray(parsed)) {
          setRuns(parsed);
          setHasRuns(parsed.length > 0);
        }
      } catch (e) {
        setHasRuns(false);
      }
    }

    // Load Instagram Status
    const isInstaCopied = localStorage.getItem('capten_onboarding_instagram_copied') === 'true';
    setInstagramCopied(isInstaCopied);

    // Load collapse state
    const collapsed = localStorage.getItem('capten_onboarding_collapsed') === 'true';
    setChecklistCollapsed(collapsed);

    // Load hidden state
    const hidden = localStorage.getItem('capten_onboarding_hidden') === 'true';
    setIsChecklistVisible(!hidden);

    // Load Local Storage values for cagnotte, spot and athletes
    const savedCagnotte = localStorage.getItem('capten_cagnotte_url');
    if (savedCagnotte) setCagnotteUrl(savedCagnotte);
    const savedSpot = localStorage.getItem('capten_spot_name');
    if (savedSpot) setSpotName(savedSpot);
    const storedAthletes = localStorage.getItem('capten_athletes_v3');
    if (storedAthletes) {
      try {
        setAthletes(JSON.parse(storedAthletes));
      } catch (e) {}
    }
    // Load notifications
    const savedNotifs = localStorage.getItem('capten_inapp_notifications');
    if (savedNotifs) {
      try {
        setNotifications(JSON.parse(savedNotifs));
      } catch (e) {}
    } else {
      const defaultNotifs = [
        {
          id: 'n1',
          type: 'registration',
          message: "Chloë Simonet s'est inscrite au run MORNING VIBES",
          timestamp: "Il y a 5 min"
        },
        {
          id: 'n2',
          type: 'waiver',
          message: "Léa Masson a signé sa décharge de responsabilité",
          timestamp: "Il y a 12 min"
        },
        {
          id: 'n3',
          type: 'cagnotte',
          message: "Contribution de 15,00 € reçue de Alexandre Dupont",
          timestamp: "Il y a 45 min"
        },
        {
          id: 'n4',
          type: 'registration',
          message: "Théo Bernard s'est inscrit au run MORNING VIBES",
          timestamp: "Il y a 2h"
        },
        {
          id: 'n5',
          type: 'waiver',
          message: "Marc Dupond a signé sa décharge de responsabilité",
          timestamp: "Il y a 3h"
        }
      ];
      setNotifications(defaultNotifs);
      localStorage.setItem('capten_inapp_notifications', JSON.stringify(defaultNotifs));
    }
  }, []);

  const handleCopyClubLink = () => {
    const clubUrl = `${window.location.origin}/the-crew-trail`;
    navigator.clipboard.writeText(clubUrl);
    setInstagramCopied(true);
    localStorage.setItem('capten_onboarding_instagram_copied', 'true');
    alert("Lien du club copié ! Collez-le dans votre bio Instagram.");
  };

  const handleSimulateNotification = () => {
    const names = ["Chloë Simonet", "Léa Masson", "Alexandre Dupont", "Théo Bernard", "Marc Dupond", "Sophie Lemaire", "Noah Petit"];
    const runsList = ["Morning Vibes", "Tempo Thursday", "Afterwork Canal", "Session République"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const types: Array<'registration' | 'waiver' | 'cagnotte'> = ['registration', 'waiver', 'cagnotte'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    let message = "";
    if (randomType === 'registration') {
      const randomRun = runsList[Math.floor(Math.random() * runsList.length)];
      message = `${randomName} s'est inscrit(e) au run ${randomRun.toUpperCase()}`;
    } else if (randomType === 'waiver') {
      message = `${randomName} a signé sa décharge de responsabilité`;
    } else {
      const amount = (Math.floor(Math.random() * 4) + 1) * 5;
      message = `Contribution de ${amount},00 € reçue de ${randomName}`;
    }
    
    const newNotif = {
      id: `n-${Date.now()}`,
      type: randomType,
      message,
      timestamp: "À l'instant"
    };
    
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('capten_inapp_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('capten_inapp_notifications', JSON.stringify([]));
  };

  const isMission1Complete = (clubName && clubName.trim().toUpperCase() !== "MON RUN CLUB") || hasLogo;
  const isMission2Complete = hasRuns;
  const isMission3Complete = instagramCopied;
  const completedMissionsCount = (isMission1Complete ? 1 : 0) + (isMission2Complete ? 1 : 0) + (isMission3Complete ? 1 : 0);

  const extractFirstName = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0];
    const upper = first.toUpperCase();
    if (["MOI", "MON", "MY", "THE", "CLUB", "RUN"].includes(upper) || upper.startsWith("MON")) {
      return '';
    }
    return first;
  };

  useEffect(() => {
    async function checkQuota() {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Get user's first name from metadata if present
            const fn = user.user_metadata?.first_name || user.user_metadata?.display_name || user.user_metadata?.club_name || '';
            if (fn) {
              setFirstName(extractFirstName(fn));
            }

            const { data: club, error } = await supabase
              .from('clubs')
              .select('whatsapp_messages_sent_this_month, whatsapp_display_name, cagnotte_url, spot_name')
              .eq('id', user.id)
              .single();

            if (error || !club) {
              const defaultName = user.user_metadata?.club_name || 'MON RUN CLUB';
              await supabase
                .from('clubs')
                .insert({
                  id: user.id,
                  whatsapp_display_name: defaultName
                });
              
              if (!clubName) {
                setClubName(defaultName);
                localStorage.setItem('capten_onboarding_s2_name', defaultName);
              }
            } else {
              if (club.whatsapp_messages_sent_this_month >= 200) {
                setQuotaExceeded(true);
              }
              if (club.whatsapp_display_name && !clubName) {
                setClubName(club.whatsapp_display_name);
                localStorage.setItem('capten_onboarding_s2_name', club.whatsapp_display_name);
                setFirstName(extractFirstName(club.whatsapp_display_name));
              }
              if (club.cagnotte_url) {
                setCagnotteUrl(club.cagnotte_url);
                localStorage.setItem('capten_cagnotte_url', club.cagnotte_url);
              }
              if (club.spot_name) {
                setSpotName(club.spot_name);
                localStorage.setItem('capten_spot_name', club.spot_name);
              }
            }
          }
        } else {
          const mockQuota = localStorage.getItem('capten_mock_quota_exceeded');
          if (mockQuota === 'true') {
            setQuotaExceeded(true);
          }
        }
      } catch (err) {
        console.error("Failed checking quota or initializing club:", err);
      }
    }
    checkQuota();
  }, [clubName]);

  const activeMembersCount = athletes.length;
  const avgReliability = activeMembersCount > 0 
    ? Math.round(athletes.reduce((acc, a) => acc + (a.reliability || 0), 0) / activeMembersCount) 
    : 0;
  
  const runsCount = runs.length;
  const runsCompletedPercent = runsCount > 0 ? 100 : 0;
  const cagnotteSolde = typeof window !== 'undefined' ? (localStorage.getItem('capten_solde_v3') || '0') : '0';
  const latestRun = runsCount > 0 ? runs[0] : null;

  const totalRunners = athletes.length;
  const protectedRunners = athletes.filter(a => 
    a.waiverStatus === "SIGNÉE" && 
    a.emergencyName && a.emergencyName.trim() !== '' && 
    a.emergencyPhone && a.emergencyPhone.trim() !== ''
  ).length;



  useEffect(() => {
    setWeatherInfo(null);
    async function fetchWeather() {
      try {
        const location = latestRun?.location || 'Paris';
        const coords = getCoordinates(location);
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`);
        if (!res.ok) return;
        const data = await res.json();
        const current = data.current_weather;
        if (!current) return;
        const mapped = getWeatherDesc(current.weathercode);
        const temp = Math.round(current.temperature);
        const windspeed = current.windspeed;
        const isExtreme = mapped.isStorm || temp > 35 || temp < 0 || windspeed > 50;
        setWeatherInfo({ emoji: mapped.emoji, temp, desc: mapped.desc, windspeed, isStorm: mapped.isStorm, isExtreme });
      } catch (err) {
        // Silencieux
      }
    }
    fetchWeather();
  }, [latestRun?.id, latestRun?.location]);

  const handleCancelRun = (runId: string) => {
    if (window.confirm("Voulez-vous vraiment annuler ce run ?")) {
      const updatedRuns = runs.filter((r: any) => r.id !== runId);
      setRuns(updatedRuns);
      localStorage.setItem('capten_runs_v3', JSON.stringify(updatedRuns));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('capten_runs_change'));
      }
    }
  };

  const generateSlug = (text: string) => {
    return (text || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSaveClubName = async () => {
    if (!onboardingClubName.trim()) return;
    const finalClubName = onboardingClubName.trim();
    setClubName(finalClubName);
    localStorage.setItem('capten_club_name', finalClubName);
    localStorage.setItem('capten_onboarding_s2_name', finalClubName);
    
    // Save to Supabase
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('clubs')
            .upsert({
              id: user.id,
              whatsapp_display_name: finalClubName
            });
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Trigger branding change event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('capten_branding_change'));
    }

    updateStep(2);
  };

  const handleGoToDashboard = () => {
    setSkipOnboarding(true);
    localStorage.setItem('capten_onboarding_skipped', 'true');
  };

  const updateStep = (step: number) => {
    setOnboardingStep(step);
    localStorage.setItem('capten_onboarding_step', String(step));
  };

  const renderProgressSteps = (step: number) => {
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-[12px] font-medium text-neutral-400 mt-10">
        <span className={step === 1 ? "text-[#FF5C00] font-bold" : "text-[#9B9B93]"}>① Ton crew</span>
        <span className="text-neutral-300">———</span>
        <span className={step === 2 ? "text-[#FF5C00] font-bold" : "text-[#9B9B93]"}>② Ton lien</span>
        <span className="text-neutral-300">———</span>
        <span className={step === 3 ? "text-[#FF5C00] font-bold" : "text-[#9B9B93]"}>③ Ton premier run</span>
      </div>
    );
  };

  if (runsCount === 0 && !skipOnboarding) {
    return (
      <div className="space-y-10 pb-20">
        {/* HARMONIZED HEADER */}
        <header className="flex flex-col gap-1.5 pb-6 sm:pb-10 border-b-[0.5px] border-black/10 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
                LE HUB DU CREW
              </h1>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* LIVE CLOCK */}
              <time className="flex text-[11px] sm:text-sm text-capten-textGray font-sans font-medium items-center gap-1.5 sm:gap-2 bg-white/50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-card-inner border border-black/5 mr-0 sm:mr-2">
                {time ? (
                  <>
                    <span className="text-black font-mono font-bold tracking-tight">
                      {time.toLocaleTimeString("fr-FR", {
                        timeZone: "Europe/Paris",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-black/20 font-bold">·</span>
                    <span className="capitalize text-[9px] sm:text-[12px]">
                      {time.toLocaleDateString("fr-FR", {
                        timeZone: "Europe/Paris",
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {weatherInfo && (
                      <>
                        <span className="text-black/20 font-bold">·</span>
                        <span style={{ color: weatherInfo.isExtreme ? '#DC2626' : '#6B6B63', fontWeight: 650 }} className="flex items-center gap-1 font-bold text-[9px] sm:text-[12px]">
                          {weatherInfo.emoji} {weatherInfo.temp}°C
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="opacity-0">00:00 · lun. 1 janv.</span>
                )}
              </time>
              <Link href="/runs?openPlanifier=true" className="flex-1 sm:flex-initial bg-[#FF5C00] text-white px-4 sm:px-5 py-2.5 rounded-control text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all shadow-sm active:scale-95">
                <Plus size={14} /> LANCER UN RUN +
              </Link>
            </div>
          </div>
        </header>

        {/* ONBOARDING STATE IN 3 STEPS */}
        {onboardingStep === 1 && (
          <div className="max-w-xl mx-auto text-center py-12 space-y-8 animate-scale-up">
            <div className="space-y-4">
              <h2 
                style={{ 
                  fontFamily: "'Barlow Condensed', var(--font-barlow), sans-serif", 
                  fontSize: '52px', 
                  fontStyle: 'italic', 
                  fontWeight: 950, 
                  color: '#0F0F0D',
                  lineHeight: '1.1'
                }}
                className="uppercase text-center"
              >
                Bienvenue{firstName ? `, ${firstName}` : ''}. 👋
              </h2>
              <p className="text-[18px] font-sans font-medium text-neutral-500 uppercase tracking-wide">
                Comment s&apos;appelle ton crew ?
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-card-outer p-8 sm:p-10 space-y-6 shadow-sm text-left">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Ex : Paris Run Club, Paname Run Club..."
                  value={onboardingClubName}
                  onChange={(e) => setOnboardingClubName(e.target.value)}
                  className="w-full px-4 py-4 border border-[#E5E5E5] rounded-control text-[18px] font-sans focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] bg-white shadow-sm transition-all"
                />
                <p className="text-[13px] text-[#9B9B93] font-mono mt-2">
                  Ton portail sera : capten.app/{generateSlug(onboardingClubName) || "[slug-auto-généré]"}
                </p>
              </div>

              <button
                onClick={handleSaveClubName}
                disabled={!onboardingClubName.trim()}
                className="w-full bg-[#FF5C00] text-white py-4 rounded-control text-[16px] font-bold font-sans hover:bg-black transition-all active:scale-95 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer shadow-sm text-center block"
              >
                C&apos;est mon crew →
              </button>
            </div>

            {renderProgressSteps(1)}
          </div>
        )}

        {onboardingStep === 2 && (
          <div className="max-w-xl mx-auto text-center py-12 space-y-8 animate-scale-up">
            <div className="space-y-2">
              <h2 
                style={{ 
                  fontFamily: "'Barlow Condensed', var(--font-barlow), sans-serif", 
                  fontSize: '42px', 
                  fontStyle: 'italic', 
                  fontWeight: 950, 
                  color: '#0F0F0D',
                  lineHeight: '1.1'
                }}
                className="uppercase text-center"
              >
                Ton portail est prêt. 🎉
              </h2>
            </div>

            <div className="bg-white border border-[#FF5C00] rounded-[14px] p-7 sm:p-10 space-y-6 shadow-md text-center">
              <div className="text-[20px] font-mono font-bold text-[#FF5C00] bg-[#FFF5F0] rounded-[8px] p-3 break-all select-all">
                capten.app/{generateSlug(clubName) || "slug"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    const shareLink = `https://capten.app/${generateSlug(clubName)}`;
                    navigator.clipboard.writeText(shareLink);
                    setInstagramCopied(true);
                    localStorage.setItem('capten_onboarding_instagram_copied', 'true');
                    alert("Lien copié dans le presse-papiers !");
                  }}
                  className="py-3 px-4 border border-[#FF5C00] text-[#FF5C00] bg-white rounded-control text-[12px] font-bold font-sans hover:bg-[#FFF5F0] transition-all cursor-pointer text-center"
                >
                  📋 Copier mon lien
                </button>
                <button
                  onClick={() => {
                    setInstagramCopied(true);
                    localStorage.setItem('capten_onboarding_instagram_copied', 'true');
                    alert("Copie ton lien capten et ajoute-le dans la section 'Site web' de ton profil Instagram !");
                    window.open("https://instagram.com", "_blank");
                  }}
                  className="py-3 px-4 bg-[#FF5C00] text-white rounded-control text-[12px] font-bold font-sans hover:bg-black transition-all cursor-pointer text-center"
                >
                  📱 Partager sur Instagram
                </button>
              </div>

              <p className="text-[13px] font-sans text-[#9B9B93] leading-relaxed">
                Tes coureurs peuvent déjà s&apos;inscrire.<br />
                Lance ton premier run quand tu veux.
              </p>

              <button
                onClick={() => updateStep(3)}
                className="w-full bg-black text-white py-3.5 rounded-control text-[12px] font-black uppercase tracking-widest hover:bg-[#FF5C00] transition-all active:scale-95 cursor-pointer mt-4"
              >
                Continuer →
              </button>
            </div>

            {renderProgressSteps(2)}
          </div>
        )}

        {onboardingStep === 3 && (
          <div className="max-w-xl mx-auto text-center py-12 space-y-8 animate-scale-up">
            <div className="space-y-2">
              <h2 
                style={{ 
                  fontFamily: "'Barlow Condensed', var(--font-barlow), sans-serif", 
                  fontSize: '32px', 
                  fontStyle: 'italic', 
                  fontWeight: 950, 
                  color: '#0F0F0D',
                  lineHeight: '1.1'
                }}
                className="uppercase text-center"
              >
                Et maintenant ?
              </h2>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-card-outer p-8 sm:p-10 space-y-6 shadow-sm text-center">
              <Link
                href="/runs?openPlanifier=true"
                className="w-full bg-[#FF5C00] text-white py-4 rounded-control text-[14px] font-bold font-sans hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm text-center block"
              >
                + Lancer mon premier run →
              </Link>

              <button
                onClick={handleGoToDashboard}
                className="text-[14px] font-sans font-medium text-[#6B6B63] hover:text-[#0F0F0D] transition-colors cursor-pointer"
              >
                Aller au dashboard
              </button>
            </div>

            {renderProgressSteps(3)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* HARMONIZED HEADER */}
      <header className="flex flex-col gap-1.5 pb-6 sm:pb-10 border-b-[0.5px] border-black/10 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
                LE HUB DU CREW
              </h1>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* LIVE CLOCK */}
              <time className="flex text-[11px] sm:text-sm text-capten-textGray font-sans font-medium items-center gap-1.5 sm:gap-2 bg-white/50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-card-inner border border-black/5 mr-0 sm:mr-2">
                {time ? (
                  <>
                    <span className="text-black font-mono font-bold tracking-tight">
                      {time.toLocaleTimeString("fr-FR", {
                        timeZone: "Europe/Paris",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-black/20 font-bold">·</span>
                    <span className="capitalize text-[9px] sm:text-[12px]">
                      {time.toLocaleDateString("fr-FR", {
                        timeZone: "Europe/Paris",
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {weatherInfo && (
                      <>
                        <span className="text-black/20 font-bold">·</span>
                        <span style={{ color: weatherInfo.isExtreme ? '#DC2626' : '#6B6B63', fontWeight: 650 }} className="flex items-center gap-1 font-bold text-[9px] sm:text-[12px]">
                          {weatherInfo.emoji} {weatherInfo.temp}°C
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="opacity-0">00:00 · lun. 1 janv.</span>
                )}
              </time>
              <Link href="/runs?openPlanifier=true" className="flex-1 sm:flex-initial bg-[#FF5C00] text-white px-4 sm:px-5 py-2.5 rounded-control text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all shadow-sm active:scale-95">
                <Plus size={14} /> LANCER UN RUN +
              </Link>
            </div>
          </div>
      </header>
 
      {/* VICTORY CHECKLIST (ONBOARDING) */}
      {isChecklistVisible && (
        <div className="bg-white border border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-black/15">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
            <div>
              <span className="text-[10px] font-black text-[#FF5C00] uppercase tracking-[0.2em] italic">VOTRE PLAN DE VOL</span>
              <h2 className="text-[22px] font-display italic font-black uppercase text-black flex items-center gap-2">
                🏆 CHECKLIST DE VICTOIRE
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {completedMissionsCount === 3 ? (
                <span className="bg-green-50 border border-green-500/20 text-green-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> CONFIGURATION 100% TERRAIN
                </span>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-black">{completedMissionsCount}/3 ÉTAPES COMPLÉTÉES</span>
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tight">
                    Plus que {3 - completedMissionsCount} étape{3 - completedMissionsCount > 1 ? 's' : ''} avant de libérer ton temps.
                  </span>
                </div>
              )}
              <button
                onClick={() => {
                  const nextCollapsed = !checklistCollapsed;
                  setChecklistCollapsed(nextCollapsed);
                  localStorage.setItem('capten_onboarding_collapsed', nextCollapsed.toString());
                }}
                className="px-2.5 py-1.5 border border-[#E5E5E5] rounded-control text-[9px] font-bold uppercase tracking-wider bg-neutral-50 hover:bg-neutral-100 hover:text-black transition-all cursor-pointer"
              >
                {checklistCollapsed ? "Afficher" : "Réduire"}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-100 h-2 border border-neutral-200 rounded-full overflow-hidden">
            <div 
              className="bg-[#FF5C00] h-full transition-all duration-500" 
              style={{ width: `${(completedMissionsCount / 3) * 100}%` }}
            />
          </div>

          {!checklistCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Mission 1: Identity */}
              <div className={`p-5 rounded-card-inner border transition-all flex flex-col justify-between min-h-[180px] ${isMission1Complete ? 'bg-[#F8FFF8] border-green-500/20 shadow-none' : 'bg-white border-[#E5E5E5] shadow-sm hover:border-black/20 hover:shadow-md'}`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-wider">Étape 1 : Identité</span>
                    {isMission1Complete ? (
                      <span className="text-green-600 font-bold text-[10px] flex items-center gap-1">✓ CONFIGURÉ</span>
                    ) : (
                      <span className="text-[#FF5C00] font-black text-[9px] uppercase tracking-widest animate-pulse">● À FAIRE</span>
                    )}
                  </div>
                  <h4 className="text-[13px] font-bold text-black uppercase tracking-wider mb-2">Configure ta marque</h4>
                  <p className="text-[11px] text-[#71717A] uppercase tracking-wider leading-normal">
                    Indique le nom de ton Run Club ou dépose ton logo officiel pour signer ton cockpit.
                  </p>
                </div>
                <div className="mt-4">
                  {!isMission1Complete ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Nom de ton club"
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-control text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#FF5C00] bg-white shadow-inner"
                      />
                      <button
                        onClick={() => {
                          if (clubName.trim()) {
                            localStorage.setItem('capten_club_name', clubName.trim());
                            localStorage.setItem('capten_onboarding_s2_name', clubName.trim());
                            localStorage.setItem('capten_onboarding_s2_saved', 'true');
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new Event('capten_branding_change'));
                            }
                            alert("Nom du club configuré !");
                            setClubName(clubName.trim());
                          }
                        }}
                        className="w-full bg-[#FF5C00] text-white px-4 py-2 rounded-control text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        VALIDER LE NOM
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-green-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> {clubName.toUpperCase() || "MON CLUB"} ✓
                      </div>
                      <Link
                        href="/settings"
                        className="text-[9px] font-black text-neutral-400 hover:text-black uppercase tracking-wider block hover:underline"
                      >
                        ⚙️ PARAMÈTRES
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Mission 2: First Run */}
              <div className={`p-5 rounded-card-inner border transition-all flex flex-col justify-between min-h-[180px] ${isMission2Complete ? 'bg-[#F8FFF8] border-green-500/20 shadow-none' : 'bg-white border-[#E5E5E5] shadow-sm hover:border-black/20 hover:shadow-md'}`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-wider">Étape 2 : Plan</span>
                    {isMission2Complete ? (
                      <span className="text-green-600 font-bold text-[10px] flex items-center gap-1">✓ SORTIE PLANIFIÉE</span>
                    ) : (
                      <span className="text-[#FF5C00] font-black text-[9px] uppercase tracking-widest animate-pulse">● À FAIRE</span>
                    )}
                  </div>
                  <h4 className="text-[13px] font-bold text-black uppercase tracking-wider mb-2">Lance ton premier run</h4>
                  <p className="text-[11px] text-[#71717A] uppercase tracking-wider leading-normal">
                    Planifie une session pour que tes coureurs puissent valider leur présence ce soir.
                  </p>
                </div>
                <div className="mt-4">
                  {!isMission2Complete ? (
                    <Link
                      href="/runs?openPlanifier=true"
                      className="w-full bg-[#FF5C00] text-white px-4 py-2.5 rounded-control text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm text-center block"
                    >
                      🗺️ LANCER UN RUN +
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-green-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 py-1">
                        <CheckCircle2 size={12} /> PREMIER RUN PRÊT ✓
                      </div>
                      <Link
                        href="/runs"
                        className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-wider hover:text-black hover:underline block"
                      >
                        🗺️ ACCÉDER AUX RUNS
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Mission 3: Instagram */}
              <div className={`p-5 rounded-card-inner border transition-all flex flex-col justify-between min-h-[180px] ${isMission3Complete ? 'bg-[#F8FFF8] border-green-500/20 shadow-none' : 'bg-white border-[#E5E5E5] shadow-sm hover:border-black/20 hover:shadow-md'}`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-wider">Étape 3 : IG Bio</span>
                    {isMission3Complete ? (
                      <span className="text-green-600 font-bold text-[10px] flex items-center gap-1">✓ EN BIO INSTAGRAM</span>
                    ) : (
                      <span className="text-[#FF5C00] font-black text-[9px] uppercase tracking-widest animate-pulse">● À FAIRE</span>
                    )}
                  </div>
                  <h4 className="text-[13px] font-bold text-black uppercase tracking-wider mb-2">Installe ton lien club</h4>
                  <p className="text-[11px] text-[#71717A] uppercase tracking-wider leading-normal">
                    Copie le lien public de ton club et insère-le dans ta bio Instagram pour récolter les inscriptions.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleCopyClubLink}
                    className="w-full bg-[#FF5C00] text-white px-4 py-2.5 rounded-control text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    🔗 {isMission3Complete ? "RECOPIER LE LIEN" : "COPIER LE LIEN DU CLUB"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {completedMissionsCount === 3 && (
            <div className="bg-[#F8FFF8] border border-green-500/20 rounded-card-inner p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 shadow-sm">
              <div>
                <p className="text-[12px] font-black text-green-700 uppercase tracking-wider">
                  🎉 FÉLICITATIONS, TON RUN CLUB EST PRÊT !
                </p>
                <p className="text-[9px] font-bold text-[#71717A] uppercase tracking-widest leading-relaxed mt-1">
                  Les fondations sont posées. Tu peux maintenant fermer cette checklist pour libérer de l'espace.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsChecklistVisible(false);
                  localStorage.setItem('capten_onboarding_hidden', 'true');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-black text-white hover:bg-red-650 transition-all rounded-control text-[10px] font-black uppercase tracking-widest text-center cursor-pointer active:scale-95 shadow-sm"
              >
                Masquer définitivement
              </button>
            </div>
          )}
        </div>
      )}
 
      {/* TOP ROW: 4 MINIMALIST KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: LE CREW */}
        <Link 
          href="/athletes" 
          className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 space-y-2 shadow-sm group hover:border-[#FF5C00]/40 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
           <p className="text-[9px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">LE CREW</p>
           <h3 className="text-[32px] font-display italic font-black text-black">{activeMembersCount > 0 ? activeMembersCount : "—"}</h3>
           <p className="text-[9px] font-medium text-[#A3A3A3] uppercase tracking-widest">
             {activeMembersCount > 0 ? `${activeMembersCount} MEMBRES` : "Partage ton lien, ton crew arrive."}
           </p>
        </Link>

        {/* Card 2: FIDÉLITÉ DU CREW */}
        <Link 
          href="/athletes" 
          className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 space-y-2 shadow-sm group hover:border-[#FF5C00]/40 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
           <p className="text-[9px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">FIDÉLITÉ DU CREW</p>
           <h3 className="text-[32px] font-display italic font-black text-[#56E39F]">{activeMembersCount > 0 ? `${avgReliability}%` : "—"}</h3>
           <p className="text-[9px] font-medium text-[#A3A3A3] uppercase tracking-widest">
             {activeMembersCount > 0 ? "MOYENNE D'ASSIDUITÉ" : "Visible après le 1er run"}
           </p>
        </Link>

        {/* Card 3: PROTECTION */}
        <Link 
          href="/securite" 
          title="Coureurs ayant signé la charte de bienveillance et rempli leur fiche d'urgence."
          className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 space-y-2 shadow-sm group hover:border-[#FF5C00]/40 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
           <p className="text-[9px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">PROTECTION</p>
           {totalRunners === 0 ? (
             <h3 className="text-[32px] font-display italic font-black text-[#9B9B93]">
               —
             </h3>
           ) : (
             <h3 className={`text-[32px] font-display italic font-black ${protectedRunners === totalRunners ? 'text-[#56E39F]' : 'text-[#FF5C00]'}`}>
               {protectedRunners}/{totalRunners}
             </h3>
           )}
           <p className="text-[9px] font-medium text-[#A3A3A3] uppercase tracking-widest">
             {totalRunners === 0 ? "Visible après les 1ères inscriptions" : "coureurs protégés"}
           </p>
        </Link>

        {/* Card 4: CAGNOTTE */}
        <Link 
          href="/cagnotte" 
          className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 space-y-2 shadow-sm group hover:border-[#FF5C00]/40 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
           <p className="text-[9px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">CAGNOTTE</p>
           <h3 className="text-[32px] font-display italic font-black text-black">{cagnotteSolde}€</h3>
           <p className="text-[9px] font-medium text-[#A3A3A3] uppercase tracking-widest">
             {cagnotteUrl ? "SOLDE DISPONIBLE" : "Ajoute ton lien Lydia →"}
           </p>
        </Link>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CENTER LEFT: SESSION IMMINENTE / LATEST RUN COPIER */}
        {latestRun ? (
          <div className="col-span-1 lg:col-span-8 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-10 flex flex-col justify-between min-h-[380px] sm:h-[450px] shadow-sm relative overflow-hidden group">
             <div className="space-y-4 relative z-10">
                {/* 1. Badge "PROCHAIN RUN PLANIFIÉ" */}
                <div className="flex items-center gap-3">
                   <div className="bg-[#FF5C00]/10 border border-[#FF5C00]/20 text-[#FF5C00] px-3 py-1 rounded-control text-[10px] font-black uppercase tracking-widest italic animate-pulse">PROCHAIN RUN PLANIFIÉ</div>
                </div>
                
                {/* 2. Nom du run */}
                <h2 className="text-[28px] sm:text-[36px] font-display italic font-black uppercase text-black leading-tight tracking-tight">
                  {latestRun.name}
                </h2>
                
                {/* 3. Date · Heure · Météo · Distance · Lieu */}
                <div className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider flex flex-wrap items-center gap-1.5">
                  <span>{latestRun.date} · {latestRun.time}</span>
                  {weatherInfo && (
                    <span style={{ color: weatherInfo.isExtreme ? '#DC2626' : '#6B6B63', fontWeight: 600 }}>
                      · {weatherInfo.emoji} {weatherInfo.temp}°C
                    </span>
                  )}
                  <span>· {latestRun.distance} · {latestRun.location}</span>
                </div>

                {/* Alerte conditions extrêmes */}
                {weatherInfo && weatherInfo.isExtreme && (
                  <div className="text-[12px] text-red-600 flex items-center gap-2">
                    <span>⚠️ Conditions difficiles — tu veux</span>
                    <button onClick={(e) => { e.preventDefault(); handleCancelRun(latestRun.id); }} className="font-black underline cursor-pointer hover:text-red-800">annuler ce run ?</button>
                  </div>
                )}

                {/* 4. Pace groups (si configurés) */}
                {(latestRun.pace_groups || latestRun.paceGroups || latestRun.pace) && (
                  <div className="text-[13px] text-[#6B6B63] font-sans">
                     ⏱️ Allure : {latestRun.pace_groups || latestRun.paceGroups || latestRun.pace}
                  </div>
                )}
             </div>
             
             <div className="space-y-4 relative z-10 w-full mt-4">
                {/* 6. [BOUTON ORANGE] COPIER LE LIEN D'INSCRIPTION */}
                <button 
                  onClick={handleCopyClubLink} 
                  className="w-full bg-[#FF5C00] text-white px-8 py-3.5 rounded-control text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-sm"
                >
                  COPIER LE LIEN D'INSCRIPTION
                </button>
                
                {/* 7. Texte sous le bouton */}
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">
                  Colle ce lien dans ta bio Instagram
                </p>

                {/* 8. Lien discret : Voir le portail */}
                <div className="text-center">
                  <Link 
                    href={`/waiver?runId=${latestRun.id}`} 
                    className="text-[12px] text-neutral-400 hover:text-black hover:underline uppercase font-bold transition-all"
                  >
                    Voir le portail →
                  </Link>
                </div>

                {/* 9. Compteur inscrits */}
                <div className="text-center">
                  <span className="text-[11.5px] font-black uppercase tracking-widest text-neutral-450">
                    {latestRun.slots_taken || 0}/{latestRun.max_slots || 50} inscrits
                  </span>
                </div>
             </div>
          </div>
        ) : (
          <div className="col-span-1 lg:col-span-8 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-10 flex flex-col justify-between min-h-[380px] sm:h-[450px] shadow-sm relative overflow-hidden group">
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                   {/* Removed HORS LIGNE badge */}
                </div>
                <h2 className="text-[44px] sm:text-[94px] font-display italic font-black uppercase leading-none tracking-tighter text-black/20 transition-all duration-700">
                  AUCUNE <br /> <span className="text-black/10">SESSION</span>
                </h2>
                <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest leading-relaxed mt-2 text-left">
                   Ton premier run, et ça commence.
                </p>
             </div>
             
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="flex -space-x-3">
                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F4F5F7] border-2 border-white flex items-center justify-center text-[10px] font-black text-[#A3A3A3]">{activeMembersCount}</div>
                </div>
                <Link href="/runs?openPlanifier=true" className="w-full sm:w-auto bg-black text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-control text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#FF5C00] transition-all flex items-center justify-center gap-3 active:scale-95">
                   <Plus size={16} /> LANCER UN RUN +
                </Link>
             </div>
    
             <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#F4F5F7]/50 to-transparent pointer-events-none" />
          </div>
        )}
 
        {/* CENTER RIGHT: WIDGETS COLUMN */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
           {/* CAGNOTTE WIDGET */}
           {cagnotteUrl ? (
             <Link href="/cagnotte" className="block bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 h-[200px] sm:h-[215px] flex flex-col justify-between shadow-sm relative group overflow-hidden hover:border-[#FF5C00] transition-all">
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span 
                        style={{
                          fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
                          fontSize: '11px',
                          color: '#9B9B93',
                          textTransform: 'uppercase'
                        }}
                      >
                        Cagnotte post-run
                      </span>
                      <Wallet size={16} className="text-black/20" />
                   </div>
                   <div>
                     <h3 className="text-[20px] sm:text-[24px] font-display italic font-black text-black uppercase leading-tight">LIEN CONFIGURÉ</h3>
                     <p className="text-[9px] font-mono text-neutral-400 mt-1 uppercase truncate max-w-[220px]">{cagnotteUrl}</p>
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[9.5px] font-medium text-[#A3A3A3] uppercase tracking-wider leading-relaxed">
                      Le suivi est déclaratif sur le terrain (virements instantanés Lydia / Wero).
                   </p>
                </div>
             </Link>
           ) : (
             <div className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 h-[200px] sm:h-[215px] flex flex-col justify-between shadow-sm relative group overflow-hidden transition-all">
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span 
                        style={{
                          fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
                          fontSize: '11px',
                          color: '#9B9B93',
                          textTransform: 'uppercase'
                        }}
                      >
                        Cagnotte post-run
                      </span>
                      <Wallet size={16} className="text-black/20" />
                   </div>
                   <div className="space-y-2">
                     <p 
                       style={{
                         fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
                         fontSize: '13px',
                         color: '#6B6B63',
                         lineHeight: '1.4'
                       }}
                     >
                       Ajoute ton lien Lydia, Revolut ou Wero pour collecter les contributions de tes coureurs.
                     </p>
                     <Link 
                       href="/settings"
                       className="hover:underline block transition-all"
                       style={{
                         fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
                         fontSize: '13px',
                         color: '#FF5C00',
                         textDecoration: 'none'
                       }}
                     >
                       → Configurer dans Réglages
                     </Link>
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[9.5px] font-medium text-[#A3A3A3] uppercase tracking-wider leading-relaxed">
                      Le suivi est déclaratif sur le terrain (virements instantanés Lydia / Wero).
                   </p>
                </div>
             </div>
           )}
 
        </div>
      </div>
 
 
      {/* STREAK & LOYALTY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SUIVI DE PARTICIPATION */}
        <div className="col-span-1 lg:col-span-7 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users size={16} className="text-black/20" />
              <p className="text-[10px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">SUIVI DE PARTICIPATION</p>
            </div>
            <Link href="/athletes" className="text-[9px] font-black text-black/40 uppercase tracking-widest hover:underline">VOIR TOUT</Link>
          </div>
          {athletes.length > 0 ? (
            <div className="flex flex-col gap-4">
              {athletes
                .slice()
                .sort((a, b) => b.runs - a.runs)
                .slice(0, 5)
                .map((athlete, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                      {athlete.img && !athlete.img.includes('pravatar.cc') ? (
                        <img src={athlete.img} alt={athlete.name} className="w-8 h-8 rounded-full grayscale hover:grayscale-0 transition-all border-[0.5px] border-black/5 object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 border-[0.5px] border-black/10 font-black text-[10px] flex items-center justify-center uppercase shrink-0">
                          {getInitials(athlete.name)}
                        </div>
                      )}
                      <span className="text-[12px] font-bold text-black uppercase tracking-tight">{athlete.name}</span>
                    </div>
                    <span className="text-[11px] font-black uppercase text-neutral-450 tracking-wider">
                      {athlete.runs} run{athlete.runs > 1 ? 's' : ''} complété{athlete.runs > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 opacity-50">
               <p className="text-[11px] font-black text-[#A3A3A3] uppercase tracking-widest text-center">AUCUNE PARTICIPATION ENREGISTRÉE<br/>LANCEZ VOTRE PREMIÈRE SESSION</p>
            </div>
          )}
        </div>
 
        {/* SÉRIES ACTIVES & NOTIFICATIONS */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/athletes" className="block bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-5 flex flex-col justify-between shadow-sm hover:border-[#FF5C00]/40 hover:shadow-md transition-all duration-300">
              <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">RÉGULARITÉ DU CREW</p>
              <div className="mt-2">
                <h3 className="text-[24px] font-display italic font-black text-black leading-none">
                  {athletes.filter(a => (a.streak || 0) > 0).length}
                </h3>
                <p className="text-[8px] font-medium text-[#A3A3A3] uppercase tracking-widest mt-0.5">SUR {activeMembersCount} COUREUR{activeMembersCount > 1 ? 'S' : ''}</p>
              </div>
            </Link>
            <Link href="/athletes" className="block bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-5 flex flex-col justify-between shadow-sm hover:border-[#FF5C00]/40 hover:shadow-md transition-all duration-300">
              <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">ASSIDUITÉ MOYENNE</p>
              <div className="mt-2">
                <h3 className="text-[24px] font-display italic font-black text-black leading-none">
                  {athletes.filter(a => (a.streak || 0) > 0).length > 0
                    ? Math.round(athletes.filter(a => (a.streak || 0) > 0).reduce((acc, a) => acc + (a.streak || 0), 0) / athletes.filter(a => (a.streak || 0) > 0).length)
                    : 0
                  }
                </h3>
                <p className="text-[8px] font-medium text-[#A3A3A3] uppercase tracking-widest mt-0.5">SEMAINES</p>
              </div>
            </Link>
          </div>

          {/* Notifications Card */}
          <div className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 shadow-sm space-y-4">
             {/* Header */}
             <div className="flex justify-between items-center border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                   <p className="text-[9px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">ACTIVITÉ DU CREW</p>
                   <span className="bg-[#FF5C00]/10 border border-[#FF5C00]/20 text-[#FF5C00] px-1.5 py-0.5 rounded-[4px] text-[7.5px] font-black uppercase tracking-wider font-mono">
                      IN-APP
                   </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSimulateNotification} 
                    className="text-[8px] font-black text-[#FF5C00] uppercase tracking-wider hover:underline hover:text-black cursor-pointer"
                    title="Simuler un événement"
                  >
                    + SIMULER
                  </button>
                  <span className="text-black/10 text-[8px]">|</span>
                  <button 
                    onClick={handleClearNotifications} 
                    className="text-[8px] font-black text-black/40 uppercase tracking-wider hover:underline hover:text-black cursor-pointer"
                  >
                    VIDER
                  </button>
                </div>
             </div>

             {/* Notif Feed */}
             <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-[#A3A3A3] uppercase text-[9px] font-black tracking-widest leading-relaxed">
                     Aucune notification.<br/>
                     Les inscriptions et activités s'afficheront ici.
                  </div>
                ) : (
                  notifications.map((notif: any) => {
                    const iconColor = notif.type === 'registration' ? 'bg-[#56E39F]/15 text-[#2AA968]' : notif.type === 'waiver' ? 'bg-blue-500/10 text-blue-600' : 'bg-[#FF5C00]/10 text-[#FF5C00]';
                    const icon = notif.type === 'registration' ? '🏃' : notif.type === 'waiver' ? '📝' : '💰';
                    
                    return (
                      <div key={notif.id} className="flex items-start gap-2.5 text-xs py-0.5 border-b border-black/5 last:border-0 pb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${iconColor}`}>
                          {icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-neutral-800 uppercase tracking-tight text-[10.5px] leading-tight mt-0.5 truncate">
                            {notif.message}
                          </p>
                          <span className="text-[8.5px] text-neutral-400 font-mono uppercase tracking-wider block mt-0.5">
                            {notif.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
             </div>

             <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[8px] font-black text-neutral-400 uppercase tracking-widest">
                <span>🔒 PAS D'E-MAILS ENVOYÉS</span>
                <span>FLUX TEMPS RÉEL</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
