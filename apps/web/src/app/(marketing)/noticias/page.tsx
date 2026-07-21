import type { Metadata } from "next";
import {
  IconBell,
  IconCalendar,
  IconFileText,
  IconSpeakerphone,
  IconNews,
} from "@tabler/icons-react";

import { LinkCard } from "@/components/link-card";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Notícias | Inova Cumaú",
};

const LINKS = [
  {
    href: "/noticias/programas-e-editais",
    icon: IconFileText,
    title: "Programas e Editais",
    description: "Oportunidades abertas para o ecossistema.",
  },
  {
    href: "/noticias/novidades",
    icon: IconSpeakerphone,
    title: "Novidades",
    description: "O que está acontecendo na Inova Cumaú.",
  },
  {
    href: "/noticias/eventos",
    icon: IconCalendar,
    title: "Eventos",
    description: "Agenda de encontros, oficinas e imersões.",
  },
  {
    href: "/noticias/comunicados",
    icon: IconBell,
    title: "Comunicados",
    description: "Comunicados oficiais da associação.",
  },
  {
    href: "/noticias/artigos",
    icon: IconNews,
    title: "Artigos",
    description: "Conteúdos sobre inovação e bioeconomia.",
  },
];

export default function NoticiasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Notícias"
        title="Notícias"
        description="Programas, novidades, eventos, comunicados e artigos do ecossistema Inova Cumaú."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LINKS.map((link) => (
            <LinkCard key={link.href} {...link} />
          ))}
        </div>
      </section>
    </>
  );
}
