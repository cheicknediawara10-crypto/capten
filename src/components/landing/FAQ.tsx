"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Est-ce que mes membres doivent se créer un compte sur le logiciel ?",
    a: "Non. Tes membres n'ont rien à installer. Ils s'inscrivent via un lien unique que tu leur partages. Ensuite, ils accèdent à leur espace avec leur nom, date de naissance et code PIN à 4 chiffres — rien à mémoriser de plus.",
  },
  {
    q: "Comment fonctionne la collecte des fiches d'urgence ?",
    a: "À l'inscription, chaque membre renseigne son contact prioritaire joignable en 1 clic en 30 secondes. Ces informations sont accessibles instantanément depuis ton tableau de bord en cas d'incident.",
  },
  {
    q: "Comment fonctionne le sas d'allure ?",
    a: "À l'inscription, chaque coureur choisit son rythme (Cool, Rythmé, Fast ou Run & Walk). Tu vois la répartition en direct dans ton cockpit — fini le tri des groupes au mégaphone au départ, et les débutants savent qu'ils ne se feront pas lâcher.",
  },
  {
    q: "Je peux partager le tracé de mon parcours ?",
    a: "Oui. À la création d'un run, tu colles ton lien Strava, Komoot, OpenRunner ou GPX. Il s'affiche sur la page publique du run : tes coureurs chargent la trace sur leur montre (Garmin, Apple Watch…) en une seconde. Fini les « c'est quel parcours ? » en DM avant chaque départ.",
  },
  {
    q: "Et si un coureur arrive à la dernière minute au départ ?",
    a: "Depuis ton cockpit, tu l'ajoutes en 3 secondes avec le bouton « Invité Express » — sans formulaire ni inscription complète. Le pote imprévu est compté dans le run et ta liste reste propre.",
  },
  {
    q: "Comment fonctionnent Les Spots du Crew ?",
    a: "Tu ajoutes les adresses préférées de ton crew (cafés, shops running, kinés) depuis ton tableau de bord. Tu peux négocier un avantage avec le gérant (à l'oral) et l'afficher sur la page de ton club. Tes membres montrent leur carte CAPTEN pour en bénéficier. Zéro paiement, zéro commission, zéro complication.",
  },
  {
    q: "Si un membre a un problème de réseau ou plus de batterie au RDV, ça bloque mon registre ?",
    a: "Non. Le check-in peut se faire via QR code ou par GPS. En cas de problème technique, tu peux valider manuellement depuis ton tableau de bord. Le registre n'est jamais bloqué.",
  },
  {
    q: "Légalement, qui est responsable en cas d'accident pendant un run ?",
    a: "Le registre horodaté de CAPTEN constitue une preuve légale de présence et de signature de décharge. Il est exportable en PDF/CSV à tout moment pour répondre à toute demande légale ou assurantielle.",
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#EBEBEB] last:border-none">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-5 px-6 text-left hover:bg-[#FAFAF8] transition-colors"
      >
        <span
          className="text-[#1C1B18] leading-snug"
          style={{ fontSize: "24px", fontWeight: 1000, letterSpacing: "-0.96px" }}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p
              className="px-6 pb-5 text-[#6B6A6A] leading-snug"
              style={{ fontSize: "18px", fontWeight: 500 }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="py-16 px-5 bg-white" id="faq">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-12 lg:gap-20">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p
            className="text-[#1C1B18] mb-5 uppercase"
            style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.72px" }}
          >
            Vous avez des questions ?
          </p>
          <h2
            className="text-[#1C1B18] leading-tight mb-5"
            style={{ fontSize: "40px", fontWeight: 1000, letterSpacing: "-1.6px" }}
          >
            Des réponses simples à toutes vos questions
          </h2>
          <p
            className="text-[#6B6A6A] leading-snug"
            style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "-0.4px" }}
          >
            Les réponses à nos questions les plus fréquemment posées sont à portée de clic.
          </p>
        </motion.div>

        {/* Right — accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="divide-y divide-[#EBEBEB] bg-[#FAFAF8] rounded-2xl overflow-hidden"
        >
          {ITEMS.map((item) => (
            <Item key={item.q} {...item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
