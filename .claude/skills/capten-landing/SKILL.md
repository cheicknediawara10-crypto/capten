---
name: capten-landing
description: Compétence spécialisée pour construire et modifier la landing page CAPTEN. Déclencher quand l'utilisateur parle de la landing page, du design, des sections Hero/Features/Pricing/Footer, ou quand il veut modifier l'apparence du site public.
---

# CAPTEN Landing Page — Guide de construction

## Direction artistique : White Modern SaaS (Linear/Vercel/Framer style)

Fond blanc, typographie extrabold, accent orange sélectif.
Les 13 principes Figma sont appliqués : contraste WCAG, rythme 8pt grid, élévation shadow, proportion type scale.

---

## Design Tokens (`src/app/globals.css`)

```css
--color-brand:       #FF5500   /* Orange CAPTEN */
--color-brand-dark:  #E04B00
--color-text-primary:   #111111
--color-text-secondary: #6B7280   /* WCAG AA ✓ sur blanc */
--color-text-muted:     #9CA3AF   /* ⚠️ WCAG fail — utiliser #6B7280 pour corps */
--color-bg:          #FFFFFF
--color-bg-subtle:   #FAFAF8
--color-dark:        #111111
--color-border:      #E8E8E8
--color-border-dark: #D0D0D0
--shadow-brand: 0 4px 14px rgba(255,85,0,0.25)   /* shadow CTA primaire */
--shadow-2: 0 4px 12px rgba(0,0,0,0.07)           /* hover card */
```

## Typographie
- Police : **Montserrat** (`--font-dm-sans`) — droite, NON italic, NON uppercase sauf labels
- H1 hero : `text-[56px] sm:text-[72px] lg:text-[90px] font-extrabold tracking-tight`
- H2 section : `text-[42px] sm:text-[54px] font-extrabold tracking-tight`
- Labels section : `text-[11px] font-bold tracking-[0.18em] uppercase text-[#FF5500]` avec `— LABEL —`
- Body : `text-sm leading-relaxed text-[#6B7280]`

## Structure des sections (`page.tsx`)
```
Navbar → Hero → FeaturesBento → Pricing → Footer
```

---

## Composants

### `Navbar.tsx`
- Fond transparent → `bg-white/95 backdrop-blur border-b` au scroll
- Logo couleur (pas inversé), CTA "Essai gratuit — 14 jours"

### `Hero.tsx`
- bg blanc, `pt-32 pb-16`, tout centré
- Pill badge : `bg-[#FF5500]/8 border border-[#FF5500]/20`
- H1 : "Cours. **On gère** le reste." — "On gère" en orange
- Dashboard mockup HTML/CSS : fond `#111111`, stats (18/20, 20:30, GPS), liste membres

### `FeaturesBento.tsx`
- bg `#FAFAF8`, `py-28`
- Bento grid `grid-cols-4 gap-4` :
  - Col 1 `row-span-2` : Check-in GPS (tall + mini visual)
  - Col 2 r1 : Fiches d'urgence (blanc)
  - Col 3 r1 : WhatsApp automatisé (orange `bg-[#FF5500]`) — accent card
  - Col 4 r1 : Liste d'attente (blanc)
  - Col 2 r2 : Système Anti-Fantôme (blanc)
  - Col 3 r2 : Revenus Spots (blanc)
  - Col 4 r2 : "14j Essai gratuit" (dark `#111111`)

### `Pricing.tsx`
- bg blanc, `py-28`
- Toggle Mensuel (49,99€) / Annuel (33€ facturé 399€/an, badge "-33%")
- Card split : gauche dark `#111111` (prix, CTA) + droite blanche (9 features checklist)

### `Footer.tsx`
- bg `#FAFAF8 border-t border-[#E8E8E8]`
- 4 colonnes : Brand / PRODUIT / LÉGAL / CONTACT
- Texte : `#6B7280` (WCAG AA ✓), JAMAIS `#9CA3AF` pour texte corps
- "Made in France" SANS emoji

---

## `Button.tsx` variants
```
primary:  bg-[#FF5500] + shadow-[0_4px_14px_rgba(255,85,0,0.25)]
outline:  bg-transparent border-[#E8E8E8] hover:bg-[#F5F5F3]
dark:     bg-[#181716] shadow-lg
```

---

## Règles absolues
1. **JAMAIS** `h1-h4 { italic uppercase }` dans globals.css
2. **JAMAIS** emoji dans les composants — utiliser Lucide icons
3. **JAMAIS** revenir au fond dark `#0C0C0A`
4. **JAMAIS** `text-[#9CA3AF]` pour du texte corps (WCAG fail) — utiliser `#6B7280`
5. **NE PAS** réimporter StatAbout, AppSection, Community, CrewGrid, MissionRow, PricingCTA
6. gap minimum `gap-4` (16px), sections `py-28` (112px)

## Principes Figma appliqués
- **Contraste** : ≥ `#6B7280` sur blanc (4.6:1, WCAG AA)
- **Emphase** : UN seul orange (CTA + accent card)
- **Rythme** : gap-4, py-28 constants
- **Proportion** : H1 90px → H2 54px → H3 20px → label 11px
- **Élévation** : shadow-brand CTA, shadow-2 card hover

## Business
- CAPTEN PRO : 49,99€/mois ou 399€/an (2 mois offerts)
- Free Trial 14 jours, aucune CB
- 200 msg WhatsApp/mois, membres/runs illimités

## Dev server
```bash
PATH=/Users/cd/.gemini/antigravity/scratch/node-v22.15.0-darwin-arm64/bin:$PATH node ./node_modules/.bin/next dev -p 3001
```
http://localhost:3001
