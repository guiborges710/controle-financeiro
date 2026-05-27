import type { TransactionType, Universe } from "@/lib/types";

export type CategoryDef = {
  slug: string;
  label: string;
  type: TransactionType;
  group?: string;
  hint?: string;
};

export const PERSONAL_CATEGORIES: CategoryDef[] = [
  { slug: "salario", label: "Salário", type: "income", group: "Receitas" },
  { slug: "freelance", label: "Freelance / extras", type: "income", group: "Receitas" },
  { slug: "investimentos", label: "Investimentos", type: "income", group: "Receitas" },
  { slug: "outras_receitas", label: "Outras receitas", type: "income", group: "Receitas" },
  { slug: "moradia", label: "Moradia", type: "expense", group: "Despesas" },
  { slug: "alimentacao", label: "Alimentação", type: "expense", group: "Despesas" },
  { slug: "transporte", label: "Transporte", type: "expense", group: "Despesas" },
  { slug: "saude", label: "Saúde", type: "expense", group: "Despesas" },
  { slug: "lazer", label: "Lazer", type: "expense", group: "Despesas" },
  { slug: "educacao", label: "Educação", type: "expense", group: "Despesas" },
  { slug: "contas", label: "Contas fixas", type: "expense", group: "Despesas" },
  { slug: "outras_despesas", label: "Outras despesas", type: "expense", group: "Despesas" },
];

/** Delivery: doces + pratos salgados (macarrão, sopa e afins) */
export const DELIVERY_CATEGORIES: CategoryDef[] = [
  {
    slug: "venda_doces",
    label: "Venda — doces",
    type: "income",
    group: "Faturamento",
    hint: "Bolos, brigadeiros, sobremesas etc.",
  },
  {
    slug: "venda_macarrao",
    label: "Venda — macarrão",
    type: "income",
    group: "Faturamento",
    hint: "Pratos de massa",
  },
  {
    slug: "venda_sopa",
    label: "Venda — sopa",
    type: "income",
    group: "Faturamento",
    hint: "Sopas e caldos",
  },
  {
    slug: "venda_outros_salgados",
    label: "Venda — outros salgados",
    type: "income",
    group: "Faturamento",
    hint: "Outros pratos salgados",
  },
  {
    slug: "venda_outros",
    label: "Outras vendas",
    type: "income",
    group: "Faturamento",
  },
  {
    slug: "ingredientes",
    label: "Ingredientes",
    type: "expense",
    group: "Custos",
    hint: "Compras para produção",
  },
  {
    slug: "embalagens",
    label: "Embalagens",
    type: "expense",
    group: "Custos",
  },
  {
    slug: "taxas_apps",
    label: "Taxas de apps (iFood, etc.)",
    type: "expense",
    group: "Custos",
  },
  {
    slug: "entregador",
    label: "Entregador / motoboy",
    type: "expense",
    group: "Custos",
  },
  {
    slug: "gas_cozinha",
    label: "Gás / energia cozinha",
    type: "expense",
    group: "Operação",
  },
  {
    slug: "mao_de_obra",
    label: "Mão de obra",
    type: "expense",
    group: "Operação",
  },
  {
    slug: "marketing",
    label: "Marketing",
    type: "expense",
    group: "Operação",
  },
  {
    slug: "aluguel",
    label: "Aluguel / estrutura",
    type: "expense",
    group: "Operação",
  },
  {
    slug: "outros_custos",
    label: "Outros custos",
    type: "expense",
    group: "Operação",
  },
];

export function getCategoriesForUniverse(universe: Universe): CategoryDef[] {
  return universe === "personal" ? PERSONAL_CATEGORIES : DELIVERY_CATEGORIES;
}

export function getCategoryLabel(
  universe: Universe,
  slug: string,
): string {
  const cat = getCategoriesForUniverse(universe).find((c) => c.slug === slug);
  return cat?.label ?? slug;
}
