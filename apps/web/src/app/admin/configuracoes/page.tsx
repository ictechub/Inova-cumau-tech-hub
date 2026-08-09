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
import { createClient } from "@inova-cumau/supabase/server";
import { getPlatformRole, isPlatformAdmin } from "@/lib/user-role";
import { ConfiguracoesTabs } from "./configuracoes-tabs";

export const metadata: Metadata = {
  title: "Configurações | Inova Cumaú",
};

export default async function ConfiguracoesPage() {
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
      .select(
        "responsavel_nome, responsavel_email, responsavel_cargo, avatar_url, perfil_visivel_publico, startup_site, contato_instagram, contato_facebook, contato_linkedin, notify_email_novidades, notify_email_editais",
      )
      .eq("user_id", authUser.id)
      .single(),
    getPlatformRole(supabase, authUser.id),
  ]);

  if (!registration || (!isPlatformAdmin(role) && role !== "consultor")) {
    redirect("/area-do-associado");
  }

  const user = {
    name: registration.responsavel_nome,
    email: registration.responsavel_email ?? authUser.email ?? "",
    avatar: registration.avatar_url ?? "",
    role,
  };

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
                  <BreadcrumbPage>Geral</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-col gap-1">
            <h1 className="font-sans text-2xl font-medium text-foreground">Configurações</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas informações pessoais e preferências da conta. Esta área é
              privativa, visível apenas para administradores.
            </p>
          </div>
          <ConfiguracoesTabs
            initial={{
              avatar_url: registration.avatar_url,
              responsavel_nome: registration.responsavel_nome,
              responsavel_email: registration.responsavel_email,
              responsavel_cargo: registration.responsavel_cargo,
              perfil_visivel_publico: registration.perfil_visivel_publico,
              startup_site: registration.startup_site,
              contato_instagram: registration.contato_instagram,
              contato_facebook: registration.contato_facebook,
              contato_linkedin: registration.contato_linkedin,
              notify_email_novidades: registration.notify_email_novidades,
              notify_email_editais: registration.notify_email_editais,
            }}
            authEmail={authUser.email ?? ""}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
