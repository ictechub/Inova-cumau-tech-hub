import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quem somos | Inova Cumaú",
};

export default function QuemSomosPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <div>
          <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
            Sobre
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">Quem somos</h1>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-secondary-foreground sm:text-lg">
          <p>
            <strong className="text-foreground">Cumaú</strong> é uma referência ao
            cumaru, árvore nativa da Amazônia, madeira resistente, essência que vira
            perfume, semente que vira remédio. Um só organismo com múltiplos usos e
            valor em cada parte dele. É essa a lógica da nossa associação: startups de
            tecnologia e bioeconomia diferentes entre si, mas enraizadas no mesmo
            território e crescendo juntas.
          </p>
          <p>
            A Inova Cumaú existe para organizar o ecossistema de inovação do Amapá,
            conectando startups associadas a clientes, parceiros, investidores, poder
            público e imprensa através de uma rede de comunicação própria (site, redes
            sociais, WhatsApp, rádio web e a Revista do Investidor).
          </p>
          <p>
            Estamos sediados em <strong className="text-foreground">Santana</strong>,
            município portuário vizinho de Macapá que funciona como polo logístico da
            Amazônia Oriental, base natural para quem produz e comercializa a partir
            da floresta. É essa vocação que dá nome à nossa tagline: Santana, Cidade
            das Startups da Amazônia.
          </p>
        </div>
      </div>
    </section>
  );
}
