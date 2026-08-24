"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Users, CalendarPlus, Megaphone, Trophy, ShieldAlert, Activity,
  Settings, ArrowRight, Check, X, Loader2, Lock, Sparkles, Copy, Send,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CopiloteAssist from "@/components/copilote/CopiloteAssist";
import { getCopiloteState, resolveCopiloteAlert, generateCopilote } from "@/lib/copilote/actions";

interface Alert {
  id: string;
  category: string;
  priority: number;
  title: string;
  message: string;
  cta_label: string | null;
  cta_href: string | null;
}

const CAT: Record<string, { Icon: any; color: string }> = {
  accueil: { Icon: Users, color: "#3DD68C" },
  logistique: { Icon: CalendarPlus, color: "#FF5C00" },
  visuels: { Icon: Megaphone, color: "#FF5C00" },
  celebration: { Icon: Trophy, color: "#F59E0B" },
  securite: { Icon: ShieldAlert, color: "#F87171" },
  sante: { Icon: Activity, color: "#3DD68C" },
  admin: { Icon: Settings, color: "#918D85" },
};

const MOCK_ALERTS: Alert[] = [
  { id: "m1", category: "visuels", priority: 3, title: "Affiche à partager", message: "📢 Ton run « Run République » (jeudi) approche. Crée l'affiche pour le partager.", cta_label: "Créer l'affiche", cta_href: "/dashboard/events" },
  { id: "m2", category: "accueil", priority: 2, title: "Nouveaux dans le crew", message: "Léa et Thomas ont rejoint le crew cette semaine. Accueille-les 🖤", cta_label: "Écrire un mot", cta_href: "/messages" },
  { id: "m3", category: "securite", priority: 2, title: "Fiches ICE manquantes", message: "2 membres n'ont pas de fiche d'urgence (ICE). Sécurise ton crew.", cta_label: "Voir les membres", cta_href: "/dashboard/members" },
];

