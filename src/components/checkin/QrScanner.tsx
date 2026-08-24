"use client";

import { useEffect, useRef } from "react";

interface Props {
  onScan: (result: string) => void;
}

export default function QrScanner({ onScan }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!divRef.current) return;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          onScanRef.current(decodedText);
          scanner.stop().catch(() => {});
        },
        () => {}
      ).catch(() => {});
    });

    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div
      id="qr-reader"
      ref={divRef}
      className="w-full rounded-[20px] overflow-hidden"
      style={{ minHeight: 280 }}
    />
  );
}
