'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Calendar, Clock, MapPin, Coffee, AlertCircle, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/supabase';

interface TicketData {
  id: string;
  runner_name: string;
  runner_email: string;
  amount_cents: number;
  qr_token: string;
  status: 'paid' | 'redeemed' | 'refunded';
  redeemed_at: string | null;
  created_at: string;
  spot_events?: {
    event_date: string;
    event_time: string;
    spot?: {
      name: string;
      address: string;
      offer_description: string;
    };
    club?: {
      whatsapp_display_name: string;
    };
  };
}

export default function RunnerTicketPage() {
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les détails du ticket
  async function fetchTicket() {
    try {
      setLoading(true);
      // On fetch le ticket en passant son id.
      // Puisqu'on est en mode public, si Supabase n'est pas dispo, on renvoie du mock.
      const res = await fetch(`/api/spot-tickets?id=${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Impossible de charger le billet');
      }
      const data = await res.json();
      setTicket(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center text-black">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">Chargement de votre billet...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 text-black">
        <div className="max-w-[440px] w-full bg-white border border-red-200 p-8 text-center space-y-6 rounded-[12px] shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <AlertCircle size={24} />
          </div>
          <h1 className="text-xl font-display italic font-black uppercase tracking-tight">Billet Introuvable</h1>
          <p className="text-xs font-sans text-neutral-600 leading-relaxed">
            {error || 'Ce billet n\'existe pas ou a été annulé.'}
          </p>
        </div>
      </div>
    );
  }

  const event = ticket.spot_events;
  const spot = event?.spot;
  const clubName = event?.club?.whatsapp_display_name || 'Capten';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticket.qr_token}`;

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-between text-black">
      {/* Header */}
      <header className="border-b border-black/10 py-5 px-6 bg-white flex justify-between items-center">
        <span className="font-display italic font-black uppercase text-lg tracking-tighter text-[#FF5C00]">
          CAPTEN <span className="text-black">SPOTS</span>
        </span>
        <button
          onClick={fetchTicket}
          className="p-2 border border-black/10 hover:border-black/30 rounded-md transition-all text-neutral-500 hover:text-black flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase"
        >
          <RefreshCw size={12} /> Rafraîchir
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-[440px] w-full bg-white border border-black rounded-[12px] shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 text-center">
          
          {/* Status Badge */}
          {ticket.status === 'redeemed' ? (
            <div className="bg-neutral-100 border border-neutral-300 text-neutral-700 text-[10px] font-mono font-black uppercase tracking-wider py-1.5 px-3 rounded-full inline-block">
              ✓ Billet Utilisé le {new Date(ticket.redeemed_at!).toLocaleString('fr-FR')}
            </div>
          ) : ticket.status === 'refunded' ? (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-mono font-black uppercase tracking-wider py-1.5 px-3 rounded-full inline-block">
              ⚠️ Billet Remboursé
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-600 text-[10px] font-mono font-black uppercase tracking-wider py-1.5 px-3 rounded-full inline-block">
              ● Billet Actif & Prépayé
            </div>
          )}

          {/* QR */}
          <div className={`p-4 bg-white border rounded-[8px] max-w-[260px] mx-auto space-y-3 ${ticket.status === 'redeemed' ? 'opacity-30' : ''}`}>
            <img src={qrUrl} width={200} height={200} className="mx-auto" alt="Billet QR Code" />
            <div className="font-mono text-[11px] font-bold text-neutral-800">
              {ticket.runner_name}
            </div>
          </div>

          {/* Offer details */}
          <div className="border-t border-black/5 pt-5 text-left space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">Votre Club</span>
              <h4 className="text-sm font-sans font-bold text-black">{clubName}</h4>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">Offre Prépayée</span>
              <h4 className="text-sm font-sans font-bold text-[#FF5C00] flex items-center gap-1.5">
                <Coffee size={15} /> {spot?.offer_description}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-black/5 pt-4 text-xs font-semibold text-neutral-700">
              <div className="space-y-1 flex flex-col">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">📅 Date</span>
                <span>{event ? new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
              </div>
              <div className="space-y-1 flex flex-col">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">⏰ Heure</span>
                <span>{event?.event_time?.slice(0, 5)}</span>
              </div>
            </div>

            <div className="space-y-1 border-t border-black/5 pt-4">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">📍 Établissement</span>
              <p className="text-xs font-semibold text-neutral-700">{spot?.name}</p>
              <p className="text-[10px] font-sans text-neutral-500">{spot?.address}</p>
            </div>
          </div>

          <div className="border-t border-black/5 pt-4 text-center text-[9px] font-mono text-neutral-400 uppercase tracking-wider">
            Montant payé : {formatPrice(ticket.amount_cents)} · ID : {ticket.id.slice(0, 8)}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-black/5 py-4 text-center text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider">
        © {new Date().getFullYear()} CAPTEN SPOTS
      </footer>
    </div>
  );
}
