'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Store, MapPin, Coffee, Users, Calendar, Clock, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/supabase';
import { Spot } from '@/lib/spots';

const DAYS_TRANSLATION: Record<string, string> = {
  mon: 'Lundi', tue: 'Mardi', wed: 'Mercredi', thu: 'Jeudi', fri: 'Vendredi', sat: 'Samedi', sun: 'Dimanche'
};

const TIMES_TRANSLATION: Record<string, string> = {
  morning: 'Matin (Café/Petit-dej)', lunch: 'Midi (Déjeuner)', afternoon: 'Après-midi (Goûter)', evening: 'Soir (Apéro)'
};

export default function SpotDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { club } = useAuth();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulaire de proposition
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00');
  const [estimatedRunners, setEstimatedRunners] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);
  const [showIbanModal, setShowIbanModal] = useState(false);

  useEffect(() => {
    async function loadSpot() {
      try {
        const res = await fetch(`/api/spots/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSpot(data);
        }
      } catch (err) {
        console.error('Failed to load spot:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadSpot();
    }
  }, [id]);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate || !eventTime) return;

    if (!club?.stripe_connect_id) {
      setShowIbanModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/spot-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spot_id: id,
          event_date: eventDate,
          event_time: eventTime + ':00',
          estimated_runners: estimatedRunners
        })
      });

      if (res.ok) {
        setProposalSuccess(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la proposition.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mt-4">Chargement du commerce...</p>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="linear-card text-center py-16 space-y-4">
        <p className="text-xs font-mono font-bold text-neutral-500 uppercase">Commerce introuvable.</p>
        <button onClick={() => router.back()} className="text-xs font-mono font-bold text-[#FF5C00] uppercase hover:underline">
          Retour à l'explorateur
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 page-transition">
      {/* Back CTA */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-[10px] font-mono font-bold text-[#A3A3A3] hover:text-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft size={14} /> Retour à l'explorateur
        </button>
      </div>

      {/* Grid: Details vs Proposition */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Spot Details */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-black/10 rounded-[12px] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-black/5 pb-4 flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-display italic font-black uppercase text-black leading-none">
                {spot.name}
              </h2>
              <p className="text-xs font-sans text-neutral-400 font-semibold flex items-center gap-1">
                <MapPin size={13} /> {spot.address} ({spot.neighborhood})
              </p>
            </div>
            <span className="text-xl font-mono font-black text-black">
              {formatPrice(spot.offer_price_cents)}
            </span>
          </div>

          {/* Offre */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">Offre unique proposée</span>
            <div className="p-4 bg-[#FDFCF8] border border-black/10 rounded-lg flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FF5C00]/10 border border-[#FF5C00]/25 rounded-md flex items-center justify-center text-[#FF5C00] shrink-0 mt-0.5">
                <Coffee size={16} />
              </div>
              <div>
                <p className="text-xs font-sans font-bold text-neutral-800">{spot.offer_description}</p>
                <span className="text-[10px] font-sans text-neutral-400 mt-1 block">Remboursement garanti en cas d'annulation J-2.</span>
              </div>
            </div>
          </div>

          {/* Disponibilités */}
          <div className="space-y-3">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">Disponibilités d'accueil</span>
            <div className="border border-black/10 rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 bg-[#F4F5F7] border-b border-black/10 text-[9px] font-mono font-bold uppercase text-neutral-500 p-2">
                <div>Jour</div>
                <div>Créneaux</div>
              </div>
              {Object.entries(spot.availability).map(([day, slots]) => (
                <div key={day} className="grid grid-cols-2 border-b border-black/5 p-2 text-xs font-sans font-semibold text-neutral-700">
                  <div className="font-mono text-[10px] uppercase">{DAYS_TRANSLATION[day] || day}</div>
                  <div className="flex flex-wrap gap-1">
                    {slots.map(s => (
                      <span key={s} className="bg-[#FF5C00]/10 text-[#FF5C00] text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                        {s === 'morning' ? 'Matin' : s === 'lunch' ? 'Midi' : s === 'afternoon' ? 'Goûter' : 'Soir'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capacité */}
          <div className="flex items-center gap-3 border-t border-black/5 pt-5 text-xs font-mono font-bold uppercase text-neutral-500">
            <Users size={16} className="text-[#FF5C00]" />
            <span>Capacité d'accueil maximale : {spot.capacity} coureurs</span>
          </div>
        </div>

        {/* Proposition Box */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-black p-6 sm:p-8 rounded-[12px] shadow-sm flex flex-col justify-between">
          {proposalSuccess ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-500 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-display italic font-black uppercase text-black">Proposition envoyée !</h3>
                <p className="text-xs font-sans text-neutral-600 leading-relaxed">
                  Le commerce va recevoir un e-mail avec deux liens rapides pour accepter ou refuser votre proposition de run. 
                  Vous recevrez un e-mail dès qu'il aura répondu.
                </p>
              </div>
              <button
                onClick={() => router.push('/spots/events')}
                className="w-full h-11 bg-black hover:bg-[#FF5C00] text-white font-mono font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center justify-center"
              >
                Suivre l'événement
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-black/5 pb-4">
                <h3 className="text-lg font-display italic font-black uppercase text-black flex items-center gap-2">
                  <Calendar size={18} className="text-[#FF5C00]" /> Proposer un Run
                </h3>
                <p className="text-xs font-sans text-neutral-500 mt-1">Saisissez la date et l'heure de votre sortie.</p>
              </div>

              <form onSubmit={handlePropose} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">📅 Date du Run</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">⏰ Heure d'arrivée estimée</label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">🏃‍♂️ Estimation de coureurs</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="5"
                      max={spot.capacity}
                      value={estimatedRunners}
                      onChange={(e) => setEstimatedRunners(parseInt(e.target.value, 10))}
                      className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                    />
                    <span className="absolute right-3.5 top-2.5 text-[10px] font-mono text-neutral-400">COUREURS</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !eventDate || !eventTime}
                  className="w-full h-12 bg-[#FF5C00] hover:bg-black disabled:bg-neutral-400 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2 mt-6"
                >
                  {isSubmitting ? 'Envoi...' : 'Envoyer la proposition'} <Send size={12} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Filtre IBAN */}
      {showIbanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FDFCF8] border-2 border-black max-w-md w-full mx-4 p-8 rounded-none relative space-y-6">
            <button
              onClick={() => setShowIbanModal(false)}
              className="absolute top-4 right-4 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-black"
            >
              Fermer ×
            </button>

            <div className="space-y-2 text-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF5C00] block">
                Stripe Connect requis
              </span>
              <h2 className="text-2xl font-display italic font-black uppercase text-black leading-tight tracking-tight">
                Avant de réserver ton premier spot
              </h2>
            </div>

            <p className="text-xs font-sans text-neutral-600 leading-relaxed text-center">
              Ton club touche <strong>10 % de commission</strong> sur chaque coureur présent.<br />
              Pour recevoir cette cagnotte, configure ton compte d'encaissement.
            </p>

            <div className="bg-white border border-black/5 p-4 text-center">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                ⚡️ Stripe Connect — 2 min, IBAN requis
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="/api/club/onboarding"
                className="w-full bg-[#FF5C00] text-white py-3.5 text-[11px] font-mono font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 text-center block"
              >
                Configurer mon compte
              </a>
              
              <button
                onClick={() => setShowIbanModal(false)}
                className="w-full bg-transparent text-neutral-400 py-2 text-[9px] font-mono font-bold uppercase tracking-widest hover:text-black transition-all text-center block"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
