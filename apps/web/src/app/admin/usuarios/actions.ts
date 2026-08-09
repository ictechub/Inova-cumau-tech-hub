"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@inova-cumau/supabase/admin";
import { requirePlatformAdmin } from "@/lib/user-role";
import { deleteUserSchema, updateRoleSchema } from "./schema";

export type ActionResult =
  | { status: "success"; message?: string }
  | { status: "error"; message: string }
  | { status: "validation_error"; errors: Record<string, string[]> };

const SERVICE_UNAVAILABLE: ActionResult = {
  status: "error",
  message: "Serviço não configurado. Contate o administrador do sistema.",
};

export async function updateUserRole(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const raw = {
    user_id: formData.get("user_id") as string,
    role: formData.get("role") as string,
  };

  const parsed = updateRoleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { user_id, role } = parsed.data;

  if (user_id === admin.user.id) {
    return {
      status: "error",
      message: "Você não pode alterar seu próprio nível de acesso.",
    };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  if (admin.role !== "owner") {
    const { data: targetRole } = await db
      .from("user_roles")
      .select("role")
      .eq("user_id", user_id)
      .maybeSingle();

    if (targetRole?.role === "owner") {
      return { status: "error", message: "Esta conta não pode ser alterada." };
    }
  }

  const { error } = await db
    .from("user_roles")
    .upsert({ user_id, role }, { onConflict: "user_id" });

  if (error) {
    return { status: "error", message: "Não foi possível salvar o nível de acesso. Tente novamente." };
  }

  revalidatePath("/admin/usuarios");
  return { status: "success" };
}

export async function deleteUser(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const raw = { user_id: formData.get("user_id") as string };

  const parsed = deleteUserSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { user_id } = parsed.data;

  if (user_id === admin.user.id) {
    return {
      status: "error",
      message: "Você não pode excluir sua própria conta.",
    };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  if (admin.role !== "owner") {
    const { data: targetRole } = await db
      .from("user_roles")
      .select("role")
      .eq("user_id", user_id)
      .maybeSingle();

    if (targetRole?.role === "owner") {
      return { status: "error", message: "Esta conta não pode ser alterada." };
    }
  }

  const { error } = await db.auth.admin.deleteUser(user_id);

  if (error) {
    return { status: "error", message: "Não foi possível excluir a conta. Tente novamente." };
  }

  revalidatePath("/admin/usuarios");
  return { status: "success" };
}
