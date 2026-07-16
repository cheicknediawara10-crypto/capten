'use client';

import React, { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CopilotBubble() {
  const { club } = useAuth();
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    if (club?.stripe_plan === 'GRATUIT') {
      setAlertsCount(0);
      return;
    }

    async function fetchAlertsCount() {
      try {
        const res = await fetch('/api/copilot');
        if (res.ok) {
          const data = await res.json();
          setAlertsCount(data.alerts?.length || 0);
        }
      } catch (err) {
        console.error('Error fetching alerts count for bubble:', err);
      }
    }

    fetchAlertsCount();

    // Écouter un rafraîchissement global des alertes
    const handleRefresh = () => fetchAlertsCount();
    window.addEventListener('refresh-copilot-alerts', handleRefresh);
    return () => window.removeEventListener('refresh-copilot-alerts', handleRefresh);
  }, [club?.stripe_plan]);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('toggle-copilot-drawer'));
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-[200] w-14 h-14 bg-[#0A0A0A] hover:bg-[#FF5C00] text-white rounded-full flex items-center justify-center shadow-xl border border-white/10 hover:border-transparent transition-all duration-300 hover:scale-105 active:scale-95 group"
      aria-label="Contacter le Copilote"
    >
      <Bot size={24} className="group-hover:rotate-12 transition-transform duration-300" />
      
      {alertsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#FF5C00] text-white font-mono font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0E0E0E] animate-fade-in shadow-md">
          {alertsCount}
        </span>
      )}
    </button>
  );
}
