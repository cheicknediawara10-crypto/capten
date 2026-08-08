"use client";

import React from "react";
import { motion } from "framer-motion";

const CARDS = [
  {
    title: "Le cauchemar logistique",
    description: "Un malaise survient, tu perds de précieuses minutes car tu n'as aucun accès centralisé aux dossiers médicaux ou contacts d'urgence de tes coureurs.",
    image: "https://framerusercontent.com/images/PVMUrKfQuh0U99rMuR5t0WjRA.jpg",
  },
  {
    title: "Le risque juridique",
    description: "Déplacer 40 personnes sur la voie publique sans liste d'émargement engage ta responsabilité. Ton crew a besoin d'un cadre officiel.",
    image: "https://framerusercontent.com/images/gYpYe1Ao4Fbprn7Xnh1y9WXzLHQ.jpg",
  },
];

export function ProblemCards() {
  return (
    <section className="pb-16 px-5 bg-white">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="relative rounded-2xl overflow-hidden"
            style={{ height: "436px" }}
          >
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <h3
                className="text-white mb-3 leading-tight"
                style={{ fontSize: "32px", fontWeight: 1000 }}
              >
                {card.title}
              </h3>
              <p
                className="text-white/80 leading-snug"
                style={{ fontSize: "18px", fontWeight: 500 }}
              >
                {card.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
