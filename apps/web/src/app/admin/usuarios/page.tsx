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
import { getPlatformRole, isPlatformAdmin, requirePlatformAdmin } from "@/lib/user-role";
import { InviteConsultorButton } from "./tabs/invite-consultor-dialog";
import { UsuariosTabs, type PlatformUser } from "./usuarios-tabs";

export const metadata: Metadata = {
  title: "Usuários | Admin | Inova Cumaú",
};

// Só existe uma policy "owner-only" de RLS em startup_registrations e
// user_roles, então listar todas as contas do ecossistema (não só a do
// usuário logado) exige o client de service role. Retorna [] se a service
// role key não estiver configurada, degradando a página para um estado vazio
// em vez de quebrar.
async function getUsuarios(): Promise<PlatformUser[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const [{ data: registrations }, { data: roleRows }] = await Promise.all([
    admin
      .from("startup_registrations")
      .select(
        "user_id, responsavel_nome, responsavel_cargo, responsavel_email, avatar_url, matricula_numero",
      ),
    admin.from("user_roles").select("user_id, role"),
  ]);

  const roleByUserId = new Map((roleRows ?? []).map((row) => [row.user_id, row.role]));

  return (registrations ?? [])
    .map((registration) => ({
      user_id: registration.user_id,
      responsavel_nome: registration.responsavel_nome,
      responsavel_cargo: registration.responsavel_cargo,
      responsavel_email: registration.responsavel_email,
      avatar_url: registration.avatar_url,
      matricula_numero: registration.matricula_numero,
      role: (roleByUserId.get(registration.user_id) ?? "associado") as PlatformUser["role"],
    }))
    .sort((a, b) => a.responsavel_nome.localeCompare(b.responsavel_nome, "pt-BR"));
}

export default async function UsuariosPage() {
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

  const admin = await requirePlatformAdmin();
  if (!admin) {
    redirect("/area-do-associado");
  }

  const user = {
    name: registration.responsavel_nome,
    email: registration.responsavel_email ?? authUser.email ?? "",
    avatar: registration.avatar_url ?? "",
    role,
  };

  const usuarios = await getUsuarios();

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
                  <BreadcrumbPage>Usuários</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="font-sans text-2xl font-medium text-foreground">Usuários</h1>
              <p className="text-sm text-muted-foreground">
                Todas as contas cadastradas no ecossistema. Promova associados a
                administrador ou remova o acesso administrativo de uma conta.
              </p>
            </div>
            <InviteConsultorButton />
          </div>
          {usuarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os usuários. Verifique se o serviço está
              configurado corretamente.
            </p>
          ) : (
            <UsuariosTabs usuarios={usuarios} currentUserId={authUser.id} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
