"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Users, TrendingUp, CheckSquare, Calendar, Loader2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface MonthData {
  month: string;
  checkins: number;
  members: number;
  events: number;
}

export default function StatsPage() {
  const { club } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ members: 0, events: 0, checkins: 0, avgPerEvent: 0 });
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [sportData, setSportData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase || !club) { setLoading(false); return; }

      const [
        { count: memberCount },
        { count: eventCount },
        { count: checkinCount },
        { data: eventsData },
        { data: checkinsData },
      ] = await Promise.all([
        supabase.from("membre_club").select("*", { count: "exact", head: true }).eq("club_id", club.id).eq("is_active", true),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("club_id", club.id),
        supabase.from("membre_checkins").select("*, events!inner(club_id)", { count: "exact", head: true }).eq("events.club_id", club.id).eq("is_valid", true),
        supabase.from("events").select("event_date, status").eq("club_id", club.id).order("event_date"),
        supabase.from("membre_checkins").select("checked_in_at, events!inner(club_id)").eq("events.club_id", club.id).eq("is_valid", true),
      ]);

      setKpis({
        members: memberCount || 0,
        events: eventCount || 0,
        checkins: checkinCount || 0,
        avgPerEvent: eventCount ? Math.round((checkinCount || 0) / eventCount) : 0,
      });

      // Build monthly data for last 6 months
      const now = new Date();
      const months: MonthData[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("fr-FR", { month: "short" });
        const monthStr = d.toISOString().slice(0, 7);

        const evs = (eventsData || []).filter((e: any) => e.event_date?.startsWith(monthStr)).length;
        const chks = (checkinsData || []).filter((c: any) => c.checked_in_at?.startsWith(monthStr)).length;

        months.push({ month: label, checkins: chks, members: 0, events: evs });
      }
      setMonthlyData(months);

      // Sport breakdown: static seed for demo
      setSportData([
        { name: "Running", value: 68 },
        { name: "Trail", value: 18 },
        { name: "Walk", value: 14 },
      ]);

      setLoading(false);
    }
    load();
  }, [club]);

  const COLORS = ["#FF5500", "#1A1918", "#A3A3A3"];

  const KPI_CARDS = [
    { label: "Membres", value: kpis.members, icon: <Users size={18} className="text-[#FF5500]" />, suffix: "" },
    { label: "Sorties", value: kpis.events, icon: <Calendar size={18} className="text-[#FF5500]" />, suffix: "" },
    { label: "Check-ins", value: kpis.checkins, icon: <CheckSquare size={18} className="text-[#FF5500]" />, suffix: "" },
    { label: "Moy. par sortie", value: kpis.avgPerEvent, icon: <TrendingUp size={18} className="text-[#FF5500]" />, suffix: "" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-[28px] sm:text-[36px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
          Statistiques
        </h1>
        <p className="text-[13px] text-[#A3A3A3] mt-1">Aperçu de l'activité de ton club</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-[24px] border border-black/5 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className="text-[36px] font-display font-black italic text-black leading-none">
              {kpi.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Check-ins over time */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[24px] border border-black/5 p-6"
      >
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[#666562] mb-6">
          Check-ins — 6 derniers mois
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A3A3A3" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#A3A3A3" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ border: "none", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontSize: 12 }}
              cursor={{ stroke: "#FF5500", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="checkins"
              stroke="#FF5500"
              strokeWidth={2.5}
              dot={{ fill: "#FF5500", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#FF5500" }}
              name="Check-ins"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Events per month */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-[24px] border border-black/5 p-6"
        >
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#666562] mb-6">
            Sorties par mois
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A3A3A3" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A3A3A3" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "none", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontSize: 12 }}
                cursor={{ fill: "rgba(255,85,0,0.06)" }}
              />
              <Bar dataKey="events" fill="#1A1918" radius={[6, 6, 0, 0]} name="Sorties" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sport breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[24px] border border-black/5 p-6"
        >
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#666562] mb-6">
            Répartition par sport
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={sportData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {sportData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {sportData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                  <span className="text-[12px] font-medium text-[#1A1918] flex-1">{item.name}</span>
                  <span className="text-[12px] font-black text-[#1A1918]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
