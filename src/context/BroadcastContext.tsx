'use client';

import React, { createContext, useContext, useState } from 'react';

interface BroadcastContextType {
  triggerUndoToast: (runId: string, runTitle: string) => void;
}

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

export function BroadcastProvider({ children }: { children: React.ReactNode }) {
  const [undoRun, setUndoRun] = useState<{ id: string; title: string } | null>(null);

  const triggerUndoToast = (id: string, title: string) => {
    setUndoRun({ id, title });
  };

  const handleCancelBroadcast = async (runId: string) => {
    try {
      const res = await fetch('/api/broadcast/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_id: runId }),
      });
      if (!res.ok) {
        console.error("Échec de l'annulation du broadcast");
      }
    } catch (err) {
      console.error("Erreur lors de l'annulation du broadcast:", err);
    }
  };

  return (
    <BroadcastContext.Provider value={{ triggerUndoToast }}>
      {children}
    </BroadcastContext.Provider>
  );
}

export function useBroadcast() {
  const context = useContext(BroadcastContext);
  if (!context) {
    throw new Error('useBroadcast must be used within a BroadcastProvider');
  }
  return context;
}
