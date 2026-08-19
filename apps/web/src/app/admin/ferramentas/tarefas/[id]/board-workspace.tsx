"use client";

import { useEffect, useState } from "react";

import {
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconLayoutKanban,
  IconPlus,
  IconTable,
  IconTimeline,
  IconUserPlus,
  IconWorld,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";

import { formatBoardCode } from "@/lib/task-code";
import type { BoardAccessLevel } from "@/lib/task-board-access";
import {
  grantBoardPermission,
  revokeBoardPermission,
  updateBoardLinkAccess,
} from "./actions";
import { EditarRaiaDialog, ExcluirRaiaDialog, NovaRaiaDialog } from "./column-dialogs";
import { KanbanView } from "./kanban-view";
import { TableView } from "./table-view";
import { TaskDialog } from "./task-dialog";
import { TimelineView } from "./timeline-view";
import type {
  BoardColumn,
  BoardData,
  BoardMember,
  BoardOwner,
  BoardPermission,
  BoardTask,
  ShareableUser,
} from "./types";

type TarefaDialogState =
  | { mode: "create"; columnId: string }
  | { mode: "edit"; task: BoardTask }
  | null;

type RaiaDialogState =
  | { mode: "nova" }
  | { mode: "editar"; column: BoardColumn }
  | { mode: "excluir"; column: BoardColumn }
  | null;

const SHARE_PERMISSION_OPTIONS = [
  { value: "ver", label: "Pode visualizar", description: "Pode ver o conteúdo, sem fazer alterações." },
  { value: "editar", label: "Pode editar", description: "Pode alterar o conteúdo do quadro." },
  { value: "compartilhar", label: "Acesso completo", description: "Pode editar e gerenciar quem tem acesso." },
] as const;

const SHARE_PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  SHARE_PERMISSION_OPTIONS.map((o) => [o.value, o.label]),
);

const LINK_ACCESS_SCOPE_OPTIONS = [
  { value: "restrito", label: "Somente pessoas convidadas", description: "Apenas quem foi convidado pode acessar." },
  { value: "equipe", label: "Todos no time", description: "Qualquer pessoa da equipe com acesso ao admin pode abrir o link." },
] as const;

const LINK_ACCESS_PERMISSION_OPTIONS = [
  { value: "ver", label: "Pode visualizar", description: "Pode ver o conteúdo, sem fazer alterações." },
  { value: "editar", label: "Pode editar", description: "Pode alterar o conteúdo do quadro." },
] as const;

