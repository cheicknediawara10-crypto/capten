// ─── Générateur de visuels partageables (Story Instagram 1080×1920) ──────────
// V2 — après revue du panel design. Héros en display (Anton), layout ancré
// bas-gauche, métriques en ligne, overlay léger + scrim bas + grain filmique,
// CTA orange en pastille, affiche (transactionnel) ≠ story (émotionnel).
// 100% côté client (canvas). Zéro serveur, zéro API externe, zéro tracking.

export type VisualType = "affiche" | "story";

export interface CrewVisualData {
  type: VisualType;
  photo?: HTMLImageElement | null;
  crewName: string;
  crewLogo?: HTMLImageElement | null;
  slug?: string | null;
  runTitle?: string;
  dayTime?: string; // "Jeudi 19h"
  location?: string | null;
  distanceKm?: number | null;
  presentCount?: number;
  runDateLabel?: string; // "15 août"
}

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;
const ORANGE = "#FF5500";
const M = 84; // marge gauche
const WHITE = "#FFFFFF";
const GREY = "rgba(255,255,255,0.55)";

function fontStack(cssVar: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    const v = getComputedStyle(document.body).getPropertyValue(cssVar).trim();
    return v ? `${v}, ${fallback}` : fallback;
  } catch {
    return fallback;
  }
}

async function ensureFonts(anton: string, sans: string) {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await document.fonts.ready;
    await Promise.all([
      document.fonts.load(`260px ${anton}`).catch(() => {}),
      document.fonts.load(`700 48px ${sans}`).catch(() => {}),
      document.fonts.load(`600 32px ${sans}`).catch(() => {}),
    ]);
  } catch {
    /* on dessine quand même */
  }
}

function initials(name: string): string {
  return (name || "CR")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ls(ctx: CanvasRenderingContext2D, px: number) {
  try {
    (ctx as any).letterSpacing = `${px}px`;
  } catch {
    /* cosmétique */
  }
}

// object-fit: cover avec object-position paramétrable.
// posY < 0.5 = biais vers le HAUT de la photo (garde les visages/bustes, situés
// dans la moitié haute sur 90% des photos de running).
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  posX = 0.5,
  posY = 0.5
) {
  const ir = img.width / img.height;
  const cr = w / h;
  let dw: number, dh: number;
  if (ir > cr) {
    dh = h;
    dw = h * ir;
  } else {
    dw = w;
    dh = w / ir;
  }
  ctx.drawImage(img, x + (w - dw) * posX, y + (h - dh) * posY, dw, dh);
}

// Grain filmique (overlay multiply léger) — le petit truc qui fait "pro".
function addGrain(ctx: CanvasRenderingContext2D) {
  try {
    const tile = document.createElement("canvas");
    tile.width = tile.height = 160;
    const tctx = tile.getContext("2d");
    if (!tctx) return;
    const id = tctx.createImageData(160, 160);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = 90 + Math.random() * 120;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 255;
    }
    tctx.putImageData(id, 0, 0);
    const pat = ctx.createPattern(tile, "repeat");
    if (!pat) return;
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.restore();
  } catch {
    /* pas de grain, pas grave */
  }
}

