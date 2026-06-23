import type { Metadata } from "next";
import { Anton, Montserrat, DM_Mono } from "next/font/google";
import "./globals.css";

const barlow = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-barlow",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans", // keeping the CSS variable name identical to avoid changing it in 50 places
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Capten — Gestion de social run clubs",
  description: "Capten — L'outil de gestion pour fondateurs de social run clubs. Portail d'inscription, décharges RGPD, check-in GPS simultané. Essai gratuit 14 jours.",
  openGraph: {
    title: "Capten — Gestion de social run clubs",
    description: "Capten — L'outil de gestion pour fondateurs de social run clubs. Portail d'inscription, décharges RGPD, check-in GPS simultané. Essai gratuit 14 jours.",
    images: [
      {
        url: "/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "Capten — Gestion de social run clubs",
      }
    ]
  }
};

import { BroadcastProvider } from "@/context/BroadcastContext";
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${barlow.variable} ${montserrat.variable} ${dmMono.variable} font-sans bg-[#F4F5F7]`}>
        <BroadcastProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </BroadcastProvider>
      </body>
    </html>
  );
}
