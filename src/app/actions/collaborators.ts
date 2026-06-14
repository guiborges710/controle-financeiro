"use server";

import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isLocalMode } from "@/lib/config/mode";
import { revalidatePath } from "next/cache";

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

  if (error) return { error: error.message };

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
  const { data: invite } = await supabase
    .from("collaborators")
    .select("*")
    .eq("id", inviteId)
    .eq("invited_email", user.email.toLowerCase())
    .single();

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
  const { data: collaborator } = await supabase
    .from("collaborators")
    .select("business_id")
    .eq("id", collaboratorId)
    .single();

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
