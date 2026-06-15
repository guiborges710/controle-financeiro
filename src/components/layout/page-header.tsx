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
  const rawName = email?.split("@")[0] ?? "Chef";
  const name = rawName
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-600">
          {getGreeting()}, {name}! <span aria-hidden="true">👋</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 md:text-4xl">
          {title ?? "Dashboard"}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-base text-stone-600">{subtitle}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      ) : (
        <div className="flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-medium text-stone-700 shadow-sm">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>Hoje</span>
        </div>
      )}
    </div>
  );
}
