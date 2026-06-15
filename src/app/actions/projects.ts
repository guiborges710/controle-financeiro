"use server";

import { ACTIVE_BUSINESS_COOKIE } from "@/lib/data/business-access";
import { getSession } from "@/lib/auth/session";
import { isLocalMode } from "@/lib/config/mode";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaCacheRelationError } from "@/lib/supabase/errors";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function selectActiveBusinessProject(
  businessId: string,
): Promise<void> {
  if (isLocalMode()) return;

  const user = await getSession();
  if (!user) throw new Error("Faça login para continuar");

  const supabase = await createClient();
  const { data: owned } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  let allowed = Boolean(owned);

  if (!allowed) {
    const { data: collaborator, error } = await supabase
      .from("collaborators")
      .select("id")
      .eq("business_id", businessId)
      .eq("invited_email", user.email.toLowerCase())
      .eq("status", "accepted")
      .maybeSingle();

    if (isMissingSchemaCacheRelationError(error, "collaborators")) {
      throw new Error("Compartilhamento indisponível no banco atual");
    }

    allowed = Boolean(collaborator);
  }

  if (!allowed) throw new Error("Você não tem acesso a este projeto");

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_BUSINESS_COOKIE, businessId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/empresa");
}
