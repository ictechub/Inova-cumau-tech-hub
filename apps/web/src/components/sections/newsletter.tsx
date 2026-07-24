import Image from "next/image";

import { NewsletterForm } from "@/components/newsletter-form";

export function Newsletter() {
  return (
    <section id="newsletter" className="px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2">
        <div className="relative order-2 aspect-[16/10] overflow-hidden rounded-2xl lg:order-1">
          <Image
            src="/model-newsletter.png"
            alt="Pessoa trabalhando em notebook em um escritório"
            fill
            className="scale-[1.35] object-cover"
          />
        </div>
        <div className="order-1 mx-auto max-w-2xl text-center lg:order-2 lg:mx-0 lg:text-left">
          <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
            Giro Cumaú
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
            Receba as novidades do ecossistema
          </h2>
          <p className="mt-3 text-muted-foreground">
            Newsletter com as principais notícias de startups, bioeconomia
            <br />
            e investimento no Amapá.
          </p>

          <div className="mt-8 flex justify-center lg:justify-start">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
