"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    window.location.href = "/empresa";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <label className="block text-sm">
        <span className="font-medium text-stone-700">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-xl border border-border-soft px-3 py-2.5 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Senha</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-border-soft px-3 py-2.5 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {loading ? "Criando…" : "Criar conta"}
      </button>
    </form>
  );
}
