'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Loader2, User, Phone, Check, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

function CheckinFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const runId = params?.id as string;

  // Runner profile state (loaded from LocalStorage or API)
  const [runner, setRunner] = useState<any>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // Identification form fields
  const [inputName, setInputName] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState<string | null>(null);

  // Location / Geofencing states
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  // Check-in states
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  // Incident report states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState("Comportement Toxique");
  const [reportPriority, setReportPriority] = useState("MOYENNE");
  const [reportAnonymous, setReportAnonymous] = useState(true);
  const [reportInvolved, setReportInvolved] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Run Metadata
  const [runDetails, setRunDetails] = useState<any>(null);
  const [isLoadingRun, setIsLoadingRun] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // 1. Load run metadata and check LocalStorage profile
  useEffect(() => {
    async function initPage() {
      // Fetch run info for starting point & title
      try {
        if (typeof window !== "undefined") {
          const savedLogo = localStorage.getItem('capten_logo');
          if (savedLogo) setLogoUrl(savedLogo);
        }
        const supabase = getSupabase();
        if (supabase && runId) {
          const { data: run, error } = await supabase
            .from('runs')
            .select('title, location_start, date_start, start_latitude, start_longitude')
            .eq('id', runId)
            .single();

          if (run) {
            setRunDetails(run);
          }
        }
      } catch (err) {
        console.error("Error fetching run details:", err);
      } finally {
        setIsLoadingRun(false);
      }

      // Check LocalStorage for runner profile
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem('capten_runner_profile');
        if (stored) {
          try {
            const profile = JSON.parse(stored);
            setRunner(profile);
            
            // Sync waiver status with Supabase via secure profile API
            if (profile.id) {
              const res = await fetch(`/api/runners/profile?id=${profile.id}`);
              const data = await res.json();
              if (res.ok && data.success && data.runner) {
                const updated = { 
                  ...profile, 
                  signed_waiver: data.runner.signed_waiver,
                  streak_count: data.runner.streak_count
                };
                setRunner(updated);
                localStorage.setItem('capten_runner_profile', JSON.stringify(updated));
              }
            }
          } catch (e) {
            console.error("Failed to parse local runner profile:", e);
          }
        }
        setIsCheckingProfile(false);
      }
    }
    initPage();
  }, [runId]);

  // 2. Trigger GPS geolocation as soon as profile is verified and waiver is signed
  useEffect(() => {
    if (isCheckingProfile || !runner || !runner.signed_waiver) return;

    setIsLocating(true);
    setGeoError(null);
    setGpsAccuracy(null);

    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLocating(false);
      return;
    }

    const acquirePosition = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const acc = position.coords.accuracy;
          setGpsAccuracy(acc);

          // Si la précision du signal est trop mauvaise (supérieure à 100m)
          if (acc > 100) {
            setGeoError(`Signal GPS trop faible (Marge d'erreur : ±${Math.round(acc)}m). Attends quelques secondes au grand air et réessaye.`);
            setIsLocating(false);
            return;
          }

          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          if (highAccuracy && error.code === error.TIMEOUT) {
            console.log("GPS high accuracy timed out, retrying with low accuracy fallback...");
            acquirePosition(false);
            return;
          }

          let errorMessage = "Erreur de géolocalisation inconnue.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Accès GPS refusé. Veuillez autoriser CAPTEN dans les réglages de votre téléphone/navigateur pour pointer.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Impossible de détecter votre position. Es-tu dans un sous-sol ou un tunnel ?";
              break;
            case error.TIMEOUT:
              errorMessage = "Le délai d'attente GPS est dépassé. Veuillez réessayer dans un espace plus dégagé.";
              break;
          }
          setGeoError(errorMessage);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000, // 10 secondes maximum d'attente pour capter les satellites
          maximumAge: 0   // Interdit l'utilisation d'une position stockée en cache
        }
      );
    };

    acquirePosition(true);
  }, [isCheckingProfile, runner]);

  // Handle identification form submit
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputPhone.trim()) return;

    setIsIdentifying(true);
    setIdentifyError(null);

    try {
      const response = await fetch('/api/runners/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inputName.trim(),
          phone: inputPhone.trim(),
          run_id: runId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRunner(data.runner);
        if (typeof window !== "undefined") {
          localStorage.setItem('capten_runner_profile', JSON.stringify(data.runner));
        }
      } else {
        setIdentifyError(data.error || "Une erreur s'est produite lors de la connexion.");
      }
    } catch (err) {
      setIdentifyError("Erreur réseau. Impossible de contacter le serveur.");
    } finally {
      setIsIdentifying(false);
    }
  };

  // Trigger GPS Checkin action
  const handleCheckin = async () => {
    if (!location || !runner) return;

    setIsCheckingIn(true);
    setCheckinError(null);

    try {
      const response = await fetch('/api/runs/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id: runId,
          runner_id: runner.id,
          latitude_user: location.latitude,
          longitude_user: location.longitude
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCheckinSuccess(true);
        if (data.distance !== undefined) {
          setDistance(data.distance);
        }
        
        // Update local streak count in LocalStorage
        const updated = { ...runner, streak_count: (runner.streak_count || 0) + 1 };
        setRunner(updated);
        localStorage.setItem('capten_runner_profile', JSON.stringify(updated));
      } else {
        setCheckinError(data.error || "Échec de la validation GPS.");
        if (data.distance !== undefined) {
          setDistance(data.distance);
        }
      }
    } catch (err) {
      setCheckinError("Erreur réseau lors de la validation. Veuillez réessayer.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("Voulez-vous réinitialiser le profil mémorisé sur ce téléphone ?")) {
      localStorage.removeItem('capten_runner_profile');
      setRunner(null);
      setCheckinSuccess(false);
      setCheckinError(null);
      setLocation(null);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;

    setIsSubmittingReport(true);
    setReportError(null);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id: runId,
          runner_id: runner?.id || null,
          type: reportType,
          priority: reportPriority,
          anonymous: reportAnonymous,
          reporter_name: reportAnonymous ? null : runner?.name || null,
          reporter_phone: reportAnonymous ? null : runner?.phone || null,
          involved: reportInvolved.trim() || null,
          details: reportDetails.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setReportSuccess(true);
      } else {
        setReportError(data.error || "Une erreur s'est produite lors de l'envoi du signalement.");
      }
    } catch (err) {
      setReportError("Erreur réseau. Impossible d'envoyer le signalement.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Loading state
  if (isCheckingProfile || isLoadingRun) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-form-single bg-white rounded-card-outer shadow-xl p-8 space-y-4 text-center">
          <Loader2 size={32} className="text-[#FF5C00] animate-spin mx-auto" />
          <p className="text-[14px] font-bold text-black uppercase tracking-wider">Connexion Satellite...</p>
        </div>
      </div>
    );
  }

  // --- CASE 1: NOT IDENTIFIED (FIRST RUN / NEW BROWSER) ---
  if (!runner) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-form-single bg-white rounded-card-outer shadow-2xl p-8 space-y-8 text-black animate-scale-up">
          
          <div className="text-center space-y-2">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt="Logo Club" className="h-16 w-auto object-contain mb-4 max-w-[120px] rounded-md shadow-sm mx-auto animate-scale-up" />
            ) : (
              <div className="w-14 h-14 bg-black rounded-control flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-[#FF5C00]" />
              </div>
            )}
            <h1 className="text-[26px] font-display italic font-black uppercase text-black leading-none tracking-tight">
              Bienvenue au club !
            </h1>
            <p className="text-[11px] font-black text-[#A3A3A3] uppercase tracking-widest">
              Pointage & Identification V1
            </p>
          </div>

          <p className="text-xs text-neutral-500 text-center leading-relaxed font-medium">
            Entrez vos coordonnées pour valider votre présence. Votre téléphone mémorisera votre profil pour que les prochains runs soient validés en 1 clic.
          </p>

          {identifyError && (
            <div className="bg-[#FFF5F5] border border-rose-100 rounded-card-inner p-4 flex gap-3 text-rose-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="font-bold leading-normal">{identifyError}</p>
            </div>
          )}

          <form onSubmit={handleIdentify} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black text-[#A3A3A3] uppercase tracking-wider block">
                Prénom & Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-[#A3A3A3]" size={16} />
                <input
                  type="text"
                  required
                  placeholder="ex: Julien Rochedieu"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="brutalist-input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black text-[#A3A3A3] uppercase tracking-wider block">
                Numéro de téléphone portable
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-[#A3A3A3]" size={16} />
                <input
                  type="tel"
                  required
                  placeholder="ex: 0612345678"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  className="brutalist-input pl-10"
                />
              </div>
              <span className="text-[8px] text-[#A3A3A3] block leading-relaxed italic">
                {"Sert d'identifiant unique. Si vous avez déjà signé la décharge ou couru, entrez votre numéro d'origine pour récupérer vos stats."}
              </span>
            </div>

            <button
              type="submit"
              disabled={isIdentifying}
              className="btn-lg-cta disabled:opacity-50"
            >
              {isIdentifying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  RECHERCHE DU PROFIL...
                </>
              ) : (
                <>
                  {"Valider et s'identifier "} <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // --- CASE 2: IDENTIFIED BUT WAIVER IS NOT SIGNED ---
  if (!runner.signed_waiver) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-form-single bg-white rounded-card-outer shadow-2xl p-8 space-y-8 text-black animate-scale-up text-center">
          
          <div className="space-y-2">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt="Logo Club" className="h-16 w-auto object-contain mb-4 max-w-[120px] rounded-md shadow-sm mx-auto animate-scale-up" />
            ) : (
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-control flex items-center justify-center mx-auto mb-4 text-rose-600">
                <ShieldCheck size={28} />
              </div>
            )}
            <h1 className="text-[24px] font-display italic font-black uppercase text-black leading-none tracking-tight">
              Décharge Obligatoire
            </h1>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
              PROTECTION JURIDIQUE CAPTEN
            </p>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            Salut <strong>{runner.name}</strong> ! Notre assureur exige que chaque coureur signe notre décharge numérique avant de prendre le départ. 
          </p>

          <div className="bg-[#FFF5F5] border border-rose-100 rounded-card-inner p-4 text-left text-rose-700 text-xs leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-rose-800">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Signature manquante
            </p>
            <p>Une signature numérique immuable avec archivage de votre adresse IP est requise pour débloquer le pointage GPS.</p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push(`/waiver?runnerId=${runner.id}&runId=${runId}`)}
              className="btn-lg-cta bg-[#FF5C00] hover:bg-black"
            >
              ✍️ Signer ma décharge (10s)
            </button>
            
            <button 
              onClick={handleDisconnect}
              className="text-[10px] font-mono font-bold text-[#A3A3A3] hover:text-black uppercase tracking-wider underline cursor-pointer"
            >
              {"Ce n'est pas moi (Changer de profil)"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- CASE 3: IDENTIFIED & WAIVER SIGNED (GEOFENCED CHECK-IN INTERFACE) ---
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-form-single bg-white rounded-card-outer shadow-2xl p-8 space-y-8 text-black animate-scale-up text-center relative">
        
        {/* Streak Counter display */}
        <div className="absolute top-6 right-6 bg-[#FF5C00]/10 border border-[#FF5C00]/20 text-[#FF5C00] rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase select-none">
          <Award className="w-3.5 h-3.5 fill-[#FF5C00]/10" />
          ASSIDUITÉ : {runner.streak_count || 0}
        </div>

        {/* Header */}
        <div className="space-y-2">
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoUrl} alt="Logo Club" className="h-16 w-auto object-contain mb-4 max-w-[120px] rounded-md shadow-sm mx-auto animate-scale-up" />
          ) : (
            <div className="w-16 h-16 bg-black rounded-control flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-[#FF5C00]" />
            </div>
          )}
          <h1 className="text-[26px] font-display italic font-black uppercase text-black leading-none tracking-tight">
            Pointage Satellite
          </h1>
          <p className="text-[11px] font-black text-[#A3A3A3] uppercase tracking-widest">
            {runDetails ? runDetails.title : "Validation de présence"}
          </p>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed font-medium">
          Salut <strong>{runner.name}</strong> ! Prêt pour le départ ? Cliquez ci-dessous pour valider votre check-in GPS.
        </p>

        {/* Location acquisition block */}
        <div className="min-h-[120px] flex flex-col justify-center items-center">
          {isLocating && (
            <div className="space-y-3 flex flex-col items-center">
              <Loader2 size={24} className="text-[#FF5C00] animate-spin" />
              <p className="text-xs font-bold text-black uppercase">Acquisition des coordonnées...</p>
              <p className="text-[10px] text-[#A3A3A3] text-center px-4 leading-normal">
                Nous vérifions votre position physique satellite.
              </p>
            </div>
          )}

          {geoError && (
            <div className="space-y-3 flex flex-col items-center bg-[#FFF5F5] border border-rose-100 p-4 rounded-card-inner w-full">
              <AlertTriangle size={24} className="text-[#FF0000]" />
              <p className="text-xs font-bold text-black uppercase text-center leading-normal">{geoError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary mt-2 uppercase"
              >
                Réessayer le GPS
              </button>
            </div>
          )}

          {location && !checkinSuccess && !checkinError && (
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-14 h-14 bg-[#56E39F]/10 border border-[#56E39F]/20 rounded-card-inner flex items-center justify-center">
                <Navigation size={24} className="text-[#56E39F] animate-pulse" />
              </div>
              <p className="text-xs font-bold text-[#56E39F] uppercase tracking-wider">Position Acquise ✓</p>
              {gpsAccuracy !== null && (
                <p className="text-[9px] font-mono text-neutral-400">
                  Précision du signal : ±{Math.round(gpsAccuracy)} mètres
                </p>
              )}
              <p className="text-[10px] text-[#A3A3A3] text-center px-4 leading-normal">
                Prêt pour la validation de présence GPS.
              </p>
            </div>
          )}

          {checkinError && (
            <div className="space-y-3 flex flex-col items-center bg-[#FFF5F5] border border-rose-100 p-4 rounded-card-inner w-full animate-fade-in">
              <AlertTriangle size={24} className="text-[#FF0000]" />
              <p className="text-xs font-bold text-black uppercase text-center leading-normal">{checkinError}</p>
              {distance !== null && (
                <p className="text-[11px] font-black text-[#FF0000] uppercase tracking-wide">
                  Distance : {distance}m (Seuil : 100m max)
                </p>
              )}
              <button 
                onClick={() => setCheckinError(null)}
                className="text-[10px] font-black text-[#FF0000] underline uppercase cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          )}

          {checkinSuccess && (
            <div className="space-y-4 flex flex-col items-center w-full animate-scale-up">
              <div className="w-16 h-16 bg-[#56E39F]/10 border border-[#56E39F]/20 rounded-card-inner flex items-center justify-center animate-bounce">
                <CheckCircle2 size={32} className="text-[#56E39F]" />
              </div>
              <h2 className="text-[20px] font-display italic font-black uppercase text-[#56E39F]">Présence Validée !</h2>
              <p className="text-xs text-neutral-500 leading-normal px-4">
                Assiduité enregistrée. Votre compteur d&apos;assiduité passe à <strong>{runner.streak_count}</strong>. Bon run !
              </p>
              {distance !== null && (
                <p className="text-[9px] font-mono text-neutral-400">
                  Précision satellite : {distance} mètres du départ.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        {location && !checkinSuccess && !checkinError && (
          <button
            onClick={handleCheckin}
            disabled={isCheckingIn}
            className="btn-lg-cta bg-[#FF5C00] hover:bg-black"
          >
            {isCheckingIn ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Vérification GPS...
              </>
            ) : (
              'Valider ma présence'
            )}
          </button>
        )}

        {/* Profile Disconnect */}
        <div className="pt-4 border-t border-neutral-100 flex justify-between items-center text-[9px] font-mono text-neutral-400">
          <span>Décharge Légale Signée ✓</span>
          <button 
            onClick={handleDisconnect}
            className="text-[#FF2A54] hover:underline cursor-pointer font-bold uppercase tracking-wider"
          >
            Changer de profil
          </button>
        </div>

        {/* Signaler Incident */}
        <div className="mt-4 pt-3 border-t border-dashed border-neutral-100 text-center">
          <button 
            onClick={() => {
              setIsReportModalOpen(true);
              setReportSuccess(false);
              setReportError(null);
              setReportDetails("");
              setReportInvolved("");
              setReportAnonymous(true);
            }}
            className="text-[9px] text-neutral-400 hover:text-red-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
          >
            ⚠️ Signaler un incident ou comportement inapproprié
          </button>
        </div>
      </div>

      {/* MODAL: SIGNALEMENT INCIDENT */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)} />
          <div className="relative bg-white border border-[#E5E5E5] w-full max-w-form-single rounded-card-outer shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] text-black animate-scale-up">
            <header className="px-6 py-4 border-b border-[#E5E5E5] flex justify-between items-center bg-rose-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500 w-4 h-4" />
                <div className="text-left">
                  <h3 className="text-[11px] font-mono font-black uppercase text-black leading-none">Signaler un Incident</h3>
                  <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Confidentiel & Sécurisé</span>
                </div>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="w-7 h-7 rounded-full border border-black/5 hover:border-black/10 bg-white flex items-center justify-center text-neutral-400 hover:text-black transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </header>

            {reportSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-card-inner flex items-center justify-center text-emerald-600 animate-bounce">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-xs font-mono font-black uppercase text-black">Signalement Transmis</h4>
                <p className="text-[10px] text-neutral-500 leading-normal max-w-xs">
                  Votre message a été envoyé directement au Captain du club de manière 100% confidentielle. Merci de contribuer à la sécurité du club.
                </p>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="btn-primary mt-2"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="p-6 space-y-4 text-left overflow-y-auto">
                <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">
                  Un problème pendant le run ? Dites-le nous. Ce message est envoyé directement et uniquement au Captain du club, de manière 100 % confidentielle.
                </p>

                {reportError && (
                  <div className="bg-[#FFF5F5] border border-rose-100 rounded-card-inner p-3 text-rose-700 text-[10px] font-bold">
                    {reportError}
                  </div>
                )}

                {/* Type d'incident */}
                <div className="space-y-1">
                  <label className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-wider block">Type de comportement</label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    className="brutalist-input focus:border-red-500 bg-[#F4F5F7]"
                  >
                    <option value="Comportement Toxique">Comportement Toxique</option>
                    <option value="Malaise Groupe / Tension">Malaise Groupe / Tension</option>
                    <option value="Harcèlement Sexiste/Moral">Harcèlement Sexiste/Moral</option>
                    <option value="Non-respect des Consignes">Non-respect des Consignes</option>
                    <option value="Autre Incident">Autre Incident</option>
                  </select>
                </div>

                {/* Priorité */}
                <div className="space-y-1">
                  <label className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-wider block">Niveau de Priorité</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['BASSE', 'MOYENNE', 'HAUTE'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setReportPriority(p)}
                        className={`py-2 rounded-control text-[9px] font-black uppercase tracking-wider transition-all ${
                          reportPriority === p
                            ? p === 'HAUTE' ? 'bg-red-600 text-white' : p === 'MOYENNE' ? 'bg-orange-500 text-white' : 'bg-black text-white'
                            : 'bg-neutral-50 border border-neutral-200 text-neutral-400 hover:text-black'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Membre concerné */}
                <div className="space-y-1">
                  <label className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-wider block">Membre impliqué (facultatif)</label>
                  <input
                    type="text"
                    placeholder="ex: Julien"
                    value={reportInvolved}
                    onChange={e => setReportInvolved(e.target.value)}
                    className="brutalist-input focus:border-red-500 bg-[#F4F5F7]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-wider block">Description des faits</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Décrivez précisément ce qu'il s'est passé..."
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F4F5F7] border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                {/* Anonyme Toggle */}
                <div className="bg-neutral-50 p-3 rounded-card-inner border border-neutral-250 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-black uppercase">Signaler anonymement</p>
                    <p className="text-[8px] font-semibold text-neutral-450 uppercase">Votre nom ne sera pas lié au ticket.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportAnonymous(!reportAnonymous)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center cursor-pointer ${
                      reportAnonymous ? 'bg-red-500' : 'bg-neutral-350'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      reportAnonymous ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="btn-lg-cta bg-red-650 hover:bg-black"
                >
                  {isSubmittingReport ? (
                    <>
                      <Loader2 className="animate-spin w-3.5 h-3.5" />
                      Transmission...
                    </>
                  ) : (
                    'Transmettre le signalement'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-form-single bg-white rounded-card-outer shadow-xl p-8 space-y-4 text-center">
          <Loader2 size={32} className="text-[#FF5C00] animate-spin mx-auto" />
          <p className="text-[14px] font-bold text-black uppercase tracking-wider">Initialisation GPS...</p>
        </div>
      </div>
    }>
      <CheckinFormContent />
    </Suspense>
  );
}
