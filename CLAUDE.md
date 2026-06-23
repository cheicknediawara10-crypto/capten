# CAPTEN - CONFIGURATION STRATÉGIQUE & PRICING (MVP)

## 🎯 Vision Business & Positionnement
CAPTEN est un SaaS B2B Premium "Self-Serve" destiné aux fondateurs de Run Clubs. 
La proposition de valeur est binaire : Éliminer 100% de la charge mentale logistique via l'automatisation WhatsApp (Twilio) et responsabiliser les coureurs (Check-in GPS natif + Liste d'attente active + Système Anti-Fantôme).

---

## 💰 Modèle Économique Unique (Zéro Friction)
Le MVP rejette le modèle Freemium et la fragmentation en 3 tiers. Il s'aligne sur un modèle de conversion directe à choix unique.

### Le Plan unique : CAPTEN PRO
* **Tarif Mensuel :** 49,99 € / mois (Sans engagement)
* **Tarif Annuel :** 399,00 € / an (Soit ~2 mois offerts, paiement unique)
* **Acquisition :** Free Trial (Essai gratuit) de 14 jours complets, sans restriction de fonctionnalités.
* **Limites :** Aucune limite artificielle sur le nombre de membres ou sur les runs créés. 

### Règle de Garde-Fou Technique (WhatsApp/Twilio) :
Pour protéger les 80% de marge brute du SaaS face aux coûts de session Meta, le plan inclut une enveloppe de **200 messages WhatsApp par mois**. 
- Si un club atteint cette limite, l'envoi automatisé est suspendu pour le mois en cours.
- L'UI affiche une notification invitant le fondateur à contacter le support pour une extension manuelle. (Pas de développement de wallet ou de refacturation automatisée en Phase 1).

---

## 🏗️ Impact sur la Roadmap de Développement

### ❌ SUPPRIMÉ DE LA PHASE 1 (Dette technique éliminée) :
1. Code du Paywall célébratoire au 21ème membre (Supprimé).
2. Système de recharges financières par carte, portefeuilles virtuels (Wallet) et calculs de centimes (Supprimé).
3. Logique de blocage RLS basée sur le nombre de membres inscrits (Supprimé).

### 🟢 SPRINT REQUIS POUR LA PHASE 1 (Gestion du Trial) :
1. **Table `clubs` (Supabase) :** Intégration des champs `trial_ends_at` (Timestamp), `stripe_subscription_status` (Text) et `whatsapp_messages_sent_this_month` (Integer).
2. **Middleware / Verrou de session :** Si `NOW() > trial_ends_at` ET que le statut Stripe n'est pas `active`, l'accès au cockpit du fondateur est redirigé vers la page de paiement unique [Mensuel / Annuel].
