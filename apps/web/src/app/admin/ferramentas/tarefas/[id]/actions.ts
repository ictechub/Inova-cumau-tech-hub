"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@inova-cumau/supabase/admin";
import { requirePlatformRole } from "@/lib/user-role";
import {
  canEditBoard,
  getBoardAccessLevel,
  type BoardAccessLevel,
} from "@/lib/task-board-access";
import { POSITION_STEP } from "@/lib/task-board";
import {
  createColumnSchema,
  createTaskSchema,
  deleteColumnSchema,
  deleteTaskSchema,
  grantBoardPermissionSchema,
  revokeBoardPermissionSchema,
  updateBoardLinkAccessSchema,
  updateColumnSchema,
  updateTaskSchema,
} from "./schema";
import type { BoardOwner, BoardPermission, ShareableUser } from "./types";

export type ActionResult =
  | { status: "success"; id: string }
  | { status: "error"; message: string }
  | { status: "validation_error"; errors: Record<string, string[]> };

export type MoveResult = { status: "success" } | { status: "error"; message: string };

const NOT_AUTHORIZED: ActionResult = {
  status: "error",
  message: "Acesso não autorizado.",
};

const ALLOWED_ROLES = ["owner", "administrador", "consultor"] as const;

async function authorizeBoard(boardId: string, allowed: BoardAccessLevel[]) {
  const admin = await requirePlatformRole([...ALLOWED_ROLES]);
  if (!admin) return null;

  const db = createAdminClient();
  if (!db) return null;

  const { data: board } = await db
    .from("task_boards")
    .select("id, owner_id, link_access_scope, link_access_permission")
    .eq("id", boardId)
    .maybeSingle();

  if (!board) return null;

  const level = await getBoardAccessLevel(db, admin.user.id, admin.role, board);
  if (!allowed.includes(level)) return null;

  return { admin, db, board, level };
}

// Autorização a partir de uma tarefa: resolve o quadro dono da tarefa antes de
// aplicar a mesma cascata de acesso.
async function authorizeTask(taskId: string) {
  const admin = await requirePlatformRole([...ALLOWED_ROLES]);
  if (!admin) return null;

  const db = createAdminClient();
  if (!db) return null;

  const { data: task } = await db
    .from("tasks")
    .select("id, board_id, column_id, position")
    .eq("id", taskId)
    .maybeSingle();

  if (!task) return null;

  const { data: board } = await db
    .from("task_boards")
    .select("id, owner_id, link_access_scope, link_access_permission")
    .eq("id", task.board_id)
    .maybeSingle();

  if (!board) return null;

  const level = await getBoardAccessLevel(db, admin.user.id, admin.role, board);
  if (!canEditBoard(level)) return null;

  return { admin, db, board, task, level };
}

function revalidateBoard(boardId: string) {
  revalidatePath(`/admin/ferramentas/tarefas/${boardId}`);
  revalidatePath("/admin/ferramentas/tarefas");
}

