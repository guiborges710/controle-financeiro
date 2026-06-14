import "server-only";

import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { LOCAL_DEMO_USER } from "@/lib/auth/constants";
import type {
  Expense,
  ExpenseType,
  Ingredient,
  IngredientScaleUnit,
  MeasureUnit,
  Recipe,
  RecipeLine,
  Sale,
  SellableProduct,
  StockEntry,
} from "@/lib/types/business";
import type { BusinessProfile, Transaction, Universe } from "@/lib/types";

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "store.json");

export type LocalStore = {
  businessProfile: BusinessProfile | null;
  transactions: Transaction[];
  ingredients: Ingredient[];
  sellableProducts: SellableProduct[];
  recipes: Recipe[];
  sales: Sale[];
  expenses: Expense[];
  stock: StockEntry[];
};

function seedBusinessEntities(now: string, month: string) {
  return {
    ingredients: [],
    sellableProducts: [],
    recipes: [],
    sales: [],
    expenses: [],
  };
}

function seedStore(): LocalStore {
  const now = new Date().toISOString();
  const month = new Date().toISOString().slice(0, 7);
  const business = seedBusinessEntities(now, month);

  const mk = (
    universe: Universe,
    type: "income" | "expense",
    category_slug: string,
    amount: number,
    description: string,
    day: number,
  ): Transaction => ({
    id: randomUUID(),
    user_id: LOCAL_DEMO_USER.id,
    universe,
    type,
    category_slug,
    amount,
    description,
    occurred_at: `${month}-${String(day).padStart(2, "0")}`,
    metadata: {},
    created_at: now,
  });

  return {
    businessProfile: {
      id: randomUUID(),
      user_id: LOCAL_DEMO_USER.id,
      industry: "delivery",
      business_name: "Meu delivery (demo)",
      config: {},
      created_at: now,
      updated_at: now,
    },
    transactions: [],
    ...business,
    stock: [],
  };
}

function normalizeStore(parsed: Partial<LocalStore>): LocalStore {
  const base: LocalStore = {
    businessProfile: parsed.businessProfile ?? null,
    transactions: parsed.transactions ?? [],
    ingredients: (parsed.ingredients ?? []).map((i) => ({
      ...i,
      unit_scale: i.unit_scale ?? null,
      unit_scale_unit: i.unit_scale_unit ?? null,
    })),
    sellableProducts: (parsed.sellableProducts ?? []).map((p) => ({
      ...p,
      recipe_id: p.recipe_id ?? "",
    })).filter((p) => p.recipe_id),
    recipes: parsed.recipes ?? [],
    sales: parsed.sales ?? [],
    stock: parsed.stock ?? [],
    expenses: (parsed.expenses ?? []).map((e) => ({
      ...e,
      ingredient_name: e.ingredient_name ?? null,
      ingredient_unit: e.ingredient_unit ?? null,
    })),
  };

  if (base.ingredients.length === 0 && base.sellableProducts.length === 0) {
    const now = new Date().toISOString();
    const month = new Date().toISOString().slice(0, 7);
    const business = seedBusinessEntities(now, month);
    return { ...base, ...business };
  }

  return base;
}

async function readStore(): Promise<LocalStore> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    const normalized = normalizeStore(parsed);
    if (
      (parsed.ingredients?.length ?? 0) === 0 &&
      normalized.ingredients.length > 0
    ) {
      await writeStore(normalized);
    }
    return normalized;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw err;
    const seeded = seedStore();
    await writeStore(seeded);
    return seeded;
  }
}

