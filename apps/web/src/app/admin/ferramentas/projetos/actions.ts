"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@inova-cumau/supabase/admin";
import { requirePlatformRole } from "@/lib/user-role";
import { slugify } from "@/lib/slug";
import { createProjectSchema } from "./schema";

export type ActionResult =
  | { status: "success"; project_id: string }
  | { status: "error"; message: string }
  | { status: "validation_error"; errors: Record<string, string[]> };

const SERVICE_UNAVAILABLE: ActionResult = {
  status: "error",
  message: "Serviço não configurado. Contate o administrador do sistema.",
};

export async function createProject(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformRole(["owner", "administrador", "consultor"]);
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const parsed = createProjectSchema.safeParse({
    title: formData.get("title"),
    tags: formData.getAll("tags"),
  });
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = createAdminClient();
  if (!db) return SERVICE_UNAVAILABLE;

  const slug = `${slugify(parsed.data.title) || "projeto"}-${randomUUID().slice(0, 6)}`;

  const { data: project, error } = await db
    .from("projects")
    .insert({
      owner_id: admin.user.id,
      title: parsed.data.title,
      tags: parsed.data.tags,
      slug,
    })
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
