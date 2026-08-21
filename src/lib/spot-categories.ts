import { Coffee, Footprints, Activity, HeartPulse, MapPin, UtensilsCrossed, type LucideIcon } from "lucide-react";

// Source unique de vérité pour les catégories de spots du crew.
// Utilisée par le dashboard, la page publique /join et la micro-page /p.
// Icônes lucide (pas d'emoji) — rendu identique sur tous les OS, cohérent avec le reste de l'app.

export type SpotCategorie = "cafe" | "boulangerie" | "shop" | "kine" | "osteo" | "autre";

export interface SpotCategoryMeta {
  value: SpotCategorie;
  label: string; // libellé complet (formulaire)
  short: string; // libellé court (chip)
  Icon: LucideIcon;
}

export const SPOT_CATEGORIES: SpotCategoryMeta[] = [
  { value: "cafe",        label: "Café / Bar",          short: "Café",        Icon: Coffee },
  { value: "boulangerie", label: "Boulangerie / Food",  short: "Boulangerie", Icon: UtensilsCrossed },
  { value: "shop",        label: "Shop running",        short: "Shop",        Icon: Footprints },
  { value: "kine",        label: "Kiné / Physio",       short: "Kiné",        Icon: Activity },
  { value: "osteo",       label: "Ostéo / Récup",       short: "Ostéo",       Icon: HeartPulse },
  { value: "autre",       label: "Autre pépite",        short: "Autre",       Icon: MapPin },
];

export const getSpotCategory = (v: string): SpotCategoryMeta =>
  SPOT_CATEGORIES.find((c) => c.value === v) ?? SPOT_CATEGORIES[5];

