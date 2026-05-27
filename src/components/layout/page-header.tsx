import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

type Props = {
  title?: string;
  subtitle?: string;
  email?: string | null;
  children?: ReactNode;
};

export function PageHeader({ title, subtitle, email, children }: Props) {
  const name = email?.split("@")[0] ?? "Chef";

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-stone-500">
          {getGreeting()}, {name}!
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-stone-900">
          {title ?? "Dashboard"}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-xl text-sm text-stone-500">{subtitle}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex items-center gap-3">{children}</div>
      ) : (
        <div className="flex h-10 items-center gap-2 rounded-xl border border-border-soft bg-card px-3 text-sm text-stone-600 shadow-sm">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>Hoje</span>
        </div>
      )}
    </div>
  );
}
