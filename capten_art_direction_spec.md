# CAPTEN — Spécifications Direction Artistique & Charte Visuelle
**Rapport d'Identité Graphique & Guide d'Intégration Frontend**
*Directeur Artistique & Lead Graphic Designer de CAPTEN*

---

> [!NOTE]
> Ce document définit l'identité visuelle de CAPTEN pour sa landing page de conversion premium. Il est conçu pour donner au développeur frontend toutes les clés (classes Tailwind CSS, structures HTML, inline SVG et animations) pour implémenter l'interface au pixel près, sans recourir à des images de stock.

---

## 👁️ 1. Vision Visuelle : L'Esthétique "Cyber-Athlétique" Dark Mode

Le positionnement de CAPTEN exige une identité visuelle **ultra-bold, technique et athlétique**, à la frontière entre les marques d'équipementiers de haute performance (Nike, Salomon) et l'interface de contrôle tactique d'un pilote de chasse (HUD, Dashboard tactique). 

### Principes Graphiques Directeurs :
1. **Fonds Obscurs & Profondeur Technologique** : Utilisation d'un mode sombre extrême (Deep Black) pour créer un effet de cocon exclusif et faire vibrer les couleurs de signalisation.
2. **Couleurs de Signalisation Fonctionnelle** : Pas de décoration inutile. Chaque couleur d'accent néon a un rôle ergonomique précis (le vert pour la sécurité et la validation, le jaune/orange pour la performance physique et l'urgence, le rouge pour la route, les tracés et la responsabilité légale).
3. **Typographie d'Impact (Ultra-Bold & Compressed)** : Titres massifs, écrasés et en italique pour simuler l'élan et la vitesse.
4. **Graphisme Structurel (Bento Grid)** : L'information est compartimentée dans des blocs asymétriques aux bords très arrondis (`rounded-[24px]` ou `rounded-[32px]`), avec des séparateurs d'un pixel en verre poli (glassmorphism) imitant le cockpit d'un véhicule de course.

---

## 🎨 2. Design Tokens & Palette de Couleurs Precise

Le projet utilise **Tailwind CSS**. Les couleurs ci-dessous doivent être configurées dans le fichier `tailwind.config.ts` ou utilisées via des classes arbitraires Tailwind (`bg-[#...]`, `text-[#...]`).

### Palette Chromatique de Référence :

| Usage / Rôle | Nom du Token | Valeur Hex | Classe Tailwind standard / Arbitraire |
| :--- | :--- | :--- | :--- |
| **Fond Principal** | Deep Black | `#08080C` | `bg-[#08080C]` |
| **Fond Bento Grid** | Tech Charcoal | `#12131C` | `bg-[#12131C]` |
| **Accent Principal (Vitesse)**| Electric Orange | `#FF5C00` | `text-capten-orange` / `bg-capten-orange` |
| **Accent Performance (Néon)** | Neon Yellow | `#CCFF00` | `text-[#CCFF00]` / `bg-[#CCFF00]` |
| **Sécurité / Validation (GPS)**| GPS Green / Success| `#00FF66` | `text-[#00FF66]` / `bg-[#00FF66]` |
| **Alerte / Tracé Actif** | Safety Red | `#FF2A54` | `text-[#FF2A54]` / `bg-[#FF2A54]` |
| **Texte Primaire Contrasté** | Raw White | `#FDFCF8` | `text-[#FDFCF8]` / `text-white` |
| **Texte Secondaire (Lecture)**| Silver Metallic| `#A3A8B8` | `text-[#A3A8B8]` / `text-neutral-400` |
| **Bordures / Éléments Mutes** | Dark Muted | `#2C2D3B` | `border-[#2C2D3B]` / `border-white/[0.08]` |

### Gradients Recommandés :
*   **Gradient de Surface Bento (Glassmorphism)** :
    `bg-gradient-to-br from-[#1E2030]/40 to-[#11121A]/80 backdrop-blur-xl`
