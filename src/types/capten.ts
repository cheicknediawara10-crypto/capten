export interface Athlete {
  id: string;
  name: string;
  initials: string;
  reliability: number; // 0-100
  performance: string; // e.g. "4:30/K"
  email: string;
  avatar?: string;
}

export interface Run {
  id: string;
  title: string;
  date: string;
  time: string;
  distance: number; // km
  pace?: string;
  participants: number;
  status: "upcoming" | "archived";
}

export interface CagnotteTransaction {
  id: string;
  label: string;
  amount: number; // positive = income, negative = expense
  date: string;
  type: "income" | "expense";
}

export interface CagnotteData {
  balance: number;
  monthlyRevenue: number;
  activeMissions: number;
  transactions: CagnotteTransaction[];
}

export interface DashboardStats {
  totalAthletes: number;
  totalCheckins: number;
  retention: number; // percentage
  successRate: number; // percentage
  athletesTrend: number;
  checkinsTrend: number;
  retentionTrend: number;
  successTrend: number;
}
