"use client";

import React, { useEffect, useRef, useState, useId, useCallback } from "react";
import { Camera, AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  onScan: (result: string) => void;
}

export default function QrScanner({ onScan }: Props) {
  const containerId = useId().replace(/:/g, "_") + "_qr_reader";
  const scannerRef = useRef<any>(null);
  const onScanRef = useRef(onScan);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {}
      }

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      let lastScannedText = "";
      let lastScannedTime = 0;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        (decodedText) => {
          const now = Date.now();
          // Anti-rebond (throttle 2s pour le même QR)
          if (decodedText === lastScannedText && now - lastScannedTime < 2000) {
            return;
          }
          lastScannedText = decodedText;
          lastScannedTime = now;
          onScanRef.current(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      setScanning(false);
      setCameraError(
        err?.message?.includes("Permission") || err?.name === "NotAllowedError"
          ? "Accès caméra refusé. Autorise la caméra dans les réglages de ton navigateur."
          : "Impossible d'accéder à la caméra de l'appareil."
      );
    }
  }, [containerId]);

  useEffect(() => {
    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [startScanner]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black/80 flex flex-col items-center justify-center min-h-[300px]">
      <div id={containerId} className="w-full h-full min-h-[300px]" />

      {cameraError && (
        <div className="absolute inset-0 p-6 bg-black/90 flex flex-col items-center justify-center text-center space-y-3 z-20">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <p className="text-xs text-white/80 max-w-xs">{cameraError}</p>
          <button
            onClick={startScanner}
            className="px-4 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#E04B00] transition-all"
          >
            <RefreshCw size={13} /> Réessayer
          </button>
        </div>
      )}
    </div>
  );
}
