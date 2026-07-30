"use server";

import { createClient } from "@inova-cumau/supabase/server";

import {
  step6Schema,
  step7Schema,
  wizardDataSchema,
  type WizardData,
} from "@/components/registration-wizard/schema";
import { isValidCNPJ } from "@/lib/cnpj";
import type { OtpFormState, RegistrationFormState } from "./form-state";

type BrasilApiCnpjResponse = {
  razao_social?: string;
  nome_fantasia?: string;
  descricao_tipo_de_logradouro?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
};

export type CnpjLookupResult =
  | {
      status: "success";
      data: { startupNome: string; enderecoCompleto: string; cidade: string };
    }
  | { status: "not_found" }
  | { status: "invalid" }
  | { status: "error" };

export async function lookupCnpj(cnpj: string): Promise<CnpjLookupResult> {
  const digits = cnpj.replace(/\D/g, "");

  if (!isValidCNPJ(digits)) {
    return { status: "invalid" };
  }

  let response: Response;
  try {
    response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
  } catch {
    return { status: "error" };
  }

  if (response.status === 404) {
    return { status: "not_found" };
  }

  if (!response.ok) {
    return { status: "error" };
  }

  const payload = (await response.json()) as BrasilApiCnpjResponse;

  const logradouro =
    payload.descricao_tipo_de_logradouro && payload.logradouro
      ? `${payload.descricao_tipo_de_logradouro} ${payload.logradouro}`
      : payload.logradouro;

  const enderecoCompleto = [logradouro, payload.numero, payload.bairro]
    .filter(Boolean)
    .join(", ");

  return {
    status: "success",
    data: {
      startupNome: (payload.nome_fantasia || payload.razao_social || "").trim(),
      enderecoCompleto,
      cidade: payload.municipio ?? "",
    },
  };
}

async function insertStartupRegistration(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  wizardData: WizardData,
) {
  return supabase.from("startup_registrations").insert({
    user_id: userId,
    responsavel_nome: wizardData.responsavel_nome,
    responsavel_email: wizardData.responsavel_email,
    responsavel_telefone: wizardData.responsavel_telefone,
    responsavel_whatsapp: wizardData.responsavel_whatsapp || null,
    responsavel_cargo: wizardData.responsavel_cargo,
    startup_nome: wizardData.startup_nome,
    startup_cnpj: wizardData.startup_cnpj_ausente
      ? null
      : wizardData.startup_cnpj?.replace(/\D/g, "") || null,
    startup_cnpj_ausente: wizardData.startup_cnpj_ausente,
    fase_negocio: wizardData.fase_negocio,
    startup_site: null,
    startup_descricao: wizardData.startup_descricao,
    contato_email: null,
    contato_telefone: null,
    contato_whatsapp: null,
    contato_instagram: null,
    contato_facebook: null,
    contato_linkedin: null,
    contato_endereco: wizardData.contato_endereco || null,
    contato_cidade: wizardData.contato_cidade,
    segmentos: wizardData.segmentos,
    segmento_outro: wizardData.segmento_outro || null,
    segmentacao_outros_detalhes: wizardData.segmentacao_outros_detalhes || null,
    objetivo_filiacao: wizardData.objetivo_filiacao,
    objetivo_filiacao_outro: wizardData.objetivo_filiacao_outro || null,
    termos_aceitos: wizardData.termos_aceitos,
    termos_aceitos_em: new Date().toISOString(),
  });
}

export async function submitRegistration(
  _prevState: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  const credentials = step6Schema.safeParse({
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
    confirmar_senha: String(formData.get("confirmar_senha") ?? ""),
  });

  if (!credentials.success) {
    return {
      status: "error",
      message: credentials.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return {
      status: "error",
      message: "Dados do cadastro corrompidos. Volte e preencha novamente.",
    };
  }

  const wizardResult = wizardDataSchema.safeParse(payload);
  if (!wizardResult.success) {
    return {
      status: "error",
      message: "Dados do cadastro incompletos. Volte e revise as etapas anteriores.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: credentials.data.email,
    password: credentials.data.senha,
  });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível criar sua conta agora. Tente novamente em instantes.",
    };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      status: "error",
      message: "Este e-mail já está cadastrado. Tente novamente com outro e-mail.",
    };
  }

  if (!data.session || !data.user) {
    return { status: "otp_pending", email: credentials.data.email };
  }

  const { error: insertError } = await insertStartupRegistration(
    supabase,
    data.user.id,
    wizardResult.data,
  );

  if (insertError) {
    return {
      status: "error",
      message:
        "Sua conta foi criada, mas não conseguimos salvar os dados do cadastro. Entre em contato com o suporte.",
    };
  }

  return { status: "success" };
}

export async function verifyRegistrationOtp(
  _prevState: OtpFormState,
  formData: FormData,
): Promise<OtpFormState> {
  const email = String(formData.get("email") ?? "");
  const parsed = step7Schema.safeParse({ code: String(formData.get("code") ?? "") });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Código inválido.",
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return {
      status: "error",
      message: "Dados do cadastro corrompidos. Volte e preencha novamente.",
    };
  }

  const wizardResult = wizardDataSchema.safeParse(payload);
  if (!wizardResult.success) {
    return {
      status: "error",
      message: "Dados do cadastro incompletos. Volte e revise as etapas anteriores.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: parsed.data.code,
    type: "signup",
  });

  if (error || !data.session || !data.user) {
    return {
      status: "error",
      message: "Código incorreto ou expirado. Confira o e-mail e tente novamente.",
    };
  }

  const { error: insertError } = await insertStartupRegistration(
    supabase,
    data.user.id,
    wizardResult.data,
  );

  if (insertError) {
    return {
      status: "error",
      message:
        "Conta confirmada, mas não conseguimos salvar os dados do cadastro. Entre em contato com o suporte.",
    };
  }

  return { status: "success" };
}

export async function resendRegistrationOtp(
  email: string,
): Promise<{ error: boolean; retryAfterSeconds?: number }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (!error) {
    return { error: false };
  }

  const match = error.message.match(/after (\d+) seconds?/i);
  return { error: true, retryAfterSeconds: match ? Number(match[1]) : undefined };
}
