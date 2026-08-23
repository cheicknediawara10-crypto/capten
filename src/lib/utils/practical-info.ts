/**
 * Helper to encode and parse practical run information:
 * - Bag Drop (Consigne sacs)
 * - Pace & Distance (Allure prévue)
 * - After-run (Verre / QG d'après-run)
 */

export interface PracticalInfo {
  bagDrop?: string | null;
  pace?: string | null;
  sweeper?: string | null;
  afterRun?: string | null;
  textDescription?: string | null;
}

const BAG_TAG = "🎒 Consigne :";
const PACE_TAG = "⚡ Allure :";
const SWEEPER_TAG = "🛡️ Serre-file :";
const AFTER_TAG = "🍻 After-run :";

export function formatPracticalDescription(
  description: string | null | undefined,
  info: { bagDrop?: string | null; pace?: string | null; sweeper?: string | null; afterRun?: string | null }
): string {
  const parts: string[] = [];
  const cleanDesc = (description || "").trim();
  if (cleanDesc) parts.push(cleanDesc);

  const tags: string[] = [];
  if (info.bagDrop?.trim()) tags.push(`${BAG_TAG} ${info.bagDrop.trim()}`);
  if (info.pace?.trim()) tags.push(`${PACE_TAG} ${info.pace.trim()}`);
  if (info.sweeper?.trim()) tags.push(`${SWEEPER_TAG} ${info.sweeper.trim()}`);
  if (info.afterRun?.trim()) tags.push(`${AFTER_TAG} ${info.afterRun.trim()}`);

  if (tags.length > 0) {
    if (parts.length > 0) parts.push("\n");
    parts.push(`---\n${tags.join("\n")}`);
  }

  return parts.join("\n");
}

export function parsePracticalInfo(description: string | null | undefined): PracticalInfo {
  if (!description) {
    return { bagDrop: null, pace: null, sweeper: null, afterRun: null, textDescription: null };
  }

  const lines = description.split("\n");
  let bagDrop: string | null = null;
  let pace: string | null = null;
  let sweeper: string | null = null;
  let afterRun: string | null = null;
  const descLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(BAG_TAG)) {
      bagDrop = trimmed.replace(BAG_TAG, "").trim();
    } else if (trimmed.startsWith(PACE_TAG)) {
      pace = trimmed.replace(PACE_TAG, "").trim();
    } else if (trimmed.startsWith(SWEEPER_TAG)) {
      sweeper = trimmed.replace(SWEEPER_TAG, "").trim();
    } else if (trimmed.startsWith(AFTER_TAG)) {
      afterRun = trimmed.replace(AFTER_TAG, "").trim();
    } else if (trimmed === "---") {
      // separator, skip
    } else {
      descLines.push(line);
    }
  }

  return {
    bagDrop,
    pace,
    sweeper,
    afterRun,
    textDescription: descLines.join("\n").trim() || null,
  };
}
