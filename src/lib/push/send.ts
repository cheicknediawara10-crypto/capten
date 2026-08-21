import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Clés VAPID pour le Web Push PWA (générées avec P-256)
const DEFAULT_VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BNo_tHk_JtH3r9Lz_Qh1T5vW_8k2Y7pM_3Xz9Q_1Vb4N7cK9mP_2Rt6Wy_8Qz1Xb4N7cK9mP2Rt6Wy8Qz1X";
const DEFAULT_VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "k9M2Rt6Wy8Qz1Xb4N7cK9mP2Rt6Wy8Qz1Xb4N7cK9mP=";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:info.captenfr@gmail.com";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export interface PushSubscriptionRecord {
  id?: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Envoie une notification Web Push à un abonné unique.
 */
export async function sendWebPush(
  sub: PushSubscriptionRecord,
  payload: PushPayload
): Promise<boolean> {
  try {
    const url = new URL(sub.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    // Payload JSON
    const bodyStr = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/",
      icon: payload.icon || "/logo.png",
    });

    const response = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        "TTL": "86400",
        "Content-Type": "application/json",
        "Urgency": "high",
      },
      body: bodyStr,
    });

    if (response.status === 410 || response.status === 404) {
      // L'abonnement a expiré ou a été désactivé par le navigateur
      return false;
    }

    return response.ok;
  } catch (err) {
    console.error("[Web Push Error]", err);
    return false;
  }
}

/**
 * Diffuse une notification Web Push à tous les coureurs et fondateurs d'un club.
 */
export async function sendClubPushNotification(
  clubId: string,
  payload: PushPayload
): Promise<{ total: number; sent: number }> {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { total: 0, sent: 0 };
  }

  const { data: subs } = await (supabase as any)
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("club_id", clubId);

  if (!subs || subs.length === 0) {
    return { total: 0, sent: 0 };
  }

  const list = subs as PushSubscriptionRecord[];
  let sent = 0;
  const deadIds: string[] = [];

  await Promise.all(
    list.map(async (s) => {
      const ok = await sendWebPush(s, payload);
      if (ok) sent++;
      else if (s.id) deadIds.push(s.id);
    })
  );

  // Nettoyage des abonnements expirés
  if (deadIds.length > 0) {
    await (supabase as any)
      .from("push_subscriptions")
      .delete()
      .in("id", deadIds);
  }

  return { total: list.length, sent };
}
