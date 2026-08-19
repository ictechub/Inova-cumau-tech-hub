"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  IconDotsVertical,
  IconLayoutKanban,
  IconPencil,
  IconPlus,
  IconSearch,
  IconShare2,
  IconTrash,
} from "@tabler/icons-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

import { formatBoardCode } from "@/lib/task-code";
import { createBoard, deleteBoard, updateBoard, type ActionResult } from "./actions";
import { getBoardShareData, type BoardShareData } from "./[id]/actions";
import { ShareBoardDialog } from "./[id]/board-workspace";

export type AdminBoard = {
  id: string;
  codigo_numero: number;
  title: string;
  description: string;
  updated_at: string;
  owner_id: string;
  owner_nome: string | null;
  owner_avatar_url: string | null;
  total_tarefas: number;
  compartilhado_com: { user_id: string; nome: string | null; avatar_url: string | null }[];
};

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

export function NovoQuadroDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createBoard,
    null,
  );
  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      setOpen(false);
      router.push(`/admin/ferramentas/tarefas/${state.board_id}`);
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, router]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setTitle("");
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <IconPlus />
        Novo quadro
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="font-sans">Novo quadro</DialogTitle>
            <DialogDescription>
              O quadro já nasce com as raias Backlog, Andamento e Concluído. Você
              pode renomear, recolorir e criar novas raias depois.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="novo-quadro-title">Título</Label>
            <Input
              id="novo-quadro-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título do quadro"
              autoFocus
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="novo-quadro-description">Descrição</Label>
            <Textarea
              id="novo-quadro-description"
              name="description"
              placeholder="Para que serve este quadro (opcional)"
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description[0]}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={isPending || !title.trim()}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RenomearQuadroDialog({
  quadro,
  open,
  onOpenChange,
}: {
  quadro: AdminBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateBoard,
    null,
  );
  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Quadro atualizado." });
      onOpenChange(false);
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="font-sans">Editar quadro</DialogTitle>
            <DialogDescription>Altere o título e a descrição do quadro.</DialogDescription>
          </DialogHeader>
          <input type="hidden" name="board_id" value={quadro.id} />
          <div className="flex flex-col gap-2">
            <Label htmlFor={`quadro-title-${quadro.id}`}>Título</Label>
            <Input
              id={`quadro-title-${quadro.id}`}
              name="title"
              defaultValue={quadro.title}
              autoFocus
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`quadro-description-${quadro.id}`}>Descrição</Label>
            <Textarea
              id={`quadro-description-${quadro.id}`}
              name="description"
              defaultValue={quadro.description}
              rows={3}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ExcluirQuadroDialog({
  quadro,
  open,
  onOpenChange,
}: {
  quadro: AdminBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(deleteBoard, null);

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Quadro excluído." });
      onOpenChange(false);
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <form action={formAction} className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <IconTrash />
            </AlertDialogMedia>
            <AlertDialogTitle className="font-sans">Excluir quadro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o quadro &quot;{quadro.title}&quot;? Todas as raias e
              tarefas dele serão removidas. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input type="hidden" name="board_id" value={quadro.id} />
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" variant="destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ShareQuadroDialog({
  quadro,
  currentUserId,
  open,
  onOpenChange,
}: {
  quadro: AdminBoard;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [data, setData] = useState<BoardShareData | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getBoardShareData(quadro.id).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [open, quadro.id]);

  if (!open) return null;

  if (!data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans">Compartilhar quadro</DialogTitle>
            <DialogDescription>Carregando...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (data.status === "error") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans">Compartilhar quadro</DialogTitle>
            <DialogDescription>{data.message}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <ShareBoardDialog
      boardId={quadro.id}
      owner={data.owner}
      permissions={data.permissions}
      shareableUsers={data.shareableUsers}
      currentUserId={currentUserId}
      linkAccessScope={data.linkAccessScope}
      linkAccessPermission={data.linkAccessPermission}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

function QuadroActionsMenu({
  quadro,
  currentUserId,
}: {
  quadro: AdminBoard;
  currentUserId: string;
}) {
  const [renomearOpen, setRenomearOpen] = useState(false);
  const [excluirOpen, setExcluirOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <IconDotsVertical />
          <span className="sr-only">Ações para {quadro.title}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenomearOpen(true)}>
            <IconPencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShareOpen(true)}>
            <IconShare2 />
            Compartilhar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setExcluirOpen(true)}>
            <IconTrash />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RenomearQuadroDialog quadro={quadro} open={renomearOpen} onOpenChange={setRenomearOpen} />
      <ExcluirQuadroDialog quadro={quadro} open={excluirOpen} onOpenChange={setExcluirOpen} />
      <ShareQuadroDialog
        quadro={quadro}
        currentUserId={currentUserId}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );
}

export function QuadrosTab({
  quadros,
  currentUserId,
}: {
  quadros: AdminBoard[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const quadrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return quadros;
    return quadros.filter(
      (quadro) =>
        quadro.title.toLowerCase().includes(termo) ||
        formatBoardCode(quadro.codigo_numero).toLowerCase().includes(termo),
    );
  }, [quadros, busca]);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-border">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-64">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por título ou ID"
              className="pl-8"
            />
          </div>
        </div>
        <div>
          {quadrosFiltrados.length === 0 ? (
            <Empty className="border-none py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconLayoutKanban />
                </EmptyMedia>
                <EmptyTitle className="font-sans">
                  {quadros.length === 0 ? "Nenhum quadro ainda" : "Nenhum quadro encontrado"}
                </EmptyTitle>
                <EmptyDescription>
                  {quadros.length === 0
                    ? "Você ainda não criou nenhum quadro de tarefas. Comece criando o primeiro."
                    : "Ajuste a busca para encontrar o que procura."}
                </EmptyDescription>
              </EmptyHeader>
              {quadros.length === 0 && (
                <EmptyContent>
                  <NovoQuadroDialog />
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-28">ID</TableHead>
                  <TableHead>Quadro</TableHead>
                  <TableHead className="w-24">Tarefas</TableHead>
                  <TableHead className="w-20">Responsável</TableHead>
                  <TableHead className="w-24">Compartilhado</TableHead>
                  <TableHead className="w-28">Atualizado em</TableHead>
                  <TableHead className="w-16 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quadrosFiltrados.map((quadro) => (
                  <TableRow
                    key={quadro.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/ferramentas/tarefas/${quadro.id}`)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatBoardCode(quadro.codigo_numero)}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <span className="font-medium text-foreground">{quadro.title}</span>
                      {quadro.description && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {quadro.description}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{quadro.total_tarefas}</Badge>
                    </TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage
                          src={quadro.owner_avatar_url ?? ""}
                          alt={quadro.owner_nome ?? "Responsável"}
                        />
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(quadro.owner_nome)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      {quadro.compartilhado_com.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Não compartilhado</span>
                      ) : quadro.compartilhado_com.length === 1 ? (
                        <Avatar>
                          <AvatarImage
                            src={quadro.compartilhado_com[0]!.avatar_url ?? ""}
                            alt={quadro.compartilhado_com[0]!.nome ?? "Usuário"}
                          />
                          <AvatarFallback className="text-xs font-medium">
                            {getInitials(quadro.compartilhado_com[0]!.nome)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <AvatarGroup>
                          {quadro.compartilhado_com.slice(0, 3).map((usuario) => (
                            <Avatar key={usuario.user_id}>
                              <AvatarImage
                                src={usuario.avatar_url ?? ""}
                                alt={usuario.nome ?? "Usuário"}
                              />
                              <AvatarFallback className="text-xs font-medium">
                                {getInitials(usuario.nome)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {quadro.compartilhado_com.length > 3 && (
                            <AvatarGroupCount className="text-xs">
                              +{quadro.compartilhado_com.length - 3}
                            </AvatarGroupCount>
                          )}
                        </AvatarGroup>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatData(quadro.updated_at)}
                    </TableCell>
                    <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                      <QuadroActionsMenu quadro={quadro} currentUserId={currentUserId} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
