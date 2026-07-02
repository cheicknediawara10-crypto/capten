'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getAppUrl } from '@/lib/domain';
import { 
  ShieldAlert, Users, FileText, Lock, MessageSquare, AlertTriangle, 
  CheckCircle2, ArrowRight, X, UserX, Shield, EyeOff, Eye, Send, Trash2, Plus,
  Clipboard, Copy, RefreshCw, Check
} from 'lucide-react';

interface Incident {
  id: string;
  date: string;
  type: string;
  status: string;
  priority: string;
  description?: string;
  involved?: string;
  anonymous: boolean;
}

interface SignedAthlete {
  id: string;
  name: string;
  date: string;
  ip: string;
  token: string;
}

export default function SecuritePage() {
  const { isMock } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [type, setType] = useState('Comportement Toxique');
  const [involved, setInvolved] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [priority, setPriority] = useState('MOYENNE');
  const [isSuccess, setIsSuccess] = useState(false);

  const [origin, setOrigin] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  const copyReportLink = () => {
    const reportUrl = `${getAppUrl()}/securite/signaler`;
    navigator.clipboard.writeText(reportUrl);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Detail View State
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Charte du Capitaine State
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [rules, setRules] = useState<string[]>([
    "Zéro tolérance pour le harcèlement sexiste/moral.",
    "Respect absolu du niveau de chaque coureur.",
    "Interdiction de partage de données privées hors club.",
    "Obligation de secours en cas d'accident sur run."
  ]);
  const [tempRules, setTempRules] = useState<string[]>([]);

  // Legal Shield State
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRelancing, setIsRelancing] = useState(false);
  const [relanceSuccess, setRelanceSuccess] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const [athletes, setAthletes] = useState<any[]>([]);

  // API State
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [banningRunner, setBanningRunner] = useState(false);
  const [banSuccessMessage, setBanSuccessMessage] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setIsLoadingIncidents(true);
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (res.ok && data.success) {
        const mapped = data.incidents.map((inc: any) => ({
          id: inc.id,
          date: new Date(inc.created_at).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'short' }),
          type: inc.type,
          status: inc.status,
          priority: inc.priority,
          description: inc.details,
          involved: inc.anonymous ? 'Anonyme' : inc.involved || 'Anonyme',
          anonymous: inc.anonymous,
          reporter_name: inc.reporter_name,
          reporter_phone: inc.reporter_phone,
          raw_id: inc.id // Keep DB uuid
        }));
        setIncidents(mapped);
      }
    } catch (e) {
      console.error("Error fetching incidents:", e);
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  useEffect(() => {
    setOrigin(getAppUrl());
    fetchIncidents();
  }, []);

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/incidents?id=${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RÉSOLU' })
      });
      if (res.ok) {
        fetchIncidents();
        setSelectedIncident(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/incidents?id=${incidentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchIncidents();
        setSelectedIncident(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBanRunner = async (nameOrInvolved: string) => {
    if (!nameOrInvolved || nameOrInvolved === 'Anonyme') return;
    if (!window.confirm(`Voulez-vous vraiment exclure définitivement ${nameOrInvolved} du Run Club ?`)) return;

    setBanningRunner(true);
    setBanSuccessMessage(null);

    try {
      const res = await fetch('/api/runners/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runner_name: nameOrInvolved,
          is_blacklisted: true
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBanSuccessMessage(`Le membre ${nameOrInvolved} a été banni avec succès.`);
        setTimeout(() => setBanSuccessMessage(null), 4000);
        
        // Reload athletes
        await loadAthletesList();
      } else {
        alert(data.error || "Une erreur s'est produite lors du bannissement.");
      }
    } catch (err) {
      alert("Erreur réseau lors de la suspension.");
    } finally {
      setBanningRunner(false);
    }
  };

  const loadAthletesList = async () => {
    if (isMock) {
      const stored = localStorage.getItem('capten_athletes_v3');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          setAthletes(list.map((a: any) => ({
            id: a.id || a.name,
            name: a.name,
            phone: a.phone || '06 00 00 00 00',
            waiverStatus: a.waiverStatus || "NON SIGNÉE",
            waiverDate: a.waiverDate || null,
            waiverIp: a.waiverIp || "127.0.0.1",
            waiverToken: a.waiverToken || "sha256:unknown",
            role: a.role || "Runner",
            status: a.status || "ACTIF"
          })));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      try {
        const res = await fetch('/api/runners');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map((a: any) => ({
              id: a.id,
              name: a.name || a.email,
              phone: a.phone || '06 00 00 00 00',
              waiverStatus: a.waiver_signed_at ? "SIGNÉE" : "NON SIGNÉE",
              waiverDate: a.waiver_signed_at ? new Date(a.waiver_signed_at).toLocaleDateString('fr-FR') : null,
              waiverIp: a.waiver_ip || "127.0.0.1",
              waiverToken: a.waiver_token || "sha256:unknown",
              role: a.reliability || "Runner",
              status: a.is_blacklisted ? "BANNI" : "ACTIF"
            }));
            setAthletes(mapped);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadAthletesList();

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', loadAthletesList);
      return () => {
        window.removeEventListener('focus', loadAthletesList);
      };
    }
  }, [isMock]);

  const signedList = athletes
    .filter(a => a.waiverStatus === "SIGNÉE" && a.status !== "BANNI")
    .map(a => ({
      id: a.role,
      name: a.name,
      date: a.waiverDate || "Horodatage manquant",
      ip: a.waiverIp || "194.2.16.8",
      token: a.waiverToken || "sha256:unknown"
    }));

  const unsignedList = athletes
    .filter(a => a.waiverStatus !== "SIGNÉE" && a.status !== "BANNI")
    .map(a => ({
      name: a.name,
      phone: a.phone || "06 00 00 00 00"
    }));

  const athletesList = athletes.filter(a => a.status !== "BANNI").map(a => a.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          priority,
          anonymous,
          involved: anonymous ? 'Anonyme' : involved || 'Non spécifié',
          details: description || "Aucune description supplémentaire."
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        fetchIncidents();
        setTimeout(() => {
          setIsSuccess(false);
          setIsModalOpen(false);
          setType('Comportement Toxique');
          setInvolved('');
          setDescription('');
          setAnonymous(true);
          setPriority('MOYENNE');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyWaiverLink = () => {
    const waiverUrl = `${getAppUrl()}/waiver`;
    navigator.clipboard.writeText(waiverUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copySignatureToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const triggerWaiverRelance = () => {
    if (isRelancing) return;
    setIsRelancing(true);
    setRelanceSuccess(false);

    // Simulate sending WhatsApp relances to unsigned athletes
    setTimeout(() => {
      setIsRelancing(false);
      setRelanceSuccess(true);
      setTimeout(() => setRelanceSuccess(false), 3000);
    }, 1800);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* HARMONIZED HEADER */}
      <header className="flex flex-col gap-1.5 pb-6 sm:pb-10 border-b-[1px] border-black/5 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tight">
                PROTECTION DU CREW
              </h1>
            </div>
          </div>
      </header>

      {banSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl p-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider animate-scale-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{banSuccessMessage}</span>
        </div>
      )}

      {/* TOP BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BLOCK 1: ZERO TOLERANCE */}
        <div className="col-span-1 lg:col-span-8 bg-[#0D0E12] border border-red-500/20 rounded-card-outer p-6 sm:p-8 flex flex-col justify-between min-h-[320px] sm:h-[350px] shadow-2xl relative overflow-hidden group">
          {/* Subtle Red glow overlay */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-105 transition-all duration-500 pointer-events-none text-white">
            <ShieldAlert size={160} />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="bg-red-500/10 border border-red-500/20 w-fit px-3 py-1 rounded-full">
               <span className="text-[9px] font-black text-red-500 uppercase tracking-widest font-mono">CADRE & BIENVEILLANCE / SAFE-RUN</span>
            </div>
            <div className="space-y-2.5">
              <h2 className="text-[32px] sm:text-[40px] font-display italic font-black text-white uppercase leading-none tracking-tight">
                ESPACE SÛR & <span className="text-red-500">SIGNALEMENT ANONYME</span>
              </h2>
              <p className="text-neutral-400 text-[11.5px] sm:text-[12px] font-medium leading-relaxed max-w-[520px]">
                Le club doit rester un espace safe pour tout le monde. Ce lien public permet à tes membres de te signaler un comportement inapproprié (harcèlement, sexisme, comportement toxique) ou un problème de santé en toute confidentialité.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 relative z-10 w-full mt-6">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 btn-primary bg-white text-black hover:bg-red-600 hover:text-white border-none shadow-md"
            >
              📝 SIGNALER DIRECT (CAPTAIN)
            </button>
            <button 
              onClick={copyReportLink}
              className="flex-1 btn-secondary bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:text-white"
            >
              {copiedReport ? "🔗 LIEN COPIÉ !" : "🔗 COPIER LE LIEN PUBLIC"}
            </button>
            <a 
              href={origin ? `https://wa.me/?text=${encodeURIComponent(`⚠️ Alerte Sécurité & Respect - Si vous êtes témoin ou victime d'un comportement inapproprié, d'un harcèlement ou d'une situation de malaise au sein du club, vous pouvez le signaler anonymement et en toute sécurité ici :\n\n👉 ${origin}/securite/signaler`)}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-secondary bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 hover:text-white"
            >
              💬 PARTAGER SUR WHATSAPP
            </a>
          </div>
        </div>

        {/* BLOCK 2: STATS DÉCHARGES */}
        <div className="col-span-1 lg:col-span-4 bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-0 shadow-sm">
          <div className="space-y-1">
             <p className="thin-label">BOUCLIER JURIDIQUE</p>
             {signedList.length === 0 ? (
               <div className="space-y-1">
                 <h3 className="text-[36px] sm:text-[42px] font-display italic font-black text-[#9B9B93] leading-none">
                   —
                 </h3>
                 <p className="text-[11px] font-medium text-[#9B9B93]">
                   Visible après les 1ères inscriptions
                 </p>
               </div>
             ) : (
               <div className="flex items-baseline gap-2">
                 <h3 className="text-[36px] sm:text-[42px] font-display italic font-black text-black leading-none">
                   {signedList.length}
                 </h3>
                 <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-widest">SIGNÉES</span>
               </div>
             )}
          </div>
          <div className="space-y-4">
             <div className="h-1.5 bg-[#F4F5F7] rounded-control overflow-hidden">
               <div className="h-full bg-[#FF5C00]" style={{ width: `${signedList.length + unsignedList.length > 0 ? (signedList.length / (signedList.length + unsignedList.length)) * 100 : 0}%` }} />
             </div>
             <p className="text-[10px] font-medium text-[#A3A3A3] uppercase leading-relaxed tracking-wider">
               {unsignedList.length > 0 
                 ? `${unsignedList.length} coureur(s) restant(s) à régulariser.`
                 : "Tous les coureurs actifs sont en règle juridiquement."}
             </p>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOCK 3: CODE OF CONDUCT */}
        <div className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[18px] font-display italic font-black uppercase text-black">Charte du Capitaine</h3>
              {!isEditingRules ? (
                <button 
                  onClick={() => {
                    setTempRules([...rules]);
                    setIsEditingRules(true);
                  }}
                  className="thin-label text-[#FF5C00] underline cursor-pointer hover:text-black transition-colors"
                >
                  MODIFIER
                </button>
              ) : (
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setRules(tempRules.filter(r => r.trim() !== ''));
                      setIsEditingRules(false);
                    }}
                    className="thin-label text-[#56E39F] underline cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    ENREGISTRER
                  </button>
                  <button 
                    onClick={() => setIsEditingRules(false)}
                    className="thin-label text-[#FF0000] underline cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    ANNULER
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3.5">
              {!isEditingRules ? (
                rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-[#F4F5F7] p-4 rounded-card-inner">
                    <CheckCircle2 size={18} className="text-[#56E39F] shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-black">{rule}</span>
                  </div>
                ))
              ) : (
                <>
                  {tempRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#F4F5F7] px-4 py-3 rounded-card-inner border-[0.5px] border-black/5">
                      <CheckCircle2 size={16} className="text-[#A3A3A3] shrink-0" />
                      <input 
                        type="text" 
                        value={rule} 
                        onChange={(e) => {
                          const newTemp = [...tempRules];
                          newTemp[idx] = e.target.value;
                          setTempRules(newTemp);
                        }}
                        placeholder="Écrire la règle..."
                        className="flex-1 bg-transparent text-[11px] font-bold uppercase tracking-wide text-black focus:outline-none border-b border-transparent focus:border-black/10 pb-0.5"
                      />
                      <button 
                        onClick={() => {
                          setTempRules(tempRules.filter((_, i) => i !== idx));
                        }}
                        className="text-[#A3A3A3] hover:text-[#FF0000] transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setTempRules([...tempRules, ''])}
                    className="w-full py-3.5 border-[0.5px] border-dashed border-[#A3A3A3] hover:border-black rounded-control text-[10px] font-black uppercase tracking-widest text-[#A3A3A3] hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> AJOUTER UNE RÈGLE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* BLOCK 4: INCIDENT TRACKER */}
        <div className="bg-black text-white rounded-card-outer p-6 sm:p-8 space-y-8 shadow-sm">
           <div className="flex justify-between items-center">
              <h3 className="text-[18px] font-display italic font-black uppercase">Retours de l'équipe</h3>
              <div className="bg-white/10 px-3 py-1 rounded-full">
                 <span className="text-[10px] font-bold uppercase tracking-widest">{incidents.length} SIGNALEMENTS</span>
              </div>
           </div>
           <div className="space-y-3">
             {isLoadingIncidents ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-white/40">
                   <RefreshCw className="w-5 h-5 animate-spin" />
                   <p className="text-[10px] font-bold uppercase tracking-wider">Chargement des signalements...</p>
                </div>
              ) : incidents.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-[10px] font-bold uppercase tracking-wider border border-dashed border-white/10 rounded-card-inner">
                  Aucun incident signalé. Le club est sûr ✓
                </div>
              ) : (
                incidents.map((inc, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedIncident(inc)}
                    className="flex items-center justify-between p-4 border-[0.5px] border-white/10 rounded-card-inner hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${inc.priority === 'HAUTE' ? 'bg-[#FF0000]' : 'bg-[#FF5C00]'}`} />
                      <div className="space-y-0.5">
                         <p className="text-[11px] font-black uppercase tracking-tight">{inc.type}</p>
                         <p className="text-[9px] font-medium text-white/40 uppercase">{inc.id} • {inc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-white/40 uppercase italic tracking-widest hidden sm:inline">{inc.status}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              )}
           </div>
           <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em] text-center pt-4 border-t border-white/10 italic">
             CANAL DE SIGNALEMENT SÉCURISÉ & PRIVÉ
           </p>
        </div>
      </div>

      {/* NEW SECTION: BOUCLIER LÉGAL & DÉCHARGES */}
      <div className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-card-inner flex items-center justify-center text-[#FF5C00]">
              <Shield size={20} className="fill-[#FF5C00]/10" />
            </div>
            <div>
              <h3 className="text-[18px] font-display italic font-black uppercase text-black leading-none">Bouclier Légal & Décharges</h3>
              <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">Archivage et conformité juridique des runners</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyWaiverLink}
              className="btn-secondary h-9 px-4 rounded-control"
            >
              {copiedLink ? (
                <>
                  <Check size={12} className="text-emerald-600" strokeWidth={3} /> Lien copié !
                </>
              ) : (
                <>
                  <Copy size={12} /> Copier le lien de signature
                </>
              )}
            </button>
            <button
              onClick={triggerWaiverRelance}
              disabled={isRelancing || unsignedList.length === 0}
              className="btn-primary h-9 px-4 rounded-control disabled:opacity-50"
            >
              {isRelancing ? (
                <>
                  <RefreshCw size={12} className="animate-spin" /> Relance en cours...
                </>
              ) : relanceSuccess ? (
                <>
                  <CheckCircle2 size={12} /> Relance WhatsApp envoyée !
                </>
              ) : (
                <>
                  <MessageSquare size={12} /> Relancer les non-signataires ({unsignedList.length})
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Waiver configuration status */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F4F5F7] border border-black/5 p-5 rounded-card-inner space-y-4">
              <span className="thin-label block">CONTRAT DE DÉCHARGE ACTIF</span>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-black uppercase">DÉCHARGE DE RESPONSABILITÉ</span>
              </div>
              <p className="text-xs text-[#475569] font-medium leading-relaxed">
                Ce contrat exige que tout nouveau coureur s&apos;engage sur son aptitude physique, exonère le capitaine et la plateforme CAPTEN, et autorise le droit à l&apos;image.
              </p>
              <div className="border-t border-black/10 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-[11px] font-bold text-[#475569] uppercase font-sans">Taux de signature</span>
                {signedList.length + unsignedList.length > 0 ? (
                  <span className="text-xs font-black text-[#FF5C00]">
                    {signedList.length} / {signedList.length + unsignedList.length} Coureurs ({Math.round((signedList.length / (signedList.length + unsignedList.length)) * 100)}%)
                  </span>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-black text-[#9B9B93]">— coureur</span>
                    <p className="text-[11px] text-[#9B9B93] mt-0.5">Visible après les 1ères inscriptions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Unsigned members alert */}
            {unsignedList.length > 0 && (
              <div className="bg-[#FFF5F5] border border-red-100 p-4 rounded-card-inner flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="thin-label text-red-600 block">Alerte Vulnérabilité Juridique</span>
                  <p className="text-xs text-red-800 font-medium leading-relaxed">
                    Les runners suivants n&apos;ont pas signé le waiver :
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {unsignedList.map((runner, i) => (
                      <span key={i} className="text-[9px] font-bold bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-control uppercase">
                        {runner.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Signed records */}
          <div className="lg:col-span-7 space-y-4">
            <span className="thin-label block">SIGNATURES RÉCENTES (PREUVE NUMÉRIQUE)</span>
            <div className="border border-black/5 rounded-card-inner overflow-hidden bg-[#F4F5F7] divide-y divide-black/5">
              {signedList.map((sig, i) => (
                <div key={i} className="p-3.5 flex justify-between items-center hover:bg-white transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#0F172A] uppercase">{sig.name}</span>
                      <span className="text-[7.5px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">SIGNÉE</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">IP: {sig.ip} • le {sig.date}</p>
                  </div>
                  <button
                    onClick={() => copySignatureToken(sig.token, sig.id)}
                    className="btn-secondary h-8 px-2.5 rounded-control shadow-sm"
                  >
                    {copiedTokenId === sig.id ? (
                      <>
                        <Check size={10} className="text-emerald-600" strokeWidth={3} /> Reçu copié !
                      </>
                    ) : (
                      <>
                        <Clipboard size={10} /> Copier le reçu
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RETIRER UN MEMBRE MODULE */}
      <section className="bg-white border-[0.5px] border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 bg-[#F4F5F7] rounded-card-inner flex items-center justify-center text-[#FF0000] shrink-0">
            <UserX size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[16px] sm:text-[18px] font-display italic font-black uppercase text-black leading-tight">Retirer un membre du club</h3>
            <p className="text-[11px] sm:text-[12px] font-medium text-[#A3A3A3] uppercase tracking-wider">En cas de non-respect répété de la charte, tu peux suspendre définitivement l'accès d'un coureur à ton club CAPTEN.</p>
          </div>
        </div>
        <Link href="/athletes" className="w-full sm:w-auto btn-secondary">
          LANCER LA PROCÉDURE
        </Link>
      </section>

      {/* MODAL: SIGNALEMENT INCIDENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border-[0.5px] border-[#E5E5E5] w-full max-w-form-single rounded-modal-box shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-scale-up text-black">
            <header className="px-8 py-6 border-b-[0.5px] border-[#E5E5E5] flex justify-between items-center bg-[#FFF5F5]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000]">
                  <Shield size={16} />
                </div>
                <div>
                  <h3 className="text-[16px] font-display italic font-black uppercase text-black leading-none">SIGNALER UN COMPORTEMENT</h3>
                  <span className="text-[9px] font-bold text-[#FF0000] uppercase tracking-widest">SIGNALEMENT SÉCURISÉ & PRIVÉ</span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-full border border-black/5 hover:border-black/10 bg-white flex items-center justify-center text-[#A3A3A3] hover:text-black transition-all cursor-pointer shadow-sm active:scale-90"
              >
                <X size={14} />
              </button>
            </header>

            {isSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-[20px] font-display italic font-black uppercase text-black leading-none">SIGNALEMENT ENREGISTRÉ</h4>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Le ticket a été transmis avec succès au poste de commandement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                {/* Type d'incident */}
                <div className="space-y-2">
                  <label className="thin-label block">Type de Comportement</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="brutalist-input"
                  >
                    <option value="Comportement Toxique">Comportement Toxique</option>
                    <option value="Malaise Groupe">Malaise Groupe / Tension</option>
                    <option value="Harcèlement Sexiste/Moral">Harcèlement Sexiste/Moral</option>
                    <option value="Non-respect des Consignes">Non-respect des Consignes de Sécurité</option>
                    <option value="Autre Incident">Autre Incident de Terrain</option>
                  </select>
                </div>

                {/* Priorité */}
                <div className="space-y-2">
                  <label className="thin-label block">Niveau de Priorité</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['BASSE', 'MOYENNE', 'HAUTE'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-3 rounded-control text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          priority === p 
                            ? p === 'HAUTE' ? 'bg-[#FF0000] text-white shadow-md shadow-red-500/25' : p === 'MOYENNE' ? 'bg-[#FF5C00] text-white shadow-md shadow-orange-500/25' : 'bg-black text-white'
                            : 'bg-[#F4F5F7] text-[#A3A3A3] hover:text-black hover:bg-[#E5E5E5]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Anonymat Toggle */}
                <div className="bg-[#F4F5F7] p-4 rounded-card-inner flex items-center justify-between border-[0.5px] border-black/10">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-black uppercase">Signaler anonymement</p>
                    <p className="text-[9px] font-medium text-[#A3A3A3] uppercase">Votre nom ne sera pas lié à ce ticket.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnonymous(!anonymous)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none flex items-center cursor-pointer ${
                      anonymous ? 'bg-[#FF0000]' : 'bg-[#D1D1D1]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      anonymous ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Membre concerné */}
                {!anonymous && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="thin-label block">Membre concerné</label>
                    <select
                      value={involved}
                      onChange={e => setInvolved(e.target.value)}
                      className="brutalist-input"
                    >
                      <option value="">Sélectionner un membre (facultatif)</option>
                      {athletesList.map((ath, i) => (
                        <option key={i} value={ath}>{ath}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label className="thin-label block">Description des faits</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Décrivez précisément la situation (comportement, heure, contexte...)"
                    required
                    className="brutalist-input h-24 py-3 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn-lg-cta bg-red-600 hover:bg-black text-white border-none shadow-lg shadow-red-600/10"
                >
                  <Send size={14} /> TRANSMETTRE LE SIGNALEMENT
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL: TICKET VIEW */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedIncident(null)} />
          <div className="relative bg-white border-[0.5px] border-[#E5E5E5] w-full max-w-form-single rounded-modal-box shadow-2xl overflow-hidden z-10 flex flex-col animate-scale-up text-black">
            <header className="px-8 py-6 border-b-[0.5px] border-[#E5E5E5] flex justify-between items-center bg-black text-white">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedIncident.priority === 'HAUTE' ? 'bg-[#FF0000]' : 'bg-[#FF5C00]'}`}>
                  <ShieldAlert size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-display italic font-black uppercase text-white leading-none">{selectedIncident.type}</h3>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{selectedIncident.id} • {selectedIncident.date}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIncident(null)} 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </header>

            <div className="p-8 space-y-6 text-black">
              {/* Vibe and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F4F5F7] p-4 rounded-card-inner">
                  <span className="thin-label block mb-1.5">PRIORITÉ</span>
                  <p className={`text-[13px] font-bold uppercase ${selectedIncident.priority === 'HAUTE' ? 'text-[#FF0000]' : 'text-[#FF5C00]'}`}>
                    {selectedIncident.priority}
                  </p>
                </div>
                <div className="bg-[#F4F5F7] p-4 rounded-card-inner">
                  <span className="thin-label block mb-1.5">STATUT ACTUEL</span>
                  <p className="text-[13px] font-bold text-black uppercase">{selectedIncident.status}</p>
                </div>
              </div>

              {/* Source anonymity indicator */}
              <div className="bg-[#F4F5F7] p-4 rounded-card-inner flex items-center gap-3 border border-black/5">
                {selectedIncident.anonymous ? (
                  <>
                    <EyeOff size={18} className="text-[#FF5C00]" />
                    <div>
                      <p className="text-[11px] font-bold text-black uppercase leading-none mb-1">Signalement Anonyme</p>
                      <p className="text-[9px] font-medium text-[#A3A3A3] uppercase">La source reste confidentielle conformément à la garantie Safe-Run.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Eye size={18} className="text-[#56E39F]" />
                    <div>
                      <p className="text-[11px] font-bold text-black uppercase leading-none mb-1">Membre Concerné</p>
                      <p className="text-[9px] font-medium text-black uppercase font-bold">{selectedIncident.involved}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Description body */}
              <div className="space-y-2">
                <span className="thin-label">Rapport des Faits</span>
                <div className="bg-[#F4F5F7] p-5 rounded-card-inner text-[12px] font-bold uppercase tracking-wide text-black leading-relaxed border border-black/5">
                  &quot;{selectedIncident.description}&quot;
                </div>
              </div>

              {/* Actions for Founder */}
              <div className="flex flex-col gap-2 pt-4 border-t-[0.5px] border-[#E5E5E5]">
                {selectedIncident.status !== 'RÉSOLU' ? (
                  <>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResolveIncident((selectedIncident as any).raw_id || selectedIncident.id)}
                        className="flex-1 btn-primary bg-[#56E39F] hover:bg-black text-white border-none"
                      >
                        MARQUER RÉSOLU
                      </button>
                      <Link 
                        href="/athletes"
                        className="flex-1 btn-secondary text-center flex items-center justify-center"
                      >
                        GÉRER LE MEMBRE
                      </Link>
                    </div>
                    {selectedIncident.involved && selectedIncident.involved !== 'Anonyme' && (
                      <button 
                        onClick={() => handleBanRunner(selectedIncident.involved!)}
                        disabled={banningRunner}
                        className="btn-lg-cta bg-red-600 hover:bg-black text-white border-none mt-2"
                      >
                        {banningRunner ? 'Exclusion en cours...' : `❌ EXCLURE ${selectedIncident.involved.toUpperCase()} DU CLUB`}
                      </button>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={() => handleDeleteIncident((selectedIncident as any).raw_id || selectedIncident.id)}
                    className="btn-lg-cta bg-black hover:bg-red-600 text-white border-none"
                  >
                    SUPPRIMER LE TICKET
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
