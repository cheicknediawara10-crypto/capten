"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlanifierRunPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/runs?openPlanifier=true");
  }, [router]);

  return null;
}
