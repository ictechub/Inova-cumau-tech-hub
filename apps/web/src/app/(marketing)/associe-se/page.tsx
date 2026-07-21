import type { Metadata } from "next";
import {
  IconAward,
  IconSchool,
  IconNetwork,
  IconAccessPoint,
  IconShoppingBag,
} from "@tabler/icons-react";

import { MembershipForm } from "@/components/membership-form";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Associe-se | Inova Cumaú",
};

const BENEFITS = [
  {
    icon: IconAccessPoint,
    title: "Visibilidade na mídia própria",
    description:
      "Presença no site, redes sociais, WhatsApp, rádio web e Revista do Investidor da Inova Cumaú.",
  },
  {
    icon: IconShoppingBag,
    title: "Marketplace",
    description:
      "Vitrine para vender produtos e serviços dentro do ecossistema de associados (em construção).",
  },
  {
    icon: IconNetwork,
    title: "Networking",
    description:
      "Conexão direta com outras startups, parceiros, investidores e poder público.",
  },
  {
    icon: IconSchool,
    title: "Capacitação",
    description: "Formação e conteúdo para fortalecer a gestão do seu negócio.",
  },
  {
    icon: IconAward,
    title: "Representação institucional",
    description:
      "Uma associação que fala em nome do ecossistema de inovação amapaense perante poder público e mercado.",
  },
];

export default function AssocieSePage() {
  return (
    <>
      <PageHeader
        eyebrow="Associe-se"
        title="Por que se associar"
        description="Os benefícios de fazer parte do ecossistema Inova Cumaú."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <ul className="space-y-6">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>

          <MembershipForm />
        </div>
      </section>
    </>
  );
}
