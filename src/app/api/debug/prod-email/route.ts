import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

// Sonde TEMPORAIRE : teste l'envoi Resend avec l'environnement de PRODUCTION
// (clé Vercel) et renvoie l'erreur brute. Protégée par une clé jetable.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("k") !== "captendiag2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const to = url.searchParams.get("to") || "cheicknediawara10@gmail.com";
  const rawKey = process.env.RESEND_API_KEY;
  const hasKey = !!rawKey;
  const from = process.env.RESEND_FROM ?? "CAPTEN <noreply@capten.app>";
  const keyHash = rawKey ? createHash("sha256").update(rawKey).digest("hex").slice(0, 12) : null;
  const keyLen = rawKey?.length ?? 0;
  const base = { hasKey, keyHash, keyLen, from };

  if (!hasKey) {
    return NextResponse.json({ ...base, sent: false, reason: "RESEND_API_KEY absente en production." });
  }

  try {
    const resend = new Resend(rawKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Test PROD CAPTEN",
      html: "<p>Test depuis la production ✅</p>",
    });
    return NextResponse.json({ ...base, sent: !error, resendId: data?.id ?? null, resendError: error });
  } catch (e: any) {
    return NextResponse.json({ ...base, sent: false, exception: e?.message ?? String(e) });
  }
}
