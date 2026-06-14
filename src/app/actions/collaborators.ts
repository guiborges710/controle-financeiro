"use server";

import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isLocalMode } from "@/lib/config/mode";
import { isMissingSchemaCacheRelationError } from "@/lib/supabase/errors";
import { revalidatePath } from "next/cache";

const COLLABORATORS_UNAVAILABLE =
  "Compartilhamento indisponível: aplique as migrations do Supabase para criar a tabela collaborators.";

export async function inviteCollaborator(data: {
  email: string;
  role: "editor" | "viewer";
}) {
  if (isLocalMode()) {
    return { error: "Colaboradores não disponível em modo local" };
  }

  const user = await getSession();
  if (!user) return { error: "Faça login para continuar" };

  const invitedEmail = data.email.trim().toLowerCase();
  if (invitedEmail === user.email.toLowerCase()) {
    return { error: "Não pode convidar você mesmo" };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Perfil empresarial não encontrado" };
  }

  const { error } = await supabase.from("collaborators").insert({
    business_id: profile.id,
    invited_email: invitedEmail,
    invited_by: user.id,
    role: data.role,
    status: "pending",
  });

  if (error) {
    if (isMissingSchemaCacheRelationError(error, "collaborators")) {
      return { error: COLLABORATORS_UNAVAILABLE };
    }
    if (error.message.includes("unique")) {
      return { error: "Este usuário já foi convidado" };
    }
    return { error: error.message };
  }

  revalidatePath("/empresa/colaboradores");
  return {};
}

export async function acceptCollaboratorInvite(inviteId: string) {
  if (isLocalMode()) {
    return { error: "Colaboradores não disponível em modo local" };
  }

  const user = await getSession();
  if (!user) return { error: "Faça login para continuar" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_collaborator_invite", {
    invite_id: inviteId,
  });

  if (error) {
    if (isMissingSchemaCacheRelationError(error, "accept_collaborator_invite")) {
      return { error: COLLABORATORS_UNAVAILABLE };
    }
    return { error: error.message };
  }

  revalidatePath("/empresa");
  return {};
}

export async function rejectCollaboratorInvite(inviteId: string) {
  if (isLocalMode()) {
    return { error: "Colaboradores não disponível em modo local" };
  }

  const user = await getSession();
  if (!user) return { error: "Faça login para continuar" };

  const supabase = await createClient();
  const { data: invite, error: inviteError } = await supabase
    .from("collaborators")
    .select("*")
    .eq("id", inviteId)
    .eq("invited_email", user.email.toLowerCase())
    .single();

  if (isMissingSchemaCacheRelationError(inviteError, "collaborators")) {
    return { error: COLLABORATORS_UNAVAILABLE };
  }

  if (!invite) {
    return { error: "Convite não encontrado" };
  }

  const { error } = await supabase
    .from("collaborators")
    .delete()
    .eq("id", inviteId);

  if (error) return { error: error.message };

  revalidatePath("/empresa");
  return {};
}

export async function removeCollaborator(collaboratorId: string) {
  if (isLocalMode()) {
    return { error: "Colaboradores não disponível em modo local" };
  }

  const user = await getSession();
  if (!user) return { error: "Faça login para continuar" };

  const supabase = await createClient();
  const { data: collaborator, error: collaboratorError } = await supabase
    .from("collaborators")
    .select("business_id")
    .eq("id", collaboratorId)
    .single();

  if (isMissingSchemaCacheRelationError(collaboratorError, "collaborators")) {
    return { error: COLLABORATORS_UNAVAILABLE };
  }

  if (!collaborator) {
    return { error: "Colaborador não encontrado" };
  }

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("user_id")
    .eq("id", collaborator.business_id)
    .single();

  if (!profile || profile.user_id !== user.id) {
    return { error: "Você não tem permissão" };
  }

  const { error } = await supabase
    .from("collaborators")
    .delete()
    .eq("id", collaboratorId);

  if (error) return { error: error.message };

  revalidatePath("/empresa/colaboradores");
  return {};
}
