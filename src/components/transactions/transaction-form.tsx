"use client";

import { useActionState, useMemo } from "react";
import { createTransaction } from "@/app/actions/transactions";
import { getCategoriesForUniverse } from "@/lib/constants/categories";
import type { TransactionType, Universe } from "@/lib/types";

type Props = {
  universe: Universe;
  defaultDate: string;
};

const initialState = { error: undefined as string | undefined };

export function TransactionForm({ universe, defaultDate }: Props) {
  const categories = useMemo(
    () => getCategoriesForUniverse(universe),
    [universe],
  );

  const boundAction = createTransaction.bind(null, universe);

  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await boundAction(formData);
      if (result?.error) return { error: result.error };
      (document.getElementById("transaction-form") as HTMLFormElement)?.reset();
      const dateInput = document.getElementById(
        "occurred_at",
      ) as HTMLInputElement;
      if (dateInput) dateInput.value = defaultDate;
      return { error: undefined };
    },
    initialState,
  );

  const incomeCats = categories.filter((c) => c.type === "income");
  const expenseCats = categories.filter((c) => c.type === "expense");

  return (
    <form
      id="transaction-form"
      action={formAction}
      className="space-y-4 rounded-2xl border border-border-soft bg-card p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-zinc-900">Nova lançamento</h2>

      {state.error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Tipo</span>
          <select
            name="type"
            required
            defaultValue="expense"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            onChange={(e) => {
              const select = document.getElementById(
                "category_slug",
              ) as HTMLSelectElement;
              if (!select) return;
              const type = e.target.value as TransactionType;
              const list =
                type === "income"
                  ? incomeCats.map((c) => c.slug)
                  : expenseCats.map((c) => c.slug);
              select.innerHTML = "";
              const opts =
                type === "income" ? incomeCats : expenseCats;
              opts.forEach((c) => {
                const opt = document.createElement("option");
                opt.value = c.slug;
                opt.textContent = c.label;
                select.appendChild(opt);
              });
              if (!list.includes(select.value)) {
                select.value = list[0] ?? "";
              }
            }}
          >
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Categoria</span>
          <select
            id="category_slug"
            name="category_slug"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            defaultValue={expenseCats[0]?.slug}
          >
            {expenseCats.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Valor (R$)</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0,00"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Data</span>
          <input
            id="occurred_at"
            name="occurred_at"
            type="date"
            required
            defaultValue={defaultDate}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-zinc-700">Descrição (opcional)</span>
        <input
          name="description"
          type="text"
          maxLength={500}
          placeholder="Ex.: pedido #42, compra no mercado"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
