"use server";

import { redirect } from "next/navigation";

import { createClient } from "@inova-cumau/supabase/server";
import { getPlatformRole, isPlatformAdmin } from "@/lib/user-role";
import type { LoginFormState } from "./form-state";

export async function signIn(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("password") ?? "");

  if (!email || !senha) {
    return { status: "error", message: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { status: "error", message: "E-mail ou senha incorretos." };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const role = await getPlatformRole(supabase, user.id);

    if (isPlatformAdmin(role) || role === "consultor") {
      redirect("/admin");
    }
  }

  redirect("/area-do-associado");
}
