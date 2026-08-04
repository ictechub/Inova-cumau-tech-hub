import { z } from "zod";

import { isValidCNPJ } from "@/lib/cnpj";
import { BUSINESS_PHASE_VALUES } from "@/components/registration-wizard/schema";

export const meusDadosSchema = z
  .object({
    responsavel_nome: z.string().trim().min(3, "Informe o nome completo."),
    responsavel_email: z.string().trim().email("Informe um e-mail válido."),
    responsavel_telefone: z
      .string()
      .trim()
      .min(10, "Informe um telefone válido com DDD."),
    responsavel_whatsapp: z.string().trim().optional().or(z.literal("")),
    responsavel_cargo: z
      .string()
      .trim()
      .min(2, "Informe o cargo/função.")
      .max(30, "Máximo de 30 caracteres."),
    startup_nome: z.string().trim().min(2, "Informe o nome do negócio."),
    startup_cnpj: z.string().trim().optional().or(z.literal("")),
    startup_cnpj_ausente: z.boolean(),
    contato_endereco: z.string().trim().optional().or(z.literal("")),
    contato_cidade: z.string().trim().min(2, "Informe a cidade."),
    fase_negocio: z.enum(BUSINESS_PHASE_VALUES, {
      message: "Selecione a fase do negócio.",
    }),
    startup_descricao: z
      .string()
      .trim()
      .min(20, "Descreva o negócio em pelo menos 20 caracteres.")
      .max(500, "Máximo de 500 caracteres."),
    segmentos: z.array(z.string()).min(1, "Selecione ao menos um segmento."),
    segmento_outro: z.string().trim().optional().or(z.literal("")),
    segmentacao_outros_detalhes: z
      .string()
      .trim()
      .max(200, "Máximo de 200 caracteres.")
      .optional()
      .or(z.literal("")),
    objetivo_filiacao: z
      .array(z.string())
      .min(1, "Selecione ao menos um objetivo."),
    objetivo_filiacao_outro: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.startup_cnpj_ausente && !isValidCNPJ(data.startup_cnpj ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["startup_cnpj"],
        message: "Informe um CNPJ válido ou marque \"ainda não possuo CNPJ\".",
      });
    }
    if (data.segmentos.includes("outra") && !data.segmento_outro?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["segmento_outro"],
        message: "Descreva o segmento ao selecionar \"Outra\".",
      });
    }
    if (
      data.objetivo_filiacao.includes("outros") &&
      !data.objetivo_filiacao_outro?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["objetivo_filiacao_outro"],
        message: "Descreva o objetivo ao selecionar \"Outros\".",
      });
    }
  });

export type MeusDadosData = z.infer<typeof meusDadosSchema>;
