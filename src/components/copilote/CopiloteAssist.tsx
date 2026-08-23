"use client";

import React, { useEffect, useState } from "react";
import {
  Megaphone, CloudRain, Users, Shield, Coffee,
  Sparkles, Copy, Check, Loader2, Send, Mic, MicOff, Scissors, Flame, RotateCcw
} from "lucide-react";
import { generateCopilote, getCopiloteUsage } from "@/lib/copilote/actions";

type QuickSituation = {
  key: string;
  intent: "annonce" | "weather" | "mot" | "safety" | "afterrun";
  icon: any;
  label: string;
  badge?: string;
};

const QUICK_SITUATIONS: QuickSituation[] = [
  { key: "annonce", intent: "annonce", icon: Megaphone, label: "Annoncer le run", badge: "Prochain RDV" },
  { key: "weather", intent: "weather", icon: CloudRain, label: "Motiver sous la pluie", badge: "Météo" },
  { key: "mot", intent: "mot", icon: Users, label: "Bienvenue nouveaux", badge: "Accueil" },
  { key: "safety", intent: "safety", icon: Shield, label: "Rappel sécurité ville", badge: "Serre-file" },
  { key: "afterrun", intent: "afterrun", icon: Coffee, label: "After-run au Spot", badge: "Convivialité" },
];

const DEMO_RESPONSES: Record<string, string> = {
  annonce: "Salut le crew 🖤\nProchain run ce soir 19h00 ! 8 km tranquilles, tous niveaux. Serre-file présent pour que personne ne coure seul 🛡️\nQui est chaud ? ⚡",
  weather: "Le crew ne craint pas la pluie 🌧️⚡\nLe run est bien maintenu ce soir ! Prenez une veste légère et votre plus grand sourire. Les vrais sont là, on part à 19h ! 🖤",
  mot: "Bienvenue aux nouveaux arrivants dans le crew ! 👋🖤\nIci zéro pression, on court ensemble et on s'adapte à tous les niveaux. Hâte de faire vos premiers kilomètres avec nous !",
  safety: "Petit rappel sécu pour le run de ce soir 🛡️\nOn reste bien sur les trottoirs, on respecte les feux et les piétons. Le serre-file veille à l'arrière pour que personne ne soit lâché. Run safe ! 🖤",
  afterrun: "Après l'effort, le réconfort 🍻🖤\nCe soir après les étirements, on se retrouve tous au Spot du Crew pour boire un coup et décompresser ensemble ! Venez nombreux 🎉",
  shorter: "Run ce soir 19h00 ! 8km tous niveaux, serre-file présent 🛡️ RDV au départ 🖤",
  fun: "🔥 Le crew en feu ce soir !\nZéro excuse, on lace les baskets et on se retrouve à 19h00 ! Qui vient mettre le feu au bitume ? ⚡🖤",
};

