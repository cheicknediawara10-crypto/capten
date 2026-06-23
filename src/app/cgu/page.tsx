import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function CGUPage() {
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
            <FileText size={12} /> LÉGAL
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-black italic uppercase tracking-tight text-black">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-xs text-[#71717A] font-mono uppercase tracking-wider">
            Dernière mise à jour : 17 Juin 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-10 text-[15px] leading-relaxed text-[#52525B]">
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">1. Objet des CGU</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les conditions dans lesquelles la plateforme **CAPTEN** met à la disposition des fondateurs de run clubs (ci-après « Captains ») des outils d'inscription, de décharges juridiques, de pointage GPS et de gestion de cagnottes.
            </p>
            <p>
              Toute utilisation de la plateforme implique l'acceptation sans réserve des présentes conditions par l'utilisateur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">2. Services proposés</h2>
            <p>
              CAPTEN est une solution SaaS permettant de simplifier l'organisation logistique des clubs de course à pied communautaires (social run clubs) :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Portail d'inscription :</strong> Création d'une vitrine publique pour le club pour l'inscription autonome des membres.</li>
              <li><strong>Décharges de responsabilité :</strong> Signature électronique des décharges juridiques avec horodatage et enregistrement de l'adresse IP.</li>
              <li><strong>Check-in GPS (Radar) :</strong> Pointage de présence automatisé basé sur la géolocalisation à moins de 50 mètres du départ.</li>
              <li><strong>Cagnottes et contributions :</strong> Configuration de liens de paiement directs (Lydia, Revolut, PayPal, etc.) avec 0% de commission prélevée par CAPTEN.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">3. Conditions financières &amp; Abonnement</h2>
            <p>
              CAPTEN propose un essai gratuit de 14 jours, sans carte bancaire requise. À l'issue de cet essai, l'utilisation de la plateforme nécessite la souscription à notre abonnement PRO unique :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Tarif Mensuel :</strong> 49,99€ par mois, sans engagement, résiliable en 1 clic.</li>
              <li><strong>Tarif Annuel :</strong> 399€ par an, facturé annuellement (équivalant à 2 mois offerts).</li>
            </ul>
            <p>
              Le paiement est géré de manière sécurisée via notre prestataire Stripe. Toutes les taxes applicables seront ajoutées lors de la facturation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">4. Responsabilité</h2>
            <p>
              Le Captain est seul responsable du contenu publié, des parcours planifiés et de la gestion des membres de son club. CAPTEN agit exclusivement en tant que prestataire technique d'hébergement et d'automatisation.
            </p>
            <p>
              CAPTEN ne saurait être tenu pour responsable en cas d'accident survenu lors d'un run, de non-respect du code de la route par les coureurs, ou d'indisponibilité technique momentanée des services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">5. Modification des Conditions</h2>
            <p>
              CAPTEN se réserve le droit de modifier les présentes CGU à tout moment afin de les adapter aux évolutions réglementaires et techniques. Les utilisateurs seront informés de toute modification substantielle par e-mail ou via la plateforme.
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
