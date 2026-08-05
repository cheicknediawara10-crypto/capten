"use client";

import { motion } from "framer-motion";

const PAINS = [
  {
    number: "01",
    icon: "📱",
    title: "Tu jonglent entre WhatsApp, Google Sheets et des mails à 23h.",
    body: "Ta liste de coureurs est dans 3 applis. Tes inscrits t'envoient des SMS. Et tu perds une heure par sortie à consolider tout ça.",
  },
  {
    number: "02",
    icon: "🚨",
    title: "Tu ne sais pas si tes membres ont une fiche ICE en cas d'urgence.",
    body: "Un malaise sur le trail. Tu cherches dans tes contacts, dans ta mémoire. Ces secondes comptent. Avec 40 personnes en forêt, ça ne pardonne pas.",
  },
  {
    number: "03",
    icon: "💸",
    title: "Tu offres une vraie aventure. Mais l'admin te coûte ton énergie.",
    body: "Tu as lancé ce crew pour courir avec d'autres. Pas pour être secrétaire, comptable et modérateur WhatsApp. Tu mérites mieux.",
  },
];

export function Problem() {
  return (
    <section className="bg-[#0C0C0C] py-24 md:py-32 relative overflow-hidden">
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] mb-6"
        >
          Le problème
        </motion.p>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display text-[clamp(40px,6vw,72px)] italic font-black uppercase text-white leading-[0.95] tracking-tighter mb-16 lg:mb-24 max-w-3xl"
        >
          GÉRER UN CREW À LA MAIN,<br />
          <span className="text-white/25">C&apos;EST ÉPUISANT.</span>
        </motion.h2>

        {/* Pain cards */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {PAINS.map((pain, i) => (
            <motion.div
              key={pain.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0, 0, 1] }}
              className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-white/14 rounded-[20px] p-8 transition-all duration-300 cursor-default"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-[32px]">{pain.icon}</span>
                <span className="text-[11px] font-mono text-white/15">{pain.number}</span>
              </div>

              <h3 className="text-[15px] sm:text-[16px] font-bold text-white leading-snug mb-4">
                {pain.title}
              </h3>
              <p className="text-[13px] text-white/40 leading-relaxed font-medium">
                {pain.body}
              </p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-[#FF5500] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* Transition statement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 lg:mt-24 pt-12 border-t border-white/8 max-w-3xl"
        >
          <p className="text-[20px] sm:text-[26px] font-bold text-white/70 leading-snug">
            CAPTEN centralise tout.{" "}
            <span className="text-white">
              Tu crées la sortie, tes membres rejoignent, le check-in se fait en GPS, les fiches ICE sont là.
            </span>{" "}
            Tu cours. C&apos;est tout.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
