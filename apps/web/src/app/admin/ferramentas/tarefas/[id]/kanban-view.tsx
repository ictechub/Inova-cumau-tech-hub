"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  IconCalendarDue,
  IconDotsVertical,
  IconGripVertical,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";

import {
  COLUMN_COLOR_BG,
  COLUMN_COLOR_DOT,
  POSITION_STEP,
  TASK_PRIORITY_BADGE,
  TASK_PRIORITY_LABELS,
  columnColorOf,
  taskPriorityOf,
} from "@/lib/task-board";
import { formatTaskCode } from "@/lib/task-code";
import { moveColumn, moveTask } from "./actions";
import type { BoardColumn, BoardMember, BoardTask } from "./types";

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function formatDiaMes(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano ?? 1970, (mes ?? 1) - 1, dia ?? 1).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

// Posição de inserção num índice da lista destino: média entre as vizinhas,
// para nunca precisar reescrever a coluna inteira.
function posicaoNoIndice(lista: BoardTask[], indice: number) {
  const anterior = lista[indice - 1];
  const proximo = lista[indice];
  if (!anterior && !proximo) return POSITION_STEP;
  if (!anterior && proximo) return proximo.position - POSITION_STEP;
  if (!anterior || !proximo) return (anterior?.position ?? 0) + POSITION_STEP;
  return (anterior.position + proximo.position) / 2;
}

function reordenarTarefas(
  tarefas: BoardTask[],
  activeId: string,
  overId: string,
  overType: string,
): BoardTask[] {
  const ativa = tarefas.find((tarefa) => tarefa.id === activeId);
  if (!ativa) return tarefas;

  const destinoId =
    overType === "column"
      ? overId
      : tarefas.find((tarefa) => tarefa.id === overId)?.column_id;
  if (!destinoId) return tarefas;

  const destino = tarefas
    .filter((tarefa) => tarefa.column_id === destinoId && tarefa.id !== activeId)
    .sort((a, b) => a.position - b.position);

  let indice = destino.length;
  if (overType === "task") {
    const alvo = destino.findIndex((tarefa) => tarefa.id === overId);
    const tarefaAlvo = destino[alvo];
    if (alvo >= 0 && tarefaAlvo) {
      // Descendo dentro da mesma raia o card entra depois do alvo, subindo
      // entra antes, que é o comportamento esperado de um sortable.
      const descendo = ativa.column_id === destinoId && ativa.position < tarefaAlvo.position;
      indice = descendo ? alvo + 1 : alvo;
    }
  }

  const position = posicaoNoIndice(destino, indice);
  if (ativa.column_id === destinoId && ativa.position === position) return tarefas;

  return tarefas.map((tarefa) =>
    tarefa.id === activeId ? { ...tarefa, column_id: destinoId, position } : tarefa,
  );
}

