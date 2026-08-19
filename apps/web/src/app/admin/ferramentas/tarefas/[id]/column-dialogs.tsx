"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { IconTrash } from "@tabler/icons-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

import {
  COLUMN_COLORS,
  COLUMN_COLOR_DOT,
  COLUMN_COLOR_LABELS,
  columnColorOf,
} from "@/lib/task-board";
import { createColumn, deleteColumn, updateColumn, type ActionResult } from "./actions";
import type { BoardColumn } from "./types";

function useColorItems() {
  return useMemo(
    () => Object.fromEntries(COLUMN_COLORS.map((cor) => [cor, COLUMN_COLOR_LABELS[cor]])),
    [],
  );
}

function CamposDaRaia({
  title,
  onTitleChange,
  color,
  onColorChange,
  erroTitulo,
}: {
  title: string;
  onTitleChange: (valor: string) => void;
  color: string;
  onColorChange: (valor: string) => void;
  erroTitulo?: string;
}) {
  const colorItems = useColorItems();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="column-title">Nome da raia</Label>
        <Input
          id="column-title"
          name="title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Ex.: Em revisão"
          autoFocus
          aria-invalid={!!erroTitulo}
        />
        {erroTitulo && <p className="text-xs text-destructive">{erroTitulo}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label>Cor</Label>
        <input type="hidden" name="color" value={color} />
        <Select
          items={colorItems}
          value={color}
          onValueChange={(valor) => onColorChange(valor as string)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a cor" />
          </SelectTrigger>
          <SelectContent>
            {COLUMN_COLORS.map((cor) => (
              <SelectItem key={cor} value={cor}>
                <span className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${COLUMN_COLOR_DOT[cor]}`} />
                  {COLUMN_COLOR_LABELS[cor]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function NovaRaiaDialog({
  boardId,
  open,
  onOpenChange,
}: {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createColumn,
    null,
  );
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>("neutral");
  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Raia criada." });
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
            <DialogTitle className="font-sans">Nova raia</DialogTitle>
            <DialogDescription>
              Crie uma coluna nova para organizar as tarefas do quadro.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="board_id" value={boardId} />
          <CamposDaRaia
            title={title}
            onTitleChange={setTitle}
            color={color}
            onColorChange={setColor}
            erroTitulo={errors.title?.[0]}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isPending || !title.trim()}>
              Criar raia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditarRaiaDialog({
  boardId,
  column,
  open,
  onOpenChange,
}: {
  boardId: string;
  column: BoardColumn;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateColumn,
    null,
  );
  const [title, setTitle] = useState(column.title);
  const [color, setColor] = useState<string>(columnColorOf(column.color));
  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Raia salva." });
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
            <DialogTitle className="font-sans">Editar raia</DialogTitle>
            <DialogDescription>Ajuste o nome e a cor desta coluna.</DialogDescription>
          </DialogHeader>
          <input type="hidden" name="board_id" value={boardId} />
          <input type="hidden" name="column_id" value={column.id} />
          <CamposDaRaia
            title={title}
            onTitleChange={setTitle}
            color={color}
            onColorChange={setColor}
            erroTitulo={errors.title?.[0]}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isPending || !title.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExcluirRaiaDialog({
  boardId,
  column,
  totalTarefas,
  open,
  onOpenChange,
}: {
  boardId: string;
  column: BoardColumn;
  totalTarefas: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(deleteColumn, null);

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Raia excluída." });
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
            <AlertDialogTitle className="font-sans">Excluir raia</AlertDialogTitle>
            <AlertDialogDescription>
              {totalTarefas > 0
                ? `A raia "${column.title}" tem ${totalTarefas} ${totalTarefas === 1 ? "tarefa" : "tarefas"}, que serão excluídas junto. Essa ação não pode ser desfeita.`
                : `Tem certeza que deseja excluir a raia "${column.title}"? Essa ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input type="hidden" name="board_id" value={boardId} />
          <input type="hidden" name="column_id" value={column.id} />
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
