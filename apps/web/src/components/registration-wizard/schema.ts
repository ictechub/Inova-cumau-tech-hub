import { z } from "zod";

import { isValidCNPJ } from "@/lib/cnpj";

export const step1Schema = z.object({
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
});

export const BUSINESS_PHASE_VALUES = [
  "ideacao",
  "validacao",
  "tracao",
  "escala",
  "saida",
] as const;

export const step2Schema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    if (!data.startup_cnpj_ausente && !isValidCNPJ(data.startup_cnpj ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["startup_cnpj"],
        message: "Informe um CNPJ válido ou marque \"ainda não possuo CNPJ\".",
      });
    }
  });

export const step4Schema = z
  .object({
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
    if (
      data.segmentos.includes("outra") &&
      !data.segmento_outro?.trim()
    ) {
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

export const step5Schema = z.object({
  termos_aceitos: z.literal(true, {
    message: "É necessário aceitar os termos para continuar.",
  }),
});

export const PASSWORD_SPECIAL_CHARS = "!@#$%¨&*";

export const PASSWORD_REQUIREMENTS: {
  label: string;
  test: (value: string) => boolean;
}[] = [
  { label: "Mínimo de 8 caracteres", test: (value) => value.length >= 8 },
  { label: "Uma letra maiúscula", test: (value) => /[A-Z]/.test(value) },
  { label: "Uma letra minúscula", test: (value) => /[a-z]/.test(value) },
  { label: "Um número", test: (value) => /[0-9]/.test(value) },
  {
    label: `Um caractere especial (${PASSWORD_SPECIAL_CHARS})`,
    test: (value) => /[!@#$%¨&*]/.test(value),
  },
];

export const step6Schema = z
  .object({
    email: z.string().trim().email("Informe um e-mail válido."),
    senha: z
      .string()
      .refine(
        (value) => PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value)),
        "A senha não atende a todos os critérios de segurança.",
      ),
    confirmar_senha: z.string(),
  })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: "As senhas não coincidem.",
    path: ["confirmar_senha"],
  });

export const step7Schema = z.object({
  code: z
    .string()
    .trim()
    .length(8, "Informe o código de 8 dígitos.")
    .regex(/^\d{8}$/, "O código deve conter apenas números."),
});

export const wizardDataSchema = z
  .object({
    ...step1Schema.shape,
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
    termos_aceitos: z.literal(true, {
      message: "É necessário aceitar os termos para continuar.",
    }),
  })
  .superRefine((data, ctx) => {
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
    if (!data.startup_cnpj_ausente && !isValidCNPJ(data.startup_cnpj ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["startup_cnpj"],
        message: "Informe um CNPJ válido ou marque \"ainda não possuo CNPJ\".",
      });
    }
  });

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type WizardData = z.infer<typeof wizardDataSchema>;
