"use client";

import { importExpensesCsv } from "@/app/actions/business";
import { Upload } from "lucide-react";
import { useState } from "react";

export function ExpenseCsvImportForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setMessage(null);
    setError(null);

    const result = await importExpensesCsv(new FormData(form));
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    const skipped =
      result.skipped && result.skipped > 0
        ? ` ${result.skipped} linha(s) ignorada(s).`
        : "";
    const details =
      result.errors && result.errors.length > 0
        ? ` ${result.errors.join("; ")}`
        : "";

    setMessage(`${result.imported} gasto(s) importado(s).${skipped}${details}`);
    form.reset();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-2xl border border-border-soft bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Upload className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-stone-900">Importar gastos por CSV</h2>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="block flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {pending ? "Importando..." : "Importar CSV"}
        </button>
      </div>
      <p className="text-xs text-stone-500">
        Cada linha do CSV vira um gasto. Linhas da categoria Ingredientes também
        atualizam o custo médio dos insumos.
      </p>
    </form>
  );
}
