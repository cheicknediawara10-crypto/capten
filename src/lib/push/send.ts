import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

// Web Push (RFC 8030/8291/8292) — l'authentification VAPID (JWT ES256) et le
// chiffrement du payload (aes128gcm) sont gérés par la lib `web-push`.
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:info.captenfr@gmail.com";

let vapidReady: boolean | null = null;
function ensureVapid(): boolean {
  if (vapidReady !== null) return vapidReady;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.error("[Web Push] Clés VAPID absentes → notifications désactivées.");
    vapidReady = false;
    return false;
  }
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
    vapidReady = true;
  } catch (e) {
    console.error("[Web Push] Clés VAPID invalides:", e);
    vapidReady = false;
  }
  return vapidReady;
}

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

type SendResult = "ok" | "expired" | "error";

/** Envoie une notification Web Push à un abonné. */
export async function sendWebPush(sub: PushSubscriptionRecord, payload: PushPayload): Promise<SendResult> {
  if (!ensureVapid()) return "error";
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || "/",
        icon: payload.icon || "/logo.png",
      }),
      { TTL: 86400, urgency: "high" }
    );
    return "ok";
  } catch (err: any) {
    const code = err?.statusCode;
    if (code === 404 || code === 410) return "expired"; // abonnement mort → à purger
    console.error("[Web Push Error]", code, err?.body || err?.message);
    return "error";
  }
}

/** Diffuse une notification à tous les abonnés (coureurs + fondateur) d'un crew. */
export async function sendClubPushNotification(
  clubId: string,
  payload: PushPayload
): Promise<{ total: number; sent: number }> {
  if (!ensureVapid()) return { total: 0, sent: 0 };

  let supabase: ReturnType<typeof createAdminClient>;
  try { supabase = createAdminClient(); } catch { return { total: 0, sent: 0 }; }

  const { data: subs } = await (supabase as any)
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("club_id", clubId);

  const list = (subs as PushSubscriptionRecord[]) || [];
  if (list.length === 0) return { total: 0, sent: 0 };

  let sent = 0;
  const deadIds: string[] = [];

  await Promise.all(
    list.map(async (s) => {
      const r = await sendWebPush(s, payload);
      if (r === "ok") sent++;
      else if (r === "expired" && s.id) deadIds.push(s.id); // on ne purge QUE les expirés (pas les erreurs transitoires)
    })
  );

  if (deadIds.length > 0) {
    await (supabase as any).from("push_subscriptions").delete().in("id", deadIds);
  }

  return { total: list.length, sent };
}
