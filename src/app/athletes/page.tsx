'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Zap, Activity, CheckCircle2, XCircle, RefreshCw, X, Phone, AlertTriangle, Heart, Mail, MapPin, Shield, MessageSquare, Copy, Check } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getAppUrl } from '@/lib/domain';

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

interface Athlete {
  id?: string;
  initial: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  reliability: number;
  pace: string;
  totalKm: string;
  lastRun: string;
  runs: number;
  img: string;
  streak: number;
  tier: string;
  tierColor: string;
  phone: string;
  email: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  birthDate: string;
  bloodType: string;
  allergies: string;
  healthIssues: string;
  insurance: string;
  joinDate: string;
  address: string;
  waiverStatus: "SIGNÉE" | "NON SIGNÉE";
  waiverDate?: string;
  waiverIp?: string;
  waiverToken?: string;
}

const mapRunnerToAthlete = (runner: any): Athlete => {
  const nameParts = (runner.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    id: runner.id,
    initial: runner.name ? getInitials(runner.name) : '',
    name: runner.name || '',
    firstName,
    lastName,
    role: runner.is_blacklisted ? `${runner.role || 'Membre'} (Banni)` : (runner.role || 'Membre'),
    reliability: runner.reliability ?? 90,
    pace: runner.pace || '5:00/K',
    totalKm: `${runner.total_km ?? 0} km`,
    lastRun: runner.last_run || 'Jamais',
    runs: runner.runs_count ?? 0,
    img: runner.avatar_url || '',
    streak: runner.streak_count ?? 0,
    tier: runner.reliability >= 95 ? "OR" : (runner.reliability >= 85 ? "ARGENT" : "BRONZE"),
    tierColor: runner.reliability >= 95 ? "#FFD700" : (runner.reliability >= 85 ? "#C0C0C0" : "#CD7F32"),
    phone: runner.phone || '',
    email: runner.email || '',
    emergencyName: runner.emergency_name || '',
    emergencyPhone: runner.emergency_phone || '',
    emergencyRelation: runner.emergency_relation || 'Conjoint',
    birthDate: runner.birth_date || '',
    bloodType: runner.blood_type || 'A+',
    allergies: runner.allergies || 'Aucune',
    healthIssues: runner.health_issues || 'Aucun',
    insurance: runner.insurance || 'Non spécifiée',
    joinDate: runner.join_date || 'Juin 2026',
    address: runner.address || 'Non spécifiée',
    waiverStatus: runner.signed_waiver ? "SIGNÉE" : "NON SIGNÉE",
    waiverDate: runner.waiver_date ? new Date(runner.waiver_date).toLocaleDateString('fr-FR') : undefined,
    waiverIp: runner.waiver_ip,
    waiverToken: runner.waiver_token
  };
};

