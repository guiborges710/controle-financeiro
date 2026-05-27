"use server";

import { revalidatePath } from "next/cache";
import {
  createExpense,
  createProduct,
  createRecipe,
  createSale,
  removeExpense,
  removeProduct,
  removeRecipe,
  removeSale,
} from "@/lib/data/business-repository";
import type { ExpenseType, MeasureUnit } from "@/lib/types/business";

function revalidateEmpresa() {
  revalidatePath("/empresa");
  revalidatePath("/empresa/vendas");
  revalidatePath("/empresa/gastos");
  revalidatePath("/empresa/receitas");
  revalidatePath("/empresa/produtos");
}

export async function saveProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const sale_price = Number(formData.get("sale_price"));
  const recipe_id = String(formData.get("recipe_id") ?? "").trim();

  if (!name || !size) return { error: "Preencha nome e tamanho" };
  if (!sale_price || sale_price <= 0) return { error: "Preço inválido" };
  if (!recipe_id) return { error: "Selecione uma receita (obrigatório)" };

  const result = await createProduct({
    name,
    size,
    sale_price,
    recipe_id,
  });
  if (result.error) return result;
  revalidateEmpresa();
  return { success: true };
}

export async function deleteProductAction(id: string): Promise<void> {
  await removeProduct(id);
  revalidateEmpresa();
}

export async function saveRecipe(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const yield_quantity = Number(formData.get("yield_quantity") ?? 1);
  const linesRaw = String(formData.get("lines") ?? "[]");

  if (!name) return { error: "Informe o nome da receita" };

  let lines: { ingredient_id: string; quantity: number; unit: MeasureUnit }[];
  try {
    lines = JSON.parse(linesRaw);
  } catch {
    return { error: "Ingredientes inválidos" };
  }

  const result = await createRecipe({
    name,
    yield_quantity: yield_quantity > 0 ? yield_quantity : 1,
    lines,
  });
  if (result.error) return result;
  revalidateEmpresa();
  return { success: true };
}

export async function deleteRecipeAction(id: string): Promise<void> {
  const result = await removeRecipe(id);
  if (result.error) {
    throw new Error(result.error);
  }
  revalidateEmpresa();
}

export async function saveSale(formData: FormData) {
  const product_id = String(formData.get("product_id") ?? "");
  const quantity = Number(formData.get("quantity"));
  const occurred_at = String(formData.get("occurred_at") ?? "");

  if (!product_id) return { error: "Selecione um produto" };
  if (!quantity || quantity <= 0) return { error: "Quantidade inválida" };
  if (!occurred_at) return { error: "Informe a data" };

  const result = await createSale({ product_id, quantity, occurred_at });
  if (result.error) return result;
  revalidateEmpresa();
  return { success: true };
}

export async function deleteSaleAction(id: string): Promise<void> {
  await removeSale(id);
  revalidateEmpresa();
}

export async function saveExpense(formData: FormData) {
  const type = String(formData.get("type") ?? "") as ExpenseType;
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const occurred_at = String(formData.get("occurred_at") ?? "");
  const ingredient_name = String(formData.get("ingredient_name") ?? "").trim();
  const ingredient_unit = String(
    formData.get("ingredient_unit") ?? "",
  ) as MeasureUnit;
  const quantity_purchased = Number(formData.get("quantity_purchased"));

  if (!description) return { error: "Informe a descrição" };
  if (!amount || amount <= 0) return { error: "Valor inválido" };
  if (!occurred_at) return { error: "Informe a data" };

  if (type === "insumo") {
    if (!ingredient_name) return { error: "Informe o nome do item" };
    if (!ingredient_unit) return { error: "Escolha a unidade de medida" };
    if (!quantity_purchased || quantity_purchased <= 0) {
      return { error: "Informe quantas unidades você comprou" };
    }
  }

  const result = await createExpense({
    type,
    description,
    amount,
    occurred_at,
    ingredient_name: type === "insumo" ? ingredient_name : undefined,
    ingredient_unit: type === "insumo" ? ingredient_unit : undefined,
    quantity_purchased:
      type === "insumo" ? quantity_purchased : undefined,
  });
  if (result.error) return result;
  revalidateEmpresa();
  return { success: true };
}

export async function deleteExpenseAction(id: string): Promise<void> {
  await removeExpense(id);
  revalidateEmpresa();
}
