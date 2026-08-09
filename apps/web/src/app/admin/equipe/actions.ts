"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@inova-cumau/supabase/admin";
import { requirePlatformAdmin } from "@/lib/user-role";
import { areaSchema, hierarchySchema, permissionSchema } from "./schema";

export type ActionResult =
  | { status: "success"; message?: string }
  | { status: "error"; message: string }
  | { status: "validation_error"; errors: Record<string, string[]> };

const SERVICE_UNAVAILABLE: ActionResult = {
  status: "error",
  message: "Serviço não configurado. Contate o administrador do sistema.",
};

export async function updateArea(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const raw = {
    user_id: formData.get("user_id") as string,
    area: (formData.get("area") as string) || "",
  };

  const parsed = areaSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  const { user_id, area } = parsed.data;
  const areaValue = area || null;

  const { data: existing, error: selectError } = await db
    .from("team_members")
    .select("id")
    .eq("user_id", user_id)
    .maybeSingle();

  if (selectError) {
    return { status: "error", message: "Não foi possível salvar a área. Tente novamente." };
  }

  const { error } = existing
    ? await db.from("team_members").update({ area: areaValue }).eq("user_id", user_id)
    : await db.from("team_members").insert({ user_id, area: areaValue, hierarchy_level: "par" });

  if (error) {
    return { status: "error", message: "Não foi possível salvar a área. Tente novamente." };
  }

  revalidatePath("/admin/equipe");
  return { status: "success" };
}

export async function updateHierarquia(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const raw = {
    user_id: formData.get("user_id") as string,
    hierarchy_level: formData.get("hierarchy_level") as string,
    reports_to: (formData.get("reports_to") as string) || "",
  };

  const parsed = hierarchySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  const { user_id, hierarchy_level, reports_to } = parsed.data;
  const reportsToValue = reports_to || null;

  const { data: existing, error: selectError } = await db
    .from("team_members")
    .select("id")
    .eq("user_id", user_id)
    .maybeSingle();

  if (selectError) {
    return { status: "error", message: "Não foi possível salvar o organograma. Tente novamente." };
  }

  const { error } = existing
    ? await db
        .from("team_members")
        .update({ hierarchy_level, reports_to: reportsToValue })
        .eq("user_id", user_id)
    : await db
        .from("team_members")
        .insert({ user_id, hierarchy_level, reports_to: reportsToValue });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível salvar o organograma. Verifique se o membro não está reportando a si mesmo.",
    };
  }

  revalidatePath("/admin/equipe");
  return { status: "success" };
}

export async function updatePermissao(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const raw = {
    user_id: formData.get("user_id") as string,
    permission_role: formData.get("permission_role") as string,
  };

  const parsed = permissionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  const { user_id, permission_role } = parsed.data;

  const { data: existing, error: selectError } = await db
    .from("team_members")
    .select("id")
    .eq("user_id", user_id)
    .maybeSingle();

  if (selectError) {
    return { status: "error", message: "Não foi possível salvar a permissão. Tente novamente." };
  }

  const { error } = existing
    ? await db.from("team_members").update({ permission_role }).eq("user_id", user_id)
    : await db
        .from("team_members")
        .insert({ user_id, permission_role, hierarchy_level: "par" });

  if (error) {
    return { status: "error", message: "Não foi possível salvar a permissão. Tente novamente." };
  }

  revalidatePath("/admin/equipe");
  return { status: "success" };
}
