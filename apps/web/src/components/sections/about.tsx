import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

export function About() {
  return (
    <section className="bg-rio-100 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
              Sobre
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
              O que é a Inova Cumaú
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-rio-700 sm:text-lg">
            <p>
              A <strong className="text-foreground">Inova Cumaú</strong> é a associação
              que organiza o ecossistema de inovação do Amapá: startups de tecnologia e
              bioeconomia diferentes entre si, mas enraizadas no mesmo território e
              crescendo juntas.
            </p>
            <p>
              Conectamos startups associadas a clientes, parceiros, investidores, poder
              público e imprensa, a partir de Santana, o polo logístico da Amazônia.
            </p>
            <Button
              render={<Link href="/sobre/quem-somos" />}
              nativeButton={false}
              variant="ghost"
              className="gap-2 text-rio-700 hover:bg-rio-700/10 hover:text-rio-700"
            >
              Conheça nossa história
              <IconArrowRight className="transition-transform duration-200 group-hover/button:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
