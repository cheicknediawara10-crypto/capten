import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function RGPDPage() {
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
            <Shield size={12} /> PROTECTION DES DONNÉES
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-black italic uppercase tracking-tight text-black">
            Politique de Confidentialité (RGPD)
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
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">1. Nature des données collectées</h2>
            <p>
              Dans le cadre de l'utilisation de **CAPTEN**, nous collectons les types d'informations suivantes pour assurer la sécurité des sorties de course à pied :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Données du profil :</strong> Prénom, nom, adresse e-mail et numéro de téléphone portable.</li>
              <li><strong>Fiches de sécurité ICE (In Case of Emergency) :</strong> Groupe sanguin, allergies majeures, antécédents médicaux pertinents et coordonnées du contact d'urgence à prévenir en cas d'accident.</li>
              <li><strong>Signatures des décharges :</strong> Horodatage de la signature et adresse IP du signataire pour preuve légale.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">2. Confidentialité des fiches de sécurité</h2>
            <p className="font-semibold text-black bg-[#FF5C00]/5 border border-[#FF5C00]/10 p-4 rounded-lg">
              ⚠️ Les données médicales et de contact d'urgence (Fiches ICE) sont strictement confidentielles. Elles ne sont accessibles qu'aux fondateurs du club (Captains) en 2 clics sur le terrain en cas d'accident. Elles sont totalement invisibles pour les autres membres du club et les tiers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">3. Géolocalisation (Pointage GPS)</h2>
            <p>
              Le check-in GPS utilise la géolocalisation de votre smartphone uniquement pour valider votre présence à moins de 50 mètres du départ :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Le navigateur calcule la distance entre vos coordonnées et le point de départ en local.</li>
              <li><strong>Aucun historique de vos déplacements n'est enregistré.</strong> Nous ne suivons pas votre parcours pendant le run. Seul le statut de validation « Présent » est enregistré en base de données pour l'appel.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">4. Destinataires et conservation des données</h2>
            <p>
              Vos données ne sont ni vendues, ni louées, ni partagées avec des tiers à des fins publicitaires. Elles sont hébergées de manière sécurisée en Europe sur les serveurs de notre prestataire technique Supabase.
            </p>
            <p>
              Les données de profil sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et de toutes les données associées directement depuis votre profil ou en contactant le support.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black border-b border-black/5 pb-2">5. Vos droits (RGPD)</h2>
            <p>
              Conformément à la réglementation européenne sur la protection des données (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Droit d'accès et de rectification de vos données personnelles.</li>
              <li>Droit à l'effacement (« droit à l'oubli ») et à la limitation du traitement.</li>
              <li>Droit de retirer votre consentement pour la collecte de vos fiches de sécurité à tout moment.</li>
            </ul>
            <p>
              Pour exercer vos droits, vous pouvez contacter le délégué à la protection des données à l'adresse e-mail : **privacy@capten.app**.
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