*   **Gradient d'Accent (Bouton Principal)** :
    `bg-gradient-to-r from-[#CCFF00] via-[#E6FF80] to-[#CCFF00]`
*   **Faisceau Lumineux Décharge (Bouclier Légal)** :
    `bg-gradient-to-t from-[#00FF66]/20 via-transparent to-transparent`

---

## 🔤 3. Directives Typographiques

La typographie est l'élément central de l'agressivité visuelle de CAPTEN. Nous exploitons la police **Inter** (déjà présente dans la configuration du projet) sous ses formes les plus extrêmes.

### Spécification des Titres (H1, H2, H3) :
Pour donner l'effet de vitesse et de puissance athlétique (Nike-style), tous les titres doivent impérativement respecter les règles suivantes :
*   **Graisse** : Black 900 (`font-black`)
*   **Style** : Italique (`italic`)
*   **Casse** : Majuscules (`uppercase`)
*   **Tracking (Espacement des lettres)** : Tighter / Ultra-serré (`tracking-[-0.05em]` ou `tracking-tighter`)
*   **Interlignage** : Minimal (`leading-[0.85]` ou `leading-none`)

#### Classe de titre standard à utiliser (H1/H2) :
```html
<h1 class="font-display font-black italic uppercase tracking-tighter leading-[0.85] text-white">
  Ne gérez plus votre run club.<br>
  <span class="text-[#CCFF00]">Menez-le.</span>
</h1>
```

### Spécification du Corps de Texte :
Pour contraster avec la brutalité des titres, le corps de texte doit être propre, aéré et d'une lisibilité irréprochable.
*   **Police** : Inter Regular ou Medium
*   **Couleur** : Silver Metallic (`text-[#A3A8B8]`)
*   **Interlignage** : Confortable (`leading-relaxed`)
*   **Classe standard** :
    ```html
    <p class="font-sans font-normal text-sm md:text-base text-[#A3A8B8] leading-relaxed">
      L'argent de vos membres va directement de leur carte bancaire à votre compte professionnel.
    </p>
    ```

### Spécification des Micro-données / Labels Techniques :
*   **Police** : DM Mono ou Inter SemiBold
*   **Style** : Majuscule, grand espacement (`tracking-widest`)
*   **Classe standard** :
    ```html
    <span class="font-mono text-xs uppercase tracking-widest text-[#CCFF00]">
      [ 01 / LE BOUCLIER LÉGAL ]
    </span>
    ```

---

## 🎛️ 4. Guide d'Effets de Surface (Glassmorphism & Neon Borders)

Pour éviter les aplats ternes, chaque carte de la Bento Grid utilise des propriétés physiques de transparence et de réfraction de la lumière (effet verre poli).

### Le Conteneur Bento Premium :
```html
<div class="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#12131C]/60 backdrop-blur-xl p-8 transition-all duration-300 hover:border-[#CCFF00]/40 group shadow-2xl">
  <!-- Ligne néon supérieure de 1px brillante au survol -->
  <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#CCFF00]/0 to-transparent transition-all duration-500 group-hover:via-[#CCFF00]/50"></div>
  
  <!-- Contenu de la carte -->
  <div>...</div>
</div>
```

---

## 🛠️ 5. Spécifications & Code des Mockups Interactifs

Pour respecter la règle d'or **"Zéro photo de stock"**, la landing page s'appuie sur quatre interfaces interactives codées directement en HTML, Tailwind et SVG. Voici les spécifications exactes de leur ergonomie, de leur structure et de leur interactivité.

---