export default function CopilotePanel({
  preview = false,
  embedded = false,
  onCount,
}: {
  preview?: boolean;
  embedded?: boolean;
  onCount?: (n: number) => void;
} = {}) {
  const { isMock } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [gen, setGen] = useState<{ id: string; loading: boolean; text: string; error?: boolean } | null>(null);
  const [genCopied, setGenCopied] = useState(false);

  // Un nudge "message" (accueil / rappel) → le Copilote écrit le message, prêt à copier.
  async function runGenerate(a: Alert) {
    setGenCopied(false);
    setGen({ id: a.id, loading: true, text: "" });
    const intent = a.category === "accueil" ? "mot" : "annonce";
    const input =
      a.category === "accueil"
        ? "Écris un mot de bienvenue chaleureux et court pour les nouveaux du crew."
        : "Écris un rappel court et motivant pour le prochain run du crew (donne envie de venir).";
    if (isMock) {
      setTimeout(() => setGen({ id: a.id, loading: false, text: "Salut le crew 🖤\nRun ce soir 19h — 8 km tranquilles, tous niveaux. On part à l'heure au portail. Qui est chaud ? ⚡" }), 700);
      return;
    }
    const res = await generateCopilote(intent, input);
    if ("error" in res) setGen({ id: a.id, loading: false, text: "", error: true });
    else setGen({ id: a.id, loading: false, text: res.text });
  }

  useEffect(() => {
    onCount?.(alerts.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (preview || isMock) {
        setIsPro(true);
        setAlerts(MOCK_ALERTS);
        setLoading(false);
        return;
      }
      // Via server action (cookies) : détection + lecture, bornées au crew.
      const res = await getCopiloteState();
      if (cancelled) return;
      if (!("error" in res)) {
        setIsPro(res.isPro);
        setAlerts((res.alerts as Alert[]) || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isMock, preview]);

  async function resolve(id: string, status: "done" | "dismissed") {
    setAlerts((a) => a.filter((x) => x.id !== id));
    if (isMock || id.startsWith("m")) return;
    await resolveCopiloteAlert(id, status);
  }

  const card = "bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-3xl";

  // ── Gating : plan gratuit ──
  if (!preview && !isMock && !isPro) {
    return (
      <div className={embedded ? "p-5 relative overflow-hidden" : `${card} p-6 relative overflow-hidden`}>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-9 h-9 rounded-xl bg-[var(--app-accent-soft)] flex items-center justify-center"><Compass size={18} className="text-[#FF5C00]" /></span>
          <h2 className="text-[15px] font-black uppercase tracking-tight text-[color:var(--app-text)]">Ton Copilote</h2>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--app-text-muted)]"><Lock size={11} /> Verrouillé</span>
        </div>
        <p className="text-[13px] text-[color:var(--app-text-muted)] max-w-md leading-snug">
          Ton assistant qui pense à ce que tu oublies : accueil des nouveaux, rappels de run, affiches à partager, sécurité… Il te prévient, tu agis en 1 clic.
        </p>
        <Link href="/plan" className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#FF5C00] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-colors">
          <Sparkles size={14} /> Débloque ton Copilote
        </Link>
      </div>
    );
  }

  return (
    <div className={embedded ? "p-5" : `${card} p-6`}>
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-9 h-9 rounded-xl bg-[var(--app-accent-soft)] flex items-center justify-center"><Compass size={18} className="text-[#FF5C00]" /></span>
        <h2 className="text-[15px] font-black uppercase tracking-tight text-[color:var(--app-text)]">Ton Copilote</h2>
        {alerts.length > 0 && (
          <span className="ml-auto text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FF5C00] text-white">{alerts.length}</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-[color:var(--app-text-muted)] text-[13px]"><Loader2 size={16} className="animate-spin" /> Le Copilote regarde ton crew…</div>
      ) : alerts.length === 0 ? (
        <p className="text-[13px] text-[color:var(--app-text-muted)] py-4 leading-snug">
          Tout roule. 🖤 Ton Copilote veille — je te préviens dès qu&apos;il y a un truc à faire (nouveau membre, run à rappeler, story prête…).
        </p>
      ) : (
        <div className="space-y-2.5 mt-3">
          <AnimatePresence initial={false}>
            {alerts.map((a) => {
              const c = CAT[a.category] || CAT.admin;
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)]"
                >
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${c.color}1f` }}>
                    <c.Icon size={17} style={{ color: c.color }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[color:var(--app-text)] leading-tight">{a.title}</p>
                    <p className="text-[12px] text-[color:var(--app-text-muted)] leading-snug mt-0.5">{a.message}</p>
                    {a.cta_href === "/messages" ? (
                      <button
                        onClick={() => runGenerate(a)}
                        disabled={gen?.id === a.id && gen.loading}
                        className="inline-flex items-center gap-1.5 mt-2 h-8 px-3 rounded-full bg-[#FF5C00] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#E04B00] transition-all disabled:opacity-50"
                      >
                        {gen?.id === a.id && gen.loading
                          ? <><Loader2 size={12} className="animate-spin" /> Le Copilote écrit…</>
                          : <><Sparkles size={12} /> Rédige-le pour moi</>}
                      </button>
                    ) : a.cta_href && a.cta_label ? (
                      <Link href={a.cta_href} onClick={() => resolve(a.id, "done")} className="inline-flex items-center gap-1 mt-2 text-[12px] font-bold text-[#FF5C00] hover:underline">
                        {a.cta_label} <ArrowRight size={12} />
                      </Link>
                    ) : null}

                    {gen?.id === a.id && !gen.loading && (gen.text || gen.error) && (
                      <div className="mt-2 rounded-xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-3">
                        {gen.error ? (
                          <p className="text-[12px] text-[#F87171]">Oups, réessaie dans un instant.</p>
                        ) : (
                          <>
                            <p className="text-[12.5px] text-[color:var(--app-text)] whitespace-pre-wrap leading-snug">{gen.text}</p>
                            <div className="flex items-center gap-2 mt-2.5">
                              <a
                                href={`https://wa.me/?text=${encodeURIComponent(gen.text)}`}
                                target="_blank" rel="noopener noreferrer"
                                onClick={() => resolve(a.id, "done")}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold bg-[#25D366] text-white hover:bg-[#1FB855] transition-colors"
                              >
                                <Send size={12} /> Ouvrir dans WhatsApp
                              </a>
                              <button
                                onClick={() => { navigator.clipboard?.writeText(gen.text); setGenCopied(true); setTimeout(() => setGenCopied(false), 1500); }}
                                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold transition-colors ${genCopied ? "bg-[#3DD68C] text-black" : "bg-[var(--app-surface-2)] text-[color:var(--app-text)] hover:bg-[var(--app-hover)]"}`}
                              >
                                {genCopied ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => resolve(a.id, "done")} title="Marquer comme traité" className="w-7 h-7 rounded-full flex items-center justify-center text-[color:var(--app-text-muted)] hover:text-[#3DD68C] hover:bg-[#3DD68C]/10 transition-colors">
                      <Check size={14} />
                    </button>
                    <button onClick={() => resolve(a.id, "dismissed")} title="Ignorer" className="w-7 h-7 rounded-full flex items-center justify-center text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] hover:bg-[var(--app-hover)] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <CopiloteAssist preview={preview} />
    </div>
  );
}
