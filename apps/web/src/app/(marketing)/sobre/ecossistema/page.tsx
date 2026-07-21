import type { Metadata } from "next";
import {
  IconBuilding,
  IconCpu,
  IconSchool,
  IconBuildingBank,
  IconSpeakerphone,
  IconRocket,
  IconSeedling,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Ecossistema | Inova Cumaú",
};

const PILLARS = [
  {
    icon: IconSeedling,
    title: "Bioeconomia & Floresta",
    description:
      "Negócios que nascem do manejo sustentável da floresta e transformam produtos da sociobiodiversidade amazônica em valor.",
  },
  {
    icon: IconCpu,
    title: "Tecnologia & Startups",
    description:
      "Empresas de base tecnológica que resolvem problemas reais do território com software, hardware e inovação aplicada.",
  },
  {
    icon: IconTrendingUp,
    title: "Negócios & Investimento",
    description:
      "Conexão entre startups associadas e clientes, parceiros comerciais, fundos e investidores de todo o Brasil.",
  },
  {
    icon: IconUsers,
    title: "Comunidade & Território",
    description:
      "Inovação enraizada em Santana e no Amapá, construída com e para quem vive na região.",
  },
  {
    icon: IconSchool,
    title: "Educação Empreendedora",
    description:
      "Capacitação e formação continuada para fortalecer a gestão e o crescimento das startups associadas.",
  },
];

const AUDIENCES = [
  {
    icon: IconRocket,
    title: "Associados atuais",
    message: "Sua startup em rede: aqui você aparece, vende e cresce junto.",
  },
  {
    icon: IconBuilding,
    title: "Potenciais associados",
    message:
      "Filiar-se à Inova Cumaú é colocar seu negócio na vitrine da inovação amazônica.",
  },
  {
    icon: IconTrendingUp,
    title: "Investidores e fundos",
    message:
      "O próximo grande negócio da bioeconomia está no Amapá, e a Inova Cumaú sabe onde.",
  },
  {
    icon: IconBuildingBank,
    title: "Poder público e fomento",
    message:
      "A Inova Cumaú organiza o ecossistema e entrega resultados: empregos, tecnologia e economia verde.",
  },
  {
    icon: IconSpeakerphone,
    title: "Comunidade e imprensa",
    message: "Inovação não é coisa de fora: nasce aqui, em Santana, com a nossa floresta.",
  },
];

export default function EcossistemaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sobre"
        title="Ecossistema"
        description="Territórios de atuação da Inova Cumaú e os públicos que fazem parte desse hub."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-serif text-2xl font-medium sm:text-3xl">
          Onde a Inova Cumaú atua
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="lg:col-span-1">
              <CardHeader>
                <Icon className="size-6 text-primary" />
                <CardTitle className="mt-2">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="font-serif text-2xl font-medium sm:text-3xl">
          Um hub com um lugar para cada um
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, message }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="size-6 text-primary" />
                <CardTitle className="mt-2">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                “{message}”
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
