"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

import { COLUMN_COLOR_BAR, columnColorOf } from "@/lib/task-board";
import { rescheduleTask } from "./actions";
import type { BoardColumn, BoardTask } from "./types";

const DIA_MS = 86_400_000;
const ALTURA_LINHA = 44;

type Escala = "semana" | "mes" | "trimestre";

const ESCALA_LABELS: Record<Escala, string> = {
  semana: "Semana",
  mes: "Mês",
  trimestre: "Trimestre",
};

const LARGURA_DIA: Record<Escala, number> = {
  semana: 88,
  mes: 40,
  trimestre: 16,
};

function parseDia(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return Date.UTC(ano ?? 1970, (mes ?? 1) - 1, dia ?? 1);
}

function formatIso(ms: number) {
  const data = new Date(ms);
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(data.getUTCDate()).padStart(2, "0");
  return `${data.getUTCFullYear()}-${mes}-${dia}`;
}

function hojeMs() {
  const agora = new Date();
  return Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

function diasNoMes(ano: number, mes: number) {
  return new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
}

// Janela visível da linha do tempo a partir da âncora e da escala escolhida.
function janelaDe(ancora: number, escala: Escala) {
  const data = new Date(ancora);
  const ano = data.getUTCFullYear();
  const mes = data.getUTCMonth();

  if (escala === "semana") {
    const inicio = ancora - data.getUTCDay() * DIA_MS;
    return { inicio, dias: 7 };
  }

  if (escala === "mes") {
    return { inicio: Date.UTC(ano, mes, 1), dias: diasNoMes(ano, mes) };
  }

  const primeiroMes = mes - (mes % 3);
  const dias =
    diasNoMes(ano, primeiroMes) + diasNoMes(ano, primeiroMes + 1) + diasNoMes(ano, primeiroMes + 2);
  return { inicio: Date.UTC(ano, primeiroMes, 1), dias };
}

function avancar(ancora: number, escala: Escala, direcao: 1 | -1) {
  const data = new Date(ancora);
  if (escala === "semana") return ancora + direcao * 7 * DIA_MS;
  const passo = escala === "mes" ? 1 : 3;
  return Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + direcao * passo, 1);
}

