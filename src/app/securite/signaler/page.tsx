'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Send, CheckCircle2, ShieldCheck, EyeOff, Eye, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PublicIncidentReportPage() {
  const [type, setType] = useState('Comportement Toxique');
  const [involved, setInvolved] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('capten_logo');
    if (savedLogo) setLogoUrl(savedLogo);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Veuillez décrire brièvement les faits.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          priority: 'MOYENNE',
          anonymous,
          reporter_name: anonymous ? null : reporterName.trim() || 'Non spécifié',
          reporter_phone: anonymous ? null : reporterPhone.trim() || 'Non spécifié',
          involved: involved.trim() || 'Non spécifié',
          details: description
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        // Reset form
        setType('Comportement Toxique');
        setInvolved('');
        setDescription('');
        setAnonymous(true);
        setReporterName('');
        setReporterPhone('');
      } else {
        setErrorMsg(data.error || "Une erreur s'est produite lors de la transmission du signalement.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur réseau lors de la communication avec le serveur.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing && !success) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 size={32} className="text-[#FF0000] animate-spin mb-4" />
        <p className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Transmission du signalement sécurisé...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-black font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-form-single bg-white border border-[#E5E5E5] rounded-card-outer shadow-2xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
        {/* Top decorative line for security (Red theme) */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#FF0000] to-transparent" />

        {success ? (
          <div className="text-center space-y-5 py-6 animate-scale-up" id="success-view">
            <div className="w-16 h-16 bg-[#56E39F]/10 rounded-full flex items-center justify-center text-[#56E39F] mx-auto animate-bounce">
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h1 className="text-[24px] font-display italic font-black uppercase tracking-tight text-black">SIGNALEMENT TRANSMIS</h1>
              <p className="text-[11px] font-bold text-neutral-450 uppercase tracking-wider">
                Votre déclaration a été enregistrée de manière confidentielle.
              </p>
            </div>
            <div className="bg-[#F8F9FA] rounded-card-inner p-4 border border-black/5 text-xs text-neutral-600 font-medium leading-relaxed">
              « Nous vous remercions pour votre courage et votre civisme. L&apos;équipe d&apos;encadrement du club (Captain) a été notifiée immédiatement et va mener une enquête interne. Votre anonymat et votre sécurité sont protégés par le protocole CAPTEN Safe-Run. »
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="btn-secondary mt-4 hover:bg-[#FF0000] hover:text-white inline-flex"
            >
              Nouveau signalement
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo Club" className="h-16 w-auto object-contain mb-2 max-w-[120px] rounded-md shadow-sm" />
              ) : (
                <div className="w-12 h-12 bg-[#FF0000]/5 rounded-control flex items-center justify-center text-[#FF0000] mb-2">
                  <ShieldAlert size={24} />
                </div>
              )}
              <h1 className="text-[24px] sm:text-[26px] font-display italic font-black uppercase text-black leading-none tracking-tight">
                SIGNALEMENT DE SÉCURITÉ
              </h1>
              <p className="text-[10px] font-mono font-black uppercase text-[#FF0000] tracking-widest">
                Safe-Run Protocol · 100% Confidentiel
              </p>
            </div>

            <p className="text-xs text-neutral-500 font-medium text-center leading-relaxed">
              Signalez un comportement inapproprié (harcèlement, toxicité, malaise) ou un incident de sécurité. Ce formulaire est transmis directement au Captain du club.
            </p>

            <div className="bg-[#FF0000]/5 border border-[#FF0000]/15 rounded-card-inner p-4 text-[10.5px] leading-relaxed text-neutral-600 font-medium">
              🛡️ <strong>Charte de respect &amp; sécurité :</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-black font-bold uppercase tracking-wide text-[8.5px] font-mono">
                <li>Zéro tolérance pour le harcèlement sexiste ou moral.</li>
                <li>Respect absolu du niveau de chaque coureur.</li>
                <li>Obligation de secours en cas de malaise sur un run.</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-card-inner p-3 text-rose-800 text-[10px] font-bold" id="error-view">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left" id="incident-report-form">
              {/* Type d'incident */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-black uppercase tracking-widest block" htmlFor="incident-type">Nature du signalement</label>
                <select 
                  id="incident-type"
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="brutalist-input"
                >
                  <option value="Comportement Toxique">Comportement Toxique / Harcèlement</option>
                  <option value="Malaise Groupe">Malaise Groupe / Exclusion</option>
                  <option value="Harcèlement Sexiste/Moral">Harcèlement Sexiste/Moral</option>
                  <option value="Non-respect des Consignes">Non-respect des Consignes de Sécurité</option>
                  <option value="Autre Incident">Autre Incident de Terrain</option>
                </select>
              </div>

              {/* Anonymity Toggle */}
              <div className="bg-white/50 p-4 rounded-card-inner flex items-center justify-between border border-black/5">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-black uppercase">Soumettre anonymement</p>
                  <p className="text-[9px] font-medium text-neutral-400 uppercase">Votre identité ne sera pas révélée dans le ticket.</p>
                </div>
                <button
                  type="button"
                  id="anonymity-toggle"
                  onClick={() => setAnonymous(!anonymous)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none flex items-center cursor-pointer ${
                    anonymous ? 'bg-[#FF0000]' : 'bg-[#D1D1D1]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    anonymous ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Reporter Info (Conditional) */}
              {!anonymous && (
                <div className="space-y-4 p-4 border border-black/5 rounded-card-inner bg-white/50 animate-fade-in">
                  <span className="text-[8px] font-black text-[#FF0000] uppercase tracking-widest block">Vos coordonnées (Restent confidentielles)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-black uppercase tracking-widest block" htmlFor="reporter-name">Nom / Prénom</label>
                      <input 
                        type="text"
                        id="reporter-name"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="EX: SOPHIE MARTIN"
                        className="brutalist-input uppercase bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-black uppercase tracking-widest block" htmlFor="reporter-phone">Téléphone</label>
                      <input 
                        type="text"
                        id="reporter-phone"
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        placeholder="EX: 06 12 34 56 78"
                        className="brutalist-input bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Person involved */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-black uppercase tracking-widest block" htmlFor="person-involved">Nom de la personne concernée (facultatif)</label>
                <input 
                  type="text"
                  id="person-involved"
                  placeholder="Ex: Jean Dupont (laisser vide si inconnu)"
                  value={involved}
                  onChange={(e) => setInvolved(e.target.value)}
                  className="brutalist-input"
                />
              </div>

              {/* Description facts */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-black uppercase tracking-widest block" htmlFor="facts-details">Description précise des faits</label>
                <textarea
                  id="facts-details"
                  rows={5}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Expliquez ce qu'il s'est passé (date, heure, lieu, paroles prononcées, etc.)"
                  className="w-full bg-[#F4F5F7] border border-black/10 rounded-control px-4 py-3 text-[12px] font-bold text-black placeholder:text-neutral-450 focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-report-btn"
                className="btn-lg-cta hover:bg-[#FF0000]"
              >
                Transmettre mon signalement <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}

        {/* Footer info */}
        <footer className="pt-2 border-t border-[#F4F4F5] text-center flex items-center justify-center gap-1.5 text-[8.5px] font-mono text-neutral-450">
          <ShieldCheck size={14} className="text-[#56E39F]" />
          Formulaire chiffré SSL · Protection Safe-Run CAPTEN
        </footer>
      </div>
    </div>
  );
}
