import type {
  DeliveryBreakdown,
  FinanceSummary,
  Transaction,
  Universe,
} from "@/lib/types";

function sumByType(transactions: Transaction[], type: "income" | "expense") {
  return transactions
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + Number(t.amount), 0);
}

export function computeSummary(transactions: Transaction[]): FinanceSummary {
  const totalIncome = sumByType(transactions, "income");
  const totalExpense = sumByType(transactions, "expense");
  const balance = totalIncome - totalExpense;
  const marginPercent =
    totalIncome > 0 ? (balance / totalIncome) * 100 : null;

  return { totalIncome, totalExpense, balance, marginPercent };
}

export function computeDeliveryBreakdown(
  transactions: Transaction[],
): DeliveryBreakdown {
  const income = transactions.filter((t) => t.type === "income");
  const bySlug = (slug: string) =>
    income
      .filter((t) => t.category_slug === slug)
      .reduce((acc, t) => acc + Number(t.amount), 0);

  const doces = bySlug("venda_doces");
  const macarrao = bySlug("venda_macarrao");
  const sopa = bySlug("venda_sopa");
  const outrosSalgados = bySlug("venda_outros_salgados");
  const outrosReceita = bySlug("venda_outros");

  return {
    doces,
    macarrao,
    sopa,
    outrosSalgados,
    salgadosTotal: macarrao + sopa + outrosSalgados,
    outrosReceita,
  };
}

export function filterByMonth(
  transactions: Transaction[],
  yearMonth: string,
): Transaction[] {
  return transactions.filter((t) => t.occurred_at.startsWith(yearMonth));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function universeLabel(universe: Universe): string {
  return universe === "personal" ? "Pessoal" : "Empresa";
}