function rotuloDoPeriodo(inicio: number, dias: number, escala: Escala) {
  const fim = inicio + (dias - 1) * DIA_MS;
  if (escala === "semana") {
    const de = new Date(inicio).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
    });
    const ate = new Date(fim).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${de} a ${ate}`;
  }
  if (escala === "mes") {
    return new Date(inicio).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
      month: "long",
      year: "numeric",
    });
  }
  const de = new Date(inicio).toLocaleDateString("pt-BR", { timeZone: "UTC", month: "short" });
  const ate = new Date(fim).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    month: "short",
    year: "numeric",
  });
  return `${de} a ${ate}`;
}

export function TimelineView({
  columns,
  tasks,
  podeEditar,
  onTasksChange,
  onAbrirTarefa,
  onNovaTarefa,
}: {
  columns: BoardColumn[];
  tasks: BoardTask[];
  podeEditar: boolean;
  onTasksChange: (tasks: BoardTask[]) => void;
  onAbrirTarefa: (task: BoardTask) => void;
  onNovaTarefa: () => void;
}) {
  const router = useRouter();
  const [escala, setEscala] = useState<Escala>("mes");
  const [ancora, setAncora] = useState(() => hojeMs());
  const [arrasto, setArrasto] = useState<{ taskId: string; xInicial: number; offset: number } | null>(
    null,
  );

  const larguraDia = LARGURA_DIA[escala];
  const { inicio, dias } = useMemo(() => janelaDe(ancora, escala), [ancora, escala]);
  const fim = inicio + (dias - 1) * DIA_MS;
  const larguraTotal = dias * larguraDia;
  const hoje = hojeMs();

  const corPorColuna = useMemo(
    () => new Map(columns.map((column) => [column.id, columnColorOf(column.color)])),
    [columns],
  );

  const gruposDeMes = useMemo(() => {
    const grupos: { chave: string; label: string; dias: number }[] = [];
    for (let i = 0; i < dias; i += 1) {
      const data = new Date(inicio + i * DIA_MS);
      const chave = `${data.getUTCFullYear()}-${data.getUTCMonth()}`;
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.chave === chave) {
        ultimo.dias += 1;
      } else {
        grupos.push({
          chave,
          label: data.toLocaleDateString("pt-BR", {
            timeZone: "UTC",
            month: "long",
            year: "numeric",
          }),
          dias: 1,
        });
      }
    }
    return grupos;
  }, [inicio, dias]);

  const comData = tasks.filter((task) => task.start_date || task.due_date);
  const semData = tasks.filter((task) => !task.start_date && !task.due_date);

  // Arrasto horizontal da barra: desloca início e prazo pelo mesmo número de
  // dias, mantendo a duração da tarefa. O efeito roda de novo a cada mudança
  // de `arrasto`, então os listeners sempre enxergam o deslocamento atual.
  useEffect(() => {
    if (!arrasto) return;
    const atual = arrasto;
    document.body.style.cursor = "grabbing";

    function mover(event: PointerEvent) {
      const offset = Math.round((event.clientX - atual.xInicial) / larguraDia);
      if (offset !== atual.offset) setArrasto({ ...atual, offset });
    }

    function soltar() {
      setArrasto(null);
      if (atual.offset === 0) return;

      const tarefa = tasks.find((task) => task.id === atual.taskId);
      if (!tarefa) return;

      const novoInicio = tarefa.start_date
        ? formatIso(parseDia(tarefa.start_date) + atual.offset * DIA_MS)
        : null;
      const novoPrazo = tarefa.due_date
        ? formatIso(parseDia(tarefa.due_date) + atual.offset * DIA_MS)
        : null;

      onTasksChange(
        tasks.map((task) =>
          task.id === atual.taskId
            ? { ...task, start_date: novoInicio, due_date: novoPrazo }
            : task,
        ),
      );

      void rescheduleTask({
        task_id: atual.taskId,
        start_date: novoInicio,
        due_date: novoPrazo,
      }).then((resultado) => {
        if (resultado.status === "error") {
          toast.add({ type: "error", description: resultado.message });
          router.refresh();
        }
      });
    }

    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      document.body.style.cursor = "";
    };
  }, [arrasto, larguraDia, tasks, onTasksChange, router]);

  function irParaTarefa(task: BoardTask) {
    const referencia = task.start_date ?? task.due_date;
    if (referencia) setAncora(parseDia(referencia));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setAncora((atual) => avancar(atual, escala, -1))}
          >
            <IconChevronLeft />
            <span className="sr-only">Período anterior</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setAncora((atual) => avancar(atual, escala, 1))}
          >
            <IconChevronRight />
            <span className="sr-only">Próximo período</span>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAncora(hojeMs())}>
            Hoje
          </Button>
          <span className="text-sm font-medium text-foreground first-letter:uppercase">
            {rotuloDoPeriodo(inicio, dias, escala)}
          </span>
        </div>
        <Select
          items={ESCALA_LABELS}
          value={escala}
          onValueChange={(valor) => setEscala(valor as Escala)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Escala" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ESCALA_LABELS) as Escala[]).map((valor) => (
              <SelectItem key={valor} value={valor}>
                {ESCALA_LABELS[valor]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-border">
        <div className="w-56 shrink-0 border-r border-border bg-card">
          <div className="flex h-14 items-end border-b border-border px-3 pb-2 text-xs font-medium text-muted-foreground">
            Tarefa
          </div>
          {comData.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onAbrirTarefa(task)}
              style={{ height: ALTURA_LINHA }}
              className="flex w-full items-center border-b border-border px-3 text-left text-sm break-words hover:bg-accent"
            >
              <span className="line-clamp-2">{task.title}</span>
            </button>
          ))}
          {comData.length === 0 && (
            <div
              style={{ height: ALTURA_LINHA }}
              className="flex items-center px-3 text-xs text-muted-foreground"
            >
              Nenhuma tarefa com data
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div style={{ width: larguraTotal, minWidth: "100%" }}>
            <div className="flex h-7 border-b border-border">
              {gruposDeMes.map((grupo) => (
                <div
                  key={grupo.chave}
                  style={{ width: grupo.dias * larguraDia }}
                  className="flex items-center border-r border-border px-2 text-xs font-medium text-foreground first-letter:uppercase"
                >
                  <span className="truncate">{grupo.label}</span>
                </div>
              ))}
            </div>

            <div className="flex h-7 border-b border-border">
              {Array.from({ length: dias }, (_, indice) => {
                const data = new Date(inicio + indice * DIA_MS);
                const fimDeSemana = data.getUTCDay() === 0 || data.getUTCDay() === 6;
                const ehHoje = inicio + indice * DIA_MS === hoje;
                return (
                  <div
                    key={indice}
                    style={{ width: larguraDia }}
                    className={`flex items-center justify-center border-r border-border text-[11px] ${
                      ehHoje
                        ? "font-medium text-error-600 dark:text-error-400"
                        : fimDeSemana
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground"
                    }`}
                  >
                    {larguraDia >= 24 ? data.getUTCDate() : ""}
                  </div>
                );
              })}
            </div>

            <div className="relative">
              {hoje >= inicio && hoje <= fim && (
                <div
                  style={{
                    left: ((hoje - inicio) / DIA_MS) * larguraDia + larguraDia / 2,
                  }}
                  className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-error-500"
                />
              )}

              {comData.map((task) => {
                const inicioTarefa = parseDia(task.start_date ?? task.due_date ?? "");
                const fimTarefa = parseDia(task.due_date ?? task.start_date ?? "");
                const offset = arrasto?.taskId === task.id ? arrasto.offset : 0;
                const de = inicioTarefa + offset * DIA_MS;
                const ate = fimTarefa + offset * DIA_MS;

                const antes = ate < inicio;
                const depois = de > fim;
                const cor = COLUMN_COLOR_BAR[corPorColuna.get(task.column_id) ?? "neutral"];

                const inicioVisivel = Math.max(de, inicio);
                const fimVisivel = Math.min(ate, fim);
                const esquerda = ((inicioVisivel - inicio) / DIA_MS) * larguraDia;
                const largura =
                  ((fimVisivel - inicioVisivel) / DIA_MS + 1) * larguraDia;

                return (
                  <div
                    key={task.id}
                    style={{ height: ALTURA_LINHA }}
                    className="relative border-b border-border"
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to right, transparent 0 ${larguraDia - 1}px, var(--color-border) ${larguraDia - 1}px ${larguraDia}px)`,
                      }}
                    />
                    {antes && (
                      <button
                        type="button"
                        onClick={() => irParaTarefa(task)}
                        className="absolute top-1/2 left-1 z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <IconChevronLeft className="size-4" />
                        <span className="sr-only">Ir para {task.title}</span>
                      </button>
                    )}
                    {depois && (
                      <button
                        type="button"
                        onClick={() => irParaTarefa(task)}
                        className="absolute top-1/2 right-1 z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <IconChevronRight className="size-4" />
                        <span className="sr-only">Ir para {task.title}</span>
                      </button>
                    )}
                    {!antes && !depois && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (!arrasto) onAbrirTarefa(task);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") onAbrirTarefa(task);
                        }}
                        onPointerDown={(event) => {
                          if (!podeEditar) return;
                          setArrasto({ taskId: task.id, xInicial: event.clientX, offset: 0 });
                        }}
                        style={{ left: esquerda, width: Math.max(largura, larguraDia) }}
                        className={`absolute top-1/2 z-10 flex h-7 -translate-y-1/2 items-center overflow-hidden rounded-md px-2 text-xs font-medium ${cor} ${
                          arrasto?.taskId === task.id
                            ? "cursor-grabbing"
                            : podeEditar
                              ? "cursor-grab"
                              : "cursor-pointer"
                        }`}
                      >
                        <span className="truncate">{task.title}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {comData.length === 0 && (
                <div style={{ height: ALTURA_LINHA }} className="border-b border-border" />
              )}
            </div>
          </div>
        </div>
      </div>

      {semData.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Sem datas definidas ({semData.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {semData.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onAbrirTarefa(task)}
                className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-accent"
              >
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {podeEditar && (
        <div>
          <Button type="button" variant="ghost" onClick={onNovaTarefa} className="text-muted-foreground">
            <IconPlus />
            Nova tarefa
          </Button>
        </div>
      )}
    </div>
  );
}
