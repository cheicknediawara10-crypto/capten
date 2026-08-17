import { resend } from "@/lib/resend";

const FROM = "CAPTEN <noreply@capten.io>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://capten.app";

export interface BriefAlert {
  title: string;
  message: string;
  cta_label?: string | null;
  cta_href?: string | null;
}

// Brief email du Copilote : les 3 alertes prioritaires du crew (quotidien/hebdo).
export async function sendCopiloteBriefEmail(
  to: string,
  crewName: string,
  alerts: BriefAlert[],
  freq: "quotidien" | "hebdo"
): Promise<boolean> {
  if (!resend || !to || alerts.length === 0) return false;
  const periode = freq === "hebdo" ? "de la semaine" : "du jour";

  const items = alerts
    .map((a) => {
      const cta = a.cta_href
        ? `<div style="margin-top:6px;"><a href="${SITE}${a.cta_href}" style="color:#ff5c00;font-size:13px;font-weight:700;text-decoration:none;">${a.cta_label || "Ouvrir"} →</a></div>`
        : "";
      return `<div style="padding:14px 16px;background:#faf9f5;border:1px solid #ecece4;border-radius:14px;margin-bottom:10px;">
        <div style="color:#1a1918;font-size:14px;font-weight:700;">${a.title}</div>
        <div style="color:#6b6a6a;font-size:13px;line-height:1.45;margin-top:2px;">${a.message}</div>
        ${cta}
      </div>`;
    })
    .join("");

  const html = `
  <div style="margin:0;padding:0;background:#f4f4ee;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ecece4;">
        <div style="background:#0b0b0a;padding:26px 28px 20px;">
          <div style="color:#8e8a82;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">🧭 Ton Copilote — ${crewName}</div>
          <div style="color:#ffffff;font-size:24px;font-weight:800;font-style:italic;text-transform:uppercase;margin-top:6px;line-height:1.1;">Ton brief ${periode}</div>
        </div>
        <div style="padding:24px 28px;">
          <p style="color:#1a1918;font-size:14px;line-height:1.5;margin:0 0 16px;">Voilà ce qui mérite ton attention :</p>
          ${items}
          <a href="${SITE}/dashboard" style="display:inline-block;margin-top:8px;background:#ff5c00;color:#ffffff;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;text-decoration:none;padding:12px 22px;border-radius:12px;">Ouvrir mon tableau de bord</a>
        </div>
      </div>
      <p style="color:#9c9c94;font-size:11px;text-align:center;margin:16px 0 0;">Tu peux régler la fréquence (quotidien / hebdo / jamais) dans tes réglages.</p>
    </div>
  </div>`;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: "info.captenfr@gmail.com",
      subject: `🧭 Ton brief Copilote — ${alerts.length} chose${alerts.length > 1 ? "s" : ""} à voir`,
      html,
    });
    return true;
  } catch (e) {
    console.error("brief email send error", e);
    return false;
  }
}
