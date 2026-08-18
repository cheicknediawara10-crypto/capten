"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPin, hashPin } from "@/lib/membre-auth";
import { setMembreCookie, clearMembreCookie } from "@/lib/membre-session";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { Resend } from "resend";

// Tables not yet in generated Supabase types. Remove after: supabase gen types typescript > src/lib/supabase/types.ts
function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any { // any bypasses builder generics for untyped tables
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

type AuthResult =
  | { success: true; membreId: string }
  | { error: string; blockedUntil?: number };

export async function loginMembre(data: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  pin: string;
}): Promise<AuthResult> {
  const { first_name, last_name, date_of_birth, pin } = data;

  if (!first_name || !last_name || !date_of_birth || pin?.length !== 4) {
    return { error: "Tous les champs sont requis." };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { error: "Le code PIN doit contenir 4 chiffres." };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimit(`membre:auth:${ip}`, 5, 15 * 60);
  if (!rl.success) {
    return { error: "Trop de tentatives. Réessaie dans 15 minutes.", blockedUntil: rl.reset };
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service temporairement indisponible." };
  }

  const { data: raw, error } = await ub(supabase, "membre_profiles")
    .select("id, pin_hash, pin_salt")
    .ilike("first_name", first_name.trim())
    .ilike("last_name", last_name.trim())
    .eq("date_of_birth", date_of_birth);

  if (error || !raw || raw.length === 0) {
    return { error: "Informations incorrectes. Vérifie ton nom, ta date de naissance et ton code PIN." };
  }

  const membres = raw as { id: string; pin_hash: string; pin_salt: string }[];
  const matched = membres.find((m) => verifyPin(pin, m.pin_hash, m.pin_salt));
  if (!matched) {
    return { error: "Informations incorrectes. Vérifie ton nom, ta date de naissance et ton code PIN." };
  }

  await setMembreCookie(matched.id);
  return { success: true, membreId: matched.id };
}

export async function logoutMembre() {
  await clearMembreCookie();
}

type RegisterResult = { success: true; membreId: string } | { error: string };

export async function registerMembre(data: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  pin: string;
  club_id: string;
  ice_name: string;
  ice_phone: string;
  ice_relation: string;
  waiver_hash: string;
  ip_address?: string;
}): Promise<RegisterResult> {
  const {
    first_name, last_name, date_of_birth, phone, email, pin, club_id,
    ice_name, ice_phone, ice_relation, waiver_hash, ip_address,
  } = data;

  if (!first_name || !last_name || !date_of_birth || pin?.length !== 4 || !club_id) {
    return { error: "Champs requis manquants." };
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service temporairement indisponible." };
  }

  // Check if member already exists (same name + dob)
  const { data: existingRaw } = await ub(supabase, "membre_profiles")
    .select("id")
    .ilike("first_name", first_name.trim())
    .ilike("last_name", last_name.trim())
    .eq("date_of_birth", date_of_birth)
    .maybeSingle();

  const existing = existingRaw as { id: string } | null;

  if (existing) {
    const { data: membership } = await ub(supabase, "membre_club")
      .select("id")
      .eq("membre_id", existing.id)
      .eq("club_id", club_id)
      .maybeSingle();

    if (membership) {
      return { error: "Tu es déjà inscrit dans ce club. Accède à ton espace via /mon-espace." };
    }

    await ub(supabase, "membre_club").insert({ membre_id: existing.id, club_id });
    await setMembreCookie(existing.id);
    return { success: true, membreId: existing.id };
  }

  const { hash, salt } = hashPin(pin);

  const { data: insertedRaw, error: insertErr } = await ub(supabase, "membre_profiles")
    .insert({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      date_of_birth,
      phone: phone?.trim() || null,
      email: email?.trim().toLowerCase() || null,
      pin_hash: hash,
      pin_salt: salt,
    })
    .select("id")
    .single();

  const inserted = insertedRaw as { id: string } | null;
  if (insertErr || !inserted) return { error: "Erreur lors de l'inscription. Réessaie." };

  const membreId = inserted.id;

  await Promise.all([
    ub(supabase, "membre_club").insert({ membre_id: membreId, club_id }),
    ice_name && ice_phone
      ? ub(supabase, "membre_ice").insert({
          membre_id: membreId,
          contact_name: ice_name,
          contact_phone: ice_phone,
          relationship: ice_relation || null,
        })
      : null,
    waiver_hash
      ? ub(supabase, "membre_waivers").insert({
          membre_id: membreId,
          club_id,
          signature_hash: waiver_hash,
          ip_address: ip_address ?? null,
        })
      : null,
  ]);

  await setMembreCookie(membreId);
  return { success: true, membreId };
}

