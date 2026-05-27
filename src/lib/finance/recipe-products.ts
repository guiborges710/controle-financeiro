import type { SellableProduct } from "@/lib/types/business";

export function getProductsForRecipe(
  recipeId: string,
  products: SellableProduct[],
): SellableProduct[] {
  return products.filter((p) => p.recipe_id === recipeId);
}
