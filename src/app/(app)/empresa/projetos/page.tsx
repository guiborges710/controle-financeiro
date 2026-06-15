import {
  acceptCollaboratorInviteAction,
  rejectCollaboratorInviteAction,
} from "@/app/actions/collaborators";
import { selectActiveBusinessProject } from "@/app/actions/projects";
import { PageHeader } from "@/components/layout/page-header";
import { getSession } from "@/lib/auth/session";
import {
  getActiveBusinessAccess,
  type BusinessAccess,
} from "@/lib/data/business-access";
import { isMissingSchemaCacheRelationError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

type BusinessProfileRow = {
  id: string;
  user_id: string;
  business_name: string | null;
};

type CollaboratorProjectRow = {
  id: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted" | "rejected";
  business_profiles: BusinessProfileRow | BusinessProfileRow[] | null;
};

function normalizeProfile(
  profile: BusinessProfileRow | BusinessProfileRow[] | null,
) {
  return Array.isArray(profile) ? profile[0] : profile;
}

function ProjectCard({
  project,
  activeId,
}: {
  project: BusinessAccess;
  activeId?: string;
}) {
  const active = project.businessId === activeId;

  return (
    <div className="ui-card ui-card-hover flex flex-wrap items-center justify-between gap-3 p-5">
      <div>
        <p className="font-medium text-stone-900">{project.businessName}</p>
        <p className="mt-1 text-sm text-stone-500">
          {project.role === "owner"
            ? "Seu projeto"
            : `Compartilhado como ${project.role === "editor" ? "editor" : "leitor"}`}
        </p>
      </div>
      {active ? (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Ativo
        </span>
      ) : (
        <form action={selectActiveBusinessProject.bind(null, project.businessId)}>
          <button
            type="submit"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(124,58,237,0.22)] transition hover:bg-primary-hover"
          >
            Usar projeto
          </button>
        </form>
      )}
    </div>
  );
}

export default async function ProjetosPage() {
  const user = await getSession();
  const active = await getActiveBusinessAccess();

  if (!user) return null;

  const supabase = await createClient();
  const { data: owned } = await supabase
    .from("business_profiles")
    .select("id, user_id, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const projects: BusinessAccess[] = owned
    ? [
        {
          businessId: owned.id,
          ownerId: owned.user_id,
          businessName: owned.business_name ?? "Projeto sem nome",
          role: "owner",
        },
      ]
    : [];

  const pendingInvites: Array<{
    id: string;
    businessName: string;
    role: "editor" | "viewer";
  }> = [];
  let collaboratorsUnavailable = false;

  const { data: collaboratorRows, error } = await supabase
    .from("collaborators")
    .select("id, role, status, business_profiles(id, user_id, business_name)")
    .eq("invited_email", user.email.toLowerCase())
    .order("created_at", { ascending: false })
    .returns<CollaboratorProjectRow[]>();

  if (isMissingSchemaCacheRelationError(error, "collaborators")) {
    collaboratorsUnavailable = true;
  } else {
    for (const row of collaboratorRows ?? []) {
      const profile = normalizeProfile(row.business_profiles);
      if (!profile) continue;

      if (row.status === "accepted") {
        projects.push({
          businessId: profile.id,
          ownerId: profile.user_id,
          businessName: profile.business_name ?? "Projeto sem nome",
          role: row.role,
        });
      }

      if (row.status === "pending") {
        pendingInvites.push({
          id: row.id,
          businessName: profile?.business_name ?? "Projeto compartilhado",
          role: row.role,
        });
      }
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projetos"
        subtitle="Escolha o projeto ativo e responda convites recebidos"
        email={user.email}
      />

      {collaboratorsUnavailable ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm text-amber-900">
            Convites indisponíveis no banco atual. Aplique as migrations de
            compartilhamento no Supabase.
          </p>
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-semibold text-stone-900">Projetos disponíveis</h2>
        {projects.length === 0 ? (
          <p className="ui-empty text-sm font-medium">
            Nenhum projeto disponível.
          </p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard
                key={`${project.role}-${project.businessId}`}
                project={project}
                activeId={active?.businessId}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-stone-900">Convites recebidos</h2>
        {pendingInvites.length === 0 ? (
          <p className="ui-empty text-sm font-medium">
            Nenhum convite pendente.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="ui-card flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {invite.businessName}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Convite como {invite.role === "editor" ? "editor" : "leitor"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={acceptCollaboratorInviteAction.bind(null, invite.id)}>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(124,58,237,0.22)] transition hover:bg-primary-hover"
                    >
                      Aceitar
                    </button>
                  </form>
                  <form action={rejectCollaboratorInviteAction.bind(null, invite.id)}>
                    <button
                      type="submit"
                      className="rounded-xl border border-border-soft bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-primary-light"
                    >
                      Recusar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
