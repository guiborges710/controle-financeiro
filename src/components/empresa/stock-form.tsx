"use client";

import { useState } from "react";
import type { Recipe, Ingredient } from "@/lib/types/business";
import { saveProduction } from "@/app/actions/business";
import { computeRecipeCost } from "@/lib/finance/recipe-cost";
import { formatCurrency } from "@/lib/finance/calculations";

type Props = {
  recipes: Recipe[];
  ingredients: Ingredient[];
};

export function StockForm({ recipes, ingredients }: Props) {
  const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? "");
  const [producedQty, setProducedQty] = useState(1);
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const recipe = recipes.find((r) => r.id === recipeId) ?? recipes[0] ?? null;
  const analysis = recipe ? computeRecipeCost(recipe, ingredients, null) : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!recipeId) return setError("Selecione uma receita");
    if (!producedQty || producedQty <= 0)
      return setError("Quantidade produzida inválida");
    setPending(true);
    const form = new FormData(e.currentTarget);
    const result = await saveProduction(form);
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    (e.currentTarget as HTMLFormElement).reset();
    setProducedQty(1);
    setRecipeId(recipes[0]?.id ?? "");
  }

  const totalCost = analysis?.totalCost ?? 0;
  const adjustedCostPerUnit = producedQty > 0 ? totalCost / producedQty : 0;

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Registrar produção</h2>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Receita</span>
          <select name="recipe_id" value={recipeId} onChange={(e) => setRecipeId(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2">
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Data</span>
          <input name="occurred_at" type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Unidades produzidas</span>
          <input name="produced_quantity" type="number" min={1} step={1} value={producedQty} onChange={(e) => setProducedQty(Number(e.target.value) || 1)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <div className="block text-sm">
          <span className="font-medium text-zinc-700">Custo calculado</span>
          <div className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <div>Custo total (insumos): <strong>{formatCurrency(totalCost)}</strong></div>
            <div className="mt-1">Custo por unidade (ajustado): <strong>{formatCurrency(adjustedCostPerUnit)}</strong></div>
          </div>
        </div>
      </div>

      <button type="submit" disabled={pending} className="rounded-xl bg-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60">
        {pending ? "Registrando…" : "Registrar produção"}
      </button>
    </form>
  );
}

export default StockForm;
