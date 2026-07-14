'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Store, MapPin, Coffee, Users, ChevronRight, Filter } from 'lucide-react';
import { formatPrice } from '@/lib/supabase';
import { Spot } from '@/lib/spots';

const NEIGHBORHOODS = [
  'Tous',
  'Sentier / 2ème',
  'Saint-Denis / 2ème',
  'Le Marais / 3ème',
  'Châtelet / 1er',
  'Montmartre / 18ème',
  'Saint-Germain / 6ème',
  'Bastille / 11ème',
  'Canal Saint-Martin / 10ème',
  'Pigalle / 9ème'
];

export default function SpotsExplorerPage() {
  const { club } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Tous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpots() {
      try {
        setLoading(true);
        const url = selectedNeighborhood === 'Tous'
          ? '/api/spots'
          : `/api/spots?neighborhood=${encodeURIComponent(selectedNeighborhood)}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSpots(data.filter((s: Spot) => s.status === 'active'));
        }
      } catch (err) {
        console.error('Failed to fetch spots:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSpots();
  }, [selectedNeighborhood]);

  return (
    <div className="space-y-8 pb-20 page-transition">
      {/* Header */}
      <header className="flex flex-col gap-1.5 pb-6 border-b-[0.5px] border-black/10 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
              EXPLORER LES SPOTS
            </h1>
            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">
              Marketplace commerces partenaires
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded">
              Cagnotte Spots : {formatPrice(club?.spots_balance_cents || 0)}
            </span>
          </div>
        </div>
      </header>

      {/* Description Panel */}
      <div className="linear-card bg-[#FDFCF8] border border-black/10 rounded-[12px] p-6 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
          💡 Comment ça marche ?
        </h3>
        <p className="text-xs font-sans text-neutral-600 leading-relaxed">
          Sélectionnez un café ou coffee shop partenaire dans la liste ci-dessous, proposez une date de fin de run, et partagez le lien de vente à vos coureurs. Le commerce prépare l'offre, et vous touchez <strong>12.5% de commission</strong> reversée directement dans votre cagnotte !
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 bg-white border border-black/5 p-2 rounded-xl overflow-x-auto shrink-0 scrollbar-none">
        <div className="text-[#A3A3A3] p-1.5 shrink-0">
          <Filter size={16} />
        </div>
        {NEIGHBORHOODS.map(n => (
          <button
            key={n}
            onClick={() => setSelectedNeighborhood(n)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedNeighborhood === n
                ? 'bg-[#FF5C00] text-white'
                : 'text-neutral-500 hover:text-black hover:bg-black/5'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Spots Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mt-4">Chargement des commerces...</p>
        </div>
      ) : spots.length === 0 ? (
        <div className="linear-card text-center py-16 space-y-3">
          <Store size={36} className="text-neutral-300 mx-auto" />
          <p className="text-xs font-mono font-bold text-neutral-500 uppercase">Aucun spot disponible pour ce quartier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map(spot => (
            <Link
              href={`/spots/explorer/${spot.id}`}
              key={spot.id}
              className="linear-card bg-white border border-black/10 hover:border-[#FF5C00]/30 rounded-[12px] p-6 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-display italic font-black uppercase tracking-tight text-black group-hover:text-[#FF5C00] transition-colors">
                    {spot.name}
                  </h3>
                  <span className="text-[9px] font-mono font-bold uppercase bg-[#F4F5F7] px-2 py-0.5 rounded text-neutral-600">
                    {spot.neighborhood.split(' ')[0]}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-sans text-neutral-600 font-semibold italic flex items-center gap-1.5">
                    <Coffee size={14} className="text-[#FF5C00] shrink-0" /> {spot.offer_description}
                  </p>
                  <p className="text-[10px] font-sans text-neutral-400 flex items-center gap-1">
                    <MapPin size={11} /> {spot.address}
                  </p>
                </div>
              </div>

              <div className="border-t border-black/5 pt-4 mt-5 flex justify-between items-center text-[10px] font-mono font-bold uppercase">
                <span className="text-neutral-500 flex items-center gap-1">
                  <Users size={12} /> Capacité max : {spot.capacity}
                </span>
                <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {formatPrice(spot.offer_price_cents)} <ChevronRight size={14} className="text-[#FF5C00]" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
