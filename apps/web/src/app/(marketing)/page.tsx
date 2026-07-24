import { IconHeartHandshake, IconNews, IconAccessPoint, IconUsers } from "@tabler/icons-react";

import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Offers } from "@/components/sections/offers";
import { Movements } from "@/components/sections/movements";
import { Newsletter } from "@/components/sections/newsletter";
import { LinkCard } from "@/components/link-card";

const HUBS = [
  {
    href: "/sobre",
    icon: IconUsers,
    title: "Sobre",
    description: "Quem somos, a equipe e o ecossistema.",
  },
  {
    href: "/noticias",
    icon: IconNews,
    title: "Notícias",
    description: "Programas, editais, eventos e novidades.",
  },
  {
    href: "/midia",
    icon: IconAccessPoint,
    title: "Mídia",
    description: "Startups, revista e canal Youtube.",
  },
  {
    href: "/parceiros",
    icon: IconHeartHandshake,
    title: "Parceiros",
    description: "Quem apoia o ecossistema Inova Cumaú.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Offers />
      <section className="bg-floresta-100 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
                Portal
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
                O que você encontra por aqui
              </h2>
              <p className="mt-3 text-muted-foreground">
                Um hub com tudo o que você precisa para acompanhar e participar
                do ecossistema Inova Cumaú.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {HUBS.map((hub) => (
                <LinkCard key={hub.href} {...hub} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <Movements />
      <Newsletter />
    </>
  );
}
