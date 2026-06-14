import { deleteTransactionAction } from "@/app/actions/transactions";
import { getCategoryLabel } from "@/lib/constants/categories";
import { formatCurrency } from "@/lib/finance/calculations";
import type { Transaction, Universe } from "@/lib/types";
import { PaginatedList } from "@/components/ui/paginated-list";
import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";

type Props = {
  transactions: Transaction[];
  universe: Universe;
};

export function TransactionList({ transactions, universe }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        Nenhum lançamento neste período. Adicione o primeiro acima.
      </div>
    );
  }

  return (
    <PaginatedList
      as="ul"
      className="divide-y divide-border-soft overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm"
    >
      {transactions.map((t) => (
        <li
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/80"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              t.type === "income"
                ? "bg-violet-100 text-violet-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {t.type === "income" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownLeft className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900">
              {getCategoryLabel(universe, t.category_slug)}
            </p>
            <p className="truncate text-sm text-zinc-500">
              {t.description || "—"} ·{" "}
              {new Date(t.occurred_at + "T12:00:00").toLocaleDateString(
                "pt-BR",
              )}
            </p>
          </div>
          <p
            className={`shrink-0 font-semibold ${
              t.type === "income" ? "text-violet-700" : "text-rose-700"
            }`}
          >
            {t.type === "income" ? "+" : "-"}
            {formatCurrency(Number(t.amount))}
          </p>
          <form action={deleteTransactionAction.bind(null, universe, t.id)}>
            <button
              type="submit"
              className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </li>
      ))}
    </PaginatedList>
  );
}
