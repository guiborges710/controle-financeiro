import "server-only";

import { isLocalMode } from "@/lib/config/mode";
import { getSession } from "@/lib/auth/session";
import {
  localDeleteTransaction,
  localEnsureBusinessProfile,
  localInsertTransaction,
  localListTransactions,
} from "@/lib/local/store";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaCacheRelationError } from "@/lib/supabase/errors";
import type { Transaction, Universe } from "@/lib/types";

export async function listTransactions(
  universe: Universe,
  yearMonth?: string,
): Promise<Transaction[]> {
  if (isLocalMode()) {
    return localListTransactions(universe, yearMonth);
  }

  const user = await getSession();
  if (!user) return [];

  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("universe", universe)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (yearMonth) {
    const [y, m] = yearMonth.split("-").map(Number);
    const start = `${yearMonth}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("occurred_at", start).lte("occurred_at", end);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    amount: Number(row.amount),
  })) as Transaction[];
}

export async function insertTransaction(
  universe: Universe,
  data: {
    type: "income" | "expense";
    category_slug: string;
    amount: number;
    description: string | null;
    occurred_at: string;
  },
): Promise<{ error?: string }> {
  const user = await getSession();
  if (!user) return { error: "Faça login para continuar" };

  if (isLocalMode()) {
    return localInsertTransaction({
      universe,
      ...data,
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    universe,
    ...data,
  });

  if (error) return { error: error.message };
  return {};
}

export async function removeTransaction(
  universe: Universe,
  id: string,
): Promise<{ error?: string }> {
  if (isLocalMode()) {
    return localDeleteTransaction(universe, id);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("universe", universe);

  if (error) return { error: error.message };
  return {};
}

export async function ensureBusinessProfile(): Promise<void> {
  if (isLocalMode()) {
    await localEnsureBusinessProfile();
    return;
  }

  const user = await getSession();
  if (!user) return;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    const { data: acceptedInvite, error: acceptedInviteError } = await supabase
      .from("collaborators")
      .select("id")
      .eq("invited_email", user.email.toLowerCase())
      .eq("status", "accepted")
      .limit(1)
      .maybeSingle();

    if (
      acceptedInviteError &&
      !isMissingSchemaCacheRelationError(acceptedInviteError, "collaborators")
    ) {
      return;
    }

    if (acceptedInvite) return;

    await supabase.from("business_profiles").insert({
      user_id: user.id,
      industry: "delivery",
      business_name: "Meu delivery",
    });
  }
}
