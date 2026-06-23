import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { cancelParticipantAndPromote } from '@/app/actions/waitlist-actions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new Response(errorHtml("Token manquant", "Le lien d'annulation est invalide ou corrompu. Veuillez vérifier l'URL de votre SMS."), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const isDemo = token.startsWith('demo-');
  const supabase = getSupabase();

  if (isDemo || !supabase) {
    // Mode démo simulation
    const runTitle = token.includes('tempo') ? "TEMPO THURSDAY" : "SPEED RUN & INTERVALS";
    // Appeler le helper en mode démo pour voir la simulation de promotion s'afficher dans la console
    await cancelParticipantAndPromote(token);
    return new Response(successHtml(runTitle, "Noah Petit (Mode Démo)"), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  try {
    // 1. Récupérer l'inscription
    const { data: registration, error: fetchError } = await supabase
      .from('run_participants')
      .select('*, runs(*), members(*)')
      .eq('cancel_token', token)
      .single();

    if (fetchError || !registration) {
      return new Response(errorHtml("Inscription introuvable", "Le jeton d'annulation ne correspond à aucun enregistrement actif. Vous avez peut-être déjà annulé ce run."), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const run = registration.runs;
    const member = registration.members;

    if (!run || !member) {
      return new Response(errorHtml("Erreur de liaison", "Impossible de retrouver les détails du run ou du membre associé."), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (registration.status === 'cancelled') {
      return new Response(successHtml(run.title, member.firstname, true), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 2. Annuler et promouvoir avec le service centralisé
    const result = await cancelParticipantAndPromote(registration.id);

    if ('error' in result && result.error) {
      return new Response(errorHtml("Erreur d'annulation", `Impossible de traiter l'annulation : ${result.error}`), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Retourner la page de confirmation de succès
    return new Response(successHtml(run.title, member.firstname), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (err: any) {
    return new Response(errorHtml("Erreur Interne", err.message || "Une erreur réseau ou serveur est survenue lors de l'annulation."), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

function successHtml(runTitle: string, runnerName: string, alreadyCancelled = false) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Annulation validée — CAPTEN</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #08080C;
        color: #FDFCF8;
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        overflow: hidden;
      }
      .glow-orb {
        position: absolute;
        width: 60vw;
        height: 60vw;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 92, 0, 0.08) 0%, rgba(0,0,0,0) 70%);
        pointer-events: none;
        z-index: 1;
      }
      .glow-orb.top { top: -20%; left: -20%; }
      .glow-orb.bottom { bottom: -20%; right: -20%; }
      
      .container {
        position: relative;
        z-index: 10;
        max-width: 480px;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
      }
      .card {
        background: linear-gradient(135deg, rgba(30, 32, 48, 0.7) 0%, rgba(17, 18, 26, 0.9) 100%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        padding: 40px 30px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      }
      .badge-success {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        background-color: rgba(0, 255, 102, 0.1);
        border: 2px solid #00FF66;
        border-radius: 50%;
        color: #00FF66;
        margin-bottom: 24px;
        box-shadow: 0 0 20px rgba(0, 255, 102, 0.2);
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      h1 {
        font-family: 'Inter', sans-serif;
        font-weight: 900;
        font-style: italic;
        text-transform: uppercase;
        letter-spacing: -0.04em;
        line-height: 0.9;
        font-size: 28px;
        margin: 0 0 10px 0;
      }
      .subtitle {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.25em;
        color: #FF5C00;
        margin-bottom: 30px;
      }
      p.desc {
        color: #A3A8B8;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 30px;
      }
      .run-info {
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 30px;
        text-align: left;
      }
      .run-info-title {
        font-size: 8px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #A3A8B8;
        margin-bottom: 5px;
      }
      .run-info-value {
        font-size: 16px;
        font-weight: 900;
        font-style: italic;
        text-transform: uppercase;
        color: #FDFCF8;
      }
      .safe-shield {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background-color: rgba(0, 255, 102, 0.05);
        border: 1px solid rgba(0, 255, 102, 0.15);
        padding: 8px 16px;
        border-radius: 30px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        color: #00FF66;
        letter-spacing: 0.05em;
      }
      .footer-brand {
        margin-top: 40px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.3em;
        color: rgba(255, 255, 255, 0.2);
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div class="glow-orb top"></div>
    <div class="glow-orb bottom"></div>
    
    <div class="container">
      <div class="card">
        <div class="badge-success">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h1>${alreadyCancelled ? "DÉJÀ LIBÉRÉ" : "PLACE LIBÉRÉE"}</h1>
        <div class="subtitle">ANNULATION VALIDÉE</div>
        
        <p class="desc">
          Salut <strong>${runnerName}</strong>, ton annulation a été prise en compte avec succès. Tu as libéré ton dossard pour un autre membre de la communauté.
        </p>
        
        <div class="run-info">
          <div class="run-info-title">SESSION CONCERNÉE</div>
          <div class="run-info-value">${runTitle}</div>
        </div>
        
        <div class="safe-shield">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Protection Anti-Fantôme Active
        </div>
        
        <div class="footer-brand">CAPTEN SYSTEM</div>
      </div>
    </div>
  </body>
  </html>
  `;
}

function errorHtml(errorTitle: string, errorMessage: string) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erreur d'annulation — CAPTEN</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #08080C;
        color: #FDFCF8;
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        overflow: hidden;
      }
      .glow-orb {
        position: absolute;
        width: 60vw;
        height: 60vw;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 42, 84, 0.08) 0%, rgba(0,0,0,0) 70%);
        pointer-events: none;
        z-index: 1;
      }
      .glow-orb.top { top: -20%; left: -20%; }
      .glow-orb.bottom { bottom: -20%; right: -20%; }
      
      .container {
        position: relative;
        z-index: 10;
        max-width: 480px;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
      }
      .card {
        background: linear-gradient(135deg, rgba(30, 32, 48, 0.7) 0%, rgba(17, 18, 26, 0.9) 100%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 42, 84, 0.2);
        border-radius: 24px;
        padding: 40px 30px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      }
      .badge-error {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        background-color: rgba(255, 42, 84, 0.1);
        border: 2px solid #FF2A54;
        border-radius: 50%;
        color: #FF2A54;
        margin-bottom: 24px;
        box-shadow: 0 0 20px rgba(255, 42, 84, 0.2);
      }
      h1 {
        font-family: 'Inter', sans-serif;
        font-weight: 900;
        font-style: italic;
        text-transform: uppercase;
        letter-spacing: -0.04em;
        line-height: 0.9;
        font-size: 28px;
        margin: 0 0 10px 0;
        color: #FF2A54;
      }
      .subtitle {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.25em;
        color: #A3A8B8;
        margin-bottom: 30px;
      }
      p.desc {
        color: #A3A8B8;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 30px;
      }
      .footer-brand {
        margin-top: 40px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.3em;
        color: rgba(255, 255, 255, 0.2);
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div class="glow-orb top"></div>
    <div class="glow-orb bottom"></div>
    
    <div class="container">
      <div class="card">
        <div class="badge-error">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        
        <h1>${errorTitle.toUpperCase()}</h1>
        <div class="subtitle">OPÉRATION IMPOSSIBLE</div>
        
        <p class="desc">
          ${errorMessage}
        </p>
        
        <div class="footer-brand">CAPTEN SYSTEM</div>
      </div>
    </div>
  </body>
  </html>
  `;
}
