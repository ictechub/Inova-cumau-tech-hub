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
    description: "A origem do nome Cumaú e a missão da associação.",
  },
  {
    href: "/sobre/equipe",
    icon: IconUsers,
    title: "Equipe",
    description: "Quem está à frente da Inova Cumaú.",
  },
  {
    href: "/sobre/ecossistema",
    icon: IconNetwork,
    title: "Ecossistema",
    description: "Territórios de atuação e públicos do hub.",
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
