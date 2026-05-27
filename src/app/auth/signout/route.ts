import { isLocalMode } from "@/lib/config/mode";
import { LOCAL_SESSION_COOKIE } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (isLocalMode()) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(LOCAL_SESSION_COOKIE);
    return response;
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url));
}
