"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@inova-cumau/supabase/server";
import {
  myDetailsSchema,
  profileSchema,
  passwordSchema,
  emailSchema,
  notificationSchema,
} from "./schema";

export type ActionResult =
  | { status: "success"; message?: string }
  | { status: "error"; message: string }
  | { status: "validation_error"; errors: Record<string, string[]> };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function updateMyDetails(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const raw = {
    responsavel_nome: formData.get("responsavel_nome") as string,
    responsavel_cargo: formData.get("responsavel_cargo") as string,
  };

  const parsed = myDetailsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { error } = await supabase
    .from("startup_registrations")
    .update(parsed.data)
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível salvar os dados. Tente novamente." };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");

  return { status: "success" };
}

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const raw = {
    perfil_visivel_publico: formData.get("perfil_visivel_publico") === "on",
    startup_site: (formData.get("startup_site") as string) || "",
    contato_instagram: (formData.get("contato_instagram") as string) || "",
    contato_facebook: (formData.get("contato_facebook") as string) || "",
    contato_linkedin: (formData.get("contato_linkedin") as string) || "",
  };

  const parsed = profileSchema.safeParse(raw);
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
      perfil_visivel_publico: data.perfil_visivel_publico,
      startup_site: data.startup_site || null,
      contato_instagram: data.contato_instagram || null,
      contato_facebook: data.contato_facebook || null,
      contato_linkedin: data.contato_linkedin || null,
    })
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível salvar os dados. Tente novamente." };
  }

  revalidatePath("/admin/configuracoes");

  return { status: "success" };
}

export async function updatePassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const raw = {
    senha: formData.get("senha") as string,
    confirmar_senha: formData.get("confirmar_senha") as string,
  };

  const parsed = passwordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.senha });

  if (error) {
    return { status: "error", message: "Não foi possível atualizar a senha. Tente novamente." };
  }

  return { status: "success", message: "Senha atualizada com sucesso." };
}

export async function updateEmail(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const raw = { email: formData.get("email") as string };

  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { error } = await supabase.auth.updateUser({ email: parsed.data.email });

  if (error) {
    return { status: "error", message: "Não foi possível atualizar o e-mail. Tente novamente." };
  }

  return {
    status: "success",
    message: "Verifique sua caixa de entrada para confirmar o novo e-mail de acesso.",
  };
}

export async function updateNotifications(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const raw = {
    notify_email_novidades: formData.get("notify_email_novidades") === "on",
    notify_email_editais: formData.get("notify_email_editais") === "on",
  };

  const parsed = notificationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { error } = await supabase
    .from("startup_registrations")
    .update(parsed.data)
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível salvar as preferências. Tente novamente." };
  }

  revalidatePath("/admin/configuracoes");

  return { status: "success" };
}
