'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, MapPin, BarChart3, MessageSquare, ArrowRight, Plus,
  Calendar, Copy, Check, ShieldCheck, CreditCard, Loader2,
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

  const STATS = [
    { label: 'Membres', value: memberCount, icon: <Users size={18} />, href: '/dashboard/members' },
    { label: L.session_plural_cap, value: sessionCount, icon: <Calendar size={18} />, href: '/dashboard/events' },
    { label: 'Check-ins', value: checkinCount, icon: <Check size={18} />, href: '/dashboard/stats' },
  ];

  const ACTIONS = [
    { label: `Créer une ${L.session_single}`, icon: <Plus size={16} />, href: '/dashboard/events/new', primary: true },
    { label: 'Voir les membres', icon: <Users size={16} />, href: '/dashboard/members' },
    { label: 'Les Spots du Crew', icon: <MapPin size={16} />, href: '/dashboard/spots' },
    { label: 'Messages', icon: <MessageSquare size={16} />, href: '/messages' },
    { label: 'Statistiques', icon: <BarChart3 size={16} />, href: '/dashboard/stats' },
    { label: 'Protection', icon: <ShieldCheck size={16} />, href: '/securite' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-[#A3A3A3] font-sans">Salut {firstName} 👋</p>
          <h1 className="text-[28px] sm:text-[36px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
            {club?.name || 'Mon crew'}
          </h1>
        </div>
        <span className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
          isPro ? 'bg-[#1C1B18] text-white' : 'bg-[#F4F4EE] text-[#666562]'
        }`}>
          <CreditCard size={12} />
          {isPro ? 'Captain Pro' : 'Découverte'}
        </span>
      </div>

      {/* Lien d'inscription public */}
      {joinUrl && (
        <div className="bg-[#F4F4EE] rounded-[20px] px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#A3A3A3] mb-0.5">Lien d'inscription du crew</p>
            <p className="text-[13px] font-semibold text-[#1A1918] truncate">{joinUrl}</p>
          </div>
          <button onClick={copyJoin}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white border border-black/10 text-[12px] font-bold text-[#333] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors">
            {copied ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
          </button>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-white rounded-[20px] border border-black/5 p-5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all group">
            <div className="w-9 h-9 rounded-[12px] bg-[#FF5C00]/[0.08] flex items-center justify-center text-[#FF5C00] mb-3">
              {s.icon}
            </div>
            <p className="text-[28px] font-display italic font-black text-black leading-none">
              {loading ? '—' : s.value}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3] mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Prochaines sorties */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-black uppercase tracking-widest text-[#666562]">Prochaines {L.session_plural}</h2>
          <Link href="/dashboard/events" className="text-[12px] font-bold text-[#FF5C00] hover:underline inline-flex items-center gap-1">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        <div className="bg-white rounded-[20px] border border-black/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-[#FF5C00]" size={22} /></div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Calendar size={28} className="text-[#D1D1D1]" />
              <p className="text-[13px] text-[#A3A3A3]">Aucune {L.session_single} prévue.</p>
              <Link href="/dashboard/events/new"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#FF5C00] text-white text-[12px] font-black uppercase tracking-wider hover:bg-[#E04B00] transition-colors">
                <Plus size={14} /> Créer une {L.session_single}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {upcoming.map((ev) => (
                <Link key={ev.id} href={`/dashboard/events/${ev.id}`} className="flex items-center gap-4 p-4 hover:bg-[#FAFAF8] transition-colors">
                  <div className="w-11 h-11 rounded-[12px] bg-[#F4F4EE] flex items-center justify-center text-[#FF5C00] shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black uppercase tracking-tight text-black truncate">{ev.title}</p>
                    <p className="text-[11px] text-[#A3A3A3] mt-0.5">{fmtDate(ev.event_date)}</p>
                  </div>
                  {ev.meeting_point_address && (
                    <span className="hidden sm:flex items-center gap-1 text-[11px] text-[#A3A3A3] max-w-[180px] truncate">
                      <MapPin size={10} /> {ev.meeting_point_address}
                    </span>
                  )}
                  <ArrowRight size={15} className="text-[#D1D1D1] shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-[13px] font-black uppercase tracking-widest text-[#666562] mb-3">Accès rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACTIONS.map((a) => (
            <Link key={a.label} href={a.href}
              className={`flex items-center gap-2.5 rounded-[16px] px-4 py-3.5 text-[13px] font-bold transition-all ${
                a.primary
                  ? 'bg-[#FF5C00] text-white hover:bg-[#E04B00]'
                  : 'bg-white border border-black/5 text-[#333] hover:border-[#FF5C00]/40 hover:text-[#FF5C00]'
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
