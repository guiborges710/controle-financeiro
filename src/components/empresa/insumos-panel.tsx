"use client";

import {
  clearIngredientsAction,
  deleteIngredientAction,
  saveIngredientScale,
} from "@/app/actions/business";
import { Card } from "@/components/ui/stat-card";
import { PaginatedList } from "@/components/ui/paginated-list";
import { formatCurrency } from "@/lib/finance/calculations";
import { unitLabel } from "@/lib/finance/recipe-cost";
import type { Ingredient } from "@/lib/types/business";
import { Calculator, Trash2 } from "lucide-react";

type Props = {
  ingredients: Ingredient[];
};

export function InsumosPanel({ ingredients }: Props) {
  function confirmClear(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Apagar todos os insumos atuais? Os gastos serão mantidos.")) {
      e.preventDefault();
    }
  }

  return (
    <Card className="bg-accent-cream/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-semibold text-stone-900">Insumos</h2>
            <p className="mt-1 text-xs text-stone-500">
              Calculado pela média: total gasto dividido pela quantidade total
              cadastrada com o mesmo nome e unidade.
            </p>
          </div>
        </div>
        {ingredients.length > 0 ? (
          <form action={clearIngredientsAction} onSubmit={confirmClear}>
            <button
              type="submit"
              className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              Apagar todos os insumos
            </button>
          </form>
        ) : null}
      </div>

      {ingredients.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          Use &quot;Adicionar a insumo&quot; em um gasto ou lance um gasto do
          tipo &quot;Item da nota&quot; para ver o custo médio aqui.
        </p>
      ) : (
        <PaginatedList
          as="ul"
          className="mt-4 divide-y divide-border-soft overflow-hidden rounded-xl border border-border-soft bg-card"
        >
          {ingredients.map((ingredient) => {
            const unit = unitLabel(ingredient.unit);
            const scaleUnit =
              ingredient.unit_scale_unit ??
              (ingredient.unit === "unidade" ? "unidade" : "g");
            const scaleUnitLabel =
              scaleUnit === "g" ? "g" : unitLabel("unidade");
            const displayLabel = ingredient.unit_scale
              ? `${formatCurrency(ingredient.unit_cost * ingredient.unit_scale)} / ${ingredient.unit_scale}${scaleUnitLabel}`
              : `${formatCurrency(ingredient.unit_cost)} / ${unit}`;

            return (
              <li key={ingredient.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900">
                      {ingredient.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {displayLabel}
                    </p>
                  </div>
                  <form
                    action={saveIngredientScale.bind(null, ingredient.id)}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input
                      name="unit_scale"
                      defaultValue={ingredient.unit_scale ?? ""}
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Escala"
                      className="w-20 rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                    />
                    <select
                      name="unit_scale_unit"
                      defaultValue={scaleUnit}
                      className="rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                    >
                      <option value="unidade">Unidade</option>
                      <option value="g">Gramagem</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-xl bg-sidebar px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover"
                    >
                      Salvar
                    </button>
                  </form>
                  <form action={deleteIngredientAction.bind(null, ingredient.id)}>
                    <button
                      type="submit"
                      className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Excluir insumo ${ingredient.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </PaginatedList>
      )}
    </Card>
  );
}
