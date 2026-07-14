'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Camera, RefreshCw, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function SpotScannerPage() {
  const { club } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Script jsQR chargé CDN
  const [jsQrLoaded, setJsQrLoaded] = useState(false);

  // Stream Caméra
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Statuts de validation du scan
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'checking' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [runnerInfo, setRunnerInfo] = useState<{ name: string; offer: string } | null>(null);

  // Charger jsQR par CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.async = true;
    script.onload = () => setJsQrLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Charger les événements actifs pour le sélecteur
  async function loadEvents() {
    try {
      setLoadingEvents(true);
      const res = await fetch('/api/spot-events');
      if (res.ok) {
        const data = await res.json();
        // Filtrer uniquement les événements ouverts à la vente ou complétés
        const activeEvents = data.filter((e: any) => ['on_sale', 'completed'].includes(e.status));
        setEvents(activeEvents);
        if (activeEvents.length > 0) {
          setSelectedEventId(activeEvents[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load events for scanner:', err);
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      setScanStatus('scanning');
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // requis pour iOS
        videoRef.current.play();
        setScanning(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setScanStatus('idle');
      setCameraActive(false);
      alert('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès dans vos paramètres.');
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    setScanning(false);
    setCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Boucle d'analyse des images vidéo du canvas pour décoder le QR
  useEffect(() => {
    let animationFrameId: number;

    const scanFrame = () => {
      if (!scanning || !videoRef.current || !canvasRef.current || !jsQrLoaded) {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Appel de la globale chargée par CDN
        const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          // Un QR Code a été détecté
          setScanning(false);
          stopCamera();
          handleRedeem(code.data);
        }
      }
      animationFrameId = requestAnimationFrame(scanFrame);
    };

    if (scanning) {
      animationFrameId = requestAnimationFrame(scanFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scanning, jsQrLoaded]);

  // Valider le ticket QR
  const handleRedeem = async (token: string) => {
    if (!selectedEventId) {
      alert('Veuillez sélectionner un événement.');
      startCamera();
      return;
    }
    setScanStatus('checking');
    setStatusMessage('Validation du billet en cours...');

    try {
      const res = await fetch(`/api/spot-events/${selectedEventId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_token: token })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setScanStatus('success');
        setRunnerInfo({
          name: data.runner_name || 'Coureur',
          offer: data.offer || 'Formule Spot'
        });
        setStatusMessage('Billet validé avec succès !');
      } else {
        setScanStatus('error');
        setStatusMessage(data.message || 'Billet invalide ou expiré.');
      }
    } catch (err) {
      setScanStatus('error');
      setStatusMessage('Erreur réseau de validation.');
    }
  };

  const resetScanner = () => {
    setRunnerInfo(null);
    setScanStatus('idle');
    setStatusMessage('');
    startCamera();
  };

  // Arrêter la caméra lors de la fermeture de la page
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-8 pb-20 page-transition">
      {/* Header */}
      <header className="flex flex-col gap-1.5 pb-6 border-b-[0.5px] border-black/10 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <h1 className="text-[28px] sm:text-[42px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
              SCANNER QR CODE
            </h1>
            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mt-1">
              Check-in des coureurs sur place
            </p>
          </div>
          
          <button
            onClick={() => router.push('/spots/events')}
            className="text-[10px] font-mono font-bold text-[#A3A3A3] hover:text-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft size={14} /> Retour
          </button>
        </div>
      </header>

      {/* Select Event */}
      <div className="max-w-md bg-white border border-black/10 p-5 rounded-xl space-y-3 shadow-sm">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Sélectionner la sortie du jour</label>
        {loadingEvents ? (
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Loader2 className="animate-spin text-[#FF5C00]" size={14} />
            <span>Chargement des événements...</span>
          </div>
        ) : events.length === 0 ? (
          <p className="text-xs font-sans font-bold text-red-500">Aucun événement actif ou terminé disponible pour le scan.</p>
        ) : (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={cameraActive}
            className="w-full bg-[#F4F5F7] border border-black/10 rounded-md px-3.5 py-2.5 text-xs font-sans font-semibold focus:outline-none focus:border-[#FF5C00] focus:bg-white transition-all disabled:opacity-50"
          >
            {events.map(e => (
              <option key={e.id} value={e.id}>
                {e.spot?.name} — {new Date(e.event_date).toLocaleDateString('fr-FR')}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Camera and Scan View */}
      {selectedEventId && (
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Main Scanner Box */}
          <div className="relative aspect-square w-full max-w-sm mx-auto bg-black rounded-2xl overflow-hidden border border-black flex flex-col items-center justify-center text-white">
            
            {/* Hidden elements */}
            <video ref={videoRef} className="hidden" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Video preview render overlay */}
            {cameraActive && scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Laser animation */}
                <div className="absolute left-6 right-6 h-0.5 bg-[#FF5C00] shadow-[0_0_8px_#FF5C00] animate-pulse"></div>
                {/* Target box framing */}
                <div className="w-64 h-64 border-2 border-white/50 rounded-2xl flex items-center justify-center">
                  <div className="w-full h-full border border-dashed border-[#FF5C00]/30 rounded-2xl"></div>
                </div>
              </div>
            )}

            {/* Inactive state */}
            {!cameraActive && scanStatus === 'idle' && (
              <button
                onClick={startCamera}
                disabled={!jsQrLoaded}
                className="px-6 py-3 bg-[#FF5C00] hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center gap-2"
              >
                {!jsQrLoaded ? 'Chargement...' : 'Démarrer le Scanner'} <Camera size={14} />
              </button>
            )}

            {/* Status cards overlay */}
            {scanStatus === 'checking' && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Loader2 className="animate-spin text-[#FF5C00]" size={36} />
                <p className="text-xs font-mono font-bold uppercase tracking-wider">{statusMessage}</p>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="absolute inset-0 bg-emerald-600 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-display italic font-black uppercase tracking-tight">Billet Validé !</h3>
                  <p className="text-sm font-sans font-bold">{runnerInfo?.name}</p>
                  <p className="text-[10px] font-sans text-white/80">{runnerInfo?.offer}</p>
                </div>
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 bg-black hover:bg-white hover:text-black text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded"
                >
                  Scanner le suivant
                </button>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <XCircle size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-display italic font-black uppercase tracking-tight">Erreur Billet</h3>
                  <p className="text-xs font-sans">{statusMessage}</p>
                </div>
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 bg-black hover:bg-white hover:text-black text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>

          {/* Tips under scanner */}
          {cameraActive && (
            <div className="text-center">
              <button
                onClick={stopCamera}
                className="text-xs font-mono font-bold text-[#A3A3A3] hover:text-black uppercase tracking-wider"
              >
                Annuler et fermer la caméra
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
