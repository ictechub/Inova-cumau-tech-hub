import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

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
import { getPlatformRole, isPlatformAdmin, requirePlatformRole } from "@/lib/user-role";
import { getProjectAccessLevel } from "@/lib/project-access";
import { ProjectEditor, type ProjectData, type ProjectOwner, type ProjectPermission, type ShareableUser } from "./project-editor";

export const metadata: Metadata = {
  title: "Editor de projeto | Ferramentas | Admin | Inova Cumaú",
};

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/entrar");

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
  if (!admin) redirect("/area-do-associado");

  const db = createAdminClient();
  if (!db) redirect("/admin/ferramentas/projetos");

  const { data: project } = await db
    .from("projects")
    .select(
      "id, title, slug, content, cover_image_url, tags, section, status, owner_id, published_at, updated_at, link_access_scope, link_access_permission, show_author",
    )
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const accessLevel = await getProjectAccessLevel(db, authUser.id, role, project);
  if (accessLevel === "nenhum") redirect("/admin/ferramentas/projetos");

  let permissions: ProjectPermission[] = [];
  let shareableUsers: ShareableUser[] = [];
  let owner: ProjectOwner | null = null;

  if (accessLevel === "total") {
    const [{ data: permissionRows }, { data: registrations }] = await Promise.all([
      db.from("project_permissions").select("id, user_id, permission").eq("project_id", id),
      db.from("startup_registrations").select("user_id, responsavel_nome, responsavel_email, avatar_url"),
    ]);

    const registrationByUserId = new Map((registrations ?? []).map((r) => [r.user_id, r]));

    permissions = (permissionRows ?? []).map((row) => {
      const registration = registrationByUserId.get(row.user_id);
      return {
        id: row.id,
        user_id: row.user_id,
        permission: row.permission as "ver" | "editar" | "compartilhar",
        nome: registration?.responsavel_nome ?? "Usuário desconhecido",
        email: registration?.responsavel_email ?? "",
        avatar_url: registration?.avatar_url ?? null,
      };
    });

    const permittedUserIds = new Set(permissions.map((p) => p.user_id));
    shareableUsers = (registrations ?? [])
      .filter((r) => r.user_id !== project.owner_id && !permittedUserIds.has(r.user_id))
      .map((r) => ({
        user_id: r.user_id,
        nome: r.responsavel_nome,
        email: r.responsavel_email ?? "",
        avatar_url: r.avatar_url ?? null,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const ownerRegistration = registrationByUserId.get(project.owner_id);
    owner = {
      user_id: project.owner_id,
      nome: ownerRegistration?.responsavel_nome ?? "Usuário desconhecido",
      email: ownerRegistration?.responsavel_email ?? "",
      avatar_url: ownerRegistration?.avatar_url ?? null,
    };
  }

  const user = {
    name: registration.responsavel_nome,
    email: registration.responsavel_email ?? authUser.email ?? "",
    avatar: registration.avatar_url ?? "",
    role,
  };

  const projectData: ProjectData = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    content: project.content,
    cover_image_url: project.cover_image_url,
    tags: project.tags,
    section: project.section,
    status: project.status,
    published_at: project.published_at,
    show_author: project.show_author,
    link_access_scope: project.link_access_scope,
    link_access_permission: project.link_access_permission,
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
                  <BreadcrumbLink href="/admin/ferramentas/projetos">Editor de publicação</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{project.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 pt-0 md:p-6 md:pt-0">
          <ProjectEditor
            project={projectData}
            accessLevel={accessLevel}
            permissions={permissions}
            shareableUsers={shareableUsers}
            owner={owner}
            currentUserId={authUser.id}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
