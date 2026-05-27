"use client";

import { useState } from "react";
import type { ExpenseType, MeasureUnit } from "@/lib/types/business";
import { saveExpense } from "@/app/actions/business";
import { formatCurrency } from "@/lib/finance/calculations";
import { unitLabel } from "@/lib/finance/recipe-cost";
import { Plus } from "lucide-react";

const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: "insumo", label: "Item da nota (insumo)" },
  { value: "energia", label: "Energia" },
  { value: "gas", label: "Gás" },
  { value: "embalagem", label: "Embalagens" },
  { value: "outros", label: "Outros" },
];

const QTY_HINT: Record<MeasureUnit, string> = {
  unidade: "Quantas unidades você comprou? Ex.: cartela com 12 ovos → digite 12",
  g: "Quantos gramas? Ex.: pacote de 5 kg → digite 5000",
  ml: "Quantos ml? Ex.: caixa de 1 litro → digite 1000",
};

type Props = {
  defaultDate: string;
};

export function ExpenseFormPanel({ defaultDate }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ExpenseType>("insumo");
  const [amount, setAmount] = useState<number>(0);
  const [qty, setQty] = useState<number>(0);
  const [ingredientUnit, setIngredientUnit] = useState<MeasureUnit>("unidade");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const unitCost = type === "insumo" && qty > 0 && amount > 0 ? amount / qty : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setPending(true);
    const result = await saveExpense(new FormData(form));
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    setType("insumo");
    setAmount(0);
    setQty(0);
    setIngredientUnit("unidade");
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Adicionar gasto
        </button>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border-soft bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Adicionar gasto
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-zinc-500 hover:text-zinc-800"
            >
              Cancelar
            </button>
          </div>

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Tipo</span>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as ExpenseType)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              >
                {EXPENSE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Data</span>
              <input
                name="occurred_at"
                type="date"
                required
                defaultValue={defaultDate}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-zinc-700">Descrição</span>
              <input
                name="description"
                required
                placeholder={
                  type === "insumo"
                    ? "Ex.: Ovos — mercado Centro"
                    : "Ex.: Conta de luz março"
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-zinc-700">
                Valor total pago (R$)
              </span>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
          </div>

          {type === "insumo" ? (
            <div className="space-y-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
              <p className="text-sm text-violet-950">
                Informe o item da notinha, quanto pagou e{" "}
                <strong>quantas unidades</strong> entram no cálculo. O custo por
                unidade aparece em <strong>Insumos</strong> automaticamente.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="font-medium text-zinc-700">Nome do item</span>
                  <input
                    name="ingredient_name"
                    required
                    placeholder="Ex.: Ovos, Farinha, Leite"
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-zinc-700">
                    Unidade de medida
                  </span>
                  <select
                    name="ingredient_unit"
                    required
                    value={ingredientUnit}
                    onChange={(e) =>
                      setIngredientUnit(e.target.value as MeasureUnit)
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
                  >
                    <option value="unidade">Unidade (un)</option>
                    <option value="g">Gramas (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-zinc-700">
                    Quantas unidades?
                  </span>
                  <input
                    name="quantity_purchased"
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={qty || ""}
                    onChange={(e) => setQty(Number(e.target.value))}
                    placeholder={
                      ingredientUnit === "unidade" ? "Ex.: 12" : "Ex.: 5000"
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
                  />
                  <span className="mt-1 block text-xs text-zinc-500">
                    {QTY_HINT[ingredientUnit]}
                  </span>
                </label>
              </div>
              {unitCost != null ? (
                <p className="rounded-lg bg-white px-3 py-2 text-sm text-violet-800">
                  Resultado:{" "}
                  <strong>
                    {formatCurrency(unitCost)}/{unitLabel(ingredientUnit)}
                  </strong>
                </p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar gasto"}
          </button>
        </form>
      )}
    </div>
  );
}
