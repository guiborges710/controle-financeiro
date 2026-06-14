import "server-only";

import { getSession } from "@/lib/auth/session";
import { isLocalMode } from "@/lib/config/mode";
import { getActiveBusinessAccess } from "@/lib/data/business-access";
import {
  localCreateExpense,
  localCreateProduct,
  localCreateRecipe,
  localCreateSale,
  localCreateStock,
  localClearIngredients,
  localConvertExpenseToIngredient,
  localDeleteIngredient,
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
  localListStock,
  localUpdateIngredientScale,
} from "@/lib/local/store";
import { createClient } from "@/lib/supabase/server";
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
} from "@/lib/types/business";

async function requireEditableBusiness() {
  const user = await getSession();
  if (!user) return { error: "Faça login para continuar" as const };

  const access = await getActiveBusinessAccess();
  if (!access) return { error: "Projeto não encontrado" as const };
  if (access.role === "viewer") {
    return { error: "Você não tem permissão para editar" as const };
  }

  return { user, access };
}

function createdBy(row: { created_by_email?: string | null }) {
  return row.created_by_email ?? null;
}

async function recalculateRemoteIngredientAverage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  actor: { id: string; email: string },
  name: string,
  unit: MeasureUnit,
) {
  const ingredientName = name.trim();
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("id, amount, quantity_purchased")
    .eq("user_id", ownerId)
    .eq("type", "insumo")
    .eq("ingredient_name", ingredientName)
    .eq("ingredient_unit", unit)
    .not("quantity_purchased", "is", null);

  if (expensesError) return { error: expensesError.message };

  const rows = expenses ?? [];
  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount), 0);
  const totalQuantity = rows.reduce(
    (sum, row) => sum + Number(row.quantity_purchased ?? 0),
    0,
  );
  if (totalQuantity <= 0) return { error: "Informe a quantidade comprada" };

  const averageCost = totalAmount / totalQuantity;
  const { data: existing } = await supabase
    .from("ingredients")
    .select("id")
    .eq("user_id", ownerId)
    .eq("name", ingredientName)
    .eq("unit", unit)
    .maybeSingle();

  let ingredientId = existing?.id as string | undefined;
  if (ingredientId) {
    const { error } = await supabase
      .from("ingredients")
      .update({
        unit_cost: averageCost,
        created_by: actor.id,
        created_by_email: actor.email,
      })
      .eq("id", ingredientId);
    if (error) return { error: error.message };
  } else {
    const { data: created, error } = await supabase
      .from("ingredients")
      .insert({
        user_id: ownerId,
        created_by: actor.id,
        created_by_email: actor.email,
        name: ingredientName,
        unit,
        unit_cost: averageCost,
      })
      .select("id")
      .single();
    if (error || !created) {
      return { error: error?.message ?? "Erro ao criar insumo" };
    }
    ingredientId = created.id;
  }

  const { error: updateExpensesError } = await supabase
    .from("expenses")
    .update({ ingredient_id: ingredientId })
    .eq("user_id", ownerId)
    .eq("type", "insumo")
    .eq("ingredient_name", ingredientName)
    .eq("ingredient_unit", unit);

  if (updateExpensesError) return { error: updateExpensesError.message };
  return { ingredientId };
}

export async function getIngredients(): Promise<Ingredient[]> {
  if (isLocalMode()) return localListIngredients();

  const access = await getActiveBusinessAccess();
  if (!access) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .eq("user_id", access.ownerId)
    .order("name", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit as MeasureUnit,
    unit_cost: Number(row.unit_cost),
    unit_scale: row.unit_scale ? Number(row.unit_scale) : null,
    unit_scale_unit: row.unit_scale_unit ?? null,
    created_by_email: createdBy(row),
    updated_at: row.updated_at,
  })) as Ingredient[];
}

