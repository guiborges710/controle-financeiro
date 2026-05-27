"use client";

import type { Ingredient } from "@/lib/types/business";
import { formatCurrency } from "@/lib/finance/calculations";
import { unitLabel } from "@/lib/finance/recipe-cost";
import { Calculator } from "lucide-react";
import { Card } from "@/components/ui/stat-card";
import { saveIngredientScale } from "@/app/actions/business";

type Props = {
  ingredients: Ingredient[];
};

export function InsumosPanel({ ingredients }: Props) {
  return (
    <Card className="bg-accent-cream/30">
      <div className="flex items-start gap-2">
        <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <h2 className="font-semibold text-stone-900">Insumos</h2>
          <p className="mt-1 text-xs text-stone-500">
            Calculado automaticamente (valor pago ÷ quantidade). Ajuste a escala
            apenas nos itens desejados.
          </p>
        </div>
      </div>

      {ingredients.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          Adicione um gasto do tipo &quot;Item da nota&quot; para ver o custo por
          unidade aqui.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border-soft overflow-hidden rounded-xl border border-border-soft bg-card">
          {ingredients.map((i) => {
            const unit = unitLabel(i.unit);
            const displayLabel = i.unit_scale
              ? `${formatCurrency(i.unit_cost * i.unit_scale)} / ${i.unit_scale}${unit}`
              : `${formatCurrency(i.unit_cost)} / ${unit}`;

            return (
              <li key={i.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900">{i.name}</p>
                    <p className="mt-1 text-sm text-stone-500">{displayLabel}</p>
                  </div>
                  <form
                    action={saveIngredientScale.bind(null, i.id)}
                    className="flex items-center gap-2"
                  >
                    <input
                      name="unit_scale"
                      defaultValue={i.unit_scale ?? ""}
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Escala"
                      className="w-20 rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-sidebar px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover"
                    >
                      Salvar
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
