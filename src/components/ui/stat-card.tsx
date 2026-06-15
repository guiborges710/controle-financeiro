import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

export function Card({
  children,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={`ui-card p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function btnPrimary(className = "") {
  return `inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(124,58,237,0.24)] transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_16px_30px_rgba(124,58,237,0.28)] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 ${className}`;
}

export function btnSecondary(className = "") {
  return `inline-flex items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-primary-light/40 hover:text-primary disabled:pointer-events-none disabled:opacity-60 ${className}`;
}

export type StatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "purple" | "rose" | "stone" | "violet";
};

const toneStyles = {
  purple: "bg-violet-100 text-violet-700 shadow-[0_10px_24px_rgba(124,58,237,0.14)]",
  violet: "bg-primary-light text-primary shadow-[0_10px_24px_rgba(124,58,237,0.12)]",
  rose: "bg-rose-100 text-rose-600 shadow-[0_10px_24px_rgba(244,63,94,0.12)]",
  stone: "bg-emerald-100 text-emerald-600 shadow-[0_10px_24px_rgba(16,185,129,0.12)]",
};

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "purple",
}: StatCardProps) {
  return (
    <Card className="ui-card-hover min-h-[168px] p-6">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${toneStyles[tone]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-950">
            {value}
          </p>
          {sublabel ? (
            <p className="mt-3 text-xs text-stone-500">{sublabel}</p>
          ) : (
            <p className="mt-3 text-xs text-stone-400">-</p>
          )}
        </div>
      </div>
    </Card>
  );
}
