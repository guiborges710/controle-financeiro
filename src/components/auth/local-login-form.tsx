import { signInLocal } from "@/app/actions/auth";

export function LocalLoginForm() {
  return (
    <form action={signInLocal} className="space-y-4">
      <p className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900">
        Sem Supabase — entre com dados de exemplo já carregados.
      </p>
      <button
        type="submit"
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
      >
        Entrar e testar o sistema
      </button>
    </form>
  );
}
