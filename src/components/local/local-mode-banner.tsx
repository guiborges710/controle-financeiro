import { resetLocalDemoData } from "@/app/actions/local-demo";
import { Database } from "lucide-react";

export function LocalModeBanner() {
  return (
    <div className="border-b border-violet-200 bg-violet-50 px-4 py-2 text-sm text-violet-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2">
          <Database className="h-4 w-4 shrink-0 text-primary" />
          <span>
            <strong>Modo local</strong> — dados em{" "}
            <code className="rounded bg-violet-100 px-1">data/store.json</code>
          </span>
        </p>
        <form action={resetLocalDemoData}>
          <button
            type="submit"
            className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-xs font-medium hover:bg-violet-100"
          >
            Restaurar dados de exemplo
          </button>
        </form>
      </div>
    </div>
  );
}
