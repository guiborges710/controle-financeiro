"use client";

import { useMemo, useState } from "react";
import type { SellableProduct } from "@/lib/types/business";
import { saveSale } from "@/app/actions/business";
import { formatCurrency } from "@/lib/finance/calculations";

type Props = {
  products: SellableProduct[];
  defaultDate: string;
};

export function SaleForm({ products, defaultDate }: Props) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  const unitPrice = product?.sale_price ?? 0;
  const total = unitPrice * quantity;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError(null);
    setPending(true);
    const result = await saveSale(new FormData(formEl));
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    setQuantity(1);
    formEl.reset();
    const dateInput = formEl.elements.namedItem(
      "occurred_at",
    ) as HTMLInputElement;
    if (dateInput) dateInput.value = defaultDate;
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        Cadastre produtos em <strong>Produtos</strong> antes de registrar vendas.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border-soft bg-card p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-zinc-900">Registrar venda</h2>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Produto</span>
          <select
            name="product_id"
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.size}) — {formatCurrency(p.sale_price)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Descrição</span>
          <input
            name="description"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Quantidade vendida</span>
          <input
            name="quantity"
            type="number"
            min={1}
            step={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
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
      </div>

      <div className="rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-950">
        <p>
          Preço unitário: <strong>{formatCurrency(unitPrice)}</strong>
        </p>
        <p className="mt-1">
          Total da venda: <strong>{formatCurrency(total)}</strong>
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Registrar venda"}
      </button>
    </form>
  );
}
