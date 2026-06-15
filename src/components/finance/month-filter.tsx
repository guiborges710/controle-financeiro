import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="flex items-center gap-1 rounded-xl border border-border-soft bg-white p-1.5 shadow-[0_10px_26px_rgba(48,30,82,0.08)]">
      <Link
        href={`${basePath}?mes=${fmt(prev)}`}
        className="rounded-lg p-2 text-stone-500 transition hover:bg-primary-light hover:text-primary"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="inline-flex min-w-[150px] items-center justify-center gap-2 px-2 text-center text-sm font-semibold capitalize text-stone-900">
        <CalendarDays className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </span>
      <Link
        href={`${basePath}?mes=${fmt(next)}`}
        className="rounded-lg p-2 text-stone-500 transition hover:bg-primary-light hover:text-primary"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
