import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@inova-cumau/supabase/server";

export const metadata: Metadata = {
  title: "Eventos | Inova Cumaú",
};

type EventoResumo = {
  slug: string;
  title: string;
  cover_image_url: string | null;
  tags: string[];
  published_at: string | null;
};

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function getEventos(): Promise<EventoResumo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("slug, title, cover_image_url, tags, published_at")
    .eq("status", "publicado")
    .eq("section", "eventos")
    .order("published_at", { ascending: false });

  return data ?? [];
}

export default async function EventosPage() {
  const eventos = await getEventos();

  return (
    <>
      <PageHeader
        eyebrow="Notícias"
        title="Eventos"
        description="Agenda de encontros, oficinas e imersões do ecossistema Inova Cumaú."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {eventos.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhum evento publicado até o momento.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => (
              <Link key={evento.slug} href={`/noticias/eventos/${evento.slug}`}>
                <Card className="h-full transition-colors hover:ring-foreground/20">
                  {evento.cover_image_url ? (
                    <img
                      src={evento.cover_image_url}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}
                  <CardHeader>
                    {evento.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {evento.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <CardTitle className="mt-2 font-serif text-lg">{evento.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {evento.published_at ? formatData(evento.published_at) : ""}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
