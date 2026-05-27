import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { MonthFilter } from "@/components/finance/month-filter";
import { fetchTransactions } from "@/lib/data/transactions";
import { getSession } from "@/lib/auth/session";
import { resolveYearMonth, todayIsoDate } from "@/lib/utils/month";

type Props = {
  searchParams: Promise<{ mes?: string }>;
};

export default async function PessoalTransacoesPage({ searchParams }: Props) {
  const { mes } = await searchParams;
  const yearMonth = resolveYearMonth(mes);
  const user = await getSession();
  const transactions = await fetchTransactions("personal", yearMonth);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transações"
        subtitle="Todos os lançamentos pessoais do mês"
        email={user?.email}
      >
        <MonthFilter basePath="/pessoal/transacoes" yearMonth={yearMonth} />
      </PageHeader>
      <TransactionForm universe="personal" defaultDate={todayIsoDate()} />
      <TransactionList transactions={transactions} universe="personal" />
    </div>
  );
}
