'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Wallet, Calendar, Users, TrendingUp, Sparkles, Store } from 'lucide-react';
import { getSupabase, formatPrice } from '@/lib/supabase';
import { SpotEvent, calculateSplit } from '@/lib/spots';

interface EventStats {
  event: SpotEvent & { spot: { name: string } };
  ticketsCount: number;
  checkinsCount: number;
  totalSales: number;
  clubEarnings: number;
}

export default function CompteurPage() {
  const { club, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = getSupabase();
      if (!supabase || !club?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Récupérer les événements terminés
        const { data: events, error: eventsError } = await supabase
          .from('spot_events')
          .select('*, spot:spots(name)')
          .eq('club_id', club.id)
          .eq('status', 'completed')
          .order('event_date', { ascending: false });

        if (eventsError) throw eventsError;

        if (events && events.length > 0) {
          const eventIds = events.map(e => e.id);

          // 2. Récupérer les tickets de ces événements
          const { data: tickets, error: ticketsError } = await supabase
            .from('spot_tickets')
            .select('amount_cents, spot_event_id, status, is_first_visit, commission_applied')
            .in('spot_event_id', eventIds)
            .in('status', ['paid', 'redeemed']);

          if (ticketsError) throw ticketsError;

          // 3. Calculer les statistiques par événement
          const statsMap = events.map(event => {
            const eventTickets = (tickets || []).filter(t => t.spot_event_id === event.id);
            const checkins = eventTickets.filter(t => t.status === 'redeemed').length;
            
            let totalSales = 0;
            let clubEarnings = 0;

            eventTickets.forEach(t => {
              totalSales += t.amount_cents;
              const splits = calculateSplit(
                t.amount_cents,
                event.club_rate,
                event.platform_rate,
                t.commission_applied
              );
              clubEarnings += splits.clubAmount;
            });

            return {
              event: event as any,
              ticketsCount: eventTickets.length,
              checkinsCount: checkins,
              totalSales,
              clubEarnings
            };
          });

          setStats(statsMap);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && club?.id) {
      loadStats();
    }
  }, [club?.id, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mt-4">Calcul du compteur...</p>
      </div>
    );
  }

  // Calcul du cumul
  const totalVisits = stats.reduce((acc, curr) => acc + curr.ticketsCount, 0);
  const totalSalesVolume = stats.reduce((acc, curr) => acc + curr.totalSales, 0);
  const totalEarningsCalculated = stats.reduce((acc, curr) => acc + curr.clubEarnings, 0);

  return (
    <div className="space-y-8 pb-20 page-transition">
      {/* Back CTA */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-[10px] font-mono font-bold text-[#A3A3A3] hover:text-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft size={14} /> Retour
        </button>
      </div>

      {/* Header */}
      <header className="flex flex-col gap-1.5 pb-6 border-b-[0.5px] border-black/10">
        <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
          LE COMPTEUR SPOTS
        </h1>
        <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">
          Suivi de l'économie locale et de la cagnotte
        </p>
      </header>

      {/* Solde Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="linear-card bg-[#FDFCF8] border-2 border-black p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Solde Cagnotte Actuel</span>
            <span className="text-4xl font-mono font-black text-[#FF5C00] tracking-tight">
              {formatPrice(club?.spots_balance_cents || 0)}
            </span>
          </div>
          <p className="text-[9.5px] font-sans text-neutral-500 leading-normal mt-4">
            Alimenté par 10% de commission sur les premières visites. Reversements sur demande auprès de Capten.
          </p>
        </div>

        <div className="linear-card bg-white border border-black/10 p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Volume d'affaires généré</span>
            <span className="text-4xl font-mono font-black text-black tracking-tight">
              {formatPrice(totalSalesVolume)}
            </span>
          </div>
          <p className="text-[9.5px] font-sans text-neutral-500 leading-normal mt-4">
            Montant total prépayé par vos coureurs pour soutenir les commerces de votre quartier.
          </p>
        </div>

        <div className="linear-card bg-white border border-black/10 p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Formules Validées</span>
            <span className="text-4xl font-mono font-black text-black tracking-tight">
              {totalVisits} <span className="text-xs text-neutral-400 font-bold uppercase">visites</span>
            </span>
          </div>
          <p className="text-[9.5px] font-sans text-neutral-500 leading-normal mt-4">
            Nombre de fois où vos coureurs ont partagé un moment convivial après l'entraînement.
          </p>
        </div>
      </div>

      {/* History section */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
          <TrendingUp size={14} className="text-[#FF5C00]" /> Historique des sorties complétées
        </h3>

        {stats.length === 0 ? (
          <div className="linear-card text-center py-16 bg-[#FDFCF8] border border-black/10 rounded-xl space-y-4">
            <Sparkles size={36} className="text-neutral-300 mx-auto" />
            <div className="space-y-1.5">
              <p className="text-xs font-mono font-bold text-neutral-500 uppercase">Aucune cagnotte générée pour l'instant.</p>
              <p className="text-[11px] font-sans text-neutral-400 max-w-sm mx-auto">
                Proposez votre premier run dans un spot partenaire pour commencer à alimenter votre cagnotte.
              </p>
            </div>
            <button
              onClick={() => router.push('/spots/explorer')}
              className="px-5 py-2.5 bg-black hover:bg-[#FF5C00] text-white font-mono font-bold text-[10px] uppercase tracking-wider transition-all"
            >
              Découvrir les spots
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.map(({ event, ticketsCount, checkinsCount, totalSales, clubEarnings }) => {
              const formattedDate = new Date(event.event_date).toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit'
              }).toUpperCase();

              return (
                <div
                  key={event.id}
                  className="bg-white border border-black/10 rounded-[12px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase bg-[#FF5C00]/10 text-[#FF5C00] px-2 py-0.5 rounded">
                        {formattedDate}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
                        — {event.event_time.slice(0, 5)}
                      </span>
                    </div>
                    <h4 className="text-lg font-display italic font-black uppercase text-black leading-none">
                      {event.spot?.name || 'Spot'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-3 gap-6 md:gap-12 text-left md:text-right w-full md:w-auto border-t border-black/5 md:border-none pt-4 md:pt-0">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Participants</span>
                      <span className="text-sm font-mono font-bold text-black">
                        {checkinsCount || ticketsCount} <span className="text-[10px] text-neutral-400 font-semibold">/ {ticketsCount}</span>
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Ventes</span>
                      <span className="text-sm font-mono font-bold text-black">
                        {formatPrice(totalSales)}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#FF5C00] block">Cagnotte</span>
                      <span className="text-sm font-mono font-bold text-[#FF5C00]">
                        +{formatPrice(clubEarnings)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
