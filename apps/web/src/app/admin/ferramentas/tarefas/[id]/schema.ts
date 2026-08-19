import { z } from "zod";

import { COLUMN_COLORS, TASK_PRIORITIES } from "@/lib/task-board";

// O seletor de data envia um input hidden com o valor ISO já convertido:
// string vazia quando em branco, formato ISO curto quando preenchida.
const dataOpcional = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
]);

const camposDaTarefa = {
  column_id: z.string().uuid("Selecione uma raia."),
  title: z.string().trim().min(1, "Informe um título."),
  description: z.string().trim().max(5000, "Máximo de 5000 caracteres."),
  priority: z.enum(TASK_PRIORITIES, { message: "Selecione uma prioridade." }),
  assignee_ids: z.array(z.string().uuid()),
  tags: z.array(z.string().trim().min(1)).max(20, "Máximo de 20 etiquetas."),
  start_date: dataOpcional,
  due_date: dataOpcional,
};

export const createTaskSchema = z.object({
  board_id: z.string().uuid(),
  ...camposDaTarefa,
});

export const updateTaskSchema = z.object({
  task_id: z.string().uuid(),
  ...camposDaTarefa,
});

export const deleteTaskSchema = z.object({
  task_id: z.string().uuid(),
});

export const createColumnSchema = z.object({
  board_id: z.string().uuid(),
  title: z.string().trim().min(1, "Informe um nome."),
  color: z.enum(COLUMN_COLORS, { message: "Selecione uma cor." }),
});

export const updateColumnSchema = z.object({
  column_id: z.string().uuid(),
  title: z.string().trim().min(1, "Informe um nome."),
  color: z.enum(COLUMN_COLORS, { message: "Selecione uma cor." }),
});

export const deleteColumnSchema = z.object({
  column_id: z.string().uuid(),
});

export const grantBoardPermissionSchema = z.object({
  board_id: z.string().uuid(),
  user_id: z.string().uuid(),
  permission: z.enum(["ver", "editar", "compartilhar"]),
});

export const revokeBoardPermissionSchema = z.object({
  board_id: z.string().uuid(),
  permission_id: z.string().uuid(),
});

export const updateBoardLinkAccessSchema = z.object({
  board_id: z.string().uuid(),
  scope: z.enum(["restrito", "equipe"]),
  permission: z.enum(["ver", "editar"]),
});
