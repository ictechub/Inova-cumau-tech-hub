import { NewsletterForm } from "@/components/newsletter-form";

export function Newsletter() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-12">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-bold tracking-widest uppercase opacity-80">
            Giro Cumaú
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
            Receba as novidades do ecossistema
          </h2>
          <p className="mt-3 opacity-90">
            Newsletter com as principais notícias de startups, bioeconomia e
            investimento no Amapá.
          </p>

          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
