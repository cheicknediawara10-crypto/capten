import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// SÉCURITÉ : jamais de secret par défaut en production. Sans MEMBRE_SESSION_SECRET
// (ou HMAC_SECRET), un attaquant pourrait forger le cookie de session de N'IMPORTE
// quel membre (usurpation totale). En prod on échoue donc « fail-closed ».
const RAW_SECRET = process.env.MEMBRE_SESSION_SECRET ?? process.env.HMAC_SECRET ?? null;
const IS_PROD = process.env.NODE_ENV === "production";
// Fallback UNIQUEMENT hors production (dev/tests locaux).
const SECRET = RAW_SECRET ?? "capten-membre-dev-secret-DEV-ONLY";

export const COOKIE_NAME = "capten_membre";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export function signSession(membreId: string): string {
  if (IS_PROD && !RAW_SECRET) {
    throw new Error("[membre-session] MEMBRE_SESSION_SECRET manquant en production — refus de signer.");
  }
  const ts = Date.now().toString();
  const payload = `${membreId}.${ts}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySession(token: string): string | null {
  // Fail-closed : en prod sans secret dédié, aucune session n'est acceptée.
  if (IS_PROD && !RAW_SECRET) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = raw.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = raw.slice(0, lastDot);
    const sig = raw.slice(lastDot + 1);
    const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    if (diff !== 0) return null;
    // Expiration côté serveur : le timestamp signé n'est plus décoratif — un
    // cookie volé/copié n'est plus rejouable indéfiniment (fenêtre = MAX_AGE).
    const parts = payload.split(".");
    const membreId = parts[0] ?? null;
    const ts = Number(parts[1]);
    if (!membreId) return null;
    if (!Number.isFinite(ts) || Date.now() - ts > MAX_AGE * 1000) return null;
    return membreId;
  } catch {
    return null;
  }
}

export async function getMembreSession(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireMembreSession(): Promise<string> {
  const id = await getMembreSession();
  if (!id) redirect("/mon-espace");
  return id;
}

export async function setMembreCookie(membreId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, signSession(membreId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearMembreCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { MAX_AGE };
