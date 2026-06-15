import "server-only";

import { cookies } from "next/headers";
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

export const ACTIVE_BUSINESS_COOKIE = "cf_active_business_id";

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
  const selectedBusinessId = (await cookies()).get(ACTIVE_BUSINESS_COOKIE)?.value;

  const { data: owned } = await supabase
    .from("business_profiles")
    .select("id, user_id, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const ownedAccess = owned
    ? {
      businessId: owned.id,
      ownerId: owned.user_id,
      businessName: owned.business_name ?? "Projeto sem nome",
      role: "owner" as const,
    }
    : null;

  const { data: sharedRows, error: sharedError } = await supabase
    .from("collaborators")
    .select("role, business_profiles(id, user_id, business_name)")
    .eq("invited_email", user.email.toLowerCase())
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false })
    .returns<CollaboratorAccessRow[]>();

  if (isMissingSchemaCacheRelationError(sharedError, "collaborators")) {
    return ownedAccess;
  }

  const sharedAccesses =
    sharedRows
      ?.map((shared) => {
        const profile = normalizeProfile(shared.business_profiles);
        if (!profile) return null;
        const access: BusinessAccess = {
          businessId: profile.id,
          ownerId: profile.user_id,
          businessName: profile.business_name ?? "Projeto sem nome",
          role: shared.role,
        };
        return access;
      })
      .filter((access): access is BusinessAccess => access !== null) ?? [];

  const allAccesses = [ownedAccess, ...sharedAccesses].filter(
    (access): access is BusinessAccess => access !== null,
  );

  return (
    allAccesses.find((access) => access.businessId === selectedBusinessId) ??
    allAccesses[0] ??
    null
  );
}

export async function canEditActiveBusiness() {
  const access = await getActiveBusinessAccess();
  return access?.role === "owner" || access?.role === "editor";
}

export async function getPendingBusinessInviteCount(): Promise<number> {
  if (isLocalMode()) return 0;

  const user = await getSession();
  if (!user) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("collaborators")
    .select("id", { count: "exact", head: true })
    .eq("invited_email", user.email.toLowerCase())
    .eq("status", "pending");

  if (isMissingSchemaCacheRelationError(error, "collaborators")) return 0;
  if (error) return 0;

  return count ?? 0;
}
