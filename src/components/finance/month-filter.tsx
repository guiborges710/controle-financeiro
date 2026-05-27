import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  basePath: string;
  yearMonth: string;
};

export function MonthFilter({ basePath, yearMonth }: Props) {
  const [year, month] = yearMonth.split("-").map(Number);
  const prev = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border-soft bg-card p-1 shadow-sm">
      <Link
        href={`${basePath}?mes=${fmt(prev)}`}
        className="rounded-lg p-2 text-stone-500 transition hover:bg-accent-cream hover:text-stone-800"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="min-w-[130px] px-2 text-center text-sm font-medium capitalize text-stone-800">
        {label}
      </span>
      <Link
        href={`${basePath}?mes=${fmt(next)}`}
        className="rounded-lg p-2 text-stone-500 transition hover:bg-accent-cream hover:text-stone-800"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
