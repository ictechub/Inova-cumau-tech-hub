export function formatProjectCode(numero: number): string {
  return `#PRJ${String(numero).padStart(4, "0")}`;
}
