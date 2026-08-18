"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Users, TrendingUp, CheckSquare, Calendar, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { hasProAccess } from "@/lib/plan-access";
import { getMyStats } from "./actions";

interface MonthData {
  month: string;
  checkins: number;
  events: number;
}

export default function StatsPage() {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ members: 0, events: 0, checkins: 0, avgPerEvent: 0 });
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getMyStats();
      if ("error" in res) { setLoading(false); return; }

      setClub(res.club);
      setKpis({
        members: res.members,
        events: res.events,
        checkins: res.checkins,
        avgPerEvent: res.events ? Math.round(res.checkins / res.events) : 0,
      });

      // Build monthly data for last 6 months
      const now = new Date();
      const months: MonthData[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("fr-FR", { month: "short" });
        const monthStr = d.toISOString().slice(0, 7);
        const evs = (res.eventsData || []).filter((e: any) => e.event_date?.startsWith(monthStr)).length;
        const chks = (res.checkinsData || []).filter((c: any) => c.checked_in_at?.startsWith(monthStr)).length;
        months.push({ month: label, checkins: chks, events: evs });
      }
      setMonthlyData(months);
      setLoading(false);
    })();
  }, []);

  const KPI_CARDS = [
    { label: "Membres", value: kpis.members, icon: <Users size={18} className="text-[#FF5C00]" /> },
    { label: "Runs", value: kpis.events, icon: <Calendar size={18} className="text-[#FF5C00]" /> },
    { label: "Check-ins", value: kpis.checkins, icon: <CheckSquare size={18} className="text-[#FF5C00]" /> },
    { label: "Moy. par run", value: kpis.avgPerEvent, icon: <TrendingUp size={18} className="text-[#FF5C00]" /> },
  ];

  const hasData = kpis.checkins > 0 || kpis.events > 0;
  const card = "bg-[var(--app-surface)] rounded-3xl border border-[color:var(--app-border)]";
  const chartTooltip = {
    contentStyle: {
      background: "var(--app-surface)",
      border: "1px solid var(--app-border)",
      borderRadius: 14,
      boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
      fontSize: 12,
      color: "var(--app-text)",
    },
    labelStyle: { color: "var(--app-text-muted)" },
    itemStyle: { color: "var(--app-text)" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#FF5C00]" size={32} />
      </div>
    );
  }

  if (!hasProAccess(club)) {
    return (
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
            Statistiques
          </h1>
          <p className="text-[13px] text-[color:var(--app-text-muted)] mt-1">L'activité de ton crew en un coup d'œil.</p>
        </div>
        <div className="rounded-3xl border border-[color:var(--app-border)] bg-[var(--app-surface)] p-8 sm:p-12 text-center flex flex-col items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-[var(--app-accent-soft)] flex items-center justify-center"><Lock size={22} className="text-[#FF5C00]" /></span>
          <h2 className="text-[18px] font-black uppercase tracking-tight text-[color:var(--app-text)]">Stats avancées — Captain Pro</h2>
          <p className="text-[13px] text-[color:var(--app-text-muted)] max-w-sm leading-snug">Présence, assiduité, rétention, tendances sur 6 mois — débloque tes stats pour piloter la croissance de ton crew.</p>
          <Link href="/plan" className="mt-3 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#FF5C00] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-colors">
            Débloquer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
          Statistiques
        </h1>
        <p className="text-[13px] text-[color:var(--app-text-muted)] mt-1">L'activité de ton crew en un coup d'œil.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`${card} p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className="text-[38px] font-display font-black italic text-[color:var(--app-text)] leading-none">
              {kpi.value}
            </p>
          </motion.div>
        ))}
      </div>

      {!hasData ? (
        <div className={`${card} p-10 flex flex-col items-center text-center gap-3`}>
          <TrendingUp size={28} className="text-[color:var(--app-text-muted)]" />
          <p className="text-[15px] font-semibold text-[color:var(--app-text)]">Pas encore de données</p>
          <p className="text-[12px] text-[color:var(--app-text-muted)] max-w-xs">
            Crée des runs et enregistre des check-ins — tes courbes d'activité apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {/* Check-ins over time */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${card} p-6`}
          >
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] mb-6">
              Check-ins — 6 derniers mois
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--app-text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--app-text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltip} cursor={{ stroke: "#FF5C00", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Line
                  type="monotone"
                  dataKey="checkins"
                  stroke="#FF5C00"
                  strokeWidth={2.5}
                  dot={{ fill: "#FF5C00", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#FF5C00" }}
                  name="Check-ins"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Runs per month */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`${card} p-6`}
          >
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] mb-6">
              Runs par mois
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--app-text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--app-text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltip} cursor={{ fill: "rgba(255,92,0,0.08)" }} />
                <Bar dataKey="events" fill="#FF5C00" radius={[6, 6, 0, 0]} name="Runs" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}