export async function createIngredient(data: {
  name: string;
  unit: MeasureUnit;
  unit_cost: number;
}) {
  if (isLocalMode()) {
    return { error: "Use a criação de despesa para registrar insumos" };
  }

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").insert({
    user_id: editable.access.ownerId,
    created_by: editable.user.id,
    created_by_email: editable.user.email,
    name: data.name,
    unit: data.unit,
    unit_cost: data.unit_cost,
  });

  if (error) return { error: error.message };
  return {};
}

export async function removeIngredient(id: string) {
  if (isLocalMode()) return localDeleteIngredient(id);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").delete().eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function getProducts(): Promise<SellableProduct[]> {
  if (isLocalMode()) return localListProducts();

  const access = await getActiveBusinessAccess();
  if (!access) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", access.ownerId)
    .order("name", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    size: row.size,
    sale_price: Number(row.sale_price),
    recipe_id: row.recipe_id,
    created_by_email: createdBy(row),
    created_at: row.created_at,
  })) as SellableProduct[];
}

export async function getRecipes(): Promise<Recipe[]> {
  if (isLocalMode()) return localListRecipes();

  const access = await getActiveBusinessAccess();
  if (!access) return [];

  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", access.ownerId)
    .order("name", { ascending: true });

  if (error || !recipes) return [];

  const recipeIds = recipes.map((r) => r.id);
  if (recipeIds.length === 0) return [];

  const { data: lines } = await supabase
    .from("recipe_lines")
    .select("*")
    .in("recipe_id", recipeIds);

  const linesMap = new Map<string, RecipeLine[]>();
  if (lines) {
    for (const line of lines) {
      if (!linesMap.has(line.recipe_id)) linesMap.set(line.recipe_id, []);
      linesMap.get(line.recipe_id)!.push({
        ingredient_id: line.ingredient_id,
        quantity: Number(line.quantity),
        unit: line.unit as MeasureUnit,
      });
    }
  }

  return recipes.map((row) => ({
    id: row.id,
    name: row.name,
    sellable_product_id: null,
    yield_quantity: Number(row.yield_quantity),
    lines: linesMap.get(row.id) ?? [],
    created_by_email: createdBy(row),
    created_at: row.created_at,
  })) as Recipe[];
}

export async function getSales(yearMonth?: string): Promise<Sale[]> {
  if (isLocalMode()) return localListSales(yearMonth);

  const access = await getActiveBusinessAccess();
  if (!access) return [];

  const supabase = await createClient();
  let query = supabase
    .from("sales")
    .select("*")
    .eq("user_id", access.ownerId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (yearMonth) {
    const [y, m] = yearMonth.split("-").map(Number);
    const start = `${yearMonth}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("occurred_at", start).lte("occurred_at", end);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    product_id: row.product_id,
    description: row.description,
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
    total: Number(row.total),
    occurred_at: row.occurred_at,
    created_by_email: createdBy(row),
    created_at: row.created_at,
  })) as Sale[];
}

export async function getExpenses(yearMonth?: string): Promise<Expense[]> {
  if (isLocalMode()) return localListExpenses(yearMonth);

  const access = await getActiveBusinessAccess();
  if (!access) return [];

  const supabase = await createClient();
  let query = supabase
    .from("expenses")
    .select("*")
    .eq("user_id", access.ownerId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (yearMonth) {
    const [y, m] = yearMonth.split("-").map(Number);
    const start = `${yearMonth}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("occurred_at", start).lte("occurred_at", end);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    type: row.type as ExpenseType,
    description: row.description,
    amount: Number(row.amount),
    occurred_at: row.occurred_at,
    ingredient_id: row.ingredient_id,
    ingredient_name: row.ingredient_name,
    ingredient_unit: row.ingredient_unit as MeasureUnit | null,
    quantity_purchased: row.quantity_purchased
      ? Number(row.quantity_purchased)
      : null,
    unit_cost: row.unit_cost ? Number(row.unit_cost) : null,
    created_by_email: createdBy(row),
    created_at: row.created_at,
  })) as Expense[];
}

