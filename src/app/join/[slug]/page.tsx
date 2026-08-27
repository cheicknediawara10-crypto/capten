"use client";

import React, { useRef, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ChevronLeft, Shield, FileText, CheckCircle2,
  Loader2, AlertCircle, Eye, EyeOff, MapPin, ExternalLink, Gift,
} from "lucide-react";
import { registerMembre } from "@/app/mon-espace/actions";
import { getSpotCategory } from "@/lib/spot-categories";

type Step = "infos" | "pin" | "ice" | "waiver" | "success";
const STEPS: Step[] = ["infos", "pin", "ice", "waiver", "success"];

interface CrewSpot {
  id: string; nom: string; categorie: string; adresse: string | null;
  lien_maps: string | null; mot_du_fondateur: string | null; avantage: string | null;
  suggested_by_name?: string | null; status?: string;
}

function useCrewSpots(clubId: string | undefined) {
  const [spots, setSpots] = React.useState<CrewSpot[]>([]);
  React.useEffect(() => {
    if (!clubId) return;
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .from("crew_spots")
        .select("id, nom, categorie, adresse, lien_maps, mot_du_fondateur, avantage, suggested_by_name, status")
        .eq("club_id", clubId)
        .neq("status", "pending")
        .order("ordre")
        .then((res: { data: CrewSpot[] | null }) => setSpots(res.data || []));
    });
  }, [clubId]);
  return spots;
}

