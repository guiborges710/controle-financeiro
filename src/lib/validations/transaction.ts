import { z } from "zod";
import { getCategoriesForUniverse } from "@/lib/constants/categories";
import type { Universe } from "@/lib/types";

export function createTransactionSchema(universe: Universe) {
  const slugs = getCategoriesForUniverse(universe).map((c) => c.slug);

  return z
    .object({
      type: z.enum(["income", "expense"]),
      category_slug: z.enum(slugs as [string, ...string[]]),
      amount: z.coerce.number().positive("Informe um valor maior que zero"),
      description: z.string().max(500).optional(),
      occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .refine(
      (data) => {
        const cat = getCategoriesForUniverse(universe).find(
          (c) => c.slug === data.category_slug,
        );
        return cat?.type === data.type;
      },
      { message: "Categoria não combina com o tipo selecionado" },
    );
}

export type TransactionFormInput = z.infer<
  ReturnType<typeof createTransactionSchema>
>;
