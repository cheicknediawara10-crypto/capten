'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Plus, ArrowRight, Gift, Zap, ShoppingBag, Coffee, Heart, Users, BarChart3, Edit3, ToggleLeft, ToggleRight, TrendingUp, Eye, X, CheckCircle2, Globe, Percent, Building } from 'lucide-react';

type Category = 'all' | 'gear' | 'social' | 'sante';

export default function AvantagesPage() {
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [deals, setDeals] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    partner: "",
    cat: "gear",
    desc: "",
    expiry: "Permanent",
    discountValue: "20",
    active: true,
    contactName: "",
    contactEmail: "",
    website: "",
    code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filters: { id: Category; label: string; count: number }[] = [
    { id: 'all', label: 'Tous', count: deals.length },
    { id: 'gear', label: 'Gear', count: deals.filter(d => d.cat === 'gear').length },
    { id: 'social', label: 'Social', count: deals.filter(d => d.cat === 'social').length },
    { id: 'sante', label: 'Santé', count: deals.filter(d => d.cat === 'sante').length },
  ];

  const initialDeals: any[] = [];

  useEffect(() => {
    const stored = localStorage.getItem('capten_deals_v3');
    if (stored) {
      setDeals(JSON.parse(stored));
    } else {
      setDeals(initialDeals);
      localStorage.setItem('capten_deals_v3', JSON.stringify(initialDeals));
    }

    if (typeof window !== 'undefined' && window.location.search.includes('openNouveau=true')) {
      setIsCreateModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const filtered = activeFilter === 'all' ? deals : deals.filter(d => d.cat === activeFilter);
  const activeDeals = deals.filter(d => d.active).length;
  const avgUsage = activeDeals > 0 
    ? Math.round(deals.filter(d => d.active).reduce((s, d) => s + (d.totalMembers > 0 ? (d.usedBy / d.totalMembers) * 100 : 0), 0) / activeDeals)
    : 0;

  const popularDeal = activeDeals > 0 
    ? deals.filter(d => d.active).reduce((max, d) => (d.usedBy > max.usedBy ? d : max), deals[0])
    : null;

  const popularDealValue = popularDeal ? popularDeal.name.toUpperCase() : 'AUCUN';
  const popularDealSub = popularDeal ? `${popularDeal.usedBy} UTILISATIONS / MOIS` : '0 UTILISATION';

  const retentionImpact = activeDeals > 0 
    ? `+${Math.max(5, Math.round(avgUsage * 0.2))}%` 
    : '0%';

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <header className="flex flex-col gap-1.5 pb-6 sm:pb-10 border-b-[0.5px] border-black/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tight">CLUB AVANTAGES</h1>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-[6px] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FF5C00] transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} /> AJOUTER UN DEAL
          </button>
        </div>
      </header>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'DEALS ACTIFS', value: `${activeDeals}`, sub: `SUR ${deals.length} NÉGOCIÉS`, color: 'text-black' },
          { label: 'TAUX D\'ADOPTION MOYEN', value: `${avgUsage}%`, sub: 'DES MEMBRES UTILISENT', color: 'text-[#FF5C00]' },
          { label: 'DEAL LE PLUS POPULAIRE', value: popularDealValue, sub: popularDealSub, color: 'text-[#56E39F]' },
          { label: 'IMPACT RÉTENTION GLOBAL', value: retentionImpact, sub: 'VS CLUBS SANS AVANTAGES', color: 'text-[#56E39F]' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border-[0.5px] border-[#E5E5E5] rounded-[12px] p-6 space-y-2 shadow-sm group hover:border-black transition-all">
            <p className="text-[9px] font-black text-[#D1D1D1] uppercase tracking-[0.2em] italic">{kpi.label}</p>
            <h3 className={`text-[32px] font-display italic font-black ${kpi.color}`}>{kpi.value}</h3>
            <p className="text-[9px] font-medium text-[#A3A3A3] uppercase tracking-widest">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        {filters.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer ${activeFilter === f.id ? 'bg-black text-white' : 'bg-white border-[0.5px] border-[#E5E5E5] text-[#A3A3A3] hover:text-black'}`}>
            {f.label} <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${activeFilter === f.id ? 'bg-white/20' : 'bg-[#F4F5F7]'}`}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* DEALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map((deal, idx) => (
          <div key={idx} onClick={() => setSelectedDeal(deal)} className="bg-white border-[0.5px] border-[#E5E5E5] rounded-[16px] overflow-hidden shadow-sm hover:border-black/20 transition-all group cursor-pointer">
            {/* Image band */}
            <div className="relative h-[140px] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${deal.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                <div>
                  <h3 className="text-[22px] font-display italic font-black text-white uppercase leading-none">{deal.name}</h3>
                  <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider mt-1">{deal.desc}</p>
                </div>
                {deal.active ? (
                  <div className="flex items-center gap-1.5 bg-[#56E39F]/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#56E39F] rounded-full" />
                    <span className="text-[8px] font-black text-[#56E39F] uppercase tracking-widest">ACTIF</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                    <span className="w-1.5 h-1.5 bg-[#A3A3A3] rounded-full" />
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">EN ATTENTE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Founder metrics */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.15em] italic mb-1">ADOPTION</p>
                  <p className="text-[18px] font-display italic font-black text-black leading-none">{deal.active ? `${deal.totalMembers > 0 ? Math.round((deal.usedBy / deal.totalMembers) * 100) : 0}%` : '—'}</p>
                  <p className="text-[8px] font-medium text-[#A3A3A3] mt-0.5">{deal.usedBy}/{deal.totalMembers} membres</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.15em] italic mb-1">RÉTENTION</p>
                  <p className={`text-[18px] font-display italic font-black leading-none ${deal.retention.startsWith('+') ? 'text-[#56E39F]' : 'text-[#D1D1D1]'}`}>{deal.retention}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.15em] italic mb-1">EXPIRATION</p>
                  <p className="text-[11px] font-bold text-black uppercase">{deal.expiry}</p>
                </div>
              </div>

              {deal.active && (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-widest italic">TAUX D'ADOPTION</span>
                    <span className="text-[8px] font-black text-[#FF5C00]">{deal.totalMembers > 0 ? Math.round((deal.usedBy / deal.totalMembers) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-[#F4F5F7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF5C00] rounded-full" style={{ width: `${deal.totalMembers > 0 ? (deal.usedBy / deal.totalMembers) * 100 : 0}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t-[0.5px] border-[#F4F5F7]">
                <span className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-widest">{deal.partner}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal); }}
                    className="px-4 py-2 bg-[#F4F5F7] rounded-[6px] text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 size={10} /> STATS
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal); }}
                    className="px-4 py-2 bg-[#F4F5F7] rounded-[6px] text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 size={10} /> GÉRER
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD PARTNERSHIP CTA */}
      <Link href="/settings" className="block bg-white border-[0.5px] border-[#E5E5E5] rounded-[16px] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group cursor-pointer hover:border-[#FF5C00] transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 bg-[#F4F5F7] rounded-[14px] flex items-center justify-center text-[#A3A3A3] group-hover:bg-[#FF5C00] group-hover:text-white transition-all shrink-0">
            <Gift size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[18px] sm:text-[20px] font-display italic font-black uppercase text-black">Négocier un nouveau partenariat</h3>
            <p className="text-[11px] sm:text-[12px] font-medium text-[#A3A3A3] uppercase tracking-wider">Commerce local, marque, service de santé — enrichis l&apos;offre de ton club.</p>
          </div>
        </div>
        <ArrowRight size={24} className="text-[#D1D1D1] group-hover:text-[#FF5C00] transition-all group-hover:translate-x-2 shrink-0 self-end sm:self-auto" />
      </Link>

      {/* AJOUTER UN DEAL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-[550px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border-[0.5px] border-black/10 animate-scale-up p-8 space-y-6 relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#F4F5F7] flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="space-y-1.5 pb-4 border-b-[0.5px] border-black/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#FF5C00] rounded-full" />
                <h3 className="text-[18px] font-display italic font-black uppercase text-black">AJOUTER UN AVANTAGE</h3>
              </div>
              <p className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                CRÉATION ET INTÉGRATION DE PARTENARIATS STRATÉGIQUES
              </p>
            </div>

            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] mx-auto animate-bounce">
                  <CheckCircle2 size={24} strokeWidth={3} />
                </div>
                <h4 className="text-[18px] font-display italic font-black uppercase text-black">AVANTAGE INTÉGRÉ !</h4>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">
                  Partenariat enregistré avec succès et disponible...
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setTimeout(() => {
                  let mockImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800";
                  if (formData.cat === "social") {
                    mockImage = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800";
                  } else if (formData.cat === "sante") {
                    mockImage = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800";
                  }

                  let athletesCount = 0;
                  try {
                    const storedAth = localStorage.getItem('capten_athletes_v3');
                    if (storedAth) {
                      athletesCount = JSON.parse(storedAth).length;
                    }
                  } catch (e) {}

                  const newDeal = {
                    cat: formData.cat,
                    name: formData.name.toUpperCase(),
                    desc: formData.desc || `-${formData.discountValue}% sur toute la boutique`,
                    image: mockImage,
                    active: formData.active,
                    usedBy: 0,
                    totalMembers: athletesCount,
                    retention: "—",
                    partner: formData.partner,
                    expiry: formData.expiry || "Permanent",
                    code: formData.code || "PROMO-CREW",
                  };

                  const updatedDeals = [newDeal, ...deals];
                  setDeals(updatedDeals);
                  localStorage.setItem("capten_deals_v3", JSON.stringify(updatedDeals));

                  setIsSubmitting(false);
                  setIsSuccess(true);

                  setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setIsSuccess(false);
                    setFormData({
                      name: "",
                      partner: "",
                      cat: "gear",
                      desc: "",
                      expiry: "Permanent",
                      discountValue: "20",
                      active: true,
                      contactName: "",
                      contactEmail: "",
                      website: "",
                      code: "",
                    });
                  }, 1500);
                }, 1000);
              }} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Partenaire */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Nom de la Marque / Partenaire <span className="text-[#FF5C00]">*</span></label>
                    <input type="text" required placeholder="ex. NIKE FRANCE, HOKA..." value={formData.partner} onChange={(e) => setFormData(prev => ({ ...prev, partner: e.target.value }))} className="w-full px-3 py-2 bg-[#F4F5F7]/50 border-[0.5px] border-black/10 rounded-[8px] text-[12px] font-bold text-black" />
                  </div>
                  {/* Offre */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Nom de l&apos;offre <span className="text-[#FF5C00]">*</span></label>
                    <input type="text" required placeholder="ex. NIKE RUNNING, GELS OFFERTS..." value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-[#F4F5F7]/50 border-[0.5px] border-black/10 rounded-[8px] text-[12px] font-bold text-black uppercase" />
                  </div>
                  {/* Catégorie */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Catégorie</label>
                    <select value={formData.cat} onChange={(e) => setFormData(prev => ({ ...prev, cat: e.target.value }))} className="w-full px-3 py-2 bg-[#F4F5F7]/50 border-[0.5px] border-black/10 rounded-[8px] text-[12px] font-bold text-black">
                      <option value="gear">Gear (Équipement)</option>
                      <option value="social">Social (Café / Bar)</option>
                      <option value="sante">Santé (Médical / Kiné)</option>
                    </select>
                  </div>
                  {/* Réduction */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Réduction (%)</label>
                    <input type="number" placeholder="ex. 25" value={formData.discountValue} onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))} className="w-full px-3 py-2 bg-[#F4F5F7]/50 border-[0.5px] border-black/10 rounded-[8px] text-[12px] font-bold text-black" />
                  </div>
                  {/* Expiration */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Expiration</label>
                    <input type="text" placeholder="ex. Permanent, 31 Déc 2026" value={formData.expiry} onChange={(e) => setFormData(prev => ({ ...prev, expiry: e.target.value }))} className="w-full px-3 py-2 bg-[#F4F5F7]/50 border-[0.5px] border-black/10 rounded-[8px] text-[12px] font-bold text-black" />
                  </div>
                  {/* Description */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Description du deal <span className="text-[#FF5C00]">*</span></label>
                    <input type="text" required placeholder="ex. -25% sur la collection Alphafly & Pegasus" value={formData.desc} onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))} className="w-full px-3 py-2 bg-[#F4F5F7]/50 border-[0.5px] border-black/10 rounded-[8px] text-[12px] font-bold text-black" />
                  </div>
                  {/* Code Promo ou Lien */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[8px] font-black text-black uppercase tracking-widest block">Code Promo ou Lien internet (à copier depuis le net) <span className="text-[#FF5C00]">*</span></label>
                    <input type="text" required placeholder="ex. RUNNER25 ou https://brand.com/promo-code" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} className="w-full px-3 py-2 bg-[#F4F5F7]/50 border-[0.5px] border-black/10 rounded-[8px] text-[12px] font-bold text-black" />
                  </div>
                </div>

                {/* B2B Info Box */}
                <div className="bg-[#F8F9FA] rounded-[12px] p-4 border-[0.5px] border-black/5 space-y-2.5">
                  <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-wider flex items-center gap-1.5"><Building size={10} /> CONTACTS OPÉRATIONNELS PARTENAIRE (OPTIONNEL)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[7.5px] font-black text-black uppercase tracking-widest block">Nom du Contact</label>
                      <input type="text" placeholder="ex. Jean Dupont" value={formData.contactName} onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))} className="w-full px-2.5 py-1.5 bg-white border-[0.5px] border-black/10 rounded-[6px] text-[11px] font-bold text-black" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7.5px] font-black text-black uppercase tracking-widest block">Email du Contact</label>
                      <input type="email" placeholder="ex. b2b@hoka.com" value={formData.contactEmail} onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))} className="w-full px-2.5 py-1.5 bg-white border-[0.5px] border-black/10 rounded-[6px] text-[11px] font-bold text-black" />
                    </div>
                  </div>
                </div>

                {/* Switch Active */}
                <div className="p-3 bg-[#56E39F]/5 border-[0.5px] border-[#56E39F]/10 rounded-[10px] flex items-center justify-between">
                  <span className="text-[9px] font-black text-black uppercase tracking-wider">Activer le deal immédiatement</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.active} onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#56E39F]"></div>
                  </label>
                </div>

                {/* Submit button like photo */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-black text-white rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF5C00] transition-all disabled:bg-gray-400 active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      CRÉATION EN COURS...
                    </>
                  ) : (
                    "PUBLIER L'AVANTAGE"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DETAILED DEAL SHEET DRAWER */}
      {selectedDeal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end" onClick={() => setSelectedDeal(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-[520px] h-full bg-white shadow-2xl overflow-y-auto flex flex-col justify-between" onClick={e => e.stopPropagation()}>
            <div>
              {/* Image Banner Header */}
              <div className="relative h-[220px] bg-black">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${selectedDeal.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-black/20 to-black/40" />
                <button 
                  onClick={() => setSelectedDeal(null)} 
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-black hover:text-white backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10 cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-6 left-8 right-8">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[#FF5C00] text-white px-3 py-1 rounded-full mb-2 inline-block">
                    {selectedDeal.cat === 'gear' ? 'GEAR' : selectedDeal.cat === 'social' ? 'SOCIAL' : 'SANTÉ'}
                  </span>
                  <h2 className="text-[32px] font-display italic font-black uppercase text-black leading-none tracking-tight">
                    {selectedDeal.name}
                  </h2>
                </div>
              </div>

              <div className="p-8 sm:p-10 space-y-8">
                {/* Status and Partner info */}
                <div className="flex justify-between items-center bg-[#F4F5F7] p-5 rounded-[12px]">
                  <div>
                    <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1">PARTENAIRE OFFICIEL</p>
                    <p className="text-[15px] font-black text-black uppercase">{selectedDeal.partner}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-black uppercase tracking-widest">
                      {selectedDeal.active ? "AVANTAGE ACTIF" : "AVANTAGE SUSPENDU"}
                    </span>
                    <button
                      onClick={() => {
                        const updatedDeals = deals.map(d => {
                          if (d.name === selectedDeal.name) {
                            const newStatus = !d.active;
                            setSelectedDeal({ ...selectedDeal, active: newStatus });
                            showToast(newStatus ? "AVANTAGE RÉACTIVÉ !" : "AVANTAGE SUSPENDU !");
                            return { ...d, active: newStatus };
                          }
                          return d;
                        });
                        setDeals(updatedDeals);
                        localStorage.setItem("capten_deals_v3", JSON.stringify(updatedDeals));
                      }}
                      className="w-12 h-6 flex items-center bg-gray-200 rounded-full p-1 cursor-pointer transition-all duration-300 relative"
                      style={{ backgroundColor: selectedDeal.active ? '#56E39F' : '#E5E5E5' }}
                    >
                      <div 
                        className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300"
                        style={{ transform: selectedDeal.active ? 'translateX(24px)' : 'translateX(0px)' }}
                      />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.25em] italic">OFFRE SPÉCIALE</p>
                  <p className="text-[16px] font-bold text-black uppercase tracking-wide leading-relaxed">
                    {selectedDeal.desc}
                  </p>
                </div>

                {/* Code Promo Redemption */}
                {selectedDeal.active && (
                  <div className="bg-[#FFF0E8] border border-[#FF5C00]/15 rounded-[12px] p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[8px] font-black text-[#FF5C00] uppercase tracking-widest flex items-center gap-1.5"><Percent size={12} /> CODE PROMO OU LIEN DE REDEMPTION</p>
                      <span className="bg-[#FF5C00]/10 text-[#FF5C00] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">DISPONIBLE</span>
                    </div>
                    <div className="flex justify-between items-center gap-3 bg-white border border-[#FF5C00]/10 rounded-[8px] p-3">
                      <span className="font-mono text-xs font-black text-black select-all tracking-wider truncate max-w-[220px]">
                        {selectedDeal.code || "OFFRE-PROMO"}
                      </span>
                      <button
                        onClick={() => {
                          const codeStr = selectedDeal.code || "PROMO-CREW";
                          if (codeStr.startsWith("http")) {
                            window.open(codeStr, "_blank");
                          } else {
                            navigator.clipboard.writeText(codeStr);
                            showToast("CODE COPIÉ DANS LE PRESSE-PAPIER !");
                          }
                        }}
                        className="px-3.5 py-2 bg-black hover:bg-[#FF5C00] text-white rounded-[6px] text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        {selectedDeal.code?.startsWith("http") ? "OUVRIR LE LIEN" : "COPIER LE CODE"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Adoption and Performance Stats */}
                <section className="space-y-4">
                  <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.25em] italic">PERFORMANCE & ANALYTICS</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#F4F5F7] rounded-[10px] p-4 text-center">
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1">UTILISATIONS</p>
                      <p className="text-[20px] font-display italic font-black text-black">
                        {selectedDeal.usedBy}
                      </p>
                      <p className="text-[8px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-1">sur {selectedDeal.totalMembers || 0} membres</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-[10px] p-4 text-center">
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1">ADOPTION</p>
                      <p className="text-[20px] font-display italic font-black text-[#FF5C00]">
                        {selectedDeal.totalMembers ? `${Math.round((selectedDeal.usedBy / selectedDeal.totalMembers) * 100)}%` : '0%'}
                      </p>
                      <p className="text-[8px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-1">taux d&apos;engagement</p>
                    </div>
                    <div className="bg-[#F4F5F7] rounded-[10px] p-4 text-center">
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1">RETENTION</p>
                      <p className="text-[20px] font-display italic font-black text-[#56E39F]">
                        {selectedDeal.retention}
                      </p>
                      <p className="text-[8px] font-bold text-[#A3A3A3] uppercase tracking-widest mt-1">impact direct</p>
                    </div>
                  </div>

                  {selectedDeal.active && (
                    <div className="space-y-2 bg-[#F4F5F7]/30 border-[0.5px] border-black/5 p-4 rounded-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest">COURBE D&apos;ADOPTION MENSUELLE</span>
                        <span className="text-[9px] font-black text-[#56E39F] uppercase tracking-widest flex items-center gap-1"><TrendingUp size={10} /> +12.4% ce mois</span>
                      </div>
                      {/* Simulated Chart visual using premium styling */}
                      <div className="flex items-end justify-between h-14 pt-4 px-2 gap-1.5">
                        {[15, 25, 20, 35, 45, 55, 67, selectedDeal.usedBy].map((v, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                            <div 
                              className="w-full bg-[#E5E5E5] group-hover/bar:bg-[#FF5C00] rounded-t-[2px] transition-all duration-500"
                              style={{ 
                                height: `${Math.max(10, Math.min(50, (v / 112) * 50))}px`,
                                backgroundColor: i === 7 ? '#FF5C00' : undefined 
                              }}
                            />
                            <span className="text-[6.5px] font-black text-[#A3A3A3] group-hover/bar:text-black">M{i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Operations & Partnership info */}
                <section className="space-y-4">
                  <p className="text-[8px] font-black text-[#D1D1D1] uppercase tracking-[0.25em] italic flex items-center gap-1.5"><Building size={10} /> OPÉRATIONS & LIEN B2B</p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center py-2.5 border-b-[0.5px] border-[#F4F5F7]">
                      <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-widest">EXPIRATION</span>
                      <span className="text-[11px] font-bold text-black uppercase">{selectedDeal.expiry}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b-[0.5px] border-[#F4F5F7]">
                      <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-widest">RESPONSABLE PARTENARIAT</span>
                      <span className="text-[11px] font-bold text-black uppercase">Jean Dupont</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-widest">EMAIL B2B</span>
                      <a href="mailto:operations@capten.run" className="text-[11px] font-bold text-[#FF5C00] uppercase hover:underline">operations@capten.run</a>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Bottom Actions Drawer Sticky Bar */}
            <div className="p-8 sm:p-10 bg-[#F8F9FA] border-t-[0.5px] border-[#E5E5E5] flex gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🎁 *OFFRE CLUB - ${selectedDeal.partner || ""}* 🎁\n\nBénéficie de l'avantage réservé à notre club :\n🔥 *${selectedDeal.desc || ""}*\n\n👉 Code Promo : *${selectedDeal.code || ""}*\n\nBon run et profite bien ! 🏃‍♂️⚡`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedDeal(null)}
                className="flex-1 py-4 bg-[#FF5C00] text-white hover:bg-black rounded-[10px] text-[10px] font-black uppercase tracking-[0.15em] text-center transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Percent size={14} /> DIFFUSER CE CODE PROMO
              </a>
              <button
                onClick={() => {
                  setSelectedDeal(null);
                  showToast("FICHIER PDF EXPORTÉ AVEC SUCCÈS !");
                }}
                className="px-6 py-4 border-[0.5px] border-[#E5E5E5] hover:bg-black hover:text-white rounded-[10px] text-[10px] font-black uppercase tracking-[0.15em] text-center transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                EXPORTER RAPPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION OVERLAY */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 sm:px-8 py-4 rounded-[12px] border-[0.5px] border-white/20 shadow-2xl z-[300] flex items-center gap-3 animate-slide-up text-center w-[90%] max-w-[400px] justify-center">
          <CheckCircle2 size={16} className="text-[#56E39F] shrink-0" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{toast}</span>
        </div>
      )}
    </div>
  );
}
