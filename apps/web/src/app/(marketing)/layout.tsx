import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@inova-cumau/supabase/server";

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
  } | null = null;

  if (authUser) {
    const { data: registration } = await supabase
      .from("startup_registrations")
      .select("responsavel_nome, responsavel_email, avatar_url, role")
      .eq("user_id", authUser.id)
      .single();

    const primeiroNome = registration?.responsavel_nome
      ?.trim()
      .split(/\s+/)[0];

    user = {
      name: primeiroNome ?? "Associado",
      email: registration?.responsavel_email ?? authUser.email ?? "",
      avatar: registration?.avatar_url ?? "",
      role: registration?.role ?? "associado",
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
