/** Modo local: dados em `data/store.json`, sem Supabase. */
export function isLocalMode(): boolean {
  const mode = process.env.DATA_MODE?.toLowerCase();
  if (mode === "local") return true;
  if (mode === "supabase") return false;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

  if (!url || !key) return true;
  if (url.includes("placeholder") || key.includes("placeholder")) return true;

  return false;
}
