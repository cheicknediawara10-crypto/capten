import { resend } from "@/lib/resend";

const FROM = "CAPTEN <noreply@capten.io>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://capten.app";

// Email de fin d'essai (loss aversion) — envoyé 1× à J-2/J-1 de l'essai Captain Pro.
export async function sendTrialEndingEmail(
  to: string,
  crewName: string,
  daysLeft: number
): Promise<boolean> {
  if (!resend || !to) return false;
  const quand = daysLeft <= 1 ? "demain" : `dans ${daysLeft} jours`;
  const html = `
  <div style="margin:0;padding:0;background:#f4f4ee;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ecece4;">
        <div style="background:#0b0b0a;padding:28px 28px 22px;">
          <div style="color:#8e8a82;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Ton essai Captain Pro</div>
          <div style="color:#ffffff;font-size:26px;font-weight:800;font-style:italic;text-transform:uppercase;margin-top:6px;line-height:1.1;">Il se termine ${quand} ⏳</div>
        </div>
        <div style="padding:28px;">
          <p style="color:#1a1918;font-size:15px;line-height:1.55;margin:0 0 16px;">
            Salut Captain 👋<br/>
            Ton essai complet pour <strong>${crewName}</strong> touche à sa fin. Après ça, tu repasses en gratuit (le crew tourne toujours en QR Code), mais tu perds le confort du Pro :
          </p>
          <ul style="color:#1a1918;font-size:14px;line-height:1.9;margin:0 0 20px;padding-left:20px;">
            <li>📍 <strong>Check-in GPS automatique</strong> — tes coureurs valident à 150m, zéro queue au RDV</li>
            <li>🎨 <strong>Visuels du Crew</strong> — stories &amp; affiches Instagram stylées</li>
            <li>🤖 <strong>Copilote IA</strong> — tes messages WhatsApp écrits en 3 secondes</li>
            <li>📄 <strong>Export du registre</strong> horodaté (PDF/CSV)</li>
          </ul>
          <p style="color:#6b6a6a;font-size:13px;line-height:1.5;margin:0 0 24px;">
            La semaine dernière tes coureurs ont adoré le check-in auto. Garde-le pour eux 🖤
          </p>
          <a href="${SITE}/plan" style="display:inline-block;background:#ff5c00;color:#ffffff;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;text-decoration:none;padding:14px 26px;border-radius:12px;">
            Garder Captain Pro — 29,99€/mois
          </a>
        </div>
      </div>
      <p style="color:#9c9c94;font-size:11px;text-align:center;margin:18px 0 0;">CAPTEN · la plateforme des crews qui courent ensemble</p>
    </div>
  </div>`;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: "info.captenfr@gmail.com",
      subject: `⏳ Ton essai Captain Pro se termine ${quand}`,
      html,
    });
    return true;
  } catch (e) {
    console.error("trial email send error", e);
    return false;
  }
}
