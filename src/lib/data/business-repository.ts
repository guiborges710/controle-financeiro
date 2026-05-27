import "server-only";

import { isLocalMode } from "@/lib/config/mode";
import type {
  Expense,
  ExpenseType,
  Ingredient,
  MeasureUnit,
  Recipe,
  RecipeLine,
  Sale,
  SellableProduct,
} from "@/lib/types/business";
import {
  localCreateExpense,
  localCreateProduct,
  localCreateRecipe,
  localCreateSale,
  localDeleteExpense,
  localDeleteProduct,
  localDeleteRecipe,
  localDeleteSale,
  localGetBusinessSummary,
  localListExpenses,
  localListIngredients,
  localListProducts,
  localListRecipes,
  localListSales,
} from "@/lib/local/store";

function localOnly(): { error: string } | null {
  if (!isLocalMode()) {
    return { error: "Módulo empresa disponível no modo local por enquanto" };
  }
  return null;
}

export async function getIngredients(): Promise<Ingredient[]> {
  if (localOnly()) return [];
  return localListIngredients();
}

export async function getProducts(): Promise<SellableProduct[]> {
  if (localOnly()) return [];
  return localListProducts();
}

export async function getRecipes(): Promise<Recipe[]> {
  if (localOnly()) return [];
  return localListRecipes();
}

export async function getSales(yearMonth?: string): Promise<Sale[]> {
  if (localOnly()) return [];
  return localListSales(yearMonth);
}

export async function getExpenses(yearMonth?: string): Promise<Expense[]> {
  if (localOnly()) return [];
  return localListExpenses(yearMonth);
}

export async function getBusinessSummary(yearMonth?: string) {
  if (localOnly()) {
    return {
      totalSales: 0,
      totalExpenses: 0,
      balance: 0,
      marginPercent: null,
    };
  }
  return localGetBusinessSummary(yearMonth);
}

export async function createProduct(data: {
  name: string;
  size: string;
  sale_price: number;
  recipe_id: string;
}) {
  const block = localOnly();
  if (block) return block;
  return localCreateProduct(data);
}

export async function removeProduct(id: string) {
  const block = localOnly();
  if (block) return block;
  return localDeleteProduct(id);
}

export async function createRecipe(data: {
  name: string;
  yield_quantity: number;
  lines: RecipeLine[];
}) {
  const block = localOnly();
  if (block) return block;
  return localCreateRecipe(data);
}

export async function removeRecipe(id: string) {
  const block = localOnly();
  if (block) return block;
  return localDeleteRecipe(id);
}

export async function createSale(data: {
  product_id: string;
  quantity: number;
  occurred_at: string;
}) {
  const block = localOnly();
  if (block) return block;
  return localCreateSale(data);
}

export async function removeSale(id: string) {
  const block = localOnly();
  if (block) return block;
  return localDeleteSale(id);
}

export async function createExpense(data: {
  type: ExpenseType;
  description: string;
  amount: number;
  occurred_at: string;
  ingredient_name?: string;
  ingredient_unit?: MeasureUnit;
  quantity_purchased?: number;
}) {
  const block = localOnly();
  if (block) return block;
  return localCreateExpense(data);
}

export async function removeExpense(id: string) {
  const block = localOnly();
  if (block) return block;
  return localDeleteExpense(id);
}
