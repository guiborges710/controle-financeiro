"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-sidebar-active text-sidebar-active-text shadow-sm"
          : "text-sidebar-foreground/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
      {label}
    </Link>
  );
}

export function AppSidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const inEmpresa = pathname.startsWith("/empresa");
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
        className={`sidebar-scroll fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-[260px] md:flex ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6 md:px-6">
          <div>
            <p className="font-display text-2xl italic leading-none text-white">
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

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-sidebar-muted uppercase">
              Empresa
            </p>
            <div className="space-y-0.5">
              {empresaLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </div>
          </div>


        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3">
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
            <p className="truncate px-3 text-[11px] text-sidebar-muted">{email}</p>
          ) : null}

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-sidebar-muted transition hover:bg-white/10 hover:text-white"
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
