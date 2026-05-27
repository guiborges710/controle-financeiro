import { PageHeader } from "@/components/layout/page-header";
import { MonthFilter } from "@/components/finance/month-filter";
import { Card, StatCard } from "@/components/ui/stat-card";
import { getActiveIndustryConfig } from "@/lib/constants/industries";
import {
  getBusinessSummary,
  getExpenses,
  getProducts,
  getSales,
} from "@/lib/data/business-repository";
import { formatCurrency, formatPercent } from "@/lib/finance/calculations";
import { getSession } from "@/lib/auth/session";
import { resolveYearMonth } from "@/lib/utils/month";
import {
  ArrowUpRight,
  Percent,
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
  const [summary, sales, expenses, products] = await Promise.all([
    getBusinessSummary(yearMonth),
    getSales(yearMonth),
    getExpenses(yearMonth),
    getProducts(),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const salesByProduct = new Map<string, number>();
  for (const s of sales) {
    salesByProduct.set(
      s.product_id,
      (salesByProduct.get(s.product_id) ?? 0) + s.total,
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Empresa"
        subtitle={`Resumo financeiro — ${industry.label.toLowerCase()}: doces e salgados`}
        email={user?.email}
      >
        <MonthFilter basePath="/empresa" yearMonth={yearMonth} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={formatCurrency(summary.totalSales)}
          icon={TrendingUp}
          tone="purple"
        />
        <StatCard
          label="Custos totais"
          value={formatCurrency(summary.totalExpenses)}
          icon={ShoppingCart}
          tone="rose"
        />
        <StatCard
          label="Lucro bruto"
          value={formatCurrency(summary.balance)}
          icon={Wallet}
          tone="violet"
        />
        <StatCard
          label="Margem bruta"
          value={
            summary.marginPercent != null
              ? formatPercent(summary.marginPercent)
              : "—"
          }
          sublabel="Lucro ÷ faturamento"
          icon={Percent}
          tone="stone"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Vendas por produto</h2>
            <Link
              href="/empresa/vendas"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              Ver vendas →
            </Link>
          </div>
          {salesByProduct.size === 0 ? (
            <p className="text-sm text-stone-500">Nenhuma venda no mês.</p>
          ) : (
            <ul className="space-y-3">
              {[...salesByProduct.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([id, total], i) => (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-stone-800">
                        {productMap.get(id)?.name ?? "Produto"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-stone-900">
                      {formatCurrency(total)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Últimos gastos</h2>
            <Link
              href="/empresa/gastos"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              Ver gastos →
            </Link>
          </div>
          {expenses.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum gasto no mês.</p>
          ) : (
            <ul className="space-y-2">
              {expenses.slice(0, 5).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 text-sm"
                >
                  <span className="truncate pr-2 text-stone-700">
                    {e.description}
                  </span>
                  <span className="shrink-0 font-semibold text-rose-600">
                    -{formatCurrency(e.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/empresa/vendas", label: "Registrar venda", desc: "Produto + quantidade" },
          { href: "/empresa/gastos", label: "Registrar gasto", desc: "Notinha do mercado" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-border-soft bg-card p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md"
          >
            <p className="flex items-center gap-1 font-medium text-stone-900 group-hover:text-primary">
              {item.label}
              <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </p>
            <p className="mt-1 text-xs text-stone-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