### MOCKUP 1 : Le Dashboard HUD (Console de Pilotage du Leader)
*Situé en Section 4 : "La Preuve" (Témoignage d'Alexandre M.)*

#### A. Concept Visuel & Ergonomie
Ce mockup simule le cockpit opérationnel du Bastille Running Crew. Il est divisé en 4 mini-widgets Bento affichant des données stratégiques. Le design rappelle un écran technique aéronautique (chiffres nets, contours précis, graphiques épurés).

#### B. Structure HTML & Classes Tailwind
```html
<div class="grid grid-cols-2 gap-4 w-full max-w-lg p-6 bg-[#0B0C10] border border-white/[0.06] rounded-[32px] shadow-2xl">
  
  <!-- Widget 1: Membres Actifs -->
  <div class="bg-[#12131C]/80 border border-white/[0.08] rounded-[24px] p-4 flex flex-col justify-between">
    <div>
      <span class="font-mono text-[10px] text-[#A3A8B8] uppercase tracking-wider">MEMBRES ACTIFS</span>
      <h3 class="text-3xl font-black italic tracking-tight text-white mt-1">248</h3>
    </div>
    <div class="flex items-center justify-between mt-4">
      <span class="text-[11px] text-[#00FF66] font-mono flex items-center gap-1">
        <span class="inline-block w-2 h-2 rounded-full bg-[#00FF66] animate-ping"></span>
        +12% CE MOIS
      </span>
      <!-- Mini Sparkline SVG -->
      <svg class="w-16 h-8 text-[#00FF66]" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 25C15 22 25 5 40 12C55 18 70 2 100 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
  </div>

  <!-- Widget 2: Bouclier Légal -->
  <div class="bg-[#12131C]/80 border border-white/[0.08] rounded-[24px] p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#00FF66]/30 transition-all duration-300">
    <div class="absolute -right-4 -bottom-4 text-white/[0.02] group-hover:text-[#00FF66]/5 transition-all duration-500">
      <!-- Bouclier Géant en fond filigrane -->
      <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
    <div>
      <span class="font-mono text-[10px] text-[#A3A8B8] uppercase tracking-wider">BOUCLIER LÉGAL</span>
      <div class="flex items-baseline gap-2 mt-1">
        <h3 class="text-3xl font-black italic tracking-tight text-[#00FF66]">100%</h3>
        <span class="text-[11px] text-[#A3A8B8] font-mono">PROTÉGÉ</span>
      </div>
    </div>
    <div class="mt-4">
      <div class="w-full bg-white/[0.08] h-[6px] rounded-full overflow-hidden">
        <div class="bg-[#00FF66] h-full rounded-full w-full shadow-[0_0_8px_rgba(0,255,102,0.6)]"></div>
      </div>
      <span class="text-[10px] text-[#A3A8B8] mt-2 block font-mono">248/248 décharges signées</span>
    </div>
  </div>

  <!-- Widget 3: Caisse du Mois -->
  <div class="bg-[#12131C]/80 border border-white/[0.08] rounded-[24px] p-4 flex flex-col justify-between">
    <div>
      <span class="font-mono text-[10px] text-[#A3A8B8] uppercase tracking-wider">CAISSE STRIPE DIRECT</span>
      <h3 class="text-3xl font-black italic tracking-tight text-white mt-1">2 480 €</h3>
    </div>
    <div class="flex items-center gap-2 mt-4">
      <span class="bg-capten-orange/10 border border-capten-orange/20 text-capten-orange text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
        0% FRAIS CAPTEN
      </span>
    </div>
  </div>

  <!-- Widget 4: Prochain Run -->
  <div class="bg-[#12131C]/80 border border-white/[0.08] rounded-[24px] p-4 flex flex-col justify-between">
    <div>
      <span class="font-mono text-[10px] text-[#A3A8B8] uppercase tracking-wider">PROCHAIN RUN</span>
      <h4 class="text-sm font-bold text-white mt-1">Jeudi 19h00</h4>
      <span class="text-[11px] text-neutral-400 font-mono">Bastille (10.5 km)</span>
    </div>
    <div class="flex items-center justify-between mt-4">
      <span class="bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
        84 PARTICIPANTS
      </span>
      <!-- Avatars empilés -->
      <div class="flex -space-x-2">
        <span class="w-6 h-6 rounded-full bg-neutral-700 border border-[#12131C] text-[9px] flex items-center justify-center font-bold text-white">AM</span>
        <span class="w-6 h-6 rounded-full bg-neutral-600 border border-[#12131C] text-[9px] flex items-center justify-center font-bold text-white">JD</span>
        <span class="w-6 h-6 rounded-full bg-neutral-800 border border-[#12131C] text-[9px] flex items-center justify-center font-bold text-white">+81</span>
      </div>
    </div>
  </div>

</div>
```

#### C. Interactivité & Animations
1.  **Pulsation Active** : La pastille verte à côté de `+12% CE MOIS` doit pulser indéfiniment en utilisant l'animation `animate-ping` de Tailwind sur le halo extérieur et une couleur fixe au centre.
2.  **Survol Réactif** : Les quatre mini-widgets doivent changer d'échelle très légèrement (`hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`) et la bordure du Widget Légal passe du gris sourd au vert émeraude (`hover:border-[#00FF66]/50`).

---

### MOCKUP 2 : Le Radar GPS d'Activité en Direct
*Situé en Section 3 : "Le Moteur" (Pilier 4)*

#### A. Concept Visuel & Ergonomie
Ce mockup simule un écran radar tactique affichant le tracé GPX d'un parcours de 10km (rouge fluo) sur fond de grille de coordonnées. L'ergonomie repose sur un balayage circulaire continu du radar et la mise en évidence des coureurs en action.

```
       +---------------------------------------------+
       |   📍 RADAR GPS   [ LIVE PELOTON ]           |
       |  +---------------------------------------+  |
       |  |       . . . . . \ . . . . .           |  |
       |  |     . . . . . .  \  . . . . .         |  |
       |  |    . . (COUREUR)  \   (INFO RUN)      |  |
       |  |   . . . 🟢 . . . . \ . . . . .        |  |
       |  |  . . . . . . . . .  \  . . . . .      |  |
       |  |  --------------------+-----------------   |
       |  |  . . . . . . . . .  /  . . . . .      |  |
       |  |   . . . . . . . .  /  . . . . .       |  |
       |  |    . . . . . . .  /   🔴 TRACÉ GPX    |  |
       |  |      . . . . . . /  . . . . .         |  |
       |  |        . . . .  / . . . .             |  |
       |  +---------------------------------------+  |
       |  📊 ALLURE MOYENNE : 4'32"/km | COUREURS : 42 |
       +---------------------------------------------+
```

#### B. Structure HTML & Classes Tailwind
```html
<div class="relative w-full max-w-md aspect-square bg-[#08080C] border border-white/[0.08] rounded-[32px] overflow-hidden p-6 shadow-2xl flex flex-col justify-between group">
  
  <!-- Grille technologique en tâche de fond -->
  <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]"></div>
  
  <!-- Titre Technique -->
  <div class="relative z-10 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-[#FF2A54] animate-ping"></span>
      <span class="font-mono text-xs uppercase tracking-widest text-[#FF2A54] font-bold">RADAR ACTIF</span>
    </div>
    <span class="font-mono text-[10px] text-[#A3A8B8]">FREQ: 10Hz // GPX: OK</span>
  </div>

  <!-- Le Radar Vectoriel SVG -->
  <div class="relative w-full h-64 my-auto flex items-center justify-center">
    <!-- Cercles Concentriques de Sécurité en SVG -->
    <svg class="absolute w-60 h-60 text-white/[0.04]" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="1" fill="none" stroke-dasharray="4 4"/>
      <circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="1" fill="none" />
      <circle cx="100" cy="100" r="30" stroke="currentColor" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
      <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" stroke-width="0.5"/>
      <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" stroke-width="0.5"/>
    </svg>

    <!-- Faisceau Rotatif du Radar (CSS animation) -->
    <div class="absolute w-60 h-60 rounded-full overflow-hidden pointer-events-none">
      <div class="w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-[#FF2A54]/0 to-[#FF2A54]/15 origin-bottom-right absolute top-0 left-0 animate-[spin_6s_linear_infinite]"></div>
    </div>

    <!-- Le Tracé GPX Actif (SVG Path Rouge Néon) -->
    <svg class="absolute w-52 h-52 text-[#FF2A54]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Tracé principal avec lueur néon -->
      <path id="gpx-route" d="M20 80C30 75 25 50 45 45C65 40 55 20 80 15C90 40 75 60 70 85C60 90 30 85 20 80Z" 
            stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
            class="drop-shadow-[0_0_8px_rgba(255,42,84,0.8)]" />
      
      <!-- Point du Peloton en mouvement -->
      <circle r="4" fill="#00FF66" class="drop-shadow-[0_0_6px_rgba(0,255,102,1)]">
        <animateMotion dur="10s" repeatCount="indefinite" path="M20 80C30 75 25 50 45 45C65 40 55 20 80 15C90 40 75 60 70 85C60 90 30 85 20 80Z" />
      </circle>
    </svg>

    <!-- Bulle de Données Collective (Hover Target) -->
    <div class="absolute top-4 right-10 bg-[#12131C] border border-white/10 rounded-lg p-2 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:border-[#FF2A54]/50">
      <p class="font-mono text-[9px] text-[#A3A8B8] leading-none">ALLURE MEUTE</p>
      <p class="font-sans font-bold text-xs text-white">4:32 min/km</p>
    </div>
    
    <div class="absolute bottom-6 left-8 bg-[#12131C] border border-white/10 rounded-lg p-2 shadow-xl backdrop-blur-md">
      <p class="font-mono text-[9px] text-[#A3A8B8] leading-none">DÉNIVELÉ</p>
      <p class="font-sans font-bold text-xs text-white">+180m</p>
    </div>
  </div>

  <!-- Barre Technique Inférieure -->
  <div class="relative z-10 flex items-center justify-between border-t border-white/[0.08] pt-4 font-mono text-[10px] text-[#A3A8B8]">
    <span>PELOTON : 42 COUREURS</span>
    <span class="text-[#00FF66] font-bold">100% SÉCURISÉ</span>
  </div>
</div>
```

#### C. Interactivité & Animations
1.  **Balayage Radar** : L'animation du faisceau (`animate-[spin_6s_linear_infinite]`) simule le rafraîchissement d'un vrai radar.
2.  **Particule du Peloton Animée (SVG animateMotion)** : Le point vert fluo suit de façon fluide et autonome le tracé GPX exact défini dans la balise `<path>`. 
3.  **Survol** : Lors du survol du conteneur global, les deux bulles de métriques affichent une micro-déviation de valeur (effet de mise à jour en direct).

---

### MOCKUP 3 : Le Simulateur WhatsApp (WhatsApp Automation)
*Situé en Section 3 : "Le Moteur" (Pilier 2) & Hero Section*

#### A. Concept Visuel & Ergonomie
Cette maquette représente un écran d'iPhone minimaliste simulant une conversation WhatsApp. L'utilisateur découvre comment CAPTEN automatise la gestion logistique du run club. En bas du chat, un bouton interactif `[Participer au Run]` invite à l'action.

```
       +---------------------------------------------+
       |   [O]  BOT CAPTEN            (En ligne)     |
       |  +---------------------------------------+  |
       |  |                                       |  |
       |  |  +---------------------------------+  |  |
       |  |  | 🏃‍♂️ PELOTON A - JEUDI 19H00      |  |  |
       |  |  | 📍 Départ : Bastille            |  |  |
       |  |  | 🗺️ GPX : https://cptn.run/10k   |  |  |
       |  |  | 🛡️ Décharge requise pour courir  |  |  |
       |  |  |                                 |  |  |
       |  |  | Inscrits : 41 coureurs          |  |  |
       |  |  +---------------------------------+  |  |
       |  |                                       |  |
       |  |          [ 🏃‍♂️ PARTICIPER ]            |  |
       |  |                                       |  |
       |  |  +---------------------------------+  |  |
       |  |  | (USER CLICKS IN SIMULATOR)     |  |  |
       |  |  | 🏃‍♂️ Je participe au run !       |  |  |
       |  |  +---------------------------------+  |  |
       |  |                                       |  |
       |  +---------------------------------------+  |
       +---------------------------------------------+
```

#### B. Structure HTML & Classes Tailwind
```html
<div class="w-full max-w-sm bg-[#0B0C10] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-2xl p-4 flex flex-col justify-between aspect-[9/16]">
  
  <!-- En-tête de la conversation -->
  <div class="flex items-center gap-3 border-b border-white/[0.08] pb-3">
    <!-- Avatar CAPTEN Bot -->
    <div class="w-10 h-10 rounded-full bg-capten-orange flex items-center justify-center text-white font-black text-sm">
      C
    </div>
    <div>
      <h4 class="text-sm font-bold text-white leading-none">CAPTEN Bot</h4>
      <span class="text-[10px] text-[#00FF66] font-mono">En ligne & connecté</span>
    </div>
  </div>

  <!-- Zone de Discussion (Messages) -->
  <div class="flex-grow my-4 space-y-4 overflow-y-auto flex flex-col justify-end">
    
    <!-- Message 1 : Le Bot CAPTEN annonce le run -->
    <div class="self-start max-w-[85%] bg-[#12131C] border border-white/[0.06] rounded-[20px] rounded-tl-none p-4 text-xs text-[#A3A8B8] space-y-2">
      <p class="font-bold text-white">🏃‍♂️ RUN HEBDOMADAIRE — PELOTON A</p>
      <p>⚠️ Départ ce soir à <span class="text-white font-bold">19h00 précises</span> à Bastille.</p>
      <p>📍 Tracé de 10.5 km validé par le capitaine.</p>
      <div class="p-2 bg-white/5 rounded-lg border border-white/[0.04] flex items-center justify-between mt-2">
        <span class="font-mono text-[9px]">BASTILLE_LOOP.gpx</span>
        <span class="text-[#CCFF00] font-bold hover:underline cursor-pointer">Télécharger</span>
      </div>
      <p class="text-[10px] text-[#A3A8B8]/60 mt-1 block text-right font-mono">11:15 ✓✓</p>
    </div>

    <!-- Message 2 : Le Bot demande les décharges -->
    <div class="self-start max-w-[85%] bg-[#12131C] border border-white/[0.06] rounded-[20px] rounded-tl-none p-4 text-xs text-[#A3A8B8] space-y-2">
      <p>🛡️ <span class="text-[#FF2A54] font-bold">Responsabilité légale</span> : Tout membre doit avoir signé sa décharge électronique (Waiver Express) avant le départ.</p>
      <p class="text-[10px] text-[#00FF66] font-mono font-bold">✓ 41/42 coureurs en règle.</p>
    </div>

    <!-- Message 3 : Réponse simulée de l'utilisateur après interaction (Cliquable) -->
    <div id="sim-response" class="self-end max-w-[80%] bg-[#FF5C00] text-white rounded-[20px] rounded-tr-none p-3 text-xs shadow-lg hidden animate-[slideIn_0.3s_ease-out]">
      <p class="font-bold">🏃‍♂️ Je participe au Run !</p>
      <p class="text-[9px] text-white/80 mt-1 block text-right font-mono">11:18 ✓✓</p>
    </div>

    <!-- Message 4: Confirmation instantanée du Bot (Cliquable) -->
    <div id="sim-bot-reply" class="self-start max-w-[85%] bg-[#12131C] border border-white/[0.06] rounded-[20px] rounded-tl-none p-4 text-xs text-[#A3A8B8] space-y-1 hidden animate-[slideIn_0.3s_ease-out_0.5s_forwards]">
      <p>⚡ <span class="text-[#00FF66] font-bold">Participation validée !</span></p>
      <p>Vous êtes inscrit en position #42. Votre décharge est déjà associée (FaceID OK).</p>
    </div>

  </div>

  <!-- Barre d'Action Interactive (Le Bouton) -->
  <div id="sim-cta-container" class="pt-2 border-t border-white/[0.08] flex justify-center">
    <button id="sim-btn-participate" class="w-full bg-[#CCFF00] hover:bg-[#b5e000] text-black font-sans font-bold text-xs uppercase py-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(204,255,0,0.3)]">
      Confirmer ma participation sur WhatsApp
    </button>
  </div>

</div>
```

#### C. Interactivité & Animations
Pour donner vie à la maquette, le développeur utilisera ce script simple (ou son équivalent React State) pour déclencher la simulation de messagerie :
1.  **Déclenchement au clic** : Lorsque l'utilisateur clique sur le bouton `Confirmer ma participation sur WhatsApp` :
    *   Le bouton se désactive, affiche un état "Envoi..." puis disparaît ou se transforme.
    *   Le message de réponse de l'utilisateur (`#sim-response`) passe de `hidden` à `block` avec une transition d'apparition par le bas.
    *   Une seconde plus tard, le message de confirmation automatique du bot (`#sim-bot-reply`) apparaît pour démontrer la vitesse d'exécution de l'automation.
2.  **Animation CSS requise (Tailwind config/style)** :
    ```css
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    ```

---

### MOCKUP 4 : La Caisse Translucide Stripe Connect
*Situé en Section 3 : "Le Moteur" (Pilier 3)*

#### A. Concept Visuel & Ergonomie
Ce mockup présente le flux de transfert financier instantané sans frais cachés. Il combine une carte bancaire translucide premium (glassmorphism avec logo Stripe) et un schéma vectoriel animé qui illustre le circuit de l'argent : le paiement va directement du coureur à la banque du club sans commission tierce (0% prélevé par CAPTEN).

```
   [ Coureur ] ===== (Paiement) =====> [ STRIPE ] ===== (100% Net) =====> [ Banque du Club ]
                                          |
                                          x-- [ Commission CAPTEN (0%) ]
```

#### B. Structure HTML & Classes Tailwind
```html
<div class="w-full max-w-md bg-[#0B0C10] border border-white/[0.08] rounded-[32px] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6 group">
  
  <!-- Titre -->
  <div class="flex items-center justify-between">
    <span class="font-mono text-xs text-[#A3A8B8] uppercase tracking-widest">TRANSACTION DIRECTE</span>
    <span class="text-[10px] bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 px-2 py-0.5 rounded font-mono font-bold">100% STRIPE CONNECT</span>
  </div>

  <!-- Carte Bancaire Holographique Interactive -->
  <div class="relative w-full aspect-[1.586/1] rounded-[20px] bg-gradient-to-br from-white/10 via-white/[0.03] to-white/5 border border-white/[0.15] p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-500 group-hover:rotate-1 group-hover:scale-[1.02]">
    
    <!-- Puce de carte et logo Stripe en SVG -->
    <div class="flex justify-between items-start">
      <!-- Puce de carte dorée technique -->
      <div class="w-10 h-8 bg-gradient-to-r from-yellow-600/30 to-yellow-500/10 border border-yellow-500/20 rounded-md"></div>
      <!-- Logo Stripe Minimaliste Blanc -->
      <svg class="h-6 text-white" viewBox="0 0 100 42" fill="currentColor">
        <path d="M41 23c0-3.5-2.5-5.5-6-5.5-3 0-5.5 2-5.5 5.5 0 4.5 6 3.5 6 5.5 0 .8-.8 1.2-1.5 1.2-1.5 0-3-1-3-1l-2 3.5s2.5 1.5 5 1.5c4 0 6.5-2 6.5-5.8zm-15.5 6V18h-4.5v11zm-4.5-15h4.5v-4.5H21zm10.5 4.5v-3.5h-4.5v3.5h-2v3.5h2v6.5c0 3.2 2 4.5 5 4.5h2v-3.5h-1c-1 0-1.5-.5-1.5-1.5v-6h2.5z"/>
      </svg>
    </div>

    <!-- Numéro et Nom du Club -->
    <div>
      <p class="font-mono text-sm text-white tracking-widest">••••  ••••  ••••  2026</p>
      <div class="flex justify-between items-end mt-2">
        <div>
          <p class="text-[9px] text-[#A3A8B8] uppercase">TITULAIRE DE COMPTE</p>
          <p class="text-xs font-bold text-white tracking-tight">BASTILLE RUNNING CREW</p>
        </div>
        <div class="text-right">
          <p class="text-[9px] text-[#A3A8B8] uppercase">COMMISSION</p>
          <p class="text-sm font-black text-[#CCFF00] tracking-tight">0.00 %</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Le Schéma Vectoriel Dynamique (Flux Financier) -->
  <div class="bg-white/[0.03] border border-white/[0.04] rounded-2xl p-4 flex flex-col gap-3">
    <div class="flex justify-between items-center text-xs">
      <span class="text-[#A3A8B8]">Paiement Membre</span>
      <span class="text-[#00FF66] font-mono font-bold">100 €</span>
    </div>
    
    <!-- Chemin de transfert SVG avec particule de virement -->
    <div class="relative w-full h-8 flex items-center">
      <svg class="w-full h-2 text-white/10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Ligne de flux principale -->
        <line x1="0" y1="4" x2="100%" y2="4" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
        <!-- Particule lumineuse animée de gauche à droite -->
        <circle cx="0" cy="4" r="3" fill="#CCFF00" class="drop-shadow-[0_0_6px_rgba(204,255,0,1)]">
          <animate attributeName="cx" from="0%" to="100%" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>

    <div class="flex justify-between items-center text-xs border-t border-white/[0.04] pt-2">
      <span class="text-[#A3A8B8]">Versé sur votre compte Pro</span>
      <span class="text-[#CCFF00] font-bold font-mono">100 € (Net)</span>
    </div>
  </div>
</div>
```

#### C. Interactivité & Animations
1.  **Effet Tilt 3D au Survol** : Le développeur utilisera une bibliothèque comme `vanilla-tilt.js` ou codera un effet simple en CSS/JS pour faire pivoter légèrement la carte de crédit translucide sous le pointeur de l'utilisateur, ce qui augmente le réalisme et le côté "premium" de l'élément de caisse.
2.  **Particule de Transaction Permanente** : La particule lumineuse jaune néon se déplaçant le long de la ligne illustre de manière évidente le transfert en ligne sans friction ni interruption.

---

## ⚡ 6. Synthèse d'Intégration pour le Développeur

Pour finaliser l'implémentation au pixel près, suivez cette check-list :
1.  **Activer le mode sombre** (`dark`) globalement et forcer le fond de page à `#08080C`.
2.  **Importer les polices** Inter et DM Mono. Configurer l'italique et les graisses 900 pour la classe `font-display`.
3.  **Implémenter la Bento Grid** avec des espacements larges (`gap-6` ou `gap-8`) et des cartes ayant des coins très ronds (`rounded-[32px]`).
4.  **Assurer le responsive** : toutes les maquettes SVG et le simulateur WhatsApp doivent être fluides (`w-full` et `max-w-*` bien définis pour éviter les cassures d'affichage sur mobile).
5.  **Utiliser l'animation matérielle** (GPU-accelerated) pour les rotations et les pulsations afin de garantir 60fps sur tous les terminaux mobiles.
