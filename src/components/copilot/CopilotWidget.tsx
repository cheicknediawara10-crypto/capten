'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, MessageSquare, Send, Sparkles, X, RefreshCw, Check, ArrowRight, Lock } from 'lucide-react';

interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CopilotWidget() {
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    fetchBriefing();
  }, []);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/copilot');
      if (res.ok) {
        const data = await res.json();
        if (data.isLocked) {
          setIsLocked(true);
          setBriefing(data.briefing);
          setMessages([{ role: 'assistant', content: data.briefing }]);
        } else if (data.briefing) {
          setIsLocked(false);
          setBriefing(data.briefing);
          if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: data.briefing }]);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching copilot briefing:', e);
      setBriefing("Prêt à faire courir le crew cette semaine ? Lance ton premier run social et n'oublie pas le café post-run ! 🏃");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (isLocked) return;
    const text = textToSend || inputMessage;
    if (!text.trim() || sending) return;

    const userMsg: CopilotMessage = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        }
      }
    } catch (e) {
      console.error('Error sending message to copilot:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Mince, j'ai eu une petite coupure de réseau. Tu peux me réexpliquer ?" }]);
    } finally {
      setSending(false);
    }
  };

  if (dismissed && !chatOpen) return null;

  return (
    <div className="w-full">
      {/* BRIEFING CARD ON DASHBOARD */}
      <div className={`bg-[#0A0A0A] text-white rounded-card-outer p-6 sm:p-8 shadow-xl border relative overflow-hidden group transition-all duration-355 ${
        isLocked 
          ? 'opacity-80 border-white/5 shadow-md' 
          : 'border-white/10 hover:border-[#FF5C00]/30 hover:shadow-2xl'
      }`}>
        {/* Background neon glow accent */}
        {!isLocked && (
          <>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-[#FF5C00]/20 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-gradient-to-tr from-[#56E39F]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
          </>
        )}

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-card-inner flex items-center justify-center font-bold shadow-lg shrink-0 transition-transform ${
              isLocked 
                ? 'bg-neutral-800 text-neutral-400 shadow-none' 
                : 'bg-gradient-to-tr from-[#FF5C00] to-[#FF8C3A] text-white shadow-[#FF5C00]/15 group-hover:rotate-6'
            }`}>
              {isLocked ? <Lock size={20} /> : <Bot size={22} className="stroke-[2.2]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] font-display italic">
                  COPILOTE CAPTEN
                </span>
                {isLocked ? (
                  <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Lock size={8} /> BLOQUÉ
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/80 text-[8px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    IA TERRAIN
                  </span>
                )}
              </div>
              <h3 className={`text-[16px] sm:text-[18px] font-display italic font-black uppercase tracking-tight mt-0.5 ${
                isLocked ? 'text-neutral-300' : 'text-white'
              }`}>
                BRIEFING PROACTIF DU CREW
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {isLocked ? (
              <Link
                href="/plan"
                className="bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white px-4 py-2 rounded-control text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C00]/15"
              >
                <Lock size={12} /> ACTIVER LE COPILOTE
              </Link>
            ) : (
              <button
                onClick={() => setChatOpen(true)}
                className="bg-gradient-to-r from-[#FF5C00] to-[#FF7A29] hover:from-white hover:to-white text-white hover:text-black px-4 py-2 rounded-control text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C00]/10 hover:shadow-white/5"
              >
                <MessageSquare size={13} className="stroke-[2.5]" /> PARLER AU COPILOTE
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/5 hover:border-white/20 text-white/40 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Masquer le briefing"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* BRIEFING CONTENT */}
        <div className="py-6 relative z-10">
          {loading ? (
            <div className="flex items-center gap-2.5 text-white/50 text-[12px] font-mono py-2">
              <RefreshCw size={14} className="animate-spin text-[#FF5C00] stroke-[2.5]" />
              Analyse des signaux de fréquentation et météo en cours...
            </div>
          ) : (
            <div className="relative py-1">
              <span className="absolute -left-3 -top-6 text-white/5 text-[90px] font-serif select-none pointer-events-none">“</span>
              <p className={`text-[15px] sm:text-[17px] font-display italic font-medium leading-relaxed pl-5 border-l-2 relative z-10 ${
                isLocked ? 'text-neutral-400 border-neutral-700' : 'text-white/95 border-[#FF5C00]'
              }`}>
                {briefing}
              </p>
            </div>
          )}
        </div>

        {/* QUICK SUGGESTIONS / ACTIONS */}
        <div className="flex flex-wrap items-center gap-2 pt-4 relative z-10 border-t border-white/5">
          {isLocked ? (
            <span className="text-neutral-500 text-[10px] font-mono flex items-center gap-1.5">
              <Lock size={12} /> Améliore ton plan de vol pour débloquer les suggestions rapides et la planification de runs automatisée.
            </span>
          ) : (
            <>
              <button
                onClick={() => {
                  setChatOpen(true);
                  handleSendMessage("Je gère ce sujet");
                }}
                className="bg-white/5 hover:bg-emerald-500/10 hover:text-[#56E39F] border border-white/10 hover:border-[#56E39F]/30 text-white/80 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check size={12} className="text-[#56E39F] stroke-[2.5]" /> Je m'en occupe
              </button>
              <button
                onClick={() => {
                  setChatOpen(true);
                  handleSendMessage("Quel est le résumé complet de la météo et des arrivées ?");
                }}
                className="bg-white/5 hover:bg-[#FF5C00]/10 hover:text-[#FF5C00] border border-white/10 hover:border-[#FF5C00]/30 text-white/80 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                📊 Faire le point crew
              </button>
              <button
                onClick={fetchBriefing}
                className="text-white/40 hover:text-white text-[9.5px] font-mono uppercase tracking-wider ml-auto flex items-center gap-1.5 cursor-pointer hover:underline transition-colors"
              >
                <RefreshCw size={11} /> Actualiser
              </button>
            </>
          )}
        </div>
      </div>


      {/* CHAT MODAL / DRAWER */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250] flex justify-end animate-fade-in">
          <div className="w-full max-w-lg bg-[#0E0E0E] border-l border-white/10 h-full flex flex-col justify-between text-white shadow-2xl animate-slide-left relative overflow-hidden">
            {/* Background decorative glows */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#FF5C00]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Chat Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-card-inner bg-gradient-to-tr from-[#FF5C00] to-[#FF8C3A] text-white flex items-center justify-center font-bold shadow-md shadow-[#FF5C00]/10">
                  <Bot size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-display italic font-black uppercase text-white tracking-tight">
                    COPILOTE CAPTEN
                  </h3>
                  <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Connecté au hub Supabase en temps réel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar relative z-10">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4.5 py-3 rounded-card-inner text-[13.5px] leading-relaxed font-sans shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-tr from-[#FF5C00] to-[#FF7A29] text-white rounded-br-none font-medium'
                        : 'bg-white/5 border border-white/5 text-neutral-200 rounded-bl-none italic'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] font-mono text-white/30 mt-1.5 uppercase tracking-widest pl-1 pr-1">
                    {msg.role === 'user' ? 'Vous' : 'Copilote'}
                  </span>
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 text-neutral-400 text-[11px] px-4.5 py-3.5 rounded-card-inner rounded-tl-none italic shadow-inner">
                    <span className="w-1.5 h-1.5 bg-[#FF5C00] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-[#FF5C00] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-[#FF5C00] rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Pose une question sur ton crew (sécurité, régularité, Sarah...)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white/5 border border-white/10 focus:border-[#FF5C00] rounded-control px-4 py-3 text-[13px] text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#FF5C00]/30 transition-all font-sans"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || sending}
                  className="bg-gradient-to-r from-[#FF5C00] to-[#FF7A29] disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 text-white px-4 py-3 rounded-control hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                >
                  <Send size={16} className="stroke-[2.5]" />
                </button>
              </div>
              <p className="text-[9px] text-white/20 font-mono text-center uppercase tracking-widest">
                🔒 Strict respect de la confidentialité · Données médicales et GPS masquées
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
