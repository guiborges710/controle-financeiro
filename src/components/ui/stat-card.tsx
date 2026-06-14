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
      className={`rounded-2xl border border-border-soft bg-card p-5 shadow-[0_1px_3px_rgba(42,24,69,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function btnPrimary(className = "") {
  return `inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60 ${className}`;
}

export function btnSecondary(className = "") {
  return `inline-flex items-center justify-center gap-2 rounded-xl border border-border-soft bg-card px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-accent-cream ${className}`;
}

export type StatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "purple" | "rose" | "stone" | "violet";
};

const toneStyles = {
  purple: "bg-primary text-white",
  violet: "bg-violet-100 text-violet-700",
  rose: "bg-rose-100 text-rose-600",
  stone: "bg-stone-100 text-stone-600",
};

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "purple",
}: StatCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
          {value}
        </p>
        {sublabel ? (
          <p className="mt-1 text-xs text-stone-500">{sublabel}</p>
        ) : null}
      </div>
    </Card>
  );
}
