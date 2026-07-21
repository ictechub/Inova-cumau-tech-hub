import Link from "next/link";
import {
  IconAccessPoint,
  IconArrowRight,
  IconAward,
  IconCertificate,
  IconShoppingBag,
  IconTrendingUp,
  IconUsersGroup,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OFFERS = [
  {
    icon: IconAccessPoint,
    title: "Visibilidade na mídia",
    description:
      "Presença no site, redes sociais, WhatsApp, rádio web e Revista do Investidor.",
  },
  {
    icon: IconShoppingBag,
    title: "Vitrini de Startups",
    description:
      "Vitrine que apresenta as Startups, seus produtos e serviços dentro do ecossistema de associados.",
  },
  {
    icon: IconUsersGroup,
    title: "Networking",
    description:
      "Conexão direta com outras startups, parceiros, investidores e poder público.",
  },
  {
    icon: IconCertificate,
    title: "Capacitação",
    description: "Formação e conteúdo para fortalecer a gestão do seu negócio.",
  },
  {
    icon: IconAward,
    title: "Representação institucional",
    description:
      "Uma associação que fala em nome do ecossistema perante poder público e mercado.",
  },
  {
    icon: IconTrendingUp,
    title: "Tendências do ecossistema",
    description:
      "Conteúdo sobre o que acontece em bioeconomia, tecnologia, empreendedorismo e inovação.",
  },
];

export function Offers() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
              Associe-se
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
              O que a associação oferece
            </h2>
          </div>
          <Button
            render={<Link href="/associe-se" />}
            nativeButton={false}
            variant="ghost"
            className="hidden gap-2 sm:inline-flex"
          >
            Ver todos os benefícios
            <IconArrowRight className="transition-transform duration-200 group-hover/button:translate-x-1" />
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-none bg-transparent ring-0">
              <CardHeader>
                <Icon className="size-6 text-primary" aria-hidden />
                <CardTitle className="mt-2">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          render={<Link href="/associe-se" />}
          nativeButton={false}
          variant="ghost"
          className="mt-8 flex w-full gap-2 sm:hidden"
        >
          Ver todos os benefícios
          <IconArrowRight className="transition-transform duration-200 group-hover/button:translate-x-1" />
        </Button>
      </div>
    </section>
  );
}
