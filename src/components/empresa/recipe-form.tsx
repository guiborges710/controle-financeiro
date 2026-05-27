"use client";

import { useState } from "react";
import type { Ingredient, MeasureUnit } from "@/lib/types/business";
import { saveRecipe } from "@/app/actions/business";
import { computeRecipeCost } from "@/lib/finance/recipe-cost";
import { formatCurrency } from "@/lib/finance/calculations";
import { unitLabel } from "@/lib/finance/recipe-cost";
import { Plus } from "lucide-react";

type LineDraft = {
  ingredient_id: string;
  quantity: number;
  unit: MeasureUnit;
};

type Props = {
  ingredients: Ingredient[];
};

export function RecipeForm({ ingredients }: Props) {
  const [lines, setLines] = useState<LineDraft[]>([
    {
      ingredient_id: ingredients[0]?.id ?? "",
      quantity: 0,
      unit: ingredients[0]?.unit ?? "g",
    },
  ]);
  const [yieldQty, setYieldQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const draftRecipe = {
    id: "draft",
    name: "",
    sellable_product_id: null,
    yield_quantity: yieldQty,
    lines: lines.filter((l) => l.ingredient_id && l.quantity > 0),
    created_at: "",
  };

  const analysis = computeRecipeCost(draftRecipe, ingredients, null);

  function addLine() {
    const ing = ingredients[0];
    setLines((prev) => [
      ...prev,
      {
        ingredient_id: ing?.id ?? "",
        quantity: 0,
        unit: ing?.unit ?? "g",
      },
    ]);
  }

  function updateLine(index: number, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const next = { ...line, ...patch };
        if (patch.ingredient_id) {
          const ing = ingredients.find((x) => x.id === patch.ingredient_id);
          if (ing) next.unit = ing.unit;
        }
        return next;
      }),
    );
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError(null);
    const validLines = lines.filter((l) => l.ingredient_id && l.quantity > 0);
    if (validLines.length === 0) {
      setError("Adicione ingredientes com quantidade");
      return;
    }
    setPending(true);
    const formData = new FormData(formEl);
    formData.set("lines", JSON.stringify(validLines));
    const result = await saveRecipe(formData);
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    formEl.reset();
    setLines([
      {
        ingredient_id: ingredients[0]?.id ?? "",
        quantity: 0,
        unit: ingredients[0]?.unit ?? "g",
      },
    ]);
    setYieldQty(1);
  }

  if (ingredients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        Cadastre insumos em <strong>Gastos</strong> (item da notinha) antes de
        montar receitas.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border-soft bg-card p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-zinc-900">Nova receita</h2>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Nome da receita</span>
          <input
            name="name"
            required
            placeholder="Ex.: Brigadeiro 12 un"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Rendimento (porções)</span>
          <input
            name="yield_quantity"
            type="number"
            min={1}
            step={1}
            value={yieldQty}
            onChange={(e) => setYieldQty(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-zinc-800">Ingredientes</p>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Adicionar ingrediente
          </button>
        </div>
        {lines.map((line, index) => (
          <div
            key={index}
            className="grid gap-2 sm:grid-cols-[1fr_120px_80px_auto]"
          >
            <select
              value={line.ingredient_id}
              onChange={(e) =>
                updateLine(index, { ingredient_id: e.target.value })
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({formatCurrency(i.unit_cost)}/{unitLabel(i.unit)})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0.01"
              step="any"
              placeholder="Qtd"
              value={line.quantity || ""}
              onChange={(e) =>
                updateLine(index, { quantity: Number(e.target.value) })
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <span className="flex items-center text-sm text-zinc-500">
              {unitLabel(line.unit)}
            </span>
            <button
              type="button"
              onClick={() => removeLine(index)}
              className="text-sm text-rose-600 hover:underline"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-950">
        <p>
          Custo total da receita:{" "}
          <strong>{formatCurrency(analysis.totalCost)}</strong>
        </p>
        <p>
          Custo por porção:{" "}
          <strong>{formatCurrency(analysis.costPerUnit)}</strong>
        </p>
        <p className="mt-2 text-violet-800/80">
          A margem de lucro aparece aqui quando você cadastrar um{" "}
          <strong>Produto</strong> vinculado a esta receita.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar receita"}
      </button>
    </form>
  );
}
