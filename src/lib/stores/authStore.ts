import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role?: string;
  full_name?: string;
}

interface Club {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  owner_id: string;
}

interface AuthState {
  user: User | null;
  club: Club | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setClub: (club: Club | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  club: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setClub: (club) => set({ club }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, club: null, isLoading: false }),
}));
