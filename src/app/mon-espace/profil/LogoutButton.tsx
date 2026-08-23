"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { logoutMembre } from "../actions";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/layout/LanguageToggle";

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutMembre();
      router.push("/mon-espace");
    });
  }

  return (
    <div className="flex items-center gap-3">
      <LanguageToggle variant="compact" />
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs font-medium cursor-pointer"
      >
        {isPending
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <LogOut className="w-3.5 h-3.5" />
        }
        {t("nav.logout", "Déconnexion")}
      </button>
    </div>
  );
}
