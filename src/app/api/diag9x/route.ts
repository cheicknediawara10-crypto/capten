import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

// Sonde TEMPORAIRE. Teste l'envoi Resend avec l'environnement de PRODUCTION.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("k") !== "captendiag2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const to = url.searchParams.get("to") || "cheicknediawara10@gmail.com";
  const rawKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "CAPTEN <noreply@capten.app>";
  const out: any = {
    hasKey: !!rawKey,
    keyLen: rawKey?.length ?? 0,
    keyHash: rawKey ? createHash("sha256").update(rawKey).digest("hex").slice(0, 12) : null,
    keyPrefix: rawKey ? rawKey.slice(0, 3) : null,
    from,
  };

  if (!rawKey) {
    out.sent = false;
    out.reason = "RESEND_API_KEY absente/vide en production.";
    return NextResponse.json(out);
  }

  try {
    const resend = new Resend(rawKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Test PROD CAPTEN",
      html: "<p>Test production ✅</p>",
    });
    out.sent = !error;
    out.resendId = data?.id ?? null;
    out.resendError = error ?? null;
  } catch (e: any) {
    out.sent = false;
    out.exception = e?.message ?? String(e);
  }
  return NextResponse.json(out);
}
