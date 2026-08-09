export function formatMatricula(numero: number): string {
  return `#IC${String(numero).padStart(4, "0")}`;
}
