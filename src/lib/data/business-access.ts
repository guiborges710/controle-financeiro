import "server-only";

import { getSession } from "@/lib/auth/session";
import { isLocalMode } from "@/lib/config/mode";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaCacheRelationError } from "@/lib/supabase/errors";

export type BusinessAccess = {
  businessId: string;
  ownerId: string;
  businessName: string;
  role: "owner" | "editor" | "viewer";
};

type BusinessProfileRow = {
  id: string;
  user_id: string;
  business_name: string | null;
};

type CollaboratorAccessRow = {
  role: "editor" | "viewer";
  business_profiles: BusinessProfileRow | BusinessProfileRow[] | null;
};

function normalizeProfile(
  profile: BusinessProfileRow | BusinessProfileRow[] | null,
) {
  return Array.isArray(profile) ? profile[0] : profile;
}

export async function getActiveBusinessAccess(): Promise<BusinessAccess | null> {
  if (isLocalMode()) {
    return {
      businessId: "local",
      ownerId: "local-demo",
      businessName: "Meu delivery",
      role: "owner",
    };
  }

  const user = await getSession();
  if (!user) return null;

  const supabase = await createClient();
  const { data: owned } = await supabase
    .from("business_profiles")
    .select("id, user_id, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (owned) {
    return {
      businessId: owned.id,
      ownerId: owned.user_id,
      businessName: owned.business_name ?? "Projeto sem nome",
      role: "owner",
    };
  }

  const { data: shared, error: sharedError } = await supabase
    .from("collaborators")
    .select("role, business_profiles(id, user_id, business_name)")
    .eq("invited_email", user.email.toLowerCase())
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle<CollaboratorAccessRow>();

  if (isMissingSchemaCacheRelationError(sharedError, "collaborators")) {
    return null;
  }

  const profile = normalizeProfile(shared?.business_profiles ?? null);
  if (!shared || !profile) return null;

  return {
    businessId: profile.id,
    ownerId: profile.user_id,
    businessName: profile.business_name ?? "Projeto sem nome",
    role: shared.role,
  };
}

export async function canEditActiveBusiness() {
  const access = await getActiveBusinessAccess();
  return access?.role === "owner" || access?.role === "editor";
}
