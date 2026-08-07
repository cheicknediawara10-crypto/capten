# CAPTEN — Instructions Claude Code (V1 Stricte)

> **Ce document est le point d'entrée unique pour Claude Code.**
> Il orchestre la construction de la V1 stricte du SaaS CAPTEN.
> Chaque fonctionnalité listée ici sert directement le premier euro de revenu.

---

## 🎯 MISSION

Tu es un **Principal Full-Stack Engineer et Product Designer**. Ta mission est de construire la **V1 stricte** du SaaS CAPTEN — landing page, authentification, dashboard organisateur avec Copilote IA, carte membre digitale, CAPTEN Spots et système de facturation.

Tu as **toute la liberté** pour améliorer et optimiser la landing page et les interfaces si tu identifies des opportunités de rendre le produit encore plus fluide, moderne et esthétique.

---

## CE QUI EST DANS LA V1 (Construire)

### Côté Organisateur (B2B SaaS)
- Tableau de bord avec métriques et **Copilote IA**
- Création et gestion des runs (lien inscription, QR event)
- Suivi live des présences (Supabase Realtime)
- Gestion des membres et fiches ICE
- Check-in QR et GPS (geofencing 200m)
- Registre horodaté légal (export PDF/CSV)
- CAPTEN Spots (commerces partenaires, cagnotte, compteur, retrait IBAN)

### Côté Membre (B2C)
- 100% Web, zéro app
- Accès à sa page membre depuis un lien sur la landing page ou un lien direct (/mon-espace)
- Identification par **Nom + Date de naissance + Code PIN 4 chiffres**
- Le PIN est choisi par le membre lors de sa première inscription à un club (/join/[slug])
- Le PIN est stocké en base sous forme de hash (jamais en clair)
- Page membre dédiée (statut, historique, prochains runs, décharges, fiche ICE modifiable)
- Check-in GPS ou QR
- Fiche ICE et décharge numérique horodatée

### Facturation
- Plan **Découverte** (0 euros) : 1 session/mois, 20 membres max, sans GPS
- Plan **Captain Pro** (29 euros/mois) : tout illimité, Hard Paywall au Aha Moment
- CAPTEN Spots : **85% commerce** / **10% club** / **5% CAPTEN**

---

## CE QUI N EST PAS DANS LA V1 (Ne PAS construire)

Si tu construis une seule de ces features, c'est un bug.

- Passeport CAPTEN (reconnaissance cross-club par téléphone) vers V2
- Badges et Gamification (Premier Run, Régulier, Légende, etc.) vers V2
- Système d'Ambassadeur / Parrainage vers V2
- Réseau social / feed / likes / commentaires
- Leaderboard / classement entre membres
- Messagerie interne
- Boutique e-commerce
- Tracking de performance (chronos, distances, vitesses)
- Application mobile native

---

## DOSSIER DE SPECIFICATIONS (Ordre de Lecture)

Les autres documents de specs ont été écrits avant l'épuration de la V1. Ignore toutes les références aux badges, au Passeport CAPTEN et au système ambassadeur. CE document fait foi pour le périmètre V1.

| Fichier | Contenu |
|---------|---------|
| 01_PRD.md | Vision produit, personas, features |
| 02_TECHNICAL_ARCHITECTURE.md | Stack, structure fichiers, auth, déploiement |
| 03_DATABASE_SCHEMA.md | Tables PostgreSQL/Supabase, RLS, triggers |
| 04_API_SPECIFICATION.md | Opérations Supabase, Edge Functions |
| 05_UI_UX_SPECIFICATION.md | Design system, composants, pages |
| 06_USER_FLOWS.md | Parcours utilisateur avec diagrammes |

---

## STACK TECHNIQUE

Frontend: Next.js 15 (App Router) + React + TypeScript (strict), TailwindCSS v4, Framer Motion, Lucide React, React Hook Form + Zod, Zustand.
Backend: Supabase (Auth + PostgreSQL + Storage + Edge Functions + Realtime).
Maps: Leaflet. QR: qrcode.react + html5-qrcode. Charts: Recharts. Dates: date-fns. Toasts: Sonner. Paiement: Stripe. Déploiement: Vercel.

