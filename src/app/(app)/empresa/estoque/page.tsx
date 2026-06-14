import { PageHeader } from "@/components/layout/page-header";
import { StockForm } from "@/components/empresa/stock-form";
import { getIngredients, getRecipes, getStocks } from "@/lib/data/business-repository";
import { getSession } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/finance/calculations";
import { Card } from "@/components/ui/stat-card";
import { PaginatedList } from "@/components/ui/paginated-list";

export default async function EstoquePage() {
  const user = await getSession();
  const [ingredients, recipes, stocks] = await Promise.all([
    getIngredients(),
    getRecipes(),
    getStocks(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Estoque"
        subtitle="Registre produções e calcule o custo por unidade"
        email={user?.email}
      />

      <StockForm recipes={recipes} ingredients={ingredients} />

      <section className="space-y-3">
        <h2 className="font-semibold text-stone-900">Produções registradas</h2>
        {stocks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft bg-card p-8 text-center text-sm text-stone-500">Nenhuma produção registrada.</p>
        ) : (
          <PaginatedList className="space-y-4">
            {stocks.map((s) => (
              <Card key={s.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-stone-900">{recipes.find(r => r.id === s.recipe_id)?.name ?? "Receita"}</div>
                    <div className="text-sm text-stone-600">{s.occurred_at} · {s.produced_quantity} unidades</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-stone-500">Custo total</div>
                    <div className="font-medium">{formatCurrency(s.total_cost)}</div>
                    <div className="text-sm text-stone-500">Custo / un</div>
                    <div className="font-medium">{formatCurrency(s.cost_per_unit)}</div>
                  </div>
                </div>
              </Card>
            ))}
          </PaginatedList>
        )}
      </section>
    </div>
  );
}
