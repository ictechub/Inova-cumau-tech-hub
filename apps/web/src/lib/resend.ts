import { Resend } from "resend";

// Retorna null se a API key não estiver configurada, para o chamador
// degradar a funcionalidade (ex.: falhar o convite com mensagem clara) em
// vez de quebrar a build ou lançar em runtime.
export function createResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) return null;

  return new Resend(apiKey);
}

export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "";
}
