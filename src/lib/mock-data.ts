import { Athlete, Run, CagnotteData, DashboardStats } from "@/types/capten";

export const mockAthletes: Athlete[] = [
  { id: "1", name: "Lucas Martin", initials: "LM", reliability: 98, performance: "4:15/K", email: "lucas@capten.run" },
  { id: "2", name: "Sofia Dubois", initials: "SD", reliability: 94, performance: "4:42/K", email: "sofia@capten.run" },
  { id: "3", name: "Théo Bernard", initials: "TB", reliability: 87, performance: "5:10/K", email: "theo@capten.run" },
  { id: "4", name: "Emma Leroy", initials: "EL", reliability: 92, performance: "4:55/K", email: "emma@capten.run" },
  { id: "5", name: "Noah Moreau", initials: "NM", reliability: 76, performance: "5:30/K", email: "noah@capten.run" },
  { id: "6", name: "Chloé Petit", initials: "CP", reliability: 100, performance: "4:08/K", email: "chloe@capten.run" },
  { id: "7", name: "Raphaël Simon", initials: "RS", reliability: 85, performance: "5:22/K", email: "raphael@capten.run" },
  { id: "8", name: "Léa Laurent", initials: "LL", reliability: 91, performance: "4:48/K", email: "lea@capten.run" },
];

export const mockRuns: Run[] = [
  { id: "1", title: "Morning Vibes", date: "2025-06-08", time: "07:00", distance: 8, pace: "5:15/K", participants: 12, status: "upcoming" },
  { id: "2", title: "Sunset Grind", date: "2025-06-10", time: "19:30", distance: 10, pace: "4:50/K", participants: 8, status: "upcoming" },
  { id: "3", title: "Sunday Long Run", date: "2025-06-15", time: "08:00", distance: 18, pace: "5:30/K", participants: 15, status: "upcoming" },
  { id: "4", title: "Tempo Tuesday", date: "2025-06-03", time: "18:30", distance: 6, pace: "4:30/K", participants: 10, status: "archived" },
  { id: "5", title: "Recovery Jog", date: "2025-05-28", time: "09:00", distance: 5, pace: "6:00/K", participants: 6, status: "archived" },
  { id: "6", title: "Hill Repeats", date: "2025-05-25", time: "07:30", distance: 7, pace: "5:00/K", participants: 9, status: "archived" },
];

export const mockCagnotte: CagnotteData = {
  balance: 2847.50,
  monthlyRevenue: 1250.00,
  activeMissions: 3,
  transactions: [
    { id: "1", label: "Inscription — Morning Vibes", amount: 15, date: "2025-06-08", type: "income" },
    { id: "2", label: "Location matériel sono", amount: -85, date: "2025-06-07", type: "expense" },
    { id: "3", label: "Inscription — Sunset Grind", amount: 15, date: "2025-06-06", type: "income" },
    { id: "4", label: "Achat dossards x50", amount: -120, date: "2025-06-05", type: "expense" },
    { id: "5", label: "Inscription — Tempo Tuesday", amount: 15, date: "2025-06-03", type: "income" },
    { id: "6", label: "Sponsor — Nike Running", amount: 500, date: "2025-06-01", type: "income" },
    { id: "7", label: "Assurance événement", amount: -200, date: "2025-05-30", type: "expense" },
    { id: "8", label: "Inscription x12 — Sunday LR", amount: 180, date: "2025-05-28", type: "income" },
  ],
};

export const mockDashboardStats: DashboardStats = {
  totalAthletes: 48,
  totalCheckins: 312,
  retention: 94,
  successRate: 87,
  athletesTrend: 12,
  checkinsTrend: 8,
  retentionTrend: 2,
  successTrend: -3,
};
