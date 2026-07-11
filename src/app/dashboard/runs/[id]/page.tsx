import React from 'react';
import { getSupabaseAdmin } from '@/lib/supabase';
import RunDashboardClient from './RunDashboardClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RunDashboardPage({ params }: PageProps) {
  const runId = params.id;
  const supabaseAdmin = getSupabaseAdmin();

  // Mode Démo / Fallback Local si Supabase n'est pas connecté
  if (!supabaseAdmin) {
    const mockRuns = [
      {
        id: '1',
        title: 'MORNING VIBES',
        description: 'Run social le long du canal avec arrêt café au Social Spot. Idéal pour les débutants.',
        date_start: new Date().toISOString(),
        location_start: 'Social Spot → Canal St Martin',
        max_slots: 50,
        slots_taken: 47,
        vibe: 'Social & Chill',
        coach: 'Alex Rivière',
        status: 'scheduled' as const,
      },
      {
        id: '2',
        title: 'TEMPO THURSDAY',
        description: 'Séance de fractionné au Trocadéro. 4x1000m avec récupération active.',
        date_start: new Date(Date.now() + 86400000).toISOString(),
        location_start: 'Trocadéro → Bois de Boulogne',
        max_slots: 40,
        slots_taken: 32,
        vibe: 'Performance',
        coach: 'Chloé Simon',
        status: 'scheduled' as const,
      }
    ];

    const run = mockRuns.find(r => r.id === runId) || {
      id: runId,
      title: 'RUN DE DÉMONSTRATION',
      description: 'Détails du run en mode simulation locale.',
      date_start: new Date().toISOString(),
      location_start: 'Social Spot Club',
      max_slots: 50,
      slots_taken: 5,
      vibe: 'Social & Chill',
      coach: 'Alex Rivière',
      status: 'scheduled' as const,
    };

    const mockRegistrations = [
      {
        id: 'reg-demo-1',
        status: 'checked_in',
        checked_in_at: new Date(Date.now() - 600000).toISOString(),
        check_in_method: 'gps',
        cagnotte_status: 'verified',
        runners: {
          id: 'runner-1',
          name: 'Chloé Simonet',
          phone: '0611223344',
          streak_count: 18
        }
      },
      {
        id: 'reg-demo-2',
        status: 'checked_in',
        checked_in_at: new Date(Date.now() - 300000).toISOString(),
        check_in_method: 'manual_captain',
        cagnotte_status: 'declared',
        runners: {
          id: 'runner-2',
          name: 'Alex Rivière',
          phone: '0622334455',
          streak_count: 15
        }
      },
      {
        id: 'reg-demo-3',
        status: 'registered',
        checked_in_at: null,
        check_in_method: null,
        cagnotte_status: 'none',
        runners: {
          id: 'runner-3',
          name: 'Léa Masson',
          phone: '0633445566',
          streak_count: 12
        }
      },
      {
        id: 'reg-demo-4',
        status: 'waitlisted',
        checked_in_at: null,
        check_in_method: null,
        cagnotte_status: 'none',
        runners: {
          id: 'runner-4',
          name: 'Théo Bernard',
          phone: '0644556677',
          streak_count: 8
        }
      },
      {
        id: 'reg-demo-5',
        status: 'registered',
        checked_in_at: null,
        check_in_method: null,
        cagnotte_status: 'none',
        runners: {
          id: 'runner-5',
          name: 'Sophie Lemaire',
          phone: '0655667788',
          streak_count: 5
        }
      },
      {
        id: 'reg-demo-6',
        status: 'registered',
        checked_in_at: null,
        check_in_method: null,
        cagnotte_status: 'none',
        runners: {
          id: 'runner-6',
          name: 'Marc Dupond',
          phone: '0666778899',
          streak_count: 2
        }
      },
      {
        id: 'reg-demo-7',
        status: 'registered',
        checked_in_at: null,
        check_in_method: null,
        cagnotte_status: 'none',
        runners: {
          id: 'runner-7',
          name: 'Noah Petit',
          phone: '0677889900',
          streak_count: 0
        }
      }
    ];

    return (
      <div className="min-h-screen bg-[#FDFCF8] p-4 sm:p-10">
        <RunDashboardClient 
          run={run} 
          initialRegistrations={mockRegistrations} 
          isDemo={true} 
        />
      </div>
    );
  }

  // Requête Base de Données réelle
  try {
    const { getAuthenticatedCaptainId } = await import('@/lib/auth-server');
    const captainId = await getAuthenticatedCaptainId();

    const { data: run, error: runError } = await supabaseAdmin
      .from('runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      return (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 text-center">
          <div className="bg-white border border-black/10 rounded-[20px] p-8 max-w-[400px] shadow-sm">
            <h1 className="text-[20px] font-display italic font-black uppercase text-black mb-2">
              RUN INTROUVABLE
            </h1>
            <p className="text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-6">
              Le run demandé n'existe pas ou a été supprimé de la base de données.
            </p>
            <a href="/runs" className="inline-block bg-black text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-[8px] hover:bg-[#FF5C00] transition-colors">
              RETOURNER AUX SORTIES
            </a>
          </div>
        </div>
      );
    }

    // Verify multi-tenant authorization
    if (!captainId || (run.club_id !== captainId && run.captain_id !== captainId)) {
      return (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 text-center">
          <div className="bg-white border border-black/10 rounded-[20px] p-8 max-w-[400px] shadow-sm">
            <h1 className="text-[20px] font-display italic font-black uppercase text-rose-500 mb-2">
              ACCÈS REFUSÉ
            </h1>
            <p className="text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-6">
              Vous n'êtes pas autorisé à accéder aux données de ce run.
            </p>
            <a href="/runs" className="inline-block bg-black text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-[8px] hover:bg-[#FF5C00] transition-colors">
              RETOURNER AUX SORTIES
            </a>
          </div>
        </div>
      );
    }

    const { data: rawRegistrations, error: regError } = await supabaseAdmin
      .from('registrations')
      .select(`
        id,
        status,
        checked_in_at,
        check_in_method,
        runners (
          id,
          name,
          phone,
          streak_count
        )
      `)
      .eq('run_id', runId);

    if (regError) {
      console.error("Error loading registrations:", regError);
    }

    const { data: attendanceData, error: attError } = await supabaseAdmin
      .from('attendance')
      .select('runner_id, cagnotte_status')
      .eq('run_id', runId);

    if (attError) {
      console.error("Error loading attendance:", attError);
    }

    const attendanceMap = new Map<string, string>();
    if (attendanceData) {
      attendanceData.forEach((att: any) => {
        if (att.runner_id) {
          attendanceMap.set(att.runner_id, att.cagnotte_status);
        }
      });
    }

    // Format registrations to match the expected client type safely
    const registrations = (rawRegistrations || []).map((reg: any) => {
      const runnerId = reg.runners?.id || 'unknown';
      const cagnotteStatus = attendanceMap.get(runnerId) || 'none';
      return {
        id: reg.id,
        status: reg.status,
        checked_in_at: reg.checked_in_at,
        check_in_method: reg.check_in_method,
        cagnotte_status: cagnotteStatus,
        runners: reg.runners ? {
          id: reg.runners.id,
          name: reg.runners.name,
          phone: reg.runners.phone,
          streak_count: reg.runners.streak_count || 0
        } : { id: 'unknown', name: 'Coureur Anonyme', phone: '', streak_count: 0 }
      };
    });

    return (
      <div className="min-h-screen bg-[#FDFCF8] p-4 sm:p-10">
        <RunDashboardClient 
          run={run} 
          initialRegistrations={registrations} 
          isDemo={false} 
        />
      </div>
    );

  } catch (error) {
    console.error("Exception loading live run dashboard:", error);
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-black/10 rounded-[20px] p-8 max-w-[400px] shadow-sm">
          <h1 className="text-[20px] font-display italic font-black uppercase text-black mb-2">
            ERREUR DU SERVEUR
          </h1>
          <p className="text-[12px] font-medium text-neutral-500 uppercase tracking-wider mb-6">
            Une erreur s'est produite lors de la connexion avec le poste de commandement.
          </p>
          <a href="/runs" className="inline-block bg-black text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-[8px] hover:bg-[#FF5C00] transition-colors">
            REESSAYER
          </a>
        </div>
      </div>
    );
  }
}
