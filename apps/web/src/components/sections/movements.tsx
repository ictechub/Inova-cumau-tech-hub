import Link from "next/link";
import {
  IconArrowRight,
  IconBell,
  IconCalendar,
  IconFileText,
  IconSpeakerphone,
} from "@tabler/icons-react";

import { LinkCard } from "@/components/link-card";
import { Button } from "@/components/ui/button";

const MOVEMENTS = [
  {
    href: "/noticias/programas-e-editais",
    icon: IconFileText,
    title: "Programas e Editais",
    description: "Editais e programas abertos para startups associadas.",
  },
  {
    href: "/noticias/eventos",
    icon: IconCalendar,
    title: "Eventos",
    description: "Agenda de encontros, feiras e rodadas de negócio.",
  },
  {
    href: "/noticias/novidades",
    icon: IconSpeakerphone,
    title: "Novidades",
    description: "O que está acontecendo no ecossistema agora.",
  },
  {
    href: "/noticias/comunicados",
    icon: IconBell,
    title: "Comunicados",
    description: "Comunicados oficiais da associação.",
  },
];

export function Movements() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
            Notícias
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
            Os movimentos da associação
          </h2>
        </div>
        <Button
          render={<Link href="/noticias" />}
          nativeButton={false}
          variant="ghost"
          className="gap-2 text-rio-700 hover:bg-rio-700/10 hover:text-rio-700"
        >
          Ver todas as notícias
          <IconArrowRight className="transition-transform duration-200 group-hover/button:translate-x-1" />
        </Button>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOVEMENTS.map((item) => (
          <LinkCard key={item.href} {...item} />
        ))}
      </div>
    </section>
  );
}
