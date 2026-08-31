import fs from 'fs';
import path from 'path';

// Motifs interdits — la fausse promesse « gratuit sous 25 actifs / facturation par
// membre actif » (la facturation réelle est un forfait fixe : payant OU essai 14j,
// jamais indexée sur le nombre de coureurs). Ciblés pour ne PAS toucher la phrase
// légitime « membres actifs » (login, Copilote, stats).
const FORBIDDEN_PATTERNS = [
  /(sous|moins de|plus de|<|>)\s*25\s*(coureurs?\s*)?actifs?/i, // (sous|moins de|plus de|<|>) 25 actifs
  /25\s*(coureurs?\s*)?actifs?\s*→/i,                            // 25 actifs →
  /→\s*gratuit/i,                                                // → GRATUIT
  /plan\s+(actuel\s*:?\s*)?gratuit\s*\(?\s*0\s*€/i,              // Plan (Actuel :) Gratuit (0€)
  /repasse\s+automatiquement\s+à\s+0/i,                          // repasse auto à 0
  /ne\s+paies?\s+(jamais|rien)/i,                                // tu ne paies jamais / rien
  /tarification\s+par\s+(membre|coureur)/i,                      // tarification par membre actif
  /anti[-\s]?saison/i,                                           // anti-saison(nière)
];

const SCAN_DIR = path.resolve(process.cwd(), 'src');
let hasError = false;

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(fullPath);
    } else if (entry.isFile() && /\.(tsx?|jsx?|md)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('// Guardrail:') || line.includes('/* Guardrail:')) return;
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(line)) {
            console.error(`❌ REGRESSION DETECTED in ${path.relative(process.cwd(), fullPath)}:${idx + 1}`);
            console.error(`   "${line.trim()}" matched ${pattern}`);
            hasError = true;
          }
        }
      });
    }
  }
}

console.log('🔍 Checking for stale pricing claims...');
scan(SCAN_DIR);

if (hasError) {
  console.error('\n🚨 Build failed: Stale/misleading pricing claims detected in src/');
  process.exit(1);
} else {
  console.log('✅ Zero stale pricing claims found. Pricing copy is 100% clean.');
}
