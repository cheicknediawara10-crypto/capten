"use client";

import React, { useState } from "react";
import { Bell, BellRing, CheckCircle2, Loader2, X } from "lucide-react";
import { usePushNotifications } from "@/lib/push/use-push";

export default function PushNotificationPrompt({ clubId }: { clubId?: string }) {
  const { isSupported, isSubscribed, permission, loading, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (!isSupported || dismissed) return null;

  if (isSubscribed) {
    return (
      <div className="rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </span>
          <div>
            <p className="text-[12px] font-bold text-[color:var(--app-text)]">Notifications du crew activées</p>
            <p className="text-[11px] text-[color:var(--app-text-muted)]">Tu recevras les rappels de run et les récaps sur ton écran.</p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return null;
  }

  return (
    <div className="rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center shrink-0 mt-0.5">
          <BellRing size={18} className="animate-bounce" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-[color:var(--app-text)]">Ne rate aucun run du crew ⚡</p>
          <p className="text-[11.5px] text-[color:var(--app-text-muted)] mt-0.5 leading-snug">
            Reçois les rappels J-1 et les récaps directement sur ton écran de téléphone.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[color:var(--app-text-muted)] hover:bg-[var(--app-hover)] transition-colors"
          title="Plus tard"
        >
          <X size={15} />
        </button>
        <button
          onClick={() => subscribe(clubId)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#FF5500] text-white text-[12px] font-black uppercase tracking-wider hover:bg-[#E04B00] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Activation…
            </>
          ) : (
            <>
              <Bell size={13} /> Activer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