function TaskCardConteudo({
  task,
  members,
}: {
  task: BoardTask;
  members: Map<string, BoardMember>;
}) {
  const responsaveis = task.assignee_ids
    .map((id) => members.get(id))
    .filter((membro): membro is BoardMember => !!membro);

  const prioridade = taskPriorityOf(task.priority);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatTaskCode(task.codigo_numero)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TASK_PRIORITY_BADGE[prioridade]}`}
        >
          {TASK_PRIORITY_LABELS[prioridade]}
        </span>
      </div>
      <p className="text-sm leading-snug font-medium break-words text-foreground">{task.title}</p>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {(task.due_date || responsaveis.length > 0) && (
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {task.due_date ? (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <IconCalendarDue className="size-3.5" />
              {formatDiaMes(task.due_date)}
            </span>
          ) : (
            <span />
          )}
          {responsaveis.length > 0 && (
            <div className="flex -space-x-1.5">
              {responsaveis.slice(0, 3).map((membro) => (
                <Avatar key={membro.user_id} className="size-6 ring-2 ring-card">
                  <AvatarImage src={membro.avatar_url ?? ""} alt={membro.nome} />
                  <AvatarFallback className="text-[9px] font-medium">
                    {iniciais(membro.nome)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {responsaveis.length > 3 && (
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">
                  +{responsaveis.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SortableTaskCard({
  task,
  members,
  onAbrir,
  arrastavel,
}: {
  task: BoardTask;
  members: Map<string, BoardMember>;
  onAbrir: () => void;
  arrastavel: boolean;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task" },
    disabled: !arrastavel,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      onClick={onAbrir}
      className={`cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <TaskCardConteudo task={task} members={members} />
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  members,
  podeEditar,
  onNovaTarefa,
  onAbrirTarefa,
  onEditarRaia,
  onExcluirRaia,
}: {
  column: BoardColumn;
  tasks: BoardTask[];
  members: Map<string, BoardMember>;
  podeEditar: boolean;
  onNovaTarefa: () => void;
  onAbrirTarefa: (task: BoardTask) => void;
  onEditarRaia: () => void;
  onExcluirRaia: () => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: "column" },
    disabled: !podeEditar,
  });

  const cor = columnColorOf(column.color);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={`flex w-80 shrink-0 flex-col gap-3 rounded-xl p-3 ${COLUMN_COLOR_BG[cor]} ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {podeEditar && (
          <button
            type="button"
            className="cursor-grab text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <IconGripVertical className="size-4" />
            <span className="sr-only">Reordenar a raia {column.title}</span>
          </button>
        )}
        <span className={`size-2 shrink-0 rounded-full ${COLUMN_COLOR_DOT[cor]}`} />
        <span className="min-w-0 flex-1 text-sm font-medium break-words text-foreground">
          {column.title}
        </span>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
        {podeEditar && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <IconDotsVertical />
              <span className="sr-only">Ações da raia {column.title}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditarRaia}>
                <IconPencil />
                Editar raia
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onNovaTarefa}>
                <IconPlus />
                Nova tarefa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onExcluirRaia}>
                <IconTrash />
                Excluir raia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-24 flex-col gap-2">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              members={members}
              arrastavel={podeEditar}
              onAbrir={() => onAbrirTarefa(task)}
            />
          ))}
          {tasks.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              Nenhuma tarefa aqui
            </p>
          )}
        </div>
      </SortableContext>

      {podeEditar && (
        <Button
          type="button"
          variant="ghost"
          onClick={onNovaTarefa}
          className="justify-start text-muted-foreground"
        >
          <IconPlus />
          Nova tarefa
        </Button>
      )}
    </div>
  );
}

export function KanbanView({
  boardId,
  columns,
  tasks,
  members,
  podeEditar,
  onTasksChange,
  onColumnsChange,
  onNovaTarefa,
  onAbrirTarefa,
  onNovaRaia,
  onEditarRaia,
  onExcluirRaia,
}: {
  boardId: string;
  columns: BoardColumn[];
  tasks: BoardTask[];
  members: BoardMember[];
  podeEditar: boolean;
  onTasksChange: (tasks: BoardTask[]) => void;
  onColumnsChange: (columns: BoardColumn[]) => void;
  onNovaTarefa: (columnId: string) => void;
  onAbrirTarefa: (task: BoardTask) => void;
  onNovaRaia: () => void;
  onEditarRaia: (column: BoardColumn) => void;
  onExcluirRaia: (column: BoardColumn) => void;
}) {
  const router = useRouter();
  const [arrastando, setArrastando] = useState<
    { tipo: "task"; task: BoardTask } | { tipo: "column"; column: BoardColumn } | null
  >(null);

  const sensors = useSensors(
    // Uma folga de 6px separa clique (abrir a tarefa) de arrasto.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const membrosPorId = useMemo(
    () => new Map(members.map((membro) => [membro.user_id, membro])),
    [members],
  );

  const colunasOrdenadas = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns],
  );

  const tarefasPorColuna = useMemo(() => {
    const mapa = new Map<string, BoardTask[]>();
    for (const column of colunasOrdenadas) mapa.set(column.id, []);
    for (const task of tasks) {
      const lista = mapa.get(task.column_id);
      if (lista) lista.push(task);
    }
    for (const lista of mapa.values()) lista.sort((a, b) => a.position - b.position);
    return mapa;
  }, [colunasOrdenadas, tasks]);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (event.active.data.current?.type === "column") {
      const column = columns.find((item) => item.id === id);
      if (column) setArrastando({ tipo: "column", column });
      return;
    }
    const task = tasks.find((item) => item.id === id);
    if (task) setArrastando({ tipo: "task", task });
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "task") return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const overType = String(over.data.current?.type ?? "");
    if (overType !== "task" && overType !== "column") return;

    onTasksChange(reordenarTarefas(tasks, activeId, overId, overType));
  }

  async function persistirTarefa(task: BoardTask) {
    const resultado = await moveTask({
      task_id: task.id,
      column_id: task.column_id,
      position: task.position,
    });
    if (resultado.status === "error") {
      toast.add({ type: "error", description: resultado.message });
      router.refresh();
    }
  }

  async function persistirColuna(column: BoardColumn) {
    const resultado = await moveColumn({
      board_id: boardId,
      column_id: column.id,
      position: column.position,
    });
    if (resultado.status === "error") {
      toast.add({ type: "error", description: resultado.message });
      router.refresh();
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setArrastando(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const overType = String(over.data.current?.type ?? "");

    if (active.data.current?.type === "column") {
      const destinoId = overType === "column" ? overId : tasks.find((t) => t.id === overId)?.column_id;
      if (!destinoId || destinoId === activeId) return;

      const antigo = colunasOrdenadas.findIndex((column) => column.id === activeId);
      const novo = colunasOrdenadas.findIndex((column) => column.id === destinoId);
      if (antigo < 0 || novo < 0 || antigo === novo) return;

      const movidas = arrayMove(colunasOrdenadas, antigo, novo);
      const anterior = movidas[novo - 1];
      const proximo = movidas[novo + 1];
      const position = !anterior
        ? (proximo?.position ?? POSITION_STEP) - POSITION_STEP
        : !proximo
          ? anterior.position + POSITION_STEP
          : (anterior.position + proximo.position) / 2;

      const atualizadas = movidas.map((column) =>
        column.id === activeId ? { ...column, position } : column,
      );
      onColumnsChange(atualizadas);

      const movidaColuna = atualizadas.find((column) => column.id === activeId);
      if (movidaColuna) void persistirColuna(movidaColuna);
      return;
    }

    if (overType !== "task" && overType !== "column") return;

    const proximas = reordenarTarefas(tasks, activeId, overId, overType);
    onTasksChange(proximas);

    const movida = proximas.find((task) => task.id === activeId);
    if (movida) void persistirTarefa(movida);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setArrastando(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <SortableContext
          items={colunasOrdenadas.map((column) => column.id)}
          strategy={horizontalListSortingStrategy}
        >
          {colunasOrdenadas.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tarefasPorColuna.get(column.id) ?? []}
              members={membrosPorId}
              podeEditar={podeEditar}
              onNovaTarefa={() => onNovaTarefa(column.id)}
              onAbrirTarefa={onAbrirTarefa}
              onEditarRaia={() => onEditarRaia(column)}
              onExcluirRaia={() => onExcluirRaia(column)}
            />
          ))}
        </SortableContext>

        {podeEditar && (
          <button
            type="button"
            onClick={onNovaRaia}
            className="flex h-12 w-64 shrink-0 items-center gap-2 rounded-xl border border-dashed border-border px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <IconPlus className="size-4" />
            Nova raia
          </button>
        )}
      </div>

      <DragOverlay>
        {arrastando?.tipo === "task" && (
          <div className="w-80 rounded-lg border border-border bg-card p-3 shadow-lg">
            <TaskCardConteudo task={arrastando.task} members={membrosPorId} />
          </div>
        )}
        {arrastando?.tipo === "column" && (
          <div
            className={`w-80 rounded-xl p-3 shadow-lg ${COLUMN_COLOR_BG[columnColorOf(arrastando.column.color)]}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${COLUMN_COLOR_DOT[columnColorOf(arrastando.column.color)]}`}
              />
              <span className="text-sm font-medium text-foreground">
                {arrastando.column.title}
              </span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
