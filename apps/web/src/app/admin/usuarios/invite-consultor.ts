"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@inova-cumau/supabase/admin";
import { createResendClient, getResendFromEmail } from "@/lib/resend";
import { renderConsultorInviteEmail } from "@/lib/email-templates/consultor-invite";
import { requirePlatformAdmin } from "@/lib/user-role";
import { inviteConsultorSchema } from "./schema";
import type { ActionResult } from "./actions";

const SERVICE_UNAVAILABLE: ActionResult = {
  status: "error",
  message: "Serviço não configurado. Contate o administrador do sistema.",
};

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}

export async function inviteConsultor(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin) {
    return { status: "error", message: "Acesso não autorizado." };
  }

  const raw = {
    responsavel_nome: formData.get("responsavel_nome") as string,
    responsavel_email: formData.get("responsavel_email") as string,
  };

  const parsed = inviteConsultorSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "validation_error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { responsavel_nome, responsavel_email } = parsed.data;
  const responsavel_cargo = "Consultor";

  const db = createAdminClient();
  const resend = createResendClient();
  const fromEmail = getResendFromEmail();
  if (!db || !resend || !fromEmail) return SERVICE_UNAVAILABLE;

  const origin = await getOrigin();

  const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
    type: "invite",
    email: responsavel_email,
    options: {
      data: { responsavel_nome, responsavel_cargo },
      redirectTo: `${origin}/convite/definir-senha`,
    },
  });

  if (linkError || !linkData.user) {
    return {
      status: "error",
      message: "Não foi possível gerar o convite. Verifique se o e-mail já está em uso.",
    };
  }

  const userId = linkData.user.id;

  const { error: registrationError } = await db.from("startup_registrations").insert({
    user_id: userId,
    responsavel_nome,
    responsavel_email,
    responsavel_telefone: "Não informado",
    responsavel_cargo,
    startup_nome: "Consultoria",
    startup_cnpj: null,
    startup_cnpj_ausente: true,
    fase_negocio: "ideacao",
    startup_site: null,
    startup_descricao: "Consultoria",
    contato_cidade: "Santana",
    contato_estado: "AP",
    segmentos: ["outra"],
    segmento_outro: "Consultoria",
    objetivo_filiacao: ["outros"],
    objetivo_filiacao_outro: "Consultoria",
    status: "aprovado",
    role: "admin",
    termos_aceitos: true,
    termos_aceitos_em: new Date().toISOString(),
  });

  if (registrationError) {
    await db.auth.admin.deleteUser(userId);
    return { status: "error", message: "Não foi possível criar o cadastro do consultor." };
  }

  const { error: roleError } = await db
    .from("user_roles")
    .upsert({ user_id: userId, role: "consultor" }, { onConflict: "user_id" });

  if (roleError) {
    await db.auth.admin.deleteUser(userId);
    return { status: "error", message: "Não foi possível definir o nível de acesso do consultor." };
  }

  const { error: emailError } = await resend.emails.send({
    from: fromEmail,
    to: responsavel_email,
    subject: "Convite para a Inova Cumaú",
    html: renderConsultorInviteEmail({
      nome: responsavel_nome,
      actionLink: linkData.properties.action_link,
    }),
  });

  if (emailError) {
    return {
      status: "error",
      message: "Conta criada, mas não foi possível enviar o e-mail de convite.",
    };
  }

  revalidatePath("/admin/usuarios");
  return { status: "success", message: "Convite enviado com sucesso." };
}