export function ShareBoardDialog({
  boardId,
  owner,
  permissions,
  shareableUsers,
  currentUserId,
  linkAccessScope,
  linkAccessPermission,
  open,
  onOpenChange,
}: {
  boardId: string;
  owner: BoardOwner | null;
  permissions: BoardPermission[];
  shareableUsers: ShareableUser[];
  currentUserId: string;
  linkAccessScope: string;
  linkAccessPermission: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [emailInput, setEmailInput] = useState("");
  const [sharing, setSharing] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [scope, setScope] = useState(linkAccessScope);
  const [permission, setPermission] = useState(linkAccessPermission);
  const [linkPending, setLinkPending] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/admin/ferramentas/tarefas/${boardId}`);
  }, [boardId]);

  async function handleShare() {
    const emails = emailInput
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (emails.length === 0) return;

    const matched = shareableUsers.filter((user) => emails.includes(user.email.toLowerCase()));
    if (matched.length === 0) {
      toast.add({ type: "error", description: "Nenhum usuário encontrado para os e-mails informados." });
      return;
    }

    setSharing(true);
    try {
      for (const user of matched) {
        const formData = new FormData();
        formData.set("board_id", boardId);
        formData.set("user_id", user.user_id);
        formData.set("permission", "ver");
        const result = await grantBoardPermission(null, formData);
        if (result.status === "error") {
          toast.add({ type: "error", description: result.message });
        }
      }
      toast.add({ type: "success", description: "Convite enviado." });
      setEmailInput("");
    } finally {
      setSharing(false);
    }
  }

  async function handlePermissionChange(userId: string, permission: string) {
    setPendingUserId(userId);
    try {
      const formData = new FormData();
      formData.set("board_id", boardId);
      formData.set("user_id", userId);
      formData.set("permission", permission);
      const result = await grantBoardPermission(null, formData);
      if (result.status === "error") {
        toast.add({ type: "error", description: result.message });
      }
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleRevoke(permissionId: string, userId: string) {
    setPendingUserId(userId);
    try {
      const formData = new FormData();
      formData.set("board_id", boardId);
      formData.set("permission_id", permissionId);
      const result = await revokeBoardPermission(null, formData);
      if (result.status === "error") {
        toast.add({ type: "error", description: result.message });
      } else {
        toast.add({ type: "success", description: "Acesso removido." });
      }
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleLinkAccessChange(field: "scope" | "permission", value: string) {
    const nextScope = field === "scope" ? value : scope;
    const nextPermission = field === "permission" ? value : permission;
    setScope(nextScope);
    setPermission(nextPermission);
    setLinkPending(true);
    try {
      const formData = new FormData();
      formData.set("board_id", boardId);
      formData.set("scope", nextScope);
      formData.set("permission", nextPermission);
      const result = await updateBoardLinkAccess(null, formData);
      if (result.status === "error") {
        toast.add({ type: "error", description: result.message });
      }
    } finally {
      setLinkPending(false);
    }
  }

  function handleCopyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">Compartilhar quadro</DialogTitle>
          <DialogDescription>Convide pessoas para visualizar ou editar este quadro.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              id="share-emails"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="Email ou time, separados por vírgulas"
              aria-label="Email ou time, separados por vírgulas"
              className="flex-1"
            />
            <Button type="button" onClick={handleShare} disabled={!emailInput.trim() || sharing}>
              Compartilhar
            </Button>
          </div>

          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto border-t border-border pt-4">
            {owner && (
              <div className="flex items-center gap-3 py-2">
                <Avatar size="sm">
                  {owner.avatar_url && <AvatarImage src={owner.avatar_url} alt="" />}
                  <AvatarFallback>{owner.nome.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {owner.nome}
                    {owner.user_id === currentUserId && " (Você)"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{owner.email}</span>
                </div>
                <span className="text-sm text-muted-foreground">Proprietário</span>
              </div>
            )}

            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center gap-3 py-2">
                <Avatar size="sm">
                  {permission.avatar_url && <AvatarImage src={permission.avatar_url} alt="" />}
                  <AvatarFallback>{permission.nome.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {permission.nome}
                    {permission.user_id === currentUserId && " (Você)"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{permission.email}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                        disabled={pendingUserId === permission.user_id}
                      >
                        {SHARE_PERMISSION_LABELS[permission.permission] ?? permission.permission}
                        <IconChevronDown className="size-3.5" />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-64">
                    {SHARE_PERMISSION_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        className="flex flex-col items-start gap-0.5 whitespace-normal"
                        onClick={() => handlePermissionChange(permission.user_id, option.value)}
                      >
                        <span className="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
                          {option.label}
                          {permission.permission === option.value && <IconCheck className="size-4 shrink-0" />}
                        </span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleRevoke(permission.id, permission.user_id)}
                    >
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="text-xs font-medium text-muted-foreground">Acesso geral</span>

            <div className="flex items-center gap-3 py-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconWorld className="size-3.5" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                      disabled={linkPending}
                    >
                      {LINK_ACCESS_SCOPE_OPTIONS.find((option) => option.value === scope)?.label ?? scope}
                      <IconChevronDown className="size-3.5" />
                    </button>
                  }
                />
                <DropdownMenuContent align="start" className="w-72">
                  {LINK_ACCESS_SCOPE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      className="flex flex-col items-start gap-0.5 whitespace-normal"
                      onClick={() => handleLinkAccessChange("scope", option.value)}
                    >
                      <span className="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
                        {option.label}
                        {scope === option.value && <IconCheck className="size-4 shrink-0" />}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex-1" />

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                      disabled={linkPending || scope === "restrito"}
                    >
                      {LINK_ACCESS_PERMISSION_OPTIONS.find((option) => option.value === permission)?.label ?? permission}
                      <IconChevronDown className="size-3.5" />
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-64">
                  {LINK_ACCESS_PERMISSION_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      className="flex flex-col items-start gap-0.5 whitespace-normal"
                      onClick={() => handleLinkAccessChange("permission", option.value)}
                    >
                      <span className="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
                        {option.label}
                        {permission === option.value && <IconCheck className="size-4 shrink-0" />}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <InputGroup>
              <InputGroupInput readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" onClick={handleCopyLink} aria-label="Copiar link">
                  {copied ? <IconCheck className="size-3.5" /> : <IconCopy className="size-3.5" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <button
            type="button"
            className="text-left text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Saiba mais sobre compartilhamento
          </button>
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Concluído</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BoardWorkspace({
  board,
  columns,
  tasks,
  members,
  accessLevel,
  permissions,
  shareableUsers,
  owner,
  currentUserId,
}: {
  board: BoardData;
  columns: BoardColumn[];
  tasks: BoardTask[];
  members: BoardMember[];
  accessLevel: BoardAccessLevel;
  permissions: BoardPermission[];
  shareableUsers: ShareableUser[];
  owner: BoardOwner | null;
  currentUserId: string;
}) {
  const podeEditar = accessLevel === "total" || accessLevel === "editar";
  const podeGerenciar = accessLevel === "total";
  const [shareOpen, setShareOpen] = useState(false);

  // Estado local para o arrasto responder na hora; as props voltam a mandar
  // sempre que uma Server Action revalida a rota.
  const [colunas, setColunas] = useState(columns);
  const [tarefas, setTarefas] = useState(tasks);
  const [view, setView] = useState("quadro");
  const [tarefaDialog, setTarefaDialog] = useState<TarefaDialogState>(null);
  const [raiaDialog, setRaiaDialog] = useState<RaiaDialogState>(null);

  // Quando uma Server Action revalida a rota, as props chegam novas e o estado
  // local volta a espelhá-las ainda na mesma renderização.
  const [ultimasProps, setUltimasProps] = useState({ columns, tasks });
  if (ultimasProps.columns !== columns || ultimasProps.tasks !== tasks) {
    setUltimasProps({ columns, tasks });
    setColunas(columns);
    setTarefas(tasks);
  }

  const primeiraColuna = colunas[0]?.id ?? "";

  function abrirNovaTarefa(columnId?: string) {
    const destino = columnId ?? primeiraColuna;
    if (!destino) return;
    setTarefaDialog({ mode: "create", columnId: destino });
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold font-sans">{board.title}</h1>
            <span className="font-mono text-xs text-muted-foreground">
              {formatBoardCode(board.codigo_numero)}
            </span>
          </div>
          {board.description && (
            <p className="text-sm text-muted-foreground">{board.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {podeGerenciar && (
            <>
              <Button type="button" variant="outline" onClick={() => setShareOpen(true)}>
                <IconUserPlus />
                Compartilhar
              </Button>
              <ShareBoardDialog
                boardId={board.id}
                owner={owner}
                permissions={permissions}
                shareableUsers={shareableUsers}
                currentUserId={currentUserId}
                linkAccessScope={board.link_access_scope}
                linkAccessPermission={board.link_access_permission}
                open={shareOpen}
                onOpenChange={setShareOpen}
              />
            </>
          )}
          {podeEditar && (
            <Button type="button" onClick={() => abrirNovaTarefa()} disabled={!primeiraColuna}>
              <IconPlus />
              Nova tarefa
            </Button>
          )}
        </div>
      </div>

      <Tabs value={view} onValueChange={(valor) => setView(valor as string)}>
        <TabsList variant="line">
          <TabsTrigger value="quadro">
            <IconLayoutKanban />
            Quadro de tarefas
          </TabsTrigger>
          <TabsTrigger value="linha">
            <IconTimeline />
            Linha do tempo
          </TabsTrigger>
          <TabsTrigger value="tabela">
            <IconTable />
            Tabela
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quadro" className="pt-2">
          <KanbanView
            boardId={board.id}
            columns={colunas}
            tasks={tarefas}
            members={members}
            podeEditar={podeEditar}
            onTasksChange={setTarefas}
            onColumnsChange={setColunas}
            onNovaTarefa={(columnId) => abrirNovaTarefa(columnId)}
            onAbrirTarefa={(task) => setTarefaDialog({ mode: "edit", task })}
            onNovaRaia={() => setRaiaDialog({ mode: "nova" })}
            onEditarRaia={(column) => setRaiaDialog({ mode: "editar", column })}
            onExcluirRaia={(column) => setRaiaDialog({ mode: "excluir", column })}
          />
        </TabsContent>

        <TabsContent value="linha" className="pt-2">
          <TimelineView
            columns={colunas}
            tasks={tarefas}
            podeEditar={podeEditar}
            onTasksChange={setTarefas}
            onAbrirTarefa={(task) => setTarefaDialog({ mode: "edit", task })}
            onNovaTarefa={() => abrirNovaTarefa()}
          />
        </TabsContent>

        <TabsContent value="tabela" className="pt-2">
          <TableView
            columns={colunas}
            tasks={tarefas}
            members={members}
            podeEditar={podeEditar}
            onAbrirTarefa={(task) => setTarefaDialog({ mode: "edit", task })}
            onNovaTarefa={() => abrirNovaTarefa()}
          />
        </TabsContent>
      </Tabs>

      {tarefaDialog && (
        <TaskDialog
          key={tarefaDialog.mode === "edit" ? tarefaDialog.task.id : `nova-${tarefaDialog.columnId}`}
          board={board}
          columns={colunas}
          members={members}
          task={tarefaDialog.mode === "edit" ? tarefaDialog.task : null}
          defaultColumnId={
            tarefaDialog.mode === "edit" ? tarefaDialog.task.column_id : tarefaDialog.columnId
          }
          open
          onOpenChange={(aberto) => {
            if (!aberto) setTarefaDialog(null);
          }}
          podeEditar={podeEditar}
        />
      )}

      {raiaDialog?.mode === "nova" && (
        <NovaRaiaDialog
          boardId={board.id}
          open
          onOpenChange={(aberto) => {
            if (!aberto) setRaiaDialog(null);
          }}
        />
      )}

      {raiaDialog?.mode === "editar" && (
        <EditarRaiaDialog
          key={raiaDialog.column.id}
          boardId={board.id}
          column={raiaDialog.column}
          open
          onOpenChange={(aberto) => {
            if (!aberto) setRaiaDialog(null);
          }}
        />
      )}

      {raiaDialog?.mode === "excluir" && (
        <ExcluirRaiaDialog
          key={raiaDialog.column.id}
          boardId={board.id}
          column={raiaDialog.column}
          totalTarefas={
            tarefas.filter((tarefa) => tarefa.column_id === raiaDialog.column.id).length
          }
          open
          onOpenChange={(aberto) => {
            if (!aberto) setRaiaDialog(null);
          }}
        />
      )}
    </div>
  );
}
