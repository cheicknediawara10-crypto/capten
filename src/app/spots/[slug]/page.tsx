'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Coffee, ShieldCheck, Ticket, Users, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/supabase';

// Typage pour l'état local
interface EventData {
  id: string;
  quota: number;
  offer_price_cents: number;
  public_slug: string;
  event_date: string;
  event_time: string;
  status: string;
  checkin_count: number;
  spot?: {
    name: string;
    address: string;
    offer_description: string;
    stripe_account_id: string | null;
  };
  club?: {
    whatsapp_display_name: string;
  };
}

export default function SpotSalePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [runnerName, setRunnerName] = useState('');
  const [runnerEmail, setRunnerEmail] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState<{ qr_token: string; id: string } | null>(null);

  // Charger les données de l'événement
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/spot-events?slug=${slug}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Impossible de charger l\'événement');
        }
        const data = await res.json();
        setEvent(data);

        // Récupérer le nombre de places réservées
        if (data.id) {
          // En mode simulation local, on met un nombre réaliste
          if (data.id.includes('mock')) {
            setTicketsSold(Math.floor(data.quota * 0.65));
          } else {
            // Requête vers les tickets
            const ticketsRes = await fetch(`/api/spot-events/${data.id}/tickets`);
            if (ticketsRes.ok) {
              const tickets = await ticketsRes.json();
              setTicketsSold(tickets.filter((t: any) => t.status === 'paid' || t.status === 'redeemed').length);
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runnerName || !runnerEmail) {
      alert('Veuillez remplir votre nom et email.');
      return;
    }
    setPaymentLoading(true);
    setButtonState('loading');

    try {
      // 1. Get or generate idempotency key
      let idempotencyKey = sessionStorage.getItem('payment_idempotency_key');
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        sessionStorage.setItem('payment_idempotency_key', idempotencyKey);
      }

      // 2. Appeler l'API de checkout avec idempotency header
      const res = await fetch(`/api/spot-events/${event?.id}/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          runner_name: runnerName,
          runner_email: runnerEmail
        })
      });

      const paymentData = await res.json();
      if (!res.ok) {
        throw new Error(paymentData.error || 'Erreur lors de l\'initialisation du paiement');
      }

      const clientSecret = paymentData.clientSecret;

      // 3. Vérifier si c'est un paiement de simulation (mode mock)
      if (clientSecret.startsWith('pi_mock_')) {
        // Simuler un webhook Stripe après 1s
        setTimeout(() => {
          setPurchaseSuccess(true);
          const simulatedToken = 'mock_qr_' + Math.random().toString(36).substring(2, 10);
          setPurchasedTicket({
            qr_token: simulatedToken,
            id: 'mock_ticket_' + Math.random().toString(36).substring(2, 10)
          });
          setTicketsSold(prev => prev + 1);
          setPaymentLoading(false);
          setButtonState('success');
        }, 1200);
      } else {
        // Mode Réel Stripe
        alert("Paiement par carte simulé en mode Test Stripe.");
        setPurchaseSuccess(true);
        setPurchasedTicket({
          qr_token: 'test_qr_' + Math.random().toString(36).substring(2, 10),
          id: 'test_ticket_' + Math.random().toString(36).substring(2, 10)
        });
        setTicketsSold(prev => prev + 1);
        setPaymentLoading(false);
        setButtonState('success');
      }
    } catch (err: any) {
      sessionStorage.removeItem('payment_idempotency_key');
      alert(err.message);
      setPaymentLoading(false);
      setButtonState('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center text-black">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">Chargement de la formule...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 text-black">
        <div className="max-w-[480px] w-full bg-white border border-red-200 p-8 text-center space-y-6 rounded-[12px] shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle size={24} />
          </div>
          <h1 className="text-xl font-display italic font-black uppercase tracking-tight">Formule Indisponible</h1>
          <p className="text-xs font-sans text-neutral-600 leading-relaxed">
            {error || 'L\'offre demandée est introuvable ou le lien a expiré.'}
          </p>
          <a href="/spots" className="inline-block text-xs font-mono font-bold text-[#FF5C00] uppercase hover:underline">
            Retour à l'accueil Spots
          </a>
        </div>
      </div>
    );
  }

  const spot = event.spot;
  const clubName = event.club?.whatsapp_display_name || 'Le Club';
  const price = event.offer_price_cents;
  const placesLeft = Math.max(0, event.quota - ticketsSold);
  const progressPercent = Math.min(100, (ticketsSold / event.quota) * 100);

  if (purchaseSuccess && purchasedTicket) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${purchasedTicket.qr_token}`;
    const webTicketUrl = `${window.location.origin}/spots/ticket/${purchasedTicket.id}`;

    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-between text-black">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-[480px] w-full bg-white border border-black p-8 md:p-10 rounded-[12px] shadow-sm space-y-8 text-center">
            <div>
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-500 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={20} />
              </div>
              <h1 className="text-2xl font-display italic font-black uppercase tracking-tight">Paiement Validé !</h1>
              <p className="text-xs font-sans text-neutral-500 mt-1">Un e-mail de confirmation contenant votre billet vous a été envoyé.</p>
            </div>

            {/* QR Code */}
            <div className="bg-white border border-black p-5 rounded-[8px] max-w-[280px] mx-auto space-y-4">
              <span className="text-[9px] font-mono font-black uppercase tracking-wider text-[#FF5C00]">Présentez au comptoir</span>
              <img src={qrUrl} width={200} height={200} className="mx-auto" alt="Billet QR Code" />
              <div className="font-mono text-xs font-bold bg-[#F4F5F7] p-2 rounded text-neutral-700 select-all">
                {runnerName}
              </div>
            </div>

            {/* Récap */}
            <div className="text-left bg-[#F4F5F7] border border-black/5 p-4 rounded-lg space-y-2 text-xs">
              <p>📍 <strong>Lieu :</strong> {spot?.name}</p>
              <p>📅 <strong>Date :</strong> {new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {event.event_time.slice(0, 5)}</p>
              <p>☕️ <strong>Offre :</strong> {spot?.offer_description}</p>
            </div>

            <div className="space-y-2">
              <a
                href={webTicketUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 bg-black hover:bg-[#FF5C00] text-white font-mono font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2"
              >
                Visualiser en ligne <Ticket size={14} />
              </a>
            </div>
          </div>
        </main>
        <footer className="bg-white border-t border-black/5 py-6 text-center text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider">
          © {new Date().getFullYear()} CAPTEN SPOTS
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-between text-black">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-[480px] w-full bg-white border border-black rounded-[12px] shadow-sm overflow-hidden flex flex-col justify-between">
          
          {/* Header Card */}
          <div className="bg-[#FF5C00]/10 border-b border-black/10 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                {clubName}
              </span>
              <span className="text-[18px] font-mono font-black text-black">
                {formatPrice(price)}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-display italic font-black uppercase text-black tracking-tighter leading-none">
                Chez {spot?.name}
              </h1>
              <p className="text-xs font-sans text-neutral-600 font-semibold italic flex items-center gap-1">
                <Coffee size={13} className="text-[#FF5C00]" /> {spot?.offer_description}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            <div className="space-y-3 font-semibold text-xs text-neutral-700">
              <div className="flex items-center gap-3">
                <Calendar size={15} className="text-neutral-400" />
                <span>{new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={15} className="text-neutral-400" />
                <span>Arrivée prévue à {event.event_time.slice(0, 5)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={15} className="text-neutral-400" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((spot?.name || '') + ' ' + (spot?.address || ''))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#FF5C00] hover:underline"
                >
                  {spot?.address}
                </a>
              </div>
            </div>

            {/* Places disponibles progress bar */}
            <div className="space-y-1.5 border-t border-black/5 pt-5">
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-neutral-500">
                <span className="flex items-center gap-1"><Users size={12} /> Places réservées</span>
                <span className={placesLeft === 0 ? 'text-red-500 font-black' : 'text-black'}>
                  {placesLeft === 0 ? 'COMPLET' : `${ticketsSold} / ${event.quota}`}
                </span>
              </div>
              <div className="w-full bg-[#F4F5F7] h-2.5 rounded-full overflow-hidden border border-black/5">
                <div
                  className="bg-[#FF5C00] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Formulaire coureur */}
            {placesLeft > 0 ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-4 border-t border-black/5 pt-5">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500">Prénom & Nom</label>
                  <input
                    type="text"
                    required
                    value={runnerName}
                    onChange={(e) => setRunnerName(e.target.value)}
                    placeholder="ex: Clara Martin"
                    className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500">Adresse Email (pour recevoir le QR Code)</label>
                  <input
                    type="email"
                    required
                    value={runnerEmail}
                    onChange={(e) => setRunnerEmail(e.target.value)}
                    placeholder="ex: clara.martin@gmail.com"
                    className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={buttonState === 'loading' || buttonState === 'success'}
                  className={`w-full h-12 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2 mt-4 ${
                    buttonState === 'success' 
                      ? 'bg-emerald-600' 
                      : buttonState === 'error'
                        ? 'bg-[#FF5C00]'
                        : 'bg-black hover:bg-[#FF5C00] disabled:bg-neutral-400'
                  }`}
                >
                  {buttonState === 'loading' && (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Traitement...
                    </>
                  )}
                  {buttonState === 'success' && '✓ Réservé'}
                  {buttonState === 'error' && 'Réessayer'}
                  {buttonState === 'idle' && `Réserver & Payer ${formatPrice(price)}`}
                </button>
              </form>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans p-4 rounded-lg text-center font-bold">
                ⚠️ Cette offre est victime de son succès, il n'y a plus de places disponibles.
              </div>
            )}
          </div>
          
          <div className="border-t border-black/5 px-6 py-4 bg-[#FDFCF8] text-center text-[9px] font-mono text-neutral-400 uppercase tracking-wider">
            Sécurisé par Stripe connect · Sans création de compte
          </div>
        </div>
      </main>
      <footer className="bg-white border-t border-black/5 py-4 text-center text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider">
        © {new Date().getFullYear()} CAPTEN SPOTS
      </footer>
    </div>
  );
}
