"use client";

import { useState, useEffect, useCallback } from "react";

// La clé publique VAPID doit être passée à subscribe() sous forme de Uint8Array,
// sinon le service de push refuse tout envoi (mismatch VAPID).
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = useCallback(
    async (clubId?: string) => {
      if (!isSupported) return { error: "unsupported" };
      setLoading(true);

      try {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== "granted") {
          setLoading(false);
          return { error: "permission_denied" };
        }

        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        if (!VAPID_PUBLIC_KEY) {
          setLoading(false);
          return { error: "vapid_missing" };
        }

        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
          });
        }

        const json = sub.toJSON();
        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: json.keys,
            clubId,
          }),
        });

        if (!res.ok) throw new Error("Erreur enregistrement abonnement");

        setIsSubscribed(true);
        setLoading(false);
        return { success: true };
      } catch (err: any) {
        console.error("Erreur Push Subscribe:", err);
        setLoading(false);
        return { error: err.message || "error" };
      }
    },
    [isSupported]
  );

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error("Erreur Push Unsubscribe:", err);
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
  };
}
