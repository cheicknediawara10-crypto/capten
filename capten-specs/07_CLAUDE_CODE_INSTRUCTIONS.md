# CAPTEN — Instructions Claude Code (Prompt Master)

> **Ce document est le point d'entrée unique pour Claude Code.**
> Il orchestre la construction complète du SaaS CAPTEN à partir du dossier de spécifications.

---

## 🎯 MISSION

Tu es un **Principal Full-Stack Engineer**. Ta mission est de construire le SaaS **CAPTEN** de A à Z — landing page, authentification, dashboard organisateur, micro-page membre, système de badges et CAPTEN Spots — en suivant **exclusivement** les spécifications fournies.

**Tu ne prends aucune décision créative.** Chaque détail est documenté dans les 6 fichiers de spécifications ci-dessous. En cas de doute, relis le document concerné. Ne devine jamais.

---

## 📁 DOSSIER DE SPÉCIFICATIONS (Ordre de Lecture)

Lis ces documents **dans cet ordre exact** avant de commencer à coder :

| # | Fichier | Contenu | Priorité de lecture |
|---|---------|---------|---------------------|
| 1 | `01_PRD.md` | Vision produit, personas, features, pages list, ce que CAPTEN n'est PAS | 🔴 LIRE EN PREMIER |
| 2 | `02_TECHNICAL_ARCHITECTURE.md` | Stack technique, structure fichiers, auth flows, déploiement | 🔴 LIRE EN SECOND |
| 3 | `03_DATABASE_SCHEMA.md` | Tables PostgreSQL/Supabase, RLS, triggers, vues, seed data, ERD | 🔴 CRITIQUE |
| 4 | `04_API_SPECIFICATION.md` | Opérations Supabase, Edge Functions, types TypeScript | 🟡 RÉFÉRENCE |
| 5 | `05_UI_UX_SPECIFICATION.md` | Design system, tokens, composants, pages détaillées | 🟡 RÉFÉRENCE |
| 6 | `06_USER_FLOWS.md` | Parcours utilisateur pas-à-pas avec diagrammes Mermaid | 🟡 RÉFÉRENCE |

---

## 🛠️ STACK TECHNIQUE (Non Négociable)

```
Frontend:     Next.js 15 (App Router) + React + TypeScript (strict)
Styling:      TailwindCSS v4
Animations:   Framer Motion
Icons:        Lucide React
Forms:        React Hook Form + Zod
State:        Zustand (auth store)
Backend:      Supabase (Auth + PostgreSQL + Storage + Edge Functions + Realtime)
Maps:         Leaflet (open source, pas de clé API)
QR Codes:     qrcode.react (génération) + html5-qrcode (scan)
Charts:       Recharts
Dates:        date-fns
Toasts:       Sonner
Déploiement:  Vercel
```

### Interdictions Absolues
- ❌ Bootstrap, Material UI, Chakra UI
- ❌ Prisma, Drizzle (utiliser le client Supabase directement)
- ❌ Express, Fastify (utiliser les Edge Functions Supabase)
- ❌ Firebase, MongoDB
- ❌ App native / React Native

---

## 🏗️ PLAN D'IMPLÉMENTATION PHASÉ

### Phase A : Fondations (Faire en premier)

```
Étape A1 — Initialisation du projet
├── Créer le projet Next.js 15 avec App Router
├── Configurer TailwindCSS v4 avec les design tokens de 05_UI_UX_SPECIFICATION.md
├── Installer toutes les dépendances (voir 02_TECHNICAL_ARCHITECTURE.md)
├── Créer la structure de fichiers complète (voir 02_TECHNICAL_ARCHITECTURE.md §2)
├── Configurer Supabase (client browser + server)
├── Créer les fichiers .env.local.example
└── Vérifier : `npm run build` passe sans erreur

Étape A2 — Base de données Supabase
├── Exécuter les migrations SQL de 03_DATABASE_SCHEMA.md
├── Créer les enums, tables, indexes, RLS policies
├── Créer les triggers (auto-badge, geo-distance)
├── Créer les vues (club_stats, etc.)
├── Exécuter le seed data (badges)
└── Vérifier : toutes les tables existent dans Supabase Dashboard

Étape A3 — Authentification
├── Configurer Supabase Auth (email/password pour organisateurs)
├── Configurer OTP/Magic Link (pour membres via téléphone)
├── Créer le middleware Next.js pour protéger /dashboard/*
├── Créer le Zustand auth store
├── Créer les hooks useAuth
└── Vérifier : login/logout fonctionnel
```

### Phase B : Landing Page & Auth UI

