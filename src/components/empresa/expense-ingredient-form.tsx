"use client";

import { useState } from "react";
import { addExpenseToIngredient } from "@/app/actions/business";
import type { MeasureUnit } from "@/lib/types/business";

type Props = {
  expenseId: string;
  defaultName: string;
  currentQuantity?: number | null;
  currentUnit?: MeasureUnit | null;
};

export function ExpenseIngredientForm({
  expenseId,
  defaultName,
  currentQuantity,
  currentUnit,
}: Props) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<MeasureUnit>(currentUnit ?? "unidade");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await addExpenseToIngredient(
      expenseId,
      new FormData(e.currentTarget),
    );
    setPending(false);

    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-medium text-primary hover:text-primary-hover"
      >
        Adicionar a insumo
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-3 grid gap-2 rounded-xl border border-violet-100 bg-violet-50/40 p-3 text-sm sm:grid-cols-[1fr_120px_120px_auto]"
    >
      <input
        name="ingredient_name"
        defaultValue={defaultName}
        required
        placeholder="Nome do insumo"
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
      />
      <select
        name="ingredient_unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value as MeasureUnit)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
      >
        <option value="unidade">Unidade</option>
        <option value="g">Gramas</option>
        <option value="ml">Mililitros</option>
      </select>
      <input
        name="quantity_purchased"
        type="number"
        step="any"
        min="0.01"
        required
        defaultValue={currentQuantity ?? ""}
        placeholder={unit === "unidade" ? "Qtd." : unit}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-zinc-500 hover:text-zinc-800"
        >
          Cancelar
        </button>
      </div>
      {error ? (
        <p className="text-xs text-rose-700 sm:col-span-4">{error}</p>
      ) : null}
      <p className="text-xs text-violet-800 sm:col-span-4">
        Quando houver outros gastos com o mesmo nome e unidade, o custo do
        insumo será a média: total gasto dividido pela quantidade total.
      </p>
    </form>
  );
}
