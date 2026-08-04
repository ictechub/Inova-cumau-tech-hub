import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quem somos | Inova Cumaú",
};

export default function QuemSomosPage() {
  return (
    <>
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
              No fundo do Igarapé da Fortaleza, em{" "}
              <strong className="text-foreground">Santana</strong>, ainda restam vestígios
              de um forte erguido em 1632 por ingleses, com apoio de povos indígenas
              Nheengaíbas, Aruãs e Tucujus, para guardar o que a floresta produzia. É a
              mais antiga fortificação já documentada no atual Amapá, construída mais de
              um século antes da Fortaleza de São José, em Macapá, e disputada depois por
              portugueses e franceses, até restarem só ruínas. Chamava-se{" "}
              <strong className="text-foreground">Forte Cumaú</strong>. É desse território,
              ocupado e reinventado à beira da floresta há quase quatro séculos, que vem o
              nome da nossa associação.
            </p>
            <p>
              A Inova Cumaú existe para organizar o ecossistema de inovação do Amapá,
              conectando startups associadas a clientes, parceiros, investidores, poder
              público e imprensa através de uma rede de comunicação própria (site, redes
              sociais, WhatsApp e a Revista do Investidor).
            </p>
            <p>
              Estamos sediados em Santana, município portuário vizinho de Macapá que
              funciona como polo logístico da Amazônia Oriental, base natural para quem
              produz e comercializa a partir da floresta. É essa vocação que dá nome à
              nossa tagline: Santana, Cidade das Startups da Amazônia.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-rio-100 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
              Visão
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
              Da floresta para o mercado global
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-rio-700 sm:text-lg">
            <p>
              Ser a ponte entre a inteligência da floresta e a economia digital: a voz
              que ressoa quando e como a floresta ganha o mercado global. É essa ideia que
              dá sentido à nossa tagline, Santana, Cidade das Startups da Amazônia, e ao
              papel que a Inova Cumaú assume dentro do ecossistema.
            </p>
            <p>
              Não se trata de substituir o conhecimento que já existe no território, mas
              de traduzi-lo em produtos, serviços e negócios capazes de circular além da
              região. Quem inova na Amazônia, inova para o mundo, e é por isso que
              trabalhamos para que cada startup associada, de tecnologia ou de
              bioeconomia, encontre nessa ponte o caminho até clientes, parceiros e
              investidores que normalmente estariam fora de alcance.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
              Missão
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
              Visibilidade, negócios e investimento
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-secondary-foreground sm:text-lg">
            <p>
              Dar visibilidade local, nacional e global às startups de tecnologia e
              bioeconomia do Amapá, gerar negócios e atrair investimentos para elas, e
              consolidar a Inova Cumaú como referência em inovação amazônica na região.
            </p>
            <p>
              Isso significa colocar essas startups em contato direto com clientes,
              parceiros, investidores, poder público e imprensa, através de canais de
              comunicação próprios como o site, as redes sociais, o WhatsApp e a Revista
              do Investidor. A Inova Cumaú conecta as startups de tecnologia e
              bioeconomia do Amapá a clientes, parceiros e investidores, para que o valor
              gerado dentro da floresta chegue até quem pode transformá-lo em negócio,
              dentro e fora do Amapá.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
