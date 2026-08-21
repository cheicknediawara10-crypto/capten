'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, MapPin, BarChart3, MessageSquare, ArrowRight, Plus, Calendar,
  Copy, Check, ShieldCheck, Clock, ChevronRight, Rocket, Settings2,
  CheckCircle2, Circle, X, TrendingUp, Flame,
} from 'lucide-react';
import { getDashboardData } from './actions';
import { useAuth } from '@/context/AuthContext';
import { getAppUrl } from '@/lib/domain';
import { getCommunityLabels } from '@/lib/community-labels';
import { hasProAccess, isOnTrial, trialDaysLeft } from '@/lib/plan-access';
import PushNotificationPrompt from '@/components/push/PushNotificationPrompt';

interface UpcomingEvent {
  id: string;
  title: string;
  event_date: string;
  meeting_point_address: string | null;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function Ring({ pct, size = 150, stroke = 13, color = '#FF5C00', children }: {
  pct: number; size?: number; stroke?: number; color?: string; children: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--app-surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(pct, 1)))}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isMock } = useAuth();
  const [club, setClub] = useState<any>(null);
  const L = getCommunityLabels(club?.community_type, club?.community_type_custom);

  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);
  const [weekly, setWeekly] = useState<number[]>(Array(8).fill(0));
  const [regulars, setRegulars] = useState(0);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [obDismissed, setObDismissed] = useState(true);

  useEffect(() => { setObDismissed(localStorage.getItem('capten_onboarding_done') === '1'); }, []);

  useEffect(() => {
    if (isMock) { setLoading(false); return; }
    (async () => {
      const res = await getDashboardData();
      if (!("error" in res)) {
        setClub(res.club);
        setMemberCount(res.memberCount);
        setSlug(res.slug);
        setUpcoming((res.upcoming as UpcomingEvent[]) || []);
        setSessionCount(res.sessionCount);
        setCheckinCount(res.checkinCount);
        setWeekly(res.weekly);
        setRegulars(res.regulars);
      }
      setLoading(false);
    })();
  }, [isMock]);

  const firstName = (user?.email?.split('@')[0] || 'Captain').replace(/[^a-zA-ZÀ-ÿ]/g, ' ').trim().split(' ')[0];
  const joinUrl = slug ? `${getAppUrl()}/join/${slug}` : null;
  const isPro = hasProAccess(club);
  const onTrial = isOnTrial(club);
  const daysLeft = trialDaysLeft(club);
  const goal = Math.max(50, Math.ceil(Math.max(memberCount, 1) / 50) * 50);
  const maxWeek = Math.max(...weekly, 1);
  const assiduite = memberCount > 0 ? regulars / memberCount : 0;
  const nextRun = upcoming[0] || null;

  const copyJoin = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Onboarding
  const DEFAULT_NAMES = ['MON RUN CLUB', 'Mon Run Club', 'Mon crew', 'Mon Crew'];
  const steps = [
    { key: 'perso', done: !!club?.name && !DEFAULT_NAMES.includes(club.name), title: 'Personnalise ton crew', desc: 'Nom, logo, ville — donne-lui une identité.', href: '/dashboard/club', cta: 'Éditer', icon: <Settings2 size={15} /> },
    { key: 'share', done: memberCount > 0, title: 'Partage ton lien d’inscription', desc: 'Tes coureurs rejoignent en 30 s, sans app à installer.', action: 'copy' as const, icon: <Users size={15} /> },
    { key: 'run', done: sessionCount > 0, title: 'Crée ton premier run', desc: 'Planifie, publie, et suis les présences en direct.', href: '/dashboard/events/new', cta: 'Créer', icon: <Calendar size={15} /> },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const showOnboarding = !loading && !isMock && !obDismissed && doneCount < steps.length;
  const dismissOnboarding = () => { localStorage.setItem('capten_onboarding_done', '1'); setObDismissed(true); };

  const card = "bg-[var(--app-surface)] border border-[color:var(--app-border)]";

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-1">
        <div>
          <p className="text-[13px] text-[color:var(--app-text-muted)]">Salut {firstName} 👋</p>
          <h1 className="text-[30px] sm:text-[42px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter mt-1">
            {club?.name || 'Mon crew'}
          </h1>
        </div>
        <Link href="/plan" className={`inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
          isPro ? 'bg-[var(--app-accent-soft)] text-[#FF5C00]' : 'bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)] hover:text-[#FF5C00]'
        }`}>
          <Flame size={13} /> {onTrial ? `Essai Pro · J-${daysLeft}` : isPro ? 'Captain Pro' : 'Découverte'}
        </Link>
      </div>

      {/* Onboarding */}
      {showOnboarding && (
        <div className="rounded-3xl border border-[#FF5C00]/25 bg-[var(--app-accent-soft)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 pt-5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#FF5C00] flex items-center justify-center text-white shrink-0"><Rocket size={17} /></span>
              <div>
                <p className="text-[15px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none">Lance ton crew</p>
                <p className="text-[12px] text-[color:var(--app-text-muted)] mt-1">{doneCount}/{steps.length} étapes — tu y es presque.</p>
              </div>
            </div>
            <button onClick={dismissOnboarding} className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[color:var(--app-text-muted)] hover:bg-[var(--app-hover)] transition-colors"><X size={14} /></button>
          </div>
          <div className="px-5 mt-3">
            <div className="h-1.5 rounded-full bg-[color:var(--app-border)] overflow-hidden">
              <div className="h-full rounded-full bg-[#FF5C00] transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
            </div>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            {steps.map((s) => (
              <div key={s.key} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${s.done ? 'opacity-60' : 'bg-[var(--app-surface)] border border-[color:var(--app-border)]'}`}>
                {s.done ? <CheckCircle2 size={20} className="text-[#22C55E] shrink-0" /> : <Circle size={20} className="text-[color:var(--app-text-muted)] shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold text-[color:var(--app-text)] ${s.done ? 'line-through' : ''}`}>{s.title}</p>
                  {!s.done && <p className="text-[11px] text-[color:var(--app-text-muted)] mt-0.5">{s.desc}</p>}
                </div>
                {!s.done && s.action === 'copy' && joinUrl && (
                  <button onClick={copyJoin} className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#FF5C00] text-white text-[12px] font-semibold hover:bg-[#E04B00] transition-colors">
                    {copied ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier le lien</>}
                  </button>
                )}
                {!s.done && s.href && (
                  <Link href={s.href} className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#FF5C00] text-white text-[12px] font-semibold hover:bg-[#E04B00] transition-colors">{s.cta} <ArrowRight size={13} /></Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Push */}
      <PushNotificationPrompt clubId={club?.id} />

      {/* Rangée 1 : anneau héro + prochain run */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`lg:col-span-2 ${card} rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-7 sm:gap-9`}>
          <Link href="/dashboard/members">
            <Ring pct={memberCount / goal}>
              <span className="text-[40px] font-display italic font-black text-[color:var(--app-text)] leading-none">{loading ? '—' : memberCount}</span>
              <span className="text-[10px] uppercase tracking-widest text-[color:var(--app-text-muted)] mt-1.5">membres actifs</span>
            </Ring>
          </Link>
          <div className="hidden sm:block w-px self-stretch bg-[color:var(--app-border)]" />
          <div className="flex-1 w-full grid grid-cols-3 gap-5">
            {[
              { v: sessionCount, l: 'Runs', href: '/dashboard/events' },
              { v: checkinCount, l: 'Check-ins', href: '/dashboard/stats' },
              { v: memberCount, l: 'Membres', href: '/dashboard/members' },
            ].map((m) => (
              <Link key={m.l} href={m.href} className="group">
                <p className="text-[30px] font-display italic font-black text-[color:var(--app-text)] leading-none group-hover:text-[#FF5C00] transition-colors">{loading ? '—' : m.v}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--app-text-muted)] mt-1.5">{m.l}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Prochain run */}
        {nextRun ? (
          <Link href={`/dashboard/events/${nextRun.id}`} className="rounded-3xl p-6 sm:p-7 flex flex-col text-white" style={{ background: 'linear-gradient(160deg, #FF6A1A, #E04B00)' }}>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Prochain run</span>
            <h3 className="font-display italic font-black uppercase leading-tight mt-2 text-[24px]">{nextRun.title}</h3>
            <div className="mt-auto pt-6 space-y-2 text-white/90 text-[13px] font-medium">
              <p className="flex items-center gap-2"><Clock size={14} /> {fmtDate(nextRun.event_date)}</p>
              {nextRun.meeting_point_address && <p className="flex items-center gap-2"><MapPin size={14} /> {nextRun.meeting_point_address}</p>}
            </div>
            <span className="mt-5 h-11 rounded-xl bg-white text-[#E04B00] text-[13px] font-bold flex items-center justify-center gap-1.5">Gérer le run <ChevronRight size={15} /></span>
          </Link>
        ) : (
          <div className="rounded-3xl p-6 sm:p-7 flex flex-col text-white" style={{ background: 'linear-gradient(160deg, #FF6A1A, #E04B00)' }}>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Prochain run</span>
            <h3 className="font-display italic font-black uppercase leading-tight mt-2 text-[24px]">Aucun run<br />prévu</h3>
            <p className="mt-auto pt-6 text-white/90 text-[13px] font-medium">Planifie ton premier run et partage-le à ton crew.</p>
            <Link href="/dashboard/events/new" className="mt-5 h-11 rounded-xl bg-white text-[#E04B00] text-[13px] font-bold flex items-center justify-center gap-1.5"><Plus size={15} /> Créer un run</Link>
          </div>
        )}
      </div>

      {/* Rangée 2 : graphe check-ins + assiduité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`lg:col-span-2 ${card} rounded-3xl p-6 sm:p-7`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-widest text-[color:var(--app-text-muted)]">Check-ins · 8 semaines</h3>
            {checkinCount > 0 && <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#22C55E]"><TrendingUp size={14} /> {checkinCount} total</span>}
          </div>
          {checkinCount === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-2" style={{ height: 150 }}>
              <BarChart3 size={26} className="text-[color:var(--app-text-muted)]" />
              <p className="text-[13px] text-[color:var(--app-text-muted)]">Les présences de tes runs apparaîtront ici.</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: 150 }}>
              {weekly.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg" style={{ height: `${Math.max((v / maxWeek) * 130, 3)}px`, background: i === weekly.length - 1 ? '#FF5C00' : 'rgba(255,92,0,0.28)' }} />
                  <span className="text-[9px] text-[color:var(--app-text-muted)]">S{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assiduité */}
        <div className={`${card} rounded-3xl p-6 sm:p-7 flex flex-col items-center`}>
          <h3 className="text-[13px] font-semibold uppercase tracking-widest self-start mb-4 text-[color:var(--app-text-muted)]">Assiduité</h3>
          <Ring pct={assiduite} size={140} stroke={12} color="#22C55E">
            <span className="text-[34px] font-display italic font-black text-[color:var(--app-text)] leading-none">{loading ? '—' : `${Math.round(assiduite * 100)}%`}</span>
            <span className="text-[10px] uppercase tracking-widest text-[color:var(--app-text-muted)] mt-1">réguliers</span>
          </Ring>
          <p className="text-[12px] text-center mt-4 leading-snug text-[color:var(--app-text-muted)]">
            {regulars > 0 ? `${regulars} membre${regulars > 1 ? 's' : ''} cour${regulars > 1 ? 'ent' : 't'} chaque semaine` : 'Suis la régularité de ton crew'}
          </p>
        </div>
      </div>

      {/* Accès rapide */}
      <div className="pt-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[color:var(--app-text-muted)] mb-3">Accès rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: `Créer ${L.session_single}`, icon: <Plus size={16} />, href: '/dashboard/events/new', primary: true },
            { label: 'Voir les membres', icon: <Users size={16} />, href: '/dashboard/members' },
            { label: 'Les Spots du Crew', icon: <MapPin size={16} />, href: '/dashboard/spots' },
            { label: 'Messages', icon: <MessageSquare size={16} />, href: '/messages' },
            { label: 'Statistiques', icon: <BarChart3 size={16} />, href: '/dashboard/stats' },
            { label: 'Protection', icon: <ShieldCheck size={16} />, href: '/securite' },
          ].map((a) => (
            <Link key={a.label} href={a.href}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-[13px] font-semibold transition-colors ${
                a.primary ? 'bg-[#FF5C00] text-white hover:bg-[#E04B00]' : `${card} text-[color:var(--app-text)] hover:border-[#FF5C00]/40`
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
