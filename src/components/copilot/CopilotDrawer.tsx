'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bot, MessageSquare, Send, Sparkles, X, RefreshCw, Check, ArrowRight, Lock, Copy, RotateCcw, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type ActionType = 'rediger_message' | 'gerer_situation' | 'motiver_crew' | 'mot_coureur' | 'custom' | null;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function CopilotDrawer() {
  const { club, isMock } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatCallsCount, setChatCallsCount] = useState(0);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  
  const [inputs, setInputs] = useState({
    context: '',
    situation: '',
    goal: '',
    runnerName: '',
    customPrompt: ''
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFreePlan = club?.stripe_plan === 'GRATUIT';

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Load chat limits and alerts status on mount
  useEffect(() => {
    if (isFreePlan) return;
    async function fetchQuota() {
      try {
        const res = await fetch('/api/copilot');
        if (res.ok) {
          const data = await res.json();
          setChatCallsCount(data.chatCallsCount || 0);
          if (data.chatCallsCount >= 20) {
            setLimitExceeded(true);
          }
        }
      } catch (e) {
        console.error('Error fetching quota:', e);
      }
    }
    fetchQuota();
  }, [club?.stripe_plan, isFreePlan]);

  const dismissAlert = useCallback(async (alertId: string) => {
    if (isMock) {
      window.dispatchEvent(new CustomEvent('refresh-copilot-alerts'));
      return;
    }
    try {
      await fetch('/api/copilot/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', alertId })
      });
      window.dispatchEvent(new CustomEvent('refresh-copilot-alerts'));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  }, [isMock]);

  // Event Listeners for drawer control
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };

    const handleOpen = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { actionType, inputs: newInputs, alertId } = customEvent.detail || {};
      
      setIsOpen(true);
      setChatError(null);
      setLimitExceeded(false);

      if (actionType) {
        setActiveAction(actionType);
        if (newInputs) {
          setInputs(prev => ({ ...prev, ...newInputs }));
        }

        // Auto-submit the guided action to pre-generate the message for the user!
        if (isFreePlan) return;
        
        // Simuler ou exécuter la requête
        setLoading(true);
        setMessages([
          { role: 'user', content: `[Action Automatique : ${actionType}]` },
          { role: 'assistant', content: 'Le Copilote analyse et rédige votre message...' }
        ]);

        try {
          const res = await fetch('/api/copilot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actionType,
              inputs: newInputs || {}
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.chatCallsCount !== undefined) {
              setChatCallsCount(data.chatCallsCount);
              if (data.chatCallsCount >= 20) setLimitExceeded(true);
            }

            if (data.success) {
              setMessages([
                { role: 'assistant', content: data.reply }
              ]);
              
              // Marquer l'alerte comme résolue dans la base de données
              if (alertId) {
                await dismissAlert(alertId);
              }
            } else {
              setChatError(data.reply || "Erreur de génération.");
            }
          } else {
            setChatError("Erreur lors de la connexion au copilote.");
          }
        } catch (err) {
          setChatError("Impossible de contacter le copilote.");
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('toggle-copilot-drawer', handleToggle);
    window.addEventListener('open-copilot', handleOpen);
    
    return () => {
      window.removeEventListener('toggle-copilot-drawer', handleToggle);
      window.removeEventListener('open-copilot', handleOpen);
    };
  }, [dismissAlert, isFreePlan]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || sending || isFreePlan) return;

    const userMsg: Message = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setSending(true);
    setChatError(null);

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
        if (data.chatCallsCount !== undefined) {
          setChatCallsCount(data.chatCallsCount);
          if (data.chatCallsCount >= 20) setLimitExceeded(true);
        }

        if (data.reply) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        }
      } else {
        setChatError("Une erreur est survenue lors de l'envoi.");
      }
    } catch (e) {
      setChatError("Impossible de contacter le copilote.");
    } finally {
      setSending(false);
    }
  };

  const handleGuidedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFreePlan) return;
    setLoading(true);
    setChatError(null);

    let promptText = '';
    if (activeAction === 'rediger_message') promptText = `Rédiger message : ${inputs.context}`;
    else if (activeAction === 'gerer_situation') promptText = `Gérer situation : ${inputs.situation}`;
    else if (activeAction === 'motiver_crew') promptText = `Motiver crew : ${inputs.goal}`;
    else if (activeAction === 'mot_coureur') promptText = `Écrire à ${inputs.runnerName} (${inputs.context})`;
    else if (activeAction === 'custom') promptText = inputs.customPrompt;

    setMessages(prev => [...prev, { role: 'user', content: promptText }]);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: activeAction,
          inputs
        })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.chatCallsCount !== undefined) {
          setChatCallsCount(data.chatCallsCount);
          if (data.chatCallsCount >= 20) setLimitExceeded(true);
        }

        if (data.success) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
          setActiveAction(null); // return to normal chat
        } else {
          setChatError(data.reply || "Erreur de génération.");
        }
      } else {
        setChatError(data.error || "Erreur de connexion.");
      }
    } catch (err) {
      setChatError("Impossible de contacter le copilote IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const resetChat = () => {
    setMessages([]);
    setChatError(null);
    setInputs({
      context: '',
      situation: '',
      goal: '',
      runnerName: '',
      customPrompt: ''
    });
    setActiveAction(null);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Semi-transparent backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[240] transition-opacity duration-300"
          onClick={closeDrawer}
        />
      )}

      {/* Lateral drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[250] w-full max-w-lg bg-[#0E0E0E] border-l border-white/10 text-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Background decorative glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#FF5C00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FF5C00] text-white flex items-center justify-center font-bold shadow-md shadow-[#FF5C00]/10">
              <Bot size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-[16px] font-display italic font-black uppercase text-white tracking-tight">
                COPILOTE CAPTEN
              </h3>
              <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                IA Terrain connectée en direct
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar relative z-10 flex flex-col">
          {isFreePlan ? (
            /* Premium lock view in drawer */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-sm mx-auto">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white shadow-inner">
                <Lock size={22} />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF5C00]">Premium</span>
                <h4 className="text-xl font-display italic font-black uppercase tracking-tight text-white leading-none">
                  COPILOTE IA VERROUILLÉ
                </h4>
              </div>
              <p className="text-neutral-400 text-xs font-semibold leading-relaxed">
                Le Copilote IA est réservé aux membres du plan Capten. Active le plan supérieur pour obtenir ton briefing de crew proactif, tes propositions de messages et ton aide à la planification !
              </p>
              <Link 
                href="/plan" 
                onClick={closeDrawer}
                className="w-full bg-[#FF5C00] hover:bg-white text-white hover:text-black font-mono font-bold tracking-widest text-[10px] py-3.5 rounded-control transition-all uppercase block"
              >
                🚀 Débloquer mon Copilote
              </Link>
            </div>
          ) : (
            /* Active chat / form view */
            <>
              {/* Message log */}
              <div className="flex-1 space-y-4">
                {messages.length === 0 && !activeAction && (
                  <div className="text-center py-8 text-neutral-500 text-xs font-semibold max-w-xs mx-auto">
                    {"👋 Salut Capten ! Besoin d'aide pour rédiger un message, motiver le crew ou gérer un imprévu ? Choisis une action rapide ci-dessous ou pose-moi une question en texte libre."}
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4.5 py-3 rounded-xl text-[13px] leading-relaxed font-sans shadow-md ${
                        msg.role === 'user'
                          ? 'bg-[#FF5C00] text-white rounded-br-none font-medium'
                          : 'bg-white/5 border border-white/5 text-neutral-200 rounded-bl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.content}
                      {msg.role === 'assistant' && msg.content !== 'Le Copilote analyse et rédige votre message...' && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2.5">
                          <button
                            onClick={() => handleCopyToClipboard(msg.content)}
                            className="text-[9px] font-mono font-black uppercase tracking-wider text-[#FF5C00] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Copy size={10} /> {copyFeedback ? 'Copié !' : 'Copier'}
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-white/30 mt-1 uppercase tracking-widest px-1">
                      {msg.role === 'user' ? 'Vous' : 'Copilote'}
                    </span>
                  </div>
                ))}

                {sending && (
                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-1 bg-white/5 border border-white/5 text-neutral-400 text-[11px] px-4 py-2.5 rounded-xl rounded-tl-none italic shadow-inner">
                      <span className="w-1 h-1 bg-[#FF5C00] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1 h-1 bg-[#FF5C00] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1 h-1 bg-[#FF5C00] rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              {/* Guided form overlay inside drawer */}
              {activeAction && !loading && (
                <form onSubmit={handleGuidedSubmit} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-[9px] font-mono font-black text-[#FF5C00] uppercase tracking-wider">
                      {activeAction === 'rediger_message' && '✍️ Rédiger un message'}
                      {activeAction === 'gerer_situation' && '💬 Résoudre une situation'}
                      {activeAction === 'motiver_crew' && '🎉 Motiver le crew'}
                      {activeAction === 'mot_coureur' && '🙋 Écrire à un coureur'}
                      {activeAction === 'custom' && '⚙️ Demande personnalisée'}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setActiveAction(null)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {activeAction === 'rediger_message' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-black uppercase text-neutral-400">{"Objet de l'annonce"}</label>
                      <textarea
                        value={inputs.context}
                        onChange={(e) => setInputs(prev => ({ ...prev, context: e.target.value }))}
                        placeholder="Ex : Annoncer le run trail de ce soir à 19h30, avec un départ retardé de 15 minutes."
                        className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-sans font-semibold text-white focus:outline-none focus:border-[#FF5C00] h-20"
                        required
                      />
                    </div>
                  )}

                  {activeAction === 'gerer_situation' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-black uppercase text-neutral-400">Décris la situation</label>
                      <textarea
                        value={inputs.situation}
                        onChange={(e) => setInputs(prev => ({ ...prev, situation: e.target.value }))}
                        placeholder="Ex : Un coureur régulier refuse de signer la décharge obligatoire."
                        className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-sans font-semibold text-white focus:outline-none focus:border-[#FF5C00] h-20"
                        required
                      />
                    </div>
                  )}

                  {activeAction === 'motiver_crew' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-black uppercase text-neutral-400">Objectif de motivation</label>
                      <textarea
                        value={inputs.goal}
                        onChange={(e) => setInputs(prev => ({ ...prev, goal: e.target.value }))}
                        placeholder="Ex : Motiver le crew à venir ce soir malgré la pluie battante."
                        className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-sans font-semibold text-white focus:outline-none focus:border-[#FF5C00] h-20"
                        required
                      />
                    </div>
                  )}

                  {activeAction === 'mot_coureur' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-black uppercase text-neutral-400">Prénom du coureur</label>
                        <input
                          type="text"
                          value={inputs.runnerName}
                          onChange={(e) => setInputs(prev => ({ ...prev, runnerName: e.target.value }))}
                          placeholder="Ex : Julien"
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-sans font-semibold text-white focus:outline-none focus:border-[#FF5C00]"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-black uppercase text-neutral-400">Objectif</label>
                        <select
                          value={inputs.context}
                          onChange={(e) => setInputs(prev => ({ ...prev, context: e.target.value }))}
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-sans font-semibold text-white focus:outline-none focus:border-[#FF5C00]"
                        >
                          <option value="Nouveau membre à accueillir chaleureusement">Accueillir un nouveau</option>
                          <option value="Coureur absent depuis plusieurs sessions à relancer">Relancer un absent</option>
                          <option value="Féliciter pour sa progression ou régularité">Célébrer sa progression</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeAction === 'custom' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-black uppercase text-neutral-400">Ta demande</label>
                      <textarea
                        value={inputs.customPrompt}
                        onChange={(e) => setInputs(prev => ({ ...prev, customPrompt: e.target.value }))}
                        placeholder="Ex : Rédige une annonce de partenariat avec le café du quartier..."
                        className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-sans font-semibold text-white focus:outline-none focus:border-[#FF5C00] h-20"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#FF5C00] hover:bg-white text-white hover:text-black py-2.5 text-[10px] font-mono font-black uppercase tracking-wider transition-all"
                  >
                    Demander au Copilote
                  </button>
                </form>
              )}

              {/* Quick action buttons list */}
              {!activeAction && !loading && (
                <div className="space-y-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                  <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                    ⚡ Raccourcis Copilote
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <button
                      onClick={() => setActiveAction('rediger_message')}
                      className="p-2.5 border border-white/5 bg-black/30 hover:bg-[#FF5C00] hover:border-transparent rounded-lg transition-all text-[10px] font-black uppercase tracking-wider text-left"
                    >
                      ✍️ Message
                    </button>
                    <button
                      onClick={() => setActiveAction('gerer_situation')}
                      className="p-2.5 border border-white/5 bg-black/30 hover:bg-[#FF5C00] hover:border-transparent rounded-lg transition-all text-[10px] font-black uppercase tracking-wider text-left"
                    >
                      💬 Situation
                    </button>
                    <button
                      onClick={() => setActiveAction('motiver_crew')}
                      className="p-2.5 border border-white/5 bg-black/30 hover:bg-[#FF5C00] hover:border-transparent rounded-lg transition-all text-[10px] font-black uppercase tracking-wider text-left"
                    >
                      🎉 Motiver
                    </button>
                    <button
                      onClick={() => setActiveAction('mot_coureur')}
                      className="p-2.5 border border-white/5 bg-black/30 hover:bg-[#FF5C00] hover:border-transparent rounded-lg transition-all text-[10px] font-black uppercase tracking-wider text-left"
                    >
                      🙋 Coureur
                    </button>
                  </div>
                </div>
              )}

              {/* Error box */}
              {chatError && (
                <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-3 text-center flex items-center gap-2 justify-center">
                  <Info size={12} className="text-red-400" />
                  <p className="text-[9px] text-red-300 font-mono font-bold uppercase tracking-wider">{chatError}</p>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Chat Input (only if not free plan) */}
        {!isFreePlan && (
          <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md relative z-10 space-y-3">
            {limitExceeded ? (
              <div className="text-center py-2 bg-neutral-900/50 rounded-lg">
                <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  🌙 Limite de 20 requêtes journalières atteinte.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Pose une question libre sur ton crew..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white/5 border border-white/10 focus:border-[#FF5C00] rounded-md px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-all font-sans"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || sending}
                  className="bg-[#FF5C00] disabled:bg-white/10 disabled:text-white/30 text-white px-3.5 py-2.5 rounded-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Send size={14} className="stroke-[2.5]" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center text-[8px] font-mono text-white/30 uppercase tracking-widest">
              <span>Fiche médicale et GPS masqués</span>
              <span>{Math.max(0, 20 - chatCallsCount)}/20 restants</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
