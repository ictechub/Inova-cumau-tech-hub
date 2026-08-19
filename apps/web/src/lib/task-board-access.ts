import type { createAdminClient } from "@inova-cumau/supabase/admin";
import type { Database } from "@inova-cumau/supabase";
import { isPlatformAdmin, type PlatformRole } from "@/lib/user-role";

export type BoardAccessLevel = "total" | "editar" | "ver" | "nenhum";
type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

type Board = Pick<
  Database["public"]["Tables"]["task_boards"]["Row"],
  "id" | "owner_id" | "link_access_scope" | "link_access_permission"
>;

// Mesma cascata "chefe direto + pares" usada em lib/project-access.ts: o
// gestor direto do dono e os pares do dono (mesmo reports_to) ganham acesso
// de editar automaticamente, sem linha em task_board_permissions. A cadeia
// não sobe além do gestor direto.
async function isManagerOrPeerOfOwner(db: AdminClient, userId: string, ownerId: string) {
  if (userId === ownerId) return false;

  const { data: ownerMembership } = await db
    .from("team_members")
    .select("reports_to")
    .eq("user_id", ownerId)
    .maybeSingle();

  if (!ownerMembership?.reports_to) return false;

  if (ownerMembership.reports_to === userId) return true;

  const { data: callerMembership } = await db
    .from("team_members")
    .select("reports_to")
    .eq("user_id", userId)
    .maybeSingle();

  return callerMembership?.reports_to === ownerMembership.reports_to;
}

export async function getBoardAccessLevel(
  db: AdminClient,
  userId: string,
  callerRole: PlatformRole,
  board: Board,
): Promise<BoardAccessLevel> {
  if (isPlatformAdmin(callerRole)) return "total";

  if (board.owner_id === userId) return "total";

  if (await isManagerOrPeerOfOwner(db, userId, board.owner_id)) return "editar";

  const { data: permission } = await db
    .from("task_board_permissions")
    .select("permission")
    .eq("board_id", board.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (permission?.permission === "editar" || permission?.permission === "compartilhar") {
    return "editar";
  }
  if (permission?.permission === "ver") return "ver";

  if (board.link_access_scope === "equipe") {
    return board.link_access_permission === "editar" ? "editar" : "ver";
  }

  return "nenhum";
}

export function canEditBoard(level: BoardAccessLevel) {
  return level === "total" || level === "editar";
}
