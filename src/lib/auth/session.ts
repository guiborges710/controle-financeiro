import { cookies } from "next/headers";
import { isLocalMode } from "@/lib/config/mode";
import { LOCAL_DEMO_USER, LOCAL_SESSION_COOKIE } from "@/lib/auth/constants";
import type { SessionUser } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

export async function getSession(): Promise<SessionUser | null> {
  if (isLocalMode()) {
    const cookieStore = await cookies();
    if (cookieStore.get(LOCAL_SESSION_COOKIE)?.value === "1") {
      return { ...LOCAL_DEMO_USER };
    }
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? "usuário",
  };
}
