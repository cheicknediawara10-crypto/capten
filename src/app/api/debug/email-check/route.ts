import { NextResponse } from "next/server";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// Diagnostic réservé au fondateur connecté : révèle POURQUOI les e-mails ne
// partent pas (clé absente, domaine non vérifié…). Ne divulgue jamais la clé.
export async function GET(request: Request) {
  const captainId = await getAuthenticatedCaptainId();
  if (!captainId) {
    return NextResponse.json(
      { error: "Connecte-toi au dashboard, puis rouvre ce lien." },
      { status: 401 }
    );
  }

  const hasResendKey = !!process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "CAPTEN <noreply@capten.io>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://capten.app";
  const base = { hasResendKey, from, appUrl };

  const to = new URL(request.url).searchParams.get("to");
  if (!to) {
    return NextResponse.json({
      ...base,
      hint: "Ajoute ?to=ton@email.com à l'URL pour tenter un envoi de test.",
    });
  }
  if (!hasResendKey) {
    return NextResponse.json({
      ...base,
      sent: false,
      reason: "RESEND_API_KEY absente sur Vercel → aucun e-mail ne peut partir.",
    });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Test e-mail CAPTEN",
      html: "<p>Si tu reçois cet e-mail, l'envoi CAPTEN fonctionne ✅</p>",
    });
    return NextResponse.json({ ...base, sent: !error, resendData: data, resendError: error });
  } catch (e: any) {
    return NextResponse.json({ ...base, sent: false, exception: e?.message ?? String(e) });
  }
}
