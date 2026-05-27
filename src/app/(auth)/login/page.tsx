import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { LocalLoginForm } from "@/components/auth/local-login-form";
import { isLocalMode } from "@/lib/config/mode";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const local = isLocalMode();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sidebar text-white">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold text-stone-900">
            Entrar
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {local
              ? "Modo local — teste sem configurar banco"
              : "Controle pessoal e empresarial"}
          </p>
        </div>

        <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-sm">
          {local ? <LocalLoginForm /> : <LoginForm />}
        </div>

        {!local ? (
          <p className="text-center text-sm text-stone-600">
            Não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Criar conta
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
