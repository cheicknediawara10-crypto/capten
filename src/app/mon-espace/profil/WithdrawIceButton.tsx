"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { withdrawIceConsent } from "../actions";

/**
 * Retrait du consentement données de santé (RGPD art. 7§3) : supprime la fiche
 * ICE du coureur. Confirmation avant action (suppression irréversible).
 */
export default function WithdrawIceButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleWithdraw() {
    if (!confirm("Retirer ton consentement supprimera définitivement ta fiche d'urgence (contact + données de santé). Continuer ?")) {
      return;
    }
    startTransition(async () => {
      const res = await withdrawIceConsent();
      if ("error" in res) { alert(res.error); return; }
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleWithdraw}
      disabled={isPending}
      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#B91C1C] hover:text-[#7F1D1D] transition-colors cursor-pointer disabled:opacity-50"
    >
      {isPending
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Trash2 className="w-3.5 h-3.5" />
      }
      Retirer mon consentement & supprimer ma fiche ICE
    </button>
  );
}
