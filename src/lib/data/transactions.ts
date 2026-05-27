import { listTransactions } from "@/lib/data/transactions-repository";
import type { Transaction, Universe } from "@/lib/types";

export async function fetchTransactions(
  universe: Universe,
  yearMonth?: string,
): Promise<Transaction[]> {
  return listTransactions(universe, yearMonth);
}
