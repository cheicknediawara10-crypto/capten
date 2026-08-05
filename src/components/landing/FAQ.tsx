"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS = [
  {
    q: "Mes membres doivent-ils créer un compte ou télécharger une appli ?",
    a: "Non, aucun compte ni appli. Tes membres cliquent sur le lien d'invitation, renseignent leur fiche ICE, signent la décharge numérique — et c'est terminé. Tout se passe dans leur navigateur, en 30 secondes.",
  },
  {
    q: "Comment fonctionnent les fiches ICE (In Case of Emergency) ?",
    a: "Lors de l'onboarding, chaque membre renseigne son contact d'urgence, son groupe sanguin, ses allergies et ses traitements. Ces données sont chiffrées côté serveur et accessibles uniquement par toi, l'organisateur, en session active — en 1 clic depuis le dashboard.",
  },
  {
    q: "Qu'est-ce qui se passe si un membre n'a pas de réseau sur le trail ?",
    a: "Chaque sortie a un QR Code téléchargeable à l'avance. Si le réseau est coupé, le membre scanne le QR depuis l'app. Et en dernier recours, tu as une validation manuelle 1-clic depuis ton dashboard pour valider un coureur.",
  },
  {
    q: "Comment fonctionne CAPTEN Spots et comment je touche l'argent ?",
    a: "Tes membres consomment chez nos partenaires locaux (cafés, sport, nutrition) via leur lien CAPTEN Spots. 10% de chaque transaction est automatiquement crédité à la cagnotte de ton club. Le solde est visible en temps réel, et versé mensuellement sur ton compte.",
  },
  {
    q: "Puis-je personnaliser le rayon du check-in GPS ?",
    a: "Oui. Par défaut, le rayon est de 200m. Pour chaque sortie, tu peux l'ajuster de 50m à 500m depuis l'écran de création de sortie — utile pour un parc ouvert ou un départ en stade.",
  },
  {
    q: "Qu'est-ce qui se passe en cas d'incident — qui est responsable ?",
    a: "CAPTEN génère un registre d'émargement horodaté et une décharge de responsabilité numérique signée par chaque membre, attestant qu'ils participent sous leur propre responsabilité civile. Tu disposes d'une trace légale complète pour chaque sortie.",
  },
  {
    q: "Puis-je exporter mes données ou quitter CAPTEN à tout moment ?",
    a: "Oui, à tout moment et sans frais. Tu peux exporter tes listes de membres, l'historique des sorties et des check-ins en CSV depuis ton dashboard. Tes données t'appartiennent.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#F4F4EE] py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[340px_1fr] gap-16 lg:gap-24 items-start">
          {/* Left */}
          <div className="lg:sticky lg:top-24">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] mb-4"
            >
              FAQ
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.05 }}
              className="font-display text-[clamp(36px,4.5vw,56px)] italic font-black uppercase text-[#1A1918] leading-[0.95] tracking-tighter mb-6"
            >
              TES<br />
              QUESTIONS.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.1 }}
              className="text-[14px] text-[#1A1918]/50 font-medium leading-relaxed mb-8"
            >
              Tout ce que tu dois savoir avant de te lancer. D&apos;autres questions ?
            </motion.p>
            <motion.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              href="mailto:hello@capten.app"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[#FF5500] hover:text-[#1A1918] transition-colors"
            >
              hello@capten.app
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 9L9 2M9 2H3.5M9 2V7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.a>
          </div>

          {/* Right — Accordion */}
          <div className="space-y-2">
            {ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border border-[#1A1918]/8 rounded-[16px] overflow-hidden bg-white"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#1A1918]/2 transition-colors"
                >
                  <span className="text-[14px] font-bold text-[#1A1918] leading-snug">{item.q}</span>
                  <div className="shrink-0 w-7 h-7 rounded-full bg-[#1A1918]/6 flex items-center justify-center">
                    <motion.svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      animate={{ rotate: open === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M6 2V10M2 6H10" stroke="#1A1918" strokeWidth="1.5" strokeLinecap="round"/>
                    </motion.svg>
                  </div>
                </button>

                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.25, 0, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 pt-1 text-[13px] text-[#1A1918]/55 leading-relaxed font-medium border-t border-[#1A1918]/6">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