// Lockup crew en haut-gauche (logo + nom, discret).
function drawLockup(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null | undefined,
  crewName: string,
  sans: string
) {
  const size = 64;
  const x = M;
  const y = 84;
  const cy = y + size / 2;
  if (logo && logo.width) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, cy, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    drawCover(ctx, logo, x, y, size, size);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.arc(x + size / 2, cy, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = ORANGE;
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.round(size * 0.38)}px ${sans}`;
    ctx.fillText(initials(crewName), x + size / 2, cy + 1);
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `700 30px ${sans}`;
  ls(ctx, 2);
  ctx.fillStyle = WHITE;
  ctx.fillText(crewName.toUpperCase(), x + size + 22, cy + 1);
  ls(ctx, 0);
}

// Word-wrap + shrink pour tenir en maxLines. Retourne {lines, size}.
function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  maxW: number,
  maxLines: number,
  base: number,
  min: number
): { lines: string[]; size: number } {
  let size = base;
  while (size >= min) {
    ctx.font = `${size}px ${family}`;
    const words = text.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(t).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = t;
      }
    }
    if (cur) lines.push(cur);
    if (lines.length <= maxLines) return { lines, size };
    size -= 8;
  }
  return { lines: [text], size: min };
}

// Colonne métrique : petit label espacé au-dessus, valeur bold en dessous.
function metricCol(
  ctx: CanvasRenderingContext2D,
  sans: string,
  x: number,
  y: number,
  label: string,
  value: string
): number {
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `600 24px ${sans}`;
  ls(ctx, 4);
  ctx.fillStyle = GREY;
  ctx.fillText(label.toUpperCase(), x, y);
  ls(ctx, 0);
  ctx.font = `700 48px ${sans}`;
  ctx.fillStyle = WHITE;
  ctx.fillText(value, x, y + 34);
  return ctx.measureText(value).width;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if ((ctx as any).roundRect) {
    ctx.beginPath();
    (ctx as any).roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// CTA pastille orange pleine.
function drawPill(ctx: CanvasRenderingContext2D, sans: string, x: number, y: number, text: string): number {
  const h = 88;
  const padX = 44;
  ctx.font = `700 30px ${sans}`;
  ls(ctx, 2);
  const w = ctx.measureText(text).width + padX * 2;
  ctx.fillStyle = ORANGE;
  roundRectPath(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + padX, y + h / 2 + 1);
  ls(ctx, 0);
  ctx.textBaseline = "top";
  return h;
}

function drawCaptenMark(ctx: CanvasRenderingContext2D, anton: string) {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `italic 32px ${anton}`;
  ctx.fillText("CAPTEN", M, CANVAS_H - 76);
}

export async function renderCrewVisual(canvas: HTMLCanvasElement, d: CrewVisualData): Promise<void> {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const anton = fontStack("--font-barlow", "Anton");
  const sans = fontStack("--font-dm-sans", "sans-serif");
  await ensureFonts(anton, sans);
  const maxW = CANVAS_W - M * 2;

  // ── Fond ──
  if (d.photo && d.photo.width) {
    drawCover(ctx, d.photo, 0, 0, CANVAS_W, CANVAS_H, 0.5, 0.28);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    g.addColorStop(0, "#0A0A0A");
    g.addColorStop(1, "#1C1C1C");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
  // Overlay unifiant léger (laisse vivre la photo en haut)
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Scrim bas FORT — couvre les ~45% inférieurs. Garantit texte blanc + orange
  // 100% lisibles même sur photo plein soleil / bitume blanc / ciel de midi.
  const bs = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bs.addColorStop(0, "rgba(0,0,0,0)");
  bs.addColorStop(0.38, "rgba(0,0,0,0.06)");
  bs.addColorStop(0.56, "rgba(0,0,0,0.62)");
  bs.addColorStop(0.74, "rgba(0,0,0,0.86)");
  bs.addColorStop(1, "rgba(0,0,0,0.96)");
  ctx.fillStyle = bs;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Scrim haut léger (pour le lockup)
  const ts = ctx.createLinearGradient(0, 0, 0, CANVAS_H * 0.2);
  ts.addColorStop(0, "rgba(0,0,0,0.55)");
  ts.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ts;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Grain filmique
  addGrain(ctx);

  drawLockup(ctx, d.crewLogo, d.crewName, sans);

  if (d.type === "affiche") {
    let y = 940;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Kicker orange
    ctx.font = `700 32px ${sans}`;
    ls(ctx, 6);
    ctx.fillStyle = ORANGE;
    ctx.fillText("PROCHAIN RUN", M, y);
    ls(ctx, 0);
    y += 56;

    // Héros : titre du run (Anton, jusqu'à 2 lignes)
    const { lines, size } = fitLines(ctx, d.runTitle || "", anton, maxW, 2, 150, 82);
    ctx.fillStyle = WHITE;
    for (const line of lines) {
      ctx.font = `${size}px ${anton}`;
      ctx.fillText(line, M, y);
      y += size * 1.0;
    }
    y += 44;

    // Métriques en ligne
    metricCol(ctx, sans, M, y, "Quand", d.dayTime || "—");
    if (d.distanceKm != null) metricCol(ctx, sans, M + 380, y, "Distance", `${d.distanceKm} km`);
    y += 108;

    if (d.location) {
      ctx.font = `500 34px ${sans}`;
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      const loc = fitLines(ctx, `📍 ${d.location}`, sans, maxW, 1, 34, 26);
      ctx.font = `500 ${loc.size}px ${sans}`;
      ctx.fillText(loc.lines[0], M, y);
      y += 68;
    }

    // CTA pastille + adresse (le fondateur pose un sticker lien par-dessus)
    y += 12;
    drawPill(ctx, sans, M, y, "REJOINS LE CREW →");
    y += 88 + 18;
    if (d.slug) {
      ctx.font = `500 30px ${sans}`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`capten.app/join/${d.slug}`, M, y);
    }
  } else {
    // ── STORY : émotionnel, le chiffre domine, ancré bas-gauche ──
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    let y = 860;

    ctx.font = `700 32px ${sans}`;
    ls(ctx, 6);
    ctx.fillStyle = ORANGE;
    ctx.fillText("CE SOIR, ON ÉTAIT", M, y);
    ls(ctx, 0);
    y += 78;

    // Chiffre géant (Anton)
    const num = String(d.presentCount ?? 0);
    ctx.font = `300px ${anton}`;
    ctx.fillStyle = WHITE;
    ctx.fillText(num, M - 6, y);
    // "coureurs" sous le chiffre
    y += 250;
    ctx.font = `700 60px ${sans}`;
    ctx.fillStyle = WHITE;
    ctx.fillText("coureurs 🖤", M, y);
    y += 96;

    // Métriques (distance + date) en ligne
    let mx = M;
    if (d.distanceKm != null) {
      metricCol(ctx, sans, mx, y, "Distance", `${d.distanceKm} km`);
      mx += 340;
    }
    if (d.runDateLabel) metricCol(ctx, sans, mx, y, "Date", d.runDateLabel);
    y += 116;

    // Invitation (convertit la FOMO)
    ctx.font = `700 40px ${sans}`;
    ctx.fillStyle = ORANGE;
    const inv = fitLines(ctx, "Tu cours avec nous la prochaine fois ?", sans, maxW, 2, 40, 30);
    for (const line of inv.lines) {
      ctx.font = `700 ${inv.size}px ${sans}`;
      ctx.fillText(line, M, y);
      y += inv.size * 1.15;
    }
  }

  drawCaptenMark(ctx, anton);
}

export function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
