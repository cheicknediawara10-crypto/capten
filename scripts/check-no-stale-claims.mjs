import fs from 'fs';
import path from 'path';

const FORBIDDEN_PATTERNS = [
  /sous\s+25\s+actifs/i,
  /repasse\s+automatiquement\s+à\s+0/i,
  /tarification\s+anti-saisonnière/i,
  /Plan\s+Gratuit\s+\(<\s*25\s+actifs\)/i,
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