async function writeStore(store: LocalStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function filterByMonth<T extends { occurred_at: string }>(
  items: T[],
  yearMonth?: string,
): T[] {
  if (!yearMonth) return items;
  const [y, m] = yearMonth.split("-").map(Number);
  const start = `${yearMonth}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;
  return items.filter((i) => i.occurred_at >= start && i.occurred_at <= end);
}

// --- Transactions (pessoal) ---

export async function localListTransactions(
  universe: Universe,
  yearMonth?: string,
): Promise<Transaction[]> {
  const store = await readStore();
  let list = store.transactions.filter(
    (t) => t.universe === universe && t.user_id === LOCAL_DEMO_USER.id,
  );
  list = filterByMonth(list, yearMonth);
  return list.sort((a, b) => {
    const d = b.occurred_at.localeCompare(a.occurred_at);
    if (d !== 0) return d;
    return b.created_at.localeCompare(a.created_at);
  });
}

export async function localInsertTransaction(
  input: Omit<Transaction, "id" | "user_id" | "created_at" | "metadata"> & {
    metadata?: Record<string, unknown>;
  },
): Promise<{ error?: string }> {
  const store = await readStore();
  store.transactions.push({
    id: randomUUID(),
    user_id: LOCAL_DEMO_USER.id,
    universe: input.universe,
    type: input.type,
    category_slug: input.category_slug,
    amount: input.amount,
    description: input.description,
    occurred_at: input.occurred_at,
    metadata: input.metadata ?? {},
    created_at: new Date().toISOString(),
  });
  await writeStore(store);
  return {};
}

export async function localDeleteTransaction(
  universe: Universe,
  id: string,
): Promise<{ error?: string }> {
  const store = await readStore();
  const before = store.transactions.length;
  store.transactions = store.transactions.filter(
    (t) => !(t.id === id && t.universe === universe),
  );
  if (store.transactions.length === before) {
    return { error: "Lançamento não encontrado" };
  }
  await writeStore(store);
  return {};
}

export async function localEnsureBusinessProfile(): Promise<void> {
  const store = await readStore();
  if (store.businessProfile) return;
  const now = new Date().toISOString();
  store.businessProfile = {
    id: randomUUID(),
    user_id: LOCAL_DEMO_USER.id,
    industry: "delivery",
    business_name: "Meu delivery",
    config: {},
    created_at: now,
    updated_at: now,
  };
  await writeStore(store);
}

export async function localResetDemoData(): Promise<void> {
  await writeStore(seedStore());
}

// --- Business entities ---

export async function localGetBusinessData() {
  return readStore();
}

export async function localListIngredients(): Promise<Ingredient[]> {
  const store = await readStore();
  return store.ingredients.sort((a, b) => a.name.localeCompare(b.name));
}

export async function localListProducts(): Promise<SellableProduct[]> {
  const store = await readStore();
  return store.sellableProducts.sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function localListRecipes(): Promise<Recipe[]> {
  const store = await readStore();
  return store.recipes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function localListSales(yearMonth?: string): Promise<Sale[]> {
  const store = await readStore();
  return filterByMonth(store.sales, yearMonth).sort((a, b) =>
    b.occurred_at.localeCompare(a.occurred_at),
  );
}

export async function localListStock(yearMonth?: string): Promise<StockEntry[]> {
  const store = await readStore();
  return filterByMonth(store.stock, yearMonth).sort((a, b) =>
    b.occurred_at.localeCompare(a.occurred_at),
  );
}

export async function localListExpenses(yearMonth?: string): Promise<Expense[]> {
  const store = await readStore();
  return filterByMonth(store.expenses, yearMonth).sort((a, b) =>
    b.occurred_at.localeCompare(a.occurred_at),
  );
}

function upsertIngredient(
  store: LocalStore,
  name: string,
  unit: MeasureUnit,
  unitCost: number,
): Ingredient {
  const existing = store.ingredients.find(
    (i) => i.name.toLowerCase() === name.toLowerCase() && i.unit === unit,
  );
  const now = new Date().toISOString();
  if (existing) {
    existing.unit_cost = unitCost;
    existing.updated_at = now;
    return existing;
  }
  const created: Ingredient = {
    id: randomUUID(),
    name,
    unit,
    unit_cost: unitCost,
    updated_at: now,
  };
  store.ingredients.push(created);
  return created;
}

function recalculateIngredientAverage(
  store: LocalStore,
  name: string,
  unit: MeasureUnit,
): Ingredient {
  const normalizedName = name.trim();
  const matchingExpenses = store.expenses.filter(
    (expense) =>
      expense.type === "insumo" &&
      expense.ingredient_name?.toLowerCase() === normalizedName.toLowerCase() &&
      expense.ingredient_unit === unit &&
      expense.quantity_purchased != null &&
      expense.quantity_purchased > 0,
  );
  const totalAmount = matchingExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalQuantity = matchingExpenses.reduce(
    (sum, expense) => sum + (expense.quantity_purchased ?? 0),
    0,
  );
  const averageCost = totalQuantity > 0 ? totalAmount / totalQuantity : 0;
  const ingredient = upsertIngredient(store, normalizedName, unit, averageCost);

  for (const expense of matchingExpenses) {
    expense.ingredient_id = ingredient.id;
    expense.unit_cost =
      expense.quantity_purchased && expense.quantity_purchased > 0
        ? expense.amount / expense.quantity_purchased
        : null;
  }

  return ingredient;
}

export async function localClearIngredients(): Promise<{ error?: string }> {
  const store = await readStore();
  const ingredientIds = new Set(store.ingredients.map((i) => i.id));

  store.ingredients = [];
  store.recipes = store.recipes.map((recipe) => ({
    ...recipe,
    lines: recipe.lines.filter((line) => !ingredientIds.has(line.ingredient_id)),
  }));
  store.expenses = store.expenses.map((expense) => ({
    ...expense,
    ingredient_id: null,
  }));

  await writeStore(store);
  return {};
}

export async function localUpdateIngredientScale(
  id: string,
  unit_scale: number | null,
  unit_scale_unit: IngredientScaleUnit | null,
): Promise<{ error?: string }> {
  const store = await readStore();
  const ingredient = store.ingredients.find((i) => i.id === id);
  if (!ingredient) {
    return { error: "Insumo não encontrado" };
  }

  if (unit_scale != null && unit_scale <= 0) {
    return { error: "Informe uma escala válida" };
  }

  ingredient.unit_scale = unit_scale;
  ingredient.unit_scale_unit = unit_scale_unit;
  ingredient.updated_at = new Date().toISOString();
  await writeStore(store);
  return {};
}

export async function localDeleteIngredient(id: string): Promise<{ error?: string }> {
  const store = await readStore();
  const ingredient = store.ingredients.find((i) => i.id === id);
  if (!ingredient) return { error: "Insumo não encontrado" };

  store.ingredients = store.ingredients.filter((i) => i.id !== id);
  store.recipes = store.recipes.map((recipe) => ({
    ...recipe,
    lines: recipe.lines.filter((line) => line.ingredient_id !== id),
  }));
  store.expenses = store.expenses.map((expense) =>
    expense.ingredient_id === id ? { ...expense, ingredient_id: null } : expense,
  );

  await writeStore(store);
  return {};
}

export async function localCreateProduct(input: {
  name: string;
  size: string;
  sale_price: number;
  recipe_id: string;
}): Promise<{ error?: string }> {
  if (!input.recipe_id) {
    return { error: "Selecione uma receita" };
  }

  const store = await readStore();
  const recipe = store.recipes.find((r) => r.id === input.recipe_id);
  if (!recipe) {
    return { error: "Receita não encontrada" };
  }

  store.sellableProducts.push({
    id: randomUUID(),
    name: input.name,
    size: input.size,
    sale_price: input.sale_price,
    recipe_id: input.recipe_id,
    created_at: new Date().toISOString(),
  });
  await writeStore(store);
  return {};
}

export async function localDeleteProduct(id: string): Promise<{ error?: string }> {
  const store = await readStore();
  store.sellableProducts = store.sellableProducts.filter((p) => p.id !== id);
  await writeStore(store);
  return {};
}

export async function localCreateRecipe(input: {
  name: string;
  yield_quantity: number;
  lines: RecipeLine[];
}): Promise<{ error?: string }> {
  if (input.lines.length === 0) {
    return { error: "Adicione pelo menos um ingrediente" };
  }
  const store = await readStore();
  store.recipes.push({
    id: randomUUID(),
    name: input.name,
    sellable_product_id: null,
    yield_quantity: input.yield_quantity,
    lines: input.lines,
    created_at: new Date().toISOString(),
  });
  await writeStore(store);
  return {};
}

export async function localDeleteRecipe(id: string): Promise<{ error?: string }> {
  const store = await readStore();
  const hasProducts = store.sellableProducts.some((p) => p.recipe_id === id);
  if (hasProducts) {
    return {
      error: "Remova os produtos vinculados a esta receita antes de excluí-la",
    };
  }
  store.recipes = store.recipes.filter((r) => r.id !== id);
  await writeStore(store);
  return {};
}

export async function localCreateSale(input: {
  product_id: string;
  description: string;
  quantity: number;
  occurred_at: string;
}): Promise<{ error?: string }> {
  const store = await readStore();
  const product = store.sellableProducts.find((p) => p.id === input.product_id);
  if (!product) return { error: "Produto não encontrado" };
  if (input.quantity <= 0) return { error: "Quantidade inválida" };

  store.sales.push({
    id: randomUUID(),
    product_id: input.product_id,
    description: input.description ?? "",
    quantity: input.quantity,
    unit_price: product.sale_price,
    total: product.sale_price * input.quantity,
    occurred_at: input.occurred_at,
    created_at: new Date().toISOString(),
  });
  await writeStore(store);
  return {};
}

export async function localCreateStock(input: {
  recipe_id: string;
  produced_quantity: number;
  occurred_at: string;
}): Promise<{ error?: string }> {
  const store = await readStore();
  const recipe = store.recipes.find((r) => r.id === input.recipe_id);
  if (!recipe) return { error: "Receita não encontrada" };
  if (!input.produced_quantity || input.produced_quantity <= 0) {
    return { error: "Quantidade produzida inválida" };
  }

  // Calcular custo total a partir dos insumos
  let totalCost = 0;
  for (const line of recipe.lines) {
    const ing = store.ingredients.find((i) => i.id === line.ingredient_id);
    if (!ing) continue;
    totalCost += line.quantity * ing.unit_cost;
  }

  const costPerUnit = totalCost / input.produced_quantity;

  store.stock.push({
    id: randomUUID(),
    recipe_id: input.recipe_id,
    produced_quantity: input.produced_quantity,
    cost_per_unit: costPerUnit,
    total_cost: totalCost,
    occurred_at: input.occurred_at,
    created_at: new Date().toISOString(),
  });

  await writeStore(store);
  return {};
}

export async function localDeleteSale(id: string): Promise<{ error?: string }> {
  const store = await readStore();
  store.sales = store.sales.filter((s) => s.id !== id);
  await writeStore(store);
  return {};
}

export async function localCreateExpense(input: {
  type: ExpenseType;
  description: string;
  amount: number;
  occurred_at: string;
  ingredient_name?: string;
  ingredient_unit?: MeasureUnit;
  quantity_purchased?: number;
}): Promise<{ error?: string }> {
  const store = await readStore();
  const now = new Date().toISOString();
  let quantity_purchased: number | null = null;
  let unit_cost: number | null = null;

  if (input.type === "insumo") {
    if (!input.ingredient_name?.trim()) {
      return { error: "Informe o nome do insumo" };
    }
    if (!input.ingredient_unit) {
      return { error: "Informe a unidade do insumo" };
    }
    if (!input.quantity_purchased || input.quantity_purchased <= 0) {
      return { error: "Informe a quantidade comprada" };
    }
    unit_cost = input.amount / input.quantity_purchased;
    quantity_purchased = input.quantity_purchased;
  }

  const expense: Expense = {
    id: randomUUID(),
    type: input.type,
    description: input.description,
    amount: input.amount,
    occurred_at: input.occurred_at,
    ingredient_id: null,
    ingredient_name:
      input.type === "insumo" ? input.ingredient_name?.trim() ?? null : null,
    ingredient_unit:
      input.type === "insumo" ? input.ingredient_unit ?? null : null,
    quantity_purchased,
    unit_cost,
    created_at: now,
  };
  store.expenses.push(expense);

  if (input.type === "insumo" && input.ingredient_name && input.ingredient_unit) {
    const ing = recalculateIngredientAverage(
      store,
      input.ingredient_name,
      input.ingredient_unit,
    );
    expense.ingredient_id = ing.id;
  }

  await writeStore(store);
  return {};
}

export async function localConvertExpenseToIngredient(
  id: string,
  input: {
    ingredient_name: string;
    ingredient_unit: MeasureUnit;
    quantity_purchased: number;
  },
): Promise<{ error?: string }> {
  const store = await readStore();
  const expense = store.expenses.find((e) => e.id === id);
  if (!expense) return { error: "Gasto não encontrado" };
  if (!input.ingredient_name.trim()) return { error: "Informe o nome do insumo" };
  if (!input.quantity_purchased || input.quantity_purchased <= 0) {
    return { error: "Informe a quantidade comprada" };
  }

  expense.type = "insumo";
  expense.ingredient_name = input.ingredient_name.trim();
  expense.ingredient_unit = input.ingredient_unit;
  expense.quantity_purchased = input.quantity_purchased;
  expense.unit_cost = expense.amount / input.quantity_purchased;

  const ingredient = recalculateIngredientAverage(
    store,
    expense.ingredient_name,
    input.ingredient_unit,
  );
  expense.ingredient_id = ingredient.id;

  await writeStore(store);
  return {};
}

export async function localDeleteExpense(id: string): Promise<{ error?: string }> {
  const store = await readStore();
  store.expenses = store.expenses.filter((e) => e.id !== id);
  await writeStore(store);
  return {};
}

export async function localGetBusinessSummary(yearMonth?: string) {
  const sales = await localListSales(yearMonth);
  const expenses = await localListExpenses(yearMonth);
  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const balance = totalSales - totalExpenses;
  const marginPercent =
    totalSales > 0 ? (balance / totalSales) * 100 : null;
  return { totalSales, totalExpenses, balance, marginPercent };
}
