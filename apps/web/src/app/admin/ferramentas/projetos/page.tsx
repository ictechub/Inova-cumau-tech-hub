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
import {
  getPlatformRole,
  isPlatformAdmin,
  requirePlatformRole,
  type PlatformRole,
} from "@/lib/user-role";
import { getCascadeOwnerIds } from "@/lib/project-access";
import { ProjetosTab, type AdminProject } from "./projetos-tab";

export const metadata: Metadata = {
  title: "Editor de publicação | Ferramentas | Admin | Inova Cumaú",
};

// Admin/owner veem todos os projetos. Consultor/associado com acesso a
// Ferramentas veem: os que possuem, os do organograma em cascata (chefe
// direto + pares, via getCascadeOwnerIds) e os que têm permissão explícita
// em project_permissions. Tudo resolvido com admin client (bypass de RLS),
// mesmo padrão de getUsuarios em admin/usuarios/page.tsx.
async function getProjetos(userId: string, role: PlatformRole): Promise<AdminProject[]> {
  const db = createAdminClient();
  if (!db) return [];

  let query = db
    .from("projects")
    .select("id, title, tags, status, updated_at, owner_id")
    .order("updated_at", { ascending: false });

  if (!isPlatformAdmin(role)) {
    const [cascadeOwnerIds, { data: permissionRows }] = await Promise.all([
      getCascadeOwnerIds(db, userId),
      db.from("project_permissions").select("project_id").eq("user_id", userId),
    ]);

    const ownerIds = [userId, ...cascadeOwnerIds];
    const projectIds = (permissionRows ?? []).map((row) => row.project_id);

    const filtros = [`owner_id.in.(${ownerIds.join(",")})`];
    if (projectIds.length > 0) {
      filtros.push(`id.in.(${projectIds.join(",")})`);
    }
    query = query.or(filtros.join(","));
  }

  const { data: projects } = await query;
  if (!projects || projects.length === 0) return [];

  const projectIds = projects.map((project) => project.id);
  const { data: permissionRows } = await db
    .from("project_permissions")
    .select("project_id, user_id")
    .in("project_id", projectIds);

  const sharedUserIdsByProject = new Map<string, string[]>();
  for (const row of permissionRows ?? []) {
    const lista = sharedUserIdsByProject.get(row.project_id) ?? [];
    lista.push(row.user_id);
    sharedUserIdsByProject.set(row.project_id, lista);
  }

  const ownerIds = projects.map((project) => project.owner_id);
  const sharedIds = (permissionRows ?? []).map((row) => row.user_id);
  const allUserIds = [...new Set([...ownerIds, ...sharedIds])];

  const { data: usuarios } = await db
    .from("startup_registrations")
    .select("user_id, responsavel_nome, avatar_url")
    .in("user_id", allUserIds);

  const usuarioById = new Map((usuarios ?? []).map((usuario) => [usuario.user_id, usuario]));

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    tags: project.tags,
    status: project.status,
    updated_at: project.updated_at,
    owner_id: project.owner_id,
    owner_nome: usuarioById.get(project.owner_id)?.responsavel_nome ?? null,
    owner_avatar_url: usuarioById.get(project.owner_id)?.avatar_url ?? null,
    compartilhado_com: (sharedUserIdsByProject.get(project.id) ?? []).map((userId) => ({
      user_id: userId,
      nome: usuarioById.get(userId)?.responsavel_nome ?? null,
      avatar_url: usuarioById.get(userId)?.avatar_url ?? null,
    })),
  }));
}

export default async function ProjetosPage() {
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

  if (!registration || (!isPlatformAdmin(role) && role !== "consultor")) {
    redirect("/area-do-associado");
  }

  const admin = await requirePlatformRole(["owner", "administrador", "consultor"]);
  if (!admin) {
    redirect("/area-do-associado");
  }

  const user = {
    name: registration.responsavel_nome,
    email: registration.responsavel_email ?? authUser.email ?? "",
    avatar: registration.avatar_url ?? "",
    role,
  };

  const projetos = await getProjetos(authUser.id, role);

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
                  <span>Ferramentas</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Editor de publicação</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-col gap-1">
            <h1 className="font-sans text-2xl font-medium text-foreground">Editor de publicação</h1>
            <p className="text-sm text-muted-foreground">
              Artigos e conteúdos publicados na coluna pública de notícias.
              Crie, edite e gerencie permissões de cada projeto.
            </p>
          </div>
          <ProjetosTab projetos={projetos} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