export async function getBusinessSummary(yearMonth?: string) {
  if (isLocalMode()) return localGetBusinessSummary(yearMonth);

  const [sales, expenses] = await Promise.all([
    getSales(yearMonth),
    getExpenses(yearMonth),
  ]);

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalSales - totalExpenses;
  const marginPercent = totalSales > 0 ? (balance / totalSales) * 100 : null;

  return {
    totalSales,
    totalExpenses,
    balance,
    marginPercent,
  };
}

export async function getStocks(yearMonth?: string) {
  if (isLocalMode()) return localListStock(yearMonth);
  return [];
}

export async function createProduct(data: {
  name: string;
  size: string;
  sale_price: number;
  recipe_id: string;
}) {
  if (isLocalMode()) return localCreateProduct(data);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    user_id: editable.access.ownerId,
    created_by: editable.user.id,
    created_by_email: editable.user.email,
    ...data,
  });

  if (error) return { error: error.message };
  return {};
}

export async function removeProduct(id: string) {
  if (isLocalMode()) return localDeleteProduct(id);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function createRecipe(data: {
  name: string;
  yield_quantity: number;
  lines: RecipeLine[];
}) {
  if (isLocalMode()) return localCreateRecipe(data);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: editable.access.ownerId,
      created_by: editable.user.id,
      created_by_email: editable.user.email,
      name: data.name,
      yield_quantity: data.yield_quantity,
    })
    .select()
    .single();

  if (recipeError || !recipe) {
    return { error: recipeError?.message ?? "Erro ao criar receita" };
  }

  if (data.lines.length > 0) {
    const { error: linesError } = await supabase.from("recipe_lines").insert(
      data.lines.map((line) => ({
        recipe_id: recipe.id,
        ingredient_id: line.ingredient_id,
        quantity: line.quantity,
        unit: line.unit,
      })),
    );

    if (linesError) return { error: linesError.message };
  }

  return {};
}

