'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Check, Lock, AlertCircle, Calendar, 
  ArrowRight, Megaphone, UserPlus, HeartHandshake, Trophy,
  Copy, RotateCcw, X, MessageSquare, Users, Flame, Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AlertItem {
  id: string;
  type: string;
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  payload: any;
}

type ActionType = 'rediger_message' | 'gerer_situation' | 'motiver_crew' | 'mot_coureur' | 'custom' | null;

export default function CopilotDashboard() {
  const { club, isMock } = useAuth();
  
  // Proactive Alerts states
  const [headline, setHeadline] = useState('Analyse en cours...');
  const [briefing, setBriefing] = useState('');
  const [mood, setMood] = useState('neutre');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loadingProactive, setLoadingProactive] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  // Guided Chat states
  const [chatCallsCount, setChatCallsCount] = useState(0);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [inputs, setInputs] = useState({
    context: '',
    situation: '',
    goal: '',
    runnerName: '',
    customPrompt: ''
  });
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);

  const isFreePlan = club?.stripe_plan === 'GRATUIT';

  const fetchCopilotData = async () => {
    setLoadingProactive(true);
    try {
      const res = await fetch('/api/copilot');
      const data = await res.json();
      
      if (res.ok) {
        if (data.isLocked) {
          setIsLocked(true);
          setBriefing(data.briefing || '');
        } else {
          setHeadline(data.headline || 'Tout roule dans le crew !');
          setBriefing(data.briefing || '');
          setMood(data.mood || 'neutre');
          setAlerts(data.alerts || []);
          setIsLocked(false);
          
          const calls = data.chatCallsCount || 0;
          setChatCallsCount(calls);
          if (calls >= 20) {
            setLimitExceeded(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching copilot data:', err);
    } finally {
      setLoadingProactive(false);
    }
  };

  useEffect(() => {
    fetchCopilotData();
  }, [club?.stripe_plan]);

  const handleDismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    if (isMock) return;

    try {
      await fetch('/api/copilot/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', alertId })
      });
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const handleGuidedSubmit = async (e?: React.FormEvent, overrideAction?: ActionType, overrideInputs?: typeof inputs) => {
    if (e) e.preventDefault();
    setLoadingChat(true);
    setChatError(null);
    setLimitExceeded(false);

    const action = overrideAction || activeAction;
    const bodyInputs = overrideInputs || inputs;

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: action,
          inputs: bodyInputs
        })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.chatCallsCount !== undefined) {
          setChatCallsCount(data.chatCallsCount);
          if (data.chatCallsCount >= 20) {
            setLimitExceeded(true);
          }
        }
        
        if (data.limitExceeded) {
          setLimitExceeded(true);
          setAiResponse(data.reply);
        } else if (data.success) {
          setAiResponse(data.reply);
        } else {
          setChatError(data.reply || "Erreur de génération.");
        }
      } else {
        setChatError(data.error || "Erreur de connexion.");
      }
    } catch (err) {
      setChatError("Impossible de contacter le copilote IA.");
    } finally {
      setLoadingChat(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const resetChat = () => {
    setAiResponse(null);
    setChatError(null);
    setInputs({
      context: '',
      situation: '',
      goal: '',
      runnerName: '',
      customPrompt: ''
    });
    setActiveAction(null);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'coureurs_non_rentres':
        return <AlertCircle size={16} className="text-red-500 animate-bounce" />;
      case 'nouveau_runner':
        return <UserPlus size={16} className="text-[#FF5C00]" />;
      case 'regulier_decroche':
        return <HeartHandshake size={16} className="text-red-500" />;
      case 'aucun_run_prevu':
        return <Calendar size={16} className="text-[#FF5C00]" />;
      case 'baisse_frequentation':
        return <AlertCircle size={16} className="text-[#FF5C00]" />;
      case 'cagnotte_inactive':
        return <Megaphone size={16} className="text-amber-500" />;
      case 'record_affluence':
      case 'milestone_runs':
      case 'belle_dynamique':
        return <Trophy size={16} className="text-yellow-500" />;
      default:
        return <Sparkles size={16} className="text-[#FF5C00]" />;
    }
  };

  const getAlertAction = (alert: AlertItem) => {
    switch (alert.type) {
      case 'nouveau_runner':
        return {
          label: 'Accueillir',
          href: `/messages?tab=accueil&templateId=6.2&runner_name=${encodeURIComponent(alert.payload?.runner_name || '')}`
        };
      case 'regulier_decroche':
        return {
          label: 'Relancer',
          href: `/messages?tab=accueil&templateId=6.3&runner_name=${encodeURIComponent(alert.payload?.runner_name || '')}`
        };
      case 'aucun_run_prevu':
        return {
          label: 'Planifier',
          href: '/runs?openPlanifier=true'
        };
      case 'cagnotte_inactive':
        return {
          label: 'Activer',
          href: '/settings'
        };
      default:
        return {
          label: 'Voir',
          href: '/messages'
        };
    }
  };

  if (isFreePlan || isLocked) {
    return (
      <section className="bg-white border-[0.5px] border-black/10 rounded-[20px] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5C00]/10 rounded-[12px] flex items-center justify-center text-[#FF5C00]">
            <Sparkles size={20} className="text-[#FF5C00]" />
          </div>
          <div className="text-left">
            <h2 className="text-[20px] font-display italic font-black uppercase text-black leading-none">
              🧑‍✈️ TON COPILOTE IA
            </h2>
            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">
              Ce que ton crew a besoin que tu voies aujourd'hui
            </p>
          </div>
        </div>

        <div className="relative rounded-[16px] overflow-hidden bg-[#F4F5F7] border-[0.5px] border-black/15 p-6 sm:p-8 flex flex-col items-center text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-black mb-2 border border-black/5">
            <Lock size={18} className="text-black" />
          </div>
          <h4 className="text-[18px] font-display italic font-black uppercase tracking-tight text-black leading-none">
            COPILOTE IA VERROUILLÉE
          </h4>
          <p className="text-neutral-500 text-xs font-semibold max-w-md leading-relaxed">
            Le Copilote IA est réservé aux membres du plan Capten. Passe au plan supérieur pour obtenir ton briefing personnalisé quotidien, planifier tes séances et générer tes messages sur mesure !
          </p>
          <Link 
            href="/plan" 
            className="bg-[#FF5C00] text-white hover:bg-black font-mono font-bold tracking-widest text-[9.5px] px-6 py-3 rounded-control transition-all duration-200 uppercase"
          >
            🚀 Débloquer mon Copilote
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border-[0.5px] border-black/10 rounded-[20px] p-6 sm:p-8 space-y-6">
      
      {/* ────────────────────────────────────────────────── */}
      {/* PARTIE HAUTE : BRIEFING PROACTIF & ALERTES */}
      {/* ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5C00]/10 rounded-[12px] flex items-center justify-center text-[#FF5C00]">
            <Sparkles size={20} className="text-[#FF5C00]" />
          </div>
          <div className="text-left">
            <h2 className="text-[20px] font-display italic font-black uppercase text-black leading-none">
              🧑‍✈️ TON COPILOTE
            </h2>
            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">
              Ce que ton crew a besoin que tu voies aujourd'hui
            </p>
          </div>
        </div>

        {loadingProactive ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
            <p className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-widest animate-pulse">
              Le Copilote analyse le crew...
            </p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-[#FDFCF8] border border-black/5 rounded-[16px] p-6 text-center">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              🧑‍✈️ Tout roule. Reviens après ton prochain run.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Briefing text */}
            <div className="bg-[#FDFCF8] border border-[#FF5C00]/20 rounded-[16px] p-5 text-left">
              <h4 className="text-[14px] font-display italic font-black uppercase text-[#FF5C00] mb-2">
                💡 briefing du jour
              </h4>
              <p className="text-xs font-semibold text-neutral-700 leading-relaxed whitespace-pre-line">
                {briefing || headline}
              </p>
            </div>

            {/* Actionable alerts */}
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => {
                const action = getAlertAction(alert);
                return (
                  <div 
                    key={alert.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-black/5 bg-white rounded-[12px] hover:border-black/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-black/5 shrink-0">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                          {alert.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs font-black text-neutral-800 uppercase mt-0.5">
                          {alert.type === 'nouveau_runner' && `Nouveau : ${alert.payload?.runner_name}`}
                          {alert.type === 'regulier_decroche' && `Décrochage : ${alert.payload?.runner_name}`}
                          {alert.type === 'aucun_run_prevu' && "Aucune session planifiée cette semaine"}
                          {alert.type === 'baisse_frequentation' && `Turnout faible sur "${alert.payload?.run_title}"`}
                          {alert.type === 'cagnotte_inactive' && "Active ta cagnotte post-run"}
                          {alert.type === 'meteo_extreme' && `Météo pluvieuse : ${alert.payload?.run_title}`}
                          {alert.type === 'record_affluence' && "Record d'affluence battu !"}
                          {alert.type === 'belle_dynamique' && "Belle croissance de membres !"}
                          {alert.type === 'milestone_runs' && `Palier collectif franchi : ${alert.payload?.milestone} runs !`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      {alert.type === 'coureurs_non_rentres' ? (
                        <button
                          onClick={() => {
                            const missing = alert.payload?.missing_runners || [];
                            const relanceText = missing.map((r: any) => `Salut ${r.name.split(' ')[0]}, t'es bien rentré(e) ce soir ? On s'inquiète 🖤`).join('\n\n');
                            setAiResponse(relanceText);
                            setActiveAction('custom');
                          }}
                          className="bg-red-500 hover:bg-black text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-2 rounded-control flex items-center gap-1 transition-all cursor-pointer"
                        >
                          Contacter <ArrowRight size={10} />
                        </button>
                      ) : (
                        <Link 
                          href={action.href}
                          className="bg-black hover:bg-[#FF5C00] text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-2 rounded-control flex items-center gap-1 transition-all"
                        >
                          {action.label} <ArrowRight size={10} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="w-8 h-8 rounded-control border border-black/5 hover:border-red-500 hover:text-red-500 text-neutral-400 flex items-center justify-center transition-all cursor-pointer"
                        title="Marquer comme traité"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <hr className="border-black/5" />

      {/* ────────────────────────────────────────────────── */}
      {/* PARTIE BASSE : ACTIONS D'ASSISTANT GUIDÉES */}
      {/* ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#FF5C00]" />
          <h3 className="text-[14px] font-display italic font-black uppercase text-black leading-none">
            💬 DEMANDE À TON COPILOTE
          </h3>
        </div>

        {loadingChat ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest animate-pulse">
              Le Copilote rédige la réponse...
            </p>
          </div>
        ) : aiResponse ? (
          // RENDER RESULT BOX
          <div className="space-y-4">
            <div className="bg-[#FDFCF8] border border-[#FF5C00]/20 rounded-[16px] p-5 text-left relative">
              <span className="absolute top-3 right-3 text-[8px] font-mono font-bold text-neutral-400 uppercase">
                Réponse Copilote
              </span>
              <p className="text-xs font-semibold text-neutral-700 leading-relaxed whitespace-pre-wrap pt-2">
                {aiResponse}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-start">
              {/* Copy action */}
              {!limitExceeded && (
                <button
                  onClick={handleCopyToClipboard}
                  className="bg-black hover:bg-[#FF5C00] text-white text-[9.5px] font-black uppercase tracking-widest px-4 py-2.5 rounded-control flex items-center gap-1.5 transition-all select-none cursor-pointer"
                >
                  <Copy size={12} /> {copyFeedback ? 'COPIÉ !' : 'COPIER LE MESSAGE'}
                </button>
              )}

              {/* Regenerate action */}
              {!limitExceeded && (
                <button
                  onClick={() => handleGuidedSubmit()}
                  className="border border-black/10 hover:border-black text-black text-[9.5px] font-black uppercase tracking-widest px-4 py-2.5 rounded-control flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw size={12} /> Régénérer
                </button>
              )}

              {/* Close action */}
              <button
                onClick={resetChat}
                className="border border-black/5 text-neutral-400 hover:text-black hover:border-neutral-300 text-[9.5px] font-black uppercase tracking-widest px-4 py-2.5 rounded-control flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X size={12} /> Recommencer
              </button>
            </div>
          </div>
        ) : limitExceeded ? (
          // LIMIT EXCEEDED VIEW
          <div className="bg-[#FDFCF8] border border-black/5 rounded-[16px] p-6 text-center space-y-2">
            <span className="text-2xl">🌙</span>
            <p className="text-xs font-black text-neutral-800 uppercase tracking-wider">
              Tu as fait le tour pour aujourd'hui, ton Copilote revient demain !
            </p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Limite maximale de 20 demandes par jour atteinte.
            </p>
          </div>
        ) : activeAction ? (
          // RENDER ACTIVE ACTION FORM
          <form onSubmit={handleGuidedSubmit} className="space-y-4 bg-neutral-50/50 border border-black/5 rounded-[16px] p-5 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-black/5">
              <span className="text-[10px] font-black text-[#FF5C00] uppercase tracking-wider">
                {activeAction === 'rediger_message' && '✍️ Annonce / Rédiger un message'}
                {activeAction === 'gerer_situation' && '💬 Résoudre une situation'}
                {activeAction === 'motiver_crew' && '🎉 Motiver le crew'}
                {activeAction === 'mot_coureur' && '🙋 Écrire à un coureur'}
                {activeAction === 'custom' && '⚙️ Autre demande'}
              </span>
              <button 
                type="button" 
                onClick={resetChat}
                className="text-neutral-400 hover:text-black transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form Fields according to action type */}
            {activeAction === 'rediger_message' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-black">Contexte ou objet de l'annonce</label>
                <textarea
                  value={inputs.context}
                  onChange={(e) => setInputs(prev => ({ ...prev, context: e.target.value }))}
                  placeholder="Ex : Annoncer le run trail de ce soir à 19h30, avec un départ retardé de 15 minutes."
                  className="w-full bg-white border border-black/10 rounded-control px-3 py-2 text-[12px] font-sans font-semibold text-black focus:outline-none focus:border-[#FF5C00] h-20"
                  required
                />
              </div>
            )}

            {activeAction === 'gerer_situation' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-black">Décris la situation ou le conflit</label>
                <textarea
                  value={inputs.situation}
                  onChange={(e) => setInputs(prev => ({ ...prev, situation: e.target.value }))}
                  placeholder="Ex : Un coureur régulier refuse de signer la décharge obligatoire et crée des tensions."
                  className="w-full bg-white border border-black/10 rounded-control px-3 py-2 text-[12px] font-sans font-semibold text-black focus:outline-none focus:border-[#FF5C00] h-20"
                  required
                />
              </div>
            )}

            {activeAction === 'motiver_crew' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-black">Thème ou objectif de motivation</label>
                <textarea
                  value={inputs.goal}
                  onChange={(e) => setInputs(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="Ex : Motiver le crew à venir ce soir malgré la pluie battante."
                  className="w-full bg-white border border-black/10 rounded-control px-3 py-2 text-[12px] font-sans font-semibold text-black focus:outline-none focus:border-[#FF5C00] h-20"
                  required
                />
              </div>
            )}

            {activeAction === 'mot_coureur' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-black">Prénom du coureur</label>
                  <input
                    type="text"
                    value={inputs.runnerName}
                    onChange={(e) => setInputs(prev => ({ ...prev, runnerName: e.target.value }))}
                    placeholder="Ex : Julien"
                    className="w-full bg-white border border-black/10 rounded-control px-3 py-2 text-[12px] font-sans font-semibold text-black focus:outline-none focus:border-[#FF5C00]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-black">Contexte / Objectif</label>
                  <select
                    value={inputs.context}
                    onChange={(e) => setInputs(prev => ({ ...prev, context: e.target.value }))}
                    className="w-full bg-white border border-black/10 rounded-control px-3 py-2 text-[12px] font-sans font-semibold text-black focus:outline-none focus:border-[#FF5C00]"
                  >
                    <option value="Nouveau membre à accueillir chaleureusement">Accueillir un nouveau</option>
                    <option value="Coureur absent depuis plusieurs sessions à relancer">Relancer un absent</option>
                    <option value="Féliciter pour sa progression ou régularité">Célébrer sa progression</option>
                  </select>
                </div>
              </div>
            )}

            {activeAction === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-black">Que souhaites-tu demander ?</label>
                <textarea
                  value={inputs.customPrompt}
                  onChange={(e) => setInputs(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Ex : Rédige une annonce de partenariat avec le café du quartier pour offrir des cookies post-run."
                  className="w-full bg-white border border-black/10 rounded-control px-3 py-2 text-[12px] font-sans font-semibold text-black focus:outline-none focus:border-[#FF5C00] h-20"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="bg-[#FF5C00] hover:bg-black text-white text-[9.5px] font-black uppercase tracking-widest px-4 py-2.5 rounded-control transition-all w-full flex items-center justify-center gap-1 cursor-pointer"
            >
              ⚡ Demander au Copilote
            </button>
          </form>
        ) : (
          // RENDER GUIDED ACTIONS LIST BUTTONS
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <button
                onClick={() => setActiveAction('rediger_message')}
                className="p-3.5 border border-black/5 bg-neutral-50 hover:bg-white hover:border-[#FF5C00]/30 rounded-[12px] transition-all flex items-center gap-3 cursor-pointer text-xs font-black uppercase tracking-wider text-neutral-800"
              >
                <span className="text-base shrink-0">✍️</span> Rédiger un message
              </button>
              <button
                onClick={() => setActiveAction('gerer_situation')}
                className="p-3.5 border border-black/5 bg-neutral-50 hover:bg-white hover:border-[#FF5C00]/30 rounded-[12px] transition-all flex items-center gap-3 cursor-pointer text-xs font-black uppercase tracking-wider text-neutral-800"
              >
                <span className="text-base shrink-0">💬</span> Gérer une situation
              </button>
              <button
                onClick={() => setActiveAction('motiver_crew')}
                className="p-3.5 border border-black/5 bg-neutral-50 hover:bg-white hover:border-[#FF5C00]/30 rounded-[12px] transition-all flex items-center gap-3 cursor-pointer text-xs font-black uppercase tracking-wider text-neutral-800"
              >
                <span className="text-base shrink-0">🎉</span> Motiver le crew
              </button>
              <button
                onClick={() => setActiveAction('mot_coureur')}
                className="p-3.5 border border-black/5 bg-neutral-50 hover:bg-white hover:border-[#FF5C00]/30 rounded-[12px] transition-all flex items-center gap-3 cursor-pointer text-xs font-black uppercase tracking-wider text-neutral-800"
              >
                <span className="text-base shrink-0">🙋</span> Écrire à un coureur
              </button>
            </div>

            {/* Custom search free-text */}
            <div className="relative">
              <input
                type="text"
                value={inputs.customPrompt}
                onChange={(e) => setInputs(prev => ({ ...prev, customPrompt: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputs.customPrompt.trim().length > 0) {
                    setActiveAction('custom');
                    handleGuidedSubmit(undefined, 'custom', { ...inputs, customPrompt: inputs.customPrompt });
                  }
                }}
                placeholder="Autre demande (ex: Rédige une annonce de partenariat avec un café...)"
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-control px-4 py-3 pr-10 text-[11px] font-sans font-semibold text-black focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
              />
              <button 
                onClick={() => {
                  if (inputs.customPrompt.trim().length > 0) {
                    setActiveAction('custom');
                    handleGuidedSubmit(undefined, 'custom', { ...inputs, customPrompt: inputs.customPrompt });
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#FF5C00] transition-all cursor-pointer"
              >
                <ArrowRight size={14} />
              </button>
            </div>
            
            {/* Visuel Quota counter */}
            <div className="flex justify-between items-center px-1 mt-1 text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              <span>Assistant Copilote</span>
              <span>{Math.max(0, 20 - chatCallsCount)} / 20 requêtes restantes aujourd'hui</span>
            </div>
          </div>
        )}

        {chatError && (
          <div className="bg-red-50 border border-red-100 rounded-[12px] p-3 text-center flex items-center gap-2 justify-center">
            <Info size={12} className="text-red-500" />
            <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">{chatError}</p>
          </div>
        )}
      </div>

    </section>
  );
}
