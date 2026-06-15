"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const empresaLinks = [
  { href: "/empresa", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/empresa/receitas", label: "Receitas", icon: BookOpen },
  { href: "/empresa/estoque", label: "Estoque", icon: Package },
  { href: "/empresa/gastos", label: "Gastos", icon: Receipt },
  { href: "/empresa/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/empresa/produtos", label: "Produtos", icon: Package },
  { href: "/empresa/projetos", label: "Projetos e convites", icon: Users },
  { href: "/empresa/colaboradores", label: "Colaboradores", icon: Users },
] as const;



function NavLink({
  href,
  label,
  icon: Icon,
  exact,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = exact ? pathname === href : pathname.startsWith(href);
  const selectedMonth = searchParams.get("mes");
  const targetHref = selectedMonth ? `${href}?mes=${selectedMonth}` : href;

  return (
    <Link
      href={targetHref}
      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
        active
          ? "bg-sidebar-active text-sidebar-active-text shadow-[0_14px_30px_rgba(124,58,237,0.32)]"
          : "text-sidebar-foreground/82 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
          active ? "bg-white/16 text-white" : "bg-white/5 text-sidebar-muted group-hover:bg-white/10 group-hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </Link>
  );
}

export function AppSidebar({
  email,
  projectName,
  projectRole,
  pendingInvitesCount = 0,
}: {
  email?: string | null;
  projectName?: string | null;
  projectRole?: "owner" | "editor" | "viewer";
  pendingInvitesCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-sidebar text-white shadow-lg transition hover:bg-sidebar/90 md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Fechar menu"
        />
      ) : null}

      <aside
        className={`sidebar-scroll fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.42),transparent_18rem),linear-gradient(180deg,#24103d_0%,#160a2a_55%,#100720_100%)] text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 md:w-[272px] md:flex ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-7 md:px-6">
          <div>
            <p className="font-display text-3xl italic leading-none text-white">
              Controle
            </p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-sidebar-muted uppercase">
              Doces & Salgados
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-white/10 p-2 text-sidebar-foreground hover:bg-white/10 md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-sidebar-muted uppercase">
              Menu
            </p>
            <div className="space-y-0.5">
              {empresaLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </div>
          </div>


        </nav>

        <div className="space-y-4 border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/8 bg-white/8 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
              <div>
                <p className="text-xs font-semibold text-white">Dica rápida</p>
                <p className="mt-1 text-[11px] leading-relaxed text-sidebar-muted">
                  Cadastre insumos em Gastos antes de montar receitas e produtos.
                </p>
              </div>
            </div>
          </div>

          {email ? (
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                {email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {email.split("@")[0]}
                </p>
                <p className="truncate text-[11px] text-sidebar-muted">{email}</p>
              </div>
            </div>
          ) : null}

          {email ? (
            <Link
              href="/empresa/projetos"
              className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-muted">
                  Projeto ativo
                </p>
                {pendingInvitesCount > 0 ? (
                  <span className="rounded-full bg-violet-200 px-2 py-0.5 text-[10px] font-bold text-violet-950">
                    {pendingInvitesCount}
                  </span>
                ) : null}
              </div>
              {projectName ? (
                <>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {projectName}
                  </p>
                  {projectRole && projectRole !== "owner" ? (
                    <p className="mt-0.5 text-[11px] text-violet-200">
                      Compartilhado como{" "}
                      {projectRole === "editor" ? "editor" : "leitor"}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-1 text-xs font-semibold text-white">
                  Ver convites recebidos
                </p>
              )}
            </Link>
          ) : null}

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-muted transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
