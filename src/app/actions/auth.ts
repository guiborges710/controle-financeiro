"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocalMode } from "@/lib/config/mode";
import { LOCAL_SESSION_COOKIE } from "@/lib/auth/constants";

export async function signInLocal(): Promise<void> {
  if (!isLocalMode()) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCAL_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/empresa");
}
