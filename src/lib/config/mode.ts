export type DataMode = "mock" | "production";

/**
 * Troque aqui quando quiser forçar pelo código:
 * - "mock": banco local em data/store.json, sem Supabase.
 * - "production": Auth + PostgreSQL no Supabase.
 *
 * A variável DATA_MODE ainda pode sobrescrever isso quando definida.
 */
export const CODE_DATA_MODE: DataMode = "mock";

export function getDataMode(): DataMode {
  const mode = process.env.DATA_MODE?.toLowerCase();

  if (mode === "mock" || mode === "local") return "mock";
  if (mode === "production" || mode === "prod" || mode === "supabase") {
    return "production";
  }

  return CODE_DATA_MODE;
}

/** Modo mock: dados em `data/store.json`, sem Supabase. */
export function isLocalMode(): boolean {
  return getDataMode() === "mock";
}
