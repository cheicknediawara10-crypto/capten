'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Zap, Smartphone, CheckCircle2, Clock, X, Check, 
  Copy, Search, Sliders, ArrowRight, Share2, Sparkles, HelpCircle, Lock
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// === HELPERS MÉTÉO ===
function getCoordinates(location: string): { latitude: number; longitude: number } {
  const loc = (location || '').toLowerCase();
  if (loc.includes('paris')) return { latitude: 48.8566, longitude: 2.3522 };
  if (loc.includes('lyon')) return { latitude: 45.7640, longitude: 4.8357 };
  if (loc.includes('marseille')) return { latitude: 43.2965, longitude: 5.3698 };
  if (loc.includes('bordeaux')) return { latitude: 44.8378, longitude: -0.5792 };
  if (loc.includes('strasbourg')) return { latitude: 48.5734, longitude: 7.7521 };
  if (loc.includes('lille')) return { latitude: 50.6292, longitude: 3.0573 };
  if (loc.includes('nice')) return { latitude: 43.7102, longitude: 7.2620 };
  if (loc.includes('toulouse')) return { latitude: 43.6047, longitude: 1.4442 };
  if (loc.includes('nantes')) return { latitude: 47.2184, longitude: -1.5536 };
  if (loc.includes('montpellier')) return { latitude: 43.6108, longitude: 3.8767 };
  return { latitude: 48.8566, longitude: 2.3522 }; // Paris par défaut
}

function getWeatherDesc(code: number): { emoji: string; desc: string; isStorm: boolean } {
  if (code === 0) return { emoji: '☀️', desc: 'Ciel dégagé', isStorm: false };
  if (code <= 2) return { emoji: '🌤️', desc: 'Partiellement nuageux', isStorm: false };
  if (code === 3) return { emoji: '☁️', desc: 'Couvert', isStorm: false };
  if (code <= 49) return { emoji: '🌫️', desc: 'Brouillard', isStorm: false };
  if (code <= 59) return { emoji: '🌦️', desc: 'Bruine', isStorm: false };
  if (code <= 65) return { emoji: '🌧️', desc: 'Pluie', isStorm: false };
  if (code <= 77) return { emoji: '❄️', desc: 'Neige', isStorm: false };
  if (code <= 82) return { emoji: '🌧️', desc: 'Averses', isStorm: false };
  if (code <= 99) return { emoji: '⛈️', desc: 'Orage', isStorm: true };
  return { emoji: '🌡️', desc: 'Inconnu', isStorm: false };
}
// === FIN HELPERS MÉTÉO ===


// --- TYPES ---
type TemplateCategory = 'avant_run' | 'pendant_run' | 'apres_run' | 'social_spot' | 'accueil';

interface MessageTemplate {
  id: string;
  category: TemplateCategory;
  label: string;
  contextHint: string;
  templateText: string;
}

