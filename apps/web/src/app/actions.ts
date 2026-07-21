"use server";

import { createClient } from "@inova-cumau/supabase/server";

import type { FormState } from "@/lib/form-state";

export async function submitMembership(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const startup = String(formData.get("startup") ?? "").trim();
  const segmento = String(formData.get("segmento") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  if (!nome || !startup || !segmento || !whatsapp) {
    return { status: "error", message: "Preencha todos os campos para continuar." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads_associacao")
    .insert({ nome, startup, segmento, whatsapp });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível enviar seu cadastro agora. Tente novamente em instantes.",
    };
  }

  return {
    status: "success",
    message: "Recebemos seu cadastro! Nosso time entra em contato pelo WhatsApp em breve.",
  };
}

export async function submitNewsletter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Informe um e-mail válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { status: "success", message: "Você já está inscrito no Giro Cumaú." };
    }
    return {
      status: "error",
      message: "Não foi possível concluir sua inscrição agora. Tente novamente.",
    };
  }

  return { status: "success", message: "Inscrição confirmada! Fique de olho no seu e-mail." };
}
