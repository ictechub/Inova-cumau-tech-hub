"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@inova-cumau/supabase/admin";
import { requirePlatformRole } from "@/lib/user-role";
import { canEditBoard, getBoardAccessLevel } from "@/lib/task-board-access";
import { BASE_COLUMNS, POSITION_STEP } from "@/lib/task-board";
import { createBoardSchema, deleteBoardSchema, updateBoardSchema } from "./schema";

export type ActionResult =
  | { status: "success"; board_id: string }
  | { status: "error"; message: string }
  | { status: "validation_error"; errors: Record<string, string[]> };

const SERVICE_UNAVAILABLE: ActionResult = {
  status: "error",
  message: "Serviço não configurado. Contate o administrador do sistema.",
};

const ALLOWED_ROLES = ["owner", "administrador", "consultor"] as const;

export async function createBoard(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformRole([...ALLOWED_ROLES]);
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const parsed = createBoardSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  const { data: board, error } = await db
    .from("task_boards")
    .insert({
      owner_id: admin.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
    })
    .select("id")
    .single();

  if (error || !board) {
    return {
      status: "error",
      message: "Não foi possível criar o quadro. Tente novamente.",
    };
  }

  // As três raias base nascem junto com o quadro. Ficam aqui, e não num
  // trigger do banco, para manter toda a lógica de negócio nas Server Actions,
  // como no resto do projeto.
  const { error: columnsError } = await db.from("task_board_columns").insert(
    BASE_COLUMNS.map((column, index) => ({
      board_id: board.id,
      title: column.title,
      color: column.color,
      position: (index + 1) * POSITION_STEP,
    })),
  );

  if (columnsError) {
    await db.from("task_boards").delete().eq("id", board.id);
    return {
      status: "error",
      message: "Não foi possível criar as raias do quadro. Tente novamente.",
    };
  }

  revalidatePath("/admin/ferramentas/tarefas");
  return { status: "success", board_id: board.id };
}

export async function updateBoard(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformRole([...ALLOWED_ROLES]);
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const parsed = updateBoardSchema.safeParse({
    board_id: formData.get("board_id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  const { data: board } = await db
    .from("task_boards")
    .select("id, owner_id, link_access_scope, link_access_permission")
    .eq("id", parsed.data.board_id)
    .maybeSingle();

  if (!board) return { status: "error", message: "Quadro não encontrado." };

  const level = await getBoardAccessLevel(db, admin.user.id, admin.role, board);
  if (!canEditBoard(level)) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const { error } = await db
    .from("task_boards")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", board.id);

  if (error) {
    return { status: "error", message: "Não foi possível salvar o quadro." };
  }

  revalidatePath("/admin/ferramentas/tarefas");
  revalidatePath(`/admin/ferramentas/tarefas/${board.id}`);
  return { status: "success", board_id: board.id };
}

export async function deleteBoard(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformRole([...ALLOWED_ROLES]);
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const parsed = deleteBoardSchema.safeParse({ board_id: formData.get("board_id") });
  if (!parsed.success) {
    return { status: "error", message: "Quadro inválido." };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  const { data: board } = await db
    .from("task_boards")
    .select("id, owner_id, link_access_scope, link_access_permission")
    .eq("id", parsed.data.board_id)
    .maybeSingle();

  if (!board) return { status: "error", message: "Quadro não encontrado." };

  // Excluir é exclusivo do dono e do papel owner, a cascata do organograma
  // nunca concede esse poder (mesma regra de projetos).
  const level = await getBoardAccessLevel(db, admin.user.id, admin.role, board);
  if (level !== "total") {
    return { status: "error", message: "Apenas o responsável pode excluir o quadro." };
  }

  const { error } = await db.from("task_boards").delete().eq("id", board.id);
  if (error) {
    return { status: "error", message: "Não foi possível excluir o quadro." };
  }

  revalidatePath("/admin/ferramentas/tarefas");
  return { status: "success", board_id: board.id };
}
