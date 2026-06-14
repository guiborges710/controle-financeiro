import { deleteExpenseAction } from "@/app/actions/business";
import { ExpenseCsvImportForm } from "@/components/empresa/expense-csv-import-form";
import { ExpenseFormPanel } from "@/components/empresa/expense-form";
import { ExpenseIngredientForm } from "@/components/empresa/expense-ingredient-form";
import { InsumosPanel } from "@/components/empresa/insumos-panel";
import { MonthFilter } from "@/components/finance/month-filter";
import { PageHeader } from "@/components/layout/page-header";
import { PaginatedList } from "@/components/ui/paginated-list";
import { getSession } from "@/lib/auth/session";
import { getExpenses, getIngredients } from "@/lib/data/business-repository";
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
        subtitle="Lance itens da notinha; o custo por unidade é calculado automaticamente."
        email={user?.email}
      >
        <MonthFilter basePath="/empresa/gastos" yearMonth={yearMonth} />
      </PageHeader>

      <ExpenseFormPanel defaultDate={todayIsoDate()} />
      <ExpenseCsvImportForm />

      <section className="space-y-3">
        <h2 className="font-semibold text-stone-900">Gastos do mês</h2>
        {expenses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft bg-card p-8 text-center text-sm text-stone-500">
            Nenhum gasto neste mês.
          </p>
        ) : (
          <PaginatedList
            as="ul"
            className="divide-y divide-border-soft overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm"
          >
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="px-4 py-3"
                title={
                  expense.created_by_email
                    ? `Criado/alterado por ${expense.created_by_email}`
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">
                      {expense.description}
                    </p>
                    <p className="text-sm text-stone-500">
                      {TYPE_LABELS[expense.type]} ·{" "}
                      {new Date(
                        expense.occurred_at + "T12:00:00",
                      ).toLocaleDateString("pt-BR")}
                      {expense.type === "insumo" &&
                      expense.unit_cost != null &&
                      expense.ingredient_unit &&
                      expense.quantity_purchased ? (
                        <>
                          {" "}
                          · {expense.ingredient_name}:{" "}
                          {formatCurrency(expense.unit_cost)}/
                          {unitLabel(expense.ingredient_unit)} (
                          {expense.quantity_purchased}{" "}
                          {unitLabel(expense.ingredient_unit)})
                        </>
                      ) : null}
                    </p>
                  </div>
                  <p className="font-semibold text-rose-600">
                    -{formatCurrency(expense.amount)}
                  </p>
                  <form action={deleteExpenseAction.bind(null, expense.id)}>
                    <button
                      type="submit"
                      className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Excluir gasto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                <ExpenseIngredientForm
                  expenseId={expense.id}
                  defaultName={expense.ingredient_name ?? expense.description}
                  currentQuantity={expense.quantity_purchased}
                  currentUnit={expense.ingredient_unit}
                />
              </li>
            ))}
          </PaginatedList>
        )}
      </section>

      <InsumosPanel ingredients={ingredients} />
    </div>
  );
}
