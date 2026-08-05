import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Membre — CAPTEN",
  description: "Carte digitale du membre — badges, ICE, agenda des sorties.",
  openGraph: {
    title: "Profil Membre — CAPTEN",
    description: "Carte digitale du membre — badges, ICE, agenda des sorties.",
    type: "profile",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
