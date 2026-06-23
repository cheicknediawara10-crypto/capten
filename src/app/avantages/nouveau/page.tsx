"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NouveauAvantagePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/avantages?openNouveau=true");
  }, [router]);

  return null;
}
