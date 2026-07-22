import type { Metadata } from "next";
import { IconNetwork, IconUserCircle, IconUsers } from "@tabler/icons-react";

import { LinkCard } from "@/components/link-card";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Sobre | Inova Cumaú",
};

const LINKS = [
  {
    href: "/sobre/quem-somos",
    icon: IconUserCircle,
    title: "Quem somos",
    description: "Origem e missão.",
  },
  {
    href: "/sobre/equipe",
    icon: IconUsers,
    title: "Equipe",
    description: "Quem está à frente.",
  },
  {
    href: "/sobre/ecossistema",
    icon: IconNetwork,
    title: "Ecossistema",
    description: "Território e públicos.",
  },
];

export default function SobrePage() {
  return (
    <>
      <PageHeader
        eyebrow="Sobre"
        title="Sobre a Inova Cumaú"
        description="Conheça quem somos, quem está à frente e como o ecossistema se organiza."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {LINKS.map((link) => (
            <LinkCard key={link.href} {...link} />
          ))}
        </div>
      </section>
    </>
  );
}
