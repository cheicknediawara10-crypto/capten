"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, ImagePlus, Download, RefreshCw, Loader2 } from "lucide-react";
import {
  renderCrewVisual,
  loadImage,
  type VisualType,
  type CrewVisualData,
} from "@/lib/crew-visual";

type RunInfo = Omit<CrewVisualData, "type" | "photo" | "crewLogo">;

interface Props {
  open: boolean;
  type: VisualType;
  onClose: () => void;
  data: RunInfo;
  logoUrl?: string | null;
  fileBaseName: string; // ex: "affiche-nrp-2026-08-15"
  onDownloaded?: () => void;
}

export default function CrewVisualModal({
  open,
  type,
  onClose,
  data,
  logoUrl,
  fileBaseName,
  onDownloaded,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [rendering, setRendering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAffiche = type === "affiche";
  const title = isAffiche ? "Créer l'affiche" : "Créer ma story";

  // Charge le logo du crew une fois (crossOrigin pour ne pas "tainter" le canvas).
  useEffect(() => {
    if (!open || !logoUrl) {
      setLogo(null);
      return;
    }
    let cancelled = false;
    const sameOrigin = logoUrl.startsWith("/") || logoUrl.startsWith(window.location.origin);
    loadImage(logoUrl, !sameOrigin)
      .then((img) => !cancelled && setLogo(img))
      .catch(() => !cancelled && setLogo(null)); // fallback initiales
    return () => {
      cancelled = true;
    };
  }, [open, logoUrl]);

  // (Re)dessine à chaque changement de photo / logo / données.
  useEffect(() => {
    if (!open || !canvasRef.current) return;
    let cancelled = false;
    setRendering(true);
    renderCrewVisual(canvasRef.current, { ...data, type, photo, crewLogo: logo })
      .finally(() => !cancelled && setRendering(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type, photo, logo, JSON.stringify(data)]);

  const onPickPhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    loadImage(url)
      .then((img) => setPhoto(img))
      .catch(() => setPhoto(null))
      .finally(() => URL.revokeObjectURL(url));
  }, []);

  const onDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${fileBaseName}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      onDownloaded?.();
    } catch {
      alert(
        "Impossible de générer l'image (photo protégée). Réessaie avec une autre photo ou sans photo."
      );
    }
  }, [fileBaseName, onDownloaded]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full sm:max-w-md bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-t-[28px] sm:rounded-[28px] shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[color:var(--app-border)] shrink-0">
          <h2 className="text-[19px] font-display italic font-black uppercase tracking-tight text-[color:var(--app-text)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Aperçu + contrôles */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="relative mx-auto w-fit">
            <canvas
              ref={canvasRef}
              className="rounded-2xl border border-[color:var(--app-border)] shadow-lg block"
              style={{ width: "auto", height: "52vh", maxHeight: 460, aspectRatio: "1080 / 1920" }}
            />
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                <Loader2 size={26} className="animate-spin text-white" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPickPhoto}
            className="hidden"
          />

          {photo ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-11 rounded-xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] text-[13px] font-bold text-[color:var(--app-text)] flex items-center justify-center gap-2 hover:border-[#FF5500] transition-colors"
            >
              <RefreshCw size={15} /> Changer de photo
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 rounded-xl border-2 border-dashed border-[color:var(--app-border)] text-[13px] font-semibold text-[color:var(--app-text-muted)] flex items-center justify-center gap-2 hover:border-[#FF5500] hover:text-[#FF5500] transition-colors"
            >
              <ImagePlus size={17} /> Ajoute une photo (optionnel)
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-3 border-t border-[color:var(--app-border)] shrink-0">
          <button
            onClick={onDownload}
            className="w-full h-13 py-4 rounded-xl bg-[#FF5500] text-white text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#E04B00] active:scale-95 transition-all"
          >
            <Download size={16} /> Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}
