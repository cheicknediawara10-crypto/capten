import React from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white text-[#09090B] font-sans selection:bg-[#FF5C00]/20 selection:text-black">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#52525B] hover:text-[#FF5C00] transition-colors">
            <ArrowLeft size={16} />
            <span>Retour</span>
          </Link>
          <img src="/logo.png" style={{ height: 40 }} alt="Capten" />
          <div className="w-16"></div> {/* spacer */}
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#FAFAFA] border-b border-black/5 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-[#FF5C00]/10 border border-[#FF5C00]/20 text-[#FF5C00] px-3.5 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold">
            <Info size={12} /> ÉDITEUR & HÉBERGEUR
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-black italic uppercase tracking-tight text-black">
            Mentions Légales
          </h1>
          <p className="text-xs text-[#71717A] font-mono uppercase tracking-wider">
            Conforme à l'article 6 de la loi n° 2004-575 du 21 Juin 2004
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-10 text-[15px] leading-relaxed text-[#52525B]">
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">1. Éditeur de la plateforme</h2>
            <p>
              Le site et l'application **CAPTEN** sont édités par la société **CAPTEN SAS**, société par actions simplifiée au capital social de 1 000 €, immatriculée au Registre du Commerce et des Sociétés (RCS) de Paris sous le numéro **999 888 777 RCS Paris**.
            </p>
            <p>
              <strong>Siège social :</strong> 10 Rue de la Paix, 75002 Paris, France.<br />
              <strong>Directeur de la publication :</strong> Alexandre Dupont, Président de CAPTEN SAS.<br />
              <strong>Contact e-mail :</strong> contact@capten.app
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">2. Hébergeur du site web</h2>
            <p>
              Le site vitrine et l'application Next.js sont hébergés par :
            </p>
            <p>
              <strong>Vercel Inc.</strong><br />
              650 2nd St, San Francisco, CA 94107, États-Unis.<br />
              Site internet : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#FF5C00] hover:underline">https://vercel.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">3. Fournisseur de base de données</h2>
            <p>
              La base de données PostgreSQL et les données d'authentification sont stockées sur les serveurs de :
            </p>
            <p>
              <strong>Supabase Inc.</strong><br />
              970 Summer St, Stamford, CT 06905, États-Unis.<br />
              Hébergement physique des serveurs : Europe (Francfort, Allemagne).<br />
              Site internet : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#FF5C00] hover:underline">https://supabase.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">4. Propriété intellectuelle</h2>
            <p>
              L'intégralité des éléments constitutifs de la plateforme CAPTEN (notamment l'interface, les logos, les illustrations graphiques, les icônes, les codes sources, les textes et les bases de données) est protégée par le droit d'auteur et appartient de manière exclusive à la société CAPTEN SAS.
            </p>
            <p>
              Toute reproduction, distribution ou représentation totale ou partielle du contenu de ce site, sans autorisation expresse écrite de l'éditeur, est interdite et constituerait une contrefaçon sanctionnée par les articles L. 335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-[#FAFAFA] py-8 px-6 text-center text-xs text-[#71717A] font-mono">
        <p>© {new Date().getFullYear()} CAPTEN. FAIT EN FRANCE 🇫🇷. TOUS DROITS RÉSERVÉS.</p>
      </footer>
    </div>
  );
}
