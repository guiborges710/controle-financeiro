import { NextResponse, type NextRequest } from "next/server";
import { isLocalMode } from "@/lib/config/mode";
import { LOCAL_SESSION_COOKIE } from "@/lib/auth/constants";
import { updateSession as updateSupabaseSession } from "@/lib/supabase/middleware";

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/cadastro");
}

function isProtectedRoute(pathname: string) {
  return pathname.startsWith("/empresa");
}

export async function updateSession(request: NextRequest) {
  if (isLocalMode()) {
    const hasSession =
      request.cookies.get(LOCAL_SESSION_COOKIE)?.value === "1";
    const { pathname } = request.nextUrl;

    if (!hasSession && isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (hasSession && isAuthRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/empresa";
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  return updateSupabaseSession(request);
}
