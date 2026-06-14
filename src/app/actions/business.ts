"use server";

import { revalidatePath } from "next/cache";
import {
  createExpense,
  createProduct,
  createRecipe,
  createSale,
  createStock,
  clearIngredients,
  convertExpenseToIngredient,
  removeExpense,
  removeIngredient,
  removeProduct,
  removeRecipe,
  removeSale,
  updateIngredientScale,
} from "@/lib/data/business-repository";
import type {
  ExpenseType,
  IngredientScaleUnit,
  MeasureUnit,
} from "@/lib/types/business";

function revalidateEmpresa() {
  revalidatePath("/empresa");
  revalidatePath("/empresa/vendas");
  revalidatePath("/empresa/gastos");
  revalidatePath("/empresa/receitas");
  revalidatePath("/empresa/produtos");
  revalidatePath("/empresa/estoque");
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
  const description = String(formData.get("description") ?? "");
  const quantity = Number(formData.get("quantity"));
  const occurred_at = String(formData.get("occurred_at") ?? "");

  if (!product_id) return { error: "Selecione um produto" };
  // if (!description) return { error: "Informe a descrição" };
  if (!quantity || quantity <= 0) return { error: "Quantidade inválida" };
  if (!occurred_at) return { error: "Informe a data" };

  const result = await createSale({ product_id, description, quantity, occurred_at });
  if (result.error) return result;
  revalidateEmpresa();
  return { success: true };
}

export async function deleteSaleAction(id: string): Promise<void> {
  await removeSale(id);
  revalidateEmpresa();
}

export async function saveProduction(formData: FormData) {
  const recipe_id = String(formData.get("recipe_id") ?? "");
  const produced_quantity = Number(formData.get("produced_quantity"));
  const occurred_at = String(formData.get("occurred_at") ?? "");

  if (!recipe_id) return { error: "Selecione uma receita" };
  if (!produced_quantity || produced_quantity <= 0)
    return { error: "Quantidade inválida" };
  if (!occurred_at) return { error: "Informe a data" };

  const result = await createStock({ recipe_id, produced_quantity, occurred_at });
  if (result.error) return result;
  revalidateEmpresa();
  return { success: true };
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

type CsvExpenseRow = {
  data: string;
  categoria: string;
  produto: string;
  marca: string;
  quantidade: string;
  unidade: string;
  valorTotal: string;
  fornecedor: string;
  observacao: string;
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function parseBrazilianMoney(value: string) {
  const normalized = value
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(normalized);
}

function parseBrazilianNumber(value: string) {
  return Number(value.replace(/\./g, "").replace(",", "."));
}

function parseBrazilianDate(value: string) {
  const [day, month, year] = value.split("/").map((part) => Number(part));
  if (!day || !month || !year) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function mapCsvExpenseType(category: string): ExpenseType {
  const normalized = normalizeHeader(category);
  if (normalized.includes("ingrediente")) return "insumo";
  if (normalized.includes("embalagem")) return "embalagem";
  if (normalized.includes("energia") || normalized.includes("luz")) {
    return "energia";
  }
  if (normalized === "gas" || normalized.includes("gas")) return "gas";
  return "outros";
}

function mapCsvUnit(unit: string, quantity: number) {
  const normalized = normalizeHeader(unit);
  if (normalized === "g" || normalized === "grama" || normalized === "gramas") {
    return { unit: "g" as MeasureUnit, quantity };
  }
  if (normalized === "kg" || normalized === "quilo" || normalized === "quilos") {
    return { unit: "g" as MeasureUnit, quantity: quantity * 1000 };
  }
  if (
    normalized === "ml" ||
    normalized === "mililitro" ||
    normalized === "mililitros"
  ) {
    return { unit: "ml" as MeasureUnit, quantity };
  }
  if (normalized === "l" || normalized === "litro" || normalized === "litros") {
    return { unit: "ml" as MeasureUnit, quantity: quantity * 1000 };
  }
  return { unit: "unidade" as MeasureUnit, quantity };
}

function parseExpenseCsv(text: string): CsvExpenseRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const index = (name: string) => headers.indexOf(name);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const get = (name: string) => {
      const columnIndex = index(name);
      return columnIndex >= 0 ? values[columnIndex]?.trim() ?? "" : "";
    };

    return {
      data: get("data"),
      categoria: get("categoria"),
      produto: get("produto"),
      marca: get("marca"),
      quantidade: get("quantidade"),
      unidade: get("unidade"),
      valorTotal: get("valortotal"),
      fornecedor: get("fornecedor"),
      observacao: get("observacao"),
    };
  });
}

