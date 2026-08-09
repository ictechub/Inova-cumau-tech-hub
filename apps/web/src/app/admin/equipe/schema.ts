import { z } from "zod";

export const areaSchema = z.object({
  user_id: z.string().uuid(),
  area: z.string().trim().max(60, "Máximo de 60 caracteres.").optional().or(z.literal("")),
});

export type AreaData = z.infer<typeof areaSchema>;

export const hierarchySchema = z.object({
  user_id: z.string().uuid(),
  hierarchy_level: z.enum(["diretor", "coordenador", "lider", "par"], {
    message: "Selecione um nível hierárquico válido.",
  }),
  reports_to: z.string().uuid().optional().or(z.literal("")),
});

export type HierarchyData = z.infer<typeof hierarchySchema>;

export const permissionSchema = z.object({
  user_id: z.string().uuid(),
  permission_role: z.enum(["admin_geral", "gestor", "membro"], {
    message: "Selecione um papel de permissão válido.",
  }),
});

export type PermissionData = z.infer<typeof permissionSchema>;
