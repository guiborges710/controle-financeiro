import type { Ingredient } from "@/lib/types/business";
import { formatCurrency } from "@/lib/finance/calculations";
import { unitLabel } from "@/lib/finance/recipe-cost";
import { Calculator } from "lucide-react";
import { Card } from "@/components/ui/stat-card";

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
            Calculado automaticamente (valor pago ÷ quantidade). Não editável.
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
          {ingredients.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="font-medium text-stone-900">{i.name}</span>
              <span className="tabular-nums font-semibold text-primary">
                {formatCurrency(i.unit_cost)}
                <span className="font-normal text-stone-400">
                  {" "}
                  / {unitLabel(i.unit)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
