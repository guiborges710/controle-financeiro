export type Universe = "business";

export type TransactionType = "income" | "expense";

export type Industry = "delivery";

export type Transaction = {
  id: string;
  user_id: string;
  universe: Universe;
  type: TransactionType;
  category_slug: string;
  amount: number;
  description: string | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type BusinessProfile = {
  id: string;
  user_id: string;
  industry: Industry;
  business_name: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type FinanceSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  marginPercent: number | null;
};

export type DeliveryBreakdown = {
  doces: number;
  macarrao: number;
  sopa: number;
  outrosSalgados: number;
  salgadosTotal: number;
  outrosReceita: number;
};
