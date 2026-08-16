import { z } from "zod";

import { PROJECT_TAGS } from "@/lib/project-tags";
import { PROJECT_SECTION_VALUES } from "@/lib/project-sections";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const updateProjectSchema = z.object({
  title: z.string().trim().min(1, "Informe um título."),
  slug: z
    .string()
    .trim()
    .min(1, "Informe um slug.")
    .regex(SLUG_REGEX, "Use apenas letras minúsculas, números e hífens."),
  content: z.string().min(1, "Conteúdo inválido."),
  cover_image_url: z.string().trim().nullable(),
  tags: z.array(z.enum(PROJECT_TAGS)),
  section: z.enum(PROJECT_SECTION_VALUES, { message: "Selecione uma seção." }),
  show_author: z.boolean(),
});

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

export const grantPermissionSchema = z.object({
  user_id: z.string().uuid("Selecione um usuário."),
  permission: z.enum(["ver", "editar", "compartilhar"], {
    message: "Selecione um nível de permissão.",
  }),
});

export const revokePermissionSchema = z.object({
  permission_id: z.string().uuid(),
});

export const updateLinkAccessSchema = z.object({
  scope: z.enum(["restrito", "equipe"], { message: "Selecione um escopo válido." }),
  permission: z.enum(["ver", "editar"], { message: "Selecione um nível de permissão." }),
});
