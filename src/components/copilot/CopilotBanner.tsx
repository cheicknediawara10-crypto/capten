'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, UserPlus, HeartHandshake, Calendar, AlertCircle, Megaphone, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AlertItem {
  id: string;
  type: string;
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  payload: any;
}

export default function CopilotBanner() {
  const { club, isMock } = useAuth();
  const [alert, setAlert] = useState<AlertItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si c'est le plan gratuit, le copilote est bloqué, on ne montre pas la bannière
    if (club?.stripe_plan === 'GRATUIT') {
      setLoading(false);
      return;
    }

    async function fetchAlerts() {
      try {
        const res = await fetch('/api/copilot');
        if (res.ok) {
          const data = await res.json();
          const activeAlerts: AlertItem[] = data.alerts || [];
          
          if (activeAlerts.length > 0) {
            // Trier les alertes par priorité : CRITIQUE > HAUTE > MOYENNE > BASSE
            const priorityOrder = { CRITIQUE: 4, HAUTE: 3, MOYENNE: 2, BASSE: 1 };
            const sorted = [...activeAlerts].sort((a, b) => {
              return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            });
            setAlert(sorted[0]);
          } else {
            setAlert(null);
          }
        }
      } catch (err) {
        console.error('Error fetching alerts for banner:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();

    // Écouter un événement personnalisé pour recharger la bannière quand une alerte est traitée
    const handleRefresh = () => fetchAlerts();
    window.addEventListener('refresh-copilot-alerts', handleRefresh);
    return () => window.removeEventListener('refresh-copilot-alerts', handleRefresh);
  }, [club?.stripe_plan]);

  if (loading || !alert) return null;

  // Configuration visuelle et comportementale selon le type d'alerte
  const getAlertConfig = (type: string, payload: any) => {
    switch (type) {
      case 'coureurs_non_rentres':
        const missingCount = payload?.missing_count || 1;
        return {
          icon: <AlertTriangle size={14} className="text-red-500 animate-pulse" />,
          text: `${missingCount} coureur${missingCount > 1 ? 's ne sont' : ' n\'est'} pas rentré${missingCount > 1 ? 's' : ''} du dernier run.`,
          btnLabel: "Je leur écris",
          action: {
            actionType: 'custom',
            inputs: {
              customPrompt: `Rédige un message WhatsApp court pour prendre des nouvelles des coureurs non rentrés du dernier run : ${payload?.missing_names || 'les absents'}.`
            }
          }
        };

      case 'nouveau_runner':
        return {
          icon: <UserPlus size={14} className="text-[#FF5C00]" />,
          text: `Un nouveau membre (${payload?.runner_name || 'Runner'}) a rejoint le crew !`,
          btnLabel: "Lui souhaiter la bienvenue",
          action: {
            actionType: 'mot_coureur',
            inputs: {
              runnerName: payload?.runner_name || '',
              context: 'Nouveau membre à accueillir chaleureusement'
            }
          }
        };

      case 'regulier_decroche':
        return {
          icon: <HeartHandshake size={14} className="text-[#FF5C00]" />,
          text: `${payload?.runner_name || 'Un régulier'} a manqué les 3 derniers runs.`,
          btnLabel: "Prendre des nouvelles",
          action: {
            actionType: 'mot_coureur',
            inputs: {
              runnerName: payload?.runner_name || '',
              context: 'Coureur absent depuis plusieurs sessions à relancer'
            }
          }
        };

      case 'aucun_run_prevu':
        return {
          icon: <Calendar size={14} className="text-[#FF5C00]" />,
          text: "Aucun run social n'est planifié pour la semaine prochaine.",
          btnLabel: "Planifier un run",
          action: {
            actionType: 'rediger_message',
            inputs: {
              context: "Planifier et motiver le crew pour le prochain run hebdomadaire"
            }
          }
        };

      case 'baisse_frequentation':
        return {
          icon: <AlertCircle size={14} className="text-[#FF5C00]" />,
          text: `Inscriptions faibles pour le run "${payload?.run_title || 'Hebdo'}".`,
          btnLabel: "Motiver le crew",
          action: {
            actionType: 'motiver_crew',
            inputs: {
              goal: `Motiver les coureurs à s'inscrire au prochain run "${payload?.run_title || 'Hebdo'}"`
            }
          }
        };

      case 'meteo_extreme':
        return {
          icon: <AlertCircle size={14} className="text-[#FF5C00]" />,
          text: `Pluie battante ou orages prévus pour le run "${payload?.run_title || 'Hebdo'}".`,
          btnLabel: "Ajuster l'équipement",
          action: {
            actionType: 'rediger_message',
            inputs: {
              context: `Prévenir le crew de la météo pluvieuse pour le run "${payload?.run_title || 'Hebdo'}", rappeler de prendre un k-way ou veste thermique.`
            }
          }
        };

      case 'cagnotte_inactive':
        return {
          icon: <Megaphone size={14} className="text-amber-500" />,
          text: "Ta cagnotte post-run n'est pas encore configurée.",
          btnLabel: "Activer la cagnotte",
          action: {
            actionType: 'custom',
            inputs: {
              customPrompt: "Explique-moi comment marche la cagnotte post-run et comment ajouter mon lien de cagnotte Lydia ou Stripe."
            }
          }
        };

      case 'record_affluence':
        return {
          icon: <Trophy size={14} className="text-yellow-500" />,
          text: `Record d'affluence battu sur "${payload?.run_title || 'le run'}" (${payload?.count || 0} coureurs) !`,
          btnLabel: "Célébrer la victoire",
          action: {
            actionType: 'motiver_crew',
            inputs: {
              goal: `Féliciter le crew pour avoir battu le record absolu d'affluence avec ${payload?.count || 0} coureurs sur le dernier run`
            }
          }
        };

      case 'milestone_runs':
        return {
          icon: <Trophy size={14} className="text-yellow-500" />,
          text: `Le crew a franchi le cap historique de ${payload?.milestone || 0} runs collectifs !`,
          btnLabel: "Partager l'étape",
          action: {
            actionType: 'motiver_crew',
            inputs: {
              goal: `Célébrer le fait que le crew a franchi ensemble le cap des ${payload?.milestone || 0} runs terminés`
            }
          }
        };

      default:
        return {
          icon: <Sparkles size={14} className="text-[#FF5C00]" />,
          text: "Ton Copilote a détecté un événement marquant dans le crew.",
          btnLabel: "Ouvrir l'assistant",
          action: {
            actionType: 'custom',
            inputs: {
              customPrompt: "Quelles sont les dernières nouvelles du crew aujourd'hui ?"
            }
          }
        };
    }
  };

  const config = getAlertConfig(alert.type, alert.payload);

  const handleActionClick = () => {
    // Émettre l'événement global pour ouvrir le tiroir avec l'action pré-remplie
    window.dispatchEvent(
      new CustomEvent('open-copilot', {
        detail: {
          actionType: config.action.actionType,
          inputs: config.action.inputs,
          alertId: alert.id // on passe l'ID pour le marquer traité
        }
      })
    );
  };

  return (
    <div className="w-full bg-[#0A0A0A] text-white border-y border-black/10 py-3.5 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <div className="shrink-0">{config.icon}</div>
        <p className="text-xs font-semibold tracking-tight text-neutral-300">
          {config.text}
        </p>
      </div>

      <button
        onClick={handleActionClick}
        className="self-start sm:self-auto bg-[#FF5C00] hover:bg-white text-white hover:text-black px-3.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
      >
        {config.btnLabel} <ArrowRight size={10} strokeWidth={2.5} />
      </button>
    </div>
  );
}
