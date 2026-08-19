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
import { getBoardAccessLevel } from "@/lib/task-board-access";
import { BoardWorkspace } from "./board-workspace";
import type { BoardColumn, BoardData, BoardMember, BoardOwner, BoardPermission, BoardTask, ShareableUser } from "./types";

export const metadata: Metadata = {
  title: "Quadro de tarefas | Ferramentas | Admin | Inova Cumaú",
};

export default async function QuadroPage({
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
  if (!db) redirect("/admin/ferramentas/tarefas");

  const { data: board } = await db
    .from("task_boards")
    .select("id, codigo_numero, title, description, owner_id, link_access_scope, link_access_permission")
    .eq("id", id)
    .maybeSingle();

  if (!board) notFound();

  const accessLevel = await getBoardAccessLevel(db, authUser.id, role, board);
  if (accessLevel === "nenhum") redirect("/admin/ferramentas/tarefas");

  let permissions: BoardPermission[] = [];
  let shareableUsers: ShareableUser[] = [];
  let owner: BoardOwner | null = null;

  const [{ data: columnRows }, { data: taskRows }, { data: registrations }] = await Promise.all([
    db
      .from("task_board_columns")
      .select("id, title, color, position")
      .eq("board_id", id)
      .order("position", { ascending: true }),
    db
      .from("tasks")
      .select(
        "id, codigo_numero, column_id, title, description, priority, assignee_ids, tags, start_date, due_date, position, created_by, updated_at",
      )
      .eq("board_id", id)
      .order("position", { ascending: true }),
    db
      .from("startup_registrations")
      .select("user_id, responsavel_nome, responsavel_email, avatar_url"),
  ]);

  if (accessLevel === "total") {
    const { data: permissionRows } = await db
      .from("task_board_permissions")
      .select("id, user_id, permission")
      .eq("board_id", id);

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
      .filter((r) => r.user_id !== board.owner_id && !permittedUserIds.has(r.user_id))
      .map((r) => ({
        user_id: r.user_id,
        nome: r.responsavel_nome,
        email: r.responsavel_email ?? "",
        avatar_url: r.avatar_url ?? null,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const ownerRegistration = registrationByUserId.get(board.owner_id);
    owner = {
      user_id: board.owner_id,
      nome: ownerRegistration?.responsavel_nome ?? "Usuário desconhecido",
      email: ownerRegistration?.responsavel_email ?? "",
      avatar_url: ownerRegistration?.avatar_url ?? null,
    };
  }

  const boardData: BoardData = {
    id: board.id,
    codigo_numero: board.codigo_numero,
    title: board.title,
    description: board.description,
    owner_id: board.owner_id,
    link_access_scope: board.link_access_scope,
    link_access_permission: board.link_access_permission,
  };

  const columns: BoardColumn[] = (columnRows ?? []).map((column) => ({
    id: column.id,
    title: column.title,
    color: column.color,
    position: column.position,
  }));

  const tasks: BoardTask[] = (taskRows ?? []).map((task) => ({
    id: task.id,
    codigo_numero: task.codigo_numero,
    column_id: task.column_id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    assignee_ids: task.assignee_ids,
    tags: task.tags,
    start_date: task.start_date,
    due_date: task.due_date,
    position: task.position,
    created_by: task.created_by,
    updated_at: task.updated_at,
  }));

  const members: BoardMember[] = (registrations ?? [])
    .map((row) => ({
      user_id: row.user_id,
      nome: row.responsavel_nome,
      email: row.responsavel_email ?? "",
      avatar_url: row.avatar_url ?? null,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

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
                  <BreadcrumbLink href="/admin/ferramentas/tarefas">
                    Quadro de tarefas
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{board.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-0">
          <BoardWorkspace
            board={boardData}
            columns={columns}
            tasks={tasks}
            members={members}
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
