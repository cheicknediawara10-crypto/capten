"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Settings, Heart, MessageCircle, Lock, Check, Loader2, Flag,
} from "lucide-react";
import { getSignalements, resolveSignalement } from "@/lib/signalements/actions";

interface Item {
  id: string;
  is_anonymous: boolean;
  type: string;
  message: string;
  status: string;
  created_at: string;
  membre_profiles: { first_name: string | null; last_name: string | null } | null;
}

const META: Record<string, { label: string; Icon: any; color: string }> = {
  securite: { label: "Sécurité", Icon: ShieldAlert, color: "#EF4444" },
  organisation: { label: "Organisation", Icon: Settings, color: "#F59E0B" },
  avis: { label: "Avis / idée", Icon: Heart, color: "#22C55E" },
  autre: { label: "Autre", Icon: MessageCircle, color: "#6B7280" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SignalementsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"new" | "done">("new");

  useEffect(() => {
    (async () => {
      const res = await getSignalements();
      if (!("error" in res)) setItems(res.items as Item[]);
      setLoading(false);
    })();
  }, []);

  async function resolve(id: string) {
    setItems((a) => a.map((x) => (x.id === id ? { ...x, status: "done" } : x)));
    await resolveSignalement(id);
  }

  // Priorité : sécurité d'abord, puis récent.
  const sorted = [...items].sort((a, b) => {
    const p = (x: Item) => (x.type === "securite" ? 0 : 1);
    if (p(a) !== p(b)) return p(a) - p(b);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const shown = sorted.filter((x) => (tab === "new" ? x.status === "new" : x.status === "done"));
  const newCount = items.filter((x) => x.status === "new").length;
  const safetyCount = items.filter((x) => x.status === "new" && x.type === "securite").length;
  const card = "bg-[var(--app-surface)] border border-[color:var(--app-border)]";

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
          Signalements
        </h1>
        <p className="text-[13px] text-[color:var(--app-text-muted)] mt-1">
          Les retours de tes coureurs — sécurité, organisation, avis. Visibles par toi seul.
        </p>
      </div>

      {safetyCount > 0 && (
        <div className="flex items-center gap-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl px-4 py-3">
          <ShieldAlert size={16} className="text-[#EF4444] shrink-0" />
          <p className="text-[13px] font-semibold text-[color:var(--app-text)]">
            {safetyCount} signalement{safetyCount > 1 ? "s" : ""} <span className="text-[#EF4444]">sécurité</span> à traiter en priorité.
          </p>
        </div>
      )}

      <div className={`flex gap-1 ${card} rounded-full p-1 w-fit`}>
        {([["new", `À traiter (${newCount})`], ["done", "Traités"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
              tab === k ? "bg-[#FF5C00] text-white" : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className={`${card} rounded-2xl h-24 animate-pulse`} />)}</div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--app-accent-soft)] flex items-center justify-center">
            <Flag size={24} className="text-[#FF5C00]" />
          </div>
          <p className="text-[15px] font-semibold text-[color:var(--app-text)]">
            {tab === "new" ? "Rien à traiter 🖤" : "Aucun signalement traité"}
          </p>
          <p className="text-[12px] text-[color:var(--app-text-muted)] max-w-xs">
            {tab === "new"
              ? "Tes coureurs peuvent signaler un souci ou donner leur avis depuis leur espace."
              : "Les signalements que tu marques comme traités apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {shown.map((s) => {
              const m = META[s.type] || META.autre;
              const author = s.is_anonymous
                ? "Anonyme"
                : ([s.membre_profiles?.first_name, s.membre_profiles?.last_name].filter(Boolean).join(" ").trim() || "Membre");
              return (
                <motion.div key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }}
                  className={`${card} rounded-2xl p-5 ${s.type === "securite" && s.status === "new" ? "border-l-4 border-l-[#EF4444]" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${m.color}1f` }}>
                        <m.Icon size={17} style={{ color: m.color }} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black uppercase tracking-wide" style={{ color: m.color }}>{m.label}</p>
                        <p className="text-[11px] text-[color:var(--app-text-muted)] flex items-center gap-1">
                          {s.is_anonymous && <Lock size={9} />}
                          {author} · {fmt(s.created_at)}
                        </p>
                      </div>
                    </div>
                    {s.status === "new" && (
                      <button onClick={() => resolve(s.id)} title="Marquer comme traité"
                        className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-[color:var(--app-border)] text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-text-muted)] hover:border-[#22C55E] hover:text-[#22C55E] transition-all shrink-0">
                        <Check size={13} /> Traité
                      </button>
                    )}
                  </div>
                  <p className="text-[14px] text-[color:var(--app-text)] leading-snug mt-3 whitespace-pre-wrap">{s.message}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
