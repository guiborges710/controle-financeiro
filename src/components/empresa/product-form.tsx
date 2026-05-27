"use client";

import { useState } from "react";
import { saveProduct } from "@/app/actions/business";

type Props = {
  recipeOptions: { id: string; name: string }[];
};

export function ProductForm({ recipeOptions }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setPending(true);
    const result = await saveProduct(new FormData(form));
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    form.reset();
  }

  if (recipeOptions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-6 text-sm text-violet-950">
        Crie uma <strong>Receita</strong> antes de cadastrar produtos. Todo
        produto precisa estar vinculado a uma receita.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border-soft bg-card p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-stone-900">Novo produto</h2>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Nome</span>
          <input
            name="name"
            required
            placeholder="Ex.: Caixa de brigadeiros"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Tamanho</span>
          <input
            name="size"
            required
            placeholder="Ex.: 12 unidades, 500 g, 500 ml"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Preço de venda (R$)</span>
          <input
            name="sale_price"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">
            Receita <span className="text-rose-600">*</span>
          </span>
          <select
            name="recipe_id"
            required
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="" disabled>
              Selecione a receita
            </option>
            {recipeOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-zinc-500">
            O produto aparece automaticamente na receita escolhida.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Cadastrar produto"}
      </button>
    </form>
  );
}
