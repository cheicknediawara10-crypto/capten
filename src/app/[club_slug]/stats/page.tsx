import React from 'react';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Trophy, Flame, Users, Calendar, ArrowLeft, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface RunnerStats {
  name: string;
  streak_count: number;
}

interface RunStats {
  id: string;
  title: string;
  date_start: string;
  checked_in_count: number;
}

export default async function ClubStatsPage({ params }: { params: { club_slug: string } }) {
  const supabase = getSupabaseAdmin();
  let clubName = "The Crew Trail";
  let clubId: string | null = null;
  let isDemo = true;

  // Fallback demo metrics
  let totalRuns = 18;
  let totalParticipations = 254;
  let averageAttendance = 14;
  let leaderboard: RunnerStats[] = [
    { name: "Julien Rochedieu", streak_count: 12 },
    { name: "Marie Martin", streak_count: 9 },
    { name: "Thomas Lemaire", streak_count: 8 },
    { name: "Léa Dupré", streak_count: 6 },
    { name: "Antoine Bernard", streak_count: 5 },
  ];
  let recentRuns: RunStats[] = [
    { id: "run-1", title: "⚡ Afterwork Canal", date_start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), checked_in_count: 16 },
    { id: "run-2", title: "🌅 Sunrise Social", date_start: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), checked_in_count: 14 },
    { id: "run-3", title: "🌳 Trail Vincennes", date_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), checked_in_count: 22 },
    { id: "run-4", title: "🏃 Hard Reps République", date_start: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), checked_in_count: 12 },
  ];

  if (supabase) {
    const { data: clubs } = await supabase.from('clubs').select('id, whatsapp_display_name');
    const matchingClub = clubs?.find(c => {
      const slug = c.whatsapp_display_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      return slug === params.club_slug;
    });

    if (matchingClub) {
      isDemo = false;
      clubId = matchingClub.id;
      clubName = matchingClub.whatsapp_display_name;

      // Query database runs
      const { data: dbRuns } = await supabase
        .from('runs')
        .select('id, title, date_start, status')
        .eq('club_id', clubId)
        .in('status', ['completed', 'ended'])
        .order('date_start', { ascending: false });

      if (dbRuns) {
        totalRuns = dbRuns.length;
        
        const runIds = dbRuns.map(r => r.id);
        if (runIds.length > 0) {
          const { data: dbRegs } = await supabase
            .from('registrations')
            .select('run_id, status')
            .in('run_id', runIds)
            .eq('status', 'checked_in');

          totalParticipations = dbRegs?.length || 0;
          averageAttendance = totalRuns > 0 ? Math.round(totalParticipations / totalRuns) : 0;

          recentRuns = dbRuns.slice(0, 5).map(r => {
            const count = dbRegs?.filter(reg => reg.run_id === r.id).length || 0;
            return {
              id: r.id,
              title: r.title,
              date_start: r.date_start,
              checked_in_count: count
            };
          });
        } else {
          totalParticipations = 0;
          averageAttendance = 0;
          recentRuns = [];
        }
      }

      // Query database leaderboard
      const { data: dbRunners } = await supabase
        .from('runners')
        .select('name, streak_count')
        .eq('club_id', clubId)
        .order('streak_count', { ascending: false })
        .limit(10);

      if (dbRunners) {
        leaderboard = dbRunners.map(r => ({
          name: r.name,
          streak_count: r.streak_count || 0
        }));
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-black font-sans flex flex-col items-center py-8 px-4 select-none">
      
      {/* Container Principal */}
      <div className="w-full max-w-2xl space-y-6">
        
        {/* En-tête */}
        <header className="flex justify-between items-center pb-4 border-b border-black/10">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-black text-[#FF5C00] uppercase tracking-widest font-mono bg-[#FF5C00]/5 px-3 py-1 rounded-full">
              STATISTIQUES DU CREW
            </span>
            <h1 className="text-[36px] font-display italic font-black uppercase text-black leading-none tracking-tight pt-1.5">
              {clubName}
            </h1>
            <p className="text-[11px] font-bold text-neutral-450 uppercase tracking-wider">
              Performances collectives et assiduité en temps réel
            </p>
          </div>
          {isDemo && (
            <span className="bg-[#F4F5F7] border border-black/5 text-neutral-500 text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[4px] italic">
              DONNÉES DÉMO
            </span>
          )}
        </header>

        {/* KPIs Grid */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-black/10 rounded-[18px] p-4 text-center space-y-1 shadow-sm">
            <Trophy className="mx-auto text-[#FF5C00]" size={20} />
            <h3 className="text-2xl font-display italic font-black text-black leading-none pt-1">
              {totalRuns}
            </h3>
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-wider">RUNS COMPLÉTÉS</p>
          </div>

          <div className="bg-white border border-black/10 rounded-[18px] p-4 text-center space-y-1 shadow-sm">
            <Users className="mx-auto text-[#FF5C00]" size={20} />
            <h3 className="text-2xl font-display italic font-black text-black leading-none pt-1">
              {totalParticipations}
            </h3>
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-wider">CHECK-INS TOTAL</p>
          </div>

          <div className="bg-white border border-black/10 rounded-[18px] p-4 text-center space-y-1 shadow-sm">
            <TrendingUp className="mx-auto text-[#FF5C00]" size={20} />
            <h3 className="text-2xl font-display italic font-black text-black leading-none pt-1">
              {averageAttendance}
            </h3>
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-wider">MOYENNE RUNNERS</p>
          </div>
        </section>

        {/* Honor Roll / Leaderboard */}
        <section className="bg-white border border-black/10 rounded-[20px] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5">
            <Sparkles size={18} className="text-[#FF5C00]" />
            <h2 className="text-lg font-display italic font-black uppercase text-black">
              Leaderboard Assiduité (Streaks)
            </h2>
          </div>

          <div className="divide-y divide-black/5">
            {leaderboard.length === 0 ? (
              <p className="py-4 text-center text-xs text-neutral-400 font-bold uppercase tracking-wider">
                Aucune assiduité enregistrée. Participez au prochain run !
              </p>
            ) : (
              leaderboard.map((runner, index) => (
                <div key={index} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="font-display italic font-black text-base text-neutral-300 w-5">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-black uppercase text-black">
                      {runner.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-black text-[#FF5C00]">
                      {runner.streak_count}
                    </span>
                    <Flame size={14} fill="#FF5C00" className="text-[#FF5C00]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Historique des runs */}
        <section className="bg-white border border-black/10 rounded-[20px] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5">
            <Calendar size={18} className="text-[#FF5C00]" />
            <h2 className="text-lg font-display italic font-black uppercase text-black">
              Historique Récent des Séances
            </h2>
          </div>

          <div className="space-y-3">
            {recentRuns.length === 0 ? (
              <p className="py-4 text-center text-xs text-neutral-400 font-bold uppercase tracking-wider">
                Aucune séance terminée pour le moment.
              </p>
            ) : (
              recentRuns.map((run, index) => {
                const dateObj = new Date(run.date_start);
                const dateFormatted = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                return (
                  <div key={index} className="flex justify-between items-center p-3.5 hover:bg-neutral-50 rounded-xl border border-black/5 transition-all">
                    <div className="text-left space-y-0.5">
                      <p className="text-[12px] font-black uppercase text-black">{run.title}</p>
                      <p className="text-[9px] font-medium text-neutral-400 font-mono">{dateFormatted}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono font-black text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        👤 {run.checked_in_count} PRÉSENTS
                      </span>
                      {!isDemo && (
                        <Link 
                          href={`/runs/${run.id}/debrief`}
                          className="text-[#FF5C00] hover:text-black transition-colors"
                          title="Voir le débriefing"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Footer info brand */}
        <footer className="text-center py-4 text-[9px] font-mono text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Link href="/" className="hover:underline flex items-center gap-1">
            <ArrowLeft size={10} /> RETOUR AU SITE CAPTEN
          </Link>
        </footer>

      </div>
    </div>
  );
}
