import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createAdminClient } from "@inova-cumau/supabase/admin";
import { createClient } from "@inova-cumau/supabase/server";
import { getPlatformRole, isPlatformAdmin } from "@/lib/user-role";
import { EquipeTabs, type TeamRosterMember } from "./equipe-tabs";

export const metadata: Metadata = {
  title: "Equipe | Admin | Inova Cumaú",
};

// Só existe uma policy "owner-only" de RLS em startup_registrations e
// user_roles, então montar o roster com todos os admins (não só o usuário
// logado) exige o client de service role. Retorna [] se a service role key
// não estiver configurada, degradando a página para um estado vazio em vez
// de quebrar.
async function getRoster(): Promise<TeamRosterMember[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const [{ data: adminRoleRows }, { data: registrations }, { data: teamMembers }] =
    await Promise.all([
      admin.from("user_roles").select("user_id").in("role", ["administrador", "consultor"]),
      admin
        .from("startup_registrations")
        .select("user_id, responsavel_nome, responsavel_cargo, responsavel_email, avatar_url"),
      admin
        .from("team_members")
        .select("id, user_id, hierarchy_level, permission_role, reports_to, area"),
    ]);

  const adminUserIds = new Set((adminRoleRows ?? []).map((row) => row.user_id));
  const registrationsByUserId = new Map(
    (registrations ?? []).map((registration) => [registration.user_id, registration]),
  );
  const teamByUserId = new Map((teamMembers ?? []).map((member) => [member.user_id, member]));

  return Array.from(adminUserIds)
    .map((userId) => registrationsByUserId.get(userId))
    .filter((registration): registration is NonNullable<typeof registration> => !!registration)
    .map((registration) => {
      const teamMember = teamByUserId.get(registration.user_id);
      return {
        user_id: registration.user_id,
        responsavel_nome: registration.responsavel_nome,
        responsavel_cargo: registration.responsavel_cargo,
        responsavel_email: registration.responsavel_email,
        avatar_url: registration.avatar_url,
        team_member_id: teamMember?.id ?? null,
        hierarchy_level: teamMember?.hierarchy_level ?? null,
        permission_role: teamMember?.permission_role ?? "membro",
        reports_to: teamMember?.reports_to ?? null,
        area: teamMember?.area ?? null,
      };
    })
    .sort((a, b) => a.responsavel_nome.localeCompare(b.responsavel_nome, "pt-BR"));
}

export default async function EquipePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/entrar");
  }

  const [{ data: registration }, role] = await Promise.all([
    supabase
      .from("startup_registrations")
      .select("responsavel_nome, responsavel_email, avatar_url")
      .eq("user_id", authUser.id)
      .single(),
    getPlatformRole(supabase, authUser.id),
  ]);

  if (!registration || !isPlatformAdmin(role)) {
    redirect("/area-do-associado");
  }

  const user = {
    name: registration.responsavel_nome,
    email: registration.responsavel_email ?? authUser.email ?? "",
    avatar: registration.avatar_url ?? "",
    role,
  };

  const roster = await getRoster();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <span>Configurações</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Equipe</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-col gap-1">
            <h1 className="font-sans text-2xl font-medium text-foreground">Equipe</h1>
            <p className="text-sm text-muted-foreground">
              Organize o time interno da Inova Cumaú: área de atuação, organograma e
              permissões de cada administrador.
            </p>
          </div>
          {roster.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar a equipe. Verifique se o serviço está configurado
              corretamente.
            </p>
          ) : (
            <EquipeTabs roster={roster} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
