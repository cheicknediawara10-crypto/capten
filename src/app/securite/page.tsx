'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Phone, Users, FileText, ArrowRight, Siren } from 'lucide-react';

const DEFAULT_SOS = '17 (Police), 18 (Pompiers), 112 (Urgences EU)';

export default function SecuritePage() {
  const { club } = useAuth();
  const [sosNumbers, setSosNumbers] = useState(DEFAULT_SOS);
  const [safetyContact, setSafetyContact] = useState<string | null>(null);

  useEffect(() => {
    const b = (club?.branding || {}) as any;
    setSosNumbers(b.sos_numbers || localStorage.getItem('capten_sos_numbers') || DEFAULT_SOS);
    setSafetyContact(b.safety_contact || localStorage.getItem('capten_safety_contact') || null);
  }, [club]);

  const emergencyLines = sosNumbers.split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
          Protection
        </h1>
        <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans mt-1">
          Tes réflexes de sécurité et les contacts d'urgence de ton crew.
        </p>
      </div>

      {/* Numéros d'urgence — panneau d'alerte sombre (accent constant clair/dark) */}
      <div className="rounded-3xl p-7" style={{ background: 'linear-gradient(160deg, #1C1B18, #121110)' }}>
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-9 h-9 rounded-xl bg-[#FF5C00] flex items-center justify-center">
            <Siren size={18} className="text-white" />
          </span>
          <h2 className="text-[13px] font-black uppercase tracking-widest text-white">Numéros d'urgence</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {emergencyLines.map((line, i) => {
            const num = line.match(/\d{2,3}/)?.[0] || '';
            return (
              <a key={i} href={num ? `tel:${num}` : undefined}
                className="flex items-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-2xl px-4 py-3 transition-colors">
                <Phone size={15} className="text-[#FF5C00] shrink-0" />
                <span className="text-[13px] font-semibold text-white leading-snug">{line}</span>
              </a>
            );
          })}
        </div>
        {safetyContact && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Contact sécurité du crew</p>
            <p className="text-[14px] font-semibold text-white">{safetyContact}</p>
          </div>
        )}
      </div>

      {/* Réflexes protection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Users size={18} />, title: 'Fiches ICE', desc: 'Contact prioritaire et infos médicales, en 1 clic.', href: '/dashboard/members', cta: 'Voir les membres' },
          { icon: <FileText size={18} />, title: 'Décharges signées', desc: 'Chaque membre signe une décharge horodatée — preuve légale.', href: '/dashboard/members', cta: 'Vérifier' },
          { icon: <ShieldCheck size={18} />, title: 'Check-in au RDV', desc: 'Valide qui est présent au départ, personne derrière.', href: '/dashboard/events', cta: 'Les runs' },
        ].map((c) => (
          <div key={c.title} className="bg-[var(--app-surface)] rounded-3xl border border-[color:var(--app-border)] p-5 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-[var(--app-accent-soft)] flex items-center justify-center text-[#FF5C00] mb-3">
              {c.icon}
            </div>
            <h3 className="text-[15px] font-black uppercase tracking-tight text-[color:var(--app-text)] mb-1">{c.title}</h3>
            <p className="text-[12px] text-[color:var(--app-text-muted)] leading-snug flex-1">{c.desc}</p>
            <Link href={c.href} className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-[#FF5C00] hover:underline">
              {c.cta} <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      {/* Réglage */}
      <div className="bg-[var(--app-surface-2)] rounded-3xl px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-[12px] text-[color:var(--app-text-muted)] leading-snug">
          Personnalise les numéros d'urgence et le contact sécurité de ton crew dans les réglages.
        </p>
        <Link href="/settings"
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--app-surface)] border border-[color:var(--app-border)] text-[12px] font-bold text-[color:var(--app-text)] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors">
          Réglages <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
