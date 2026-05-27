import { ensureBusinessProfile } from "@/app/actions/transactions";

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureBusinessProfile();
  return children;
}
