"use client";

import React, { useEffect, useRef } from "react";
import { renderCrewVisual, loadImage, type CrewVisualData } from "@/lib/crew-visual";

const BASE: Omit<CrewVisualData, "type" | "photo"> = {
  crewName: "Night Runners Paris",
  crewLogo: null,
  slug: "night-runners-paris",
  runTitle: "Run République",
  dayTime: "Jeudi 19h",
  location: "Place de la Bastille",
  distanceKm: 8,
  presentCount: 48,
  runDateLabel: "15 août",
};

function Preview({ label, type, withPhoto }: { label: string; type: "affiche" | "story"; withPhoto: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Photo de test = vraie photo de coureurs (aperçu uniquement ; le vrai outil
      // utilise la photo uploadée par le fondateur, same-origin).
      const photo = withPhoto
        ? await loadImage(
            "https://images.pexels.com/photos/10313668/pexels-photo-10313668.jpeg?auto=compress&cs=tinysrgb&w=1080"
          ).catch(() => null)
        : null;
      if (cancelled || !ref.current) return;
      await renderCrewVisual(ref.current, { ...BASE, type, photo });
    })();
    return () => {
      cancelled = true;
    };
  }, [type, withPhoto]);
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/60">{label}</span>
      <canvas
        ref={ref}
        className="rounded-2xl border border-white/10 shadow-2xl"
        style={{ width: "auto", height: 560, aspectRatio: "1080 / 1920" }}
      />
    </div>
  );
}

export default function ApercuVisuelsPage() {
  return (
    <div className="min-h-screen px-6 py-12" style={{ background: "#0B0B0A" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[32px] font-display italic font-black uppercase tracking-tighter text-white mb-1">
          Visuels du Crew — aperçu
        </h1>
        <p className="text-[13px] text-white/50 mb-10">
          Story Instagram 1080×1920 · rendu 100% côté client · avec et sans photo (fallback dégradé).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          <Preview label="Affiche · sans photo" type="affiche" withPhoto={false} />
          <Preview label="Affiche · avec photo" type="affiche" withPhoto={true} />
          <Preview label="Story · sans photo" type="story" withPhoto={false} />
          <Preview label="Story · avec photo" type="story" withPhoto={true} />
        </div>
      </div>
    </div>
  );
}
