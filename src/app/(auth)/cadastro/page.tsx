import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/signup-form";
import { isLocalMode } from "@/lib/config/mode";
import { Wallet } from "lucide-react";

export default function SignUpPage() {
  const local = isLocalMode();

  if (local) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sidebar text-white">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold text-stone-900">
            Criar conta
          </h1>
        </div>
        <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-sm">
          <SignUpForm />
        </div>
        <p className="text-center text-sm text-stone-600">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
