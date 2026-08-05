"use client";

const ITEMS = [
  "GPS Check-in",
  "Fiches ICE",
  "Badges automatiques",
  "QR Code live",
  "Stats en temps réel",
  "Zéro appli",
  "CAPTEN Spots",
  "Cagnotte de club",
  "Gestion des membres",
  "Registre horodaté",
  "Décharge numérique",
  "Dashboard organisateur",
];

export function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="bg-[#FF5500] py-4 overflow-hidden relative">
      <div className="animate-marquee flex gap-12 whitespace-nowrap" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.2em] text-black"
          >
            {item}
            <span className="text-black/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
