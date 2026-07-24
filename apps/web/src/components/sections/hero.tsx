import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white-exception">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[200px] -bottom-[220px] z-0 h-[780px] w-auto opacity-[0.16]"
      >
        <Logo variant="floresta300" className="h-full w-auto" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
          Santana: Cidade das Startups da Amazônia
        </p>
        <h1 className="max-w-3xl font-serif text-4xl leading-tight font-medium text-balance text-floresta-700 sm:text-5xl md:text-6xl">
          Quem inova na Amazônia, inova para o mundo.
        </h1>
        <p className="max-w-2xl text-lg text-neutral-700 sm:text-xl">
          A Inova Cumaú conecta as startups de tecnologia e bioeconomia do Amapá a
          clientes, parceiros e investidores.
        </p>
        <div className="mt-4 flex flex-col gap-1.5 sm:flex-row">
          <Button
            render={<Link href="/associe-se" />}
            nativeButton={false}
            size="lg"
            className="h-11 gap-2 px-6"
          >
            Associe-se
            <IconArrowRight className="transition-transform duration-200 group-hover/button:translate-x-1" />
          </Button>
          <Button
            render={<Link href="/sobre/ecossistema" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="h-11 border-[1.5px] border-rio-700 bg-transparent px-6 text-rio-700 hover:bg-rio-700/10 hover:text-rio-700"
          >
            Conheça o ecossistema
          </Button>
        </div>
      </div>
    </section>
  );
}
