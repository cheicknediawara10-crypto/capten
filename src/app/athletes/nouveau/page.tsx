"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NouveauAthletePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/athletes?openNouveau=true");
  }, [router]);

  return null;
}