export default function CopiloteAssist({ preview = false }: { preview?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(20);
  const [err, setErr] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const atLimit = used >= limit;

  useEffect(() => {
    if (preview) return;
    getCopiloteUsage().then((u) => { setUsed(u.used); setLimit(u.limit); });
  }, [preview]);

  // Génération rapide 1-clic depuis les situations
  async function handleQuickAction(sit: QuickSituation) {
    setActiveTag(sit.key);
    setErr(null);
    setCopied(false);
    setLoading(true);
    setResult(null);

    try {
      if (preview) {
        await new Promise((r) => setTimeout(r, 600));
        setResult(DEMO_RESPONSES[sit.key] || DEMO_RESPONSES.annonce);
        setUsed((u) => Math.min(u + 1, limit));
        return;
      }

      const data = await generateCopilote(sit.intent, "");
      if ("error" in data) {
        if (data.error === "limit") setErr("Limite atteinte pour aujourd'hui. Reviens demain 🖤");
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

  // Réajustement instantané du ton (façon Gemini)
  async function adjustTone(mode: "shorter" | "fun" | "retry") {
    if (!result) return;
    setErr(null);
    setCopied(false);
    setLoading(true);

    try {
      if (preview) {
        await new Promise((r) => setTimeout(r, 500));
        if (mode === "shorter") setResult(DEMO_RESPONSES.shorter);
        else if (mode === "fun") setResult(DEMO_RESPONSES.fun);
        else setResult(DEMO_RESPONSES[activeTag || "annonce"] || DEMO_RESPONSES.annonce);
        return;
      }

      const intent = mode === "retry" ? (activeTag || "libre") : mode;
      const data = await generateCopilote(intent, result);
      if ("error" in data) {
        setErr("Réessaie dans un instant.");
        return;
      }
      setResult(data.text);
      setUsed(data.used);
    } catch {
      setErr("Oups, réessaie.");
    } finally {
      setLoading(false);
    }
  }

  // Génération depuis saisie libre / vocale
  async function handleCustomSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!customPrompt.trim() || loading || atLimit) return;

    setActiveTag("custom");
    setErr(null);
    setCopied(false);
    setLoading(true);
    setResult(null);

    try {
      if (preview) {
        await new Promise((r) => setTimeout(r, 700));
        setResult(`Salut le crew 🖤\n${customPrompt}\nÀ très vite sur le run ! ⚡`);
        setUsed((u) => Math.min(u + 1, limit));
        setCustomPrompt("");
        return;
      }

      const data = await generateCopilote("libre", customPrompt);
      if ("error" in data) {
        if (data.error === "limit") setErr("Limite atteinte pour aujourd'hui.");
        else setErr("Erreur de génération.");
        return;
      }
      setResult(data.text);
      setUsed(data.used);
      setCustomPrompt("");
    } catch {
      setErr("Oups, réessaie.");
    } finally {
      setLoading(false);
    }
  }

  // Dictée vocale (Speech-to-text Web API standard sur Chrome & Safari mobile)
  function toggleVoice() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La dictée vocale n'est pas supportée sur ce navigateur.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setCustomPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

  function copyText() {
    if (!result) return;
    navigator.clipboard?.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec compteur */}
      <div className="flex items-center justify-between pt-2 border-t border-[color:var(--app-border)]">
        <span className="text-[11px] font-black uppercase tracking-wider text-[color:var(--app-text-muted)] flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#FF5C00]" /> Suggestions instantanées
        </span>
        <span className="text-[10px] font-mono text-[color:var(--app-text-muted)]">
          {used}/{limit} aujourd'hui
        </span>
      </div>

      {/* 1-Tap Quick Starters (Chips / Pills) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {QUICK_SITUATIONS.map((sit) => {
          const Icon = sit.icon;
          const isActive = activeTag === sit.key && !loading;
          return (
            <button
              key={sit.key}
              type="button"
              onClick={() => handleQuickAction(sit)}
              disabled={loading || atLimit}
              className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                isActive
                  ? "bg-[#FF5C00]/10 border-[#FF5C00] text-[#FF5C00]"
                  : "bg-[var(--app-surface-2)] border-[color:var(--app-border)] hover:border-[#FF5C00]/50 text-[color:var(--app-text)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon size={14} className="text-[#FF5C00]" />
                </span>
                <span className="text-[12px] font-bold truncate">{sit.label}</span>
              </div>
              {sit.badge && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[color:var(--app-text-muted)] shrink-0 ml-1">
                  {sit.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-6 bg-[var(--app-surface-2)] rounded-2xl border border-[color:var(--app-border)] gap-2">
          <Loader2 size={20} className="animate-spin text-[#FF5C00]" />
          <p className="text-[12px] font-bold text-[color:var(--app-text-muted)]">
            Le Copilote prépare ton message WhatsApp…
          </p>
        </div>
      )}

      {/* Résultat sous forme d'Artifact / Bulle WhatsApp prête à l'envoi */}
      {result && !loading && (
        <div className="rounded-2xl bg-[#EFEAE2] dark:bg-[#1A2227] border border-black/10 dark:border-white/10 p-4 shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header bulle WhatsApp */}
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[10px] font-black">
                W
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#111111] dark:text-white">
                Prêt pour ton groupe WhatsApp
              </span>
            </div>
            <span className="text-[10px] text-black/50 dark:text-white/50 font-medium">À l'instant</span>
          </div>

          {/* Corps du message */}
          <div className="bg-white dark:bg-[#0B141A] rounded-2xl p-3.5 shadow-sm border border-black/5 dark:border-white/5">
            <p className="text-[13px] text-[#111111] dark:text-[#E9EDEF] whitespace-pre-wrap leading-relaxed select-all">
              {result}
            </p>
          </div>

          {/* Réajustement du ton (Style Gemini) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold text-black/60 dark:text-white/60 uppercase tracking-wider mr-1">
              Ajuster :
            </span>
            <button
              type="button"
              onClick={() => adjustTone("shorter")}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-white/10 hover:bg-black/5 text-[#111111] dark:text-white transition-all cursor-pointer shadow-xs"
            >
              <Scissors size={11} /> Plus court
            </button>
            <button
              type="button"
              onClick={() => adjustTone("fun")}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-white/10 hover:bg-black/5 text-[#111111] dark:text-white transition-all cursor-pointer shadow-xs"
            >
              <Flame size={11} className="text-[#FF5C00]" /> Plus motivant
            </button>
            <button
              type="button"
              onClick={() => adjustTone("retry")}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-white/10 hover:bg-black/5 text-[#111111] dark:text-white transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw size={11} /> Autre
            </button>
          </div>

          {/* Boutons d'Action Principaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(result)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[12px] font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Send size={14} /> Ouvrir dans WhatsApp
            </a>
            <button
              type="button"
              onClick={copyText}
              className={`flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer border ${
                copied
                  ? "bg-[#22C55E] text-white border-[#22C55E]"
                  : "bg-white dark:bg-white/10 hover:bg-black/5 text-[#111111] dark:text-white border-black/10 dark:border-white/10"
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} /> Copié dans le presse-papier !
                </>
              ) : (
                <>
                  <Copy size={14} /> Copier le texte
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {err && <p className="text-[11px] text-[#F87171] font-medium">{err}</p>}

      {/* Champ libre / Dictée vocale (Façon ChatGPT Mobile) */}
      <form onSubmit={handleCustomSubmit} className="relative mt-2">
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ou tape / dicte un mot sur-mesure…"
          className="w-full h-11 pl-4 pr-20 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] text-[12.5px] text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-muted)] focus:outline-none focus:border-[#FF5C00] transition-colors"
        />
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleVoice}
            title={isListening ? "Écoute en cours..." : "Dicter à la voix"}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? "bg-[#FF0000] text-white animate-pulse"
                : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
            }`}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
          <button
            type="submit"
            disabled={!customPrompt.trim() || loading || atLimit}
            className="w-8 h-8 rounded-xl bg-[#FF5C00] text-white flex items-center justify-center hover:bg-[#E04B00] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send size={13} />
          </button>
        </div>
      </form>
    </div>
  );
}
