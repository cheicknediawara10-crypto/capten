"use client";

import { useEffect, useRef, useState } from "react";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const duration = 1800;

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

const STATS = [
  { value: 500, suffix: "+", label: "Clubs actifs", sub: "Paris, Lyon, Bordeaux, Montréal" },
  { value: 12000, suffix: "+", label: "Check-ins GPS", sub: "Validés sur le terrain" },
  { value: 98, suffix: "%", label: "Membres satisfaits", sub: "Note moyenne organisateurs" },
  { value: 0, suffix: "", label: "Tableurs Excel", sub: "Remplacés. Définitivement." },
];

export function Stats() {
  return (
    <section className="bg-[#F4F4EE] py-20 md:py-28 border-b border-[#1A1918]/8">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="font-display text-[clamp(48px,6vw,80px)] italic font-black uppercase text-[#1A1918] leading-none tracking-tighter">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-[14px] font-bold text-[#1A1918]">{stat.label}</p>
              <p className="text-[12px] text-[#1A1918]/40 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
