'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Coffee, ArrowRight, CheckCircle2, Loader2, MessageSquare, ShieldCheck, Heart, Coins, ExternalLink, Clock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function DebriefPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params?.id as string;

  const [runDetails, setRunDetails] = useState<any>(null);
  const [isLoadingRun, setIsLoadingRun] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Mood check states
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cagnotte states
  const [runner, setRunner] = useState<any>(null);
  const [cagnotteStatus, setCagnotteStatus] = useState<string>('none');
  const [isLoadingCagnotte, setIsLoadingCagnotte] = useState(true);

  const moods = [
    { emoji: "🔥", label: "Super", desc: "Énergie au max, génial !" },
    { emoji: "🧘", label: "Rythme parfait", desc: "Allure idéale et agréable" },
    { emoji: "🥵", label: "Trop rapide", desc: "J'ai eu du mal à suivre" },
    { emoji: "😔", label: "Je me suis senti seul", desc: "Je me suis senti à l'écart" }
  ];

  // Fetch run metadata and associated club cagnotte_url
  useEffect(() => {
    async function loadRun() {
      try {
        if (typeof window !== "undefined") {
          const savedLogo = localStorage.getItem('capten_logo');
          if (savedLogo) setLogoUrl(savedLogo);
        }
        const supabase = getSupabase();
        if (supabase && runId) {
          const { data: run, error } = await supabase
            .from('runs')
            .select('title, location_start, date_start, description, vibe, club_id')
            .eq('id', runId)
            .single();

          if (run) {
            if (run.club_id) {
              const { data: club } = await supabase
                .from('clubs')
                .select('cagnotte_url')
                .eq('id', run.club_id)
                .single();
              if (club) {
                (run as any).cagnotte_url = club.cagnotte_url;
              }
            }
            setRunDetails(run);
          }
        }
      } catch (err) {
        console.error("Error fetching run details:", err);
      } finally {
        setIsLoadingRun(false);
      }
    }
    if (runId) {
      loadRun();
    } else {
      setIsLoadingRun(false);
    }
  }, [runId]);

  // Load runner profile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem('capten_runner_profile');
      if (stored) {
        try {
          setRunner(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing profile:", e);
        }
      }
    }
  }, []);

  // Fetch attendance status
  useEffect(() => {
    async function fetchAttendance() {
      if (!runId || !runner?.id) return;
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data, error } = await supabase
            .from('attendance')
            .select('cagnotte_status')
            .eq('run_id', runId)
            .eq('runner_id', runner.id)
            .maybeSingle();
          if (data) {
            setCagnotteStatus(data.cagnotte_status);
          } else {
            setCagnotteStatus('none');
          }
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setIsLoadingCagnotte(false);
      }
    }
    if (runner?.id && runId) {
      fetchAttendance();
    } else {
      setIsLoadingCagnotte(false);
    }
  }, [runner, runId]);

  const handleDeclareContribution = async () => {
    if (!runId || !runner?.id) return;
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('attendance')
          .upsert({
            run_id: runId,
            runner_id: runner.id,
            cagnotte_status: 'declared'
          }, { onConflict: 'run_id,runner_id' })
          .select()
          .single();
        if (error) {
          console.error("Error declaring contribution:", error);
        } else {
          setCagnotteStatus('declared');
        }
      }
    } catch (err) {
      console.error("Network error declaring contribution:", err);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Details contains both the comment and the mood label
    const moodObj = moods.find(m => m.emoji === selectedMood);
    const moodLabel = moodObj ? `${moodObj.emoji} ${moodObj.label}` : selectedMood;

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id: runId,
          type: "Mood Check (Feedback)",
          priority: selectedMood === "😔" ? "HAUTE" : "BASSE", // Raise priority if runner felt left out
          anonymous: true,
          involved: moodLabel,
          details: comment.trim() || `Mood Check : ${moodLabel}`
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(data.error || "Impossible d'envoyer votre avis.");
      }
    } catch (err) {
      setSubmitError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRun) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 size={32} className="text-[#FF5C00] animate-spin mb-4" />
        <p className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Chargement du cockpit...</p>
      </div>
    );
  }

  // Fallbacks if dynamic run details are absent (e.g. offline/mock run)
  const title = runDetails?.title || "SUNSET SOCIAL";
  const dateStr = runDetails?.date_start 
    ? new Date(runDetails.date_start).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long' }) 
    : "Hier soir";

  // Simulate default after-run details if not dynamic
  const afterRunVenue = "Café de la Mairie";
  const afterRunAddress = "12 rue des Spécialistes, Paris";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${afterRunVenue} ${afterRunAddress}`)}`;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-black font-sans flex flex-col items-center py-4">
      {/* HEADER SECTION */}
      <header className="w-full max-w-form-single px-6 py-6 text-center space-y-2 flex flex-col items-center justify-center">
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo Club" className="h-16 w-auto object-contain mb-2 max-w-[120px] rounded-md shadow-sm animate-scale-up" />
        )}
        <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-widest font-mono bg-[#FF5C00]/5 px-3 py-1 rounded-full">
          DÉBRIEF OFFICIEL
        </span>
        <h1 className="text-[32px] font-display italic font-black uppercase text-black leading-none tracking-tight pt-1">
          {title}
        </h1>
        <p className="text-xs text-neutral-500 font-medium font-mono capitalize">
          {dateStr}
        </p>
      </header>

      <main className="w-full max-w-form-single px-6 py-4 space-y-6 flex-1">
        
        {/* AFTER-RUN SECTION */}
        <section className="bg-white border border-[#E5E5E5] rounded-card-outer p-6 space-y-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF5C00]/10 rounded-control flex items-center justify-center text-[#FF5C00]">
              <Coffee size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-xs font-mono font-black uppercase text-neutral-400 leading-none">Bloc After-Run</h2>
              <p className="text-[16px] font-bold text-black pt-1">Où se retrouve le crew ?</p>
            </div>
          </div>

          <div className="border-t border-neutral-200/60 pt-4 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-neutral-600">
              <MapPin className="w-4 h-4 text-[#FF5C00] shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="font-bold text-black block">{afterRunVenue}</span>
                <span className="text-neutral-500">{afterRunAddress}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-500 italic leading-relaxed text-left">
              « Nouveau dans le club ? Rejoins-nous pour le café d'après-run, la table CAPTEN est réservée au fond ! »
            </p>
          </div>

          <a 
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-lg-cta bg-black hover:bg-[#FF5C00]"
          >
            🗺️ Rejoindre le social spot sur Google Maps
          </a>
        </section>

        {/* CAGNOTTE POST-RUN SECTION */}
        {runDetails?.cagnotte_url && (
          <section className="bg-white border border-[#E5E5E5] rounded-card-outer p-6 space-y-5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF5C00]/10 rounded-control flex items-center justify-center text-[#FF5C00]">
                <Coins size={20} />
              </div>
              <div className="text-left">
                <h2 className="text-xs font-mono font-black uppercase text-neutral-400 leading-none">Cagnotte & Ravito</h2>
                <p className="text-[16px] font-bold text-black pt-1">Participer au ravito d'après-run</p>
              </div>
            </div>

            <div className="border-t border-neutral-200/60 pt-4 space-y-4">
              <p className="text-xs text-neutral-550 leading-relaxed text-left">
                Pour que les sessions restent gratuites et chaleureuses, contribuez à hauteur de ce que vous voulez / pouvez pour le ravito (boissons, snacks, café).
              </p>

              {/* Button to open payment link */}
              <a 
                href={runDetails.cagnotte_url.startsWith('http') ? runDetails.cagnotte_url : `https://${runDetails.cagnotte_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lg-cta bg-[#FF5C00] hover:bg-black flex items-center justify-center gap-2 text-white"
              >
                <span>💸 Envoyer ma contribution (Sumeria/PayPal/Revolut)</span>
                <ExternalLink size={14} />
              </a>

              {/* Declarative section depending on cagnotteStatus */}
              <div className="pt-2">
                {isLoadingCagnotte ? (
                  <div className="flex items-center justify-center py-2 text-neutral-400 text-xs gap-2">
                    <Loader2 size={14} className="animate-spin text-[#FF5C00]" />
                    <span>Chargement du statut...</span>
                  </div>
                ) : !runner ? (
                  <p className="text-[10px] text-neutral-400 italic text-center">
                    Identifiez-vous ou validez votre présence pour déclarer votre contribution.
                  </p>
                ) : cagnotteStatus === 'none' ? (
                  <button
                    onClick={handleDeclareContribution}
                    className="w-full py-3 bg-[#F4F5F7] border border-black/10 rounded-control hover:border-[#FF5C00] hover:bg-[#FF5C00]/5 text-xs font-bold text-neutral-600 hover:text-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <div className="w-4 h-4 border border-black/20 rounded flex items-center justify-center bg-white">
                      {/* Empty checkbox */}
                    </div>
                    <span>J'ai envoyé ma contribution</span>
                  </button>
                ) : cagnotteStatus === 'declared' ? (
                  <div className="bg-[#FFF8E6] border border-[#FFE8B3] rounded-card-inner p-4 flex items-center justify-between text-left animate-scale-up">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#B37400] flex items-center gap-1.5 uppercase tracking-wide">
                        <Clock className="w-4 h-4 shrink-0 text-[#FF9900]" /> Contribution déclarée
                      </p>
                      <p className="text-[10px] text-[#805200]">Le Captain doit valider votre contribution.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#FFE8B3] text-[#805200] px-2 py-1 rounded-full uppercase tracking-wider">
                      En attente
                    </span>
                  </div>
                ) : cagnotteStatus === 'verified' ? (
                  <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-card-inner p-4 flex items-center justify-between text-left animate-scale-up">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> Contribution validée !
                      </p>
                      <p className="text-[10px] text-emerald-600">Merci d'avoir contribué à la cohésion du club.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#A7F3D0] text-emerald-800 px-2 py-1 rounded-full uppercase tracking-wider">
                      Validé ✓
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {/* FEEDBACK MODULE (MOOD CHECK) */}
        <section className="bg-white border border-[#E5E5E5] rounded-card-outer p-6 space-y-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-control flex items-center justify-center text-black">
              <Heart size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-xs font-mono font-black uppercase text-neutral-400 leading-none">Mood Check</h2>
              <p className="text-[16px] font-bold text-black pt-1">Ton avis en 2 secondes</p>
            </div>
          </div>

          <div className="border-t border-neutral-200/60 pt-4">
            {isSubmitted ? (
              <div className="py-6 text-center space-y-4 animate-scale-up">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-card-inner flex items-center justify-center text-emerald-500 mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-sm font-bold uppercase text-black">Avis enregistré !</h3>
                <p className="text-xs text-neutral-500 leading-relaxed px-4">
                  Merci ! Ton retour a été transmis de manière 100% anonyme au Captain pour l'aider à améliorer les prochaines sessions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-6 text-left">
                {submitError && (
                  <div className="bg-[#FFF5F5] border border-rose-100 rounded-card-inner p-3 text-rose-700 text-[10px] font-bold">
                    {submitError}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-wider block">
                    Comment s'est passée ta course ?
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {moods.map((m) => (
                      <button
                        key={m.emoji}
                        type="button"
                        onClick={() => setSelectedMood(m.emoji)}
                        className={`p-4 rounded-card-inner border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          selectedMood === m.emoji
                            ? 'border-[#FF5C00] bg-[#FF5C00]/5 text-black'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-500'
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide">{m.label}</span>
                        <span className="text-[8px] text-neutral-400 font-medium block leading-none">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-wider block">
                    Remarque ou suggestion pour le club (Optionnel & Anonyme)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Allure trop rapide ? Manque d'accompagnement ? Dites-nous..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F4F5F7] border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all resize-none placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedMood || isSubmitting}
                  className="btn-lg-cta bg-[#FF5C00] hover:bg-black disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      ENVOI DE L'AVIS...
                    </>
                  ) : (
                    <>
                      Envoyer mon feedback anonyme <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-form-single border-t border-[#F4F4F5] px-6 py-6 text-center space-y-2 text-[10px] font-mono text-neutral-400">
        <div className="flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Mood Check Confidentiel · Propulsé par CAPTEN
        </div>
      </footer>
    </div>
  );
}