// ── PIN Reset via Email + Magic Link ──────────────────────────────────────────

type ResetRequestResult = { success: true } | { error: string };

export async function requestPinReset(email: string): Promise<ResetRequestResult> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Adresse e-mail invalide." };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimit(`membre:reset:${ip}`, 3, 15 * 60);
  if (!rl.success) {
    return { error: "Trop de demandes. Réessaie dans 15 minutes." };
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    // Always return success to prevent email enumeration
    return { success: true };
  }

  const { data: membreRaw } = await ub(supabase, "membre_profiles")
    .select("id, first_name")
    .ilike("email", email.trim())
    .maybeSingle();

  // Always return success — do not reveal whether email exists
  if (!membreRaw) {
    console.warn(`[pin-reset] aucun membre avec l'e-mail "${email.trim()}" — aucun envoi.`);
    return { success: true };
  }

  const membre = membreRaw as { id: string; first_name: string };

  // Invalidate old tokens for this member
  await ub(supabase, "membre_pin_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("membre_id", membre.id)
    .is("used_at", null);

  const token = randomBytes(32).toString("hex");
  await ub(supabase, "membre_pin_resets").insert({
    membre_id: membre.id,
    token,
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://capten.app";
  const resetUrl = `${appUrl}/mon-espace/reset-pin/${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.error("[pin-reset] RESEND_API_KEY manquante — e-mail non envoyé.");
    return { success: true };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendErr } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "CAPTEN <noreply@capten.io>",
      to: email.trim(),
      subject: "Réinitialisation de ton code PIN CAPTEN",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <img src="${appUrl}/logo.png" alt="CAPTEN" style="height:32px;margin-bottom:32px;" />
          <h1 style="font-size:22px;font-weight:800;color:#111111;margin:0 0 8px;">
            Réinitialise ton code PIN
          </h1>
          <p style="font-size:14px;color:#6B7280;margin:0 0 24px;">
            Bonjour ${membre.first_name}, tu as demandé à réinitialiser ton code PIN CAPTEN.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#FF5500;color:white;font-weight:700;font-size:14px;
                    padding:14px 28px;border-radius:12px;text-decoration:none;">
            Choisir un nouveau code PIN →
          </a>
          <p style="font-size:12px;color:#9CA3AF;margin:24px 0 0;">
            Ce lien est valable <strong>15 minutes</strong>.<br/>
            Si tu n'as pas fait cette demande, ignore cet e-mail.
          </p>
          <hr style="border:none;border-top:1px solid #E8E8E8;margin:24px 0;" />
          <p style="font-size:11px;color:#D1D5DB;margin:0;">
            CAPTEN — La plateforme des Run Clubs
          </p>
        </div>
      `,
    });
    if (sendErr) console.error("[pin-reset] Resend a refusé l'envoi (domaine expéditeur non vérifié ?):", sendErr);
  } catch (e) {
    console.error("[pin-reset] Exception à l'envoi de l'e-mail:", e);
  }

  return { success: true };
}

type ResetPinResult = { success: true } | { error: string };

export async function resetPin(token: string, newPin: string): Promise<ResetPinResult> {
  if (!token || !/^\d{4}$/.test(newPin)) {
    return { error: "Code PIN invalide (4 chiffres requis)." };
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service temporairement indisponible." };
  }

  const { data: resetRaw } = await ub(supabase, "membre_pin_resets")
    .select("id, membre_id, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  const reset = resetRaw as {
    id: string; membre_id: string; expires_at: string; used_at: string | null;
  } | null;

  if (!reset) return { error: "Lien invalide ou expiré." };
  if (reset.used_at) return { error: "Ce lien a déjà été utilisé." };
  if (new Date(reset.expires_at) < new Date()) return { error: "Ce lien a expiré. Fais une nouvelle demande." };

  const { hash, salt } = hashPin(newPin);

  const [updateErr] = await Promise.all([
    ub(supabase, "membre_profiles")
      .update({ pin_hash: hash, pin_salt: salt, updated_at: new Date().toISOString() })
      .eq("id", reset.membre_id)
      .then(({ error }: { error: unknown }) => error),

    ub(supabase, "membre_pin_resets")
      .update({ used_at: new Date().toISOString() })
      .eq("id", reset.id),
  ]);

  if (updateErr) return { error: "Erreur lors de la mise à jour. Réessaie." };

  await setMembreCookie(reset.membre_id);
  return { success: true };
}
