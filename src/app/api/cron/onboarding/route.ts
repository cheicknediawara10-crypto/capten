import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleOnboardingCron(request);
}

export async function GET(request: Request) {
  return handleOnboardingCron(request);
}

async function handleOnboardingCron(request: Request) {
  try {
    // 1. Sécurité : Vérification du token Secret Cron
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();

    if (!supabase) {
      console.log('[Onboarding Cron] Supabase client not defined. Running mock cron.');
      return NextResponse.json({
        success: true,
        demoMode: true,
        message: "[MODE DÉMO] Les tâches cron d'onboarding ont été simulées avec succès."
      });
    }

    // Récupérer tous les clubs avec leurs infos d'inscription et de plan
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('*');

    if (clubsError) {
      console.error('Error fetching clubs for onboarding cron:', clubsError);
      return NextResponse.json({ error: clubsError.message }, { status: 500 });
    }

    const processedLogs: string[] = [];

    for (const club of clubs) {
      const createdAt = new Date(club.created_at || club.created_time || now);
      const diffMs = now.getTime() - createdAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // On cible les créations de compte dans des intervalles de 24h
      const isH48 = diffDays >= 1.8 && diffDays <= 2.2;
      const isJ7 = diffDays >= 6.8 && diffDays <= 7.2;
      const isJ14 = diffDays >= 13.8 && diffDays <= 14.2;
      const isJ18 = diffDays >= 17.8 && diffDays <= 18.2;
      const isJ21 = diffDays >= 20.8 && diffDays <= 21.2;

      // 1. Relance H+48 (Essai actif ET aucun run planifié)
      if (isH48 && club.plan === 'trial' && !club.first_run_created_at) {
        // Envoi email relance via Resend
        try {
          // On essaie de récupérer l'e-mail du capitaine via la table profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', club.id)
            .maybeSingle();

          const recipient = profile?.email;
          if (recipient) {
            await resend.emails.send({
              from: 'Capten Onboarding <onboarding@capten.app>',
              to: recipient,
              subject: '⚡ Planifie ton premier run sur Capten !',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #FDFCF8;">
                  <h2 style="color: #FF5C00; text-transform: uppercase;">Prêt pour le premier run ?</h2>
                  <p>Salut ${profile.full_name || 'Capitaine'},</p>
                  <p>Tu as lancé ton essai de 21 jours sur Capten il y a 48h, mais tu n'as pas encore créé de run.</p>
                  <p>Planifier une session ne prend que 30 secondes et te permettra de tester les relances automatiques et les fiches de sécurité.</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app'}/runs/planifier" style="display: inline-block; padding: 12px 24px; background-color: #FF5C00; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Planifier un run maintenant</a>
                </div>
              `
            });
            processedLogs.push(`Email H+48 envoyé à ${recipient}`);
          }
        } catch (emailErr) {
          console.error('Failed to send H+48 email:', emailErr);
        }
      }

      // 2. Bilan J+7 (Essai actif)
      if (isJ7 && club.plan === 'trial') {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', club.id)
            .maybeSingle();

          const recipient = profile?.email;
          if (recipient) {
            await resend.emails.send({
              from: 'Capten Onboarding <onboarding@capten.app>',
              to: recipient,
              subject: '🏃‍♂️ Déjà une semaine d\'essai Capten !',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #FDFCF8;">
                  <h2 style="color: #FF5C00; text-transform: uppercase;">1 semaine de capitanat premium</h2>
                  <p>Salut ${profile.full_name || 'Capitaine'},</p>
                  <p>Voilà déjà 7 jours que tu pilotes ton crew avec Capten. Comment se passent tes premiers runs ?</p>
                  <p>N'oublie pas de regarder les analyses automatiques de notre Copilote IA sur ton tableau de bord !</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app'}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Accéder à mon tableau de bord</a>
                </div>
              `
            });
            processedLogs.push(`Email J+7 envoyé à ${recipient}`);
          }
        } catch (emailErr) {
          console.error('Failed to send J+7 email:', emailErr);
        }
      }

      // 3. Bilan J+14 (Essai actif)
      if (isJ14 && club.plan === 'trial') {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', club.id)
            .maybeSingle();

          const recipient = profile?.email;
          if (recipient) {
            await resend.emails.send({
              from: 'Capten Onboarding <onboarding@capten.app>',
              to: recipient,
              subject: '🔥 Déjà 14 jours d\'essai ! Faisons le point',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #FDFCF8;">
                  <h2 style="color: #FF5C00; text-transform: uppercase;">Faisons le point à J+14</h2>
                  <p>Salut ${profile.full_name || 'Capitaine'},</p>
                  <p>Ton essai gratuit de 21 jours se termine dans une semaine.</p>
                  <p>Ton crew grandit, et nous espérons que les fonctionnalités avancées de Capten te facilitent la vie !</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app'}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Piloter mon club</a>
                </div>
              `
            });
            processedLogs.push(`Email J+14 envoyé à ${recipient}`);
          }
        } catch (emailErr) {
          console.error('Failed to send J+14 email:', emailErr);
        }
      }

      // 4. Rappel Prélèvement J+18 (Essai actif)
      if (isJ18 && club.plan === 'trial') {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', club.id)
            .maybeSingle();

          const recipient = profile?.email;
          if (recipient) {
            await resend.emails.send({
              from: 'Capten Billing <billing@capten.app>',
              to: recipient,
              subject: '⚠️ Rappel : Fin de votre essai Capten dans 3 jours',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #FDFCF8;">
                  <h2 style="color: #FF5C00; text-transform: uppercase;">Fin de ton essai gratuit</h2>
                  <p>Salut ${profile.full_name || 'Capitaine'},</p>
                  <p>Ton essai de 21 jours prendra fin dans 3 jours.</p>
                  <p>Si tu souhaites continuer, aucune action n'est requise. Ton abonnement se poursuivra automatiquement au tarif de 49,99 €/mois.</p>
                  <p>Si tu souhaites résilier et revenir au plan gratuit sans aucun frais, tu peux le faire en 1 clic dans tes réglages.</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app'}/settings" style="display: inline-block; padding: 12px 24px; background-color: #FF5C00; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Gérer mon abonnement</a>
                </div>
              `
            });
            processedLogs.push(`Email J+18 de rappel envoyé à ${recipient}`);
          }
        } catch (emailErr) {
          console.error('Failed to send J+18 email:', emailErr);
        }
      }

      // 5. Bascule Trial à Paid J+21 (Optionnel, utile pour simulations locales si Stripe absent)
      if (isJ21 && club.plan === 'trial') {
        if (!club.stripe_subscription_id) {
          // Si aucune souscription Stripe réelle n'est présente (mode simulation), on bascule silencieusement sur 'paid'
          const { error: upgradeErr } = await supabase
            .from('clubs')
            .update({ 
              plan: 'paid',
              stripe_plan: 'CAPTEN',
              stripe_subscription_status: 'active'
            })
            .eq('id', club.id);

          if (upgradeErr) {
            console.error('Failed mock subscription J+21 transition:', upgradeErr);
          } else {
            processedLogs.push(`Bascule J+21 simulée : Club ${club.id} converti en payant`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedLogs.length,
      logs: processedLogs
    });

  } catch (error: any) {
    console.error('Error in onboarding cron route:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
