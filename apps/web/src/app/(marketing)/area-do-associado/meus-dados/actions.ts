"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@inova-cumau/supabase/server";
import { lookupCnpj } from "@/app/associe-se/actions";
import { meusDadosSchema, type MeusDadosData } from "./schema";

export type UpdateResult =
  | { status: "success" }
  | { status: "error"; message: string }
  | { status: "validation_error"; errors: Record<string, string[]> };

export type AvatarUploadResult =
  | { status: "success"; avatarUrl: string }
  | { status: "error"; message: string };

export type AvatarDeleteResult =
  | { status: "success" }
  | { status: "error"; message: string };

const AVATAR_BUCKET = "profile-photos";
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadAvatar(file: File): Promise<AvatarUploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
    return {
      status: "error",
      message: "Formato inválido. Envie uma imagem JPEG, PNG ou WebP.",
    };
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return { status: "error", message: "A imagem deve ter no máximo 2 MB." };
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return {
      status: "error",
      message: "Não foi possível enviar a imagem. Tente novamente.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("startup_registrations")
    .update({ avatar_url: avatarUrl })
    .eq("user_id", user.id);

  if (updateError) {
    return {
      status: "error",
      message: "Imagem enviada, mas não foi possível salvar. Tente novamente.",
    };
  }

  revalidatePath("/area-do-associado");
  revalidatePath("/area-do-associado/meus-dados");
  revalidatePath("/", "layout");

  return { status: "success", avatarUrl };
}

export async function deleteAvatar(): Promise<AvatarDeleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { data: files } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(user.id);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${user.id}/${f.name}`);
    await supabase.storage.from(AVATAR_BUCKET).remove(paths);
  }

  const { error } = await supabase
    .from("startup_registrations")
    .update({ avatar_url: null })
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível remover a foto. Tente novamente." };
  }

  revalidatePath("/area-do-associado");
  revalidatePath("/area-do-associado/meus-dados");
  revalidatePath("/", "layout");

  return { status: "success" };
}

export async function updateMeusDados(
  _prev: UpdateResult | null,
  formData: FormData,
): Promise<UpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const raw = {
    responsavel_nome: formData.get("responsavel_nome") as string,
    responsavel_email: formData.get("responsavel_email") as string,
    responsavel_telefone: formData.get("responsavel_telefone") as string,
    responsavel_whatsapp: (formData.get("responsavel_whatsapp") as string) || "",
    responsavel_cargo: formData.get("responsavel_cargo") as string,
    startup_nome: formData.get("startup_nome") as string,
    startup_cnpj: (formData.get("startup_cnpj") as string) || "",
    startup_cnpj_ausente: formData.get("startup_cnpj_ausente") === "true",
    contato_endereco: (formData.get("contato_endereco") as string) || "",
    contato_cidade: formData.get("contato_cidade") as string,
    contato_estado: formData.get("contato_estado") as string,
    fase_negocio: formData.get("fase_negocio") as string,
    startup_descricao: formData.get("startup_descricao") as string,
    segmentos: formData.getAll("segmentos") as string[],
    segmento_outro: (formData.get("segmento_outro") as string) || "",
    segmentacao_outros_detalhes:
      (formData.get("segmentacao_outros_detalhes") as string) || "",
    objetivo_filiacao: formData.getAll("objetivo_filiacao") as string[],
    objetivo_filiacao_outro:
      (formData.get("objetivo_filiacao_outro") as string) || "",
  };

  const parsed = meusDadosSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  const { error } = await supabase
    .from("startup_registrations")
    .update({
      responsavel_nome: data.responsavel_nome,
      responsavel_email: data.responsavel_email,
      responsavel_telefone: data.responsavel_telefone,
      responsavel_whatsapp: data.responsavel_whatsapp || null,
      responsavel_cargo: data.responsavel_cargo,
      startup_nome: data.startup_nome,
      startup_cnpj: data.startup_cnpj_ausente
        ? null
        : (data.startup_cnpj?.replace(/\D/g, "") || null),
      startup_cnpj_ausente: data.startup_cnpj_ausente,
      contato_endereco: data.contato_endereco || null,
      contato_cidade: data.contato_cidade,
      contato_estado: data.contato_estado || null,
      fase_negocio: data.fase_negocio,
      startup_descricao: data.startup_descricao,
      segmentos: data.segmentos,
      segmento_outro: data.segmentos.includes("outra")
        ? (data.segmento_outro || null)
        : null,
      segmentacao_outros_detalhes: data.segmentacao_outros_detalhes || null,
      objetivo_filiacao: data.objetivo_filiacao,
      objetivo_filiacao_outro: data.objetivo_filiacao.includes("outros")
        ? (data.objetivo_filiacao_outro || null)
        : null,
    })
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível salvar os dados. Tente novamente." };
  }

  revalidatePath("/area-do-associado");
  revalidatePath("/area-do-associado/meus-dados");

  return { status: "success" };
}

export { lookupCnpj };
