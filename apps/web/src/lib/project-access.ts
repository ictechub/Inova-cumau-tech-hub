import type { createAdminClient } from "@inova-cumau/supabase/admin";
import type { Database } from "@inova-cumau/supabase";
import { isPlatformAdmin, type PlatformRole } from "@/lib/user-role";

export type ProjectAccessLevel = "total" | "editar" | "ver" | "nenhum";
type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

type Project = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  "id" | "owner_id" | "link_access_scope" | "link_access_permission"
>;

// Cascata "chefe direto + pares": ao criar um projeto, o gestor direto do
// dono e os pares do dono (mesmo reports_to) ganham acesso de editar,
// automaticamente, sem precisar de linha em project_permissions. A cadeia
// não sobe além do gestor direto.
async function isManagerOrPeerOfOwner(
  db: AdminClient,
  userId: string,
  ownerId: string,
) {
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

// Bulk-equivalent de isManagerOrPeerOfOwner: em vez de checar um projeto por
// vez, devolve todo owner_id sobre o qual userId tem acesso de cascata
// "chefe direto + pares", para a listagem buscar todos os projetos visíveis
// numa única consulta em vez de uma chamada a getProjectAccessLevel por
// linha.
export async function getCascadeOwnerIds(db: AdminClient, userId: string) {
  const { data: ownMembership } = await db
    .from("team_members")
    .select("reports_to")
    .eq("user_id", userId)
    .maybeSingle();

  const [{ data: directReports }, { data: peers }] = await Promise.all([
    db.from("team_members").select("user_id").eq("reports_to", userId),
    ownMembership?.reports_to
      ? db
          .from("team_members")
          .select("user_id")
          .eq("reports_to", ownMembership.reports_to)
      : Promise.resolve({ data: [] as { user_id: string }[] }),
  ]);

  const ownerIds = new Set<string>();
  for (const row of directReports ?? []) ownerIds.add(row.user_id);
  for (const row of peers ?? []) ownerIds.add(row.user_id);
  ownerIds.delete(userId);

  return [...ownerIds];
}

export async function getProjectAccessLevel(
  db: AdminClient,
  userId: string,
  callerRole: PlatformRole,
  project: Project,
): Promise<ProjectAccessLevel> {
  if (isPlatformAdmin(callerRole)) return "total";

  if (project.owner_id === userId) return "total";

  if (await isManagerOrPeerOfOwner(db, userId, project.owner_id)) return "editar";

  const { data: permission } = await db
    .from("project_permissions")
    .select("permission")
    .eq("project_id", project.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (permission?.permission === "editar" || permission?.permission === "compartilhar") {
    return "editar";
  }
  if (permission?.permission === "ver") return "ver";

  if (project.link_access_scope === "equipe") {
    return project.link_access_permission === "editar" ? "editar" : "ver";
  }

  return "nenhum";
}
