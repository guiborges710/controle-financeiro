import { deleteExpenseAction } from "@/app/actions/business";
import { ExpenseFormPanel } from "@/components/empresa/expense-form";
import { InsumosPanel } from "@/components/empresa/insumos-panel";
import { PageHeader } from "@/components/layout/page-header";
import { MonthFilter } from "@/components/finance/month-filter";
import { getExpenses, getIngredients } from "@/lib/data/business-repository";
import { getSession } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/finance/calculations";
import { unitLabel } from "@/lib/finance/recipe-cost";
import type { ExpenseType } from "@/lib/types/business";
import { resolveYearMonth, todayIsoDate } from "@/lib/utils/month";
import { Trash2 } from "lucide-react";

const TYPE_LABELS: Record<ExpenseType, string> = {
  insumo: "Insumo",
  energia: "Energia",
  gas: "Gás",
  embalagem: "Embalagem",
  outros: "Outros",
};

type Props = {
  searchParams: Promise<{ mes?: string }>;
};

export default async function GastosPage({ searchParams }: Props) {
  const { mes } = await searchParams;
  const yearMonth = resolveYearMonth(mes);
  const user = await getSession();
  const [expenses, ingredients] = await Promise.all([
    getExpenses(yearMonth),
    getIngredients(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gastos"
        subtitle="Lance itens da notinha — custo por unidade calculado automaticamente"
        email={user?.email}
      >
        <MonthFilter basePath="/empresa/gastos" yearMonth={yearMonth} />
      </PageHeader>

      <ExpenseFormPanel defaultDate={todayIsoDate()} />
      <InsumosPanel ingredients={ingredients} />

      <section className="space-y-3">
        <h2 className="font-semibold text-stone-900">Gastos do mês</h2>
        {expenses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft bg-card p-8 text-center text-sm text-stone-500">
            Nenhum gasto neste mês.
          </p>
        ) : (
          <ul className="divide-y divide-border-soft overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900">{e.description}</p>
                  <p className="text-sm text-stone-500">
                    {TYPE_LABELS[e.type]} ·{" "}
                    {new Date(e.occurred_at + "T12:00:00").toLocaleDateString(
                      "pt-BR",
                    )}
                    {e.type === "insumo" &&
                    e.unit_cost != null &&
                    e.ingredient_unit &&
                    e.quantity_purchased ? (
                      <>
                        {" "}
                        · {e.ingredient_name}:{" "}
                        {formatCurrency(e.unit_cost)}/{unitLabel(e.ingredient_unit)}{" "}
                        ({e.quantity_purchased} {unitLabel(e.ingredient_unit)})
                      </>
                    ) : null}
                  </p>
                </div>
                <p className="font-semibold text-rose-600">
                  -{formatCurrency(e.amount)}
                </p>
                <form action={deleteExpenseAction.bind(null, e.id)}>
                  <button
                    type="submit"
                    className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