```
Étape B1 — Landing Page
├── La landing page existe DÉJÀ dans src/components/landing/
├── Vérifier que tous les composants sont fonctionnels
├── Mettre à jour le logo officiel CAPTEN (public/logo.png)
├── S'assurer que les CTAs pointent vers /login?mode=signup
└── Vérifier : la landing page s'affiche correctement sur /

Étape B2 — Pages Login & Signup
├── Créer /login avec le design split-screen (voir 05_UI_UX_SPECIFICATION.md §2.2)
├── Créer /signup (voir 05_UI_UX_SPECIFICATION.md §2.3)
├── Intégrer avec Supabase Auth
├── Gérer les états d'erreur et de chargement
├── Redirection vers /dashboard après login réussi
└── Vérifier : inscription + connexion fonctionnelles
```

### Phase C : Dashboard Organisateur

```
Étape C1 — Layout Dashboard
├── Créer le layout avec sidebar sombre (#1D1D1D) + topbar
├── Navigation avec icônes Lucide (voir 05_UI_UX_SPECIFICATION.md §2.4)
├── Responsive : sidebar → drawer hamburger sur mobile
├── Protection par middleware (rôle 'organizer' requis)
└── Vérifier : layout s'affiche, navigation fonctionne

Étape C2 — Hub du Crew (/dashboard)
├── 4 StatCards en grille (Le Crew, Fidélité, Protection, Cagnotte)
├── Carte du prochain événement planifié
├── Live Activity feed (Supabase Realtime)
├── Section Cagnotte
├── Récupérer les données depuis Supabase (vues + queries)
└── Vérifier : les statistiques s'affichent avec les bonnes données

Étape C3 — Gestion du Club (/dashboard/club)
├── Formulaire d'édition du club (nom, slug, logo, description, liens sociaux)
├── Upload de logo vers Supabase Storage
├── Génération du lien public : capten.app/join/[slug]
└── Vérifier : modification du club sauvegardée en base

Étape C4 — Gestion des Sorties (/dashboard/events)
├── Liste des événements avec filtres (À venir, Passées, Brouillons)
├── Création d'événement (/dashboard/events/new)
│   ├── Formulaire complet (titre, date, heure, point GPS, capacité)
│   ├── Carte Leaflet interactive pour sélection du point de RDV
│   ├── Option récurrence
│   └── Publier / Brouillon
├── Détail d'événement (/dashboard/events/[id])
│   ├── Onglets : Détails | Inscrits | Check-ins | Registre
│   ├── QR Code de l'événement (qrcode.react)
│   ├── Lien de partage copiable
│   ├── Vue live des check-ins (Supabase Realtime)
│   ├── Export du registre (CSV/PDF)
│   └── Carte avec dots des check-ins
└── Vérifier : CRUD complet des événements fonctionne

Étape C5 — Gestion des Membres (/dashboard/members)
├── Tableau des membres (avatar, nom, téléphone, participations, badges, ICE, waiver)
├── Recherche et filtres
├── Détail membre (/dashboard/members/[id])
│   ├── Profil + badges
│   ├── Historique de participations
│   ├── Fiche ICE (avec bouton d'appel en 1 clic)
│   └── Statut décharge
└── Vérifier : liste et détail des membres fonctionnels

Étape C6 — CAPTEN Spots (/dashboard/spots)
├── Liste des spots partenaires
├── Ajout d'un nouveau spot (formulaire)
├── Enregistrement de transaction (montant → calcul 10% commission)
├── Affichage du solde de la cagnotte
├── Historique des transactions
└── Vérifier : ajout spot + transaction + calcul commission OK

Étape C7 — Statistiques (/dashboard/stats)
├── Graphiques Recharts :
│   ├── Tendance de fréquentation (line chart)
│   ├── Croissance des membres (bar chart)
│   ├── Taux de complétion ICE (donut chart)
│   └── Top 10 membres actifs
└── Vérifier : graphiques s'affichent avec données réelles
```

### Phase D : Expérience Membre (Pages Publiques)

