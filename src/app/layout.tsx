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
  title: "Capten — La plateforme des communautés sportives locales",
  description: "Capten — Run clubs, walk clubs, groupes de trail. Gérez votre crew, protégez vos membres et générez des revenus.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Capten — La plateforme des communautés sportives locales",
    description: "Capten — Run clubs, walk clubs, groupes de trail. Gérez votre crew, protégez vos membres et générez des revenus.",
    images: [
      {
        url: "/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "Capten — La plateforme des communautés sportives locales",
      }
    ]
  }
};

import { AuthContextProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Applique le thème avant le paint pour éviter le flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!localStorage.getItem('capten_theme_migrated_dark')){localStorage.removeItem('capten_theme');localStorage.setItem('capten_theme_migrated_dark','1');}var t=localStorage.getItem('capten_theme');if(t!=='light')document.documentElement.setAttribute('data-theme','dark');}catch(e){}`,
          }}
        />
      </head>
      <body className={`${barlow.variable} ${montserrat.variable} ${dmMono.variable} font-sans bg-[var(--app-bg)]`}>
        <LanguageProvider>
          <AuthContextProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </AuthContextProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
