import { PageHeader } from "@/components/layout/page-header";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { InviteCollaboratorForm } from "@/components/empresa/invite-collaborator-form";
import { CollaboratorsList } from "@/components/empresa/collaborators-list";
import { isLocalMode } from "@/lib/config/mode";

export default async function ColaboradoresPage() {
  const user = await getSession();

  if (isLocalMode()) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Colaboradores"
          subtitle="Convide outros usuários para acessar seu dashboard"
          email={user?.email}
        />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm text-amber-900">
            ℹ️ Este recurso está disponível apenas em modo Supabase.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  // Buscar business profile
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("id, business_name")
    .eq("user_id", user?.id)
    .single();

  let collaborators: Array<{
    id: string;
    invited_email: string;
    role: "editor" | "viewer";
    status: "pending" | "accepted";
    accepted_at: string | null;
  }> = [];
  if (profile) {
    const { data } = await supabase
      .from("collaborators")
      .select("id, invited_email, role, status, accepted_at")
      .eq("business_id", profile.id)
      .order("created_at", { ascending: false });

    collaborators = data || [];
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Colaboradores"
        subtitle="Convide outros usuários para acessar seu dashboard"
        email={user?.email}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <InviteCollaboratorForm
          projectName={profile?.business_name ?? "Projeto sem nome"}
        />

        <div className="space-y-3">
          <h2 className="font-semibold text-stone-900">
            Colaboradores ativos
            {profile?.business_name ? ` - ${profile.business_name}` : ""}
          </h2>
          <CollaboratorsList
            collaborators={collaborators.filter((c) => c.status === "accepted")}
          />
        </div>
      </div>

      {collaborators.some((c) => c.status === "pending") && (
        <div className="space-y-3">
          <h2 className="font-semibold text-stone-900">Convites pendentes</h2>
          <CollaboratorsList
            collaborators={collaborators.filter((c) => c.status === "pending")}
          />
        </div>
      )}
    </div>
  );
}