Interdictions : Bootstrap, Material UI, Chakra UI, Prisma, Drizzle, Express, Fastify, Firebase, MongoDB, App native.

---

## PLAN D IMPLEMENTATION PHASE

### Phase A : Fondations
- Initialisation Next.js 15 + TailwindCSS + Supabase
- Tables V1 : profiles (avec colonne pin_hash et date_of_birth), clubs, club_members, events, event_registrations, checkins, ice_contacts, waivers, spots, spot_transactions, subscriptions, withdrawal_requests
- PAS de tables badges, member_badges, member_tokens
- Auth Supabase email/password (organisateurs uniquement)
- Membres : PAS de Supabase Auth, identification par Nom + Date de naissance + PIN 4 chiffres (hash côté serveur)
- Middleware pour protéger /dashboard/*

### Phase B : Landing Page et Auth UI
- Landing page existante dans src/components/landing/ (liberté totale pour refondre)
- Pages Login et Signup avec design split-screen premium
- Intégration Supabase Auth

### Phase C : Dashboard Organisateur
- Layout sidebar sombre (#1D1D1D) + topbar
- Hub du Crew : 4 StatCards (Membres, Fidélité %, Protection ICE, Cagnotte euros) + prochain run + live activity + Copilote IA
- Copilote IA : Widget qui suggère des actions contextuelles basées sur les données du club (ex: "3 membres sans fiche ICE", "Pas de run planifié cette semaine", "Cagnotte à 200 euros, planifier un retrait")
- Gestion du Club : formulaire édition, upload logo, lien public
- Gestion des Sorties : CRUD complet, carte Leaflet, QR code, lien partage, vue live check-ins Realtime, export registre PDF/CSV
- Gestion des Membres : tableau, recherche, filtres, détail avec profil + historique + fiche ICE (appel 1 clic) + décharge
- CAPTEN Spots : liste spots, ajout spot, enregistrement transaction (split 85/10/5), cagnotte, historique, bouton retrait IBAN
- Statistiques : graphiques Recharts (fréquentation, croissance, ICE, top 10)

### Phase D : Expérience Membre (Pages Publiques)
- Rejoindre un Club (/join/[slug]) :
  - Mobile-first, formulaire : Nom, Prénom, Date de naissance, Téléphone
  - **Choix du Code PIN 4 chiffres** (avec confirmation) : le membre choisit son PIN à ce moment
  - Puis formulaire ICE, signature décharge, confirmation
  - PAS de reconnaissance cross-club
- Page Événement (/event/[id]) : détails, carte, inscription
- Check-in (/checkin/[id]) : GPS (200m) + QR. Animation de succès SANS badges.
- **Page d'accès membre (/mon-espace)** :
  - Accessible depuis un bouton/lien dans la navbar de la landing page et depuis un lien direct
  - Formulaire d'identification : Nom + Date de naissance + Code PIN 4 chiffres
  - Le PIN est comparé au hash stocké en base
  - Si match : affiche sa page membre dédiée
  - Si non trouvé ou PIN incorrect : message d'erreur ("Informations incorrectes. Vérifie ton nom, ta date de naissance et ton code PIN.")
  - Après 5 tentatives échouées : bloquer l'accès pendant 15 minutes (rate limiting)
  - Page membre dédiée affiche : statut, historique des participations, prochains runs inscrits, fiche ICE modifiable, décharges signées. PAS de badges.
  - **Option "PIN oublié ?"** : Le membre saisit son adresse e-mail ➔ Envoi d'un e-mail gratuit (Resend / Supabase Mail) avec un lien magique sécurisé à durée limitée (15 min) ➔ Clic sur le lien ➔ Redirection vers la page de choix d'un nouveau PIN 4 chiffres. 100% automatique, 100% sécurisé, 0 € de coût SMS.
- Décharge (/waiver/[club_id]) : texte légal, checkboxes, signature, horodatage SHA256

### Phase E : Facturation Stripe
- Produits Stripe : Découverte (gratuit) et Captain Pro (29 euros/mois)
- Stripe Checkout pour upgrade
- Webhooks pour gérer paiements
- Table subscriptions (club_id, stripe_customer_id, plan, status, current_period_end)
- Hard Paywall au Aha Moment : après le 1er run réussi, bloquer le 2ème événement du mois, bloquer le 21ème membre, désactiver GPS en Découverte
- Gestion IBAN et retraits cagnotte : formulaire IBAN, bouton retrait (minimum 50 euros), table withdrawal_requests

### Phase F : Polish
- Responsive mobile/tablette/desktop
- Animations Framer Motion (transitions, check-in success, micro-interactions)
- Build 0 erreurs TypeScript
- SEO meta tags + Open Graph
- Lighthouse score supérieur à 90

---

## REGLES CRITIQUES

1. Liberté créative UI/UX totale. Tu peux faire mieux que le design de référence.
2. Le membre n'a JAMAIS de mot de passe. OTP/SMS uniquement.
3. Pas de réseau social. Pas de feed, likes, commentaires, leaderboard.
4. PAS de badges en V1. Pas de tables badges, pas de composants Badge.
5. PAS de Passeport CAPTEN en V1. Chaque club gère ses membres indépendamment.
6. PAS de système ambassadeur/parrainage en V1.
7. Toujours mobile-first pour les pages publiques.
8. Le registre horodaté est un document légal. Exportable PDF/CSV.
9. Supabase Realtime obligatoire pour les check-ins en direct.
10. Hard Paywall au Aha Moment. L'organisateur teste gratuitement, fait son premier run, voit les résultats, puis upgrade Captain Pro.
11. Commission Spots : 85% commerce / 10% club / 5% CAPTEN. Pas d'autre split.

---

## MODELE DE FACTURATION (Figé)

### Plan Découverte (Gratuit)
- 1 session par mois maximum
- 20 membres maximum
- Check-in QR uniquement (pas de GPS)
- Pas d'export PDF du registre

### Plan Captain Pro (29 euros par mois)
- Sessions illimitées
- Membres illimités
- Check-in GPS + QR
- Export PDF/CSV du registre
- CAPTEN Spots illimités
- Copilote IA
- Support prioritaire

### Hard Paywall : Le Aha Moment
1. Il crée son club (gratuit)
2. Il crée son premier événement (gratuit)
3. Il fait son premier run avec des vrais check-ins (gratuit)
4. Il voit les stats, le registre, les fiches ICE remplies
5. Il essaie de créer un 2ème événement dans le mois : PAYWALL
6. Message : Ton premier run était un succès. Pour continuer : Captain Pro 29 euros/mois
7. Stripe Checkout puis Upgrade

### CAPTEN Spots : Split des Revenus
Quand un membre consomme 100 euros chez un Spot partenaire :
- 85 euros reste au commerce (pas touché par CAPTEN)
- 10 euros vers la cagnotte du club (retirable par IBAN)
- 5 euros vers la commission CAPTEN (revenu plateforme)

---

## CHECKLIST DE VERIFICATION FINALE V1

- npm run build doit avoir 0 erreurs
- Landing page premium et impactante
- Login/Signup fonctionnels (Supabase Auth)
- Dashboard layout avec sidebar et navigation
- Copilote IA avec suggestions contextuelles
- CRUD complet des événements avec carte Leaflet
- Check-in GPS fonctionnel (geofencing 200m) Captain Pro uniquement
- Check-in QR code fonctionnel tous les plans
- Registre horodaté avec export CSV/PDF Captain Pro uniquement
- Fiches ICE avec appel en 1 clic
- Décharge numérique avec hash SHA256
- CAPTEN Spots avec split 85/10/5
- Demande de retrait IBAN
- Statistiques avec graphiques Recharts
- Page membre accessible via Nom + Prénom + Date de naissance SANS badges
- Supabase Realtime sur les check-ins
- Stripe Checkout + Webhooks + gestion abonnements
- Hard Paywall au Aha Moment
- Limites Découverte enforced (1 event/mois, 20 membres, pas de GPS)
- RLS policies sur toutes les tables
- Responsive mobile tablette desktop
- Animations Framer Motion
- Meta tags SEO + Open Graph
- AUCUN badge, AUCUN passeport, AUCUN parrainage
