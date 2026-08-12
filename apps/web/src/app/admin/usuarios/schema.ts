import { z } from "zod";

export const updateRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["administrador", "consultor", "associado"], {
    message: "Selecione um nível de acesso válido.",
  }),
});

export type UpdateRoleData = z.infer<typeof updateRoleSchema>;

export const deleteUserSchema = z.object({
  user_id: z.string().uuid(),
});

export type DeleteUserData = z.infer<typeof deleteUserSchema>;

export const inviteConsultorSchema = z.object({
  responsavel_nome: z.string().trim().min(1, "Informe o nome."),
  responsavel_email: z.string().trim().email("Informe um e-mail válido."),
});

export type InviteConsultorData = z.infer<typeof inviteConsultorSchema>;
