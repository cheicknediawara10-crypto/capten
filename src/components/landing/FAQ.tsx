"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      q: "Est-ce que mes membres doivent créer un compte sur le logiciel ?",
      a: "Non. Vos membres n'ont aucun compte à créer ni application à télécharger. Ils scannent le QR code du run ou cliquent sur le lien WhatsApp pour renseigner leur fiche et émarger en 30 secondes."
    },
    {
      q: "Comment fonctionne la collecte des fiches d'urgence ?",
      a: "Lors de leur première inscription à un run, le membre saisit son contact ICE (Emergency) et ses informations médicales. Ces données sont chiffrées et consultables uniquement par le Capitaine en session active."
    },
    {
      q: "Comment suivre l'argent généré par CAPTEN Spots ?",
      a: "Votre dashboard affiche en temps réel les commissions générées par vos membres chez les commerçants partenaires. Les fonds sont versés chaque mois sur votre compte ou cagnotte de club."
    },
    {
      q: "Si un membre a un problème de réseau ou plus de batterie au RDV, ça bloque son registre ?",
      a: "Non. Le Capitaine dispose d'une fonction d'émargement manuel 1-clic depuis son propre dashboard pour valider un coureur en cas d'imprévu."
    },
    {
      q: "L'agrément, qui est responsable en cas d'accident, passion ou run ?",
      a: "CAPTEN génère un registre d'émargement certifié et une décharge de responsabilité numérique signée par chaque membre, attestant qu'il participe sous sa propre responsabilité civile."
    }
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#FFFFFF] border-y border-[#ECECEC]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Left 5 cols */}
          <div className="md:col-span-5 space-y-4">
            <SectionTitle
              badge="FAITES LE PREMIER PAS"
              title="Des réponses simples à toutes vos questions"
              subtitle="Les réponses aux questions les plus fréquentes proposées par les capitaines."
              align="left"
            />
          </div>

          {/* Right 7 cols Accordion */}
          <div className="md:col-span-7 space-y-3">
            {faqItems.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#F5F3EE] rounded-[18px] overflow-hidden border border-[#ECECEC]"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-[#1D1D1D] flex items-center justify-between gap-4 hover:bg-[#EBE8E1] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 text-[#1D1D1D] shadow-sm"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-[#6E6E6E] font-medium leading-relaxed border-t border-[#ECECEC] pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}
