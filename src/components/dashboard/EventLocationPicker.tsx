"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function EventLocationPicker({ onSelect, initialLat = 48.8566, initialLng = 2.3522 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Custom orange marker
      const orangeIcon = L.divIcon({
        html: `<div style="width:24px;height:24px;background:#FF5500;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: "",
      });

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: orangeIcon }).addTo(map);
        }

        setSelected({ lat, lng });

        // Reverse geocode with Nominatim
        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
          );
          const data = await res.json();
          if (data.display_name) {
            const parts = data.display_name.split(",");
            address = parts.slice(0, 3).join(",").trim();
          }
        } catch {}

        onSelectRef.current(lat, lng, address);
      });

      mapInstance.current = map;

      // Force resize after mount
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [initialLat, initialLng]);

  return (
    <div className="space-y-2">
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-container { font-family: inherit; }
      `}</style>
      <div
        ref={mapRef}
        className="h-64 w-full rounded-[16px] overflow-hidden border border-[#E5E7EB] cursor-crosshair"
      />
      <p className="text-[11px] text-[#A3A3A3]">
        Clique sur la carte pour placer le point de rendez-vous.
        {selected && (
          <span className="text-[#22C55E] font-medium ml-1">Marqueur placé.</span>
        )}
      </p>
    </div>
  );
}