```
Étape D1 — Page de Rejoindre un Club (/join/[slug])
├── Page publique mobile-first
├── Affiche : logo, nom, description, prochains événements
├── Bouton "Rejoindre ce crew" → saisie numéro de téléphone
├── Vérification OTP
├── Si nouveau membre : formulaire ICE → signature décharge
├── Si membre existant (Passeport CAPTEN) : pré-remplissage automatique
├── Confirmation + lien micro-page
└── Vérifier : flow complet de A à Z (voir 06_USER_FLOWS.md Flow 3)

Étape D2 — Page Événement (/event/[id])
├── Détails de l'événement (titre, date, lieu, carte)
├── Compteur de participants
├── Bouton "S'inscrire"
├── Si déjà inscrit : "Tu es inscrit ✅" + bouton Check-in
└── Vérifier : inscription fonctionnelle

Étape D3 — Page Check-in (/checkin/[id])
├── Plein écran, optimisé mobile
├── Demande permission GPS (navigator.geolocation)
├── Animation de validation (cercle pulsant autour du point de RDV)
├── Calcul de distance (Haversine formula)
├── Si ≤ 200m : ✅ "Check-in validé!" + confetti + badge si débloqué
├── Si > 200m : ❌ "Trop loin" + distance affichée + carte
├── Fallback : scan QR code
└── Vérifier : check-in GPS fonctionne avec position réelle

Étape D4 — Micro-Page Membre (/p/[token])
├── Carte membre digitale (nom, date d'inscription, participations)
├── Statut / niveau actuel
├── Prochaines sorties
├── Grille de badges (gagnés = colorés, verrouillés = grisés)
├── Section ICE (modifiable)
├── Décharges signées
├── Design mobile-first, très épuré
└── Vérifier : affichage correct avec données réelles

Étape D5 — Page Décharge (/waiver/[club_id])
├── Texte légal de la décharge
├── Cases à cocher pour les clauses clés
├── Bouton "Je signe cette décharge"
├── Horodatage + hash SHA256
└── Vérifier : signature sauvegardée en base avec hash
```

### Phase E : Système de Badges

```
Étape E1 — Logique de Badges
├── Seed data : créer les 6 badges dans la table badges
├── Edge Function award-badges :
│   ├── Déclenchée après chaque check-in
│   ├── Compte les check-ins totaux → Premier Run (1), Régulier (10), Légende (100)
│   ├── Compte les lieux uniques → Explorer (5)
│   ├── Compte les parrainages → Ambassadeur (5)
│   ├── Vérifie la date d'adhésion → Early Member (1er mois)
│   └── Insère dans member_badges si nouveau badge débloqué
├── Notification visuelle quand un badge est débloqué
└── Vérifier : check-in déclenche bien l'attribution de badges

Étape E2 — Affichage des Badges
├── Composant BadgeDisplay (voir 05_UI_UX_SPECIFICATION.md)
├── Grille sur la micro-page membre
├── Liste dans le détail membre (dashboard)
├── Animation de déblocage sur la page check-in
└── Vérifier : badges affichés correctement partout
```

### Phase F : Polish & Vérification Finale

```
Étape F1 — Responsive
├── Tester TOUTES les pages sur mobile (375px)
├── Tester sur tablette (768px)
├── Tester sur desktop (1440px)
└── Corriger tous les problèmes d'alignement

Étape F2 — Animations
├── Framer Motion sur toutes les transitions de page
├── Animations d'entrée sur les cards et listes
├── Animation de check-in (cercle pulsant + confetti)
├── Animation de badge débloqué
└── Micro-interactions sur les boutons et inputs

Étape F3 — Build & Tests
├── npm run build → 0 erreurs TypeScript
├── npm run lint → 0 warnings
├── Tester tous les user flows de 06_USER_FLOWS.md
├── Vérifier les RLS policies (un organizer ne peut pas voir les données d'un autre)
└── Tester le Realtime (check-ins en live)

Étape F4 — SEO & Performance
├── Meta tags sur toutes les pages
├── Open Graph tags pour le partage social
├── Lighthouse score > 90 sur toutes les pages
├── Images optimisées (next/image)
└── Lazy loading des composants non-critiques
```

---

## 📐 CONVENTIONS DE CODE

### Nommage
- **Fichiers composants** : PascalCase (`StatCard.tsx`, `EventCard.tsx`)
- **Fichiers utilitaires** : camelCase (`geo.ts`, `format.ts`)
- **Fichiers hooks** : camelCase avec préfixe `use` (`useAuth.ts`)
- **Routes Next.js** : kebab-case (`/dashboard/events/new`)
- **Tables Supabase** : snake_case (`club_members`, `ice_contacts`)
- **Colonnes** : snake_case (`emergency_contact_name`)
- **Enums** : snake_case (`'co_organizer'`, `'qr_code'`)

### Structure des Composants
```tsx
"use client"; // Si nécessaire (interactions, hooks)

import React from "react";
// 1. React/Next imports
// 2. Third-party imports (framer-motion, lucide-react)
// 3. Local imports (components, hooks, utils)
// 4. Types

interface ComponentProps {
  // Props typées explicitement
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks en premier
  // Logique ensuite
  // Return JSX
}
```

