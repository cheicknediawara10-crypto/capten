'use client';

import React, { useState, useTransition, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, MapPin, Search, ArrowLeft, Flame, AlertCircle, 
  CheckCircle2, Clock, ShieldCheck, MapPinCheck, HelpCircle, RotateCcw, Check,
  Sparkles, Brain, Lock, Copy
} from 'lucide-react';
import { manualCheckInRunner } from '@/app/actions/manual-checkin';
import { getSupabase } from '@/lib/supabase';

interface RunnerInfo {
  id: string;
  name: string;
  phone: string;
  streak_count: number;
}

interface Registration {
  id: string;
  status: string;
  checked_in_at: string | null;
  check_in_method: string | null;
  cagnotte_status?: string;
  runners: RunnerInfo;
}

interface RunInfo {
  id: string;
  title: string;
  description: string | null;
  date_start: string;
  location_start: string;
  max_slots: number | null;
  slots_taken: number;
  vibe: string;
  coach: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  short_code?: string;
}

interface ClientProps {
  run: RunInfo;
  initialRegistrations: Registration[];
  isDemo: boolean;
}

export default function RunDashboardClient({ run, initialRegistrations, isDemo }: ClientProps) {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [runStatus, setRunStatus] = useState<string>(run.status);

  const handleEndRun = async () => {
    try {
      const supabase = getSupabase();
      if (!isDemo && supabase) {
        const { error } = await supabase
          .from('runs')
          .update({ status: 'completed' })
          .eq('id', run.id);
        if (error) throw error;
      }
      setRunStatus('completed');
    } catch (err) {
      alert("Erreur lors de la clôture du run.");
    }
  };

  const isCheckRetourActive = useMemo(() => {
    if (runStatus !== 'completed' && runStatus !== 'ended') return false;
    const startTime = new Date(run.date_start).getTime();
    const estimatedEndTime = startTime + 2 * 60 * 60 * 1000;
    const validityEndTime = estimatedEndTime + 12 * 60 * 60 * 1000;
    return Date.now() < validityEndTime;
  }, [runStatus, run.date_start]);

  // AI summary states
  const [summary, setSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryCount, setSummaryCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetch(`/api/copilot/debrief?run_id=${run.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSummary(data.summary);
        setSummaryCount(data.count || 0);
        setIsLocked(data.isLocked || false);
      } else {
        setSummaryError(data.error || "Impossible de générer la synthèse.");
        if (data.isLocked) {
          setIsLocked(true);
          setSummary(data.summary);
        }
      }
    } catch (e) {
      setSummaryError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    handleGenerateSummary();
  }, [run.id]);

  const handleVerifyCagnotte = async (runnerId: string) => {
    // 1. Sauvegarder l'état précédent pour pouvoir y revenir en cas d'erreur
    const previousRegistrations = [...registrations];
    
    // 2. Mise à jour optimiste
    setRegistrations(prev => prev.map(reg => {
      if (reg.runners.id === runnerId) {
        return {
          ...reg,
          cagnotte_status: 'verified'
        };
      }
      return reg;
    }));

    if (isDemo) return;

    try {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase
          .from('attendance')
          .upsert({
            run_id: run.id,
            runner_id: runnerId,
            cagnotte_status: 'verified'
          }, { onConflict: 'run_id,runner_id' });

        if (error) {
          console.error("Error verifying contribution in DB:", error);
          setRegistrations(previousRegistrations);
          setErrorMessage("Impossible de valider la contribution en base de données.");
          setTimeout(() => setErrorMessage(null), 4000);
        }
      }
    } catch (err) {
      console.error("Network error verifying contribution:", err);
      setRegistrations(previousRegistrations);
      setErrorMessage("Erreur réseau lors de la validation.");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Mettre à jour localement un statut de pointage (Optimistic)
  const handleManualCheckIn = async (registrationId: string) => {
    // 1. Sauvegarder l'état précédent pour pouvoir y revenir en cas d'erreur
    const previousRegistrations = [...registrations];
    
    // 2. Mise à jour optimiste immédiate dans l'état local
    setRegistrations(prev => prev.map(reg => {
      if (reg.id === registrationId) {
        return {
          ...reg,
          status: 'checked_in',
          check_in_method: 'manual_captain',
          checked_in_at: new Date().toISOString()
        };
      }
      return reg;
    }));
    setErrorMessage(null);

    // 3. Appel de la Server Action en tâche de fond
    startTransition(async () => {
      const res = await manualCheckInRunner(registrationId);
      
      if (res && res.error) {
        // En cas d'erreur rare, annuler l'état visuel et afficher un message d'erreur discret
        setRegistrations(previousRegistrations);
        setErrorMessage(res.error);
        
        // Cacher le message d'erreur après 4 secondes
        setTimeout(() => {
          setErrorMessage(null);
        }, 4000);
      }
    });
  };

  // Calcul des statistiques dynamiques sur l'état courant
  const stats = useMemo(() => {
    const total = registrations.length;
    const checkedIn = registrations.filter(r => r.status === 'checked_in');
    const checkedInGPS = checkedIn.filter(r => r.check_in_method !== 'manual_captain').length;
    const checkedInManual = checkedIn.filter(r => r.check_in_method === 'manual_captain').length;
    const waitlisted = registrations.filter(r => r.status === 'waitlisted').length;
    const registered = registrations.filter(r => r.status === 'registered').length;
    
    return {
      total,
      checkedInTotal: checkedIn.length,
      checkedInGPS,
      checkedInManual,
      waitlisted,
      registered
    };
  }, [registrations]);

  // Filtrer la liste des coureurs par barre de recherche
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;
    const query = searchQuery.toLowerCase();
    return registrations.filter(reg => 
      (reg.runners?.name || '').toLowerCase().includes(query) || 
      (reg.runners?.phone || '').includes(query)
    );
  }, [registrations, searchQuery]);

  // Formater la date du run
  const formattedDate = useMemo(() => {
    try {
      const dateObj = new Date(run.date_start);
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      return `${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]} · ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    } catch {
      return run.date_start;
    }
  }, [run.date_start]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 select-none">
      
      {/* BOUTON RETOUR & LIVE STATUS */}
      <div className="flex justify-between items-center">
        <Link href="/runs" className="text-[10px] font-black uppercase tracking-widest text-[#FF5C00] flex items-center gap-1.5 hover:underline">
          <ArrowLeft size={12} /> RETOUR AUX SORTIES
        </Link>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="bg-[#F4F5F7] text-neutral-500 border border-black/5 text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[4px] italic">
              MODE DÉMONSTRATION
            </span>
          )}
          {runStatus !== 'completed' && runStatus !== 'ended' && (
            <button
              onClick={handleEndRun}
              className="bg-black hover:bg-[#FF5C00] text-white transition-colors border border-black/5 px-3 py-1.5 rounded-[4px] text-[8.5px] font-black uppercase tracking-widest cursor-pointer"
            >
              🏁 Marquer comme terminé
            </button>
          )}
          <div className="bg-[#FF5C00] text-white px-2.5 py-1 rounded-[4px] text-[8.5px] font-black uppercase tracking-widest italic animate-pulse">
            LIVE TRACKING
          </div>
        </div>
      </div>

      {/* EN-TÊTE DU COMMANDEMENT */}
      <header className="pb-6 border-b-[0.5px] border-black/10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-[28px] sm:text-[44px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
            MASTER PASS : {run.title}
          </h1>
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
            PANNEAU DE POINTAGE DE SÉCURITÉ ET D'ASSISTANCE CAPTAIN
          </p>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-[11px] font-bold text-neutral-600 uppercase">
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#FF5C00]" /> {formattedDate}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#FF5C00]" /> {run.location_start}</span>
            <span className="flex items-center gap-1.5"><Users size={14} className="text-[#FF5C00]" /> {run.coach} ({run.vibe})</span>
          </div>
        </div>
      </header>

      {/* CARD CHECK RETOUR */}
      {isCheckRetourActive && (
        <CheckRetourSection
          runId={run.id}
          shortCode={run.short_code || ''}
          registrations={registrations}
          isDemo={isDemo}
        />
      )}

      {/* TOAST D'ERREUR DISCRET */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white text-xs border border-white/10 rounded-[12px] px-5 py-4 shadow-2xl flex items-center gap-3 animate-fade-in max-w-sm">
          <AlertCircle className="text-[#FF5C00] shrink-0" size={18} />
          <div>
            <p className="font-bold uppercase tracking-wider text-[10px]">Échec de la validation</p>
            <p className="text-neutral-400 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* GRILLE DE POINTAGE KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-[0.5px] border-black/10 rounded-[16px] p-5 shadow-sm space-y-1">
          <p className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.15em] italic">INSCRITS TOTAL</p>
          <h3 className="text-[28px] font-display italic font-black text-black leading-none">
            {stats.total} <span className="text-[12px] text-neutral-400 font-sans font-bold">/ {run.max_slots || '∞'}</span>
          </h3>
          <p className="text-[8px] font-medium text-neutral-500 uppercase tracking-wider">PLACES RÉSERVÉES</p>
        </div>

        <div className="bg-white border-[0.5px] border-black/10 rounded-[16px] p-5 shadow-sm space-y-1">
          <p className="text-[8px] font-black text-[#56E39F] uppercase tracking-[0.15em] italic">PRÉSENTS VALIDÉS</p>
          <h3 className="text-[28px] font-display italic font-black text-[#56E39F] leading-none">
            {stats.checkedInTotal}
          </h3>
          <p className="text-[8.5px] font-mono text-neutral-500 leading-none">
            📍 {stats.checkedInGPS} GPS · ✅ {stats.checkedInManual} MANUEL
          </p>
        </div>

        <div className="bg-white border-[0.5px] border-black/10 rounded-[16px] p-5 shadow-sm space-y-1">
          <p className="text-[8px] font-black text-[#FF5C00] uppercase tracking-[0.15em] italic">ATTENTE VIRTUELLLE</p>
          <h3 className="text-[28px] font-display italic font-black text-[#FF5C00] leading-none">
            {stats.waitlisted}
          </h3>
          <p className="text-[8px] font-medium text-neutral-500 uppercase tracking-wider">EN FILE D'ATTENTE</p>
        </div>

        <div className="bg-white border-[0.5px] border-black/10 rounded-[16px] p-5 shadow-sm space-y-1">
          <p className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.15em] italic">ABSENTS / EN ATTENTE</p>
          <h3 className="text-[28px] font-display italic font-black text-neutral-400 leading-none">
            {stats.registered}
          </h3>
          <p className="text-[8px] font-medium text-neutral-500 uppercase tracking-wider">SUR LA LIGNE DE DÉPART</p>
        </div>
      </div>

      {/* COMPOSANTS DE RECHERCHE ET LISTE */}
      <div className="bg-white border-[0.5px] border-black/10 rounded-[20px] p-6 shadow-sm space-y-6">
        
        {/* BARRE DE RECHERCHE */}
        <div className="flex justify-between items-center gap-4 flex-col sm:flex-row">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input 
              type="text"
              placeholder="Rechercher un coureur par nom ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl pl-10 pr-4 py-3 text-xs text-black font-bold outline-none placeholder-neutral-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[9px] font-black uppercase text-neutral-500 tracking-wider hover:text-black shrink-0 border border-black/10 px-3 py-2 rounded-[8px]"
            >
              EFFACER
            </button>
          )}
        </div>

        {/* LE CREW */}
        <div className="space-y-3">
          {filteredRegistrations.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 border border-dashed border-black/10 rounded-[16px] space-y-2">
              <HelpCircle className="mx-auto text-neutral-300" size={28} />
              <p className="text-xs font-bold uppercase tracking-wider text-black">Aucun coureur trouvé</p>
              <p className="text-[10px] text-neutral-400">Essayez une autre recherche ou vérifiez l'orthographe.</p>
            </div>
          ) : (
            filteredRegistrations.map((reg) => (
              <div 
                key={reg.id} 
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-[16px] border transition-all duration-300 gap-4 ${
                  reg.status === 'checked_in' 
                    ? 'bg-[#56E39F]/5 border-[#56E39F]/20' 
                    : reg.status === 'waitlisted'
                      ? 'bg-neutral-50 border-neutral-200 opacity-80'
                      : 'bg-white border-black/10 hover:border-black/20'
                }`}
              >
                
                {/* DETAILS COUREUR */}
                <div className="flex items-center gap-3">
                  {/* Photo de profil factice */}
                  <div className="w-9 h-9 rounded-full bg-[#F4F5F7] border-[0.5px] border-black/5 flex items-center justify-center font-display italic font-black text-xs text-neutral-400 shrink-0">
                    {(reg.runners?.name || '??').substring(0, 2).toUpperCase()}
                  </div>
                  
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black uppercase text-black">{reg.runners.name}</span>
                      {reg.runners.streak_count > 0 && (
                        <span className="flex items-center gap-0.5 bg-[#FF5C00]/10 text-[#FF5C00] font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          <Flame size={10} fill="#FF5C00" /> {reg.runners.streak_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">{reg.runners.phone}</p>
                  </div>
                </div>

                {/* STATUT / ACTIONS POINTAGE */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-black/5">
                  
                  {/* Badge de statut */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Statut Cagnotte / Contribution */}
                    {reg.cagnotte_status === 'declared' && (
                      <div className="flex items-center gap-1">
                        <span className="bg-[#FFF8E6] text-[#B37400] border border-[#FFE8B3] px-2.5 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 animate-scale-up">
                          <Clock size={12} className="text-[#FF9900]" /> ⏳ Contribution Déclarée
                        </span>
                        <button
                          onClick={() => handleVerifyCagnotte(reg.runners.id)}
                          className="bg-emerald-50 border border-emerald-200 hover:bg-[#56E39F] hover:text-white text-emerald-800 px-2.5 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 transition-all cursor-pointer"
                          title="Valider la contribution"
                        >
                          <Check size={12} /> Valider
                        </button>
                      </div>
                    )}

                    {reg.cagnotte_status === 'verified' && (
                      <span className="bg-[#ECFDF5] text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 animate-scale-up">
                        <CheckCircle2 size={12} className="text-emerald-500" /> 🟢 Contribution Validée
                      </span>
                    )}

                    {reg.status === 'waitlisted' && (
                      <span className="bg-neutral-200 text-neutral-600 px-3 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                        <Clock size={12} /> LISTE D'ATTENTE
                      </span>
                    )}

                    {reg.status === 'checked_in' && (
                      reg.check_in_method === 'manual_captain' ? (
                        <span className="bg-[#56E39F]/20 text-[#2AA968] border border-[#56E39F]/30 px-3 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> ✅ Présent (Manuel)
                        </span>
                      ) : (
                        <span className="bg-[#56E39F]/20 text-[#2AA968] border border-[#56E39F]/30 px-3 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                          <MapPinCheck size={12} /> 📍 Présent (GPS)
                        </span>
                      )
                    )}

                    {reg.status === 'registered' && (
                      <span className="bg-[#F4F5F7] text-neutral-400 px-2.5 py-1 rounded-[6px] text-[8px] font-bold uppercase tracking-wider">
                        NON POINTÉ
                      </span>
                    )}
                  </div>

                  {/* Bouton d'action Master Pass */}
                  {reg.status === 'registered' && (
                    <button
                      onClick={() => handleManualCheckIn(reg.id)}
                      disabled={isPending}
                      className="border border-[#56E39F] text-[#2AA968] bg-transparent px-4 py-2 rounded-[8px] text-[9.5px] font-black uppercase tracking-widest hover:bg-[#56E39F] hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 select-none cursor-pointer"
                    >
                      <ShieldCheck size={14} /> VALIDER MANUELLEMENT
                    </button>
                  )}

                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* SELECTION DEBRIEFING IA */}
      <section className="bg-white border-[0.5px] border-black/10 rounded-[20px] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF5C00]/10 rounded-[12px] flex items-center justify-center text-[#FF5C00]">
              <Sparkles size={20} className="animate-pulse text-[#FF5C00]" />
            </div>
            <div className="text-left">
              <h3 className="text-[18px] font-display italic font-black uppercase text-black leading-none">Synthèse IA de fin de Run</h3>
              <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">Analyse intelligente de tous les débriefings reçus</p>
            </div>
          </div>
          {summaryCount > 0 && !isLocked && (
            <div className="bg-black text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest font-mono">
              {summaryCount} RETOURS ANALYSÉS
            </div>
          )}
        </div>

        {isLoadingSummary ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest animate-pulse">Le Copilote IA analyse les débriefings...</p>
          </div>
        ) : isLocked ? (
          <div className="relative rounded-card-inner overflow-hidden bg-gradient-to-br from-neutral-900 to-black text-white p-6 sm:p-8 flex flex-col items-center text-center space-y-4 shadow-xl border border-red-500/25">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-[#FF5C00] mb-2 border border-red-500/20">
              <Lock size={20} className="text-red-500" />
            </div>
            <h4 className="text-[20px] font-display italic font-black uppercase tracking-tight text-white leading-none">
              SYNTHÈSE IA VERROUILLÉE
            </h4>
            <p className="text-neutral-400 text-xs font-medium max-w-md leading-relaxed">
              {summary}
            </p>
            <Link 
              href="/plan" 
              className="btn-primary bg-[#FF5C00] hover:bg-white text-white hover:text-black border-none px-6 py-3 font-mono font-bold tracking-widest text-[9.5px]"
            >
              🚀 PASSER À CAPTEN PRO
            </Link>
          </div>
        ) : summaryError ? (
          <div className="bg-red-50 border border-red-100 rounded-card-inner p-4 text-center space-y-3">
            <p className="text-xs text-red-700 font-bold uppercase tracking-wider">{summaryError}</p>
            <button
              onClick={handleGenerateSummary}
              className="btn-secondary text-[10px] font-black uppercase tracking-widest px-4 py-2"
            >
              Réessayer la génération
            </button>
          </div>
        ) : (
          <div className="bg-[#FDFCF8] border border-black/5 rounded-card-inner p-5 sm:p-6 space-y-4 text-left shadow-inner">
            <div className="prose prose-neutral max-w-none text-xs font-bold text-neutral-800 uppercase tracking-wide leading-relaxed font-sans whitespace-pre-line">
              {summary}
            </div>
            
            <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-wider italic">
                Sujet aux conditions du Copilote IA Capten · Analyse en temps réel
              </p>
              <button 
                onClick={handleGenerateSummary}
                className="text-[9px] font-black uppercase text-[#FF5C00] tracking-widest hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                🔄 ACTUALISER L'ANALYSE
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

// --- SUBCOMPONENT: CHECK RETOUR PANEL ---
function CheckRetourSection({
  runId,
  shortCode,
  registrations,
  isDemo
}: {
  runId: string;
  shortCode: string;
  registrations: Registration[];
  isDemo: boolean;
}) {
  const [confirmations, setConfirmations] = useState<{ coureur_id: string }[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (isDemo) {
        const present = registrations.filter(r => r.status === 'checked_in');
        if (present.length > 2) {
          setConfirmations(present.slice(0, Math.floor(present.length / 2)).map(p => ({ coureur_id: p.runners.id })));
        }
        return;
      }
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase
          .from('check_retour')
          .select('coureur_id')
          .eq('run_id', runId);
        if (data) setConfirmations(data);
      }
    }
    load();
  }, [runId, registrations, isDemo]);

  const presentRunners = useMemo(() => {
    return registrations.filter(r => r.status === 'checked_in');
  }, [registrations]);

  const confirmedIds = useMemo(() => new Set(confirmations.map(c => c.coureur_id)), [confirmations]);
  const confirmedCount = useMemo(() => presentRunners.filter(r => confirmedIds.has(r.runners.id)).length, [presentRunners, confirmedIds]);
  const nonConfirmedRunners = useMemo(() => presentRunners.filter(r => !confirmedIds.has(r.runners.id)), [presentRunners, confirmedIds]);

  const copyMessage = async () => {
    const link = `capten.app/r/${shortCode}`;
    const text = `Run fini ! J'espère que vous avez kiffé 🔥\nConfirme que t'es bien rentré(e) 👇\n${link}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      alert("Erreur lors de la copie. Copie manuellement : " + link);
    }
  };

  const handleManualConfirm = async (runnerId: string) => {
    if (isDemo) {
      setConfirmations(prev => [...prev, { coureur_id: runnerId }]);
      return;
    }
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('check_retour')
          .insert({
            run_id: runId,
            coureur_id: runnerId,
            crew_id: user?.id,
            manual: true,
            confirmed_by: user?.id
          });
        if (!error) {
          setConfirmations(prev => [...prev, { coureur_id: runnerId }]);
        } else {
          alert("Erreur lors de la confirmation manuelle : " + error.message);
        }
      }
    } catch (err: any) {
      alert("Erreur réseau.");
    }
  };

  const pct = presentRunners.length > 0 ? Math.round((confirmedCount / presentRunners.length) * 100) : 0;
  const nonConfirmedNames = nonConfirmedRunners.map(r => r.runners.name.split(' ')[0]).join(', ');

  return (
    <div className="bg-[#FDFCF8] border-[1.5px] border-[#FF5C00]/25 rounded-[20px] p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-display italic font-black text-xl uppercase tracking-tight flex items-center gap-2 text-black">
            🏠 CHECK RETOUR ACTIF
          </h3>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
            Vérifie que tout le monde est bien rentré après la séance
          </p>
        </div>
        <span className="font-mono text-xs font-black text-[#FF5C00] bg-[#FF5C00]/10 px-3 py-1 rounded-full">
          {pct}% confirmés
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold font-mono">
          <span className="text-[#FF5C00]">{confirmedCount} confirmés</span>
          <span className="text-neutral-400">{presentRunners.length} au départ</span>
        </div>
        <div className="w-full bg-black/5 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-[#FF5C00] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Awaiting List */}
      {nonConfirmedRunners.length > 0 ? (
        <div className="bg-rose-50 border border-rose-500/10 rounded-[14px] p-3.5 text-[11px] font-bold text-neutral-700">
          <span className="text-rose-500 uppercase tracking-wider font-extrabold mr-1">⚠️ EN ATTENTE :</span>
          {nonConfirmedNames}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-500/10 rounded-[14px] p-3.5 text-[11px] font-bold text-emerald-700">
          🎉 Tout le monde est bien rentré ! Beau travail Captain.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={copyMessage}
          className={`flex-1 py-3.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 min-h-[44px] cursor-pointer ${
            copyFeedback 
              ? 'bg-[#00FF66] text-black shadow-lg shadow-[#00FF66]/20 ring-2 ring-[#00FF66]' 
              : 'bg-black text-white hover:bg-black/90'
          }`}
        >
          {copyFeedback ? 'COPIÉ ! ✅' : 'Copier le message'}
        </button>

        {nonConfirmedRunners.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 py-3.5 bg-white border border-black/10 hover:border-[#FF5C00] text-black hover:text-[#FF5C00] rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all active:scale-95 duration-200 min-h-[44px] cursor-pointer"
          >
            Confirmer manuellement
          </button>
        )}
      </div>

      {/* Manual Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-[24px] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <h4 className="font-display italic font-black uppercase text-lg text-black">
                Pointage manuel retour
              </h4>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[10px] font-black text-neutral-400 hover:text-black uppercase tracking-wider"
              >
                Fermer
              </button>
            </div>

            <p className="text-neutral-500 text-[11px] leading-relaxed font-bold uppercase tracking-wider">
              Cochez les coureurs qui vous ont confirmé leur retour (par message direct, etc.) :
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {nonConfirmedRunners.map(reg => (
                <div key={reg.runners.id} className="flex justify-between items-center p-2.5 hover:bg-neutral-50 rounded-xl border border-black/5">
                  <span className="text-[12px] font-black uppercase text-black">{reg.runners.name}</span>
                  <button
                    onClick={() => handleManualConfirm(reg.runners.id)}
                    className="bg-emerald-50 border border-emerald-200 hover:bg-[#56E39F] hover:text-white text-emerald-800 px-3 py-1.5 rounded-[8px] text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Valider retour
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
