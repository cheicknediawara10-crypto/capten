'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface VictoryChecklistProps {
  completedMissionsCount: number;
  checklistCollapsed: boolean;
  setChecklistCollapsed: (val: boolean) => void;
  clubName: string;
  setClubName: (val: string) => void;
  isMission1Complete: boolean;
  isMission2Complete: boolean;
  isMission3Complete: boolean;
  handleCopyClubLink: () => void;
  setIsChecklistVisible: (val: boolean) => void;
  isMock: boolean;
  club: any;
  refreshClub: () => void;
}

export default function VictoryChecklist({
  completedMissionsCount,
  checklistCollapsed,
  setChecklistCollapsed,
  clubName,
  setClubName,
  isMission1Complete,
  isMission2Complete,
  isMission3Complete,
  handleCopyClubLink,
  setIsChecklistVisible,
  isMock,
  club,
  refreshClub
}: VictoryChecklistProps) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-card-outer p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-black/15">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 pb-4">
        <div>
          <span className="text-[10px] font-black text-[#FF5C00] uppercase tracking-[0.2em] italic">VOTRE PLAN DE VOL</span>
          <h2 className="text-[22px] font-display italic font-black uppercase text-black flex items-center gap-2">
            🏆 CHECKLIST DE VICTOIRE
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {completedMissionsCount === 3 ? (
            <span className="bg-green-50 border border-green-500/20 text-green-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={12} /> CONFIGURATION 100% TERRAIN
            </span>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-black">{completedMissionsCount}/3 ÉTAPES COMPLÉTÉES</span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tight">
                Plus que {3 - completedMissionsCount} étape{3 - completedMissionsCount > 1 ? 's' : ''} avant de libérer ton temps.
              </span>
            </div>
          )}
          <button
            onClick={async () => {
              const nextCollapsed = !checklistCollapsed;
              setChecklistCollapsed(nextCollapsed);
              if (isMock) {
                localStorage.setItem('capten_onboarding_collapsed', nextCollapsed.toString());
              } else {
                try {
                  await fetch('/api/club/settings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      branding: {
                        ...club?.branding,
                        checklist_collapsed: nextCollapsed
                      }
                    })
                  });
                  await refreshClub();
                } catch (e) {
                  console.error(e);
                }
              }
            }}
            className="px-2.5 py-1.5 border border-[#E5E5E5] rounded-control text-[9px] font-bold uppercase tracking-wider bg-neutral-50 hover:bg-neutral-100 hover:text-black transition-all cursor-pointer"
          >
            {checklistCollapsed ? "Afficher" : "Réduire"}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-100 h-2 border border-neutral-200 rounded-full overflow-hidden">
        <div 
          className="bg-[#FF5C00] h-full transition-all duration-500" 
          style={{ width: `${(completedMissionsCount / 3) * 100}%` }}
        />
      </div>

      {!checklistCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Mission 1: Identity */}
          <div className={`p-5 rounded-card-inner border transition-all flex flex-col justify-between min-h-[180px] ${isMission1Complete ? 'bg-[#F8FFF8] border-green-500/20 shadow-none' : 'bg-white border-[#E5E5E5] shadow-sm hover:border-black/20 hover:shadow-md'}`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-wider">Étape 1 : Identité</span>
                {isMission1Complete ? (
                  <span className="text-green-600 font-bold text-[10px] flex items-center gap-1">✓ CONFIGURÉ</span>
                ) : (
                  <span className="text-[#FF5C00] font-black text-[9px] uppercase tracking-widest animate-pulse">● À FAIRE</span>
                )}
              </div>
              <h4 className="text-[13px] font-bold text-black uppercase tracking-wider mb-2">Configure ta marque</h4>
              <p className="text-[11px] text-[#71717A] uppercase tracking-wider leading-normal">
                Indique le nom de ton Run Club ou dépose ton logo officiel pour signer ton cockpit.
              </p>
            </div>
            <div className="mt-4">
              {!isMission1Complete ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Nom de ton club"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-control text-[11px] font-bold uppercase tracking-wider tracking-tight focus:outline-none focus:border-[#FF5C00] bg-white shadow-inner"
                  />
                  <button
                    onClick={async () => {
                      if (clubName.trim()) {
                        const trimmedName = clubName.trim();
                        setClubName(trimmedName);
                        if (isMock) {
                          localStorage.setItem('capten_club_name', trimmedName);
                          localStorage.setItem('capten_onboarding_s2_name', trimmedName);
                          localStorage.setItem('capten_onboarding_s2_saved', 'true');
                        } else {
                          try {
                            await fetch('/api/club/settings', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                whatsapp_display_name: trimmedName,
                                branding: {
                                  ...club?.branding,
                                  onboarding_s2_saved: true
                                }
                              })
                            });
                            await refreshClub();
                          } catch (e) {
                            console.error(e);
                          }
                        }
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new Event('capten_branding_change'));
                        }
                        alert("Nom du club configuré !");
                      }
                    }}
                    className="w-full bg-[#FF5C00] text-white px-4 py-2 rounded-control text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    VALIDER LE NOM
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-green-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> {clubName.toUpperCase() || "MON CLUB"} ✓
                  </div>
                  <Link
                    href="/settings"
                    className="text-[9px] font-black text-neutral-400 hover:text-black uppercase tracking-wider block hover:underline"
                  >
                    ⚙️ PARAMÈTRES
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mission 2: First Run */}
          <div className={`p-5 rounded-card-inner border transition-all flex flex-col justify-between min-h-[180px] ${isMission2Complete ? 'bg-[#F8FFF8] border-green-500/20 shadow-none' : 'bg-white border-[#E5E5E5] shadow-sm hover:border-black/20 hover:shadow-md'}`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-wider">Étape 2 : Plan</span>
                {isMission2Complete ? (
                  <span className="text-green-600 font-bold text-[10px] flex items-center gap-1">✓ SORTIE PLANIFIÉE</span>
                ) : (
                  <span className="text-[#FF5C00] font-black text-[9px] uppercase tracking-widest animate-pulse">● À FAIRE</span>
                )}
              </div>
              <h4 className="text-[13px] font-bold text-black uppercase tracking-wider mb-2">Lance ton premier run</h4>
              <p className="text-[11px] text-[#71717A] uppercase tracking-wider leading-normal">
                Planifie une session pour que tes coureurs puissent valider leur présence ce soir.
              </p>
            </div>
            <div className="mt-4">
              {!isMission2Complete ? (
                <Link
                  href="/runs?openPlanifier=true"
                  className="w-full bg-[#FF5C00] text-white px-4 py-2.5 rounded-control text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm text-center block"
                >
                  🗺️ LANCER UN RUN +
                </Link>
              ) : (
                <div className="space-y-2">
                  <div className="text-green-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 py-1">
                    <CheckCircle2 size={12} /> PREMIER RUN PRÊT ✓
                  </div>
                  <Link
                    href="/runs"
                    className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-wider hover:text-black hover:underline block"
                  >
                    🗺️ ACCÉDER AUX RUNS
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mission 3: Instagram */}
          <div className={`p-5 rounded-card-inner border transition-all flex flex-col justify-between min-h-[180px] ${isMission3Complete ? 'bg-[#F8FFF8] border-green-500/20 shadow-none' : 'bg-white border-[#E5E5E5] shadow-sm hover:border-black/20 hover:shadow-md'}`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-wider">Étape 3 : IG Bio</span>
                {isMission3Complete ? (
                  <span className="text-green-600 font-bold text-[10px] flex items-center gap-1">✓ EN BIO INSTAGRAM</span>
                ) : (
                  <span className="text-[#FF5C00] font-black text-[9px] uppercase tracking-widest animate-pulse">● À FAIRE</span>
                )}
              </div>
              <h4 className="text-[13px] font-bold text-black uppercase tracking-wider mb-2">Installe ton lien club</h4>
              <p className="text-[11px] text-[#71717A] uppercase tracking-wider leading-normal">
                Copie le lien public de ton club et insère-le dans ta bio Instagram pour récolter les inscriptions.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCopyClubLink}
                className="w-full bg-[#FF5C00] text-white px-4 py-2.5 rounded-control text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm animate-fade-in"
              >
                🔗 {isMission3Complete ? "RECOPIER LE LIEN" : "COPIER LE LIEN DU CLUB"}
              </button>
            </div>
          </div>
        </div>
      )}

      {completedMissionsCount === 3 && (
        <div className="bg-[#F8FFF8] border border-green-500/20 rounded-card-inner p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 shadow-sm">
          <div>
            <p className="text-[12px] font-black text-green-700 uppercase tracking-wider">
              🎉 FÉLICITATIONS, TON RUN CLUB EST PRÊT !
            </p>
            <p className="text-[9px] font-bold text-[#71717A] uppercase tracking-widest leading-relaxed mt-1">
              {"Les fondations sont posées. Tu peux maintenant fermer cette checklist pour libérer de l'espace."}
            </p>
          </div>
          <button
            onClick={async () => {
              setIsChecklistVisible(false);
              if (isMock) {
                localStorage.setItem('capten_onboarding_hidden', 'true');
              } else {
                try {
                  await fetch('/api/club/settings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      branding: {
                        ...club?.branding,
                        checklist_hidden: true
                      }
                    })
                  });
                  await refreshClub();
                } catch (e) {
                  console.error(e);
                }
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white hover:bg-red-650 transition-all rounded-control text-[10px] font-black uppercase tracking-widest text-center cursor-pointer active:scale-95 shadow-sm"
          >
            Masquer définitivement
          </button>
        </div>
      )}
    </div>
  );
}
