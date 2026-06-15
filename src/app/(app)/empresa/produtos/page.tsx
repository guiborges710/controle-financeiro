import { deleteProductAction } from "@/app/actions/business";
import { ProductForm } from "@/components/empresa/product-form";
import { PageHeader } from "@/components/layout/page-header";
import { PaginatedList } from "@/components/ui/paginated-list";
import { getProducts, getRecipes } from "@/lib/data/business-repository";
import { getSession } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/finance/calculations";
import { Trash2 } from "lucide-react";

export default async function ProdutosPage() {
  const user = await getSession();
  const [products, recipes] = await Promise.all([
    getProducts(),
    getRecipes(),
  ]);
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Produtos"
        subtitle="Catálogo para venda — receita obrigatória"
        email={user?.email}
      />

      <ProductForm
        recipeOptions={recipes.map((r) => ({ id: r.id, name: r.name }))}
      />

      <section className="space-y-4">
        <h2 className="font-semibold text-stone-900">Catálogo</h2>
        {products.length === 0 ? (
          <p className="ui-empty text-sm font-medium">
            Nenhum produto cadastrado.
          </p>
        ) : (
          <PaginatedList
            as="ul"
            className="ui-card divide-y divide-border-soft overflow-hidden"
          >
            {products.map((p) => {
              const recipe = recipeMap.get(p.recipe_id);
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-primary-light/25"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-medium text-stone-900"
                      title={
                        p.created_by_email
                          ? `Criado/alterado por ${p.created_by_email}`
                          : undefined
                      }
                    >
                      {p.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      Tamanho: {p.size}
                      {recipe ? <> · Receita: {recipe.name}</> : null}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatCurrency(p.sale_price)}
                  </p>
                  <form action={deleteProductAction.bind(null, p.id)}>
                    <button
                      type="submit"
                      className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </li>
              );
            })}
          </PaginatedList>
        )}
      </section>
    </div>
  );
}
