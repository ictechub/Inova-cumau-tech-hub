"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@inova-cumau/supabase/admin";
import { requirePlatformRole } from "@/lib/user-role";

export type ActionResult =
  | { status: "success"; project_id: string }
  | { status: "error"; message: string };

const SERVICE_UNAVAILABLE: ActionResult = {
  status: "error",
  message: "Serviço não configurado. Contate o administrador do sistema.",
};

export async function createProject(
  _prev: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformRole(["owner", "administrador", "consultor"]);
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  const slug = `sem-titulo-${randomUUID().slice(0, 8)}`;

  const { data: project, error } = await db
    .from("projects")
    .insert({ owner_id: admin.user.id, title: "Sem título", slug })
    .select("id")
    .single();

  if (error || !project) {
    return {
      status: "error",
      message: "Não foi possível criar o projeto. Tente novamente.",
    };
  }

  revalidatePath("/admin/ferramentas/projetos");
  return { status: "success", project_id: project.id };
}
