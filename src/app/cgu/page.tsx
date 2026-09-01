import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-white text-[#09090B] font-sans selection:bg-[#FF5500]/20 selection:text-black">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#52525B] hover:text-[#FF5500] transition-colors">
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
          <span className="inline-flex items-center gap-2 bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] px-3.5 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold">
            <FileText size={12} /> LÉGAL
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-black italic uppercase tracking-tight text-black">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-xs text-[#71717A] font-mono uppercase tracking-wider">
            Dernière mise à jour : 31 Août 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-10 text-[15px] leading-relaxed text-[#52525B]">
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">1. Objet des CGU</h2>
            <p>
              La plateforme CAPTEN est éditée par Cheickne DIAWARA, entrepreneur individuel (EI), immatriculé au RNE sous le numéro SIREN 888&nbsp;490&nbsp;547, dont le siège est situé 1 rue d'Oradour sur Glane, 93420 Villepinte, France (ci-après « CAPTEN » ou « l'Éditeur »).
            </p>
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les conditions dans lesquelles la plateforme CAPTEN met à la disposition des fondateurs de run clubs (ci-après « Captains ») des outils d'inscription, de décharges juridiques, de pointage GPS et de gestion de cagnottes.
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
              <li><strong>Tarif Mensuel :</strong> 29,99€ par mois, sans engagement, résiliable en 1 clic.</li>
            </ul>
            <p>
              Le paiement est géré de manière sécurisée via notre prestataire Stripe. Toutes les taxes applicables seront ajoutées lors de la facturation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">4. Protection des Données &amp; Accord de Sous-traitance (DPA — Art. 28 RGPD)</h2>
            <p>
              Dans le cadre de l&apos;utilisation des services, l&apos;Organisateur (Captain) agit en qualité de <strong>Responsable du Traitement</strong> des données personnelles de ses membres, et CAPTEN agit en qualité de <strong>Sous-traitant technique</strong> au sens de l&apos;article 28 du Règlement Général sur la Protection des Données (RGPD).
            </p>
            <div className="bg-[#FAFAFA] border border-black/10 rounded-2xl p-5 space-y-3 text-sm">
              <h3 className="font-bold text-black uppercase tracking-wider text-xs">Engagements de CAPTEN en qualité de sous-traitant :</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-[#52525B]">
                <li><strong>Instructions :</strong> Ne traiter les données des membres que pour les besoins stricts de l&apos;exécution des fonctionnalités demandées par le Captain.</li>
                <li><strong>Confidentialité &amp; Sécurité :</strong> Garantir la stricte confidentialité des données et mettre en œuvre les mesures techniques adaptées (chiffrement, clés d&apos;accès isolées, Row Level Security).</li>
                <li><strong>Sous-traitants ultérieurs :</strong> Recourir exclusivement à des prestataires de confiance (Supabase pour l&apos;hébergement de base de données en UE, Resend pour les notifications email, Vercel pour l&apos;infrastructure web, Stripe pour la facturation, et Google — Gemini — pour l&apos;assistant de rédaction du Copilote, limité à des données agrégées et non personnelles, à l&apos;exclusion de toute donnée identifiant un membre).</li>
                <li><strong>Notification des failles :</strong> Alerter le Captain sans délai et au plus tard dans les 72 heures en cas de violation de données constatée.</li>
                <li><strong>Droit à l&apos;oubli &amp; Fin de contrat :</strong> Supprimer l&apos;intégralité des données du crew et de ses membres en cas de résiliation ou sur simple demande.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">5. Responsabilité, Sécurité &amp; Assurance</h2>
            <p>
              Le Captain est seul responsable de l&apos;organisation effective de ses sorties, des parcours choisis, de l&apos;encadrement sur le terrain et du respect des règles de circulation. CAPTEN agit exclusivement en tant qu&apos;outil technologique de gestion logistique et de registre.
            </p>
            <p className="font-semibold text-black bg-[#FF5500]/5 border border-[#FF5500]/10 p-4 rounded-xl text-sm">
              ⚠️ <strong>Rappel d&apos;Assurance :</strong> La signature dématérialisée d&apos;une décharge de responsabilité atteste de l&apos;aptitude physique du membre et formalise son acceptation des risques inhérents à l&apos;activité, mais ne se substitue en aucun cas à une assurance Responsabilité Civile (RC) organisateur. CAPTEN est un outil d&apos;organisation et de traçabilité, non un organisme assureur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">6. Modification des Conditions</h2>
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
