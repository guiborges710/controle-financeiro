import { deleteSaleAction } from "@/app/actions/business";
import { SaleForm } from "@/components/empresa/sale-form";
import { PageHeader } from "@/components/layout/page-header";
import { MonthFilter } from "@/components/finance/month-filter";
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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Vendas do mês</h2>
          <p className="text-sm font-semibold text-primary">
            Total: {formatCurrency(total)}
          </p>
        </div>
        {sales.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft bg-card p-8 text-center text-sm text-stone-500">
            Nenhuma venda neste mês.
          </p>
        ) : (
          <ul className="divide-y divide-border-soft overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm">
            {sales.map((s) => {
              const product = productMap.get(s.product_id);
              return (
                <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">
                      {product?.name ?? "Produto"} ({product?.size ?? "—"})
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
          </ul>
        )}
      </section>
    </div>
  );
}