function SpotsSection({ spots, clubName }: { spots: CrewSpot[]; clubName: string }) {
  if (spots.length === 0) return null;
  return (
    <div className="w-full max-w-sm mt-8 mb-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3 text-center flex items-center justify-center gap-1.5">
        <MapPin size={12} className="text-[#FF5500]" />
        Les Bonnes Adresses du Crew
      </p>
      <div className="space-y-2.5">
        {spots.map((s) => {
          const cat = getSpotCategory(s.categorie);
          return (
          <div key={s.id} className="bg-white rounded-2xl border border-[#E8E8E8] px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="shrink-0 w-8 h-8 rounded-[10px] bg-[#FF5500]/[0.08] flex items-center justify-center">
                <cat.Icon size={15} strokeWidth={2} className="text-[#FF5500]" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-extrabold text-[#111111] leading-tight">{s.nom}</p>
                {s.suggested_by_name && (
                  <p className="text-[10px] font-bold text-[#FF5500] mt-0.5">
                    🤝 Découvert par {s.suggested_by_name}
                  </p>
                )}
                {s.mot_du_fondateur && (
                  <p className="text-[11px] text-[#9CA3AF] italic mt-0.5 truncate">« {s.mot_du_fondateur} »</p>
                )}
              </div>
              {s.lien_maps && (
                <a href={s.lien_maps} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 w-7 h-7 rounded-full bg-[#F4F4EE] flex items-center justify-center hover:bg-[#FF5500] hover:text-white transition-colors text-[#9CA3AF]">
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
            {s.avantage && (
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-[#FF5500] text-white text-[10px] font-bold">
                <Gift size={9} strokeWidth={2.4} />
                {s.avantage}
              </span>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function useClub(slug: string) {
  const [club, setClub] = React.useState<{
    id: string; name: string; logo_url: string | null; city: string | null; description: string | null; website_url: string | null;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const sb = createClient();
      sb.from("clubs")
        .select("id, name, logo_url, city, description, website_url")
        .eq("slug", slug)
        .single()
        .then((res: { data: typeof club }) => { setClub(res.data); setLoading(false); });
    });
  }, [slug]);

  return { club, loading };
}

export default function JoinPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { club, loading } = useClub(slug);
  const spots = useCrewSpots(club?.id);

  const isEn = false;

  const [step, setStep]       = useState<Step>("infos");
  const [isPending, start]    = useTransition();
  const [error, setError]     = useState("");

  // Step: infos
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [dob, setDob]             = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");

  // Step: pin
  const [pin, setPin]             = useState(["", "", "", ""]);
  const [pinConfirm, setPinConfirm] = useState(["", "", "", ""]);
  const [showPin, setShowPin]     = useState(false);
  const pinRefs    = useRef<(HTMLInputElement | null)[]>([]);
  const pinCRefs   = useRef<(HTMLInputElement | null)[]>([]);

  // Step: ice
  const [iceName, setIceName]         = useState("");
  const [icePhone, setIcePhone]       = useState("");
  const [iceRelation, setIceRelation] = useState("");
  const [iceConsent, setIceConsent]   = useState(false); // consentement explicite données santé (RGPD art. 9)

  // Step: waiver
  const [waiverChecked, setWaiverChecked] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  function handlePinInput(
    i: number, val: string,
    arr: string[], setArr: (a: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) {
    if (!/^\d*$/.test(val)) return;
    const next = [...arr]; next[i] = val.slice(-1); setArr(next);
    if (val && i < 3) refs.current[i + 1]?.focus();
  }

  function handlePinKeyDown(
    i: number, e: React.KeyboardEvent,
    arr: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) {
    if (e.key === "Backspace" && !arr[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function validateInfos(): boolean {
    if (!firstName.trim() || !lastName.trim() || !dob) {
      setError(isEn ? "First name, last name, and date of birth are required." : "Prénom, nom et date de naissance sont requis.");
      return false;
    }
    return true;
  }

  function validatePin(): boolean {
    const p = pin.join(""); const c = pinConfirm.join("");
    if (p.length < 4) { 
      setError(isEn ? "Please choose a 4-digit PIN code." : "Choisis un code PIN à 4 chiffres."); 
      return false; 
    }
    if (p !== c) { 
      setError(isEn ? "PIN codes do not match." : "Les deux codes PIN ne correspondent pas."); 
      setPinConfirm(["","","",""]); 
      pinCRefs.current[0]?.focus(); 
      return false; 
    }
    return true;
  }

  function next() {
    setError("");
    if (step === "infos" && !validateInfos()) return;
    if (step === "pin"   && !validatePin())   return;
    // Contact d'urgence (ICE) : enregistrement validé par le coureur
    if (step === "ice" && (iceName || icePhone) && !iceConsent) {
      setError(isEn
        ? "Please confirm your consent to store your emergency contact details."
        : "Merci d'accepter l'enregistrement de ton contact d'urgence pour continuer.");
      return;
    }
    setStep(STEPS[stepIndex + 1] as Step);
  }

  async function submitWaiver() {
    if (!waiverChecked || !club) return;
    setError("");
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${firstName}-${lastName}-${dob}-${club.id}-${Date.now()}`)
    );
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0")).join("");

    start(async () => {
      const res = await registerMembre({
        first_name:  firstName,
        last_name:   lastName,
        date_of_birth: dob,
        phone:       phone.trim(),
        email:       email.trim(),
        pin:         pin.join(""),
        club_id:     club.id,
        ice_name:    iceName,
        ice_phone:   icePhone,
        ice_relation: iceRelation,
        ice_consent: iceConsent,
        waiver_hash: hashHex,
      });
      if ("error" in res) { setError(res.error); return; }
      setStep("success");
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={28} />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-5xl font-extrabold text-[#E8E8E8]">404</p>
        <p className="text-base font-bold text-[#374151]">Club introuvable</p>
        <p className="text-sm text-[#9CA3AF]">Ce lien ne correspond à aucun club actif.</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E8E8] p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111] mb-2">Bienvenue !</h1>
          <p className="text-sm text-[#6B7280] mb-1">
            Tu fais maintenant partie de <span className="font-bold text-[#111111]">{club.name}</span>.
          </p>
          <p className="text-xs text-[#9CA3AF] mb-8">
            Retiens ton prénom, ton nom, ta date de naissance et ton code PIN pour accéder à ton espace.
          </p>
          <button
            onClick={() => router.push("/mon-espace/profil")}
            className="w-full h-12 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            Accéder à mon espace <ArrowRight className="w-4 h-4" />
          </button>

          {club.website_url && (
            <a
              href={club.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full h-11 border border-[#E8E8E8] hover:border-[#FF5500] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#111111] transition-colors"
            >
              ☕ Cotisation / Soutenir l&apos;orga du crew ↗
            </a>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#E8E8E8] z-50">
        <motion.div
          className="h-full bg-[#FF5500]"
          initial={{ width: 0 }}
          animate={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-5 pt-6">

        {/* Club header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E8E8] shadow-sm flex items-center justify-center overflow-hidden">
            {club.logo_url
              ? <img src={club.logo_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-2xl font-extrabold text-[#FF5500]">{club.name[0]}</span>
            }
          </div>
          <div className="text-center">
            <h1 className="text-lg font-extrabold text-[#111111]">{club.name}</h1>
            {club.city && <p className="text-xs text-[#9CA3AF] mt-0.5">{club.city}</p>}
          </div>
        </motion.div>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">

            {/* ── STEP: INFOS ── */}
            {step === "infos" && (
              <motion.div key="infos" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <div className="bg-white rounded-3xl border border-[#E8E8E8] p-7 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <StepLabel index={1} total={4} title={isEn ? "Your information" : "Tes informations"} isEn={isEn} />

                  <div className="grid grid-cols-2 gap-3">
                    <Field label={isEn ? "First name" : "Prénom"}>
                      <input type="text" autoComplete="given-name" value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex" className="capten-input" />
                    </Field>
                    <Field label={isEn ? "Last name" : "Nom"}>
                      <input type="text" autoComplete="family-name" value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Dupont" className="capten-input" />
                    </Field>
                  </div>

                  <Field label={isEn ? "Date of birth" : "Date de naissance"}>
                    <input type="date" autoComplete="bday" value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="capten-input" />
                  </Field>

                  <Field label={isEn ? "Phone (optional)" : "Téléphone (optionnel)"}>
                    <input type="tel" autoComplete="tel" value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78" className="capten-input" />
                  </Field>

                  <Field label={isEn ? "Email (to recover your PIN)" : "E-mail (pour récupérer ton PIN)"}>
                    <input type="email" autoComplete="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com" className="capten-input" />
                  </Field>

                  <ErrorBox error={error} />
                  <ContinueBtn onClick={next} label={isEn ? "Continue" : "Continuer"} />
                </div>
              </motion.div>
            )}

            {/* ── STEP: PIN ── */}
            {step === "pin" && (
              <motion.div key="pin" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <div className="bg-white rounded-3xl border border-[#E8E8E8] p-7 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <StepLabel index={2} total={4} title={isEn ? "Choose your PIN code" : "Choisis ton code PIN"} isEn={isEn} />

                  <p className="text-xs text-[#6B7280]">
                    {isEn ? "This 4-digit code will let you log into your member passport. Memorize it." : "Ce code à 4 chiffres te permettra d'accéder à ton espace membre. Mémorise-le."}
                  </p>

                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      {isEn ? "PIN Code" : "Code PIN"}
                    </label>
                    <button type="button" onClick={() => setShowPin((s) => !s)}
                      className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer">
                      {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showPin ? (isEn ? "Hide" : "Masquer") : (isEn ? "Show" : "Afficher")}
                    </button>
                  </div>

                  <PinBoxes digits={pin} setDigits={setPin} refs={pinRefs} show={showPin} />

                  <Field label={isEn ? "Confirm your PIN" : "Confirme ton PIN"}>
                    <PinBoxes digits={pinConfirm} setDigits={setPinConfirm} refs={pinCRefs} show={showPin} />
                  </Field>

                  <ErrorBox error={error} />
                  <div className="flex gap-3">
                    <BackBtn onClick={() => { setError(""); setStep("infos"); }} />
                    <ContinueBtn onClick={next} label={isEn ? "Continue" : "Continuer"} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP: ICE ── */}
            {step === "ice" && (
              <motion.div key="ice" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <div className="bg-white rounded-3xl border border-[#E8E8E8] p-7 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <StepLabel index={3} total={4} title={isEn ? "Emergency Contact (ICE)" : "Contact d'urgence"} isEn={isEn} />
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    {isEn ? "In case of emergency during a session. Strictly confidential and only accessible by organizers." : "En cas d'incident sur un run. Cette info reste confidentielle et accessible uniquement à ton organisateur."}
                  </p>

                  <Field label={isEn ? "Contact Full Name" : "Nom du contact"}>
                    <input type="text" value={iceName} onChange={(e) => setIceName(e.target.value)}
                      placeholder="Sarah Dupont" className="capten-input" />
                  </Field>
                  <Field label={isEn ? "Contact Phone Number" : "Téléphone du contact"}>
                    <input type="tel" value={icePhone} onChange={(e) => setIcePhone(e.target.value)}
                      placeholder="+33 6 98 76 54 32" className="capten-input" />
                  </Field>
                  <Field label={isEn ? "Relationship (optional)" : "Relation (optionnel)"}>
                    <input type="text" value={iceRelation} onChange={(e) => setIceRelation(e.target.value)}
                      placeholder={isEn ? "Sister, Partner, Friend..." : "Sœur, conjoint, ami…"} className="capten-input" />
                  </Field>

                  {(iceName || icePhone) && (
                    <label className="flex items-start gap-3 cursor-pointer bg-[#FAFAF8] border border-[#E8E8E8] rounded-2xl p-3.5">
                      <div
                        onClick={() => setIceConsent((c) => !c)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                          iceConsent ? "bg-[#FF5500] border-[#FF5500]" : "border-[#D0D0D0]"
                        }`}
                      >
                        {iceConsent && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[11px] text-[#374151] leading-relaxed">
                        {isEn
                          ? "I consent to Capten storing my emergency contact details (name, phone, relationship) so my crew captain or co-captain can reach them in case of an incident during a run. I can update or delete this information at any time from my profile."
                          : "J'accepte que Capten enregistre les coordonnées de mon contact d'urgence (nom, téléphone, lien de parenté) afin que le capitaine ou co-capitaine de mon crew puisse le joindre en cas d'incident pendant une sortie. Je peux modifier ou supprimer ces informations à tout moment depuis mon profil."}
                      </span>
                    </label>
                  )}

                  <ErrorBox error={error} />
                  <div className="flex gap-3">
                    <BackBtn onClick={() => { setError(""); setStep("pin"); }} />
                    <ContinueBtn onClick={next} label={!iceName && !icePhone ? (isEn ? "Skip" : "Passer") : (isEn ? "Continue" : "Continuer")} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP: WAIVER ── */}
            {step === "waiver" && (
              <motion.div key="waiver" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <div className="bg-white rounded-3xl border border-[#E8E8E8] p-7 space-y-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FF5500]/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#FF5500]" />
                    </div>
                    <StepLabel index={4} total={4} title={isEn ? "Liability Waiver" : "Décharge de responsabilité"} isEn={isEn} />
                  </div>

                  <div className="bg-[#F5F5F3] rounded-2xl p-4 max-h-48 overflow-y-auto text-xs text-[#6B7280] leading-relaxed space-y-2">
                    <p className="font-bold text-[#374151]">{isEn ? "Liability Waiver & Physical Fitness Agreement — " : "Décharge de responsabilité — "}{club.name}</p>
                    {isEn ? (
                      <>
                        <p>By joining this club and taking part in its athletic activities, I acknowledge that running and physical activities involve inherent outdoor risks.</p>
                        <p>I certify that I am in suitable physical condition and have consulted a physician if necessary.</p>
                        <p>I release {club.name} and its volunteer organizers from any liability in the event of injury, accident, or damage occurring during sessions, except in cases of gross negligence.</p>
                        <p className="text-[#9CA3AF] italic">
                          This waiver is digitally timestamped and signed. Valid version v1.
                        </p>
                      </>
                    ) : (
                      <>
                        <p>En rejoignant ce club et en participant à ses activités sportives, je reconnais que la pratique de la course à pied et d'activités physiques comporte des risques inhérents.</p>
                        <p>Je certifie être en bonne condition physique pour pratiquer ces activités et avoir consulté un médecin si nécessaire.</p>
                        <p>Je dégage {club.name} et ses organisateurs de toute responsabilité en cas d'accident, de blessure ou de dommage survenus lors des sessions, sauf en cas de faute grave.</p>
                        <p className="text-[#9CA3AF] italic">
                          Cette décharge est horodatée et signée électroniquement. Document valable version v1.
                        </p>
                      </>
                    )}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div
                      onClick={() => setWaiverChecked((c) => !c)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        waiverChecked ? "bg-[#FF5500] border-[#FF5500]" : "border-[#D0D0D0]"
                      }`}
                    >
                      {waiverChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-[#374151] leading-relaxed">
                      {isEn ? "I have read and agree to the liability waiver. I certify that the provided information is accurate." : "J'ai lu et j'accepte la décharge de responsabilité. Je certifie que les informations fournies sont exactes."}{" "}
                      <span className="text-[#111111] font-bold">{firstName} {lastName}</span>
                    </span>
                  </label>

                  <ErrorBox error={error} />

                  <div className="flex gap-3">
                    <BackBtn onClick={() => { setError(""); setStep("ice"); }} />
                    <button
                      onClick={submitWaiver}
                      disabled={!waiverChecked || isPending}
                      className="flex-1 h-12 bg-[#FF5500] hover:bg-[#E04B00] disabled:opacity-40 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <>
                            {isEn ? "Sign & Join Crew" : "Signer et rejoindre"} <CheckCircle2 className="w-4 h-4" />
                          </>
                      }
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Crew Spots */}
          {spots.length > 0 && <SpotsSection spots={spots} clubName={club.name} />}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function StepLabel({ index, total, title, isEn = false }: { index: number; total: number; title: string; isEn?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-0.5">
        {isEn ? `Step ${index}/${total}` : `Étape ${index}/${total}`}
      </p>
      <h2 className="text-lg font-extrabold text-[#111111]">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function PinBoxes({
  digits, setDigits, refs, show,
}: {
  digits: string[];
  setDigits: (d: string[]) => void;
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  show: boolean;
}) {
  function handleInput(i: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits]; next[i] = val.slice(-1); setDigits(next);
    if (val && i < 3) refs.current[i + 1]?.focus();
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }
  return (
    <div className="flex gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type={show ? "text" : "password"}
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-full h-14 text-center text-xl font-bold border border-[#E8E8E8] rounded-xl bg-[#F5F5F3] text-[#111111] focus:outline-none focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/10 focus:bg-white transition-all"
        />
      ))}
    </div>
  );
}

function ErrorBox({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-xs text-red-600 font-medium leading-snug">{error}</p>
    </div>
  );
}

function ContinueBtn({ onClick, label = "Continuer" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 h-12 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_4px_14px_rgba(255,85,0,0.25)]"
    >
      {label} <ArrowRight className="w-4 h-4" />
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-xl border border-[#E8E8E8] flex items-center justify-center text-[#9CA3AF] hover:text-[#111111] hover:border-[#D0D0D0] transition-colors cursor-pointer shrink-0"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
  );
}
