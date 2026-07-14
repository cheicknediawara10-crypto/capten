'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, MapPin, Coffee, Link, Share2, Clipboard, ChevronRight, Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { formatPrice } from '@/lib/supabase';
import { SpotEvent } from '@/lib/spots';

export default function MySpotEventsPage() {
  const { club } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  // Charger les événements
  async function loadEvents() {
    try {
      setLoading(true);
      const res = await fetch('/api/spot-events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCopyLink = (slug: string, eventId: string) => {
    const siteUrl = window.location.origin;
    const url = `${siteUrl}/spots/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedEventId(eventId);
    setTimeout(() => setCopiedEventId(null), 2000);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'bg-amber-50 border-amber-200 text-amber-600';
      case 'on_sale':
        return 'bg-emerald-50 border-emerald-200 text-emerald-600';
      case 'completed':
        return 'bg-neutral-100 border-neutral-300 text-neutral-600';
      case 'declined':
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-600';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'proposed': return 'Proposition Envoyée';
      case 'on_sale': return 'En Vente / Actif';
      case 'completed': return 'Terminé';
      case 'declined': return 'Proposition Déclinée';
      case 'cancelled': return 'Annulé';
      case 'expired': return 'Lien Expiré';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 pb-20 page-transition">
      {/* Header */}
      <header className="flex flex-col gap-1.5 pb-6 border-b-[0.5px] border-black/10 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
              MES ÉVÉNEMENTS SPOTS
            </h1>
            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">
              Suivi des réservations et des ventes
            </p>
          </div>
          
          <button
            onClick={loadEvents}
            className="p-2 border border-black/10 hover:border-black/30 rounded-md transition-all text-neutral-500 hover:text-black text-[10px] font-mono font-bold uppercase"
          >
            Rafraîchir
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="animate-spin text-[#FF5C00] mx-auto" size={24} />
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mt-4">Chargement des événements...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="linear-card text-center py-16 space-y-4">
          <Calendar size={36} className="text-neutral-300 mx-auto" />
          <p className="text-xs font-mono font-bold text-neutral-500 uppercase">Aucun événement planifié pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map(event => {
            const spot = event.spot;
            const price = event.offer_price_cents;
            const isCopied = copiedEventId === event.id;
            const shareUrl = `${window.location.origin}/spots/${event.public_slug}`;
            const whatsappText = encodeURIComponent(`Inscris-toi à notre prochain run de social club ! On finit chez ${spot?.name} avec la formule prépayée : ${shareUrl}`);

            return (
              <div
                key={event.id}
                className="linear-card bg-white border border-black/10 rounded-[12px] p-6 sm:p-8 space-y-6 shadow-sm"
              >
                {/* Header card info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                      Chez {spot?.name || 'Commerce'}
                    </span>
                    <h3 className="text-xl font-display italic font-black uppercase text-black leading-none">
                      {new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                  </div>

                  <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-3 py-1.5 border rounded-full ${getStatusStyle(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-6 space-y-2 text-xs font-semibold text-neutral-700">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-neutral-400" />
                      <span>Arrivée prévue à {event.event_time.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-neutral-400" />
                      <span>{spot?.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coffee size={14} className="text-[#FF5C00]" />
                      <span>Offre : {spot?.offer_description} ({formatPrice(price)})</span>
                    </div>
                  </div>

                  {/* Progress seats bar */}
                  <div className="md:col-span-6 space-y-2 border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-6">
                    <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-neutral-500">
                      <span>Places réservées / quota</span>
                      <span>{event.status === 'completed' ? `${event.checkin_count || 0} présents` : `${event.checkin_count || 0} / ${event.quota}`}</span>
                    </div>
                    
                    <div className="w-full bg-[#F4F5F7] h-2.5 rounded-full overflow-hidden border border-black/5">
                      <div
                        className="bg-[#FF5C00] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((event.checkin_count || 0) / event.quota) * 100)}%` }}
                      ></div>
                    </div>

                    <p className="text-[9px] font-sans text-neutral-400 mt-1">
                      {event.status === 'proposed' && "En attente de confirmation par le commerce."}
                      {event.status === 'on_sale' && "Les réservations sont ouvertes à vos coureurs."}
                      {event.status === 'completed' && "Sortie terminée. Gains crédités dans votre cagnotte."}
                    </p>
                  </div>
                </div>

                {/* Actions bottom bar */}
                {event.status === 'on_sale' && (
                  <div className="bg-[#FDFCF8] border border-black/10 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-left w-full sm:w-auto">
                      <span className="text-[9px] font-mono font-bold uppercase text-neutral-400">Lien public de vente</span>
                      <p className="text-xs font-mono font-bold text-neutral-700 truncate max-w-xs sm:max-w-md mt-0.5">{shareUrl}</p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleCopyLink(event.public_slug, event.id)}
                        className="h-9 px-4 border border-black text-black font-mono font-bold text-[10px] uppercase tracking-wider rounded bg-white hover:bg-black hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Clipboard size={12} /> {isCopied ? 'Copié !' : 'Copier'}
                      </button>
                      
                      <a
                        href={`https://api.whatsapp.com/send?text=${whatsappText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-9 px-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded transition-all flex items-center gap-1.5"
                      >
                        <Share2 size={12} /> Partager WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
