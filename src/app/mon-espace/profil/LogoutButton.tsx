"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { logoutMembre } from "../actions";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutMembre();
      router.push("/mon-espace");
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs font-medium cursor-pointer"
    >
      {isPending
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <LogOut className="w-3.5 h-3.5" />
      }
      Déconnexion
    </button>
  );
}
