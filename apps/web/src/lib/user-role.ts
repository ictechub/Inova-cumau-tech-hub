import { createClient } from "@inova-cumau/supabase/server";

export type PlatformRole = "owner" | "administrador" | "consultor" | "associado";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Fonte de verdade de autorização de plataforma: user_roles, não
// startup_registrations.role (que descreve só o cadastro da startup, não
// autoridade administrativa).
export async function getPlatformRole(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<PlatformRole> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  return (data?.role as PlatformRole | undefined) ?? "associado";
}

// owner é a conta "Admin dos Admin" (autoridade máxima, atribuída só por SQL
// manual), com os mesmos poderes administrativos de administrador e mais
// proteção contra ação de outros admins. Consultor não conta como admin.
export function isPlatformAdmin(role: PlatformRole) {
  return role === "owner" || role === "administrador";
}

// Para Server Actions que usam createAdminClient() (bypassa RLS) para
// ler/escrever linhas de outros usuários. Reconfirma o papel porque Server
// Actions podem ser chamadas diretamente.
export async function requirePlatformRole(roles: PlatformRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = await getPlatformRole(supabase, user.id);
  if (!roles.includes(role)) return null;

  return { user, supabase, role };
}

export async function requirePlatformAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = await getPlatformRole(supabase, user.id);
  if (!isPlatformAdmin(role)) return null;

  return { user, supabase, role };
}
