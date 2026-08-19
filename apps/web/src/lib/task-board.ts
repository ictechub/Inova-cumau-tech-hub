// Constantes compartilhadas do Quadro de tarefas. Ficam num módulo próprio
// (fora de qualquer componente "use client") para que Server Actions, schemas
// Zod e as três visões usem exatamente a mesma fonte de verdade.

// Raias base criadas junto com todo quadro novo. Depois disso o usuário pode
// renomear, recolorir, reordenar, criar e excluir raias livremente.
export const BASE_COLUMNS = [
  { title: "Backlog", color: "neutral" },
  { title: "Andamento", color: "rio" },
  { title: "Concluído", color: "floresta" },
] as const;

export const COLUMN_COLORS = [
  "neutral",
  "floresta",
  "rio",
  "success",
  "warning",
  "error",
  "info",
] as const;

export type ColumnColor = (typeof COLUMN_COLORS)[number];

export const COLUMN_COLOR_LABELS: Record<ColumnColor, string> = {
  neutral: "Cinza",
  floresta: "Floresta",
  rio: "Rio",
  success: "Verde",
  warning: "Âmbar",
  error: "Vermelho",
  info: "Azul",
};

// Classes fixas por cor: o Tailwind v4 não resolve nomes de classe montados
// em tempo de execução, então cada variante precisa aparecer literal aqui.
export const COLUMN_COLOR_DOT: Record<ColumnColor, string> = {
  neutral: "bg-neutral-400",
  floresta: "bg-floresta-500",
  rio: "bg-rio-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
  info: "bg-info-500",
};

export const COLUMN_COLOR_BAR: Record<ColumnColor, string> = {
  neutral: "bg-neutral-400 text-white",
  floresta: "bg-floresta-500 text-white",
  rio: "bg-rio-500 text-white",
  success: "bg-success-500 text-white",
  warning: "bg-warning-500 text-white",
  error: "bg-error-500 text-white",
  info: "bg-info-500 text-white",
};

// Fundo da raia no Kanban: mesma cor escolhida, num tom bem mais claro (e
// discreto no escuro) para não competir com os cards por cima.
export const COLUMN_COLOR_BG: Record<ColumnColor, string> = {
  neutral: "bg-neutral-100/80 dark:bg-neutral-800/40",
  floresta: "bg-floresta-100/80 dark:bg-floresta-950/40",
  rio: "bg-rio-100/80 dark:bg-rio-950/40",
  success: "bg-success-100/80 dark:bg-success-950/40",
  warning: "bg-warning-100/80 dark:bg-warning-950/40",
  error: "bg-error-100/80 dark:bg-error-950/40",
  info: "bg-info-100/80 dark:bg-info-950/40",
};

export function columnColorOf(value: string): ColumnColor {
  return (COLUMN_COLORS as readonly string[]).includes(value)
    ? (value as ColumnColor)
    : "neutral";
}

export const TASK_PRIORITIES = ["baixa", "media", "alta", "urgente"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const TASK_PRIORITY_BADGE: Record<TaskPriority, string> = {
  baixa: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  media: "bg-info-100 text-info-800 dark:bg-info-950 dark:text-info-200",
  alta: "bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-200",
  urgente: "bg-error-100 text-error-800 dark:bg-error-950 dark:text-error-200",
};

export function taskPriorityOf(value: string): TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value)
    ? (value as TaskPriority)
    : "media";
}

// Espaçamento entre posições consecutivas. Posições são float justamente para
// permitir inserir entre dois cards sem reescrever a coluna inteira: a nova
// posição é a média das vizinhas.
export const POSITION_STEP = 1000;
