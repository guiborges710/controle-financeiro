export function isMissingSchemaCacheRelationError(
  error: { message?: string; code?: string } | null | undefined,
  relation: string,
) {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error?.code === "PGRST205" ||
    (message.includes(relation.toLowerCase()) &&
      (message.includes("schema cache") || message.includes("could not find")))
  );
}
