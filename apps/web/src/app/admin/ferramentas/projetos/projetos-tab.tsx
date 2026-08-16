"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  IconDotsVertical,
  IconFilePlus,
  IconFolderCode,
  IconPencil,
  IconSearch,
  IconShare2,
  IconTrash,
} from "@tabler/icons-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

import { MultiSelectCombobox } from "@/components/registration-wizard/multi-select-combobox";
import { PROJECT_TAGS } from "@/lib/project-tags";
import { createProject, type ActionResult } from "./actions";
import { deleteProject, type ActionResult as ProjectActionResult } from "./[id]/actions";

const TAG_OPTIONS = PROJECT_TAGS.map((tag) => ({ value: tag, label: tag }));

export type AdminProject = {
  id: string;
  title: string;
  tags: string[];
  status: string;
  updated_at: string;
  owner_id: string;
  owner_nome: string | null;
  owner_avatar_url: string | null;
  compartilhado_com: { user_id: string; nome: string | null; avatar_url: string | null }[];
};

const TODAS = "todas";

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
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

function NovoProjetoDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createProject,
    null,
  );
  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      setOpen(false);
      router.push(`/admin/ferramentas/projetos/${state.project_id}`);
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, router]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setTitle("");
          setTags([]);
        }
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <IconFilePlus />
        Novo projeto
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="font-sans">Novo projeto</DialogTitle>
            <DialogDescription>
              Defina um título e tags iniciais. O restante do conteúdo é editado na página do
              projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="novo-projeto-title">Título</Label>
            <Input
              id="novo-projeto-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título do projeto"
              autoFocus
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tags</Label>
            <MultiSelectCombobox
              options={TAG_OPTIONS}
              value={tags}
              onChange={setTags}
              placeholder="Selecione as tags"
            />
          </div>
          {tags.map((tag) => (
            <input key={tag} type="hidden" name="tags" value={tag} />
          ))}
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

function DeleteProjetoDialog({
  projeto,
  open,
  onOpenChange,
}: {
  projeto: AdminProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState<ProjectActionResult | null, FormData>(
    deleteProject,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Projeto excluído." });
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
            <DialogTitle className="font-sans">Excluir projeto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o projeto &quot;{projeto.title}&quot;? Essa ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="project_id" value={projeto.id} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" variant="destructive">
              Excluir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjetoActionsMenu({ projeto }: { projeto: AdminProject }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <IconDotsVertical />
          <span className="sr-only">Ações para {projeto.title}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/admin/ferramentas/projetos/${projeto.id}`)}
          >
            <IconPencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/ferramentas/projetos/${projeto.id}#permissoes`)}
          >
            <IconShare2 />
            Compartilhar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <IconTrash />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteProjetoDialog projeto={projeto} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

export function ProjetosTab({ projetos }: { projetos: AdminProject[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtroTag, setFiltroTag] = useState<string>(TODAS);

  const projetosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return projetos.filter((projeto) => {
      const combinaBusca = !termo || projeto.title.toLowerCase().includes(termo);
      const combinaTag = filtroTag === TODAS || projeto.tags.includes(filtroTag);
      return combinaBusca && combinaTag;
    });
  }, [projetos, busca, filtroTag]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <NovoProjetoDialog />
      </div>
      <div className="rounded-lg border border-border">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-64">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por título"
              className="pl-8"
            />
          </div>
          <Select
            value={filtroTag}
            onValueChange={(value) => {
              if (value) setFiltroTag(value);
            }}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Filtrar por tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas</SelectItem>
              {PROJECT_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          {projetosFiltrados.length === 0 ? (
            <Empty className="border-none py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconFolderCode />
                </EmptyMedia>
                <EmptyTitle className="font-sans">
                  {projetos.length === 0 ? "Nenhum projeto ainda" : "Nenhum projeto encontrado"}
                </EmptyTitle>
                <EmptyDescription>
                  {projetos.length === 0
                    ? "Você ainda não criou nenhum projeto. Comece criando o primeiro."
                    : "Ajuste a busca ou o filtro de tag para encontrar o que procura."}
                </EmptyDescription>
              </EmptyHeader>
              {projetos.length === 0 && (
                <EmptyContent>
                  <NovoProjetoDialog />
                </EmptyContent>
              )}
            </Empty>
          ) : (
          <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead className="w-40">Tags</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-20">Responsável</TableHead>
              <TableHead className="w-24">Compartilhado</TableHead>
              <TableHead className="w-28">Atualizado em</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projetosFiltrados.map((projeto) => (
                <TableRow
                  key={projeto.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/ferramentas/projetos/${projeto.id}`)}
                >
                  <TableCell className="whitespace-normal font-medium text-foreground">
                    {projeto.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-nowrap gap-1 overflow-hidden">
                      {projeto.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Sem tags</span>
                      ) : (
                        <>
                          {projeto.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                          {projeto.tags.length > 2 && (
                            <Badge variant="outline">+{projeto.tags.length - 2}</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={projeto.status === "publicado" ? "default" : "outline"}>
                      {STATUS_LABELS[projeto.status] ?? projeto.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage
                        src={projeto.owner_avatar_url ?? ""}
                        alt={projeto.owner_nome ?? "Responsável"}
                      />
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(projeto.owner_nome)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    {projeto.compartilhado_com.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Não compartilhado</span>
                    ) : projeto.compartilhado_com.length === 1 ? (
                      <Avatar>
                        <AvatarImage
                          src={projeto.compartilhado_com[0]!.avatar_url ?? ""}
                          alt={projeto.compartilhado_com[0]!.nome ?? "Usuário"}
                        />
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(projeto.compartilhado_com[0]!.nome)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <AvatarGroup>
                        {projeto.compartilhado_com.slice(0, 3).map((usuario) => (
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
                        {projeto.compartilhado_com.length > 3 && (
                          <AvatarGroupCount className="text-xs">
                            +{projeto.compartilhado_com.length - 3}
                          </AvatarGroupCount>
                        )}
                      </AvatarGroup>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatData(projeto.updated_at)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                    <ProjetoActionsMenu projeto={projeto} />
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
