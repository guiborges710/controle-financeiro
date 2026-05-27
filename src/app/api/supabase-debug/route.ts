import { NextResponse } from "next/server";
import { isLocalMode } from "@/lib/config/mode";

export async function GET() {
  const mode = isLocalMode();

  const hasPublicUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasPublicKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServerUrl = Boolean(process.env.SUPABASE_URL);
  const hasServerKey = Boolean(process.env.SUPABASE_ANON_KEY);

  return NextResponse.json({
    isLocalMode: mode,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: hasPublicUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasPublicKey,
      SUPABASE_URL: hasServerUrl,
      SUPABASE_ANON_KEY: hasServerKey,
    },
  });
}
