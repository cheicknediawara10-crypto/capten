import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

const N = 16384;
const R = 8;
const P = 1;
const KEY_LEN = 64;

export function hashPin(pin: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, KEY_LEN, { N, r: R, p: P }).toString("hex");
  return { hash, salt };
}

export function verifyPin(pin: string, storedHash: string, salt: string): boolean {
  try {
    const input = scryptSync(pin, salt, KEY_LEN, { N, r: R, p: P });
    const stored = Buffer.from(storedHash, "hex");
    if (input.length !== stored.length) return false;
    return timingSafeEqual(input, stored);
  } catch {
    return false;
  }
}
