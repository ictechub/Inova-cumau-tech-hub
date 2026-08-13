import { z } from "zod";

import { PROJECT_TAGS } from "@/lib/project-tags";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Informe um título."),
  tags: z.array(z.enum(PROJECT_TAGS)),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;
