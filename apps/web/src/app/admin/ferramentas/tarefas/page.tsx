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
import { NovoQuadroDialog, QuadrosTab, type AdminBoard } from "./quadros-tab";

export const metadata: Metadata = {
  title: "Quadro de tarefas | Ferramentas | Admin | Inova Cumaú",
};

// Mesma regra de visibilidade do Editor de publicação: admin/owner veem tudo,
// os demais veem os quadros que possuem, os do organograma em cascata (chefe
// direto + pares) e os com permissão explícita em task_board_permissions.
async function getQuadros(userId: string, role: PlatformRole): Promise<AdminBoard[]> {
  const db = createAdminClient();
  if (!db) return [];

  let query = db
    .from("task_boards")
    .select("id, codigo_numero, title, description, updated_at, owner_id")
    .order("updated_at", { ascending: false });

  if (!isPlatformAdmin(role)) {
    const [cascadeOwnerIds, { data: permissionRows }] = await Promise.all([
      getCascadeOwnerIds(db, userId),
      db.from("task_board_permissions").select("board_id").eq("user_id", userId),
    ]);

    const ownerIds = [userId, ...cascadeOwnerIds];
    const boardIds = (permissionRows ?? []).map((row) => row.board_id);

    const filtros = [`owner_id.in.(${ownerIds.join(",")})`];
    if (boardIds.length > 0) {
      filtros.push(`id.in.(${boardIds.join(",")})`);
    }
    query = query.or(filtros.join(","));
  }

  const { data: boards } = await query;
  if (!boards || boards.length === 0) return [];

  const boardIds = boards.map((board) => board.id);

  const [{ data: tarefas }, { data: permissionRows }] = await Promise.all([
    db.from("tasks").select("board_id").in("board_id", boardIds),
    db.from("task_board_permissions").select("board_id, user_id").in("board_id", boardIds),
  ]);

  const totalPorQuadro = new Map<string, number>();
  for (const tarefa of tarefas ?? []) {
    totalPorQuadro.set(tarefa.board_id, (totalPorQuadro.get(tarefa.board_id) ?? 0) + 1);
  }

  const sharedUserIdsByBoard = new Map<string, string[]>();
  for (const row of permissionRows ?? []) {
    const lista = sharedUserIdsByBoard.get(row.board_id) ?? [];
    lista.push(row.user_id);
    sharedUserIdsByBoard.set(row.board_id, lista);
  }

  const ownerIds = boards.map((board) => board.owner_id);
  const sharedIds = (permissionRows ?? []).map((row) => row.user_id);
  const allUserIds = [...new Set([...ownerIds, ...sharedIds])];

  const { data: usuarios } = await db
    .from("startup_registrations")
    .select("user_id, responsavel_nome, avatar_url")
    .in("user_id", allUserIds);

  const usuarioById = new Map((usuarios ?? []).map((usuario) => [usuario.user_id, usuario]));

  return boards.map((board) => ({
    id: board.id,
    codigo_numero: board.codigo_numero,
    title: board.title,
    description: board.description,
    updated_at: board.updated_at,
    owner_id: board.owner_id,
    owner_nome: usuarioById.get(board.owner_id)?.responsavel_nome ?? null,
    owner_avatar_url: usuarioById.get(board.owner_id)?.avatar_url ?? null,
    total_tarefas: totalPorQuadro.get(board.id) ?? 0,
    compartilhado_com: (sharedUserIdsByBoard.get(board.id) ?? []).map((userId) => ({
      user_id: userId,
      nome: usuarioById.get(userId)?.responsavel_nome ?? null,
      avatar_url: usuarioById.get(userId)?.avatar_url ?? null,
    })),
  }));
}

export default async function TarefasPage() {
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

  const quadros = await getQuadros(authUser.id, role);

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
                  <BreadcrumbPage>Quadro de tarefas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="font-sans text-2xl font-medium text-foreground">Quadro de tarefas</h1>
              <p className="text-sm text-muted-foreground">
                Organize o trabalho da equipe em quadros Kanban, com visões de
                Quadro, Linha do tempo e Tabela.
              </p>
            </div>
            <NovoQuadroDialog />
          </div>
          <QuadrosTab quadros={quadros} currentUserId={authUser.id} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
