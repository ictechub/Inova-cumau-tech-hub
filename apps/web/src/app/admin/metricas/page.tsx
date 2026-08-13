import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IconActivity, IconTrendingUp, IconUsers } from "@tabler/icons-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createAdminClient } from "@inova-cumau/supabase/admin";
import { createClient } from "@inova-cumau/supabase/server";
import { BusinessMapCard, type CityPoint } from "@/components/business-map-card";
import { geocodeCidade } from "@/lib/br-geocode";
import { getPlatformRole, isPlatformAdmin } from "@/lib/user-role";

export const metadata: Metadata = {
  title: "Métricas | Admin | Inova Cumaú",
};

// Janela usada para considerar uma conta "ativa" (dias desde o último login).
const ACTIVE_WINDOW_DAYS = 30;

const numberFormatter = new Intl.NumberFormat("pt-BR");
const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

async function getContagens(supabase: Awaited<ReturnType<typeof createClient>>) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ count: total }, { count: novosNoMes }] = await Promise.all([
    supabase
      .from("startup_registrations")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("startup_registrations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
  ]);

  return { total: total ?? 0, novosNoMes: novosNoMes ?? 0 };
}

// Retorna null quando a service role key não está configurada ou quando a
// API admin do Supabase falha; o card de contas ativas degrada para um
// estado "não disponível" em vez de derrubar a página inteira (ver
// apps/web/.env.example).
async function getContasAtivas() {
  const admin = createAdminClient();
  if (!admin) return null;

  const activeSince = new Date(
    Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
  const perPage = 200;
  let page = 1;
  let ativas = 0;

  try {
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;

      ativas += data.users.filter(
        (u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= activeSince,
      ).length;

      if (data.users.length < perPage) break;
      page += 1;
    }
  } catch (error) {
    console.error("Falha ao buscar contas ativas via admin.listUsers:", error);
    return null;
  }

  return ativas;
}

// Agrupa startup_registrations por cidade/UF e geocodifica via
// br-geocode. Registros sem cidade/UF reconhecíveis são descartados
// silenciosamente; o card recebe só o que tem localização confiável.
async function getNegociosPorLocalidade(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<CityPoint[]> {
  const { data } = await supabase
    .from("startup_registrations")
    .select("contato_cidade, contato_estado");

  const counts = new Map<string, { city: string; state: string; count: number }>();

  for (const row of data ?? []) {
    const cidade = row.contato_cidade?.trim();
    if (!cidade) continue;
    const uf = row.contato_estado?.trim() || null;
    const key = `${uf ?? ""}|${cidade.toUpperCase()}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { city: cidade, state: uf ?? "", count: 1 });
    }
  }

  const points: CityPoint[] = [];
  for (const { city, state, count } of counts.values()) {
    const coords = geocodeCidade(city, state || null);
    if (!coords) continue;
    points.push({ city, state, count, coordinates: coords });
  }

  return points;
}

export default async function MetricasPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/entrar");
  }

  const [{ data: registration }, role] = await Promise.all([
    supabase
      .from("startup_registrations")
      .select("responsavel_nome, responsavel_email, avatar_url")
      .eq("user_id", authUser.id)
      .single(),
    getPlatformRole(supabase, authUser.id),
  ]);

  if (!isPlatformAdmin(role) && role !== "consultor") {
    redirect("/area-do-associado");
  }

  const user = {
    name: registration?.responsavel_nome ?? "Associado",
    email: registration?.responsavel_email ?? authUser.email ?? "",
    avatar: registration?.avatar_url ?? "",
    role,
  };

  const [{ total, novosNoMes }, contasAtivas, negociosPorLocalidade] =
    await Promise.all([
      getContagens(supabase),
      getContasAtivas(),
      getNegociosPorLocalidade(supabase),
    ]);

  const taxaCrescimento = total > 0 ? (novosNoMes / total) * 100 : 0;
  const percentContasAtivas =
    contasAtivas !== null && total > 0 ? (contasAtivas / total) * 100 : 0;

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <span>Dashboard</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Métricas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <IconUsers className="size-4" />
                  Associados cadastrados
                </CardDescription>
                <CardTitle className="font-sans! text-3xl font-semibold tabular-nums">
                  {numberFormatter.format(total)}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="gap-1">
                    <IconTrendingUp />
                    {`+${percentFormatter.format(taxaCrescimento)}%`}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 border-t-0 bg-transparent px-(--card-spacing) pt-0 pb-(--card-spacing) text-sm">
                <div className="line-clamp-1 flex items-center gap-2 font-medium">
                  {`+${numberFormatter.format(novosNoMes)} este mês`}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Total de startups associadas à Inova Cumaú
                </div>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <IconTrendingUp className="size-4" />
                  Taxa de crescimento (mês atual)
                </CardDescription>
                <CardTitle className="font-sans! text-3xl font-semibold tabular-nums">
                  {percentFormatter.format(taxaCrescimento)}%
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="gap-1">
                    <IconUsers />
                    {`+${numberFormatter.format(novosNoMes)}`}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 border-t-0 bg-transparent px-(--card-spacing) pt-0 pb-(--card-spacing) text-sm">
                <div className="line-clamp-1 flex items-center gap-2 font-medium">
                  {`${numberFormatter.format(novosNoMes)} cadastros este mês`}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Percentual de associados que entraram no mês atual
                </div>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <IconActivity className="size-4" />
                  {`Contas ativas (últimos ${ACTIVE_WINDOW_DAYS} dias)`}
                </CardDescription>
                <CardTitle className="font-sans! text-3xl font-semibold tabular-nums">
                  {contasAtivas === null
                    ? "—"
                    : numberFormatter.format(contasAtivas)}
                </CardTitle>
                {contasAtivas !== null && (
                  <CardAction>
                    <Badge variant="outline" className="gap-1">
                      <IconActivity />
                      {`${percentFormatter.format(percentContasAtivas)}%`}
                    </Badge>
                  </CardAction>
                )}
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 border-t-0 bg-transparent px-(--card-spacing) pt-0 pb-(--card-spacing) text-sm">
                {contasAtivas === null ? (
                  <>
                    <div className="line-clamp-1 font-medium">
                      Métrica indisponível
                    </div>
                    <div className="text-muted-foreground">
                      Confirme se SUPABASE_SERVICE_ROLE_KEY está configurada
                      ou tente novamente mais tarde.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="line-clamp-1 flex items-center gap-2 font-medium">
                      {`${numberFormatter.format(contasAtivas)} de ${numberFormatter.format(total)} associados ativos`}
                      <IconActivity className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      {`Login nos últimos ${ACTIVE_WINDOW_DAYS} dias`}
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
          <BusinessMapCard cities={negociosPorLocalidade} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
