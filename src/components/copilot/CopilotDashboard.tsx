'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Check, Lock, AlertCircle, Calendar, 
  ArrowRight, Megaphone, UserPlus, HeartHandshake, Trophy 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AlertItem {
  id: string;
  type: string;
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  payload: any;
}

export default function CopilotDashboard() {
  const { club, isMock } = useAuth();
  const [headline, setHeadline] = useState('Analyse en cours...');
  const [briefing, setBriefing] = useState('');
  const [mood, setMood] = useState('neutre');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const isFreePlan = club?.stripe_plan === 'GRATUIT';

  const fetchCopilotData = async () => {
    setLoading(true);
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
        }
      }
    } catch (err) {
      console.error('Error fetching copilot data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCopilotData();
  }, [club?.stripe_plan]);

  const handleDismissAlert = async (alertId: string) => {
    // Supprimer localement pour la réactivité instantanée
    setAlerts(prev => prev.filter(a => a.id !== alertId));

    if (isMock) {
      return;
    }

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

  const getAlertIcon = (type: string) => {
    switch (type) {
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

  // Si plan gratuit, afficher l'état verrouillé
  if (isFreePlan || isLocked) {
    return (
      <section className="bg-white border-[0.5px] border-black/10 rounded-[20px] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5C00]/10 rounded-[12px] flex items-center justify-center text-[#FF5C00]">
            <Sparkles size={20} className="text-[#FF5C00]" />
          </div>
          <div>
            <h2 className="text-[20px] font-display italic font-black uppercase text-black leading-none">
              🧑‍✈️ TON COPILOTE IA
            </h2>
            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">
              Ce que ton crew a besoin que tu voies aujourd'hui
            </p>
          </div>
        </div>

        <div className="relative rounded-[16px] overflow-hidden bg-neutral-550 border-[0.5px] border-black/15 p-6 sm:p-8 flex flex-col items-center text-center space-y-4 shadow-sm bg-neutral-50">
          <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-black mb-2 border border-black/5">
            <Lock size={18} className="text-black" />
          </div>
          <h4 className="text-[18px] font-display italic font-black uppercase tracking-tight text-black leading-none">
            COPILOTE IA VERROUILLÉE
          </h4>
          <p className="text-neutral-500 text-xs font-semibold max-w-md leading-relaxed">
            Le Copilote IA est réservé aux membres du plan Capten. Passe au plan supérieur pour obtenir ton briefing personnalisé quotidien et planifier tes séances !
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5C00]/10 rounded-[12px] flex items-center justify-center text-[#FF5C00]">
            <Sparkles size={20} className="text-[#FF5C00]" />
          </div>
          <div>
            <h2 className="text-[20px] font-display italic font-black uppercase text-black leading-none">
              🧑‍✈️ TON COPILOTE
            </h2>
            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">
              Ce que ton crew a besoin que tu voies aujourd'hui
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest animate-pulse">
            Le Copilote analyse le crew...
          </p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-[#FDFCF8] border border-black/5 rounded-[16px] p-8 text-center">
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
                  className="flex items-center justify-between gap-4 p-4 border border-black/5 bg-white rounded-[12px] hover:border-black/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-black/5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
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
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      href={action.href}
                      className="bg-black hover:bg-[#FF5C00] text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-2 rounded-control flex items-center gap-1 transition-all"
                    >
                      {action.label} <ArrowRight size={10} />
                    </Link>
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
    </section>
  );
}
