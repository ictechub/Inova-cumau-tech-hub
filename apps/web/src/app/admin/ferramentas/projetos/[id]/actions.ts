"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@inova-cumau/supabase/admin";
import { requirePlatformRole } from "@/lib/user-role";
import { getProjectAccessLevel, type ProjectAccessLevel } from "@/lib/project-access";
import {
  grantPermissionSchema,
  revokePermissionSchema,
  updateProjectSchema,
} from "./schema";

export type ActionResult =
  | { status: "success" }
  | { status: "error"; message: string }
  | { status: "validation_error"; errors: Record<string, string[]> };

export type MediaUploadResult =
  | { status: "success"; url: string }
  | { status: "error"; message: string };

const NOT_AUTHORIZED: ActionResult = {
  status: "error",
  message: "Acesso não autorizado.",
};

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

async function authorizeProject(projectId: string, allowed: ProjectAccessLevel[]) {
  const admin = await requirePlatformRole(["owner", "administrador", "consultor"]);
  if (!admin) return null;

  const db = createAdminClient();
  if (!db) return null;

  const { data: project } = await db
    .from("projects")
    .select("id, owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;

  const level = await getProjectAccessLevel(db, admin.user.id, admin.role, project);
  if (!allowed.includes(level)) return null;

  return { admin, db, project, level };
}

function revalidateProject(projectId: string) {
  revalidatePath(`/admin/ferramentas/projetos/${projectId}`);
  revalidatePath("/admin/ferramentas/projetos");
}

export async function updateProject(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const projectId = formData.get("project_id") as string;
  const ctx = await authorizeProject(projectId, ["total", "editar"]);
  if (!ctx) return NOT_AUTHORIZED;

  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    content: formData.get("content") as string,
    cover_image_url: (formData.get("cover_image_url") as string) || null,
    tags: formData.getAll("tags") as string[],
  };

  const parsed = updateProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "validation_error", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  let content: unknown;
  try {
    content = JSON.parse(parsed.data.content);
  } catch {
    return { status: "error", message: "Conteúdo inválido." };
  }

  const { error } = await ctx.db
    .from("projects")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      content: content as never,
      cover_image_url: parsed.data.cover_image_url,
      tags: parsed.data.tags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    return {
      status: "error",
      message: error.code === "23505" ? "Já existe um projeto com este slug." : "Não foi possível salvar. Tente novamente.",
    };
  }

  revalidateProject(projectId);
  return { status: "success" };
}

export async function publishProject(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const projectId = formData.get("project_id") as string;
  const ctx = await authorizeProject(projectId, ["total", "editar"]);
  if (!ctx) return NOT_AUTHORIZED;

  const { error } = await ctx.db
    .from("projects")
    .update({ status: "publicado", published_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) return { status: "error", message: "Não foi possível publicar. Tente novamente." };

  revalidateProject(projectId);
  return { status: "success" };
}

export async function unpublishProject(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const projectId = formData.get("project_id") as string;
  const ctx = await authorizeProject(projectId, ["total", "editar"]);
  if (!ctx) return NOT_AUTHORIZED;

  const { error } = await ctx.db
    .from("projects")
    .update({ status: "rascunho", published_at: null })
    .eq("id", projectId);

  if (error) return { status: "error", message: "Não foi possível reverter a publicação. Tente novamente." };

  revalidateProject(projectId);
  return { status: "success" };
}

export async function deleteProject(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const projectId = formData.get("project_id") as string;
  const ctx = await authorizeProject(projectId, ["total"]);
  if (!ctx) return NOT_AUTHORIZED;

  const { error } = await ctx.db.from("projects").delete().eq("id", projectId);
  if (error) return { status: "error", message: "Não foi possível excluir o projeto. Tente novamente." };

  revalidatePath("/admin/ferramentas/projetos");
  return { status: "success" };
}

export async function grantProjectPermission(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const projectId = formData.get("project_id") as string;
  const ctx = await authorizeProject(projectId, ["total"]);
  if (!ctx) return NOT_AUTHORIZED;

  const parsed = grantPermissionSchema.safeParse({
    user_id: formData.get("user_id") as string,
    permission: formData.get("permission") as string,
  });
  if (!parsed.success) {
    return { status: "validation_error", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { error } = await ctx.db
    .from("project_permissions")
    .upsert(
      {
        project_id: projectId,
        user_id: parsed.data.user_id,
        permission: parsed.data.permission,
        granted_by: ctx.admin.user.id,
      },
      { onConflict: "project_id,user_id" },
    );

  if (error) return { status: "error", message: "Não foi possível conceder a permissão. Tente novamente." };

  revalidateProject(projectId);
  return { status: "success" };
}

export async function revokeProjectPermission(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const projectId = formData.get("project_id") as string;
  const ctx = await authorizeProject(projectId, ["total"]);
  if (!ctx) return NOT_AUTHORIZED;

  const parsed = revokePermissionSchema.safeParse({
    permission_id: formData.get("permission_id") as string,
  });
  if (!parsed.success) return NOT_AUTHORIZED;

  const { error } = await ctx.db
    .from("project_permissions")
    .delete()
    .eq("id", parsed.data.permission_id)
    .eq("project_id", projectId);

  if (error) return { status: "error", message: "Não foi possível remover a permissão. Tente novamente." };

  revalidateProject(projectId);
  return { status: "success" };
}

const MEDIA_BUCKET = "project-media";
const MEDIA_MAX_BYTES = 20 * 1024 * 1024;
const MEDIA_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
];

async function uploadMedia(db: AdminClient, projectId: string, file: File): Promise<MediaUploadResult> {
  if (!MEDIA_ALLOWED_TYPES.includes(file.type)) {
    return { status: "error", message: "Formato não suportado. Envie uma imagem ou vídeo (MP4/WebM)." };
  }
  if (file.size > MEDIA_MAX_BYTES) {
    return { status: "error", message: "O arquivo deve ter no máximo 20 MB." };
  }

  const extension = file.name.split(".").pop() || "bin";
  const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error: uploadError } = await db.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { status: "error", message: "Não foi possível enviar o arquivo. Tente novamente." };
  }

  const { data: { publicUrl } } = db.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { status: "success", url: publicUrl };
}

export async function uploadProjectMedia(projectId: string, file: File): Promise<MediaUploadResult> {
  const ctx = await authorizeProject(projectId, ["total", "editar"]);
  if (!ctx) return { status: "error", message: "Acesso não autorizado." };

  return uploadMedia(ctx.db, projectId, file);
}
