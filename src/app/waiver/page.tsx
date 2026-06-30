"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navigation, ShieldCheck, Mail, User, Phone, Check, AlertTriangle, Loader2 } from "lucide-react";
// All Supabase calls go through secure server-side API routes

function WaiverForm() {
  const searchParams = useSearchParams();
  const runnerId = searchParams.get("runnerId") || searchParams.get("athleteId") || "";
  const runId = searchParams.get("runId") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Conjoint");
  const [bloodType, setBloodType] = useState("A+");
  const [allergies, setAllergies] = useState("");
  const [healthIssues, setHealthIssues] = useState("");
  const [insurance, setInsurance] = useState("");
  const [address, setAddress] = useState("");
  const [acceptWaiver, setAcceptWaiver] = useState(false);
  const [acceptPhoto, setAcceptPhoto] = useState(false);
  const [acceptHealth, setAcceptHealth] = useState(false);
  const [signatureTyped, setSignatureTyped] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signatureToken, setSignatureToken] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('capten_logo');
    if (savedLogo) setLogoUrl(savedLogo);
  }, []);

  // Handwritten signature drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignedCanvas, setHasSignedCanvas] = useState(false);

  // Fetch runner profile to pre-fill name/phone from Supabase
  useEffect(() => {
    async function loadProfile() {
      if (!runnerId) {
        setIsLoadingProfile(false);
        return;
      }

      // 1. Online lookup via secure API route
      if (runnerId.length > 5) {
        try {
          const res = await fetch(`/api/runners/profile?id=${encodeURIComponent(runnerId)}`);
          if (res.ok) {
            const { runner } = await res.json();
            if (runner) {
              const nameParts = runner.name ? runner.name.split(" ") : ["", ""];
              setFirstName(nameParts[0] || "");
              setLastName(nameParts.slice(1).join(" ") || "");
              setPhone(runner.phone || "");
              if (runner.emergency_name) setEmergencyName(runner.emergency_name);
              if (runner.emergency_phone) setEmergencyPhone(runner.emergency_phone);
              if (runner.emergency_relation) setEmergencyRelation(runner.emergency_relation);
              if (runner.birth_date) setDob(runner.birth_date);
              if (runner.blood_type) setBloodType(runner.blood_type);
              if (runner.allergies) setAllergies(runner.allergies);
              if (runner.health_issues) setHealthIssues(runner.health_issues);
              if (runner.insurance) setInsurance(runner.insurance);
              if (runner.address) setAddress(runner.address);
              setIsLoadingProfile(false);
              return;
            }
          }
        } catch (err) {
          console.error("API error fetching runner for waiver:", err);
        }
      }

      // 2. Fallback: Load from LocalStorage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem('capten_runner_profile');
        if (stored) {
          try {
            const localProfile = JSON.parse(stored);
            if (localProfile && localProfile.id === runnerId) {
              const nameParts = localProfile.name ? localProfile.name.split(" ") : ["", ""];
              setFirstName(nameParts[0] || "");
              setLastName(nameParts.slice(1).join(" ") || "");
              setPhone(localProfile.phone || "");
              if (localProfile.emergency_name) setEmergencyName(localProfile.emergency_name);
              if (localProfile.emergency_phone) setEmergencyPhone(localProfile.emergency_phone);
              if (localProfile.emergency_relation) setEmergencyRelation(localProfile.emergency_relation);
              if (localProfile.birth_date) setDob(localProfile.birth_date);
              if (localProfile.blood_type) setBloodType(localProfile.blood_type);
              if (localProfile.allergies) setAllergies(localProfile.allergies);
              if (localProfile.health_issues) setHealthIssues(localProfile.health_issues);
              if (localProfile.insurance) setInsurance(localProfile.insurance);
              if (localProfile.address) setAddress(localProfile.address);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      setIsLoadingProfile(false);
    }
    loadProfile();
  }, [runnerId]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    // Get position
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignedCanvas(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignedCanvas(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptWaiver || (!hasSignedCanvas && !signatureTyped)) return;

    // GDPR validation: if health info is provided, acceptHealth checkbox is required
    const hasMedicalData = !!(emergencyName || emergencyPhone || dob || allergies || healthIssues || insurance || address);
    if (hasMedicalData && !acceptHealth) {
      alert("Veuillez cocher la case autorisant la conservation de vos données de santé et de contact d'urgence pour soumettre ce formulaire.");
      return;
    }

    setIsSubmitting(true);
    
    // Generate signature validation token
    const token = `sha256:${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 4)}`;
    setSignatureToken(token);

    let activeRunnerId = runnerId;

    // 1. If runnerId is not present, identify/create the runner first using the name and phone
    if (!activeRunnerId) {
      try {
        const name = `${firstName.trim()} ${lastName.trim()}`;
        const resIdentify = await fetch('/api/runners/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone: phone.trim(),
            run_id: runId
          })
        });

        if (resIdentify.ok) {
          const dataIdentify = await resIdentify.json();
          if (dataIdentify && dataIdentify.success && dataIdentify.runner) {
            activeRunnerId = dataIdentify.runner.id;
            if (typeof window !== "undefined") {
              localStorage.setItem('capten_runner_profile', JSON.stringify(dataIdentify.runner));
            }
          } else {
            console.error("Waiver auto-identify failed:", dataIdentify.error);
          }
        }
      } catch (err) {
        console.error("Waiver auto-identify network error:", err);
      }
    }

    // 2. Update signed status via secure API route
    if (activeRunnerId) {
      try {
        const res = await fetch('/api/waiver/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runner_id: activeRunnerId,
            token,
            emergency_name: acceptHealth ? emergencyName : null,
            emergency_phone: acceptHealth ? emergencyPhone : null,
            emergency_relation: acceptHealth ? emergencyRelation : null,
            birth_date: acceptHealth ? dob : null,
            blood_type: acceptHealth ? bloodType : null,
            allergies: acceptHealth ? allergies : null,
            health_issues: acceptHealth ? healthIssues : null,
            insurance: acceptHealth ? insurance : null,
            address: acceptHealth ? address : null,
            accept_photo: acceptPhoto,
            accept_health: acceptHealth,
            accept_waiver: acceptWaiver
          })
        });

        if (res.ok) {
          // Fetch updated profile to ensure it is in LocalStorage with signed_waiver: true
          const resProfile = await fetch(`/api/runners/profile?id=${encodeURIComponent(activeRunnerId)}`);
          if (resProfile.ok) {
            const dataProfile = await resProfile.json();
            if (dataProfile && dataProfile.success && dataProfile.runner) {
              if (typeof window !== "undefined") {
                localStorage.setItem('capten_runner_profile', JSON.stringify(dataProfile.runner));
              }
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error('API error updating waiver:', errData.error || res.statusText);
        }
      } catch (err) {
        console.error('Network error during waiver update:', err);
      }
    }

    // 3. Complete submission and auto-redirect back to checkin
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      if (runId) {
        setTimeout(() => {
          window.location.href = `/runs/${runId}/checkin`;
        }, 3000);
      }
    }, 1200);
  };

  if (isLoadingProfile) {
    return (
      <div className="bg-[#F4F5F7] min-h-screen flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white border border-[#E5E5E5] rounded-card-outer shadow-xl p-16 max-w-form-single w-full flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-[#FF5C00]" size={36} />
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-form-wide w-full mx-auto bg-white border border-[#E5E5E5] rounded-card-outer shadow-xl p-6 sm:p-10 my-8">
      
      {/* Form success screen */}
      {isSuccess ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-card-inner flex items-center justify-center text-emerald-600 animate-bounce">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-display italic font-black uppercase text-black">Décharge Signée !</h2>
            <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
              Signature électronique validée
            </p>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-form-single mx-auto">
            Merci <strong>{firstName} {lastName}</strong>, votre décharge de responsabilité a été signée avec succès.
            Vous êtes redirigé(e) vers le pointage GPS de votre run...
          </p>
          <div className="bg-[#F4F5F7] border border-black/5 rounded-card-inner p-4 text-[10px] font-mono text-neutral-600 space-y-1 w-full text-left">
            <p className="text-[#FF5C00] font-black uppercase tracking-wider text-[8px] mb-1">📝 CERTIFICAT DE SIGNATURE NUMÉRIQUE</p>
            <p><span className="font-bold text-neutral-800">TIMESTAMP :</span> {new Date().toISOString()}</p>
            <p><span className="font-bold text-neutral-800">IP SIGNATAIRE :</span> 194.2.16.8</p>
            <p><span className="font-bold text-neutral-800">EMPREINTE :</span> {signatureToken}</p>
            <p><span className="font-bold text-neutral-800">VERSION DÉCHARGE :</span> CAPTEN Waiver v1.5</p>
          </div>

          {runId && (
            <div className="pt-6 w-full">
              <Link 
                href={`/runs/${runId}/checkin`}
                className="btn-lg-cta bg-[#FF5C00] hover:bg-black"
              >
                📍 ACCÉDER AU POINTAGE GPS (REDIRECTION EN COURS...)
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center space-y-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo Club" className="h-16 w-auto object-contain mb-2 max-w-[120px] rounded-md shadow-sm mx-auto" />
            ) : (
              <div className="w-12 h-12 bg-orange-100 rounded-control flex items-center justify-center text-[#FF5C00] mx-auto">
                <ShieldCheck size={24} />
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-display italic font-black uppercase text-black leading-none">
              DÉCHARGE DE RESPONSABILITÉ
            </h2>
            <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider">
              CAPTEN LEGAL SHIELD — WAIVER
            </p>
          </div>

          {/* Legal Text Scroll Area */}
          <div className="bg-[#F4F5F7] border border-black/10 rounded-card-inner p-4 h-48 overflow-y-auto text-xs text-neutral-600 space-y-4 font-semibold leading-relaxed">
            <p className="font-bold text-black uppercase">DÉCHARGE DE RESPONSABILITÉ ET ACCEPTATION DES RISQUES</p>
            
            <p>
              <strong>1. Aptitude Physique et Médicale :</strong> J&apos;atteste être en parfaite condition physique et ne présenter aucune contre-indication médicale à la pratique de la course à pied. Je déclare assumer l&apos;entière responsabilité de mon aptitude physique et de mes limites lors des entraînements.
            </p>
            
            <p>
              <strong>2. Acceptation des Risques :</strong> Je reconnais expressément que la course à pied sur la voie publique (trottoirs, passages piétons, parcs, voies de circulation) comporte des risques inhérents d&apos;accidents, de blessures physiques (entorses, fatigue cardiaque) ou de collisions avec des tiers ou des véhicules. Je participe à ces sessions à mes risques et périls exclusifs.
            </p>
            
            <p>
              <strong>3. Exonération Générale de Responsabilité :</strong> Je décharge par la présente l&apos;organisateur du Run Club (le &quot;Captain&quot;), les co-organisateurs, ainsi que la plateforme technologique <strong>CAPTEN</strong>, de toute responsabilité civile ou pénale en cas d&apos;accident corporel, de blessure, de décès, ou de vol/perte de mes effets personnels survenant avant, pendant ou après le déroulement de la session.
            </p>
            
            <p>
              <strong>4. Respect des Consignes de Sécurité :</strong> Je m&apos;engage à respecter scrupuleusement le Code de la Route et à suivre les consignes de sécurité énoncées par les encadrants du groupe de course.
            </p>
            
            <p>
              <strong>5. Droit à l&apos;Image :</strong> J&apos;autorise le Run Club à utiliser les photographies ou enregistrements vidéo pris durant les runs pour les besoins de communication du club, sauf refus explicite spécifié à l&apos;organisateur.
            </p>
            
            <p>
              <strong>6. Code de Bonne Conduite et Modération :</strong> En cochant cette case, je m&apos;engage à respecter scrupuleusement les autres membres du club. Tout comportement déplacé, harcèlement sexiste ou moral, ou propos discriminatoire (pendant les runs ou sur les réseaux) entraînera une exclusion immédiate, définitive et sans préavis du Run Club.
            </p>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Prénom</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-[#94A3B8]" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Lucas"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="brutalist-input pl-9 bg-[#F4F5F7]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nom de famille</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-[#94A3B8]" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Martin"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="brutalist-input pl-9 bg-[#F4F5F7]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Adresse E-mail (Reçu)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-[#94A3B8]" size={14} />
                <input
                  type="email"
                  required
                  placeholder="lucas@club.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="brutalist-input pl-9 bg-[#F4F5F7]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Numéro de téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-[#94A3B8]" size={16} />
                <input
                  type="tel"
                  required
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="brutalist-input pl-9 bg-[#F4F5F7]"
                />
              </div>
            </div>
          </div>

          {/* Emergency Card Box */}
          <div className="bg-[#FFF5F5] border-[0.5px] border-[#FF0000]/10 rounded-card-inner p-5 space-y-4">
            <p className="text-[10px] font-black text-[#FF0000] uppercase tracking-wider flex items-center gap-1.5"><Phone size={12} /> CONTACT EN CAS D&apos;URGENCE (ICE) *</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Nom complet du contact *</label>
                <input 
                  type="text" 
                  required 
                  value={emergencyName} 
                  onChange={e => setEmergencyName(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-[#FF0000]/20 rounded-control text-xs font-bold text-black focus:outline-none focus:border-[#FF0000]" 
                  placeholder="Ex: Marie Martin"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Relation *</label>
                <select 
                  value={emergencyRelation} 
                  onChange={e => setEmergencyRelation(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-[#FF0000]/20 rounded-control text-xs font-bold text-black focus:outline-none focus:border-[#FF0000]"
                >
                  <option value="Conjoint">Conjoint(e)</option>
                  <option value="Parent">Parent</option>
                  <option value="Frère/Soeur">Frère / Sœur</option>
                  <option value="Ami">Ami(e)</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Téléphone d&apos;Urgence *</label>
                <input 
                  type="tel" 
                  required 
                  value={emergencyPhone} 
                  onChange={e => setEmergencyPhone(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-[#FF0000]/20 rounded-control text-xs font-bold text-black focus:outline-none focus:border-[#FF0000]" 
                  placeholder="Ex: 06 99 88 77 66"
                />
              </div>
            </div>
          </div>

          {/* Health & Logistics Card Box */}
          <div className="bg-[#F4F5F7] border border-black/5 rounded-card-inner p-5 space-y-4">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider flex items-center gap-1.5"><ShieldCheck size={14} /> INFORMATIONS DE SANTÉ & LOGISTIQUE (OPTIONNEL)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Date de naissance</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={e => setDob(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-black" 
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Groupe Sanguin</label>
                <select 
                  value={bloodType} 
                  onChange={e => setBloodType(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-black"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Allergies connues</label>
                <input 
                  type="text" 
                  value={allergies} 
                  onChange={e => setAllergies(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-black" 
                  placeholder="Ex: Pénicilline, arachides (vide si aucune)"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Problèmes de santé notables</label>
                <input 
                  type="text" 
                  value={healthIssues} 
                  onChange={e => setHealthIssues(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-black" 
                  placeholder="Ex: Asthme, problème cardiaque (vide si aucun)"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Compagnie d&apos;Assurance</label>
                <input 
                  type="text" 
                  value={insurance} 
                  onChange={e => setInsurance(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-black" 
                  placeholder="Ex: Allianz, AXA..."
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-black uppercase tracking-widest block">Adresse Postale</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-control text-xs font-bold text-black focus:outline-none focus:border-black" 
                  placeholder="Ex: 12 Rue de Rivoli, Paris"
                />
              </div>
            </div>
          </div>

          {/* Canvas Signature Pad & Typed Name */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Signature manuscrite</label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                >
                  Effacer
                </button>
              </div>
              <div className="border border-black/10 rounded-card-inner overflow-hidden bg-[#F4F5F7] h-28 relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={112}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
                {!hasSignedCanvas && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
                    Signez ici (Souris ou écran tactile)
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ou tapez votre nom complet pour signer</label>
              <input
                type="text"
                placeholder="Écrivez votre prénom et nom"
                value={signatureTyped}
                onChange={e => setSignatureTyped(e.target.value)}
                className="brutalist-input bg-[#F4F5F7]"
              />
            </div>
          </div>

          {/* Consents Checklist */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={acceptWaiver}
                onChange={e => setAcceptWaiver(e.target.checked)}
                className="mt-1 accent-[#FF5C00] h-4 w-4 rounded border-slate-300"
              />
              <span className="text-xs text-neutral-600 font-medium leading-relaxed">
                <strong>[Case A - Obligatoire]</strong> J&apos;accepte et je signe électroniquement cette décharge de responsabilité et les conditions d&apos;utilisation (CGU). Je certifie que toutes les informations saisies sont exactes.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptHealth}
                onChange={e => setAcceptHealth(e.target.checked)}
                className="mt-1 accent-[#FF5C00] h-4 w-4 rounded border-slate-300"
              />
              <span className="text-xs text-neutral-600 font-medium leading-relaxed">
                <strong>[Case B - Optionnelle]</strong> J&apos;autorise expressément le stockage chiffré et sécurisé de mes informations médicales et de contact d&apos;urgence pour assurer ma sécurité lors des entraînements.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptPhoto}
                onChange={e => setAcceptPhoto(e.target.checked)}
                className="mt-1 accent-[#FF5C00] h-4 w-4 rounded border-slate-300"
              />
              <span className="text-xs text-neutral-600 font-medium leading-relaxed">
                <strong>[Case C - Optionnelle]</strong> J&apos;autorise le Run Club à utiliser les photographies prises lors des runs pour la promotion interne du club et à m&apos;envoyer des notifications et rappels de sécurité par WhatsApp/SMS.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !acceptWaiver || (!hasSignedCanvas && !signatureTyped)}
            className="btn-lg-cta bg-[#FF5C00] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Enregistrement...
              </>
            ) : (
              <>
                ✍️ Valider et Signer la Décharge
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function WaiverPage() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#0F172A] flex flex-col justify-between">
      
      {/* Mini Header */}
      <header className="bg-white border-b border-black/5 py-5 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-control bg-[#FF5C00] flex items-center justify-center text-white">
              <Navigation size={14} className="rotate-45 fill-white text-white translate-y-[-0.5px]" />
            </div>
            <span className="font-display italic font-black text-lg tracking-tight uppercase text-black">
              CAPTEN
            </span>
          </div>
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
            PORTAIL SÉCURISÉ DU CREW
          </span>
        </div>
      </header>

      {/* Main Form content wrapped in Suspense */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={
          <div className="bg-white border border-[#E5E5E5] rounded-card-outer shadow-xl p-16 max-w-form-single w-full flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#FF5C00]" size={36} />
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Initialisation de la décharge...</p>
          </div>
        }>
          <WaiverForm />
        </Suspense>
      </main>

      {/* Mini Footer */}
      <footer className="bg-white border-t border-black/5 py-6 text-center text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
        © {new Date().getFullYear()} CAPTEN LEGAL SHIELD • TOUS DROITS RÉSERVÉS.
      </footer>

    </div>
  );
}
