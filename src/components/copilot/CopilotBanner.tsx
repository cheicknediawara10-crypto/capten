'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CopilotBanner() {
  const { club } = useAuth();
  const [hookData, setHookData] = useState<{ situation: string; actionLabel: string } | null>(null);
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
          const hookAlert = data.hookAlert || '';
          
          if (hookAlert && hookAlert.trim() !== '' && hookAlert !== 'RIEN') {
            const parts = hookAlert.split('→');
            const situation = parts[0]?.trim() || '';
            const actionLabel = parts[1]?.trim() || "Ouvrir l'assistant";
            
            setHookData({
              situation,
              actionLabel
            });
          } else {
            setHookData(null);
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

  if (loading || !hookData) return null;

  const handleActionClick = () => {
    // Émettre l'événement global pour ouvrir le tiroir avec l'action pré-remplie
    window.dispatchEvent(
      new CustomEvent('open-copilot', {
        detail: {
          actionType: 'custom',
          inputs: {
            customPrompt: hookData.actionLabel
          }
        }
      })
    );
  };

  return (
    <div className="w-full bg-[#0A0A0A] text-white border-y border-black/10 py-3.5 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <div className="shrink-0">
          <Sparkles size={14} className="text-[#FF5C00]" />
        </div>
        <p className="text-xs font-semibold tracking-tight text-neutral-300">
          {hookData.situation}
        </p>
      </div>

      <button
        onClick={handleActionClick}
        className="self-start sm:self-auto bg-[#FF5C00] hover:bg-white text-white hover:text-black px-3.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
      >
        {hookData.actionLabel} <ArrowRight size={10} strokeWidth={2.5} />
      </button>
    </div>
  );
}
