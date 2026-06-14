export type MeasureUnit = "g" | "ml" | "unidade";
export type IngredientScaleUnit = "g" | "unidade";

export type ExpenseType =
  | "insumo"
  | "energia"
  | "gas"
  | "embalagem"
  | "outros";

export type Ingredient = {
  id: string;
  name: string;
  unit: MeasureUnit;
  unit_cost: number;
  unit_scale?: number | null;
  unit_scale_unit?: IngredientScaleUnit | null;
  created_by_email?: string | null;
  updated_at: string;
};

export type SellableProduct = {
  id: string;
  name: string;
  size: string;
  sale_price: number;
  recipe_id: string;
  created_by_email?: string | null;
  created_at: string;
};

export type RecipeLine = {
  ingredient_id: string;
  quantity: number;
  unit: MeasureUnit;
};

export type Recipe = {
  id: string;
  name: string;
  sellable_product_id: string | null;
  yield_quantity: number;
  lines: RecipeLine[];
  created_by_email?: string | null;
  created_at: string;
};

export type Sale = {
  id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  occurred_at: string;
  created_by_email?: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  type: ExpenseType;
  description: string;
  amount: number;
  occurred_at: string;
  ingredient_id: string | null;
  ingredient_name: string | null;
  ingredient_unit: MeasureUnit | null;
  quantity_purchased: number | null;
  unit_cost: number | null;
  created_by_email?: string | null;
  created_at: string;
};

export type RecipeCostAnalysis = {
  totalCost: number;
  costPerUnit: number;
  salePrice: number | null;
  profit: number | null;
  marginPercent: number | null;
};

export type BusinessMonthSummary = {
  totalSales: number;
  totalExpenses: number;
  balance: number;
  marginPercent: number | null;
};

export type StockEntry = {
  id: string;
  recipe_id: string;
  produced_quantity: number;
  cost_per_unit: number;
  total_cost: number;
  occurred_at: string;
  created_at: string;
};