// --- CONSTANTS: 25 HARDCODED TEMPLATES ---
const TEMPLATES_DATABASE: MessageTemplate[] = [
  // --- CATÉGORIE 1 : AVANT LE RUN ---
  {
    id: "1.1",
    category: "avant_run",
    label: "Rappel run J-0",
    contextHint: "À envoyer 30-60 min avant un run classique.",
    templateText: "{{club_name}} 📍\nCe soir, on se retrouve à {{run_time}} pour notre run habituel.\n{{run_distance}}km, {{weather}}.\n{{run_url}}"
  },
  {
    id: "1.2",
    category: "avant_run",
    label: "Rappel motivation J-0",
    contextHint: "À envoyer quand l'engagement est faible.",
    templateText: "{{club_name}} 🏃\nCe soir {{run_time}}. La journée a été longue, c'est exactement pour ça qu'on court ensemble.\n{{run_url}}"
  },
  {
    id: "1.3",
    category: "avant_run",
    label: "Rappel météo difficile J-0",
    contextHint: "Pluie, froid, vent. On court quand même.",
    templateText: "{{club_name}} 🌧️\nCe soir on court quand même. {{weather}}.\nPrends un k-way, on y va tranquille.\n{{run_url}}"
  },
  {
    id: "1.4",
    category: "avant_run",
    label: "Rappel canicule J-0",
    contextHint: "Forte chaleur, consignes de sécurité.",
    templateText: "{{club_name}} ☀️\nCe soir, 35°C, forte chaleur. On se retrouve à {{run_time}}.\nPense à prendre de l'eau, on y va tranquille.\n{{run_url}}"
  },
  {
    id: "1.5",
    category: "avant_run",
    label: "Rappel veille J-1",
    contextHint: "À envoyer la veille pour bloquer l'agenda.",
    templateText: "{{club_name}} 📅\nRun demain soir {{run_time}}. {{run_distance}}km, {{run_name}}.\nInscriptions ouvertes (places limitées) :\n{{run_url}}"
  },
  {
    id: "1.6",
    category: "avant_run",
    label: "Run complet",
    contextHint: "Run complet, pousser les gens à libérer leur place.",
    templateText: "{{club_name}} 🔒\nLe run de ce soir est complet.\nSi tu as un contretemps, libère ta place pour les copains :\n{{run_url}}"
  },
  {
    id: "1.7",
    category: "avant_run",
    label: "Place libérée (Liste d'attente)",
    contextHint: "En DM au premier de la liste d'attente.",
    templateText: "{{club_name}} ⚡\nUne place s'est libérée pour le run de ce soir !\nDis-moi vite si tu es toujours chaud pour venir :\n{{run_url}}"
  },
  {
    id: "1.8",
    category: "avant_run",
    label: "Premier run d'un nouveau",
    contextHint: "En DM de bienvenue à un nouveau membre.",
    templateText: "{{club_name}} 👋\nBienvenue dans le crew ! On court ensemble ce soir à {{run_time}}.\nSigne juste ta décharge en ligne avant de venir :\n{{run_url}}"
  },
  // --- CATÉGORIE 2 : PENDANT LE RUN ---
  {
    id: "2.1",
    category: "pendant_run",
    label: "Départ imminent",
    contextHint: "Pour presser les retardataires au point de RDV.",
    templateText: "{{club_name}} ⏱️\nDépart dans 5 minutes. On part à l'heure.\nSi tu arrives après {{run_time}}, rejoins-nous au {{run_location}}.\n{{run_url}}"
  },
  {
    id: "2.2",
    category: "pendant_run",
    label: "Annulation météo extrême",
    contextHint: "Orage, tempête, neige. Sécurité d'abord.",
    templateText: "{{club_name}} ❌\nPas de run ce soir, la météo s'annonce trop mauvaise.\nPrenez soin de vous, on se retrouve le {{next_run_date}} !"
  },
  {
    id: "2.3",
    category: "pendant_run",
    label: "Annulation / Report",
    contextHint: "Problème de dernière minute du Captain.",
    templateText: "{{club_name}} ❌\nPetit imprévu ce soir, je dois annuler le run.\nOn se rattrape le {{next_run_date}} même heure, même endroit !"
  },
  // --- CATÉGORIE 3 : APRÈS LE RUN ---
  {
    id: "3.1",
    category: "apres_run",
    label: "Débrief standard",
    contextHint: "Le lendemain matin. Simple, sobre.",
    templateText: "{{club_name}} ✅\nMerci d'être venus hier, on était {{checkin_count}} !\nLes présences et stats du crew sont à jour :\n{{stats_url}}"
  },
  {
    id: "3.2",
    category: "apres_run",
    label: "Record de présence",
    contextHint: "Quand le taux de présence est historique.",
    templateText: "{{club_name}} 🏆\nRecord battu hier soir, on était {{checkin_count}} sur place !\nTout le monde était présent, merci pour l'énergie :\n{{stats_url}}"
  },
  {
    id: "3.3",
    category: "apres_run",
    label: "Débrief avec cagnotte",
    contextHint: "Si une cagnotte était active.",
    templateText: "{{club_name}} ☕\nSuper run hier, on était {{checkin_count}}.\nMerci pour vos dons : {{pot_amount}}€ récoltés pour le café !\nProchain run le {{next_run_date}}."
  },
  {
    id: "3.4",
    category: "apres_run",
    label: "Challenge complété",
    contextHint: "Quand un objectif collectif est atteint.",
    templateText: "{{club_name}} 🎯\nChallenge \"{{challenge_name}}\" validé !\nOn a fait {{challenge_result}} ensemble en {{challenge_duration}} :\n{{stats_url}}"
  },
  {
    id: "3.5",
    category: "apres_run",
    label: "Rappel no-show",
    contextHint: "En DM privé uniquement. Jamais en groupe.",
    templateText: "{{club_name}} 👋\nHey {{first_name}}, ça fait un petit moment qu'on t'a pas vu !\nTout va bien ? N'hésite pas à passer au run du {{next_run_date}} :\n{{run_url}}"
  },
  {
    id: "3.6",
    category: "apres_run",
    label: "Après-run social spot",
    contextHint: "Après un run festif avec lieu de retrouvailles.",
    templateText: "{{club_name}} 🍺\nMerci à tous pour la bonne ambiance ce soir.\nOn se retrouve au {{spot_name}} pour boire un coup !\n{{spot_address}}"
  },
  {
    id: "3.7",
    category: "apres_run",
    label: "After-run cagnotte",
    contextHint: "Boisson offerte par la cagnotte du club.",
    templateText: "{{club_name}} ☕\nCe soir, le run se termine au social spot.\nLes boissons des nouveaux sont offertes par la cagnotte du club !\n{{run_url}}"
  },
  {
    id: "3.8",
    category: "apres_run",
    label: "BIEN RENTRÉ ?",
    contextHint: "Vérifier que tout le monde est bien rentré après le run.",
    templateText: "Run fini ! J'espère que vous avez kiffé 🔥\nConfirme que t'es bien rentré(e) 👇\n{{lien_check_retour}}"
  },
  // --- CATÉGORIE 4 : SOCIAL SPOT ---
  {
    id: "5.1",
    category: "social_spot",
    label: "Template 5.1 — Annonce du spot",
    contextHint: "À envoyer après le run",
    templateText: "{{club_name}} ☕\nAprès le run ce soir, on se retrouve au {{spot_name}} !\nAdresse : {{spot_address}}\n{{spot_message}}"
  },
  {
    id: "5.2",
    category: "social_spot",
    label: "Template 5.2 — Débrief + spot",
    contextHint: "Le lendemain matin",
    templateText: "{{club_name}} ✅\nOn était {{checkin_count}} coureurs hier soir, merci pour l'énergie.\nOn se retrouve au prochain run le {{next_run_date}} !"
  },
  {
    id: "5.3",
    category: "social_spot",
    label: "Template 5.3 — Cagnotte au spot",
    contextHint: "Si une cagnotte était active",
    templateText: "{{club_name}} 🎉\n{{pot_amount}}€ collectés dans la cagnotte ce soir.\nCafé offert pour tout le monde au {{spot_name}} !"
  },
  {
    id: "5.4",
    category: "social_spot",
    label: "Offre partenaire",
    contextHint: "Partage un code promo ou un deal exclusif avec ton crew",
    templateText: "{{club_name}} 🤝\n\n{{partner_name}} offre {{offer_description}}\nà tous les membres du crew.\n\nCode : {{promo_code}}\nValable jusqu'au {{expiry_date}}."
  },
  {
    id: "6.1",
    category: "accueil",
    label: "Bienvenue anti-stress",
    contextHint: "Dès l'inscription d'un nouveau membre dans le crew.",
    templateText: "Salut {{first_name}} ! 👋\nBienvenue dans le crew {{club_name}}.\nIci, zéro pression : on court pour le plaisir et pour se rencontrer. Pas de chrono, on s'adapte à tout le monde.\nHâte de te voir sur notre prochain run ! {{prenom_capitaine}}"
  },
  {
    id: "6.2",
    category: "accueil",
    label: "Après le premier run",
    contextHint: "À envoyer 1-2h après son tout premier run.",
    templateText: "Félicitations pour ton premier run avec nous {{first_name}} ! 🎉\nJ'espère que tu as passé un bon moment et que l'ambiance t'a plu. On se retrouve très vite pour le prochain run (et l'after-run au {{lieu_after}} !).\nÀ bientôt, {{prenom_capitaine}}"
  },
  {
    id: "6.3",
    category: "accueil",
    label: "Relance en douceur",
    contextHint: "Si un nouveau n'est pas revenu après 2 semaines.",
    templateText: "Salut {{first_name}} ! 👋\nÇa fait déjà deux semaines qu'on ne t'a pas vu sur les runs de {{club_name}}.\nOn espère que tout va bien de ton côté. Nos prochaines sessions sont déjà ouvertes si tu veux nous rejoindre, la porte est toujours grande ouverte ! {{prenom_capitaine}}"
  }
];

// --- TEMPLATE PARSER ENGINE ---
function parseTemplateText(text: string, run: any, club: any): string {
  if (!text) return "";
  return text
    .replace(/\{\{club_name\}\}/g, club.name || "")
    .replace(/\{\{run_name\}\}/g, run.name || "")
    .replace(/\{\{run_time\}\}/g, run.time || "")
    .replace(/\{\{run_distance\}\}/g, String(run.distance || ""))
    .replace(/\{\.weather\}\}/g, run.weather || "")
    .replace(/\{\{weather\}\}/g, run.weather || "")
    .replace(/\{\{run_url\}\}/g, run.run_url || "")
    .replace(/\{\{stats_url\}\}/g, club.stats_url || "")
    .replace(/\{\{donation_url\}\}/g, run.donation_url || "")
    .replace(/\{\{sponsor_url\}\}/g, run.sponsor_url || "")
    .replace(/\{\{report_url\}\}/g, run.report_url || "")
    .replace(/\{\{capacity\}\}/g, String(run.capacity || ""))
    .replace(/\{\{registered_count\}\}/g, String(run.registered_count || ""))
    .replace(/\{\{spot_name\}\}/g, club.spot_name || "")
    .replace(/\{\{spot_address\}\}/g, club.spot_address || "")
    .replace(/\{\{spot_message\}\}/g, club.spot_message || "")
    .replace(/\{\{checkin_count\}\}/g, String(run.checkin_count || ""))
    .replace(/\{\{next_run_date\}\}/g, run.next_run_date || "")
    .replace(/\{\{pot_amount\}\}/g, String(run.pot_amount || ""))
    .replace(/\{\{challenge_name\}\}/g, run.challenge_name || "")
    .replace(/\{\{challenge_result\}\}/g, run.challenge_result || "")
    .replace(/\{\{challenge_duration\}\}/g, run.challenge_duration || "")
    .replace(/\{\{first_name\}\}/g, run.first_name || "")
    .replace(/\{\{absence_count\}\}/g, String(run.absence_count || ""))
    .replace(/\{\{run_location\}\}/g, run.run_location || "")
    .replace(/\{\{weather_condition\}\}/g, run.weather_condition || "")
    .replace(/\{\{partner_name\}\}/g, club.partner_name || "")
    .replace(/\{\{offer_description\}\}/g, club.offer_description || "")
    .replace(/\{\{promo_code\}\}/g, club.promo_code || "")
    .replace(/\{\{expiry_date\}\}/g, club.expiry_date || "")
    .replace(/\{\{prenom_capitaine\}\}/g, (club.coaches && club.coaches[0]?.name) || "Le Captain")
    .replace(/\{\{lieu_after\}\}/g, club.spot_name || "after-run")
    .replace(/\{\{lien_rdv\}\}/g, run.run_url || "")
    .replace(/\{\{lien_check_retour\}\}/g, run.short_code ? `capten.app/r/${run.short_code}` : "capten.app/r/xxxxxx");
}

