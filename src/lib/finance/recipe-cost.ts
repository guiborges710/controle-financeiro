import type {
  Ingredient,
  Recipe,
  RecipeCostAnalysis,
  SellableProduct,
} from "@/lib/types/business";

export function unitLabel(unit: string): string {
  const labels: Record<string, string> = {
    g: "g",
    ml: "ml",
    unidade: "un",
  };
  return labels[unit] ?? unit;
}

export function computeRecipeCost(
  recipe: Recipe,
  ingredients: Ingredient[],
  product?: SellableProduct | null,
): RecipeCostAnalysis {
  const byId = new Map(ingredients.map((i) => [i.id, i]));

  const totalCost = recipe.lines.reduce((acc, line) => {
    const ing = byId.get(line.ingredient_id);
    if (!ing) return acc;
    return acc + line.quantity * ing.unit_cost;
  }, 0);

  const yieldQty = recipe.yield_quantity > 0 ? recipe.yield_quantity : 1;
  const costPerUnit = totalCost / yieldQty;

  const salePrice = product?.sale_price ?? null;
  const profit =
    salePrice != null ? salePrice - costPerUnit : null;
  const marginPercent =
    salePrice != null && salePrice > 0 && profit != null
      ? (profit / salePrice) * 100
      : null;

  return {
    totalCost,
    costPerUnit,
    salePrice,
    profit,
    marginPercent,
  };
}
