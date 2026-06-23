'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Flame, RotateCcw } from 'lucide-react';

interface UndoToastProps {
  runId: string;
  runTitle: string;
  onClose: () => void;
  onCancelBroadcast: (runId: string) => Promise<void>;
}

export default function UndoToast({ runId, runTitle, onClose, onCancelBroadcast }: UndoToastProps) {
  // 10 minutes = 600 seconds
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onClose]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}m ${remainingSecs.toString().padStart(2, '0')}s`;
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancelBroadcast(runId);
      setIsCancelled(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Calcul du pourcentage d'avancement pour la barre de progression
  const progressPercent = (secondsLeft / 600) * 100;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-full max-w-[420px] px-4 animate-scale-up">
      <div className="bg-black/95 backdrop-blur-md border-[0.5px] border-white/10 rounded-[16px] p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#A3A3A3]">
              FILE D'ATTENTE WHATSAPP
            </span>
          </div>
          {!isCancelled && (
            <button onClick={onClose} className="text-[#A3A3A3] hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        {isCancelled ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <RotateCcw size={16} />
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide">ENVOI ANNULÉ !</p>
              <p className="text-[9px] font-bold text-[#A3A3A3] uppercase">
                La campagne pour "{runTitle}" a été retirée de la file.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-bold text-white uppercase leading-snug">
                  Publication de "{runTitle.toUpperCase()}"
                </p>
                <p className="text-[10px] font-medium text-[#A3A3A3] flex items-center gap-1.5 mt-0.5">
                  <Clock size={12} className="text-[#FF5C00]" />
                  Diffusion différée dans <span className="font-bold text-white tabular-nums">{formatTime(secondsLeft)}</span>
                </p>
              </div>

              <button 
                onClick={handleCancel}
                disabled={isCancelling}
                className="py-1.5 px-3 bg-[#FF5C00] text-white hover:bg-white hover:text-black rounded-[8px] text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0"
              >
                {isCancelling ? 'ANNULATION...' : 'ANNULER L\'ENVOI'}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF5C00] to-[#FF8C39] transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
