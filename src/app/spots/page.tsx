'use client';

import React, { useState } from 'react';
import { Store, Clock, Users, CheckCircle2, ArrowRight, Sparkles, MapPin } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Lundi' },
  { id: 'tue', label: 'Mardi' },
  { id: 'wed', label: 'Mercredi' },
  { id: 'thu', label: 'Jeudi' },
  { id: 'fri', label: 'Vendredi' },
  { id: 'sat', label: 'Samedi' },
  { id: 'sun', label: 'Dimanche' }
];

const TIMES_OF_DAY = [
  { id: 'morning', label: 'Matin (Café/Petit-dej)' },
  { id: 'lunch', label: 'Midi (Déjeuner)' },
  { id: 'afternoon', label: 'Après-midi (Goûter)' },
  { id: 'evening', label: 'Soir (Apéro)' }
];

export default function SpotsLandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    neighborhood: '',
    contact_email: '',
    contact_phone: '',
    capacity: 30,
    offer_description: '',
    offer_price: '6.00'
  });

  const [availability, setAvailability] = useState<Record<string, string[]>>({
    sat: ['morning'],
    sun: ['morning']
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdSpotId, setCreatedSpotId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityToggle = (dayId: string, timeId: string) => {
    setAvailability(prev => {
      const daySlots = prev[dayId] || [];
      const newSlots = daySlots.includes(timeId)
        ? daySlots.filter(s => s !== timeId)
        : [...daySlots, timeId];
      
      const updated = { ...prev };
      if (newSlots.length > 0) {
        updated[dayId] = newSlots;
      } else {
        delete updated[dayId];
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity.toString(), 10),
        offer_price_cents: Math.round(parseFloat(formData.offer_price) * 100),
        availability
      };

      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true);
        setCreatedSpotId(data.id || 'mock-id');
      } else {
        alert(data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau ou serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-between text-black">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-[550px] w-full bg-white border border-black p-8 md:p-12 text-center space-y-8 rounded-[12px] shadow-sm">
            <div className="w-16 h-16 bg-[#FF5C00]/10 border border-[#FF5C00] text-[#FF5C00] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-display italic font-black uppercase tracking-tight">
                C'est envoyé !
              </h1>
              <p className="text-sm font-sans text-neutral-600 leading-relaxed">
                Merci pour votre inscription. Votre commerce <strong>{formData.name}</strong> a bien été enregistré. 
                Notre équipe va vérifier vos informations manuellement sous 24h.
              </p>
            </div>

            <div className="bg-[#F4F5F7] border border-black/5 p-5 rounded-lg text-left space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-black">Étape suivante : Paiements</h4>
              <p className="text-xs font-sans text-neutral-600">
                Afin de recevoir vos virements automatiquement après chaque run, vous devez configurer votre compte de paiement sécurisé via Stripe Connect Express.
              </p>
              
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/spots/${createdSpotId}/onboarding`, { method: 'POST' });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert('Erreur onboarding Stripe');
                    }
                  } catch (e) {
                    alert('Erreur réseau');
                  }
                }}
                className="w-full h-11 bg-[#FF5C00] hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2"
              >
                Lancer l'onboarding Stripe <ArrowRight size={14} />
              </button>
            </div>

            <p className="text-[10px] font-mono text-neutral-400 uppercase">
              Vous recevrez également ces instructions par email.
            </p>
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
      {/* Header */}
      <header className="border-b border-black/10 py-6 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span className="font-display italic font-black uppercase text-xl tracking-tighter text-[#FF5C00]">
            CAPTEN <span className="text-black">SPOTS</span>
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded">
            PARTENAIRES
          </span>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-16">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-[#FF5C00]/10 border border-[#FF5C00]/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#FF5C00] uppercase tracking-wider">
            <Sparkles size={12} /> Zéro coût fixe · Boostez vos ventes
          </div>
          <h1 className="text-4xl md:text-6xl font-display italic font-black uppercase tracking-tighter leading-none">
            Remplissez votre commerce avec les run clubs locaux
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base font-sans text-neutral-600 leading-relaxed">
            Les clubs de running terminent leur sortie chez vous. Proposez une offre unique (boisson + en-cas), 
            les coureurs prépaient en un clic sur leur mobile, vous encaissez directement. 
            Aucun abonnement, aucun matériel à installer.
          </p>
        </section>

        {/* Form Container */}
        <section className="bg-white border border-black p-6 md:p-10 rounded-[12px] shadow-sm max-w-2xl mx-auto space-y-8">
          <div className="border-b border-black/5 pb-4">
            <h2 className="text-xl font-display italic font-black uppercase text-black tracking-tight flex items-center gap-2">
              <Store size={20} className="text-[#FF5C00]" /> Inscrire votre établissement
            </h2>
            <p className="text-xs font-sans text-neutral-500 mt-1">Tous les champs sont obligatoires pour valider votre fiche.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Infos de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Nom de l'établissement</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ex: Blondy Coffee"
                  className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Ville / Quartier</label>
                <input
                  type="text"
                  name="neighborhood"
                  required
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="ex: Lyon, Bordeaux, Marais / 3ème..."
                  className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Adresse complète</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder="ex: 12 Rue de la Lune, 75002 Paris"
                className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
              />
            </div>

            {/* Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Email de contact</label>
                <input
                  type="email"
                  name="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="ex: contact@blondy.cafe"
                  className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Téléphone portable</label>
                <input
                  type="tel"
                  name="contact_phone"
                  required
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="ex: 06 12 34 56 78"
                  className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Capacité & Offre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/5 pt-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Capacité max de coureurs</label>
                <div className="relative">
                  <input
                    type="number"
                    name="capacity"
                    min="5"
                    max="300"
                    required
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-[10px] font-mono text-neutral-400">COUREURS</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Prix public de l'offre (€)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="offer_price"
                    step="0.01"
                    min="1.00"
                    required
                    value={formData.offer_price}
                    onChange={handleInputChange}
                    className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-[10px] font-mono text-neutral-400">EUR</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Description libre de votre offre</label>
              <textarea
                name="offer_description"
                rows={3}
                required
                value={formData.offer_description}
                onChange={handleInputChange}
                placeholder="ex: Un double espresso + une part de notre banana bread signature (prix habituel: 8.50€)"
                className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Disponibilités */}
            <div className="space-y-3 border-t border-black/5 pt-6">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Disponibilités d'accueil</label>
                <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Cochez les créneaux où les run clubs peuvent vous proposer une sortie.</p>
              </div>

              <div className="border border-black/10 rounded-md overflow-hidden">
                <div className="grid grid-cols-8 bg-[#F4F5F7] border-b border-black/10 text-[9px] font-mono font-bold uppercase text-neutral-500 p-2">
                  <div>Créneau</div>
                  {DAYS_OF_WEEK.map(d => <div key={d.id} className="text-center">{d.label.slice(0, 3)}</div>)}
                </div>
                {TIMES_OF_DAY.map(time => (
                  <div key={time.id} className="grid grid-cols-8 border-b border-black/5 p-2 text-[10px] font-sans font-semibold text-neutral-700 items-center">
                    <div className="font-mono text-[9px] uppercase leading-none">{time.label.split(' ')[0]}</div>
                    {DAYS_OF_WEEK.map(day => {
                      const isChecked = availability[day.id]?.includes(time.id) || false;
                      return (
                        <div key={day.id} className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAvailabilityToggle(day.id, time.id)}
                            className="w-4 h-4 rounded text-[#FF5C00] border-neutral-300 focus:ring-[#FF5C00]"
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-black hover:bg-[#FF5C00] disabled:bg-neutral-400 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer mon commerce'} <ArrowRight size={14} />
            </button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 py-8 text-center text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider space-y-2">
        <div>© {new Date().getFullYear()} CAPTEN SPOTS · TOUS DROITS RÉSERVÉS</div>
        <div className="font-mono text-[9px] text-neutral-400">PRODUIT POUR LES LOCAL RUN CLUBS</div>
      </footer>
    </div>
  );
}