export default function AthletesPage() {
  const { user, isMock } = useAuth();
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "Membre",
    reliability: "90",
    pace: "5:00/K",
    phone: "",
    email: "",
    address: "",
    birthDate: "",
    bloodType: "A+",
    allergies: "Aucune",
    healthIssues: "Aucun",
    insurance: "",
    emergencyName: "",
    emergencyRelation: "Conjoint",
    emergencyPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Post-create modal for sharing link
  const [newAthleteLink, setNewAthleteLink] = useState<string | null>(null);

  // States for copy and WhatsApp in waiver section
  const [copiedWaiverAthleteId, setCopiedWaiverAthleteId] = useState<string | null>(null);
  const [copiedReceiptAthleteId, setCopiedReceiptAthleteId] = useState<string | null>(null);
  const [whatsAppSendStatus, setWhatsAppSendStatus] = useState<string | null>(null);

  // States for search function
  const [searchQuery, setSearchQuery] = useState("");

  const loadAthletes = async () => {
    let serverAthletes: Athlete[] | null = null;

    if (!isMock) {
      try {
        const res = await fetch('/api/runners');
        if (res.ok) {
          const runners = await res.json();
          if (Array.isArray(runners) && runners.length > 0) {
            serverAthletes = runners.map(mapRunnerToAthlete);
          }
        }
      } catch (err) {
        console.error("Error loading athletes from server:", err);
      }
    }

    if (serverAthletes !== null) {
      setAthletes(serverAthletes);
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem('capten_athletes_v3');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setAthletes(parsed);
          } else {
            setAthletes([]);
          }
        } catch (e) {
          setAthletes([]);
        }
      } else {
        setAthletes([]);
      }
    }
  };

  const handlePardonAthlete = async (athlete: Athlete) => {
    if (!window.confirm(`Voulez-vous vraiment lever la suspension de ${athlete.name} ?`)) return;

    try {
      // 1. Call unban API (for runners table)
      await fetch('/api/runners/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runner_name: athlete.name,
          is_blacklisted: false
        })
      });

      // 2. Call pardonMember server action (for memberships table)
      const supabase = getSupabase ? getSupabase() : null;
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const match = athlete.role.match(/ID:\s*([a-f0-9\-]+|[M\d]+)/i);
          const memberId = match ? match[1] : "";
          if (memberId && memberId.length > 5) {
            const { pardonMember } = await import('@/app/actions/pardon-member');
            await pardonMember(user.id, memberId);
          }
        }
      }

      if (isMock) {
        // Update localStorage
        const stored = localStorage.getItem('capten_athletes_v3');
        if (stored) {
          const list = JSON.parse(stored);
          const updatedList = list.map((a: any) => {
            if ((a.name || '').toLowerCase() === (athlete.name || '').toLowerCase()) {
              const cleanRole = a.role.replace(/\s*\(Banni\)/gi, "");
              return { ...a, role: cleanRole };
            }
            return a;
          });
          localStorage.setItem('capten_athletes_v3', JSON.stringify(updatedList));
        }
      }

      await loadAthletes();
      setSelectedAthlete(prev => prev ? { ...prev, role: prev.role.replace(/\s*\(Banni\)/gi, "") } : null);
      alert(`La suspension de ${athlete.name} a été levée avec succès.`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la levée de la suspension.");
    }
  };

  const handleBanAthlete = async (athlete: Athlete) => {
    if (!window.confirm(`Voulez-vous vraiment suspendre définitivement ${athlete.name} du club ?`)) return;

    try {
      await fetch('/api/runners/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runner_name: athlete.name,
          is_blacklisted: true
        })
      });

      if (isMock) {
        // Update LocalStorage
        const stored = localStorage.getItem('capten_athletes_v3');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((a: any) => {
            if ((a.name || '').toLowerCase() === (athlete.name || '').toLowerCase()) {
              return { ...a, role: (a.role || '').toLowerCase().includes("banni") ? a.role : a.role + " (Banni)" };
            }
            return a;
          });
          localStorage.setItem('capten_athletes_v3', JSON.stringify(updated));
        }
      }

      await loadAthletes();
      setSelectedAthlete(prev => prev ? { ...prev, role: (prev.role || '').toLowerCase().includes("banni") ? prev.role : prev.role + " (Banni)" } : null);
      alert(`Le membre ${athlete.name} a été suspendu.`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du bannissement.");
    }
  };

  useEffect(() => {
    loadAthletes();

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', loadAthletes);

      if (window.location.search.includes('openNouveau=true')) {
        setIsCreateModalOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return () => {
        window.removeEventListener('focus', loadAthletes);
      };
    }
  }, [isMock]);

  // Keep selected athlete in sync when athletes list changes (like waiver signed)
  useEffect(() => {
    if (selectedAthlete) {
      const updated = athletes.find(a => a.phone === selectedAthlete.phone || a.id === selectedAthlete.id);
      if (updated) {
        setSelectedAthlete(updated);
      }
    }
  }, [athletes]);


  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <header className="flex flex-col gap-1.5 pb-6 sm:pb-10 border-b-[0.5px] border-black/10 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tight">
                LE CREW
              </h1>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto btn-primary"
            >
              <Plus size={14} strokeWidth={3} /> AJOUTER UN COUREUR
            </button>
          </div>
      </header>

      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1D1D1]" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher un coureur..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-[#F4F5F7] border border-black/10 rounded-control text-[12px] font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all" 
          />
        </div>
      </div>

      {/* ATHLETES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {athletes
          .filter(a => (a.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
          .map((athlete, idx) => (
          <div key={idx} onClick={() => setSelectedAthlete(athlete)} className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 space-y-5 shadow-sm hover:border-black/20 transition-all group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {athlete.img && !athlete.img.includes('pravatar.cc') ? (
                  <img src={athlete.img} alt={athlete.name} className="w-11 h-11 rounded-card-inner object-cover border-[0.5px] border-black/5 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-11 h-11 rounded-card-inner bg-slate-200 text-slate-800 border-[0.5px] border-black/10 font-black text-[14px] flex items-center justify-center uppercase shrink-0 group-hover:scale-105 transition-transform">
                    {athlete.initial || getInitials(athlete.name)}
                  </div>
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[16px] font-display italic font-black uppercase text-black leading-none tracking-tight">{athlete.name}</h2>
                    {athlete.waiverStatus === "SIGNÉE" ? (
                      <Shield size={12} className="text-[#56E39F] fill-[#56E39F]/10 shrink-0" strokeWidth={2.5} />
                    ) : (
                      <Shield size={12} className="text-[#FF5C00] fill-[#FF5C00]/10 shrink-0" strokeWidth={2.5} />
                    )}
                  </div>
                  <p className="text-[8px] font-bold text-[#D1D1D1] uppercase tracking-widest">{athlete.role}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 py-4 border-y-[0.5px] border-[#F4F5F7]">
              <div>
                <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.15em] italic mb-1">FIABILITÉ</p>
                <p className="text-[16px] font-display italic font-black text-black leading-none">{athlete.reliability}%</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.15em] italic mb-1">ALLURE</p>
                <p className="text-[16px] font-display italic font-black text-[#FF5C00] leading-none">{athlete.pace}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.15em] italic mb-1">RUNS</p>
                <p className="text-[16px] font-display italic font-black text-black leading-none">{athlete.runs}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.15em] italic mb-1">SÉRIE</p>
                <p className={`text-[16px] font-display italic font-black leading-none ${athlete.streak > 0 ? 'text-[#56E39F]' : 'text-[#D1D1D1]'}`}>{athlete.streak > 0 ? `${athlete.streak} sem` : '—'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${athlete.tierColor}15`, color: athlete.tierColor }}>{athlete.tier}</span>
                <span className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-widest">{athlete.lastRun}</span>
              </div>
              <span className="text-[10px] font-display italic font-black text-black">{athlete.totalKm}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ATHLETE DETAIL MODAL */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setSelectedAthlete(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[550px] max-h-[90vh] bg-white rounded-modal-box shadow-2xl overflow-y-auto border-[0.5px] border-black/10 animate-scale-up" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setSelectedAthlete(null)} className="absolute top-6 right-6 w-8 h-8 bg-[#F4F5F7] rounded-full flex items-center justify-center text-[#A3A3A3] hover:bg-black hover:text-white transition-all z-10 cursor-pointer">
              <X size={16} />
            </button>

            {/* Header */}
            <div className="p-6 sm:p-8 pb-6 border-b-[0.5px] border-[#E5E5E5]">
              <div className="flex items-center gap-6">
                {selectedAthlete.img && !selectedAthlete.img.includes('pravatar.cc') ? (
                  <img src={selectedAthlete.img} alt={selectedAthlete.name} className="w-20 h-20 rounded-card-inner object-cover border-[0.5px] border-black/5" />
                ) : (
                  <div className="w-20 h-20 rounded-card-inner bg-slate-200 text-slate-800 border-[0.5px] border-black/10 font-black text-[24px] flex items-center justify-center uppercase shrink-0">
                    {selectedAthlete.initial || getInitials(selectedAthlete.name)}
                  </div>
                )}
                <div className="space-y-2">
                  <h2 className="text-[28px] font-display italic font-black uppercase text-black leading-none tracking-tight">{selectedAthlete.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-widest">{selectedAthlete.role}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selectedAthlete.tierColor}15`, color: selectedAthlete.tierColor }}>{selectedAthlete.tier}</span>
                  </div>
                  <p className="text-[10px] font-medium text-[#A3A3A3] uppercase tracking-wider">Membre depuis {selectedAthlete.joinDate}</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'FIABILITÉ', value: `${selectedAthlete.reliability}%` },
                  { label: 'ALLURE', value: selectedAthlete.pace },
                  { label: 'RUNS', value: `${selectedAthlete.runs}` },
                  { label: 'SÉRIE', value: selectedAthlete.streak > 0 ? `${selectedAthlete.streak} sem` : '—' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#F4F5F7] rounded-card-inner p-3 sm:p-4 text-center">
                    <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-[16px] sm:text-[18px] font-display italic font-black text-black">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-[#D1D1D1] uppercase tracking-[0.3em] italic">COORDONNÉES</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-inner">
                    <Phone size={16} className="text-[#FF5C00]" />
                    <div className="flex-1">
                      <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-widest">TÉLÉPHONE</p>
                      <p className="text-[14px] font-bold text-black">{selectedAthlete.phone}</p>
                    </div>
                    <a href={`tel:${selectedAthlete.phone}`} className="px-4 py-2 bg-[#F4F5F7] rounded-control text-[9px] font-black uppercase tracking-widest hover:bg-[#FF5C00] hover:text-white transition-all">APPELER</a>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-inner">
                    <Mail size={16} className="text-[#A3A3A3]" />
                    <div className="flex-1">
                      <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-widest">EMAIL</p>
                      <p className="text-[14px] font-bold text-black">{selectedAthlete.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-inner">
                    <MapPin size={16} className="text-[#A3A3A3]" />
                    <div className="flex-1">
                      <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-widest">ADRESSE</p>
                      <p className="text-[14px] font-bold text-black">{selectedAthlete.address}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Emergency */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-[#FF0000] uppercase tracking-[0.3em] italic flex items-center gap-2">
                  <AlertTriangle size={12} /> CONTACT D&apos;URGENCE
                </h3>
                <div className="bg-[#FFF5F5] border-[0.5px] border-[#FF0000]/10 rounded-card-inner p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[14px] font-black text-black uppercase">{selectedAthlete.emergencyName}</p>
                      <p className="text-[10px] font-medium text-[#A3A3A3] uppercase">{selectedAthlete.emergencyRelation}</p>
                    </div>
                    <a href={`tel:${selectedAthlete.emergencyPhone}`} className="px-5 py-2.5 bg-[#FF0000] text-white rounded-control text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center gap-2">
                      <Phone size={12} /> {selectedAthlete.emergencyPhone}
                    </a>
                  </div>
                </div>
              </section>

              {/* Health */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-[#D1D1D1] uppercase tracking-[0.3em] italic flex items-center gap-2">
                  <Heart size={12} /> INFORMATIONS DE SANTÉ
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'DATE DE NAISSANCE', value: selectedAthlete.birthDate },
                    { label: 'GROUPE SANGUIN', value: selectedAthlete.bloodType },
                    { label: 'ALLERGIES', value: selectedAthlete.allergies, alert: selectedAthlete.allergies !== 'Aucune' },
                    { label: 'PROBLÈMES DE SANTÉ', value: selectedAthlete.healthIssues, alert: selectedAthlete.healthIssues !== 'Aucun' },
                  ].map((info, i) => (
                    <div key={i} className={`p-4 rounded-card-inner border-[0.5px] ${info.alert ? 'bg-[#FFF5F5] border-[#FF0000]/10' : 'bg-[#F4F5F7] border-transparent'}`}>
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1">{info.label}</p>
                      <p className={`text-[13px] font-bold uppercase ${info.alert ? 'text-[#FF0000]' : 'text-black'}`}>{info.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#F4F5F7] rounded-card-inner">
                  <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1">ASSURANCE</p>
                  <p className="text-[13px] font-bold text-black uppercase">{selectedAthlete.insurance}</p>
                </div>
              </section>

              {/* DÉCHARGE DE RESPONSABILITÉ */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-[#D1D1D1] uppercase tracking-[0.3em] italic flex items-center gap-2">
                  <Shield size={12} /> DÉCHARGE DE RESPONSABILITÉ
                </h3>
                {selectedAthlete.waiverStatus === "SIGNÉE" ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-card-inner p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider">CONFORMITÉ CONFIRMÉE</span>
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded">OK</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-100/30 px-2 py-0.5 rounded">{selectedAthlete.waiverToken}</span>
                    </div>
                    <p className="text-[11px] text-emerald-900/80 font-medium leading-relaxed uppercase">
                      Décharge de responsabilité signée électroniquement le <strong className="text-emerald-950 font-bold">{selectedAthlete.waiverDate}</strong> depuis l&apos;IP <strong className="text-emerald-950 font-bold">{selectedAthlete.waiverIp}</strong>.
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAthlete.waiverToken || "");
                        setCopiedReceiptAthleteId(selectedAthlete.role);
                        setTimeout(() => setCopiedReceiptAthleteId(null), 2000);
                      }}
                      className="w-full py-2.5 bg-white hover:bg-emerald-100/30 text-emerald-700 hover:text-emerald-950 text-[10px] font-black uppercase tracking-wider rounded-control border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedReceiptAthleteId === selectedAthlete.role ? (
                        <>
                          <Check size={12} className="text-emerald-600" /> Reçu de signature copié !
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copier le reçu de signature
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-card-inner p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">VULNÉRABILITÉ JURIDIQUE</span>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          Ce membre n&apos;a pas encore signé la décharge de responsabilité. Il est légalement exposé en cas d&apos;accident corporel.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          const match = selectedAthlete.role.match(/ID:\s*(M\d+)/i);
                          const athleteIdParam = match ? match[1] : "";
                          const waiverUrl = `${getAppUrl()}/waiver?athleteId=${athleteIdParam}`;
                          navigator.clipboard.writeText(waiverUrl);
                          setCopiedWaiverAthleteId(selectedAthlete.role);
                          setTimeout(() => setCopiedWaiverAthleteId(null), 2000);
                        }}
                        className="flex-1 py-2.5 bg-white hover:bg-amber-100/20 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-control border border-amber-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {copiedWaiverAthleteId === selectedAthlete.role ? (
                          <>
                            <Check size={12} /> Lien de signature copié !
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copier le lien unique
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const match = selectedAthlete.role.match(/ID:\s*(M\d+)/i);
                          const athleteIdParam = match ? match[1] : "";
                          const waiverUrl = `${getAppUrl()}/waiver?athleteId=${athleteIdParam}`;
                          const cleanPhone = selectedAthlete.phone ? selectedAthlete.phone.replace(/[^+\d]/g, "") : "";
                          const firstName = selectedAthlete.name ? selectedAthlete.name.split(" ")[0] : "coureur";
                          const message = `Salut ${firstName} ! C'est ton Capitaine de course 🏃‍♂️. Peux-tu prendre 1 minute pour signer la décharge de responsabilité CAPTEN obligatoire pour participer à nos runs ? C'est super rapide, voici le lien unique : ${waiverUrl}`;
                          const waUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`;
                          window.open(waUrl, "_blank");
                          setWhatsAppSendStatus("envoyé");
                          setTimeout(() => setWhatsAppSendStatus(null), 3000);
                        }}
                        className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-[10px] font-black uppercase tracking-wider rounded-control transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {whatsAppSendStatus ? (
                          <>
                            <Check size={12} /> WhatsApp Relance Envoyée !
                          </>
                        ) : (
                          <>
                            <MessageSquare size={12} /> Relancer sur WhatsApp
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t-[0.5px] border-[#E5E5E5]">
                <div className="flex gap-3">
                  <Link href="/messages" className="flex-1 btn-primary h-11 flex items-center justify-center gap-1.5">
                    <MessageSquare size={14} /> ENVOYER UN MESSAGE
                  </Link>
                  <Link href="/securite" className="btn-secondary h-11 px-6 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] flex items-center justify-center gap-1.5">
                    <Shield size={14} /> SIGNALER
                  </Link>
                </div>
                {(selectedAthlete.role || '').toLowerCase().includes("banni") ? (
                  <button
                    onClick={() => handlePardonAthlete(selectedAthlete)}
                    className="w-full btn-lg-cta bg-emerald-600 hover:bg-black text-white border-none min-h-[44px] flex items-center justify-center"
                  >
                    🤝 LEVER LA SUSPENSION (GRACIER)
                  </button>
                ) : (
                  <button
                    onClick={() => handleBanAthlete(selectedAthlete)}
                    className="w-full btn-lg-cta bg-red-600 hover:bg-black text-white border-none min-h-[44px] flex items-center justify-center"
                  >
                    ❌ EXCLURE / BANNIR DU CLUB
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AJOUTER UN COUREUR MODAL */}
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
                <h3 className="text-[18px] font-display italic font-black uppercase text-black">AJOUTER UN COUREUR</h3>
              </div>
              <p className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                Création de la fiche membre et informations de sécurité
              </p>
            </div>

            {isSuccess ? (
              <div className="py-6 text-center space-y-6">
                <div className="w-12 h-12 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] mx-auto animate-bounce">
                  <CheckCircle2 size={24} strokeWidth={3} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[18px] font-display italic font-black uppercase text-black">MEMBRE AJOUTÉ !</h4>
                  <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">
                    Fiche membre créée et coureur ajouté.
                  </p>
                </div>
                
                {newAthleteLink && (
                  <div className="bg-amber-50 border border-amber-100 rounded-card-inner p-4 text-left space-y-3">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle size={12} /> ACTION REQUISE : DÉCHARGE À SIGNER
                    </p>
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      Pour finaliser l&apos;adhésion en toute conformité légale, copiez le lien ci-dessous et transmettez-le au coureur pour signature :
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={newAthleteLink}
                        className="flex-1 bg-white border border-amber-200 px-3 py-2 rounded-control text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(newAthleteLink);
                        }}
                        className="px-4 py-2 bg-[#FF5C00] text-white text-[10px] font-black uppercase tracking-wider rounded-control hover:bg-black transition-colors"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsSuccess(false);
                    setNewAthleteLink(null);
                  }}
                  className="w-full btn-lg-cta"
                >
                  FERMER
                </button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                
                const fullName = `${formData.firstName} ${formData.lastName}`.trim();
                const recruitIdNumber = athletes.length + 1;
                const roleWithId = `${formData.role} · ID: M${recruitIdNumber}`;
                const athleteIdParam = `M${recruitIdNumber}`;

                const newAthlete: Athlete = {
                  initial: formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'M',
                  name: fullName,
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  role: roleWithId,
                  reliability: parseInt(formData.reliability) || 90,
                  pace: formData.pace || "5:00/K",
                  totalKm: "0 km",
                  lastRun: "Jamais",
                  runs: 0,
                  img: '',
                  streak: 0,
                  tier: "BRONZE",
                  tierColor: "#CD7F32",
                  phone: formData.phone,
                  email: formData.email,
                  emergencyName: formData.emergencyName,
                  emergencyPhone: formData.emergencyPhone,
                  emergencyRelation: formData.emergencyRelation,
                  birthDate: formData.birthDate,
                  bloodType: formData.bloodType,
                  allergies: formData.allergies || "Aucune",
                  healthIssues: formData.healthIssues || "Aucun",
                  insurance: formData.insurance || "Non spécifiée",
                  joinDate: new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', month: 'short', year: 'numeric' }),
                  address: formData.address || "Non spécifiée",
                  waiverStatus: "NON SIGNÉE"
                };

                let savedRemotely = false;
                let remoteId = athleteIdParam;

                if (!isMock) {
                  try {
                    const res = await fetch('/api/runners', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: fullName,
                        phone: formData.phone,
                        email: formData.email,
                        role: formData.role,
                        reliability: parseInt(formData.reliability) || 90,
                        pace: formData.pace,
                        emergency_name: formData.emergencyName,
                        emergency_phone: formData.emergencyPhone,
                        emergency_relation: formData.emergencyRelation,
                        birth_date: formData.birthDate,
                        blood_type: formData.bloodType,
                        allergies: formData.allergies,
                        health_issues: formData.healthIssues,
                        insurance: formData.insurance,
                        address: formData.address
                      })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data && data.id) {
                        savedRemotely = true;
                        remoteId = data.id;
                        await loadAthletes();
                      }
                    }
                  } catch (err) {
                    console.error("Error creating runner:", err);
                  }
                }

                if (!savedRemotely) {
                  const updatedAthletes = [newAthlete, ...athletes];
                  setAthletes(updatedAthletes);
                  localStorage.setItem("capten_athletes_v3", JSON.stringify(updatedAthletes));
                }

                const link = `${getAppUrl()}/waiver?runnerId=${remoteId}`;
                setNewAthleteLink(link);

                setIsSubmitting(false);
                setIsSuccess(true);
                
                // Reset form fields
                setFormData({
                  firstName: "",
                  lastName: "",
                  role: "Membre",
                  reliability: "90",
                  pace: "5:00/K",
                  phone: "",
                  email: "",
                  address: "",
                  birthDate: "",
                  bloodType: "A+",
                  allergies: "Aucune",
                  healthIssues: "Aucun",
                  insurance: "",
                  emergencyName: "",
                  emergencyRelation: "Conjoint",
                  emergencyPhone: "",
                });
              }} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Prénom <span className="text-[#FF5C00]">*</span></label>
                    <input type="text" required value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="brutalist-input" />
                  </div>
                  {/* Nom */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Nom</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="brutalist-input" />
                  </div>
                  {/* Téléphone */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Téléphone <span className="text-[#FF5C00]">*</span></label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="brutalist-input" />
                  </div>
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">E-mail</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="brutalist-input" />
                  </div>
                  {/* Pace */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Allure moyenne</label>
                    <input type="text" placeholder="ex. 4:45/K" value={formData.pace} onChange={(e) => setFormData(prev => ({ ...prev, pace: e.target.value }))} className="brutalist-input" />
                  </div>
                  {/* Birth */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Date de naissance</label>
                    <input type="date" value={formData.birthDate} onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))} className="brutalist-input" />
                  </div>
                </div>

                {/* Emergency Card Box exactly like photo */}
                <div className="bg-[#FFF5F5] border-[0.5px] border-[#FF0000]/10 rounded-card-inner p-4 space-y-3">
                  <p className="text-[8px] font-black text-[#FF0000] uppercase tracking-wider flex items-center gap-1.5"><Phone size={10} /> CONTACT EN CAS D&apos;URGENCE (ICE)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[7.5px] font-black text-black uppercase tracking-widest block">Nom contact</label>
                      <input type="text" value={formData.emergencyName} onChange={(e) => setFormData(prev => ({ ...prev, emergencyName: e.target.value }))} className="w-full px-2.5 py-1.5 bg-white border border-[#FF0000]/20 rounded-control text-[11px] font-bold text-black focus:outline-none focus:border-[#FF0000]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7.5px] font-black text-black uppercase tracking-widest block">Relation</label>
                      <select value={formData.emergencyRelation} onChange={(e) => setFormData(prev => ({ ...prev, emergencyRelation: e.target.value }))} className="w-full px-2.5 py-1.5 bg-white border border-[#FF0000]/20 rounded-control text-[11px] font-bold text-black focus:outline-none focus:border-[#FF0000]">
                        <option value="Conjoint">Conjoint</option>
                        <option value="Parent">Parent</option>
                        <option value="Frère/Soeur">Frère / Sœur</option>
                        <option value="Ami">Ami</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[7.5px] font-black text-black uppercase tracking-widest block">Téléphone Urgence <span className="text-[#FF0000]">*</span></label>
                      <input type="tel" required value={formData.emergencyPhone} onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))} className="w-full px-2.5 py-1.5 bg-white border border-[#FF0000]/20 rounded-control text-[11px] font-bold text-black focus:outline-none focus:border-[#FF0000]" />
                    </div>
                  </div>
                </div>


                {/* Submit button like photo */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full btn-lg-cta mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      AJOUT EN COURS...
                    </>
                  ) : (
                    "AJOUTER AU CLUB ⚡"
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
