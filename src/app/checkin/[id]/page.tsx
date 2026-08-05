"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, QrCode, Loader2, CheckCircle2, XCircle, Wifi } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { isWithinRadius } from "@/lib/utils/geo";
import { checkAndAwardBadges } from "@/lib/utils/badges";
import { BadgeUnlockAnimation } from "@/components/badges/BadgeUnlockAnimation";
import dynamic from "next/dynamic";

const Html5QrcodeScanner = dynamic(
  () => import("@/components/checkin/QrScanner"),
  { ssr: false, loading: () => <div className="h-64 bg-white/5 rounded-[20px] animate-pulse" /> }
);

type CheckinState = "idle" | "locating" | "scanning" | "submitting" | "success" | "out_of_range" | "error";

interface Event {
  id: string;
  title: string;
  meeting_point_lat: number | null;
  meeting_point_lng: number | null;
  checkin_radius_meters: number;
  club_id: string;
}

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<CheckinState>("idle");
  const [method, setMethod] = useState<"gps" | "qr">("gps");
  const [errorMsg, setErrorMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState<{ slug: string; name: string } | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      if (!supabase) { setLoading(false); return; }

      const [{ data: ev }, { data: { user } }] = await Promise.all([
        supabase.from("events").select("*").eq("id", id).single(),
        supabase.auth.getUser(),
      ]);

      setEvent(ev);
      setUserId(user?.id || null);
      setLoading(false);
    }
    init();
  }, [id]);

  async function submitCheckin(lat?: number, lng?: number, distance?: number) {
    setState("submitting");
    const supabase = getSupabase();
    if (!supabase || !event) { setState("error"); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setState("error"); setErrorMsg("Non connecté."); return; }

    const isValidated = method === "qr" ? true : (
      event.meeting_point_lat && lat
        ? isWithinRadius(lat, lng!, event.meeting_point_lat, event.meeting_point_lng!, event.checkin_radius_meters)
        : true
    );

    const { error } = await supabase.from("checkins").insert({
      event_id: event.id,
      member_id: user.id,
      method,
      latitude: lat || null,
      longitude: lng || null,
      distance_meters: distance || null,
      is_validated: isValidated,
    });

    if (error) {
      if (error.code === "23505") {
        setState("success"); // Already checked in — treat as success
      } else {
        setState("error");
        setErrorMsg(error.message);
      }
    } else if (!isValidated) {
      setState("out_of_range");
    } else {
      setState("success");
      // Check for new badges after a successful check-in
      try {
        const { count } = await supabase
          .from("checkins")
          .select("*", { count: "exact", head: true })
          .eq("member_id", user.id)
          .eq("is_validated", true);
        const awarded = await checkAndAwardBadges(user.id, count || 1, 0, 0, supabase);
        if (awarded.length > 0) {
          const BADGE_NAMES: Record<string, string> = {
            first_run: "Premier Run", regular_runner: "Régulier",
            legend: "Légende", explorer: "Explorateur",
            ambassador: "Ambassadeur", early_member: "Early Member",
          };
          setTimeout(() => setNewBadge({ slug: awarded[0], name: BADGE_NAMES[awarded[0]] || awarded[0] }), 800);
        }
      } catch {}
    }
  }

  async function gpsCheckin() {
    if (!navigator.geolocation) {
      setState("error");
      setErrorMsg("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }

    setState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        let distance: number | undefined;

        if (event?.meeting_point_lat && event?.meeting_point_lng) {
          const { haversineDistance } = await import("@/lib/utils/geo");
          distance = haversineDistance(lat, lng, event.meeting_point_lat, event.meeting_point_lng);
        }

        await submitCheckin(lat, lng, distance);
      },
      (err) => {
        setState("error");
        setErrorMsg("Impossible d'obtenir ta position. Autorise la géolocalisation.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleQrScan(result: string) {
    if (result.includes(id)) {
      await submitCheckin();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1D1D1D] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#1D1D1D] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <XCircle size={48} className="text-[#EF4444]" />
        <p className="text-white text-[16px] font-black uppercase">Sortie introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1D1D1D] flex flex-col items-center justify-center p-6">
      {newBadge && (
        <BadgeUnlockAnimation
          badgeSlug={newBadge.slug}
          badgeName={newBadge.name}
          onDone={() => setNewBadge(null)}
        />
      )}
      <AnimatePresence mode="wait">

        {/* SUCCESS */}
        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-28 h-28 rounded-full bg-[#22C55E]/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 size={56} className="text-[#22C55E]" />
            </motion.div>
            <h1 className="text-[36px] font-display font-black italic uppercase text-white leading-tight">
              Check-in<br />Validé !
            </h1>
            <p className="text-[#A3A3A3] text-[14px] mt-3">{event.title}</p>

            {/* Pulse rings */}
            <div className="relative w-32 h-32 mx-auto mt-8">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[#22C55E]/30"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2 + i * 0.5, opacity: 0 }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                />
              ))}
              <div className="absolute inset-0 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <MapPin size={28} className="text-[#22C55E]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* OUT OF RANGE */}
        {state === "out_of_range" && (
          <motion.div key="range" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mx-auto mb-6">
              <MapPin size={48} className="text-[#F59E0B]" />
            </div>
            <h1 className="text-[28px] font-display font-black italic uppercase text-white">
              Trop loin du point RDV
            </h1>
            <p className="text-[#A3A3A3] text-[13px] mt-2 max-w-xs mx-auto">
              Rapproche-toi du point de rendez-vous (rayon: {event.checkin_radius_meters}m) ou utilise le QR Code.
            </p>
            <button
              onClick={() => setState("scanning")}
              className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 rounded-full border border-white/20 text-white text-[12px] font-black uppercase tracking-widest hover:border-white transition-all"
            >
              <QrCode size={14} />
              Scanner le QR Code
            </button>
          </motion.div>
        )}

        {/* ERROR */}
        {state === "error" && (
          <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <XCircle size={56} className="text-[#EF4444] mx-auto mb-4" />
            <h1 className="text-[24px] font-display font-black italic uppercase text-white">Erreur</h1>
            <p className="text-[#A3A3A3] text-[13px] mt-2">{errorMsg}</p>
            <button onClick={() => setState("idle")} className="mt-6 px-6 py-3 rounded-full border border-white/20 text-white text-[12px] font-black uppercase tracking-widest hover:border-white transition-all">
              Réessayer
            </button>
          </motion.div>
        )}

        {/* LOCATING */}
        {state === "locating" && (
          <motion.div key="locating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[#FF5500]/40"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.5 + i * 0.5, opacity: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                />
              ))}
              <div className="absolute inset-0 rounded-full bg-[#FF5500]/20 flex items-center justify-center">
                <MapPin size={32} className="text-[#FF5500]" />
              </div>
            </div>
            <h1 className="text-[22px] font-display font-black italic uppercase text-white">
              Localisation en cours…
            </h1>
            <p className="text-[#A3A3A3] text-[13px] mt-2">Reste immobile quelques secondes.</p>
          </motion.div>
        )}

        {/* SUBMITTING */}
        {state === "submitting" && (
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <Loader2 size={48} className="animate-spin text-[#FF5500] mx-auto mb-4" />
            <p className="text-white text-[16px] font-black uppercase">Enregistrement…</p>
          </motion.div>
        )}

        {/* QR SCANNING */}
        {state === "scanning" && (
          <motion.div key="scanning" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
            <h1 className="text-[22px] font-display font-black italic uppercase text-white mb-4 text-center">
              Scanner le QR Code
            </h1>
            <Html5QrcodeScanner onScan={handleQrScan} />
            <button
              onClick={() => setState("idle")}
              className="w-full mt-4 py-3 rounded-full border border-white/20 text-white text-[12px] font-black uppercase tracking-widest hover:border-white transition-all"
            >
              Annuler
            </button>
          </motion.div>
        )}

        {/* IDLE */}
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
            <div className="mb-8">
              <Wifi size={40} className="text-[#FF5500] mx-auto mb-4" />
              <h1 className="text-[28px] font-display font-black italic uppercase text-white leading-tight">
                Check-in
              </h1>
              <p className="text-[#A3A3A3] text-[14px] mt-2">{event.title}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={gpsCheckin}
                className="w-full flex items-center justify-center gap-3 bg-[#FF5500] text-white h-14 rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95"
              >
                <MapPin size={18} />
                Check-in par GPS
              </button>

              <button
                onClick={() => setState("scanning")}
                className="w-full flex items-center justify-center gap-3 border border-white/20 text-white h-14 rounded-full text-[13px] font-black uppercase tracking-widest hover:border-white hover:bg-white/5 transition-all"
              >
                <QrCode size={18} />
                Scanner le QR Code
              </button>
            </div>

            <p className="text-[10px] text-[#555555] mt-6">
              Le GPS est recommandé. Le QR Code est disponible auprès de l'organisateur.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
