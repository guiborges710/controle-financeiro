"use server";

import { revalidatePath } from "next/cache";
import { isLocalMode } from "@/lib/config/mode";
import { localResetDemoData } from "@/lib/local/store";

export async function resetLocalDemoData(): Promise<void> {
  if (!isLocalMode()) return;

  await localResetDemoData();
  revalidatePath("/pessoal");
  revalidatePath("/empresa");
  revalidatePath("/pessoal/transacoes");
  revalidatePath("/empresa/transacoes");
}
