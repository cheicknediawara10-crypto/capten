"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PenLine, PartyPopper, Hand, MessageCircle, Sparkles, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Intent = "annonce" | "motivation" | "mot" | "situation";

const INTENTS: { key: Intent; Icon: any; label: string; ph: string }[] = [
  { key: "annonce", Icon: PenLine, label: "Écris un message", ph: "Ex : annoncer le run de jeudi, un changement de lieu, une annulation…" },
  { key: "motivation", Icon: PartyPopper, label: "Motiver le crew", ph: "Ex : relancer après une baisse, lancer un défi…" },
  { key: "mot", Icon: Hand, label: "Un mot (nouveau / absent)", ph: "Ex : bienvenue à Léa · relancer Antoine, absent depuis 3 semaines…" },
  { key: "situation", Icon: MessageCircle, label: "Gérer une situation", ph: "Ex : un coureur qui monopolise, un conflit, une question d'orga…" },
];

const DEMO: Record<Intent, string> = {
  annonce: "Night Runners 📣\nCe soir 19h, run habituel — 8 km tranquilles, tous niveaux. RDV au portail, on part à l'heure 🖤",
  motivation: "Night Runners ⚡\nLa semaine a été calme ? Justement. On se retrouve jeudi pour se refaire une santé. Qui est chaud ? 🖤",
  mot: "Salut Léa ! 👋\nTrop content de t'avoir dans le crew. Ici zéro pression, on court pour le plaisir. Hâte de te voir jeudi 🖤",
  situation: "Parle-lui en privé, sans juger : écoute d'abord, puis rappelle l'esprit du crew (zéro compét', tous niveaux). Propose-lui un rôle de serre-file pour canaliser son énergie — souvent ça suffit à désamorcer.",
};

export default function CopiloteAssist({ preview = false }: { preview?: boolean }) {
  const { club } = useAuth();
  const [intent, setIntent] = useState<Intent>("annonce");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(20);
  const [err, setErr] = useState<string | null>(null);

  const ph = useMemo(() => INTENTS.find((i) => i.key === intent)?.ph || "", [intent]);
  const atLimit = used >= limit;

  useEffect(() => {
    if (preview) return;
    const supabase = getSupabase();
    if (!supabase || !club?.id) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("copilot_ai_usage")
      .select("count")
      .eq("club_id", club.id)
      .eq("day", today)
      .maybeSingle()
      .then(({ data }: any) => setUsed(data?.count || 0));
  }, [club?.id, preview]);

  async function generate() {
    setErr(null);
    setCopied(false);
    setLoading(true);
    setResult(null);
    try {
      if (preview) {
        await new Promise((r) => setTimeout(r, 700));
        setResult(DEMO[intent]);
        setUsed((u) => Math.min(u + 1, limit));
        return;
      }
      const supabase = getSupabase();
      const { data: { session } } = (await supabase!.auth.getSession()) as any;
      const res = await fetch("/api/copilote/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ intent, input }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "limit") { setUsed(data.used); setLimit(data.limit); setErr("Tu as atteint ta limite du jour. Reviens demain 🖤"); }
        else if (data.error === "locked") setErr("Réservé au plan Capten.");
        else setErr("Oups, réessaie dans un instant.");
        return;
      }
      setResult(data.text);
      setUsed(data.used);
      setLimit(data.limit);
    } catch {
      setErr("Oups, réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard?.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="mt-4 pt-4 border-t border-[color:var(--app-border)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#FF5C00]" /> Ton Copilote t'aide
        </span>
        <span className="text-[10px] font-mono text-[color:var(--app-text-muted)]">{used}/{limit} aujourd'hui</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {INTENTS.map((i) => (
          <button
            key={i.key}
            onClick={() => { setIntent(i.key); setResult(null); setErr(null); }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors border ${
              intent === i.key
                ? "bg-[#FF5C00] text-white border-[#FF5C00]"
                : "bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)] border-[color:var(--app-border)] hover:text-[color:var(--app-text)]"
            }`}
          >
            <i.Icon size={12} /> {i.label}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={ph}
        rows={2}
        className="w-full bg-[var(--app-surface-2)] border border-[color:var(--app-border)] rounded-xl px-3.5 py-2.5 text-[12px] text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-muted)] focus:outline-none focus:border-[#FF5C00] transition-colors resize-none leading-snug"
      />

      <button
        onClick={generate}
        disabled={loading || atLimit}
        className="mt-2.5 w-full h-10 rounded-xl bg-[#FF5C00] text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#E04B00] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <><Loader2 size={15} className="animate-spin" /> Le Copilote écrit…</> : <><Sparkles size={15} /> Générer</>}
      </button>

      {err && <p className="text-[11px] text-[#F87171] mt-2">{err}</p>}

      {result && (
        <div className="mt-3 rounded-xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] p-3.5">
          <p className="text-[12.5px] text-[color:var(--app-text)] whitespace-pre-wrap leading-snug">{result}</p>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={copy} className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold transition-colors ${copied ? "bg-[#3DD68C] text-black" : "bg-[#FF5C00] text-white hover:bg-[#E04B00]"}`}>
              {copied ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
            </button>
            <button onClick={generate} disabled={loading || atLimit} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors disabled:opacity-50">
              <RefreshCw size={13} /> Régénérer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
