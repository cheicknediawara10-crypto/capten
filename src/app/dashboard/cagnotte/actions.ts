"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

/**
 * Mutation ATOMIQUE de la cagnotte (argent) : lit `cagnotte_data`, applique le
 * mutateur, puis écrit avec un compare-and-swap sur `_ver` (verrou optimiste).
 * Si une écriture concurrente a bougé la version → 0 ligne affectée → on
 * réessaie. Empêche les "lost updates" (contribution/transaction écrasée).
 */
async function mutateCagnotte(
  sb: ReturnType<typeof createAdminClient>,
  club_id: string,
  mutator: (current: Record<string, any>) => { data: Record<string, any> } | { error: string },
  extra?: Record<string, any>
): Promise<{ ok: true } | { error: string }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: club } = await ub(sb, "clubs").select("cagnotte_data").eq("id", club_id).maybeSingle();
    const current = ((club as any)?.cagnotte_data || {}) as Record<string, any>;
    const ver = Number(current._ver || 0);

    const m = mutator({ ...current });
    if ("error" in m) return { error: m.error };
    const next = { ...m.data, _ver: ver + 1 };

    let q = ub(sb, "clubs").update({ cagnotte_data: next, ...(extra || {}) }).eq("id", club_id);
    q = (current._ver === undefined || current._ver === null)
      ? q.is("cagnotte_data->>_ver", null)
      : q.eq("cagnotte_data->>_ver", String(ver));

    const { data: updated, error } = await q.select("id");
    if (error) return { error: "Erreur d'enregistrement." };
    if (updated && (updated as any[]).length > 0) return { ok: true };

    await new Promise((r) => setTimeout(r, 40 * (attempt + 1))); // conflit → petite attente puis retry
  }
  return { error: "Trop de modifications simultanées. Réessaie dans un instant." };
}

export interface CagnotteTransaction {
  id: string;
  member_id?: string | null;
  name: string;
  amount: number;
  date: string;
  method: "helloasso" | "lydia" | "sumeria" | "paypal" | "especes" | "virement" | "autre";
  note?: string;
}

export interface CagnotteContributor {
  member_id: string;
  name: string;
  total_contributed: number;
  is_up_to_date: boolean;
  last_payment_date?: string;
}

export interface CagnotteData {
  balance: number;
  goal: number;
  goal_title: string;
  cotisation_amount: number;
  cagnotte_url: string;
  transactions: CagnotteTransaction[];
  contributors: CagnotteContributor[];
}

export async function getCagnotteInfo(): Promise<{
  ok: true;
  club: { id: string; name: string; slug: string; cagnotte_url: string | null };
  cagnotte: CagnotteData;
  members: Array<{ id: string; membre_id: string; first_name: string; last_name: string; phone: string | null; email: string | null }>;
} | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "Session expirée. Reconnecte-toi." };

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  // 1. Fetch club info
  const { data: club } = await ub(supabase, "clubs")
    .select("id, name, slug, cagnotte_url, cagnotte_data")
    .eq("id", club_id)
    .maybeSingle();

  if (!club) return { error: "Club introuvable." };

  const rawData = (club as any).cagnotte_data || {};
  const cagnotte: CagnotteData = {
    balance: Number(rawData.balance || 0),
    goal: Number(rawData.goal || 300),
    goal_title: String(rawData.goal_title || "Équipements & Ravitaillement du Crew"),
    cotisation_amount: Number(rawData.cotisation_amount || 20),
    cagnotte_url: String(club.cagnotte_url || rawData.cagnotte_url || ""),
    transactions: Array.isArray(rawData.transactions) ? rawData.transactions : [],
    contributors: Array.isArray(rawData.contributors) ? rawData.contributors : [],
  };

  // 2. Fetch members
  const { data: memberships } = await ub(supabase, "membre_club")
    .select("id, membre_id, joined_at, membre_profiles(id, first_name, last_name, phone, email)")
    .eq("club_id", club_id)
    .order("joined_at", { ascending: false });

  const members = (memberships || []).map((m: any) => ({
    id: m.id,
    membre_id: m.membre_id,
    first_name: m.membre_profiles?.first_name || "Membre",
    last_name: m.membre_profiles?.last_name || "",
    phone: m.membre_profiles?.phone || null,
    email: m.membre_profiles?.email || null,
  }));

  return {
    ok: true,
    club: {
      id: club.id,
      name: club.name,
      slug: (club as any).slug || "mon-club",
      cagnotte_url: club.cagnotte_url,
    },
    cagnotte,
    members,
  };
}

export async function saveCagnotteSettings(input: {
  cagnotte_url?: string;
  goal?: number;
  goal_title?: string;
  cotisation_amount?: number;
}): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "Session expirée. Reconnecte-toi." };

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  const extra: Record<string, any> = {};
  if (input.cagnotte_url !== undefined) {
    extra.cagnotte_url = input.cagnotte_url.trim();
    extra.website_url = input.cagnotte_url.trim();
  }

  return mutateCagnotte(supabase, club_id, (current) => ({
    data: {
      ...current,
      cagnotte_url: input.cagnotte_url !== undefined ? input.cagnotte_url.trim() : (current.cagnotte_url || ""),
      goal: input.goal !== undefined ? Number(input.goal) : (current.goal || 300),
      goal_title: input.goal_title !== undefined ? input.goal_title.trim() : (current.goal_title || "Objectif Crew"),
      cotisation_amount: input.cotisation_amount !== undefined ? Number(input.cotisation_amount) : (current.cotisation_amount || 20),
    },
  }), extra);
}

export async function addContribution(input: {
  member_id?: string | null;
  name: string;
  amount: number;
  method: CagnotteTransaction["method"];
  note?: string;
}): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "Session expirée. Reconnecte-toi." };

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  return mutateCagnotte(supabase, club_id, (current) => {
    const transactions: CagnotteTransaction[] = Array.isArray(current.transactions) ? [...current.transactions] : [];
    const contributors: CagnotteContributor[] = Array.isArray(current.contributors) ? [...current.contributors] : [];

    const newTx: CagnotteTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      member_id: input.member_id || null,
      name: input.name.trim(),
      amount: Number(input.amount),
      date: new Date().toISOString(),
      method: input.method,
      note: input.note?.trim() || undefined,
    };

    transactions.unshift(newTx);
    const newBalance = Number(current.balance || 0) + Number(input.amount);

    if (input.member_id) {
      const existingIdx = contributors.findIndex((c) => c.member_id === input.member_id);
      if (existingIdx >= 0) {
        contributors[existingIdx].total_contributed += Number(input.amount);
        contributors[existingIdx].is_up_to_date = true;
        contributors[existingIdx].last_payment_date = new Date().toISOString();
      } else {
        contributors.push({
          member_id: input.member_id,
          name: input.name.trim(),
          total_contributed: Number(input.amount),
          is_up_to_date: true,
          last_payment_date: new Date().toISOString(),
        });
      }
    }

    return { data: { ...current, balance: newBalance, transactions, contributors } };
  });
}

export async function deleteTransaction(txId: string): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "Session expirée. Reconnecte-toi." };

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  return mutateCagnotte(supabase, club_id, (current) => {
    const transactions: CagnotteTransaction[] = Array.isArray(current.transactions) ? [...current.transactions] : [];
    const target = transactions.find((t) => t.id === txId);
    if (!target) return { error: "Transaction introuvable." };
    const filteredTx = transactions.filter((t) => t.id !== txId);
    const newBalance = Math.max(0, Number(current.balance || 0) - target.amount);
    return { data: { ...current, balance: newBalance, transactions: filteredTx } };
  });
}
