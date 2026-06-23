import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Envoyer le message via Whapi.cloud API
async function sendWhapiWhatsAppMessage(recipient: string, content: string): Promise<boolean> {
  const token = process.env.WHAPI_TOKEN || '';

  // If token is missing or generic, log and fallback to simulated success
  if (!token || token === '' || token.includes('votre_token_whapi_ici')) {
    console.warn(`[Whapi API Simulation] Message à ${recipient} simulé (Token non configuré) : "${content.slice(0, 45)}..."`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }

  // Normalize phone number (digits only, handle leading zero / plus signs)
  let cleanPhone = recipient.trim();
  cleanPhone = cleanPhone.replace(/^\+|00/, '');
  cleanPhone = cleanPhone.replace(/[\s\-\(\)]/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = '33' + cleanPhone.slice(1);
  }

  try {
    const res = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: cleanPhone,
        body: content,
      }),
    });

    if (res.ok) {
      console.log(`[Whapi API] Message envoyé avec succès à ${cleanPhone}`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[Whapi API] Échec d'envoi à ${cleanPhone} (${res.status}) : ${errText}`);
      return false;
    }
  } catch (err) {
    console.error(`[Whapi API] Exception d'envoi à ${cleanPhone} :`, err);
    return false;
  }
}

export async function POST(request: Request) {
  return handleProcess();
}

export async function GET(request: Request) {
  return handleProcess();
}

async function handleProcess() {
  const supabase = getSupabase();
  const processedItems: any[] = [];

  try {
    if (supabase) {
      const nowStr = new Date().toISOString();

      // 1. Récupérer les messages planifiés prêts à être envoyés
      const { data: queueItems, error: fetchError } = await supabase
        .from('broadcast_queue')
        .select('*')
        .eq('status', 'hold')
        .lte('send_at', nowStr);

      if (fetchError) throw fetchError;

      if (!queueItems || queueItems.length === 0) {
        return NextResponse.json({
          success: true,
          message: "Aucun message en attente à traiter pour le moment.",
          processed: 0
        });
      }

      const idsToProcess = queueItems.map((item) => item.id);

      // 2. Passer le statut à 'processing' pour verrouiller les messages et éviter les doublons
      const { error: updateError } = await supabase
        .from('broadcast_queue')
        .update({ status: 'processing' })
        .in('id', idsToProcess);

      if (updateError) throw updateError;

      // 3. Envoyer par paquets (batching) pour respecter les limitations de l'API Meta et éviter les timeouts
      const batchSize = 10;
      for (let i = 0; i < queueItems.length; i += batchSize) {
        const batch = queueItems.slice(i, i + batchSize);
        
        // Exécuter l'envoi en parallèle au sein du batch
        await Promise.all(
          batch.map(async (item) => {
            try {
              const ok = await sendWhapiWhatsAppMessage(item.recipient_id, item.message_content);
              if (ok) {
                // Mettre à jour le statut du message à 'sent'
                await supabase
                  .from('broadcast_queue')
                  .update({ status: 'sent' })
                  .eq('id', item.id);
                
                processedItems.push({ id: item.id, recipient: item.recipient_name, status: 'sent' });
              }
            } catch (err) {
              console.error(`Erreur d'envoi du message ${item.id}:`, err);
              // Optionnel : repasser en pending/hold pour un retry ultérieur
            }
          })
        );
      }

      return NextResponse.json({
        success: true,
        message: `${processedItems.length} messages traités et envoyés par paquets avec succès.`,
        processed: processedItems.length,
        items: processedItems
      });

    } else {
      // Mode fallback hors-ligne ou simulation locale
      console.log("Exécution du traitement de la file en mode fallback local.");
      return NextResponse.json({
        success: true,
        message: "Simulation locale exécutée. Supabase non configuré.",
        processed: 0
      });
    }
  } catch (error: any) {
    console.error("Error processing broadcast queue:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur lors du traitement de la file d'attente." },
      { status: 500 }
    );
  }
}