// --- SUBCOMPONENT: LIVE WHATSAPP CHAT BUBBLE PREVIEW ---
interface WhatsAppBubblePreviewProps {
  text: string;
  clubName: string;
}

const WhatsAppBubblePreview = React.memo(({ text, clubName }: WhatsAppBubblePreviewProps) => {
  // Parses WhatsApp markdown syntax into HTML safely
  const formatWhatsAppText = (rawText: string) => {
    if (!rawText) return "";
    let escaped = rawText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Bold (*text*)
    escaped = escaped.replace(/\*(.*?)\*/g, '<strong class="font-black">$1</strong>');
    // Italic (_text_)
    escaped = escaped.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
    // Strikethrough (~text~)
    escaped = escaped.replace(/~(.*?)~/g, '<del class="line-through opacity-60">$1</del>');
    // Line breaks
    escaped = escaped.replace(/\n/g, '<br />');
    
    return escaped;
  };

  return (
    <div className="w-[280px] h-[480px] bg-black rounded-[40px] shadow-2xl border-[6px] border-black overflow-hidden flex flex-col relative z-10 shrink-0 select-none">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-xl z-50 flex items-center justify-center">
        <div className="w-10 h-0.5 bg-white/20 rounded-full" />
      </div>

      {/* WhatsApp Header */}
      <header className="bg-[#075E54] text-white pt-6 pb-2 px-3 flex items-center gap-2 relative z-10">
        <div className="w-2 h-2 border-t-2 border-l-2 border-white -rotate-45 mt-0.5" />
        <div className="w-7 h-7 rounded-full bg-[#12131C] border border-white/10 flex items-center justify-center text-[10px] font-mono font-black text-[#FF5C00]">
          {clubName ? clubName.substring(0, 2).toUpperCase() : "BR"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-black truncate">{clubName || "Run Club"}</h4>
          <p className="text-[7.5px] text-white/70 leading-none">Groupe WhatsApp</p>
        </div>
        <span className="text-white text-xs opacity-75">⋮</span>
      </header>

      {/* Chat Speech Area */}
      <div className="flex-1 bg-[#E5DDD5] p-3 flex flex-col justify-end overflow-y-auto pb-4">
        <div className="max-w-[90%] bg-white rounded-lg rounded-tl-none p-3.5 shadow-md relative text-black text-[11px] leading-relaxed">
          <div className="absolute top-0 -left-1.5 w-1.5 h-2.5 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)]" />
          <p 
            className="text-black/90 font-medium select-text cursor-text font-sans break-words"
            dangerouslySetInnerHTML={{ __html: formatWhatsAppText(text) }}
          />
          <div className="flex justify-end items-center gap-1 mt-1.5">
            <span className="text-[7.5px] text-[#A3A8B8] font-bold">17:48</span>
            <div className="flex text-[#34B7F1] text-[9px] font-black leading-none">✓✓</div>
          </div>
        </div>
      </div>

      {/* Message footer */}
      <footer className="p-2 bg-[#F4F5F7] flex items-center gap-2 border-t border-black/5 z-20">
        <div className="flex-1 bg-white rounded-full px-3 py-1 text-[8.5px] text-[#A3A8B8] font-bold">
          Tapez un message...
        </div>
        <div className="w-6 h-6 rounded-full bg-[#075E54] flex items-center justify-center text-white text-[10px] font-bold">
          🎤
        </div>
      </footer>
    </div>
  );
});
WhatsAppBubblePreview.displayName = "WhatsAppBubblePreview";

// --- SUBCOMPONENT: MEMOIZED TEMPLATE CARD ---
interface TemplateCardProps {
  template: MessageTemplate;
  parsedPreview: string;
  categoryLabel: string;
  onSelect: (template: MessageTemplate) => void;
  isDisabled?: boolean;
  tooltip?: string;
}

const TemplateCard = React.memo(({ template, parsedPreview, categoryLabel, onSelect, isDisabled, tooltip }: TemplateCardProps) => {
  return (
    <div 
      onClick={() => {
        if (isDisabled) return;
        onSelect(template);
      }}
      title={tooltip}
      className={`relative overflow-hidden rounded-[20px] border p-5 transition-all duration-300 group shadow-sm flex flex-col justify-between select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        isDisabled 
          ? 'border-black/5 bg-neutral-50/50 opacity-45 cursor-not-allowed' 
          : 'border-black/10 bg-white hover:border-[#FF5C00] hover:shadow-md hover:-translate-y-1 active:translate-y-0 cursor-pointer'
      }`}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-label={isDisabled ? `${template.label} - ${tooltip}` : `Sélectionner le modèle : ${template.label}`}
    >
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5C00]/0 to-transparent transition-all duration-500 group-hover:via-[#FF5C00]/50"></div>
      
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className="font-mono text-[9px] text-[#FF5C00] uppercase tracking-widest bg-[#FF5C00]/10 border border-[#FF5C00]/20 px-2.5 py-0.5 rounded-full font-bold">
            {template.id}
          </span>
          <span className="font-mono text-[9px] text-neutral-500 uppercase">
            {categoryLabel}
          </span>
        </div>

        <h3 className="font-display font-black italic uppercase text-lg text-black leading-tight tracking-tight group-hover:text-[#FF5C00] transition-colors">
          {template.label}
        </h3>
        
        <p className="text-[10px] text-neutral-500 italic mt-1 font-sans">
          {template.contextHint}
        </p>

        <div className="bg-[#F4F5F7] border border-black/5 rounded-xl p-3.5 text-xs text-neutral-700 font-sans italic mt-4 relative max-h-24 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
          {parsedPreview}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-neutral-600 group-hover:text-black transition-colors flex items-center gap-1.5 font-bold">
          {isDisabled ? '🔒 INDISPONIBLE' : '🎯 SÉLECTIONNER'} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </span>
        <span className="text-[9px] font-mono text-neutral-500 font-medium">{isDisabled ? tooltip : 'Copie & Partage'}</span>
      </div>
    </div>
  );
});
TemplateCard.displayName = "TemplateCard";

// --- SUBCOMPONENT: MOCK VARIABLE SIMULATOR ---
interface SimulatorPanelProps {
  simulator: any;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  selectedTemplate: any;
}

const SimulatorPanel = React.memo(({ simulator, onChange, onReset, selectedTemplate }: SimulatorPanelProps) => {
  const hasSpot = selectedTemplate && (
    selectedTemplate.templateText.includes("{{spot_name}}") ||
    selectedTemplate.templateText.includes("{{spot_address}}") ||
    selectedTemplate.templateText.includes("{{spot_message}}")
  );

  const hasPartner = selectedTemplate && (
    selectedTemplate.templateText.includes("{{partner_name}}") ||
    selectedTemplate.templateText.includes("{{promo_code}}") ||
    selectedTemplate.templateText.includes("{{offer_description}}") ||
    selectedTemplate.templateText.includes("{{expiry_date}}")
  );

  if (!hasSpot && !hasPartner) return null;

  return (
    <div className="sticky top-6 bg-white border border-[#E5E5E5] rounded-[24px] p-6 shadow-sm space-y-6 select-none">
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF5C00]/40 to-transparent"></div>

      <div className="flex justify-between items-center border-b border-black/5 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#FF5C00]" />
          <h3 className="font-display font-black italic uppercase text-lg tracking-tight text-black">
            Infos supplémentaires
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] font-mono font-bold text-neutral-500 hover:text-black border border-black/10 px-2.5 py-1 rounded hover:bg-[#F4F5F7] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
        >
          RESET
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {hasSpot && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider flex justify-between items-center">
                <span>Nom du Spot</span>
                <span className="text-[#FF5C00] normal-case text-[9px] tracking-normal">{"{{spot_name}}"}</span>
              </label>
              <input
                type="text"
                value={simulator.spot_name || ""}
                onChange={(e) => onChange("spot_name", e.target.value)}
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider flex justify-between items-center">
                <span>Adresse du Spot</span>
                <span className="text-[#FF5C00] normal-case text-[9px] tracking-normal">{"{{spot_address}}"}</span>
              </label>
              <input
                type="text"
                value={simulator.spot_address || ""}
                onChange={(e) => onChange("spot_address", e.target.value)}
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider flex justify-between items-center">
                <span>Message du Spot</span>
                <span className="text-[#FF5C00] normal-case text-[9px] tracking-normal">{"{{spot_message}}"}</span>
              </label>
              <input
                type="text"
                value={simulator.spot_message || ""}
                onChange={(e) => onChange("spot_message", e.target.value)}
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
              />
            </div>
          </>
        )}

        {hasPartner && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider flex justify-between items-center">
                <span>Nom du Partenaire</span>
                <span className="text-[#FF5C00] normal-case text-[9px] tracking-normal">{"{{partner_name}}"}</span>
              </label>
              <input
                type="text"
                value={simulator.partner_name || ""}
                onChange={(e) => onChange("partner_name", e.target.value)}
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider flex justify-between items-center">
                <span>Description de l&apos;offre</span>
                <span className="text-[#FF5C00] normal-case text-[9px] tracking-normal">{"{{offer_description}}"}</span>
              </label>
              <input
                type="text"
                value={simulator.offer_description || ""}
                onChange={(e) => onChange("offer_description", e.target.value)}
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider flex justify-between items-center">
                <span>Code Promo</span>
                <span className="text-[#FF5C00] normal-case text-[9px] tracking-normal">{"{{promo_code}}"}</span>
              </label>
              <input
                type="text"
                value={simulator.promo_code || ""}
                onChange={(e) => onChange("promo_code", e.target.value)}
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider flex justify-between items-center">
                <span>Date d&apos;expiration</span>
                <span className="text-[#FF5C00] normal-case text-[9px] tracking-normal">{"{{expiry_date}}"}</span>
              </label>
              <input
                type="text"
                value={simulator.expiry_date || ""}
                onChange={(e) => onChange("expiry_date", e.target.value)}
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
              />
            </div>
          </>
        )}
      </div>

      <div className="bg-[#F4F5F7] border border-black/5 p-4 rounded-[16px] text-[10px] font-mono text-neutral-500 leading-relaxed relative">
        <div className="flex gap-2 items-center text-[#FF5C00] font-black uppercase tracking-wider mb-1.5">
          <Sparkles className="w-3 h-3 animate-pulse" />
          ASTUCE
        </div>
        Aucun frais. Copie le texte et colle-le directement dans ton groupe WhatsApp. C&apos;est tout.
      </div>
    </div>
  );
});
SimulatorPanel.displayName = "SimulatorPanel";