function lerCamposDaTarefa(formData: FormData) {
  return {
    column_id: formData.get("column_id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    priority: formData.get("priority"),
    assignee_ids: formData.getAll("assignee_ids").map(String),
    tags: formData.getAll("tags").map(String),
    start_date: formData.get("start_date") ?? "",
    due_date: formData.get("due_date") ?? "",
  };
}

export async function createTask(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const boardId = String(formData.get("board_id") ?? "");
  const ctx = await authorizeBoard(boardId, ["total", "editar"]);
  if (!ctx) return NOT_AUTHORIZED;

  const parsed = createTaskSchema.safeParse({
    board_id: boardId,
    ...lerCamposDaTarefa(formData),
  });
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Nova tarefa entra no fim da raia: pega a maior posição atual e soma um passo.
  const { data: ultima } = await ctx.db
    .from("tasks")
    .select("position")
    .eq("column_id", parsed.data.column_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: task, error } = await ctx.db
    .from("tasks")
    .insert({
      board_id: boardId,
      column_id: parsed.data.column_id,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      assignee_ids: parsed.data.assignee_ids,
      tags: parsed.data.tags,
      start_date: parsed.data.start_date || null,
      due_date: parsed.data.due_date || null,
      position: (ultima?.position ?? 0) + POSITION_STEP,
      created_by: ctx.admin.user.id,
    })
    .select("id")
    .single();

  if (error || !task) {
    return { status: "error", message: "Não foi possível criar a tarefa. Tente novamente." };
  }

  revalidateBoard(boardId);
  return { status: "success", id: task.id };
}

export async function updateTask(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const taskId = String(formData.get("task_id") ?? "");
  const ctx = await authorizeTask(taskId);
  if (!ctx) return NOT_AUTHORIZED;

  const parsed = updateTaskSchema.safeParse({
    task_id: taskId,
    ...lerCamposDaTarefa(formData),
  });
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const mudouDeRaia = parsed.data.column_id !== ctx.task.column_id;
  let position = ctx.task.position;

  if (mudouDeRaia) {
    const { data: ultima } = await ctx.db
      .from("tasks")
      .select("position")
      .eq("column_id", parsed.data.column_id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    position = (ultima?.position ?? 0) + POSITION_STEP;
  }

  const { error } = await ctx.db
    .from("tasks")
    .update({
      column_id: parsed.data.column_id,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      assignee_ids: parsed.data.assignee_ids,
      tags: parsed.data.tags,
      start_date: parsed.data.start_date || null,
      due_date: parsed.data.due_date || null,
      position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    return { status: "error", message: "Não foi possível salvar a tarefa." };
  }

  revalidateBoard(ctx.board.id);
  return { status: "success", id: taskId };
}

export async function deleteTask(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = deleteTaskSchema.safeParse({ task_id: formData.get("task_id") });
  if (!parsed.success) return { status: "error", message: "Tarefa inválida." };

  const ctx = await authorizeTask(parsed.data.task_id);
  if (!ctx) return NOT_AUTHORIZED;

  const { error } = await ctx.db.from("tasks").delete().eq("id", parsed.data.task_id);
  if (error) {
    return { status: "error", message: "Não foi possível excluir a tarefa." };
  }

  revalidateBoard(ctx.board.id);
  return { status: "success", id: parsed.data.task_id };
}

// Chamada direta (não via <form>) pelo drag and drop. Não revalida a rota de
// propósito: a visão já atualizou o estado local otimisticamente e um refresh
// a cada solta deixaria o arrasto travado.
export async function moveTask(input: {
  task_id: string;
  column_id: string;
  position: number;
}): Promise<MoveResult> {
  const ctx = await authorizeTask(input.task_id);
  if (!ctx) return { status: "error", message: "Acesso não autorizado." };

  const { data: destino } = await ctx.db
    .from("task_board_columns")
    .select("id")
    .eq("id", input.column_id)
    .eq("board_id", ctx.board.id)
    .maybeSingle();

  if (!destino) return { status: "error", message: "Raia inválida." };

  const { error } = await ctx.db
    .from("tasks")
    .update({
      column_id: input.column_id,
      position: input.position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.task_id);

  if (error) {
    return { status: "error", message: "Não foi possível mover a tarefa." };
  }

  return { status: "success" };
}

// Reprogramação por arrasto na Linha do tempo: só datas, nada de raia.
export async function rescheduleTask(input: {
  task_id: string;
  start_date: string | null;
  due_date: string | null;
}): Promise<MoveResult> {
  const ctx = await authorizeTask(input.task_id);
  if (!ctx) return { status: "error", message: "Acesso não autorizado." };

  const { error } = await ctx.db
    .from("tasks")
    .update({
      start_date: input.start_date,
      due_date: input.due_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.task_id);

  if (error) {
    return { status: "error", message: "Não foi possível reprogramar a tarefa." };
  }

  return { status: "success" };
}

export async function createColumn(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const boardId = String(formData.get("board_id") ?? "");
  const ctx = await authorizeBoard(boardId, ["total", "editar"]);
  if (!ctx) return NOT_AUTHORIZED;

  const parsed = createColumnSchema.safeParse({
    board_id: boardId,
    title: formData.get("title"),
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { data: ultima } = await ctx.db
    .from("task_board_columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: column, error } = await ctx.db
    .from("task_board_columns")
    .insert({
      board_id: boardId,
      title: parsed.data.title,
      color: parsed.data.color,
      position: (ultima?.position ?? 0) + POSITION_STEP,
    })
    .select("id")
    .single();

  if (error || !column) {
    return { status: "error", message: "Não foi possível criar a raia." };
  }

  revalidateBoard(boardId);
  return { status: "success", id: column.id };
}

export async function updateColumn(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateColumnSchema.safeParse({
    column_id: formData.get("column_id"),
    title: formData.get("title"),
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const boardId = String(formData.get("board_id") ?? "");
  const ctx = await authorizeBoard(boardId, ["total", "editar"]);
  if (!ctx) return NOT_AUTHORIZED;

  const { error } = await ctx.db
    .from("task_board_columns")
    .update({ title: parsed.data.title, color: parsed.data.color })
    .eq("id", parsed.data.column_id)
    .eq("board_id", boardId);

  if (error) {
    return { status: "error", message: "Não foi possível salvar a raia." };
  }

  revalidateBoard(boardId);
  return { status: "success", id: parsed.data.column_id };
}

export async function deleteColumn(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = deleteColumnSchema.safeParse({ column_id: formData.get("column_id") });
  if (!parsed.success) return { status: "error", message: "Raia inválida." };

  const boardId = String(formData.get("board_id") ?? "");
  const ctx = await authorizeBoard(boardId, ["total", "editar"]);
  if (!ctx) return NOT_AUTHORIZED;

  // Um quadro sem nenhuma raia não teria onde criar tarefa, então a última
  // nunca pode ser removida.
  const { count } = await ctx.db
    .from("task_board_columns")
    .select("id", { count: "exact", head: true })
    .eq("board_id", boardId);

  if ((count ?? 0) <= 1) {
    return { status: "error", message: "O quadro precisa de pelo menos uma raia." };
  }

  const { error } = await ctx.db
    .from("task_board_columns")
    .delete()
    .eq("id", parsed.data.column_id)
    .eq("board_id", boardId);

  if (error) {
    return { status: "error", message: "Não foi possível excluir a raia." };
  }

  revalidateBoard(boardId);
  return { status: "success", id: parsed.data.column_id };
}

export async function moveColumn(input: {
  board_id: string;
  column_id: string;
  position: number;
}): Promise<MoveResult> {
  const ctx = await authorizeBoard(input.board_id, ["total", "editar"]);
  if (!ctx) return { status: "error", message: "Acesso não autorizado." };

  const { error } = await ctx.db
    .from("task_board_columns")
    .update({ position: input.position })
    .eq("id", input.column_id)
    .eq("board_id", input.board_id);

  if (error) {
    return { status: "error", message: "Não foi possível reordenar as raias." };
  }

  return { status: "success" };
}

export async function grantBoardPermission(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const boardId = formData.get("board_id") as string;
  const ctx = await authorizeBoard(boardId, ["total"]);
  if (!ctx) return NOT_AUTHORIZED;

  const parsed = grantBoardPermissionSchema.safeParse({
    board_id: boardId,
    user_id: formData.get("user_id") as string,
    permission: formData.get("permission") as string,
  });
  if (!parsed.success) {
    return { status: "validation_error", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { error } = await ctx.db
    .from("task_board_permissions")
    .upsert(
      {
        board_id: boardId,
        user_id: parsed.data.user_id,
        permission: parsed.data.permission,
        granted_by: ctx.admin.user.id,
      },
      { onConflict: "board_id,user_id" },
    );

  if (error) return { status: "error", message: "Não foi possível conceder a permissão. Tente novamente." };

  revalidateBoard(boardId);
  return { status: "success", id: boardId };
}

export async function revokeBoardPermission(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const boardId = formData.get("board_id") as string;
  const ctx = await authorizeBoard(boardId, ["total"]);
  if (!ctx) return NOT_AUTHORIZED;

  const parsed = revokeBoardPermissionSchema.safeParse({
    board_id: boardId,
    permission_id: formData.get("permission_id") as string,
  });
  if (!parsed.success) return NOT_AUTHORIZED;

  const { error } = await ctx.db
    .from("task_board_permissions")
    .delete()
    .eq("id", parsed.data.permission_id)
    .eq("board_id", boardId);

  if (error) return { status: "error", message: "Não foi possível remover a permissão. Tente novamente." };

  revalidateBoard(boardId);
  return { status: "success", id: boardId };
}

export async function updateBoardLinkAccess(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const boardId = formData.get("board_id") as string;
  const ctx = await authorizeBoard(boardId, ["total"]);
  if (!ctx) return NOT_AUTHORIZED;

  const parsed = updateBoardLinkAccessSchema.safeParse({
    board_id: boardId,
    scope: formData.get("scope") as string,
    permission: formData.get("permission") as string,
  });
  if (!parsed.success) {
    return { status: "validation_error", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { error } = await ctx.db
    .from("task_boards")
    .update({
      link_access_scope: parsed.data.scope,
      link_access_permission: parsed.data.permission,
    })
    .eq("id", boardId);

  if (error) return { status: "error", message: "Não foi possível atualizar o acesso por link. Tente novamente." };

  revalidateBoard(boardId);
  return { status: "success", id: boardId };
}

export type BoardShareData =
  | {
      status: "success";
      owner: BoardOwner | null;
      permissions: BoardPermission[];
      shareableUsers: ShareableUser[];
      linkAccessScope: string;
      linkAccessPermission: string;
    }
  | { status: "error"; message: string };

export async function getBoardShareData(boardId: string): Promise<BoardShareData> {
  const ctx = await authorizeBoard(boardId, ["total"]);
  if (!ctx) return { status: "error", message: "Acesso não autorizado." };

  const [{ data: permissionRows }, { data: registrations }] = await Promise.all([
    ctx.db.from("task_board_permissions").select("id, user_id, permission").eq("board_id", boardId),
    ctx.db.from("startup_registrations").select("user_id, responsavel_nome, responsavel_email, avatar_url"),
  ]);

  const registrationByUserId = new Map((registrations ?? []).map((r) => [r.user_id, r]));

  const permissions: BoardPermission[] = (permissionRows ?? []).map((row) => {
    const registration = registrationByUserId.get(row.user_id);
    return {
      id: row.id,
      user_id: row.user_id,
      permission: row.permission as "ver" | "editar" | "compartilhar",
      nome: registration?.responsavel_nome ?? "Usuário desconhecido",
      email: registration?.responsavel_email ?? "",
      avatar_url: registration?.avatar_url ?? null,
    };
  });

  const permittedUserIds = new Set(permissions.map((p) => p.user_id));
  const shareableUsers: ShareableUser[] = (registrations ?? [])
    .filter((r) => r.user_id !== ctx.board.owner_id && !permittedUserIds.has(r.user_id))
    .map((r) => ({
      user_id: r.user_id,
      nome: r.responsavel_nome,
      email: r.responsavel_email ?? "",
      avatar_url: r.avatar_url ?? null,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const ownerRegistration = registrationByUserId.get(ctx.board.owner_id);
  const owner: BoardOwner = {
    user_id: ctx.board.owner_id,
    nome: ownerRegistration?.responsavel_nome ?? "Usuário desconhecido",
    email: ownerRegistration?.responsavel_email ?? "",
    avatar_url: ownerRegistration?.avatar_url ?? null,
  };

  return {
    status: "success",
    owner,
    permissions,
    shareableUsers,
    linkAccessScope: ctx.board.link_access_scope,
    linkAccessPermission: ctx.board.link_access_permission,
  };
}
