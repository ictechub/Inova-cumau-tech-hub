import type { Metadata } from "next";
import { IconBook, IconAccessPoint, IconBuildingStore, IconVideo } from "@tabler/icons-react";

import { LinkCard } from "@/components/link-card";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Mídia | Inova Cumaú",
};

const LINKS = [
  {
    href: "/midia/vitrine-de-startups",
    icon: IconBuildingStore,
    title: "Vitrine de Startups",
    description: "Conheça as startups associadas ao ecossistema.",
  },
  {
    href: "/midia/revista-do-investidor",
    icon: IconBook,
    title: "Revista do investidor",
    description: "Dados e oportunidades para quem quer investir na região.",
  },
  {
    href: "/midia/radio-web",
    icon: IconAccessPoint,
    title: "Rádio Web",
    description: "A história da inovação amazônica em áudio.",
  },
  {
    href: "/midia/canal-youtube",
    icon: IconVideo,
    title: "Youtube",
    description: "Entrevistas, eventos e conteúdo em vídeo.",
  },
];

export default function MidiaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mídia"
        title="Mídia"
        description="A rede de comunicação própria da Inova Cumaú."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {LINKS.map((link) => (
            <LinkCard key={link.href} {...link} />
          ))}
        </div>
      </section>
    </>
  );
}
