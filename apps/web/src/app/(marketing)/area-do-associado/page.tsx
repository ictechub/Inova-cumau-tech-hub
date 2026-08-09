import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconArticle,
  IconCalendarEvent,
  IconSpeakerphone,
} from "@tabler/icons-react";

import { NavAssociado } from "@/components/nav-associado";
import { createClient } from "@inova-cumau/supabase/server";
import { getPlatformRole } from "@/lib/user-role";

import { BannerCarousel } from "./banner-carousel";

const NOVIDADES = [
  {
    imageClass: "bg-floresta-800",
    Icon: IconArticle,
    title: "Artigos da semana",
    description:
      "Tecnologia, bioeconomia e inovação: as leituras selecionadas para associados nesta semana.",
    primary: { href: "#", label: "Ver artigos" },
    secondary: { href: "#", label: "Mais recentes" },
  },
  {
    imageClass: "bg-rio-700",
    Icon: IconCalendarEvent,
    title: "Próximos eventos",
    description:
      "Editais abertos, encontros presenciais e agenda de oportunidades do ecossistema do Amapá.",
    primary: { href: "#", label: "Ver agenda" },
    secondary: { href: "#", label: "Todos os eventos" },
  },
  {
    imageClass: "bg-floresta-700",
    Icon: IconSpeakerphone,
    title: "Últimos avisos",
    description:
      "Comunicados e atualizações recentes da Inova Cumaú para os associados.",
    primary: { href: "#", label: "Ler avisos" },
    secondary: { href: "#", label: "Arquivo" },
  },
];

export const metadata: Metadata = {
  title: "Área do associado | Inova Cumaú",
};

export default async function AreaDoAssociadoPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/entrar");
  }

  const role = await getPlatformRole(supabase, authUser.id);

  if (role !== "associado") {
    redirect("/admin");
  }

  const { data: registration } = await supabase
    .from("startup_registrations")
    .select("responsavel_nome")
    .eq("user_id", authUser.id)
    .single();

  const nome =
    registration?.responsavel_nome?.trim().split(/\s+/)[0] ?? "Associado";

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <NavAssociado />
        </aside>
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-medium">
            Boas-vindas, {nome}
          </h1>

          <BannerCarousel />

          <div className="mt-10">
            <h2 className="font-serif text-xl font-medium">Novidades</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {NOVIDADES.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col overflow-hidden rounded-lg bg-muted/30"
                >
                  <div
                    className={`flex h-32 items-center justify-center ${item.imageClass}`}
                  >
                    <item.Icon className="size-12 text-white/30" aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="flex-1 text-[13px] leading-snug text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="mt-1 flex items-center gap-4 text-[13px] font-medium">
                      <Link
                        href={item.primary.href}
                        className="text-primary hover:underline"
                      >
                        {item.primary.label}
                      </Link>
                      <Link
                        href={item.secondary.href}
                        className="text-muted-foreground hover:underline"
                      >
                        {item.secondary.label}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
