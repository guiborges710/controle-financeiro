import { PageHeader } from "@/components/layout/page-header";
import { MonthFilter } from "@/components/finance/month-filter";
import { PaginatedList } from "@/components/ui/paginated-list";
import { Card, StatCard } from "@/components/ui/stat-card";
import { getActiveIndustryConfig } from "@/lib/constants/industries";
import {
  getExpenses,
  getProducts,
  getSales,
} from "@/lib/data/business-repository";
import { formatCurrency, formatPercent } from "@/lib/finance/calculations";
import { getSession } from "@/lib/auth/session";
import { resolveYearMonth } from "@/lib/utils/month";
import {
  ArrowUpRight,
  PackageOpen,
  Percent,
  Plus,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ mes?: string }>;
};

export default async function EmpresaPage({ searchParams }: Props) {
  const { mes } = await searchParams;
  const yearMonth = resolveYearMonth(mes);
  const industry = getActiveIndustryConfig();
  const user = await getSession();
  const [sales, expenses, products] = await Promise.all([
    getSales(yearMonth),
    getExpenses(yearMonth),
    getProducts(),
  ]);
  const monthQuery = `?mes=${yearMonth}`;

  const productMap = new Map(products.map((p) => [p.id, p]));
  const salesByProduct = new Map<string, number>();
  for (const s of sales) {
    salesByProduct.set(
      s.product_id,
      (salesByProduct.get(s.product_id) ?? 0) + s.total,
    );
  }
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalSales - totalExpenses;
  const marginPercent = totalSales > 0 ? (balance / totalSales) * 100 : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visao geral"
        subtitle={`Resumo financeiro do projeto ${industry.label.toLowerCase()}: doces e salgados`}
        email={user?.email}
      >
        <MonthFilter basePath="/empresa" yearMonth={yearMonth} />
      </PageHeader>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={formatCurrency(totalSales)}
          icon={TrendingUp}
          tone="purple"
        />
        <StatCard
          label="Custos totais"
          value={formatCurrency(totalExpenses)}
          icon={ShoppingCart}
          tone="rose"
        />
        <StatCard
          label="Lucro bruto"
          value={formatCurrency(balance)}
          icon={Wallet}
          tone="violet"
        />
        <StatCard
          label="Margem bruta"
          value={
            marginPercent != null
              ? formatPercent(marginPercent)
              : "-"
          }
          sublabel="Lucro dividido pelo faturamento"
          icon={Percent}
          tone="stone"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="min-h-[360px] p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="ui-section-title flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Vendas por produto
            </h2>
            <Link
              href={`/empresa/vendas${monthQuery}`}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary-light"
            >
              Ver vendas <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {salesByProduct.size === 0 ? (
            <div className="ui-empty min-h-[260px]">
              <div>
                <PackageOpen className="mx-auto h-12 w-12 text-violet-300" />
                <p className="mt-4 text-sm font-semibold text-stone-700">
                  Nenhuma venda neste periodo.
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Registre vendas para visualizar os dados aqui.
                </p>
              </div>
            </div>
          ) : (
            <PaginatedList as="ul" className="space-y-3">
              {[...salesByProduct.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([id, total], i) => (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-2xl border border-border-soft bg-white/80 px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-stone-800">
                        {productMap.get(id)?.name ?? "Produto"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-stone-950">
                      {formatCurrency(total)}
                    </span>
                  </li>
                ))}
            </PaginatedList>
          )}
        </Card>

        <Card className="min-h-[360px] p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="ui-section-title">Ultimos gastos</h2>
            <Link
              href={`/empresa/gastos${monthQuery}`}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary-light"
            >
              Ver todos <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {expenses.length === 0 ? (
            <div className="ui-empty min-h-[260px]">
              <div>
                <Wallet className="mx-auto h-12 w-12 text-violet-300" />
                <p className="mt-4 text-sm font-semibold text-stone-700">
                  Nenhum gasto neste periodo.
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Adicione gastos para acompanhar seus custos.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border-soft">
              {expenses.slice(0, 5).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 py-4 text-sm"
                >
                  <span className="truncate pr-2 font-medium text-stone-700">
                    {e.description}
                  </span>
                  <span className="shrink-0 font-bold text-rose-600">
                    -{formatCurrency(e.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[
          {
            href: `/empresa/vendas${monthQuery}`,
            label: "Registrar venda",
            desc: "Registre uma nova venda de forma rapida e pratica.",
          },
          {
            href: `/empresa/gastos${monthQuery}`,
            label: "Registrar gasto",
            desc: "Adicione um novo gasto e mantenha suas financas organizadas.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="ui-card ui-card-hover group flex items-center gap-5 p-6"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <Plus className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold text-stone-950 group-hover:text-primary">
                {item.label}
                <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-stone-500">
                {item.desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
