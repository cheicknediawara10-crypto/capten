'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, 
  Tag, 
  Calendar, 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  PauseCircle, 
  Edit3, 
  Send, 
  Lock, 
  ArrowRight, 
  Clock, 
  Users, 
  DollarSign, 
  ExternalLink,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { formatPrice, SpotOffer } from '@/lib/spots';

export default function MerchantSpacePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'offres' | 'evenements' | 'compte'>('offres');

  // Request new link form state
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  const [requestSentMessage, setRequestSentMessage] = useState<string | null>(null);

  // Offers modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpotOffer | null>(null);
  const [offerForm, setOfferForm] = useState({
    name: '',
    description: '',
    price_euros: '6.00',
    quota: '40',
    availability: ['sat_morning', 'sun_morning']
  });
  const [offerSubmitLoading, setOfferSubmitLoading] = useState(false);
  const [offerFormError, setOfferFormError] = useState<string | null>(null);

  // Proposal actions loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load merchant data via token
  const loadMerchantData = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`/api/spots/merchant/auth?token=${encodeURIComponent(token)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Lien d\'accès invalide ou expiré.');
      } else {
        setMerchantData(data);
      }
    } catch (err) {
      setAuthError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMerchantData();
  }, [token]);

  // Handle Magic Link Request
  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail) return;
    setRequestSending(true);
    setRequestSentMessage(null);

    try {
      const res = await fetch('/api/spots/merchant/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequestSentMessage(data.message);
        setRequestEmail('');
      } else {
        setRequestSentMessage(data.error || 'Erreur lors de l\'envoi du lien.');
      }
    } catch {
      setRequestSentMessage('Erreur de connexion.');
    } finally {
      setRequestSending(false);
    }
  };

  // Open Offer Modal for creation or edit
  const handleOpenOfferModal = (offerToEdit?: SpotOffer) => {
    setOfferFormError(null);
    if (offerToEdit) {
      setEditingOffer(offerToEdit);
      setOfferForm({
        name: offerToEdit.name,
        description: offerToEdit.description,
        price_euros: (offerToEdit.price_cents / 100).toString(),
        quota: offerToEdit.quota.toString(),
        availability: offerToEdit.availability || ['sat_morning', 'sun_morning']
      });
    } else {
      setEditingOffer(null);
      setOfferForm({
        name: 'Le Pack Récup',
        description: 'Café filtre + Part de banana bread maison',
        price_euros: '6.00',
        quota: '40',
        availability: ['sat_morning', 'sun_morning']
      });
    }
    setShowOfferModal(true);
  };

  // Save Offer (Create or Edit)
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferSubmitLoading(true);
    setOfferFormError(null);

    try {
      const price_cents = Math.round(parseFloat(offerForm.price_euros) * 100);
      const quota = parseInt(offerForm.quota, 10);

      const endpoint = '/api/spots/merchant/offers';
      const method = editingOffer ? 'PATCH' : 'POST';
      const bodyPayload = editingOffer
        ? {
            offer_id: editingOffer.id,
            name: offerForm.name,
            description: offerForm.description,
            price_cents,
            quota,
            availability: offerForm.availability
          }
        : {
            name: offerForm.name,
            description: offerForm.description,
            price_cents,
            quota,
            availability: offerForm.availability
          };

      const res = await fetch(`${endpoint}?token=${encodeURIComponent(token)}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        setOfferFormError(data.message || 'Erreur lors de l\'enregistrement de l\'offre.');
      } else {
        setShowOfferModal(false);
        await loadMerchantData();
      }
    } catch {
      setOfferFormError('Erreur de communication.');
    } finally {
      setOfferSubmitLoading(false);
    }
  };

  // Toggle Offer Status (Active / Paused)
  const handleToggleOfferStatus = async (offer: SpotOffer) => {
    const newStatus = offer.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/spots/merchant/offers?token=${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.id,
          status: newStatus
        })
      });
      const data = await res.json();
      if (res.ok) {
        await loadMerchantData();
      } else {
        alert(data.message || 'Erreur lors de la mise à jour.');
      }
    } catch {
      alert('Erreur réseau.');
    }
  };

  // Handle Event Proposal Accept/Decline directly in merchant space
  const handleRespondProposal = async (eventId: string, action: 'accept' | 'decline') => {
    setActionLoadingId(eventId);
    try {
      const res = await fetch(`/api/spot-events/${eventId}/respond?action=${action}`);
      if (res.ok) {
        await loadMerchantData();
      } else {
        alert('Erreur lors de la mise à jour de la proposition.');
      }
    } catch {
      alert('Erreur de connexion.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- RENDU : EXPIRED / INVALID LINK SCREEN ---
  if (!token || authError) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] text-[#111] font-sans selection:bg-[#FF5C00] selection:text-white flex flex-col justify-between p-4 sm:p-8">
        <header className="max-w-4xl mx-auto w-full flex justify-between items-center py-4 border-b border-black/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] bg-[#FF5C00] text-white px-2 py-0.5 rounded">
              Capten Spots
            </span>
            <span className="text-xs font-display font-black uppercase tracking-wider italic">
              Espace Commerce
            </span>
          </div>
          <Link href="/spots" className="text-xs font-mono font-bold hover:text-[#FF5C00] transition-colors flex items-center gap-1">
            capten.app/spots →
          </Link>
        </header>

        <main className="max-w-md mx-auto w-full py-12">
          <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-6">
            <div className="w-14 h-14 bg-[#FF5C00]/10 border border-[#FF5C00] text-[#FF5C00] rounded-full flex items-center justify-center mx-auto">
              <Lock size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-display font-black uppercase italic tracking-tight">
                {authError?.includes('EXPIRED') ? 'Lien d\'accès expiré' : 'Accès à votre espace'}
              </h1>
              <p className="text-xs font-mono text-neutral-500 mt-2 leading-relaxed">
                Par sécurité, vos liens d'accès magiques ont une durée de 30 jours sans mot de passe. Entrez votre email pour recevoir votre lien instantané.
              </p>
            </div>

            <form onSubmit={handleRequestMagicLink} className="space-y-4 text-left pt-2">
              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Email du commerce
                </label>

                <input
                  type="email"
                  required
                  placeholder="contact@votre-commerce.com"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-black/20 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#FF5C00] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={requestSending}
                className="w-full bg-[#FF5C00] hover:bg-black text-white py-3.5 px-6 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                {requestSending ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Envoi du lien...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Recevoir mon lien magique
                  </>
                )}
              </button>
            </form>

            {requestSentMessage && (
              <div className="p-3 bg-[#FF5C00]/10 border border-[#FF5C00]/30 rounded-xl text-xs font-mono text-[#FF5C00] leading-relaxed">
                {requestSentMessage}
              </div>
            )}
          </div>
        </main>

        <footer className="max-w-4xl mx-auto w-full text-center text-[10px] font-mono text-neutral-400 py-4 border-t border-black/5">
          Capten Spots — Partenariats exclusifs pour Run Clubs & Commerce Local
        </footer>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-[#FF5C00]" size={32} />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            Chargement de votre Espace Commerce...
          </p>
        </div>
      </div>
    );
  }

  const spot = merchantData?.spot || {};
  const offers: SpotOffer[] = merchantData?.offers || [];
  const upcomingEvents = merchantData?.upcomingEvents || [];
  const pastEvents = merchantData?.pastEvents || [];
  const monthlySummary = merchantData?.monthlySummary || {};
  const stripeConnectStatus = merchantData?.stripeConnectStatus || 'pending';

  const activeOffersCount = offers.filter(o => o.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#111] font-sans selection:bg-[#FF5C00] selection:text-white">
      {/* TOP BRANDING BAR */}
      <header className="border-b border-black/10 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black">
              <Store size={20} className="text-[#FF5C00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-black uppercase italic leading-none">
                  {spot.name || 'Mon Commerce'}
                </h1>
                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                  spot.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}>
                  {spot.status === 'active' ? 'Commerce Actif' : 'En Attente'}
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400 mt-1">
                📍 {spot.address || 'Adresse non renseignée'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400">Accès sécurisé sans mot de passe</span>
            <button
              onClick={() => loadMerchantData()}
              className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex border-t border-black/5 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('offres')}
            className={`py-3 px-4 text-xs font-mono font-black uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'offres'
                ? 'border-[#FF5C00] text-[#FF5C00]'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Tag size={14} />
            Mes Offres Exclusives ({offers.length})
          </button>

          <button
            onClick={() => setActiveTab('evenements')}
            className={`py-3 px-4 text-xs font-mono font-black uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'evenements'
                ? 'border-[#FF5C00] text-[#FF5C00]'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Calendar size={14} />
            Mes Événements ({upcomingEvents.length + pastEvents.length})
          </button>

          <button
            onClick={() => setActiveTab('compte')}
            className={`py-3 px-4 text-xs font-mono font-black uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'compte'
                ? 'border-[#FF5C00] text-[#FF5C00]'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <CreditCard size={14} />
            Mon Compte & Paiements
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: MES OFFRES EXCLUSIVES */}
        {/* ========================================================================= */}
        {activeTab === 'offres' && (
          <div className="space-y-6">
            {/* INTRO BANNER */}
            <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#FF5C00]">
                  Un Spot = Une Offre Exclusive
                </span>
                <h2 className="text-xl font-display font-black uppercase italic tracking-tight mt-1">
                  Gérez vos formules réservées aux coureurs
                </h2>
                <p className="text-xs font-mono text-neutral-500 mt-1 max-w-2xl">
                  Vos offres sont uniques et créées spécialement pour Capten. Vous pouvez activer jusqu'à <strong>3 offres simultanées</strong>.
                </p>
              </div>

              <button
                onClick={() => handleOpenOfferModal()}
                disabled={activeOffersCount >= 3}
                className={`shrink-0 py-3 px-5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  activeOffersCount >= 3
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-black/10'
                    : 'bg-[#FF5C00] hover:bg-black text-white'
                }`}
              >
                <Plus size={16} />
                Nouvelle offre ({activeOffersCount}/3)
              </button>
            </div>

            {/* OFFERS GRID / TABLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4 relative ${
                    offer.status === 'paused' ? 'opacity-75 bg-neutral-50' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                        offer.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {offer.status === 'active' ? (
                          <>
                            <CheckCircle2 size={10} /> Active
                          </>
                        ) : (
                          <>
                            <PauseCircle size={10} /> Suspendue
                          </>
                        )}
                      </span>

                      <span className="text-xl font-mono font-black text-[#FF5C00]">
                        {formatPrice(offer.price_cents)}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-black uppercase italic tracking-tight">
                      {offer.name}
                    </h3>

                    <p className="text-xs font-mono text-neutral-600 leading-relaxed min-h-[40px]">
                      "{offer.description}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/10 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                      <span>Quota max :</span>
                      <strong className="text-black font-bold">{offer.quota} places</strong>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleOpenOfferModal(offer)}
                        className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-black border border-black/20 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 size={12} />
                        Modifier
                      </button>

                      <button
                        onClick={() => handleToggleOfferStatus(offer)}
                        className={`flex-1 py-2 px-3 border rounded-xl text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                          offer.status === 'active'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {offer.status === 'active' ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {offers.length === 0 && (
                <div className="col-span-full bg-white border-2 border-dashed border-black/20 p-12 rounded-2xl text-center space-y-3">
                  <Tag className="mx-auto text-neutral-300" size={36} />
                  <h3 className="text-base font-display font-black uppercase italic">
                    Aucune offre créée pour le moment
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
                    Créez votre première formule exclusive réservée aux coureurs de Capten.
                  </p>
                  <button
                    onClick={() => handleOpenOfferModal()}
                    className="bg-[#FF5C00] text-white py-2.5 px-5 rounded-xl text-xs font-mono font-black uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <Plus size={14} /> Créer mon offre
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MES ÉVÉNEMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'evenements' && (
          <div className="space-y-8">
            
            {/* MONTHLY RECAP CARD */}
            <div className="bg-black text-white p-6 sm:p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,92,0,1)] border border-black">
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#FF5C00]">
                Tableau Récapitulatif
              </span>
              <h2 className="text-2xl font-display font-black uppercase italic tracking-tight mt-1">
                {monthlySummary.monthLabel || 'Mois en cours'}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-white/10">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">Événements</span>
                  <span className="text-2xl font-mono font-black">{monthlySummary.eventsCount || 0}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">Coureurs</span>
                  <span className="text-2xl font-mono font-black">{monthlySummary.runnersCount || 0}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">Encaissés</span>
                  <span className="text-2xl font-mono font-black text-white">{monthlySummary.encaisseEuros || '0.00'} €</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#FF5C00] block uppercase font-bold">Virés (Net)</span>
                  <span className="text-2xl font-mono font-black text-[#FF5C00]">{monthlySummary.vireEuros || '0.00'} €</span>
                </div>
              </div>
            </div>

            {/* UPCOMING EVENTS */}
            <div className="space-y-4">
              <h3 className="text-lg font-display font-black uppercase italic tracking-tight flex items-center gap-2">
                <Calendar size={18} className="text-[#FF5C00]" />
                Événements à venir & Propositions ({upcomingEvents.length})
              </h3>

              <div className="space-y-4">
                {upcomingEvents.map((evt: any) => (
                  <div
                    key={evt.id}
                    className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                          evt.status === 'proposed'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                          {evt.status === 'proposed' ? 'Proposition reçue' : 'Confirmé — En Vente'}
                        </span>

                        <span className="text-xs font-mono font-bold text-neutral-400">
                          {evt.club?.whatsapp_display_name || 'Run Club'}
                        </span>
                      </div>

                      <h4 className="text-xl font-display font-black uppercase italic">
                        {new Date(evt.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} — à {evt.event_time}
                      </h4>

                      <p className="text-xs font-mono text-neutral-500">
                        Estimation : ~{evt.estimated_runners} coureurs · Formule {formatPrice(evt.offer_price_cents)} (Quota : {evt.quota} places)
                      </p>
                    </div>

                    {/* PROPOSAL ACTIONS */}
                    {evt.status === 'proposed' ? (
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleRespondProposal(evt.id, 'decline')}
                          disabled={actionLoadingId === evt.id}
                          className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-black border border-black/20 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-colors"
                        >
                          Refuser
                        </button>

                        <button
                          onClick={() => handleRespondProposal(evt.id, 'accept')}
                          disabled={actionLoadingId === evt.id}
                          className="py-2.5 px-5 bg-[#FF5C00] hover:bg-black text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          Accepter la date
                        </button>
                      </div>
                    ) : (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold block text-neutral-400">Formules réservées</span>
                        <span className="text-xl font-mono font-black text-black">
                          {evt.checkin_count || 0} / {evt.quota}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {upcomingEvents.length === 0 && (
                  <p className="text-xs font-mono text-neutral-400 italic py-4">
                    Aucun événement à venir pour le moment. Vous recevrez une notification par email dès qu'un club propose une venue !
                  </p>
                )}
              </div>
            </div>

            {/* PAST EVENTS */}
            <div className="space-y-4 pt-6 border-t border-black/10">
              <h3 className="text-lg font-display font-black uppercase italic tracking-tight flex items-center gap-2">
                <Clock size={18} className="text-neutral-400" />
                Historique des événements passés ({pastEvents.length})
              </h3>

              <div className="space-y-3">
                {pastEvents.map((evt: any) => (
                  <div
                    key={evt.id}
                    className="bg-white border border-black/10 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div>
                      <span className="text-xs font-mono font-black uppercase text-black">
                        {new Date(evt.event_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} — {evt.club?.whatsapp_display_name || 'Run Club'}
                      </span>
                      <p className="text-[10px] font-mono text-neutral-400">
                        {evt.checkin_count || 0} coureurs présents · Formule {formatPrice(evt.offer_price_cents)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-600 block">
                        +{( (evt.checkin_count || 1) * evt.offer_price_cents * 0.85 / 100 ).toFixed(2)} € virés
                      </span>
                    </div>
                  </div>
                ))}

                {pastEvents.length === 0 && (
                  <p className="text-xs font-mono text-neutral-400 italic">
                    Aucun événement passé enregistré.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MON COMPTE & PAIEMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'compte' && (
          <div className="space-y-6">
            
            {/* STRIPE CONNECT STATUS CARD */}
            <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#FF5C00]">
                    Paiements & Encaissements
                  </span>
                  <h2 className="text-xl font-display font-black uppercase italic tracking-tight mt-1">
                    Statut Stripe Connect Express
                  </h2>
                </div>

                <span className={`text-xs font-mono font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  stripeConnectStatus === 'complete'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}>
                  {stripeConnectStatus === 'complete' ? (
                    <>
                      <CheckCircle2 size={14} /> KYC Complété · Compte Actif
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} /> Action Requise
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs font-mono text-neutral-600 leading-relaxed max-w-2xl">
                Les paiements des coureurs sont directement versés sur votre compte bancaire via le système Stripe Connect Express (75% net garanti sans frais d'installation).
              </p>

              <div className="pt-4 border-t border-black/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">Coordonnées bancaires IBAN</span>
                  <strong className="text-xs font-mono text-black">Gérées en toute sécurité sur Stripe</strong>
                </div>

                <a
                  href="/api/stripe/portal"
                  className="bg-black hover:bg-[#FF5C00] text-white py-3 px-5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <ExternalLink size={14} />
                  Mettre à jour mes coordonnées bancaires
                </a>
              </div>
            </div>

            {/* CUMULATIVE STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-mono font-black text-neutral-400 uppercase block">Total Viré (Cumulé)</span>
                <span className="text-3xl font-mono font-black text-[#FF5C00] mt-1 block">
                  {((spot.total_earned_cents || 62035) / 100).toFixed(2)} €
                </span>
              </div>

              <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-mono font-black text-neutral-400 uppercase block">Total Événements</span>
                <span className="text-3xl font-mono font-black text-black mt-1 block">
                  {spot.total_events || 4}
                </span>
              </div>

              <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[10px] font-mono font-black text-neutral-400 uppercase block">Total Coureurs Accueillis</span>
                <span className="text-3xl font-mono font-black text-black mt-1 block">
                  {spot.total_runners || 143}
                </span>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CRÉER / MODIFIER UNE OFFRE */}
      {/* ========================================================================= */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 relative">
            <div>
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#FF5C00]">
                {editingOffer ? 'Modification' : 'Nouvelle Formule Exclusive'}
              </span>
              <h2 className="text-xl font-display font-black uppercase italic tracking-tight mt-1">
                {editingOffer ? 'Modifier l\'offre' : 'Créer une offre exclusive Capten'}
              </h2>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block mb-1">
                  Nom de l'offre
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Ex : Le Pack Récup"
                  value={offerForm.name}
                  onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                  className="w-full bg-[#F4F5F7] border border-black/20 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#FF5C00]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block mb-1">
                  Description courte (inclus dans la formule)
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="Ex : Café filtre + Part de banana bread maison"
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  className="w-full bg-[#F4F5F7] border border-black/20 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#FF5C00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block mb-1">
                    Prix TTC (€)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    placeholder="6.00"
                    value={offerForm.price_euros}
                    onChange={(e) => setOfferForm({ ...offerForm, price_euros: e.target.value })}
                    className="w-full bg-[#F4F5F7] border border-black/20 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#FF5C00]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block mb-1">
                    Quota max (places)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    required
                    placeholder="40"
                    value={offerForm.quota}
                    onChange={(e) => setOfferForm({ ...offerForm, quota: e.target.value })}
                    className="w-full bg-[#F4F5F7] border border-black/20 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#FF5C00]"
                  />
                </div>
              </div>

              {offerFormError && (
                <div className="p-3 bg-[#FF5C00]/10 border border-[#FF5C00]/30 rounded-xl text-xs font-mono text-[#FF5C00]">
                  {offerFormError}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-black rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={offerSubmitLoading}
                  className="flex-1 py-3 bg-[#FF5C00] hover:bg-black text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {offerSubmitLoading ? 'Enregistrement...' : (editingOffer ? 'Enregistrer' : 'Créer l\'offre')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
