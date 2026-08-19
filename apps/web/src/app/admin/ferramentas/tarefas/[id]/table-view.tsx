"use client";

import { useMemo } from "react";

import { IconPlus } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  COLUMN_COLOR_DOT,
  TASK_PRIORITY_BADGE,
  TASK_PRIORITY_LABELS,
  columnColorOf,
  taskPriorityOf,
} from "@/lib/task-board";
import { formatTaskCode } from "@/lib/task-code";
import type { BoardColumn, BoardMember, BoardTask } from "./types";

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function formatData(iso: string | null) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(Date.UTC(ano ?? 1970, (mes ?? 1) - 1, dia ?? 1)).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function TableView({
  columns,
  tasks,
  members,
  podeEditar,
  onAbrirTarefa,
  onNovaTarefa,
}: {
  columns: BoardColumn[];
  tasks: BoardTask[];
  members: BoardMember[];
  podeEditar: boolean;
  onAbrirTarefa: (task: BoardTask) => void;
  onNovaTarefa: () => void;
}) {
  const colunaPorId = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
  const membroPorId = useMemo(
    () => new Map(members.map((member) => [member.user_id, member])),
    [members],
  );

  // A ordem segue a das raias no quadro e, dentro de cada raia, a posição.
  const ordemDaColuna = useMemo(
    () => new Map(columns.map((column, indice) => [column.id, indice])),
    [columns],
  );
  const linhas = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const colunaA = ordemDaColuna.get(a.column_id) ?? 0;
        const colunaB = ordemDaColuna.get(b.column_id) ?? 0;
        if (colunaA !== colunaB) return colunaA - colunaB;
        return a.position - b.position;
      }),
    [tasks, ordemDaColuna],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Tarefa</TableHead>
              <TableHead>Raia</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsáveis</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Etiquetas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((task) => {
              const column = colunaPorId.get(task.column_id);
              const prioridade = taskPriorityOf(task.priority);
              const responsaveis = task.assignee_ids
                .map((id) => membroPorId.get(id))
                .filter((membro): membro is BoardMember => !!membro);

              return (
                <TableRow
                  key={task.id}
                  onClick={() => onAbrirTarefa(task)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatTaskCode(task.codigo_numero)}
                  </TableCell>
                  <TableCell className="font-medium break-words whitespace-normal">
                    {task.title}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {column && (
                      <span className="flex items-center gap-2">
                        <span
                          className={`size-2 shrink-0 rounded-full ${COLUMN_COLOR_DOT[columnColorOf(column.color)]}`}
                        />
                        {column.title}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={TASK_PRIORITY_BADGE[prioridade]}>
                      {TASK_PRIORITY_LABELS[prioridade]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {responsaveis.length > 0 ? (
                      <span className="flex flex-wrap items-center gap-1">
                        {responsaveis.map((membro) => (
                          <span key={membro.user_id} className="flex items-center gap-1.5">
                            <Avatar className="size-6">
                              <AvatarImage src={membro.avatar_url ?? undefined} alt={membro.nome} />
                              <AvatarFallback className="text-[10px]">
                                {iniciais(membro.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{membro.nome}</span>
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem responsável</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatData(task.start_date)}</TableCell>
                  <TableCell className="text-sm">{formatData(task.due_date)}</TableCell>
                  <TableCell className="whitespace-normal">
                    {task.tags.length > 0 ? (
                      <span className="flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem etiquetas</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {linhas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma tarefa neste quadro ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {podeEditar && (
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={onNovaTarefa}
            className="text-muted-foreground"
          >
            <IconPlus />
            Nova tarefa
          </Button>
        </div>
      )}
    </div>
  );
}