export async function removeRecipe(id: string) {
  if (isLocalMode()) return localDeleteRecipe(id);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function createSale(data: {
  product_id: string;
  description: string;
  quantity: number;
  occurred_at: string;
}) {
  if (isLocalMode()) return localCreateSale(data);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("sale_price")
    .eq("id", data.product_id)
    .eq("user_id", editable.access.ownerId)
    .single();

  if (!product) return { error: "Produto não encontrado" };

  const unit_price = Number(product.sale_price);
  const total = unit_price * data.quantity;

  const { error } = await supabase.from("sales").insert({
    user_id: editable.access.ownerId,
    created_by: editable.user.id,
    created_by_email: editable.user.email,
    product_id: data.product_id,
    description: data.description,
    quantity: data.quantity,
    unit_price,
    total,
    occurred_at: data.occurred_at,
  });

  if (error) return { error: error.message };
  return {};
}

export async function removeSale(id: string) {
  if (isLocalMode()) return localDeleteSale(id);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function createStock(data: {
  recipe_id: string;
  produced_quantity: number;
  occurred_at: string;
}) {
  if (isLocalMode()) return localCreateStock(data);
  return { error: "Não disponível no modo remoto" };
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
  if (isLocalMode()) return localCreateExpense(data);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  let ingredient_id: string | null = null;

  if (data.type === "insumo") {
    if (!data.ingredient_name?.trim()) {
      return { error: "Informe o nome do insumo" };
    }
    if (!data.ingredient_unit) return { error: "Informe a unidade do insumo" };
    if (!data.quantity_purchased || data.quantity_purchased <= 0) {
      return { error: "Informe a quantidade comprada" };
    }

    const unit_cost = data.amount / data.quantity_purchased;
    const { data: existing } = await supabase
      .from("ingredients")
      .select("id")
      .eq("user_id", editable.access.ownerId)
      .eq("name", data.ingredient_name.trim())
      .eq("unit", data.ingredient_unit)
      .maybeSingle();

    if (existing) {
      ingredient_id = existing.id;
      await supabase
        .from("ingredients")
        .update({
          unit_cost,
          created_by: editable.user.id,
          created_by_email: editable.user.email,
        })
        .eq("id", ingredient_id);
    } else {
      const { data: newIngredient, error: ingError } = await supabase
        .from("ingredients")
        .insert({
          user_id: editable.access.ownerId,
          created_by: editable.user.id,
          created_by_email: editable.user.email,
          name: data.ingredient_name.trim(),
          unit: data.ingredient_unit,
          unit_cost,
        })
        .select()
        .single();

      if (ingError || !newIngredient) {
        return { error: ingError?.message ?? "Erro ao criar insumo" };
      }
      ingredient_id = newIngredient.id;
    }
  }

  const { error } = await supabase.from("expenses").insert({
    user_id: editable.access.ownerId,
    created_by: editable.user.id,
    created_by_email: editable.user.email,
    type: data.type,
    description: data.description,
    amount: data.amount,
    occurred_at: data.occurred_at,
    ingredient_id,
    ingredient_name:
      data.type === "insumo" ? data.ingredient_name?.trim() : null,
    ingredient_unit: data.type === "insumo" ? data.ingredient_unit : null,
    quantity_purchased: data.type === "insumo" ? data.quantity_purchased : null,
    unit_cost:
      data.type === "insumo" && data.quantity_purchased
        ? data.amount / data.quantity_purchased
        : null,
  });

  if (error) return { error: error.message };

  if (data.type === "insumo" && data.ingredient_name && data.ingredient_unit) {
    const averageResult = await recalculateRemoteIngredientAverage(
      supabase,
      editable.access.ownerId,
      editable.user,
      data.ingredient_name,
      data.ingredient_unit,
    );
    if ("error" in averageResult) return averageResult;
  }

  return {};
}

export async function convertExpenseToIngredient(
  id: string,
  data: {
    ingredient_name: string;
    ingredient_unit: MeasureUnit;
    quantity_purchased: number;
  },
) {
  if (isLocalMode()) return localConvertExpenseToIngredient(id, data);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;
  if (!data.ingredient_name.trim()) return { error: "Informe o nome do insumo" };
  if (!data.quantity_purchased || data.quantity_purchased <= 0) {
    return { error: "Informe a quantidade comprada" };
  }

  const supabase = await createClient();
  const { data: expense } = await supabase
    .from("expenses")
    .select("amount")
    .eq("id", id)
    .eq("user_id", editable.access.ownerId)
    .single();

  if (!expense) return { error: "Gasto não encontrado" };

  const ingredientName = data.ingredient_name.trim();
  const unitCost = Number(expense.amount) / data.quantity_purchased;
  const { error } = await supabase
    .from("expenses")
    .update({
      type: "insumo",
      ingredient_name: ingredientName,
      ingredient_unit: data.ingredient_unit,
      quantity_purchased: data.quantity_purchased,
      unit_cost: unitCost,
      created_by: editable.user.id,
      created_by_email: editable.user.email,
    })
    .eq("id", id)
    .eq("user_id", editable.access.ownerId);

  if (error) return { error: error.message };

  const averageResult = await recalculateRemoteIngredientAverage(
    supabase,
    editable.access.ownerId,
    editable.user,
    ingredientName,
    data.ingredient_unit,
  );
  if ("error" in averageResult) return averageResult;

  return {};
}

export async function clearIngredients() {
  if (isLocalMode()) return localClearIngredients();

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase
    .from("ingredients")
    .delete()
    .eq("user_id", editable.access.ownerId);

  if (error) return { error: error.message };
  return {};
}

export async function removeExpense(id: string) {
  if (isLocalMode()) return localDeleteExpense(id);

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function updateIngredientScale(
  id: string,
  unit_scale: number | null,
  unit_scale_unit: IngredientScaleUnit | null,
) {
  if (isLocalMode()) {
    return localUpdateIngredientScale(id, unit_scale, unit_scale_unit);
  }

  const editable = await requireEditableBusiness();
  if ("error" in editable) return editable;

  const supabase = await createClient();
  const { error } = await supabase
    .from("ingredients")
    .update({
      unit_scale,
      unit_scale_unit,
      created_by: editable.user.id,
      created_by_email: editable.user.email,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  return {};
}