export async function importExpensesCsv(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo CSV" };
  }

  const text = await file.text();
  const rows = parseExpenseCsv(text);
  if (rows.length === 0) return { error: "CSV sem linhas para importar" };

  let imported = 0;
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    const lineNumber = index + 2;
    const occurred_at = parseBrazilianDate(row.data);
    const amount = parseBrazilianMoney(row.valorTotal);
    const quantity = parseBrazilianNumber(row.quantidade || "1");
    const type = mapCsvExpenseType(row.categoria);

    if (!occurred_at) {
      errors.push(`Linha ${lineNumber}: data inválida`);
      continue;
    }
    if (!amount || amount <= 0) {
      errors.push(`Linha ${lineNumber}: valor inválido`);
      continue;
    }
    if (!row.produto) {
      errors.push(`Linha ${lineNumber}: produto vazio`);
      continue;
    }

    const descriptionParts = [row.produto, row.marca, row.fornecedor]
      .map((part) => part.trim())
      .filter(Boolean);
    const description = descriptionParts.join(" - ");

    const result = await createExpense({
      type,
      description,
      amount,
      occurred_at,
      ingredient_name: type === "insumo" ? row.produto : undefined,
      ingredient_unit:
        type === "insumo" ? mapCsvUnit(row.unidade, quantity).unit : undefined,
      quantity_purchased:
        type === "insumo"
          ? mapCsvUnit(row.unidade, quantity).quantity
          : undefined,
    });

    if (result.error) {
      errors.push(`Linha ${lineNumber}: ${result.error}`);
      continue;
    }

    imported += 1;
  }

  revalidateEmpresa();

  if (imported === 0) {
    return {
      error: errors.slice(0, 5).join("; ") || "Nenhuma linha foi importada",
    };
  }

  return {
    success: true,
    imported,
    errors: errors.slice(0, 5),
    skipped: errors.length,
  };
}

export async function addExpenseToIngredient(
  id: string,
  formData: FormData,
) {
  const ingredient_name = String(formData.get("ingredient_name") ?? "").trim();
  const ingredient_unit = String(
    formData.get("ingredient_unit") ?? "",
  ) as MeasureUnit;
  const quantity_purchased = Number(formData.get("quantity_purchased"));

  if (!ingredient_name) return { error: "Informe o nome do item" };
  if (!ingredient_unit) return { error: "Escolha a unidade de medida" };
  if (!quantity_purchased || quantity_purchased <= 0) {
    return { error: "Informe quantas unidades você comprou" };
  }

  const result = await convertExpenseToIngredient(id, {
    ingredient_name,
    ingredient_unit,
    quantity_purchased,
  });
  if (result.error) return result;
  revalidateEmpresa();
  return { success: true };
}

export async function clearIngredientsAction(): Promise<void> {
  const result = await clearIngredients();
  if (result.error) {
    throw new Error(result.error);
  }
  revalidateEmpresa();
}

export async function saveIngredientScale(
  id: string,
  formData: FormData,
): Promise<void> {
  const rawValue = String(formData.get("unit_scale") ?? "").trim();
  const unit_scale = rawValue === "" ? null : Number(rawValue);
  const rawUnit = String(formData.get("unit_scale_unit") ?? "").trim();
  const unit_scale_unit =
    rawValue === "" ? null : (rawUnit as IngredientScaleUnit);

  if (
    rawValue !== "" &&
    (Number.isNaN(unit_scale as number) || (unit_scale as number) <= 0)
  ) {
    throw new Error("Informe uma escala válida");
  }

  if (
    unit_scale_unit != null &&
    unit_scale_unit !== "unidade" &&
    unit_scale_unit !== "g"
  ) {
    throw new Error("Escolha unidade ou gramagem");
  }

  const result = await updateIngredientScale(id, unit_scale, unit_scale_unit);
  if (result.error) {
    throw new Error(result.error);
  }

  revalidateEmpresa();
}

export async function deleteIngredientAction(id: string): Promise<void> {
  const result = await removeIngredient(id);
  if (result.error) {
    throw new Error(result.error);
  }
  revalidateEmpresa();
}

export async function deleteExpenseAction(id: string): Promise<void> {
  await removeExpense(id);
  revalidateEmpresa();
}
