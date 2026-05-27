import type { Industry } from "@/lib/types";

export type IndustryConfig = {
  id: Industry;
  label: string;
  description: string;
  productLines: { id: string; label: string }[];
};

/** Ramo ativo no MVP — formulário de escolha virá depois */
export const ACTIVE_INDUSTRY: Industry = "delivery";

export const INDUSTRY_CONFIG: Record<Industry, IndustryConfig> = {
  delivery: {
    id: "delivery",
    label: "Delivery",
    description:
      "Doces e pratos salgados (macarrão, sopa e outros). Controle de faturamento e custos por linha de produto.",
    productLines: [
      { id: "doces", label: "Doces" },
      { id: "macarrao", label: "Macarrão" },
      { id: "sopa", label: "Sopa" },
      { id: "outros_salgados", label: "Outros salgados" },
    ],
  },
};

export function getActiveIndustryConfig(): IndustryConfig {
  return INDUSTRY_CONFIG[ACTIVE_INDUSTRY];
}
