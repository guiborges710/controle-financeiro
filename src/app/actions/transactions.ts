"use server";

import { revalidatePath } from "next/cache";
import { createTransactionSchema } from "@/lib/validations/transaction";
import {
  ensureBusinessProfile as ensureProfile,
  insertTransaction,
  removeTransaction,
} from "@/lib/data/transactions-repository";
import type { Universe } from "@/lib/types";

function revalidateUniverse(universe: Universe) {
  const base = universe === "business" ? "/pessoal" : "/empresa";
  revalidatePath(base);
  revalidatePath(`${base}/transacoes`);
}

export async function createTransaction(
  universe: Universe,
  formData: FormData,
) {
  const raw = {
    type: formData.get("type"),
    category_slug: formData.get("category_slug"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    occurred_at: formData.get("occurred_at"),
  };

  const parsed = createTransactionSchema(universe).safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const result = await insertTransaction(universe, {
    type: parsed.data.type,
    category_slug: parsed.data.category_slug,
    amount: parsed.data.amount,
    description: parsed.data.description ?? null,
    occurred_at: parsed.data.occurred_at,
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidateUniverse(universe);
  return { success: true };
}

export async function deleteTransaction(
  universe: Universe,
  id: string,
) {
  const result = await removeTransaction(universe, id);
  if (result.error) {
    return { error: result.error };
  }
  revalidateUniverse(universe);
  return { success: true };
}

export async function deleteTransactionAction(
  universe: Universe,
  id: string,
): Promise<void> {
  await deleteTransaction(universe, id);
}

export async function ensureBusinessProfile() {
  await ensureProfile();
}
