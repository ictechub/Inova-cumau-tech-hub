"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import {
  IconCalendarDue,
  IconCalendarEvent,
  IconCheck,
  IconFlag,
  IconLayoutColumns,
  IconTag,
  IconTrash,
  IconUsers,
  IconX,
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
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

import {
  COLUMN_COLOR_DOT,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  columnColorOf,
  taskPriorityOf,
} from "@/lib/task-board";
import { formatTaskCode } from "@/lib/task-code";
import { createTask, deleteTask, updateTask, type ActionResult } from "./actions";
import { TaskDatePicker } from "./task-date-picker";
import type { BoardColumn, BoardData, BoardMember, BoardTask } from "./types";

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

// Linha de propriedade no estilo Notion: rótulo com ícone à esquerda, controle
// ocupando o restante da largura.
function Propriedade({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
      <div className="flex items-center gap-2 pt-1.5 text-sm text-muted-foreground sm:w-40 sm:shrink-0">
        {icon}
        <span>{label}</span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function TaskDialog({
  board,
  columns,
  members,
  task,
  defaultColumnId,
  open,
  onOpenChange,
  podeEditar,
}: {
  board: BoardData;
  columns: BoardColumn[];
  members: BoardMember[];
  task: BoardTask | null;
  defaultColumnId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  podeEditar: boolean;
}) {
  const editando = !!task;
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    editando ? updateTask : createTask,
    null,
  );

  const [title, setTitle] = useState(task?.title ?? "");
  const [columnId, setColumnId] = useState(task?.column_id ?? defaultColumnId);
  const [priority, setPriority] = useState(taskPriorityOf(task?.priority ?? "media"));
  const [assignees, setAssignees] = useState<string[]>(task?.assignee_ids ?? []);
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);
  const [novaTag, setNovaTag] = useState("");
  const [startDate, setStartDate] = useState(task?.start_date ?? "");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [excluirOpen, setExcluirOpen] = useState(false);

  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({
        type: "success",
        description: editando ? "Tarefa salva." : "Tarefa criada.",
      });
      onOpenChange(false);
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, editando, onOpenChange]);

  const membroPorId = useMemo(
    () => new Map(members.map((membro) => [membro.user_id, membro])),
    [members],
  );

  const responsaveis = assignees
    .map((id) => membroPorId.get(id))
    .filter((membro): membro is BoardMember => !!membro);

  const columnItems = useMemo(
    () => Object.fromEntries(columns.map((column) => [column.id, column.title])),
    [columns],
  );

  const priorityItems = useMemo(
    () => Object.fromEntries(TASK_PRIORITIES.map((valor) => [valor, TASK_PRIORITY_LABELS[valor]])),
    [],
  );

  function alternarResponsavel(userId: string) {
    setAssignees((atual) =>
      atual.includes(userId) ? atual.filter((id) => id !== userId) : [...atual, userId],
    );
  }

  function adicionarTag() {
    const valor = novaTag.trim();
    if (!valor || tags.includes(valor) || tags.length >= 20) {
      setNovaTag("");
      return;
    }
    setTags((atual) => [...atual, valor]);
    setNovaTag("");
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-2xl">
          <form action={formAction} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="font-sans">
                {editando ? "Editar tarefa" : "Nova tarefa"}
              </DialogTitle>
              <DialogDescription>
                {editando
                  ? `${formatTaskCode(task.codigo_numero)} em ${board.title}`
                  : `Nova tarefa no quadro ${board.title}`}
              </DialogDescription>
            </DialogHeader>

            {editando ? (
              <input type="hidden" name="task_id" value={task.id} />
            ) : (
              <input type="hidden" name="board_id" value={board.id} />
            )}
            <input type="hidden" name="column_id" value={columnId} />
            <input type="hidden" name="priority" value={priority} />
            {assignees.map((id) => (
              <input key={id} type="hidden" name="assignee_ids" value={id} />
            ))}
            {tags.map((tag) => (
              <input key={tag} type="hidden" name="tags" value={tag} />
            ))}

            <div className="flex flex-col gap-1">
              <Input
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Sem título"
                autoFocus
                disabled={!podeEditar}
                aria-invalid={!!errors.title}
                className="h-auto border-transparent bg-transparent px-0 py-1 text-xl font-medium shadow-none focus-visible:border-transparent focus-visible:ring-0"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
              <Propriedade icon={<IconLayoutColumns className="size-4" />} label="Raia">
                <Select
                  items={columnItems}
                  value={columnId}
                  onValueChange={(value) => setColumnId(value as string)}
                  disabled={!podeEditar}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a raia" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${COLUMN_COLOR_DOT[columnColorOf(column.color)]}`}
                          />
                          {column.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Propriedade>

              <Propriedade icon={<IconUsers className="size-4" />} label="Responsáveis">
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!podeEditar}
                        className="h-auto w-full justify-start px-3 py-2 font-normal"
                      />
                    }
                  >
                    {responsaveis.length === 0 ? (
                      <span className="text-placeholder-foreground">Vazio</span>
                    ) : (
                      <span className="flex flex-wrap items-center gap-1.5">
                        {responsaveis.map((membro) => (
                          <span
                            key={membro.user_id}
                            className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs"
                          >
                            <Avatar className="size-4">
                              <AvatarImage src={membro.avatar_url ?? ""} alt={membro.nome} />
                              <AvatarFallback className="text-[9px] font-medium">
                                {iniciais(membro.nome)}
                              </AvatarFallback>
                            </Avatar>
                            {membro.nome}
                          </span>
                        ))}
                      </span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-80 p-1">
                    <div className="flex max-h-64 flex-col overflow-y-auto">
                      {members.map((membro) => {
                        const selecionado = assignees.includes(membro.user_id);
                        return (
                          <button
                            key={membro.user_id}
                            type="button"
                            onClick={() => alternarResponsavel(membro.user_id)}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent"
                          >
                            <Avatar className="size-6">
                              <AvatarImage src={membro.avatar_url ?? ""} alt={membro.nome} />
                              <AvatarFallback className="text-[10px] font-medium">
                                {iniciais(membro.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="min-w-0 flex-1 text-sm break-words">
                              {membro.nome}
                            </span>
                            {selecionado && <IconCheck className="size-4 shrink-0 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </Propriedade>

              <Propriedade icon={<IconFlag className="size-4" />} label="Prioridade">
                <Select
                  items={priorityItems}
                  value={priority}
                  onValueChange={(value) => setPriority(taskPriorityOf(value as string))}
                  disabled={!podeEditar}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((valor) => (
                      <SelectItem key={valor} value={valor}>
                        {TASK_PRIORITY_LABELS[valor]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Propriedade>

              <Propriedade icon={<IconCalendarEvent className="size-4" />} label="Início">
                <TaskDatePicker
                  name="start_date"
                  value={startDate}
                  onChange={setStartDate}
                  disabled={!podeEditar}
                  ariaInvalid={!!errors.start_date}
                  placeholder="Ex.: amanhã, semana que vem"
                />
              </Propriedade>

              <Propriedade icon={<IconCalendarDue className="size-4" />} label="Prazo">
                <TaskDatePicker
                  name="due_date"
                  value={dueDate}
                  onChange={setDueDate}
                  disabled={!podeEditar}
                  ariaInvalid={!!errors.due_date}
                  placeholder="Ex.: em 3 dias, sexta-feira"
                />
              </Propriedade>

              <Propriedade icon={<IconTag className="size-4" />} label="Etiquetas">
                <div className="flex flex-col gap-2">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
                        >
                          {tag}
                          {podeEditar && (
                            <button
                              type="button"
                              onClick={() => setTags((atual) => atual.filter((t) => t !== tag))}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <IconX className="size-3" />
                              <span className="sr-only">Remover etiqueta {tag}</span>
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  {podeEditar && (
                    <Input
                      value={novaTag}
                      onChange={(event) => setNovaTag(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          adicionarTag();
                        }
                      }}
                      onBlur={adicionarTag}
                      placeholder="Digite e pressione Enter"
                    />
                  )}
                </div>
              </Propriedade>
            </div>

            <div className="flex flex-col gap-2">
              <Textarea
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva a tarefa, o contexto e o que precisa ser entregue."
                rows={6}
                disabled={!podeEditar}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description[0]}</p>
              )}
            </div>

            <DialogFooter className="sm:justify-between">
              {editando && podeEditar ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setExcluirOpen(true)}
                >
                  <IconTrash />
                  Excluir
                </Button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <DialogClose render={<Button type="button" variant="outline" />}>
                  {podeEditar ? "Cancelar" : "Fechar"}
                </DialogClose>
                {podeEditar && (
                  <Button type="submit" disabled={isPending || !title.trim()}>
                    {editando ? "Salvar" : "Criar tarefa"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {editando && (
        <ExcluirTarefaDialog
          task={task}
          open={excluirOpen}
          onOpenChange={setExcluirOpen}
          onExcluida={() => onOpenChange(false)}
        />
      )}
    </>
  );
}

function ExcluirTarefaDialog({
  task,
  open,
  onOpenChange,
  onExcluida,
}: {
  task: BoardTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExcluida: () => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(deleteTask, null);

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Tarefa excluída." });
      onOpenChange(false);
      onExcluida();
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, onOpenChange, onExcluida]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <form action={formAction} className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <IconTrash />
            </AlertDialogMedia>
            <AlertDialogTitle className="font-sans">Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa &quot;{task.title}&quot;? Essa ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input type="hidden" name="task_id" value={task.id} />
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