### Règles TailwindCSS
- Utiliser les design tokens définis dans `05_UI_UX_SPECIFICATION.md`
- Préférer les classes utilitaires au CSS custom
- Utiliser `cn()` (clsx + twMerge) pour les classes conditionnelles
- Pas de `!important`
- Pas de `@apply` dans les fichiers CSS (sauf globals.css)

### Règles Supabase
- Toujours utiliser le client typé (générer les types avec `supabase gen types`)
- Toujours gérer les erreurs : `const { data, error } = await supabase.from(...)`
- Utiliser les RLS policies — ne JAMAIS utiliser le `service_role` key côté client
- Utiliser les subscriptions Realtime pour les check-ins en live

---

## 🎨 DESIGN SYSTEM (Résumé Rapide)

```css
/* Couleurs Principales */
--canvas:       #F4F4EE;   /* Fond de page */
--accent:       #FF5500;   /* CTA, badges actifs */
--text-primary: #1A1918;   /* Titres, texte principal */
--text-secondary: #666562; /* Sous-titres */
--white:        #FFFFFF;   /* Cartes */
--dark:         #1D1D1D;   /* Sidebar, éléments sombres */
--beige:        #EFEFE8;   /* Cartes FAQ, fond comparaison */
--success:      #22C55E;   /* Check-in valide, ICE complet */
--error:        #EF4444;   /* Erreurs */

/* Rayons */
--radius-card:   24px;
--radius-button: 999px;    /* Pill */
--radius-input:  12px;

/* Ombres */
--shadow-card:     0 4px 24px rgba(0,0,0,0.06);
--shadow-elevated: 0 12px 40px rgba(0,0,0,0.10);
--shadow-floating: 0 25px 65px rgba(0,0,0,0.12);

/* Typographie */
--font-family: 'Inter', system-ui, sans-serif;
```

---

## ⚠️ RÈGLES CRITIQUES

1. **Le screenshot de la landing page (https://eternal-storm-019622.framer.app/) est la source de vérité** pour le design de la landing page. Ne pas réinventer.

2. **Le membre n'a JAMAIS de mot de passe.** Authentification par OTP/SMS uniquement.

3. **Pas de réseau social.** Pas de feed, pas de likes, pas de commentaires, pas de leaderboard.

4. **Le Passeport CAPTEN** : quand un membre rejoint un nouveau club, ses infos (ICE, nom, téléphone) sont automatiquement pré-remplies. C'est la feature la plus importante pour la rétention.

5. **Les badges récompensent la communauté, pas la performance.** Pas de chronos, pas de distances, pas de vitesses.

6. **Toujours mobile-first** pour les pages publiques (join, event, checkin, micro-page). Les membres accèdent exclusivement depuis leur téléphone.

7. **Le registre horodaté est un document légal.** Il doit être exportable en PDF/CSV avec horodatage précis de chaque check-in.

8. **Supabase Realtime obligatoire** sur la page de détail d'événement pour afficher les check-ins en temps réel.

---

## ✅ CHECKLIST DE VÉRIFICATION FINALE

Avant de considérer le projet comme terminé, vérifier :

- [ ] `npm run build` → 0 erreurs
- [ ] `npm run lint` → 0 warnings critiques
- [ ] Landing page fidèle au design de référence
- [ ] Login/Signup fonctionnels (email + password)
- [ ] Dashboard layout avec sidebar et navigation
- [ ] CRUD complet des événements
- [ ] Check-in GPS fonctionnel (geofencing 200m)
- [ ] Check-in QR code fonctionnel
- [ ] Registre horodaté avec export CSV/PDF
- [ ] Fiches ICE avec appel en 1 clic
- [ ] Décharge numérique avec hash SHA256
- [ ] CAPTEN Spots avec calcul 10% commission
- [ ] Statistiques avec graphiques Recharts
- [ ] Micro-page membre accessible via token
- [ ] Système de badges fonctionnel (6 badges)
- [ ] Passeport CAPTEN (pré-remplissage cross-club)
- [ ] Supabase Realtime sur les check-ins
- [ ] RLS policies sur toutes les tables
- [ ] Responsive sur mobile (375px), tablette (768px), desktop (1440px)
- [ ] Animations Framer Motion
- [ ] Meta tags SEO sur toutes les pages

---

## 🚀 COMMANDE DE DÉMARRAGE

```bash
# 1. Aller dans le répertoire du projet
cd /Users/cd/.gemini/antigravity/scratch/capten

# 2. Installer les dépendances
npm install

# 3. Copier et configurer les variables d'environnement
cp .env.local.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Lancer le développement
npm run dev
```

---

> **Rappel : lis les 6 documents de spécifications AVANT de coder. Chaque détail y est documenté.**
