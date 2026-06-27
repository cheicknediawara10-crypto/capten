'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Zap, ArrowRight, Sun, Cloud, History, Users, Clock, CheckCircle2, X, Calendar, Route, TrendingUp, ChevronRight, Timer, UserCheck, UserX, Flame, Pencil, Search, Send, Copy } from 'lucide-react';
import { useBroadcast } from '@/context/BroadcastContext';

type TabFilter = 'upcoming' | 'past';

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function RunsPage() {
  const { triggerUndoToast } = useBroadcast();
  const [activeTab, setActiveTab] = useState<TabFilter>('upcoming');
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    time: "",
    distance: "",
    duration: "",
    vibe: "Social & Chill",
    coach: "Moi (Propriétaire)",
    description: "",
    weather: "sun",
    temp: "18°C",
    max_slots: "",
    reminder_offset_minutes: 30,
  });
  const [coachesList, setCoachesList] = useState<string[]>(["Moi (Propriétaire)", "Alexandre Dupont", "Julie Martin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRun, setCreatedRun] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccessMessage, setJoinSuccessMessage] = useState<string | null>(null);


  // Local ralliement states
  const [isRalliementOpen, setIsRalliementOpen] = useState(false);
  const [ralliementProgress, setRalliementProgress] = useState(0);
  const [ralliementLogs, setRalliementLogs] = useState<string[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleTriggerRalliement = () => {
    setIsDispatching(true);
    setRalliementProgress(0);
    setRalliementLogs([]);

    const logSteps = [
      "Initialisation de l'antenne Meta Cloud API...",
      "Génération du lien de géolocalisation haute précision...",
      "Envoi à Noah Petit... ✓ REÇU (META CLOUD)",
      "Envoi à Alex Rivière... ✓ REÇU (META CLOUD)",
      "Envoi à Sophie Lemaire... ✓ REÇU (META CLOUD)",
      "Diffusion terminée ! 47/47 messages de ralliement transmis."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        setRalliementLogs(prev => [...prev, logSteps[currentStep]]);
        setRalliementProgress(Math.min(100, Math.round(((currentStep + 1) / logSteps.length) * 100)));
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);
  };

  const initialRuns: any[] = [];

  useEffect(() => {
    // Try loading from Supabase API first
    const fetchRuns = async () => {
      try {
        const res = await fetch('/api/runs');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Map DB date fields to presentation format if needed
            const formatted = data.map((r: any) => {
              const dateObj = new Date(r.date_start);
              const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
              const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
              const formattedDate = dateObj.toString() !== 'Invalid Date'
                ? `${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}`
                : r.date_start;
              
              const formattedTime = dateObj.toString() !== 'Invalid Date'
                ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
                : '';

              return {
                id: r.id,
                status: r.status === 'scheduled' ? 'upcoming' : r.status,
                name: r.title,
                location: r.location_start,
                date: formattedDate,
                time: formattedTime,
                distance: r.distance || '8 KM',
                duration: r.duration || '50 min',
                temp: '19°C',
                weather: 'sun',
                registered: r.slots_taken || 0,
                checkedIn: r.status === 'completed' ? r.slots_taken : 0,
                noShow: 0,
                is_paid: r.is_paid,
                price_cents: r.price_cents,
                max_slots: r.max_slots,
                slots_taken: r.slots_taken || 0,
                vibe: r.vibe || 'Social & Chill',
                coach: r.coach || 'Moi (Propriétaire)',
                description: r.description || '',
                participants: []
              };
            });
            setRuns(formatted);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch runs from Supabase:", err);
      }

      // Fallback to localStorage
      const stored = localStorage.getItem('capten_runs_v3');
      if (stored) {
        setRuns(JSON.parse(stored));
      } else {
        setRuns(initialRuns);
        localStorage.setItem('capten_runs_v3', JSON.stringify(initialRuns));
      }
    };

    fetchRuns();

    // Load custom coaches list from localStorage if defined
    const storedCoaches = localStorage.getItem('capten_coaches');
    if (storedCoaches) {
      try {
        const parsed = JSON.parse(storedCoaches);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.map((c: any) => c.name);
          setCoachesList(names);
          // If the default coach in formData is not in this list, update it to the first coach
          setFormData(prev => {
            if (!names.includes(prev.coach)) {
              return { ...prev, coach: names[0] };
            }
            return prev;
          });
        }
      } catch (e) {
        console.error("Failed to parse coaches list", e);
      }
    }



    if (typeof window !== 'undefined' && window.location.search.includes('openPlanifier=true')) {
      setIsCreateModalOpen(true);
      
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name') || "";
      const location = params.get('location') || "";
      const distance = params.get('distance') || "";
      const duration = params.get('duration') || "";
      const vibe = params.get('vibe') || "Social & Chill";
      const description = params.get('description') || "";
      
      setFormData(prev => ({
        ...prev,
        name: name,
        location: location,
        distance: distance.replace(/\s*KM/gi, ""),
        duration: duration.replace(/\s*MIN/gi, "").replace(/\s*H\s*/gi, "60"),
        vibe: vibe,
        description: description
      }));

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleToggleParticipantStatus = async (participantName: string, forceNextStatus?: 'registered' | 'present' | 'absent') => {
    if (!selectedRun) return;
    
    let isForcingCheckin = false;

    const updatedParticipants = selectedRun.participants.map((p: any) => {
      if (p.name === participantName) {
        let nextStatus = 'registered';
        if (forceNextStatus) {
          nextStatus = forceNextStatus;
          if (forceNextStatus === 'present') {
            isForcingCheckin = true;
          }
        } else {
          if (p.status === 'registered' || p.status === 'pending') {
            nextStatus = 'present';
            isForcingCheckin = true;
          }
          else if (p.status === 'present') nextStatus = 'absent';
          else if (p.status === 'absent') nextStatus = 'registered';
        }
        return { ...p, status: nextStatus };
      }
      return p;
    });

    const presentCount = updatedParticipants.filter((p: any) => p.status === 'present').length;
    const absentCount = updatedParticipants.filter((p: any) => p.status === 'absent').length;

    const isLive = selectedRun.status === 'live';
    const updatedRun = {
      ...selectedRun,
      participants: updatedParticipants,
      checkedIn: isLive ? presentCount + (selectedRun.registered - selectedRun.participants.length) : selectedRun.checkedIn,
      noShow: isLive ? absentCount : selectedRun.noShow
    };

    setSelectedRun(updatedRun);

    const updatedRuns = runs.map((r: any) => r.id === selectedRun.id ? updatedRun : r);
    setRuns(updatedRuns);
    localStorage.setItem('capten_runs_v3', JSON.stringify(updatedRuns));

    if (isForcingCheckin && typeof selectedRun.id === 'string') {
      try {
        await fetch('/api/runs/force-checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ run_id: selectedRun.id, athlete_name: participantName })
        });
      } catch (err) {
        console.warn("Failed force checkin API call", err);
      }
    }
  };

  const handleJoin = async (run: any) => {

    setIsJoining(true);
    let success = false;
    let message = "Inscription confirmée !";
    let updatedDbRun = null;

    try {
      // If it looks like a Supabase UUID (length > 10 or containing dashes), call the database
      if (typeof run.id === 'string') {
        const res = await fetch(`/api/runs/${run.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_confirmed: false }),
        });
        if (res.ok) {
          const data = await res.json();
          success = true;
          message = data.message || message;
          updatedDbRun = data.run;
        } else {
          const errData = await res.json();
          alert(errData.error || "Erreur lors de l'inscription");
          setIsJoining(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed joining run via Supabase API:", err);
    }

    // fallback or local state update
    const myParticipant = { name: 'Moi (Vous)', img: '', status: 'registered' };
    
    const updatedRuns = runs.map((r: any) => {
      if (r.id === run.id) {
        // If we got updated run details from API, use it, else update locally
        if (updatedDbRun) {
          return {
            ...r,
            slots_taken: updatedDbRun.slots_taken,
            registered: updatedDbRun.slots_taken,
            participants: [...r.participants, myParticipant]
          };
        } else {
          const nextSlots = r.slots_taken + 1;
          return {
            ...r,
            slots_taken: nextSlots,
            registered: nextSlots,
            participants: [...r.participants, myParticipant]
          };
        }
      }
      return r;
    });

    const activeUpdatedRun = updatedRuns.find((r: any) => r.id === run.id);
    setRuns(updatedRuns);
    localStorage.setItem('capten_runs_v3', JSON.stringify(updatedRuns));
    if (activeUpdatedRun) {
      setSelectedRun(activeUpdatedRun);
    }

    setJoinSuccessMessage(message);
    setIsJoining(false);

    setTimeout(() => {
      setJoinSuccessMessage(null);
    }, 4000);
  };

  const filtered = activeTab === 'upcoming' 
    ? runs.filter(r => r.status === 'live' || r.status === 'upcoming')
    : runs.filter(r => r.status === 'past');

  const totalRuns = runs.filter(r => r.status === 'past').length;
  const avgAttendance = totalRuns > 0
    ? Math.round(runs.filter(r => r.status === 'past').reduce((s, r) => s + (r.registered > 0 ? (r.checkedIn / r.registered) * 100 : 0), 0) / totalRuns)
    : 0;
  const totalParticipants = runs.filter(r => r.status === 'past').reduce((s, r) => s + r.checkedIn, 0);

  // Dynamic next run time & description
  const upcomingRuns = runs.filter(r => r.status === 'live' || r.status === 'upcoming');
  const nextRunTime = upcomingRuns.length > 0 ? (upcomingRuns[0].time || '—') : '—';
  const nextRunSub = upcomingRuns.length > 0 
    ? `${upcomingRuns[0].date} — ${upcomingRuns[0].name}`.toUpperCase()
    : 'AUCUN RUN PLANIFIÉ';

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <header className="flex flex-col gap-1.5 pb-6 sm:pb-10 border-b-[0.5px] border-black/10 mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tight">GESTION DES RUNS</h1>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto btn-primary"
          >
            <Plus size={13} strokeWidth={4} /> LANCER UN RUN
          </button>
        </div>
      </header>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'RUNS CE MOIS', value: `${totalRuns}`, sub: '+2 CETTE SEMAINE', color: 'text-black' },
          { label: 'TAUX DE PRÉSENCE', value: `${avgAttendance}%`, sub: 'MOYENNE SUR 30J', color: 'text-[#56E39F]' },
          { label: 'PARTICIPANTS CUMULÉS', value: `${totalParticipants}`, sub: 'CE MOIS', color: 'text-[#FF5C00]' },
          { label: 'PROCHAIN RUN', value: nextRunTime, sub: nextRunSub, color: 'text-black' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 space-y-2 shadow-sm">
            <p className="text-[9px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">{kpi.label}</p>
            <h3 className={`text-[32px] font-display italic font-black ${kpi.color}`}>{kpi.value}</h3>
            <p className="text-[9px] font-medium text-[#A3A3A3] uppercase tracking-widest">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* TAB FILTERS */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'upcoming' as TabFilter, label: 'À venir & En direct', count: runs.filter(r => r.status !== 'past').length },
          { id: 'past' as TabFilter, label: 'Historique', count: runs.filter(r => r.status === 'past').length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-control text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer ${
              activeTab === tab.id ? 'bg-black text-white' : 'bg-white border-[0.5px] border-[#E5E5E5] text-[#A3A3A3] hover:text-black'
            }`}>
            {tab.label} <span className={`text-[8px] px-1.5 py-0.5 rounded-control ${activeTab === tab.id ? 'bg-white/20' : 'bg-[#F4F5F7]'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* RUNS LIST */}
      <div className="space-y-4">
        {filtered.map((run) => (
          <div key={run.id} onClick={() => setSelectedRun(run)} className={`bg-white border-[0.5px] rounded-card-outer p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer hover:shadow-md transition-all group ${
            run.status === 'live' ? 'border-[#FF5C00] shadow-[0_0_20px_rgba(255,92,0,0.08)]' : 'border-[#E5E5E5]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              {/* Status indicator */}
              <div className="sm:w-20 text-left shrink-0">
                {run.status === 'live' && (
                  <div className="bg-[#FF0000] text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                  </div>
                )}
                {run.status === 'upcoming' && (
                  <div className="bg-[#F4F5F7] text-[#A3A3A3] text-[8px] font-black uppercase px-3 py-1.5 rounded-full">{run.date.split(' ')[0]}</div>
                )}
                {run.status === 'past' && (
                  <div className="bg-[#F4F5F7] text-[#D1D1D1] text-[8px] font-black uppercase px-3 py-1.5 rounded-full">TERMINÉ</div>
                )}
              </div>

              {/* Run info */}
              <div className="space-y-1.5">
                <h3 className="text-[20px] sm:text-[22px] font-display italic font-black uppercase text-black leading-none tracking-tight">{run.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1.5 text-[#A3A3A3]">
                    <MapPin size={12} />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{run.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A3A3A3]">
                    <Clock size={12} />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{run.date} · {run.time}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right metrics */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-8 pt-4 lg:pt-0 border-t-[0.5px] border-black/5 lg:border-none w-full lg:w-auto">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-left sm:text-right">
                  <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-widest">DISTANCE</p>
                  <p className="text-[14px] sm:text-[16px] font-display italic font-black text-black">{run.distance}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-widest">INSCRITS</p>
                  <p className="text-[14px] sm:text-[16px] font-display italic font-black text-[#FF5C00]">{run.registered}</p>
                </div>
                {run.status !== 'upcoming' && (
                  <div className="text-left sm:text-right">
                    <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-widest">PRÉSENTS</p>
                    <p className="text-[14px] sm:text-[16px] font-display italic font-black text-[#56E39F]">{run.checkedIn}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[8.5px] sm:text-[9px] font-black uppercase tracking-widest text-[#FF5C00]">{run.vibe}</span>
                <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full bg-[#56E39F]/10 text-[#56E39F]">
                  GRATUIT
                </span>
                {run.max_slots !== null && run.max_slots !== undefined && run.max_slots !== '' && run.max_slots !== 'undefined' && run.max_slots !== 'null' && (
                  <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${
                    (run.slots_taken ?? 0) >= Number(run.max_slots) ? 'bg-[#FF0000]/10 text-[#FF0000]' : 'bg-[#F4F5F7] text-[#A3A3A3]'
                  }`}>
                    {(run.slots_taken ?? 0) >= Number(run.max_slots) ? 'COMPLET' : `${run.slots_taken ?? 0}/${run.max_slots} PLACES`}
                  </span>
                )}
              </div>
              <ChevronRight size={18} className="text-[#D1D1D1] group-hover:text-black group-hover:translate-x-1 transition-all hidden sm:block" />
            </div>
          </div>
        ))}
      </div>

      {/* RUN DETAIL MODAL (LARGE, CENTERED OVERLAY WITH BLURRED BACKGROUND) */}
      {selectedRun && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setSelectedRun(null)}>
          <div className="relative w-full max-w-[650px] max-h-[90vh] bg-white rounded-modal-box shadow-2xl overflow-y-auto flex flex-col p-8 sm:p-10 animate-scale-up" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedRun(null)} 
              className="absolute top-6 right-6 w-9 h-9 bg-[#F4F5F7] rounded-full flex items-center justify-center text-[#A3A3A3] hover:bg-black hover:text-white transition-all z-10 cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header Composition */}
            <div className="flex flex-col sm:flex-row items-start gap-5 pb-6 border-b-[0.5px] border-black/10">
              <div className="flex gap-3 shrink-0">
                {/* Stylized Run Icon Box */}
                <div className="w-16 h-16 bg-[#F4F5F7] rounded-card-inner flex items-center justify-center text-black">
                  <Flame size={32} fill="currentColor" />
                </div>
                {/* Miniature photo of the Canal St Martin scenic view */}
                <img 
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80" 
                  className="w-16 h-16 rounded-card-inner object-cover border border-black/5" 
                  alt="Canal St Martin" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-[28px] font-display italic font-black uppercase text-black leading-none tracking-tight">{selectedRun.name}</h2>
                  {selectedRun.status === 'live' && (
                    <span className="bg-[#FF0000] text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> EN DIRECT
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider leading-relaxed">
                  {selectedRun.description || 'RUN SOCIAL LE LONG DU CANAL AVEC ARRÊT CAFÉ AU SOCIAL SPOT. IDÉAL POUR LES DÉBUTANTS.'}
                </p>
              </div>
            </div>

            {joinSuccessMessage && (
              <div className="mt-4 p-4 bg-[#56E39F]/10 border-[0.5px] border-[#56E39F]/30 rounded-card-inner flex items-center gap-3">
                <CheckCircle2 className="text-[#56E39F]" size={20} />
                <span className="text-[11px] font-bold text-black uppercase tracking-wider">{joinSuccessMessage}</span>
              </div>
            )}

            <div className="mt-6 space-y-6">
                {/* Data Grid Tuiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'DATE', value: selectedRun.date || 'Aujourd\'hui' },
                    { label: 'HEURE', value: selectedRun.time || '—' },
                    { label: 'DISTANCE', value: selectedRun.distance || '6 KM' },
                    { label: 'DURÉE', value: selectedRun.duration || '45 min' },
                    { label: 'MÉTÉO', value: selectedRun.temp || '22°C' },
                    { label: 'RUN LEADER', value: selectedRun.coach || 'Moi (Propriétaire)' },
                    { label: 'ACCÈS', value: 'GRATUIT' },
                    { label: 'PLACES', value: (selectedRun.max_slots !== undefined && selectedRun.max_slots !== null && selectedRun.max_slots !== '' && selectedRun.max_slots !== 'undefined' && selectedRun.max_slots !== 'null') ? `${selectedRun.slots_taken ?? 0}/${selectedRun.max_slots}` : 'ILLIMITÉ' },
                  ].map((d, i) => (
                    <div key={i} className="bg-[#F4F5F7] rounded-card-inner p-3 text-left">
                      <p className="text-[7.5px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1">{d.label}</p>
                      <p className="text-[12px] font-display italic font-black text-black leading-tight">{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Parcours Block */}
                <div className="flex items-center gap-3 p-4 bg-white border-[0.5px] border-black/10 rounded-card-inner">
                  <MapPin size={16} className="text-[#FF5C00]" />
                  <div>
                    <p className="text-[7.5px] font-black text-[#A3A3A3] uppercase tracking-widest mb-0.5">PARCOURS</p>
                    <p className="text-[11px] font-bold text-black uppercase">{selectedRun.location || 'SOCIAL SPOT → CANAL ST MARTIN'}</p>
                  </div>
                </div>

                {/* Pointage Section */}
                <section className="space-y-2">
                  <h3 className="text-[9px] font-black text-[#A3A8B8] uppercase tracking-[0.2em] italic">POINTAGE</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F4F5F7] rounded-card-inner p-4 text-center">
                      <p className="text-[7.5px] font-black text-[#A3A8B8] uppercase tracking-widest mb-0.5">INSCRITS</p>
                      <p className="text-[20px] font-display italic font-black text-black">{selectedRun.registered || 47}</p>
                    </div>
                    <div className="bg-[#56E39F]/10 rounded-card-inner p-4 text-center">
                      <p className="text-[7.5px] font-black text-[#56E39F] uppercase tracking-widest mb-0.5">PRÉSENTS</p>
                      <p className="text-[20px] font-display italic font-black text-[#56E39F]">{selectedRun.checkedIn || 46}</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-card-inner p-4 text-center">
                      <p className="text-[7.5px] font-black text-[#A3A8B8] uppercase tracking-widest mb-0.5">NO-SHOW</p>
                      <p className="text-[20px] font-display italic font-black text-[#D1D1D1]">{selectedRun.noShow || 0}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link href={`/dashboard/runs/${selectedRun.id}`} className="w-full btn-lg-cta">
                      OUVRIR LE MASTER PASS (SUIVI LIVE)
                    </Link>
                  </div>
                </section>

                {/* Participants Section */}
                {selectedRun.participants && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-[0.2em] italic">PARTICIPANTS</h3>
                      <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
                        <input 
                          type="text" 
                          placeholder="Chercher un coureur..." 
                          value={participantSearch}
                          onChange={(e) => setParticipantSearch(e.target.value)}
                          className="w-[180px] h-9 pl-8 pr-4 bg-[#F4F5F7] border border-black/10 rounded-control text-[11px] font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto">
                      {(selectedRun.participants.length > 0 ? selectedRun.participants : [
                        { name: 'Alex Rivière', img: '', status: 'present' },
                        { name: 'Sophie Lemaire', img: '', status: 'present' }
                      ])
                        .filter((p: any) => p.name.toLowerCase().includes(participantSearch.toLowerCase()))
                        .map((p: any, i: number) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between py-2 px-3 rounded-control bg-white border-[0.5px] border-black/10 hover:border-black/20 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {p.img && !p.img.includes('pravatar.cc') ? (
                              <img src={p.img} className="w-7 h-7 rounded-full border-[0.5px] border-black/5 object-cover shrink-0" alt="" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 border-[0.5px] border-black/10 font-black text-[9px] flex items-center justify-center uppercase shrink-0">
                                {getInitials(p.name)}
                              </div>
                            )}
                            <span className="text-[11px] font-bold text-black uppercase">{p.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {p.status === 'present' || p.status === 'attended' ? (
                              <button 
                                onClick={() => handleToggleParticipantStatus(p.name, 'registered')}
                                className="flex items-center gap-1 text-[#56E39F] bg-[#56E39F]/10 border border-transparent px-2.5 py-1 rounded-[6px] transition-all cursor-pointer group"
                              >
                                <CheckCircle2 size={12} className="group-hover:hidden" />
                                <UserX size={12} className="hidden group-hover:block text-[#FF0000]" />
                                <span className="text-[8px] font-black uppercase tracking-widest group-hover:hidden">CONFIRMATION</span>
                                <span className="text-[8px] font-black uppercase tracking-widest hidden group-hover:block text-[#FF0000]">RETIRER</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleToggleParticipantStatus(p.name, 'present')}
                                className="text-white bg-black hover:bg-[#FF5C00] px-2.5 py-1 rounded-[6px] text-[8px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                              >
                                FORCER LE CHECK-IN
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Footer Action Buttons */}
                <div className="flex gap-2 pt-4 border-t-[0.5px] border-black/10">
                  {selectedRun.status === 'upcoming' && (
                    <>
                      {selectedRun.participants?.some((p: any) => p.name === 'Moi (Vous)') ? (
                        <button 
                          disabled 
                          className="flex-1 h-11 bg-[#56E39F]/20 text-[#56E39F] rounded-control text-[9px] font-black uppercase tracking-widest border-[0.5px] border-[#56E39F]/40 text-center"
                        >
                          DÉJÀ INSCRIT ✓
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleJoin(selectedRun)}
                          disabled={isJoining}
                          className="flex-1 btn-primary"
                        >
                          S'INSCRIRE AU RUN
                        </button>
                      )}
                    </>
                  )}
                  <Link href="/athletes" className="btn-secondary h-11">
                    LE CREW
                  </Link>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* PLANIFIER RUN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-modal-box max-w-[550px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border-[0.5px] border-black/10 animate-scale-up p-8 space-y-6 relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#F4F5F7] flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="space-y-1.5 pb-4 border-b-[0.5px] border-black/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#FF5C00] rounded-full" />
                <h3 className="text-[18px] font-display italic font-black uppercase text-black">LANCER UN RUN</h3>
              </div>
              <p className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                LANCEMENT DE LA PROCHAINE SESSION
              </p>
            </div>

            {isSuccess && createdRun ? (
              <div className="py-6 text-center space-y-6 animate-fade-in">
                <div className="w-12 h-12 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] mx-auto animate-bounce">
                  <CheckCircle2 size={24} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-[18px] font-display italic font-black uppercase text-black">SORTIE CRÉÉE AVEC SUCCÈS !</h4>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
                    Ta sortie est enregistrée dans Capten.
                  </p>
                </div>

                <div className="bg-[#F4F5F7] border border-black/5 rounded-[16px] p-5 text-left space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#FF5C00] font-mono block">
                    [ 💬 MESSAGE D'ANNONCE WHATSAPP ]
                  </span>
                  <div className="relative">
                    <pre className="text-[11.5px] font-semibold font-sans text-neutral-800 whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto bg-white border border-black/5 p-4 rounded-xl select-all select-none">
                      {`THE CREW TRAIL 🏃\n\nNouveau run planifié : *${createdRun.name.toUpperCase()}* ! 🔥\n\n📅 Date : ${createdRun.date} à ${createdRun.time}\n📍 Lieu : ${createdRun.location}\n⚡ Distance : ${createdRun.distance} (${createdRun.vibe})\n\nRéserve ta place ici (requis pour participer) :\n${window.location.origin}/waiver?runId=${createdRun.id}`}
                    </pre>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <button 
                      type="button"
                      onClick={async () => {
                        const text = `THE CREW TRAIL 🏃\n\nNouveau run planifié : *${createdRun.name.toUpperCase()}* ! 🔥\n\n📅 Date : ${createdRun.date} à ${createdRun.time}\n📍 Lieu : ${createdRun.location}\n⚡ Distance : ${createdRun.distance} (${createdRun.vibe})\n\nRéserve ta place ici (requis pour participer) :\n${window.location.origin}/waiver?runId=${createdRun.id}`;
                        try {
                          await navigator.clipboard.writeText(text);
                          alert("Message copié dans le presse-papiers !");
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="flex-1 py-3 bg-black text-white hover:bg-[#FF5C00] transition-all duration-300 rounded-[10px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <Copy size={13} /> COPIER LE MESSAGE
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const text = `THE CREW TRAIL 🏃\n\nNouveau run planifié : *${createdRun.name.toUpperCase()}* ! 🔥\n\n📅 Date : ${createdRun.date} à ${createdRun.time}\n📍 Lieu : ${createdRun.location}\n⚡ Distance : ${createdRun.distance} (${createdRun.vibe})\n\nRéserve ta place ici (requis pour participer) :\n${window.location.origin}/waiver?runId=${createdRun.id}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="py-3 px-4 bg-[#25D366]/10 text-[#20BA5A] border border-[#25D366]/20 hover:bg-[#25D366] hover:text-white transition-all duration-300 rounded-[10px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      PARTAGER SUR WHATSAPP
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsSuccess(false);
                    setCreatedRun(null);
                    setFormData({
                      name: "",
                      location: "",
                      date: "",
                      time: "",
                      distance: "",
                      duration: "",
                      vibe: "Social & Chill",
                      coach: "Moi (Propriétaire)",
                      description: "",
                      weather: "sun",
                      temp: "18°C",
                      max_slots: "",
                      reminder_offset_minutes: 30,
                    });
                  }}
                  className="w-full py-3 bg-transparent border border-black/10 hover:border-black text-[10px] font-black uppercase tracking-widest rounded-[10px] transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);

                const dateTimeStr = formData.date && formData.time ? `${formData.date}T${formData.time}:00` : formData.date;
                const dateObj = new Date(dateTimeStr);
                const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
                const formattedDate = dateObj.toString() !== 'Invalid Date' 
                  ? `${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}`
                  : formData.date;

                const maxSlots = formData.max_slots ? parseInt(formData.max_slots) : null;

                // Prepare API payload
                const apiPayload = {
                  title: formData.name.toUpperCase(),
                  description: formData.description,
                  date_start: dateObj.toString() !== 'Invalid Date' ? dateObj.toISOString() : new Date().toISOString(),
                  location_start: formData.location,
                  is_paid: false,
                  price_cents: 0,
                  max_slots: maxSlots,
                  vibe: formData.vibe,
                  coach: formData.coach,
                  reminder_offset_minutes: formData.reminder_offset_minutes,
                };

                let savedRun = null;
                try {
                  const res = await fetch('/api/runs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiPayload),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data && data.id) {
                      // Map back to the UI state structure
                      savedRun = {
                        id: data.id,
                        status: 'upcoming',
                        name: data.title,
                        location: data.location_start,
                        date: formattedDate,
                        time: formData.time,
                        distance: `${formData.distance} KM`,
                        duration: `${formData.duration} min`,
                        temp: `${formData.temp}°C`,
                        weather: formData.weather,
                        registered: 0,
                        checkedIn: 0,
                        noShow: 0,
                        is_paid: data.is_paid,
                        price_cents: data.price_cents,
                        max_slots: data.max_slots,
                        slots_taken: 0,
                        vibe: data.vibe || formData.vibe,
                        coach: data.coach || formData.coach,
                        description: data.description || '',
                        participants: []
                      };
                    }
                  }
                } catch (err) {
                  console.warn("Failed posting new run to Supabase:", err);
                }

                // If not saved via API, create local fallback
                if (!savedRun) {
                  savedRun = {
                    id: Date.now(),
                    status: "upcoming",
                    name: formData.name.toUpperCase(),
                    location: formData.location,
                    date: formattedDate,
                    time: formData.time,
                    distance: `${formData.distance} KM`,
                    duration: `${formData.duration} min`,
                    temp: `${formData.temp}°C`,
                    weather: formData.weather,
                    registered: 0,
                    checkedIn: 0,
                    noShow: 0,
                    max_slots: maxSlots,
                    slots_taken: 0,
                    vibe: formData.vibe,
                    coach: formData.coach,
                    description: formData.description,
                    reminder_offset_minutes: formData.reminder_offset_minutes,
                    participants: []
                  };
                }

                const updatedRuns = [savedRun, ...runs];
                setRuns(updatedRuns);
                localStorage.setItem("capten_runs_v3", JSON.stringify(updatedRuns));

                setCreatedRun(savedRun);
                setIsSubmitting(false);
                setIsSuccess(true);
              }} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Nom du Run <span className="text-[#FF5C00]">*</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="ex. TEMPO SPRINT, SATURDAY CREW..."
                      value={formData.name} 
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="brutalist-input uppercase"
                    />
                  </div>

                  {/* Location */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Itinéraire / Parcours <span className="text-[#FF5C00]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={14} />
                      <input 
                        type="text" 
                        required 
                        placeholder="ex. Social Spot → Canal St Martin"
                        value={formData.location} 
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="brutalist-input pl-9"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Date de départ <span className="text-[#FF5C00]">*</span>
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date} 
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="brutalist-input"
                    />
                  </div>

                  {/* Heure */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Heure <span className="text-[#FF5C00]">*</span>
                    </label>
                    <input 
                      type="time" 
                      required 
                      value={formData.time} 
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="brutalist-input"
                    />
                  </div>

                  {/* Distance */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Distance (KM) <span className="text-[#FF5C00]">*</span>
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      placeholder="ex. 8"
                      value={formData.distance} 
                      onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                      className="brutalist-input"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Durée (Min) <span className="text-[#FF5C00]">*</span>
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      placeholder="ex. 45"
                      value={formData.duration} 
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="brutalist-input"
                    />
                  </div>

                  {/* Vibe */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Vibe / Catégorie
                    </label>
                    <select 
                      value={formData.vibe} 
                      onChange={(e) => setFormData(prev => ({ ...prev, vibe: e.target.value }))}
                      className="brutalist-input"
                    >
                      <option value="Social & Chill">Social & Chill</option>
                      <option value="Performance">Performance</option>
                      <option value="Récupération">Récupération</option>
                    </select>
                  </div>

                  {/* Coach / Run Leader */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      RUN LEADER
                    </label>
                    <select 
                      value={formData.coach} 
                      onChange={(e) => setFormData(prev => ({ ...prev, coach: e.target.value }))}
                      className="brutalist-input"
                    >
                      {coachesList.map((coachName, i) => (
                        <option key={i} value={coachName}>{coachName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Description de la séance
                    </label>
                    <textarea 
                      rows={2}
                      placeholder="Ex: Boucle chill le long du canal, allure tranquille pour papoter, et café collectif juste après."
                      value={formData.description} 
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-black/10 rounded-control text-[12px] font-bold text-black placeholder:text-neutral-450 focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all resize-none"
                    />
                  </div>



                  {/* Nombre de places */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest italic block">
                      Places max <span className="text-[#A3A3A3] font-medium not-italic">(vide = illimité)</span>
                    </label>
                    <input 
                      type="number" min="1"
                      placeholder="ex. 40"
                      value={formData.max_slots} 
                      onChange={(e) => setFormData(prev => ({ ...prev, max_slots: e.target.value }))}
                      className="brutalist-input"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full btn-lg-cta mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      LANCEMENT EN COURS...
                    </>
                  ) : (
                    "LANCER LE RUN ⚡"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DISPATCHING DE RALLIEMENT MODAL */}
      {isRalliementOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRalliementOpen(false)} />
          <div className="relative bg-white border-[0.5px] border-[#E5E5E5] w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-modal-box shadow-2xl z-10 flex flex-col animate-fade-in text-black">
            <header className="px-8 py-6 border-b-[0.5px] border-[#E5E5E5] flex justify-between items-center bg-[#FFF5F5]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF5C00]/10 flex items-center justify-center text-[#FF5C00] animate-pulse">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="text-[18px] font-display italic font-black uppercase text-black leading-none">DISPATCHING DU RALLIEMENT</h3>
                  <span className="text-[9px] font-bold text-[#FF5C00] uppercase tracking-widest mt-1 block">META API MULTI-CAST EN DIRECT</span>
                </div>
              </div>
              <button 
                onClick={() => setIsRalliementOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#A3A3A3] hover:text-black transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </header>

            <div className="p-8 space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-widest">Progression de l'envoi</span>
                  <span className="text-[11px] font-black text-black">{ralliementProgress}%</span>
                </div>
                <div className="w-full bg-[#F4F5F7] h-3 rounded-full overflow-hidden border border-black/5">
                  <div 
                    style={{ width: `${ralliementProgress}%` }}
                    className="h-full bg-[#FF5C00] transition-all duration-300 shadow-md shadow-orange-500/25"
                  />
                </div>
              </div>

              {/* Steps completed logs */}
              <div className="bg-[#1A1924] rounded-card-inner p-5 text-[#56E39F] font-mono text-[9px] space-y-2 max-h-[180px] overflow-y-auto shadow-md">
                {ralliementLogs.length === 0 ? (
                  <p className="text-white/40 uppercase animate-pulse">Recherche du signal d'antenne Meta Cloud...</p>
                ) : (
                  ralliementLogs.map((log, idx) => (
                    <p key={idx} className="leading-relaxed border-l-2 border-[#56E39F]/30 pl-2 animate-fade-in">{log}</p>
                  ))
                )}
              </div>

              <button
                onClick={() => setIsRalliementOpen(false)}
                className="w-full btn-lg-cta"
              >
                {ralliementProgress < 100 ? "ANNULER LA SIMULATION" : "FERMER LE COMPTE RENDU"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
