"use client";

import { useState } from "react";
import { inviteCollaborator } from "@/app/actions/collaborators";
import { Send, Users } from "lucide-react";

export function InviteCollaboratorForm({
  projectName,
}: {
  projectName?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const result = await inviteCollaborator({ email, role });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setEmail("");
    setRole("viewer");
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <form onSubmit={onSubmit} className="ui-card space-y-4 p-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-stone-900">Convidar colaborador</h2>
      </div>
      {projectName ? (
        <p className="text-sm text-stone-500">
          Projeto compartilhado:{" "}
          <span className="font-medium text-stone-800">{projectName}</span>
        </p>
      ) : null}

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Convite enviado com sucesso!
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm">
          <span className="font-medium text-stone-700">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="usuario@exemplo.com"
            className="mt-1 w-full rounded-xl border border-border-soft px-3 py-2.5 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-stone-700">Permissão</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className="mt-1 w-full rounded-xl border border-border-soft px-3 py-2.5 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
          >
            <option value="viewer">Leitor (apenas visualizar)</option>
            <option value="editor">Editor (editar tudo)</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white shadow-[0_12px_24px_rgba(124,58,237,0.24)] transition hover:bg-primary-hover disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {loading ? "Enviando…" : "Enviar convite"}
      </button>

      <p className="text-xs text-stone-500">
        O usuário receberá um e-mail com a solicitação de acesso ao seu dashboard.
      </p>
    </form>
  );
}
