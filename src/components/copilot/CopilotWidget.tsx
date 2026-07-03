'use client';

import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Send, Sparkles, X, RefreshCw, ChevronRight, Check } from 'lucide-react';

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

  useEffect(() => {
    fetchBriefing();
  }, []);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/copilot');
      if (res.ok) {
        const data = await res.json();
        if (data.briefing) {
          setBriefing(data.briefing);
          if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: data.briefing }]);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching copilot briefing:', e);
      setBriefing("Beau rythme cette semaine, le crew est régulier 💪 Continue comme ça !");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Mince, j'ai eu une petite coupure. Tu peux me réexpliquer ?" }]);
    } finally {
      setSending(false);
    }
  };

  if (dismissed && !chatOpen) return null;

  return (
    <div className="w-full">
      {/* BRIEFING CARD ON DASHBOARD */}
      <div className="bg-gradient-to-r from-neutral-900 via-black to-neutral-900 text-white rounded-card-outer p-5 sm:p-7 shadow-lg border border-white/10 relative overflow-hidden group">
        {/* Background glow accent */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#FF5C00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF5C00] text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#FF5C00] uppercase tracking-[0.2em]">
                  COPILOTE CAPTEN
                </span>
                <span className="bg-white/10 text-white/70 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  IA TERRAIN
                </span>
              </div>
              <h3 className="text-[15px] font-display italic font-black uppercase text-white tracking-tight">
                BRIEFING PROACTIF CREW
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setChatOpen(true)}
              className="bg-[#FF5C00] text-white px-3.5 py-1.5 rounded-control text-[10px] font-black uppercase tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <MessageSquare size={13} /> PARLER AU COPILOTE
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/40 hover:text-white p-1 transition-colors cursor-pointer"
              title="Masquer le briefing"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* BRIEFING CONTENT */}
        <div className="py-4 relative z-10">
          {loading ? (
            <div className="flex items-center gap-2 text-white/50 text-[12px] font-mono py-2">
              <RefreshCw size={14} className="animate-spin text-[#FF5C00]" />
              Analyse des signaux de fréquentation et météo en cours...
            </div>
          ) : (
            <p className="text-[14px] sm:text-[15px] font-sans font-medium text-white/90 leading-relaxed italic">
              « {briefing} »
            </p>
          )}
        </div>

        {/* QUICK SUGGESTIONS / ACTIONS */}
        <div className="flex flex-wrap items-center gap-2 pt-2 relative z-10 border-t border-white/10">
          <button
            onClick={() => {
              setChatOpen(true);
              handleSendMessage("Je gère ce sujet");
            }}
            className="bg-white/10 hover:bg-white/20 text-white/90 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
          >
            <Check size={12} className="text-[#56E39F]" /> Je m'en occupe
          </button>
          <button
            onClick={() => {
              setChatOpen(true);
              handleSendMessage("Quel est le résumé complet de la météo et des arrivées ?");
            }}
            className="bg-white/10 hover:bg-white/20 text-white/90 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
          >
            📊 Faire le point crew
          </button>
          <button
            onClick={fetchBriefing}
            className="text-white/40 hover:text-white text-[9.5px] font-mono uppercase tracking-wider ml-auto flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={10} /> Actualiser
          </button>
        </div>
      </div>

      {/* CHAT MODAL / DRAWER */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border-l border-white/10 h-full flex flex-col justify-between text-white shadow-2xl animate-slide-left">
            {/* Chat Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF5C00] text-white flex items-center justify-center font-bold shadow-md">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="text-[16px] font-display italic font-black uppercase text-white tracking-tight">
                    COPILOTE CAPTEN
                  </h3>
                  <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Connecté au hub Supabase en temps réel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-card-inner text-[13.5px] leading-relaxed font-sans ${
                      msg.role === 'user'
                        ? 'bg-[#FF5C00] text-white rounded-br-none font-medium'
                        : 'bg-white/10 border border-white/10 text-white/90 rounded-bl-none italic'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] font-mono text-white/30 mt-1 uppercase">
                    {msg.role === 'user' ? 'Vous' : 'Copilote'}
                  </span>
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-white/50 text-[11px] font-mono py-2 italic">
                  <RefreshCw size={12} className="animate-spin text-[#FF5C00]" />
                  Réflexion du copilote en cours...
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Pose une question sur ton crew (sécurité, régularité, Sarah...)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white/10 border border-white/15 rounded-control px-4 py-3 text-[13px] text-white placeholder-white/40 focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || sending}
                  className="bg-[#FF5C00] text-white px-4 py-3 rounded-control hover:bg-white hover:text-black transition-all disabled:opacity-40 cursor-pointer shadow-sm active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[9.5px] text-white/30 font-mono text-center">
                Strict respect de la confidentialité · Données médicales et GPS masquées
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
