import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check-in — CAPTEN",
  description: "Valide ta présence à la sortie.",
  themeColor: "#1D1D1D",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
