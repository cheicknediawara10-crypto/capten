"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Store, ArrowUpRight, ArrowDownLeft, Loader2, MapPin, Tag, ExternalLink } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatRelativeTime } from "@/lib/utils/format";

interface Spot {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  cashback_percent: number;
  category: string | null;
}

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  spots: { name: string; logo_url: string | null } | null;
}

export default function SpotsPage() {
  const { club } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"partners" | "history">("partners");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase || !club) { setLoading(false); return; }

      const [{ data: spotsData }, { data: txData }] = await Promise.all([
        supabase.from("spots").select("*").eq("is_active", true).order("name"),
        supabase.from("spot_transactions").select("*, spots(name, logo_url)").eq("club_id", club.id).order("created_at", { ascending: false }).limit(30),
      ]);

      setSpots(spotsData || []);
      setTransactions(txData || []);

      const total = (txData || [])
        .filter((t: Transaction) => t.status === "completed")
        .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
      setBalance(total);

      setLoading(false);
    }
    load();
  }, [club]);

  const CATEGORY_EMOJI: Record<string, string> = {
    food: "🍔",
    sport: "🏃",
    wellness: "💆",
    retail: "🛍️",
    transport: "🚗",
    default: "📍",
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-[28px] sm:text-[36px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
          CAPTEN Spots
        </h1>
        <p className="text-[13px] text-[#A3A3A3] font-sans mt-1">
          Partenaires locaux & cashback pour ton club
        </p>
      </div>

      {/* Cagnotte Balance */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-black rounded-[28px] p-8 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #FF5500 0, #FF5500 1px, transparent 0, transparent 50%)`,
          backgroundSize: "24px 24px",
        }} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/50 mb-2">
              Cagnotte Club
            </p>
            <p className="text-[48px] font-display font-black italic text-white leading-none">
              {formatCurrency(balance)}
            </p>
            <p className="text-[12px] text-white/40 mt-2 font-mono uppercase tracking-wider">
              {club?.name || "Mon club"}
            </p>
          </div>
          <div className="w-16 h-16 rounded-[20px] bg-[#FF5500] flex items-center justify-center">
            <Wallet size={28} className="text-white" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-black/5 rounded-full p-1 w-fit shadow-sm">
        {[
          { key: "partners" as const, label: `Partenaires (${spots.length})` },
          { key: "history" as const, label: "Historique" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.key ? "bg-[#FF5500] text-white shadow-sm" : "text-[#666562] hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#FF5500]" size={32} />
        </div>
      ) : activeTab === "partners" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spots.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-16 text-center">
              <div className="text-4xl mb-3">🏪</div>
              <p className="text-[14px] font-black uppercase text-black">Aucun partenaire</p>
              <p className="text-[12px] text-[#A3A3A3] mt-1">Les partenaires CAPTEN Spots apparaîtront ici.</p>
            </div>
          ) : (
            spots.map((spot, i) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-[24px] border border-black/5 p-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[#F4F4EE] flex items-center justify-center text-xl font-medium shrink-0">
                    {spot.logo_url ? (
                      <img src={spot.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      CATEGORY_EMOJI[spot.category || "default"] || "📍"
                    )}
                  </div>
                  <div className="bg-[#FF5500] text-white text-[12px] font-black px-2.5 py-1 rounded-full">
                    -{spot.cashback_percent}%
                  </div>
                </div>

                <h3 className="text-[15px] font-black uppercase text-black leading-tight tracking-tight group-hover:text-[#FF5500] transition-colors">
                  {spot.name}
                </h3>

                {spot.description && (
                  <p className="text-[12px] text-[#666562] mt-1 line-clamp-2">{spot.description}</p>
                )}

                {(spot.address || spot.city) && (
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-[#A3A3A3]">
                    <MapPin size={10} />
                    <span className="truncate">{spot.address || spot.city}</span>
                  </div>
                )}

                {spot.category && (
                  <div className="flex items-center gap-1 mt-3">
                    <Tag size={10} className="text-[#A3A3A3]" />
                    <span className="text-[10px] text-[#A3A3A3] font-medium uppercase tracking-wider">{spot.category}</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-[13px] text-[#666562]">Aucune transaction encore.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    tx.amount > 0 ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"
                  }`}>
                    {tx.amount > 0
                      ? <ArrowDownLeft size={15} className="text-[#22C55E]" />
                      : <ArrowUpRight size={15} className="text-[#EF4444]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-black">{tx.spots?.name || "Spot"}</p>
                    <p className="text-[11px] text-[#A3A3A3]">{formatRelativeTime(tx.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[14px] font-black ${tx.amount > 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === "completed" ? "text-[#22C55E]" : "text-[#F59E0B]"
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
