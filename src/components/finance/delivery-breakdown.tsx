import type { DeliveryBreakdown } from "@/lib/types";
import { formatCurrency } from "@/lib/finance/calculations";

type Props = {
  breakdown: DeliveryBreakdown;
};

export function DeliveryBreakdownCard({ breakdown }: Props) {
  const rows = [
    { label: "Doces", value: breakdown.doces },
    { label: "Macarrão", value: breakdown.macarrao },
    { label: "Sopa", value: breakdown.sopa },
    { label: "Outros salgados", value: breakdown.outrosSalgados },
    { label: "Outras vendas", value: breakdown.outrosReceita },
  ];

  const total =
    breakdown.doces +
    breakdown.salgadosTotal +
    breakdown.outrosReceita;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
      <h3 className="font-semibold text-amber-950">
        Faturamento por linha (delivery)
      </h3>
      <p className="mt-1 text-sm text-amber-900/70">
        Doces vs. salgados (macarrão, sopa e outros)
      </p>
      <dl className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <dt className="text-zinc-700">{row.label}</dt>
            <dd className="font-medium text-zinc-900">
              {formatCurrency(row.value)}
            </dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-amber-200 pt-2 text-sm font-semibold">
          <dt>Total salgados</dt>
          <dd>{formatCurrency(breakdown.salgadosTotal)}</dd>
        </div>
        <div className="flex justify-between text-sm font-semibold text-amber-950">
          <dt>Total faturamento</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
