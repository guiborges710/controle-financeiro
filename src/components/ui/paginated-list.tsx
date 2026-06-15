"use client";

import { Children, type ReactNode, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  children: ReactNode;
  className?: string;
  pageSize?: number;
  as?: "div" | "ul";
};

export function PaginatedList({
  children,
  className = "",
  pageSize = 5,
  as = "div",
}: Props) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleItems = items.slice(start, start + pageSize);
  const Container = as;

  return (
    <div className="space-y-3">
      <Container className={className}>{visibleItems}</Container>

      {items.length > pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-500">
          <span>
            Mostrando {start + 1}-{Math.min(start + pageSize, items.length)} de{" "}
            {items.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-border-soft bg-white px-3 py-1.5 font-semibold text-stone-700 shadow-sm transition hover:border-violet-200 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <span className="rounded-lg bg-primary-light px-2.5 py-1 font-semibold text-primary">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-border-soft bg-white px-3 py-1.5 font-semibold text-stone-700 shadow-sm transition hover:border-violet-200 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
