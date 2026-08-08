# CAPTEN - CONFIGURATION STRATÉGIQUE & PRICING (MVP)

## 🎯 Vision Business & Positionnement
CAPTEN est un SaaS B2B Premium "Self-Serve" destiné aux fondateurs de Run Clubs. 
La proposition de valeur est binaire : Éliminer 100% de la charge mentale logistique via l'automatisation WhatsApp (Twilio) et responsabiliser les coureurs (Check-in GPS natif + Liste d'attente active + Système Anti-Fantôme).

---

## 💰 Modèle Économique — Freemium + Hard Paywall

### Plan Découverte : GRATUIT (0€)
* 1 session par mois
* 20 membres maximum
* Pas de check-in GPS
* Pas d'automatisation WhatsApp
* Objectif : permettre au fondateur d'atteindre l'Aha Moment

### Plan Captain Pro : 29€ / mois
* Membres illimités
* Sessions illimitées
* Check-in GPS natif
* WhatsApp automatisé (200 msg/mois — garde-fou Twilio)
* Fiches ICE, liste d'attente, anti-fantôme
* Registre légal horodaté (export PDF/CSV)
* Capten Spots (cagnotte, partenaires, retrait IBAN)
* Support prioritaire
* **Hard Paywall déclenché au Aha Moment** (21ème membre OU tentative GPS)

### Capten Spots — Répartition des revenus :
* 85% → commerce / organisateur
* 10% → club
* 5% → CAPTEN

### Règle de Garde-Fou Technique (WhatsApp/Twilio) :
Pour protéger la marge brute face aux coûts de session Meta, le plan Pro inclut une enveloppe de **200 messages WhatsApp par mois**.
- Si un club atteint cette limite, l'envoi automatisé est suspendu pour le mois en cours.
- L'UI affiche une notification invitant le fondateur à contacter le support pour une extension manuelle.

---

## 🏗️ Impact sur la Roadmap de Développement

### ❌ SUPPRIMÉ DE LA V1 (→ V2) :
1. Passeport Capten
2. Badges et système de niveaux
3. Programme ambassadeur / parrainage
4. Portefeuilles virtuels (Wallet) et refacturation automatisée de messages
5. Tarif annuel (simplifié à mensuel en V1)

### 🟢 SPRINT REQUIS POUR LA PHASE 1 :
1. **Table `clubs` (Supabase) :** Champs `stripe_subscription_status` (Text), `plan` (enum: 'discovery'|'pro'), `whatsapp_messages_sent_this_month` (Integer).
2. **Hard Paywall Middleware :** Quand un club en plan Découverte dépasse 20 membres OU tente d'activer le GPS → redirection vers la page de conversion Captain Pro (29€/mois).
3. **Côté membre — Authentification sans token :**
   - **Flux d'accès :** Lien public `/membre` (ou depuis la landing) → formulaire `Prénom + Nom + Date de naissance + Code PIN 4 chiffres` → page membre dédiée
   - **Pourquoi pas magic link / SMS :** Rien à sauvegarder. Le membre se souvient juste de son nom, sa DDN, et son PIN. Zéro friction, zéro app.
   - **Sécurité :** Niveau moyen — le PIN est le secret réel (DDN + nom sont semi-publics). Acceptable pour le contexte Run Club (risque d'usurpation quasi-nul).
   - **Onboarding PIN :** Créé une seule fois lors de l'inscription membre (envoyé par le fondateur via WhatsApp ou QR). Ensuite mémorisé par le membre.
   - **Page membre :** Statut, historique de présence, prochains runs, décharges signées, fiche ICE. Check-in GPS ou QR depuis cette même page.
   - **Table Supabase `members` :** Champs `first_name`, `last_name`, `date_of_birth` (Date), `pin_hash` (Text — bcrypt), `club_id` (FK).