// --- SUBCOMPONENT: KEYBOARD-RESILIENT MODAL EDITOR / BOTTOM SHEET ---
interface MessageEditorModalProps {
  selectedTemplate: MessageTemplate;
  simulator: any;
  editedText: string;
  setEditedText: (text: string) => void;
  isEditingBase: boolean;
  setIsEditingBase: (edit: boolean) => void;
  editBaseLabel: string;
  setEditBaseLabel: (label: string) => void;
  editBaseHint: string;
  setEditBaseHint: (hint: string) => void;
  editBaseText: string;
  setEditBaseText: (text: string) => void;
  copyFeedback: boolean;
  onCopy: () => void;
  onShare: () => void;
  onSaveBase: () => void;
  onResetBase: () => void;
  onClose: () => void;
}

const MessageEditorModal = React.memo(({
  selectedTemplate,
  simulator,
  editedText,
  setEditedText,
  isEditingBase,
  setIsEditingBase,
  editBaseLabel,
  setEditBaseLabel,
  editBaseHint,
  setEditBaseHint,
  editBaseText,
  setEditBaseText,
  copyFeedback,
  onCopy,
  onShare,
  onSaveBase,
  onResetBase,
  onClose
}: MessageEditorModalProps) => {

  const previewTextToShow = useMemo(() => {
    if (isEditingBase) {
       const clubData = {
        name: simulator.club_name,
        stats_url: simulator.stats_url,
        spot_name: simulator.spot_name,
        spot_address: simulator.spot_address,
        spot_message: simulator.spot_message,
        partner_name: simulator.partner_name,
        offer_description: simulator.offer_description,
        promo_code: simulator.promo_code,
        expiry_date: simulator.expiry_date
      };
      const runData = {
        name: simulator.run_name,
        time: simulator.run_time,
        distance: simulator.run_distance,
        weather: simulator.weather,
        run_url: simulator.run_url,
        capacity: simulator.capacity,
        registered_count: simulator.registered_count,
        checkin_count: simulator.checkin_count,
        next_run_date: simulator.next_run_date,
        pot_amount: simulator.pot_amount,
        challenge_name: simulator.challenge_name,
        challenge_result: simulator.challenge_result,
        challenge_duration: simulator.challenge_duration,
        first_name: simulator.first_name,
        absence_count: simulator.absence_count,
        run_location: simulator.run_location,
        weather_condition: simulator.weather_condition
      };
      return parseTemplateText(editBaseText, runData, clubData);
    }
    return editedText;
  }, [isEditingBase, editBaseText, editedText, simulator]);

  const insertVariableTag = useCallback((tag: string) => {
    setEditBaseText(editBaseText + tag);
  }, [editBaseText, setEditBaseText]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div 
        className="relative bg-white border border-black/10 w-full lg:max-w-[850px] rounded-t-[28px] lg:rounded-[28px] shadow-2xl z-10 flex flex-col lg:flex-row h-[85vh] lg:h-[75vh] overflow-hidden transition-transform duration-300 transform translate-y-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Mobile drag handle line */}
        <div className="w-12 h-1 bg-black/20 rounded-full mx-auto my-3 block lg:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F4F5F7] hover:bg-black/5 w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-black transition-all z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]"
          aria-label="Fermer la boîte de dialogue"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT SIDE: EDIT CONTROLS */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between h-full overflow-hidden">
          
          {/* Scrollable controls panel */}
          <div className="flex-1 overflow-y-auto space-y-5 pb-6">
            
            {/* Switch Mode tabs (ARIA compliance) */}
            <div role="tablist" aria-label="Édition de message" className="flex bg-[#F4F5F7] p-1 rounded-xl border border-black/5 gap-1 shrink-0">
              <button
                role="tab"
                aria-selected={!isEditingBase}
                onClick={() => setIsEditingBase(false)}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] ${
                  !isEditingBase
                    ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/25'
                    : 'text-neutral-500 hover:text-black hover:bg-black/5'
                }`}
              >
                💬 Personnaliser
              </button>
              <button
                role="tab"
                aria-selected={isEditingBase}
                onClick={() => setIsEditingBase(true)}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] ${
                  isEditingBase
                    ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/25'
                    : 'text-neutral-500 hover:text-black hover:bg-black/5'
                }`}
              >
                ⚙️ Master Template
              </button>
            </div>

            {!isEditingBase ? (
              /* --- MODE CUSTOM SEND --- */
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[9px] text-[#FF5C00] uppercase tracking-widest font-black">
                    RETREMPER AVANT L'ENVOI
                  </span>
                  <h3 id="modal-title" className="text-xl sm:text-2xl font-display italic font-black uppercase text-black tracking-tight mt-1 leading-tight">
                    {selectedTemplate.label}
                  </h3>
                  <p className="text-[11px] text-neutral-500 italic mt-1 leading-normal">
                    {selectedTemplate.contextHint}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="custom-textarea" className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest block">
                    Modifier le message final
                  </label>
                  <textarea
                    id="custom-textarea"
                    rows={7}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-black/5 rounded-2xl px-4 py-3 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white resize-none leading-relaxed font-sans focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
                  />
                  <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                    <span>{editedText.length} caractères</span>
                    <span>Modifications locales temporaires</span>
                  </div>
                </div>

                <div className="bg-[#F4F5F7] border border-black/5 rounded-xl p-4 text-[10px] text-neutral-500 leading-relaxed">
                  <span className="font-black text-[#FF5C00] block uppercase tracking-wider mb-1">CONSIGNE DU RUN</span>
                  Ajoutez vos remarques (ex: météo locale, retard ou ravitaillement). Cela n'écrase pas le modèle général.
                </div>
              </div>
            ) : (
              /* --- MODE MASTER EDIT --- */
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[9px] text-[#FF5C00] uppercase tracking-widest font-black">
                    ÉDITER LA SOURCE COMMUNE
                  </span>
                  <h3 id="modal-title" className="text-xl font-display italic font-black uppercase text-black tracking-tight mt-1 leading-tight">
                    Texte maître du modèle
                  </h3>
                  <p className="text-[11px] text-neutral-500 italic mt-1 leading-normal">
                    Écrase la formulation standard pour toutes vos prochaines sessions.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="master-label" className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest block">
                    Titre du modèle
                  </label>
                  <input
                    id="master-label"
                    type="text"
                    value={editBaseLabel}
                    onChange={(e) => setEditBaseLabel(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="master-hint" className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest block">
                    Indication de contexte
                  </label>
                  <input
                    id="master-hint"
                    type="text"
                    value={editBaseHint}
                    onChange={(e) => setEditBaseHint(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="master-textarea" className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest block">
                    Modèle avec tags
                  </label>
                  <textarea
                    id="master-textarea"
                    rows={4}
                    value={editBaseText}
                    onChange={(e) => setEditBaseText(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-black/5 rounded-2xl px-4 py-3 text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white resize-none leading-relaxed font-mono focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-black text-neutral-500 uppercase tracking-widest block">
                    Variables (Cliquez pour insérer) :
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { l: "Club", t: "{{club_name}}" },
                      { l: "Run", t: "{{run_name}}" },
                      { l: "Heure", t: "{{run_time}}" },
                      { l: "Distance", t: "{{run_distance}}" },
                      { l: "Météo", t: "{{weather}}" },
                      { l: "Lien Check-In", t: "{{run_url}}" },
                      { l: "Lien Retour", t: "{{lien_check_retour}}" },
                      { l: "Lien Stats", t: "{{stats_url}}" },
                      { l: "Lien Don", t: "{{donation_url}}" },
                      { l: "Lien Sécurité", t: "{{report_url}}" },
                      { l: "Capacité", t: "{{capacity}}" },
                      { l: "Inscrits", t: "{{registered_count}}" },
                      { l: "Partenaire", t: "{{partner_name}}" },
                      { l: "Offre", t: "{{offer_description}}" },
                      { l: "Code", t: "{{promo_code}}" },
                      { l: "Expiration", t: "{{expiry_date}}" }
                    ].map((v) => (
                      <button
                        key={v.t}
                        type="button"
                        onClick={() => insertVariableTag(v.t)}
                        className="bg-black/5 border border-black/5 rounded-lg px-2 py-1 text-[8px] font-mono text-[#FF5C00] hover:bg-[#FF5C00] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
                      >
                        {v.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky action footer (Fixed on mobile viewports right above keyboard) */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-black/10 -mx-6 sm:-mx-8 px-6 sm:px-8 mt-auto z-10 shrink-0">
            <div className="flex gap-3">
              {!isEditingBase ? (
                <>
                  <button
                    onClick={onCopy}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] ${
                      copyFeedback 
                        ? 'bg-[#00FF66] text-black shadow-lg shadow-[#00FF66]/20 ring-2 ring-[#00FF66]' 
                        : 'bg-black text-white hover:bg-black/90'
                    }`}
                  >
                    {copyFeedback ? (
                      <>
                        <Check className="w-4 h-4 animate-bounce" />
                        COPIÉ ! ✅
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        COPIER
                      </>
                    )}
                  </button>

                  <button
                    onClick={onShare}
                    className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all active:scale-95 duration-200 min-h-[44px] flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Share2 className="w-4 h-4" />
                    WHATSAPP
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onResetBase}
                    className="flex-1 py-3.5 border border-black/10 hover:bg-black/5 text-neutral-600 hover:text-black rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all active:scale-95 duration-200 min-h-[44px] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    Restaurer
                  </button>

                  <button
                    onClick={onSaveBase}
                    className="flex-[2] py-3.5 bg-[#FF5C00] hover:bg-black text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all active:scale-95 duration-200 min-h-[44px] flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#FF5C00]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]"
                  >
                    Enregistrer modèle
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: LIVE WHATSAPP PREVIEW (HIDDEN ON MOBILE TO PREVENT OVERFLOW AND KEYBOARD STRETCH) */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#F4F5F7] items-center justify-center p-6 relative overflow-hidden h-full">
          {/* WhatsApp background wallpaper overlay */}
          <div className="absolute inset-0 bg-[#ECE5DD] opacity-90" />
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
          
          <WhatsAppBubblePreview 
            text={previewTextToShow} 
            clubName={simulator.club_name} 
          />
        </div>

      </div>
    </div>
  );
});
MessageEditorModal.displayName = "MessageEditorModal";

// --- MAIN PAGE LAYOUT ---
export default function MessagesPage() {
  const { club, isMock, refreshClub } = useAuth();
  const [simulator, setSimulator] = useState({
    club_name: "The Crew Trail",
    run_name: "Morning Vibes",
    run_time: "19h30",
    run_distance: "10",
    weather: "🌤️ 17°C, grand soleil",
    run_url: "capten.app/the-crew-trail/run/xyz",
    stats_url: "capten.app/the-crew-trail/stats",
    donation_url: "capten.app/cagnotte/contribuer",
    report_url: "capten.app/securite/signaler",
    capacity: "50",
    registered_count: "42",
    spot_name: "LE BOOT CAFÉ",
    spot_address: "92 RUE DU FAUBOURG SAINT-MARTIN, PARIS",
    spot_message: "On se retrouve tous au Boot après le run !",
    checkin_count: "14",
    next_run_date: "mardi prochain à 19h30",
    pot_amount: "45",
    challenge_name: "Ragnarok",
    challenge_result: "250 km collectifs",
    challenge_duration: "4 jours",
    first_name: "Alex",
    absence_count: "3",
    run_location: "point de RDV habituel",
    weather_condition: "un orage violent",
    partner_name: "Satisfoot",
    offer_description: "15% de réduction",
    promo_code: "SATIS15",
    expiry_date: "dimanche soir"
  });

  const [templates, setTemplates] = useState<MessageTemplate[]>(TEMPLATES_DATABASE);
  const [activeTab, setActiveTab] = useState<TemplateCategory>('avant_run');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [editedText, setEditedText] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Editing base template state
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [editBaseLabel, setEditBaseLabel] = useState("");
  const [editBaseHint, setEditBaseHint] = useState("");
  const [editBaseText, setEditBaseText] = useState("");

  // Runs lists and selector states
  const [runsList, setRunsList] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [weatherText, setWeatherText] = useState("🌤️ 17°C, grand soleil");

  const selectedRun = useMemo(() => {
    return runsList.find(r => r.id === selectedRunId) || null;
  }, [runsList, selectedRunId]);

  // Load custom configurations and runs on mount
  useEffect(() => {
    let loadedTemplates = TEMPLATES_DATABASE;
    if (isMock) {
      const saved = localStorage.getItem('capten_custom_templates_v2026');
      if (saved) {
        try {
          loadedTemplates = JSON.parse(saved).filter((t: any) => t.id !== "PROMO");
          setTemplates(loadedTemplates);
        } catch (e) {
          console.error("Failed to parse custom templates:", e);
        }
      }
    } else if (club && club.message_templates && Array.isArray(club.message_templates)) {
      loadedTemplates = club.message_templates;
      setTemplates(loadedTemplates);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const promoCode = params.get('promoCode');
      const partnerName = params.get('partnerName');
      const promoDesc = params.get('promoDesc');

      if (promoCode && partnerName) {
        const isUrl = promoCode.startsWith('http');
        const templateText = `🤝 *AVANTAGE MEMBRES - {{club_name}}* 🤝\n\nNous avons déniché un super plan avec notre partenaire *${partnerName.toUpperCase()}* ! 🏃‍♂️🔥\n\n🎁 *Offre :* ${promoDesc || 'Tarif préférentiel'}\n${
          isUrl 
            ? `👇 Profitez de l'offre directement via ce lien :\n${promoCode}` 
            : `⚡ *Votre code promo :* ${promoCode}`
        }\n\nBon run et profitez-en bien ! 👟`;

        const promoTemplate: MessageTemplate = {
          id: "PROMO",
          category: "social_spot",
          label: `Diffusion : ${partnerName.toUpperCase()}`,
          contextHint: `Template généré pour partager l'avantage de ${partnerName}`,
          templateText: templateText
        };

        setTemplates(prev => {
          const filtered = prev.filter(t => t.id !== "PROMO");
          return [promoTemplate, ...filtered];
        });

        setActiveTab("social_spot");
        setSelectedTemplate(promoTemplate);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const urlTab = params.get('tab');
      const urlTemplateId = params.get('templateId');
      const runnerName = params.get('runner_name');

      if (urlTab) {
        setActiveTab(urlTab as any);
        if (urlTemplateId) {
          const t = loadedTemplates.find((temp: any) => temp.id === urlTemplateId);
          if (t) {
            setSelectedTemplate(t);
          }
        }
      }

      if (runnerName) {
        setSimulator(prev => ({
          ...prev,
          first_name: runnerName
        }));
      }
    }
  }, [club, isMock]);

  // Fetch runs list (Supabase with localStorage fallback)
  useEffect(() => {
    async function loadRuns() {
      let loadedRuns: any[] = [];
      try {
        const res = await fetch('/api/runs');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            loadedRuns = data.map((r: any) => {
              const dateObj = new Date(r.date_start);
              const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
              const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
              const formattedDate = dateObj.toString() !== 'Invalid Date'
                ? `${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}`
                : r.date_start;
              
              const formattedTime = dateObj.toString() !== 'Invalid Date'
                ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
                : '';

              return {
                id: r.id,
                status: r.status === 'scheduled' ? 'upcoming' : r.status,
                name: r.title,
                location: r.location_start,
                date: formattedDate,
                time: formattedTime,
                distance: r.distance || '8 KM',
                duration: r.duration || '50 min',
                temp: '19°C',
                weather: 'sun',
                registered: r.slots_taken || 0,
                checkedIn: r.status === 'completed' ? r.slots_taken : 0,
                noShow: 0,
                is_paid: r.is_paid,
                price_cents: r.price_cents,
                max_slots: r.max_slots,
                slots_taken: r.slots_taken || 0,
                vibe: r.vibe || 'Social & Chill',
                coach: r.coach || 'Moi (Propriétaire)',
                description: r.description || '',
                participants: [],
                date_start_raw: r.date_start
              };
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch runs from API in messages:", err);
      }

      if (loadedRuns.length === 0) {
        const stored = localStorage.getItem('capten_runs_v3');
        if (stored) {
          try {
            loadedRuns = JSON.parse(stored);
          } catch (e) {}
        }
      }

      loadedRuns.sort((a, b) => {
        const dateA = a.date_start_raw ? new Date(a.date_start_raw).getTime() : 0;
        const dateB = b.date_start_raw ? new Date(b.date_start_raw).getTime() : 0;
        return dateB - dateA; // latest first
      });

      setRunsList(loadedRuns);
      if (loadedRuns.length > 0) {
        setSelectedRunId(loadedRuns[0].id);
      }
    }
    loadRuns();
  }, []);

  // Fetch weather dynamically for selected run
  useEffect(() => {
    if (!selectedRun) return;
    
    async function fetchWeather() {
      try {
        const location = selectedRun.location || 'Paris';
        const coords = getCoordinates(location);
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`);
        if (!res.ok) return;
        const data = await res.json();
        const current = data.current_weather;
        if (!current) return;
        const mapped = getWeatherDesc(current.weathercode);
        const temp = Math.round(current.temperature);
        setWeatherText(`${mapped.emoji} ${temp}°C, ${mapped.desc}`);
      } catch (err) {
        setWeatherText("🌤️ 17°C, grand soleil");
      }
    }
    fetchWeather();
  }, [selectedRun?.id, selectedRun?.location]);

  // Compute next upcoming run date text
  const nextRunDateText = useMemo(() => {
    const now = new Date().getTime();
    const futureRuns = runsList
      .filter(r => r.date_start_raw && new Date(r.date_start_raw).getTime() > now)
      .sort((a, b) => new Date(a.date_start_raw).getTime() - new Date(b.date_start_raw).getTime());
    return futureRuns.length > 0 ? futureRuns[0].date : (selectedRun?.date || "mardi prochain");
  }, [runsList, selectedRun]);

  // Sync selected run variables to simulator state
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'capten.app';
    const clubName = isMock 
      ? (localStorage.getItem('capten_club_name') || 'The Crew Trail')
      : (club?.whatsapp_display_name || club?.name || 'The Crew Trail');
    
    if (selectedRun) {
      const clubSlug = clubName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      setSimulator(prev => ({
        ...prev,
        club_name: clubName,
        run_name: selectedRun.name || prev.run_name,
        run_time: selectedRun.time || prev.run_time,
        run_location: selectedRun.location || prev.run_location,
        run_distance: selectedRun.distance ? selectedRun.distance.replace(/\s*KM/gi, "") : prev.run_distance,
        run_url: `${origin}/${clubSlug}/run/${selectedRun.id}`,
        stats_url: `${origin}/${clubSlug}/stats`,
        donation_url: `${origin}/cagnotte/contribuer`,
        report_url: `${origin}/securite/signaler`,
        capacity: String(selectedRun.max_slots || selectedRun.capacity || "50"),
        registered_count: String(selectedRun.slots_taken || selectedRun.registered || "0"),
        checkin_count: String(selectedRun.checkedIn || selectedRun.slots_taken || "0"),
        next_run_date: nextRunDateText,
        weather: weatherText,
      }));
    } else {
      setSimulator(prev => ({
        ...prev,
        club_name: clubName,
        donation_url: `${origin}/cagnotte/contribuer`,
        report_url: `${origin}/securite/signaler`,
      }));
    }
  }, [selectedRun, weatherText, nextRunDateText, club, isMock]);

  // Set local state when selectedTemplate changes
  useEffect(() => {
    if (selectedTemplate) {
      setEditBaseLabel(selectedTemplate.label);
      setEditBaseHint(selectedTemplate.contextHint);
      setEditBaseText(selectedTemplate.templateText);
      setIsEditingBase(false); 
    }
  }, [selectedTemplate]);

  // Render variables values inside template
  useEffect(() => {
    if (selectedTemplate) {
      const clubData = {
        name: simulator.club_name,
        stats_url: simulator.stats_url,
        spot_name: simulator.spot_name,
        spot_address: simulator.spot_address,
        spot_message: simulator.spot_message,
        partner_name: simulator.partner_name,
        offer_description: simulator.offer_description,
        promo_code: simulator.promo_code,
        expiry_date: simulator.expiry_date,
        coaches: [{ name: "Alex" }]
      };
      const runData = {
        name: simulator.run_name,
        time: simulator.run_time,
        distance: simulator.run_distance,
        weather: simulator.weather,
        run_url: simulator.run_url,
        donation_url: simulator.donation_url,
        sponsor_url: simulator.sponsor_url,
        report_url: simulator.report_url,
        capacity: simulator.capacity,
        registered_count: simulator.registered_count,
        checkin_count: simulator.checkin_count,
        next_run_date: simulator.next_run_date,
        pot_amount: simulator.pot_amount,
        challenge_name: simulator.challenge_name,
        challenge_result: simulator.challenge_result,
        challenge_duration: simulator.challenge_duration,
        first_name: simulator.first_name,
        absence_count: simulator.absence_count,
        run_location: simulator.run_location,
        weather_condition: simulator.weather_condition
      };
      setEditedText(parseTemplateText(selectedTemplate.templateText, runData, clubData));
    }
  }, [selectedTemplate, simulator]);

  // Tab definitions
  const tabs = useMemo(() => [
    { id: 'accueil' as TemplateCategory, label: 'Accueil' },
    { id: 'avant_run' as TemplateCategory, label: 'Avant le Run' },
    { id: 'pendant_run' as TemplateCategory, label: 'Pendant le Run' },
    { id: 'apres_run' as TemplateCategory, label: 'Après le Run' },
    { id: 'social_spot' as TemplateCategory, label: 'Social Spot' }
  ], []);

  // Filter templates list
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchCategory = template.category === activeTab;
      const cleanQuery = searchQuery.toLowerCase().trim();
      return matchCategory && (searchQuery === "" || 
        template.label.toLowerCase().includes(cleanQuery) ||
        template.contextHint.toLowerCase().includes(cleanQuery) ||
        template.templateText.toLowerCase().includes(cleanQuery));
    });
  }, [templates, activeTab, searchQuery]);

  const handleSelectTemplate = useCallback((template: MessageTemplate) => {
    setSelectedTemplate(template);
  }, []);

  const handleCopyClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      alert("Impossible de copier automatiquement. Veuillez copier manuellement le texte.");
    }
  }, [editedText]);

  // Universal WhatsApp Click-to-chat sharing redirect
  const handleShareWhatsApp = useCallback(() => {
    const encoded = encodeURIComponent(editedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }, [editedText]);

  // Handle master template save permanently
  const handleSaveBaseTemplate = useCallback(async (id: string) => {
    const updated = templates.map(t => {
      if (t.id === id) {
        return {
          ...t,
          label: editBaseLabel,
          contextHint: editBaseHint,
          templateText: editBaseText
        };
      }
      return t;
    });
    setTemplates(updated);

    if (isMock) {
      localStorage.setItem('capten_custom_templates_v2026', JSON.stringify(updated));
    } else {
      try {
        await fetch('/api/club/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message_templates: updated })
        });
        await refreshClub();
      } catch (err) {
        console.error("Failed to save message templates to DB:", err);
      }
    }
    
    const found = updated.find(t => t.id === id);
    if (found) {
      setSelectedTemplate(found);
    }
    setIsEditingBase(false);
  }, [templates, editBaseLabel, editBaseHint, editBaseText, isMock, refreshClub]);

  // Reset custom template base to original hardcoded configuration
  const handleResetToDefault = useCallback(async (id: string) => {
    const original = TEMPLATES_DATABASE.find(t => t.id === id);
    if (!original) return;
    
    const updated = templates.map(t => {
      if (t.id === id) {
        return { ...original };
      }
      return t;
    });
    
    setTemplates(updated);

    if (isMock) {
      localStorage.setItem('capten_custom_templates_v2026', JSON.stringify(updated));
    } else {
      try {
        await fetch('/api/club/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message_templates: updated })
        });
        await refreshClub();
      } catch (err) {
        console.error("Failed to reset message template in DB:", err);
      }
    }
    
    setEditBaseLabel(original.label);
    setEditBaseHint(original.contextHint);
    setEditBaseText(original.templateText);
    
    const found = updated.find(t => t.id === id);
    if (found) {
      setSelectedTemplate(found);
    }
  }, [templates, isMock, refreshClub]);

  // Simulator handles
  const handleSimulatorChange = useCallback((key: string, value: string) => {
    setSimulator(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleResetSimulator = useCallback(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'capten.app';
    setSimulator({
      club_name: "The Crew Trail",
      run_name: "Morning Vibes",
      run_time: "19h30",
      run_distance: "10",
      weather: "🌤️ 17°C, grand soleil",
      run_url: "capten.app/the-crew-trail/run/xyz",
      stats_url: "capten.app/the-crew-trail/stats",
      donation_url: `${origin}/cagnotte/contribuer`,
      sponsor_url: `${origin}/cagnotte/sponsor`,
      report_url: `${origin}/securite/signaler`,
      capacity: "50",
      registered_count: "42",
      spot_name: "LE BOOT CAFÉ",
      spot_address: "92 RUE DU FAUBOURG SAINT-MARTIN, PARIS",
      spot_message: "On se retrouve tous au Boot après le run !",
      checkin_count: "14",
      next_run_date: "mardi prochain à 19h30",
      pot_amount: "45",
      challenge_name: "Ragnarok",
      challenge_result: "250 km collectifs",
      challenge_duration: "4 jours",
      first_name: "Alex",
      absence_count: "3",
      run_location: "point de RDV habituel",
      weather_condition: "un orage violent",
      partner_name: "Satisfoot",
      offer_description: "15% de réduction",
      promo_code: "SATIS15",
      expiry_date: "dimanche soir"
    });
  }, []);

  const showRightPanel = useMemo(() => {
    if (!selectedTemplate) return false;
    const txt = selectedTemplate.templateText;
    const hasSpot = txt.includes("{{spot_name}}") || txt.includes("{{spot_address}}") || txt.includes("{{spot_message}}");
    const hasPartner = txt.includes("{{partner_name}}") || txt.includes("{{promo_code}}") || txt.includes("{{offer_description}}") || txt.includes("{{expiry_date}}");
    return hasSpot || hasPartner;
  }, [selectedTemplate]);

  const isLocked = club?.stripe_plan === 'GRATUIT';

  return (
    <div className="bg-white text-black border border-[#E5E5E5] rounded-[24px] overflow-hidden shadow-sm relative p-6 sm:p-10 animate-fade-in select-none">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5C00]/80 to-transparent"></div>

      {isLocked && (
        <div className="absolute inset-0 bg-[#F4F5F7]/30 backdrop-blur-md z-40 flex items-center justify-center p-6 select-none pointer-events-auto">
          <div className="bg-black text-white max-w-md w-full rounded-[24px] border border-white/10 p-8 shadow-2xl text-center relative overflow-hidden">
            {/* Ambient neon orange glow */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-[#FF5C00]/20 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 text-[#FF5C00] flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Lock className="h-6 w-6" />
            </div>
            
            <span className="text-[10px] font-black text-[#FF5C00] uppercase tracking-[0.25em] font-display italic">
              FONCTIONNALITÉ PREMIUM
            </span>
            
            <h2 className="text-2xl font-display italic font-black uppercase text-white tracking-tight mt-2">
              KIT DE MESSAGES AUTOMATIQUES
            </h2>
            
            <p className="text-xs text-neutral-400 font-sans mt-3 leading-relaxed">
              Planifie des messages WhatsApp automatisés pour ton crew, génère des invitations en 1 clic et gère les rappels de participation sans effort.
            </p>
            
            <div className="mt-6 border-t border-white/5 pt-5">
              <Link 
                href="/plan"
                className="w-full bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white py-3 rounded-control text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C00]/15 active:scale-95"
              >
                Débloquer avec le plan Capten <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="flex flex-col gap-4 pb-8 border-b border-black/10 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF5C00] font-black">
              [ 💬 KIT DE COMMUNICATION WHATSAPP V1 ]
            </span>
            <h1 className="text-3xl sm:text-5xl font-display italic font-black uppercase text-black tracking-tighter leading-none mt-2">
              Zéro frais d'envoi. <span className="text-[#FF5C00]">Copy-Paste Direct.</span>
            </h1>
            <p className="text-sm font-sans text-neutral-600 mt-2 max-w-3xl leading-relaxed">
              Propulse l'engagement de ton crew sans payer un centime. Génère les messages parfaits, intègre les données du run et partage-les directement dans ton groupe WhatsApp.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-[#F4F5F7] border border-black/5 rounded-xl px-4 py-2 text-xs font-mono text-neutral-600">
              <div className="w-2.5 h-2.5 rounded-full bg-[#56E39F] animate-pulse"></div>
              0€ DE FRAIS · 100% GRATUIT
            </div>
          </div>
        </div>
      </header>

      {/* RUN SELECTOR DROPDOWN */}
      <div className="mb-8 p-6 bg-[#F4F5F7]/60 border border-black/5 rounded-[20px]">
        {runsList.length > 0 ? (
          <div className="flex flex-col gap-1.5 max-w-md">
            <label className="text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider">
              Générer les messages pour :
            </label>
            <select
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-xs font-bold text-black focus:outline-none focus:border-[#FF5C00] transition-colors focus-visible:ring-1 focus-visible:ring-[#FF5C00] cursor-pointer"
            >
              {runsList.map((run) => (
                <option key={run.id} value={run.id}>
                  {run.name} · {run.date} · {run.time}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-tight">
              Lance d&apos;abord un run pour générer tes messages →
            </p>
            <Link 
              href="/runs" 
              className="px-4 py-2.5 bg-[#FF5C00] text-white rounded-control text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all text-center block active:scale-95 shadow-sm"
            >
              + LANCER MON PREMIER RUN
            </Link>
          </div>
        )}
      </div>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FILTER PANEL AND CARDS */}
        <div className={showRightPanel ? "xl:col-span-8 space-y-6" : "xl:col-span-12 space-y-6"}>
          
          {/* SEARCH AND TABS CONTROLS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            
            {/* ARIA tablist */}
            <div 
              role="tablist" 
              aria-label="Catégories des messages" 
              className="flex bg-[#F4F5F7] border border-black/5 p-1 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-none gap-1"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-lg text-xs font-bold transition-all uppercase tracking-wider min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] ${
                    activeTab === tab.id
                      ? 'bg-[#FF5C00] text-white shadow-lg shadow-[#FF5C00]/25'
                      : 'text-neutral-600 hover:text-black hover:bg-[#F4F5F7]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-black/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black placeholder-neutral-500 focus:outline-none focus:border-[#FF5C00] transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-[#FF5C00]"
                aria-label="Rechercher dans les modèles"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* CARDS LIST CONTAINER */}
          <div 
            id={`panel-${activeTab}`}
            role="tabpanel" 
            aria-labelledby={`tab-${activeTab}`}
          >
            {filteredTemplates.length === 0 ? (
              <div className="border border-dashed border-black/10 rounded-[24px] p-12 text-center text-neutral-500">
                <HelpCircle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-wider text-black">Aucun template trouvé</p>
                <p className="text-xs text-neutral-500 mt-1">Aucun message ne correspond à votre filtre de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => {
                  const clubData = {
                    name: simulator.club_name,
                    stats_url: simulator.stats_url,
                    spot_name: simulator.spot_name,
                    spot_address: simulator.spot_address,
                    spot_message: simulator.spot_message,
                    partner_name: simulator.partner_name,
                    offer_description: simulator.offer_description,
                    promo_code: simulator.promo_code,
                    expiry_date: simulator.expiry_date
                  };
                  const runData = {
                    name: simulator.run_name,
                    time: simulator.run_time,
                    distance: simulator.run_distance,
                    weather: simulator.weather,
                    run_url: simulator.run_url,
                    capacity: simulator.capacity,
                    registered_count: simulator.registered_count,
                    checkin_count: simulator.checkin_count,
                    next_run_date: simulator.next_run_date,
                    pot_amount: simulator.pot_amount,
                    challenge_name: simulator.challenge_name,
                    challenge_result: simulator.challenge_result,
                    challenge_duration: simulator.challenge_duration,
                    first_name: simulator.first_name,
                    absence_count: simulator.absence_count,
                    run_location: simulator.run_location,
                    weather_condition: simulator.weather_condition,
                    short_code: selectedRun?.short_code || ""
                  };
                  const parsedPreview = parseTemplateText(template.templateText, runData, clubData);
                  const catLabel = tabs.find(t => t.id === template.category)?.label || "Run";

                  const isBienRentreTemplate = template.label === "BIEN RENTRÉ ?";
                  const runNotEnded = !selectedRun || (selectedRun.status !== 'completed' && selectedRun.status !== 'ended');
                  const isDisabled = isBienRentreTemplate && runNotEnded;
                  const tooltip = isDisabled ? "Disponible dès que le run sera terminé" : undefined;

                  return (
                    <TemplateCard 
                      key={template.id}
                      template={template}
                      parsedPreview={parsedPreview}
                      categoryLabel={catLabel}
                      onSelect={handleSelectTemplate}
                      isDisabled={isDisabled}
                      tooltip={tooltip}
                    />
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: VARIABLES LAB */}
        {showRightPanel && (
          <div className="xl:col-span-4">
            <SimulatorPanel 
              simulator={simulator} 
              onChange={handleSimulatorChange}
              onReset={handleResetSimulator}
              selectedTemplate={selectedTemplate}
            />
          </div>
        )}

      </div>

      {/* MODAL EDITOR OVERLAY */}
      {selectedTemplate && (
        <MessageEditorModal 
          selectedTemplate={selectedTemplate}
          simulator={simulator}
          editedText={editedText}
          setEditedText={setEditedText}
          isEditingBase={isEditingBase}
          setIsEditingBase={setIsEditingBase}
          editBaseLabel={editBaseLabel}
          setEditBaseLabel={setEditBaseLabel}
          editBaseHint={editBaseHint}
          setEditBaseHint={setEditBaseHint}
          editBaseText={editBaseText}
          setEditBaseText={setEditBaseText}
          copyFeedback={copyFeedback}
          onCopy={handleCopyClipboard}
          onShare={handleShareWhatsApp}
          onSaveBase={() => handleSaveBaseTemplate(selectedTemplate.id)}
          onResetBase={() => handleResetToDefault(selectedTemplate.id)}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
