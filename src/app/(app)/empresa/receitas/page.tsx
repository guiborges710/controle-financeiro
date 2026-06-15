import { deleteRecipeAction } from "@/app/actions/business";
import { RecipeForm } from "@/components/empresa/recipe-form";
import { PageHeader } from "@/components/layout/page-header";
import {
  getIngredients,
  getProducts,
  getRecipes,
} from "@/lib/data/business-repository";
import { getSession } from "@/lib/auth/session";
import { computeRecipeCost } from "@/lib/finance/recipe-cost";
import { getProductsForRecipe } from "@/lib/finance/recipe-products";
import { formatCurrency, formatPercent } from "@/lib/finance/calculations";
import { unitLabel } from "@/lib/finance/recipe-cost";
import { Card } from "@/components/ui/stat-card";
import { PaginatedList } from "@/components/ui/paginated-list";
import { Trash2 } from "lucide-react";

export default async function ReceitasPage() {
  const user = await getSession();
  const [ingredients, products, recipes] = await Promise.all([
    getIngredients(),
    getProducts(),
    getRecipes(),
  ]);
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Receitas"
        subtitle="Ficha técnica com margem — produtos vinculados aparecem automaticamente"
        email={user?.email}
      />

      <RecipeForm ingredients={ingredients} />

      <section className="space-y-4">
        <h2 className="ui-section-title">Receitas cadastradas</h2>
        {recipes.length === 0 ? (
          <p className="ui-empty text-sm font-medium">
            Nenhuma receita cadastrada.
          </p>
        ) : (
          <PaginatedList className="space-y-4">
            {recipes.map((recipe) => {
              const linkedProducts = getProductsForRecipe(recipe.id, products);
              const costBase = computeRecipeCost(recipe, ingredients, null);

              return (
                <Card
                  key={recipe.id}
                  title={
                    recipe.created_by_email
                      ? `Criado/alterado por ${recipe.created_by_email}`
                      : undefined
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-stone-900">
                        {recipe.name}
                      </h3>
                      {linkedProducts.length > 0 ? (
                        <ul className="mt-1 space-y-0.5 text-sm text-stone-500">
                          {linkedProducts.map((p) => {
                            const analysis = computeRecipeCost(
                              recipe,
                              ingredients,
                              p,
                            );
                            return (
                              <li key={p.id}>
                                Produto: {p.name} ·{" "}
                                {formatCurrency(p.sale_price)} · Margem{" "}
                                {analysis.marginPercent != null
                                  ? formatPercent(analysis.marginPercent)
                                  : "—"}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="mt-1 text-sm text-stone-500">
                          Nenhum produto vinculado — cadastre em Produtos
                        </p>
                      )}
                    </div>
                    <form action={deleteRecipeAction.bind(null, recipe.id)}>
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                  <ul className="mt-3 space-y-1 text-sm text-stone-600">
                    {recipe.lines.map((line, idx) => {
                      const ing = ingredientMap.get(line.ingredient_id);
                      if (!ing) return null;
                      return (
                        <li key={idx}>
                          {ing.name}: {line.quantity} {unitLabel(line.unit)} (
                          {formatCurrency(line.quantity * ing.unit_cost)})
                        </li>
                      );
                    })}
                  </ul>

                  <dl className="mt-4 grid gap-2 border-t border-border-soft pt-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-stone-500">Custo total</dt>
                      <dd className="font-medium">
                        {formatCurrency(costBase.totalCost)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-500">Custo / porção</dt>
                      <dd className="font-medium">
                        {formatCurrency(costBase.costPerUnit)}
                      </dd>
                    </div>
                  </dl>
                </Card>
              );
            })}
          </PaginatedList>
        )}
      </section>
    </div>
  );
}
