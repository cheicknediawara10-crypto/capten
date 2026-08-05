import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rejoindre le club — CAPTEN",
  description: "Rejoins ton run club et remplis ta fiche membre en 2 minutes.",
  openGraph: {
    title: "Rejoindre le club — CAPTEN",
    description: "Rejoins ton run club et remplis ta fiche membre en 2 minutes.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
