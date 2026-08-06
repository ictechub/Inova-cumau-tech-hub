import { z } from "zod";

import { PASSWORD_REQUIREMENTS } from "@/components/registration-wizard/schema";

export const myDetailsSchema = z.object({
  responsavel_nome: z.string().trim().min(3, "Informe o nome completo."),
  responsavel_cargo: z
    .string()
    .trim()
    .min(2, "Informe o cargo/função.")
    .max(30, "Máximo de 30 caracteres."),
});

export type MyDetailsData = z.infer<typeof myDetailsSchema>;

export const profileSchema = z.object({
  perfil_visivel_publico: z.boolean(),
  startup_site: z.string().trim().optional().or(z.literal("")),
  contato_instagram: z.string().trim().optional().or(z.literal("")),
  contato_facebook: z.string().trim().optional().or(z.literal("")),
  contato_linkedin: z.string().trim().optional().or(z.literal("")),
});

export type ProfileData = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
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

export type PasswordData = z.infer<typeof passwordSchema>;

export const emailSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});

export type EmailData = z.infer<typeof emailSchema>;

export const notificationSchema = z.object({
  notify_email_novidades: z.boolean(),
  notify_email_editais: z.boolean(),
});

export type NotificationData = z.infer<typeof notificationSchema>;
