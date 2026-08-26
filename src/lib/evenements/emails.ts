import { resend } from "@/lib/resend";

interface EmailParams {
  to: string;
  prenom: string;
  runTitle: string;
  eventDate: string;
  lienPaiement?: string | null;
  prix?: number | null;
  devise?: string;
  confirmationUrl?: string;
}

const FROM_EMAIL = process.env.RESEND_FROM || "CAPTEN <noreply@capten.app>";

/**
 * 1. Email de confirmation de réservation (Place réservée 48h)
 */
export async function sendReservationEmail(params: EmailParams): Promise<boolean> {
  if (!resend || !params.to) return false;
  try {
    const formattedPrice = params.prix ? `${params.prix} ${params.devise || "€"}` : "Gratuit";
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Ta place pour ${params.runTitle} est réservée ! 🏃`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111111;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #FF5500;">CAPTEN</span>
          </div>
          <div style="background: #FAFAF8; border: 1px solid #EAE9E2; border-radius: 20px; padding: 28px;">
            <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #1C1B18;">
              Salut ${params.prenom} ! 🖤
            </h2>
            <p style="font-size: 15px; line-height: 1.5; color: #4B5563;">
              Ta place pour l'événement <strong>${params.runTitle}</strong> (${params.eventDate}) est <strong>réservée pendant 48 heures</strong>.
            </p>
            
            ${params.lienPaiement ? `
              <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin: 0 0 8px 0;">Montant</p>
                <p style="font-size: 24px; font-weight: 900; color: #111111; margin: 0 0 16px 0;">${formattedPrice}</p>
                <a href="${params.lienPaiement}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #FF5500; color: #FFFFFF; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 999px; text-decoration: none;">
                  Payer maintenant →
                </a>
                <p style="font-size: 11px; color: #9CA3AF; margin: 12px 0 0 0;">
                  Paiement sécurisé directement auprès de l'organisateur.
                </p>
              </div>
            ` : ""}

            <p style="font-size: 13px; color: #6B7280; line-height: 1.4;">
              Une fois ton règlement effectué, coche la case <em>« J'ai payé »</em> sur ta page d'inscription pour informer ton capitaine.
            </p>
          </div>
          <p style="text-align: center; font-size: 12px; color: #9CA3AF; margin-top: 24px;">
            Capten — L'infrastructure des crews de sport.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Resend sendReservationEmail Error]:", error);
    return false;
  }
}

/**
 * 2. Email de libération de place (Promotion automatique de la liste d'attente - 24h)
 */
export async function sendWaitlistPromotionEmail(params: EmailParams): Promise<boolean> {
  if (!resend || !params.to) return false;
  try {
    const confirmationLink = params.confirmationUrl || "https://capten.app";
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Une place s'est libérée pour ${params.runTitle} ! 🏃⚡`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111111;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #FF5500;">CAPTEN</span>
          </div>
          <div style="background: #FAFAF8; border: 1px solid #EAE9E2; border-radius: 20px; padding: 28px;">
            <div style="display: inline-block; background: #DCFCE7; color: #166534; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px;">
              🎉 Place Disponible
            </div>
            <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #1C1B18;">
              Bonne nouvelle ${params.prenom} !
            </h2>
            <p style="font-size: 15px; line-height: 1.5; color: #4B5563;">
              Une place vient de se libérer pour <strong>${params.runTitle}</strong> (${params.eventDate}).
            </p>
            <p style="font-size: 15px; line-height: 1.5; color: #4B5563;">
              Elle est à toi si tu la confirmes dans les <strong>24 prochaines heures</strong> :
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${confirmationLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #FF5500; color: #FFFFFF; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 999px; text-decoration: none; box-shadow: 0 4px 16px rgba(255,85,0,0.25);">
                Confirmer ma place maintenant →
              </a>
            </div>

            <p style="font-size: 12px; color: #9CA3AF; line-height: 1.4; text-align: center;">
              Passé ce délai de 24h, la place sera automatiquement proposée au coureur suivant sur la liste.
            </p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Resend sendWaitlistPromotionEmail Error]:", error);
    return false;
  }
}

/**
 * 3. Email d'expiration de réservation non réglée
 */
export async function sendExpiredReservationEmail(params: EmailParams): Promise<boolean> {
  if (!resend || !params.to) return false;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Réservation expirée pour ${params.runTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111111;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #FF5500;">CAPTEN</span>
          </div>
          <div style="background: #FAFAF8; border: 1px solid #EAE9E2; border-radius: 20px; padding: 28px;">
            <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #1C1B18;">
              Salut ${params.prenom},
            </h2>
            <p style="font-size: 15px; line-height: 1.5; color: #4B5563;">
              Le délai de réservation de 48 heures pour <strong>${params.runTitle}</strong> est arrivé à expiration sans confirmation de paiement.
            </p>
            <p style="font-size: 14px; line-height: 1.5; color: #6B7280;">
              Ta place a été réattribuée à la liste d'attente. Si c'est un oubli, n'hésite pas à te réinscrire sur la page de la sortie !
            </p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Resend sendExpiredReservationEmail Error]:", error);
    return false;
  }
}
