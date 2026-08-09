"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import {
  IconDotsVertical,
  IconMailForward,
  IconPencil,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { formatMatricula } from "@/lib/matricula";

import { deleteUser, updateUserRole, type ActionResult } from "../actions";
import { InviteConsultorDialog } from "./invite-consultor-dialog";
import type { PlatformUser } from "../usuarios-tabs";

const ROLE_OPTIONS = [
  { value: "administrador", label: "Administrador" },
  { value: "consultor", label: "Consultor" },
  { value: "associado", label: "Associado" },
] as const;

const ROLE_ITEMS = Object.fromEntries(ROLE_OPTIONS.map((option) => [option.value, option.label]));

const ROLE_LABELS: Record<PlatformUser["role"], string> = {
  owner: "Owner",
  administrador: "Administrador",
  consultor: "Consultor",
  associado: "Associado",
};

const TODOS = "todos";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
  }
  return (parts[0] ?? name).slice(0, 2).toUpperCase();
}

function UserPermissionsDialog({
  usuario,
  open,
  onOpenChange,
}: {
  usuario: PlatformUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updateUserRole,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<PlatformUser["role"]>(usuario.role);

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Nível de acesso atualizado." });
      onOpenChange(false);
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (nextOpen) setRole(usuario.role);
      }}
    >
      <DialogContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Permissões de acesso</DialogTitle>
            <DialogDescription>
              Defina o nível de acesso de {usuario.responsavel_nome} na plataforma.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="user_id" value={usuario.user_id} />
          <input type="hidden" name="role" value={role} />
          <div className="flex flex-col gap-2">
            <Label>Nível de acesso</Label>
            <Select
              items={ROLE_ITEMS}
              value={role}
              onValueChange={(value) => setRole(value as PlatformUser["role"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Nível de acesso" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserDialog({
  usuario,
  open,
  onOpenChange,
}: {
  usuario: PlatformUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    deleteUser,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Conta excluída." });
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
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a conta de {usuario.responsavel_nome}?
              Essa ação não pode ser desfeita: todos os dados de cadastro e acesso
              dessa conta serão apagados.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="user_id" value={usuario.user_id} />
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

function UserActionsMenu({ usuario }: { usuario: PlatformUser }) {
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <IconDotsVertical />
          <span className="sr-only">Ações para {usuario.responsavel_nome}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPermissionsOpen(true)}>
            <IconPencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <IconTrash />
            Excluir conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserPermissionsDialog
        usuario={usuario}
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
      />
      <DeleteUserDialog usuario={usuario} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

export function UsuariosTab({
  usuarios,
  currentUserId,
}: {
  usuarios: PlatformUser[];
  currentUserId: string;
}) {
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<string>(TODOS);
  const [inviteOpen, setInviteOpen] = useState(false);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const combinaBusca =
        !termo ||
        usuario.responsavel_nome.toLowerCase().includes(termo) ||
        usuario.responsavel_email.toLowerCase().includes(termo) ||
        formatMatricula(usuario.matricula_numero).toLowerCase().includes(termo);
      const combinaRole = filtroRole === TODOS || usuario.role === filtroRole;
      return combinaBusca && combinaRole;
    });
  }, [usuarios, busca, filtroRole]);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-64">
          <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome, e-mail ou ID"
            className="pl-8"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[filtroRole]}
            onValueChange={(value) => {
              if (value[0]) setFiltroRole(value[0]);
            }}
          >
            <ToggleGroupItem value={TODOS}>Todos</ToggleGroupItem>
            {ROLE_OPTIONS.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <IconMailForward />
            Convidar Consultor
          </Button>
        </div>
      </div>
      <div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-28">ID</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="w-40">Nível de acesso</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <TableRow key={usuario.user_id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatMatricula(usuario.matricula_numero)}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 shrink-0 rounded-lg after:hidden">
                        <AvatarImage
                          src={usuario.avatar_url ?? ""}
                          alt={usuario.responsavel_nome}
                          className="rounded-lg object-cover"
                        />
                        <AvatarFallback className="rounded-lg text-xs font-medium">
                          {getInitials(usuario.responsavel_nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {usuario.responsavel_nome}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {usuario.responsavel_cargo}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {usuario.responsavel_email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ROLE_LABELS[usuario.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {usuario.user_id !== currentUserId && (
                      <UserActionsMenu usuario={usuario} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <InviteConsultorDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
