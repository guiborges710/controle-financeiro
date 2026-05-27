import Link from "next/link";
import { signInLocal } from "@/app/actions/auth";
import { getSession } from "@/lib/auth/session";
import { isLocalMode } from "@/lib/config/mode";
import { Building2, User, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getSession();
  const local = isLocalMode();

  if (user) {
    redirect("/empresa");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sidebar text-white">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl italic text-sidebar">Controle</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-stone-500 uppercase">
              Doces & Salgados
            </p>
          </div>
          {local ? (
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800">
              Modo local
            </span>
          ) : null}
        </div>

        <h1 className="mt-10 max-w-2xl font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          Do bolso ao caixa da empresa
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          Finanças pessoais e controle da empresa em um só lugar — delivery de
          doces e pratos salgados.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-sm">
            <User className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Pessoal</h2>
            <p className="mt-2 text-sm text-stone-600">
              Salário, contas, lazer e saldo mensal.
            </p>
          </div>
          <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-sm">
            <Building2 className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Empresa</h2>
            <p className="mt-2 text-sm text-stone-600">
              Vendas, gastos, receitas, produtos e margem.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          {local ? (
            <form action={signInLocal}>
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
              >
                Experimentar agora
              </button>
            </form>
          ) : (
            <Link
              href="/cadastro"
              className="rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
            >
              Começar grátis
            </Link>
          )}
          <Link
            href="/login"
            className="rounded-xl border border-border-soft bg-card px-6 py-3 font-medium text-stone-800 hover:bg-accent-cream"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
