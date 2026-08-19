export function formatBoardCode(numero: number): string {
  return `#QDR${String(numero).padStart(4, "0")}`;
}

export function formatTaskCode(numero: number): string {
  return `#TSK${String(numero).padStart(4, "0")}`;
}
