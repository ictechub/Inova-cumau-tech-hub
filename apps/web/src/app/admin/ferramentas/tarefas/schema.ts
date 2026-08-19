import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().trim().min(1, "Informe um título."),
  description: z.string().trim().max(500, "Máximo de 500 caracteres."),
});

export type CreateBoardData = z.infer<typeof createBoardSchema>;

export const updateBoardSchema = z.object({
  board_id: z.string().uuid(),
  title: z.string().trim().min(1, "Informe um título."),
  description: z.string().trim().max(500, "Máximo de 500 caracteres."),
});

export const deleteBoardSchema = z.object({
  board_id: z.string().uuid(),
});
