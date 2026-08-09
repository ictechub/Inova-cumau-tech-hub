import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@inova-cumau/supabase/server";
import { getPlatformRole } from "@/lib/user-role";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
    matricula_numero?: number;
  } | null = null;

  if (authUser) {
    const [{ data: registration }, role] = await Promise.all([
      supabase
        .from("startup_registrations")
        .select("responsavel_nome, responsavel_email, avatar_url, matricula_numero")
        .eq("user_id", authUser.id)
        .single(),
      getPlatformRole(supabase, authUser.id),
    ]);

    const primeiroNome = registration?.responsavel_nome
      ?.trim()
      .split(/\s+/)[0];

    user = {
      name: primeiroNome ?? "Associado",
      email: registration?.responsavel_email ?? authUser.email ?? "",
      avatar: registration?.avatar_url ?? "",
      role,
      matricula_numero: registration?.matricula_numero,
    };
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
