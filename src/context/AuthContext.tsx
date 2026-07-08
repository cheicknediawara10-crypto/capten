'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface ClubBranding {
  primary_color?: string;
  logo?: string;
  sos_numbers?: string;
  safety_contact?: string;
  safezone_active?: boolean;
  zero_pressure?: boolean;
  auto_round?: boolean;
  copilot_email_freq?: 'quotidien' | 'hebdo' | 'jamais';
}

export interface ClubData {
  id: string;
  name: string;
  whatsapp_display_name: string;
  cagnotte_url: string;
  spot_name: string;
  coaches: any[];
  message_templates: any[];
  cagnotte_data: {
    balance: number;
    transactions: any[];
    contributors: any[];
  };
  branding: ClubBranding;
  stripe_plan?: string;
  stripe_subscription_status?: string;
}

interface AuthContextType {
  user: User | null;
  club: ClubData | null;
  isLoading: boolean;
  isMock: boolean;
  refreshClub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<ClubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMock, setIsMock] = useState(true);

  const fetchClub = async (userId: string, supabase: any) => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching club data:', error);
        return;
      }

      if (data) {
        setClub({
          id: data.id,
          name: data.whatsapp_display_name || 'Mon Run Club',
          whatsapp_display_name: data.whatsapp_display_name || 'Mon Run Club',
          cagnotte_url: data.cagnotte_url || '',
          spot_name: data.spot_name || '',
          coaches: data.coaches || [],
          message_templates: data.message_templates || [],
          cagnotte_data: data.cagnotte_data || { balance: 0, transactions: [], contributors: [] },
          branding: data.branding || {},
          stripe_plan: data.stripe_plan || 'GRATUIT',
          stripe_subscription_status: data.stripe_subscription_status || 'inactive'
        });
      } else {
        // Auto-create club if missing
        const { data: newClub, error: insertError } = await supabase
          .from('clubs')
          .insert({
            id: userId,
            whatsapp_display_name: 'MON RUN CLUB'
          })
          .select()
          .single();

        if (!insertError && newClub) {
          setClub({
            id: newClub.id,
            name: newClub.whatsapp_display_name,
            whatsapp_display_name: newClub.whatsapp_display_name,
            cagnotte_url: '',
            spot_name: '',
            coaches: [],
            message_templates: [],
            cagnotte_data: { balance: 0, transactions: [], contributors: [] },
            branding: {},
            stripe_plan: newClub.stripe_plan || 'GRATUIT',
            stripe_subscription_status: newClub.stripe_subscription_status || 'inactive'
          });
        }
      }
    } catch (e) {
      console.error('Error in fetchClub:', e);
    }
  };

  const loadSession = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      // Mock Fallback session
      setIsMock(true);
      const mockSessionActive = typeof document !== 'undefined' && document.cookie.includes('capten_mock_session=active');
      if (mockSessionActive) {
        setUser({
          id: 'mock-captain-uuid',
          email: 'admin@capten.app',
          user_metadata: { club_name: 'Paris Run Club' }
        } as any);

        // Load local storage values as mock club details
        const savedClubName = localStorage.getItem('capten_club_name') || 'Paris Run Club';
        const savedCagnotteUrl = localStorage.getItem('capten_cagnotte_url') || '';
        const savedSpotName = localStorage.getItem('capten_spot_name') || '';
        
        let savedCoaches = [];
        try { savedCoaches = JSON.parse(localStorage.getItem('capten_coaches') || '[]'); } catch {}

        let savedTemplates = [];
        try { savedTemplates = JSON.parse(localStorage.getItem('capten_custom_templates_v2026') || '[]'); } catch {}

        let cagnotteBalance = 0;
        try { cagnotteBalance = parseFloat(localStorage.getItem('capten_solde_v3') || '0'); } catch {}

        let cagnotteTransactions = [];
        try { cagnotteTransactions = JSON.parse(localStorage.getItem('capten_cagnotte_logs_v3') || '[]'); } catch {}

        let cagnotteContributors = [];
        try { cagnotteContributors = JSON.parse(localStorage.getItem('capten_cagnotte_contributors_v3') || '[]'); } catch {}

        const branding: ClubBranding = {
          primary_color: localStorage.getItem('capten_primary_color') || '#FF5C00',
          logo: localStorage.getItem('capten_logo') || '',
          sos_numbers: localStorage.getItem('capten_sos_numbers') || '',
          safety_contact: localStorage.getItem('capten_safety_contact') || '',
          safezone_active: localStorage.getItem('capten_safezone_active') === 'true',
          zero_pressure: localStorage.getItem('capten_zero_pressure') === 'true',
          auto_round: localStorage.getItem('capten_auto_round') === 'true'
        };

        setClub({
          id: 'mock-captain-uuid',
          name: savedClubName,
          whatsapp_display_name: savedClubName,
          cagnotte_url: savedCagnotteUrl,
          spot_name: savedSpotName,
          coaches: savedCoaches,
          message_templates: savedTemplates,
          cagnotte_data: {
            balance: cagnotteBalance,
            transactions: cagnotteTransactions,
            contributors: cagnotteContributors
          },
          branding,
          stripe_plan: localStorage.getItem('capten_plan') || 'GRATUIT',
          stripe_subscription_status: localStorage.getItem('capten_plan') === 'CAPTEN' ? 'active' : 'inactive'
        });
      } else {
        setUser(null);
        setClub(null);
      }
      setIsLoading(false);
      return;
    }

    setIsMock(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchClub(session.user.id, supabase);
      } else {
        setUser(null);
        setClub(null);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    const supabase = getSupabase();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchClub(session.user.id, supabase);
        } else {
          setUser(null);
          setClub(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const refreshClub = async () => {
    const supabase = getSupabase();
    if (supabase && user) {
      await fetchClub(user.id, supabase);
    } else {
      await loadSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, club, isLoading, isMock, refreshClub }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}
