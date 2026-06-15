"use client";

import { removeCollaborator } from "@/app/actions/collaborators";
import { PaginatedList } from "@/components/ui/paginated-list";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export type CollaboratorRow = {
  id: string;
  invited_email: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted";
  accepted_at: string | null;
};

export function CollaboratorsList({ collaborators }: { collaborators: CollaboratorRow[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function onDelete(id: string) {
    if (!confirm("Tem certeza que quer remover este colaborador?")) return;

    setDeleting(id);
    const result = await removeCollaborator(id);

    setDeleting(null);

    if (result.error) {
      alert(result.error);
    }
  }

  if (collaborators.length === 0) {
    return (
      <div className="ui-empty">
        <p className="text-sm font-medium">
          Nenhum colaborador ainda. Convide alguem para compartilhar este
          projeto.
        </p>
      </div>
    );
  }

  return (
    <PaginatedList className="space-y-3">
      {collaborators.map((collab) => (
        <div
          key={collab.id}
          className="ui-card ui-card-hover flex items-center justify-between p-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-stone-900">{collab.invited_email}</p>
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                collab.role === "editor"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-stone-100 text-stone-700"
              }`}>
                {collab.role === "editor" ? "Editor" : "Leitor"}
              </span>
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                collab.status === "accepted"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {collab.status === "accepted" ? "Ativo" : "Pendente"}
              </span>
            </div>
            {collab.accepted_at && (
              <p className="mt-1 text-xs text-stone-500">
                Aceitou em {new Date(collab.accepted_at).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>

          <button
            onClick={() => onDelete(collab.id)}
            disabled={deleting === collab.id}
            className="ml-4 rounded-lg p-2 text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="Remover colaborador"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </PaginatedList>
  );
}
