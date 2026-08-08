import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET =
  process.env.MEMBRE_SESSION_SECRET ?? "capten-membre-dev-secret-change-in-prod";
export const COOKIE_NAME = "capten_membre";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function signSession(membreId: string): string {
  const ts = Date.now().toString();
  const payload = `${membreId}.${ts}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySession(token: string): string | null {
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
    return payload.split(".")[0] ?? null;
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
