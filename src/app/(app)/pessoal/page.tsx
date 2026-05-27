import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { MonthFilter } from "@/components/finance/month-filter";
import { StatCard } from "@/components/ui/stat-card";
import { fetchTransactions } from "@/lib/data/transactions";
import { getSession } from "@/lib/auth/session";
import {
  computeSummary,
  formatCurrency,
  formatPercent,
} from "@/lib/finance/calculations";
import { resolveYearMonth, todayIsoDate } from "@/lib/utils/month";
import { Percent, TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  searchParams: Promise<{ mes?: string }>;
};

export default async function PessoalPage({ searchParams }: Props) {
  const { mes } = await searchParams;
  const yearMonth = resolveYearMonth(mes);
  const user = await getSession();
  const transactions = await fetchTransactions("personal", yearMonth);
  const summary = computeSummary(transactions);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finanças pessoais"
        subtitle="Gastos e receitas do dia a dia"
        email={user?.email}
      >
        <MonthFilter basePath="/pessoal" yearMonth={yearMonth} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Receitas"
          value={formatCurrency(summary.totalIncome)}
          icon={TrendingUp}
          tone="purple"
        />
        <StatCard
          label="Despesas"
          value={formatCurrency(summary.totalExpense)}
          icon={TrendingDown}
          tone="rose"
        />
        <StatCard
          label="Saldo do mês"
          value={formatCurrency(summary.balance)}
          sublabel={
            summary.totalIncome > 0
              ? `${formatPercent(summary.marginPercent ?? 0)} ficou no bolso`
              : undefined
          }
          icon={Percent}
          tone="violet"
        />
      </div>

      <TransactionForm universe="personal" defaultDate={todayIsoDate()} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Lançamentos do mês</h2>
          <Link
            href="/pessoal/transacoes"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Ver todos →
          </Link>
        </div>
        <TransactionList
          transactions={transactions.slice(0, 8)}
          universe="personal"
        />
      </section>
    </div>
  );
}
