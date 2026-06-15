import { deleteSaleAction } from "@/app/actions/business";
import { SaleForm } from "@/components/empresa/sale-form";
import { PageHeader } from "@/components/layout/page-header";
import { MonthFilter } from "@/components/finance/month-filter";
import { PaginatedList } from "@/components/ui/paginated-list";
import { getProducts, getSales } from "@/lib/data/business-repository";
import { getSession } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/finance/calculations";
import { resolveYearMonth, todayIsoDate } from "@/lib/utils/month";
import { Trash2 } from "lucide-react";

type Props = {
  searchParams: Promise<{ mes?: string }>;
};

export default async function VendasPage({ searchParams }: Props) {
  const { mes } = await searchParams;
  const yearMonth = resolveYearMonth(mes);
  const user = await getSession();
  const [products, sales] = await Promise.all([
    getProducts(),
    getSales(yearMonth),
  ]);
  const productMap = new Map(products.map((p) => [p.id, p]));
  const total = sales.reduce((a, s) => a + s.total, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vendas"
        subtitle="Selecione o produto — preço preenchido automaticamente"
        email={user?.email}
      >
        <MonthFilter basePath="/empresa/vendas" yearMonth={yearMonth} />
      </PageHeader>

      <SaleForm products={products} defaultDate={todayIsoDate()} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Vendas do mês</h2>
          <p className="rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">
            Total: {formatCurrency(total)}
          </p>
        </div>
        {sales.length === 0 ? (
          <p className="ui-empty text-sm font-medium">
            Nenhuma venda neste mês.
          </p>
        ) : (
          <PaginatedList
            as="ul"
            className="ui-card divide-y divide-border-soft overflow-hidden"
          >
            {sales.map((s) => {
              const product = productMap.get(s.product_id);
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-primary-light/25"
                  title={
                    s.created_by_email
                      ? `Criado/alterado por ${s.created_by_email}`
                      : undefined
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">
                      {s.description} - {product?.name ?? "Produto"} ({product?.size ?? "—"})
                    </p>
                    <p className="text-sm text-stone-500">
                      {s.quantity} × {formatCurrency(s.unit_price)} ·{" "}
                      {new Date(s.occurred_at + "T12:00:00").toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                  </div>
                  <p className="font-semibold text-violet-700">
                    +{formatCurrency(s.total)}
                  </p>
                  <form action={deleteSaleAction.bind(null, s.id)}>
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
