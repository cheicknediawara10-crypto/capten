'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, MapPin, BarChart3, MessageSquare, ArrowRight, Plus,
  Calendar, Copy, Check, ShieldCheck, CreditCard, Loader2,
  CheckCircle2, Circle, X, Rocket, Settings2,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getAppUrl } from '@/lib/domain';
import { getCommunityLabels } from '@/lib/community-labels';

interface UpcomingEvent {
  id: string;
  title: string;
  event_date: string;
  meeting_point_address: string | null;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function DashboardPage() {
  const { user, club, isMock } = useAuth();
  const L = getCommunityLabels(club?.community_type, club?.community_type_custom);

  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [obDismissed, setObDismissed] = useState(true);

  useEffect(() => {
    setObDismissed(localStorage.getItem('capten_onboarding_done') === '1');
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase || !club || isMock) { setLoading(false); return; }

      const [
        { data: membreRows },
        { data: clubRow },
        { data: events },
        { count: sessions },
      ] = await Promise.all([
        supabase.from('membre_club').select('membre_id').eq('club_id', club.id).eq('is_active', true),
        supabase.from('clubs').select('slug').eq('id', club.id).single(),
        supabase.from('events').select('id, title, event_date, meeting_point_address')
          .eq('club_id', club.id).eq('status', 'published')
          .gte('event_date', new Date().toISOString()).order('event_date').limit(5),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('club_id', club.id),
      ]);

      const membreIds = (membreRows || []).map((m: any) => m.membre_id).filter(Boolean);
      setMemberCount(membreIds.length);
      setSlug((clubRow as any)?.slug ?? null);
      setUpcoming((events as UpcomingEvent[]) || []);
      setSessionCount(sessions || 0);

      // Check-ins validés des membres du crew
      if (membreIds.length) {
        const { count: ci } = await supabase.from('membre_checkins')
          .select('*', { count: 'exact', head: true }).in('membre_id', membreIds).eq('is_valid', true);
        setCheckinCount(ci || 0);
      }
      setLoading(false);
    }
    load();
  }, [club, isMock]);

  const firstName = (user?.email?.split('@')[0] || 'Captain').replace(/[^a-zA-ZÀ-ÿ]/g, ' ').trim().split(' ')[0];
  const joinUrl = slug ? `${getAppUrl()}/join/${slug}` : null;
  const isPro = club?.plan === 'pro' || club?.stripe_subscription_status === 'active';

  const copyJoin = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // ── Onboarding "Lance ton crew" (guide vers l'Aha Moment) ──
  const DEFAULT_NAMES = ['MON RUN CLUB', 'Mon Run Club', 'Mon crew', 'Mon Crew'];
  const steps = [
    {
      key: 'perso',
      done: !!club?.name && !DEFAULT_NAMES.includes(club.name),
      title: 'Personnalise ton crew',
      desc: 'Nom, logo, ville — donne-lui une identité.',
      href: '/dashboard/club', cta: 'Éditer', icon: <Settings2 size={15} />,
    },
    {
      key: 'share',
      done: memberCount > 0,
      title: 'Partage ton lien d’inscription',
      desc: 'Tes coureurs rejoignent en 30 s, sans app à installer.',
      action: 'copy' as const, icon: <Users size={15} />,
    },
    {
      key: 'run',
      done: sessionCount > 0,
      title: 'Crée ton premier run',
      desc: 'Planifie, publie, et suis les présences en direct.',
      href: '/dashboard/events/new', cta: 'Créer', icon: <Calendar size={15} />,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const showOnboarding = !loading && !isMock && !obDismissed && doneCount < steps.length;

  const dismissOnboarding = () => {
    localStorage.setItem('capten_onboarding_done', '1');
    setObDismissed(true);
  };

  const STATS = [
    { label: 'Membres', value: memberCount, icon: <Users size={18} />, href: '/dashboard/members' },
    { label: L.session_plural_cap, value: sessionCount, icon: <Calendar size={18} />, href: '/dashboard/events' },
    { label: 'Check-ins', value: checkinCount, icon: <Check size={18} />, href: '/dashboard/stats' },
  ];

  const ACTIONS = [
    { label: `Créer ${L.session_single}`, icon: <Plus size={16} />, href: '/dashboard/events/new', primary: true },
    { label: 'Voir les membres', icon: <Users size={16} />, href: '/dashboard/members' },
    { label: 'Les Spots du Crew', icon: <MapPin size={16} />, href: '/dashboard/spots' },
    { label: 'Messages', icon: <MessageSquare size={16} />, href: '/messages' },
    { label: 'Statistiques', icon: <BarChart3 size={16} />, href: '/dashboard/stats' },
    { label: 'Protection', icon: <ShieldCheck size={16} />, href: '/securite' },
  ];

  const card = "bg-[var(--app-surface)] border border-[color:var(--app-border)]";

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans">Salut {firstName} 👋</p>
          <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter mt-1">
            {club?.name || 'Mon crew'}
          </h1>
        </div>
        <span className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
          isPro
            ? 'bg-[var(--app-accent-soft)] text-[#FF5C00]'
            : 'bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)]'
        }`}>
          <CreditCard size={12} />
          {isPro ? 'Captain Pro' : 'Découverte'}
        </span>
      </div>

      {/* Onboarding — Lance ton crew */}
      {showOnboarding && (
        <div className="rounded-2xl border border-[#FF5C00]/25 bg-[var(--app-accent-soft)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 pt-5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#FF5C00] flex items-center justify-center text-white shrink-0">
                <Rocket size={17} />
              </span>
              <div>
                <p className="text-[15px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none">Lance ton crew</p>
                <p className="text-[12px] text-[color:var(--app-text-muted)] mt-1">{doneCount}/{steps.length} étapes — tu y es presque.</p>
              </div>
            </div>
            <button onClick={dismissOnboarding} title="Masquer"
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[color:var(--app-text-muted)] hover:bg-[var(--app-hover)] transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Barre de progression */}
          <div className="px-5 mt-3">
            <div className="h-1.5 rounded-full bg-[color:var(--app-border)] overflow-hidden">
              <div className="h-full rounded-full bg-[#FF5C00] transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
            </div>
          </div>

          {/* Étapes */}
          <div className="p-3 sm:p-4 space-y-2">
            {steps.map((s) => (
              <div key={s.key}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 ${s.done ? 'opacity-60' : 'bg-[var(--app-surface)] border border-[color:var(--app-border)]'}`}>
                {s.done
                  ? <CheckCircle2 size={20} className="text-[#22C55E] shrink-0" />
                  : <Circle size={20} className="text-[color:var(--app-text-muted)] shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold text-[color:var(--app-text)] ${s.done ? 'line-through' : ''}`}>{s.title}</p>
                  {!s.done && <p className="text-[11px] text-[color:var(--app-text-muted)] mt-0.5">{s.desc}</p>}
                </div>
                {!s.done && s.action === 'copy' && joinUrl && (
                  <button onClick={copyJoin}
                    className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#FF5C00] text-white text-[12px] font-semibold hover:bg-[#E04B00] transition-colors">
                    {copied ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier le lien</>}
                  </button>
                )}
                {!s.done && s.href && (
                  <Link href={s.href}
                    className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#FF5C00] text-white text-[12px] font-semibold hover:bg-[#E04B00] transition-colors">
                    {s.cta} <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lien d'inscription public */}
      {!showOnboarding && joinUrl && (
        <div className={`${card} rounded-2xl px-5 py-4 flex items-center justify-between gap-4`}>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--app-text-muted)] mb-1">Lien d'inscription du crew</p>
            <p className="text-[13px] font-medium font-mono text-[color:var(--app-text)] truncate">{joinUrl}</p>
          </div>
          <button onClick={copyJoin}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-[color:var(--app-border)] text-[12px] font-semibold text-[color:var(--app-text)] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors">
            {copied ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
          </button>
        </div>
      )}

      {/* Stats premium — anneau de croissance + métriques (façon Whoop/Runna) */}
      {(() => {
        const goal = isPro ? 50 : 20;
        const pct = goal > 0 ? Math.min(memberCount / goal, 1) : 0;
        const R = 62, CIRC = 2 * Math.PI * R;
        const METRICS = [
          { label: 'Runs', value: sessionCount, href: '/dashboard/events', icon: <Calendar size={16} /> },
          { label: 'Check-ins', value: checkinCount, href: '/dashboard/stats', icon: <Check size={16} /> },
          { label: isPro ? 'Membres' : 'Places libres', value: isPro ? '∞' : Math.max(goal - memberCount, 0), href: '/dashboard/members', icon: <Users size={16} /> },
        ];
        return (
          <div className={`${card} rounded-2xl p-6 sm:p-7`}>
            <div className="flex flex-col sm:flex-row items-center gap-7 sm:gap-9">
              {/* Anneau */}
              <Link href="/dashboard/members" className="relative shrink-0 group" style={{ width: 152, height: 152 }}>
                <svg width="152" height="152" viewBox="0 0 152 152" className="-rotate-90">
                  <circle cx="76" cy="76" r={R} fill="none" stroke="var(--app-surface-2)" strokeWidth="13" />
                  <circle
                    cx="76" cy="76" r={R} fill="none" stroke="#FF5C00" strokeWidth="13" strokeLinecap="round"
                    strokeDasharray={CIRC} strokeDashoffset={loading ? CIRC : CIRC * (1 - pct)}
                    style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[40px] font-display italic font-black text-[color:var(--app-text)] leading-none">{loading ? '—' : memberCount}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[color:var(--app-text-muted)] mt-1.5">sur {goal} membres</span>
                </div>
              </Link>

              {/* Séparateur */}
              <div className="hidden sm:block w-px self-stretch bg-[color:var(--app-border)]" />

              {/* Métriques */}
              <div className="flex-1 w-full grid grid-cols-3 gap-4 sm:gap-6">
                {METRICS.map((m) => (
                  <Link key={m.label} href={m.href} className="group flex flex-col items-center sm:items-start">
                    <span className="w-9 h-9 rounded-xl bg-[var(--app-accent-soft)] flex items-center justify-center text-[#FF5C00] mb-3">
                      {m.icon}
                    </span>
                    <span className="text-[30px] font-display italic font-black text-[color:var(--app-text)] leading-none group-hover:text-[#FF5C00] transition-colors">
                      {loading ? '—' : m.value}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--app-text-muted)] mt-1.5 text-center sm:text-left">{m.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Prochains runs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[color:var(--app-text-muted)]">Tes {L.session_plural} à venir</h2>
          <Link href="/dashboard/events" className="text-[12px] font-semibold text-[#FF5C00] hover:underline inline-flex items-center gap-1">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        <div className={`${card} rounded-2xl overflow-hidden`}>
          {loading ? (
            <div className="flex items-center justify-center py-14"><Loader2 className="animate-spin text-[#FF5C00]" size={22} /></div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--app-surface-2)] flex items-center justify-center">
                <Calendar size={22} className="text-[color:var(--app-text-muted)]" />
              </div>
              <p className="text-[13px] text-[color:var(--app-text-muted)]">Pas de {L.session_plural} à venir.</p>
              <Link href="/dashboard/events/new"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#FF5C00] text-white text-[12px] font-semibold uppercase tracking-wider hover:bg-[#E04B00] transition-colors">
                <Plus size={14} /> Créer {L.session_single}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[color:var(--app-border)]">
              {upcoming.map((ev) => (
                <Link key={ev.id} href={`/dashboard/events/${ev.id}`} className="flex items-center gap-4 p-4 hover:bg-[var(--app-hover)] transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-[var(--app-surface-2)] flex items-center justify-center text-[#FF5C00] shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[color:var(--app-text)] truncate">{ev.title}</p>
                    <p className="text-[11px] text-[color:var(--app-text-muted)] mt-0.5">{fmtDate(ev.event_date)}</p>
                  </div>
                  {ev.meeting_point_address && (
                    <span className="hidden sm:flex items-center gap-1 text-[11px] text-[color:var(--app-text-muted)] max-w-[180px] truncate">
                      <MapPin size={10} /> {ev.meeting_point_address}
                    </span>
                  )}
                  <ArrowRight size={15} className="text-[color:var(--app-text-muted)] shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accès rapide */}
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[color:var(--app-text-muted)] mb-3">Accès rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACTIONS.map((a) => (
            <Link key={a.label} href={a.href}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-[13px] font-semibold transition-colors ${
                a.primary
                  ? 'bg-[#FF5C00] text-white hover:bg-[#E04B00]'
                  : `${card} text-[color:var(--app-text)] hover:border-[#FF5C00]/40`
              }`}>
              <span className={a.primary ? 'text-white' : 'text-[#FF5C00]'}>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
