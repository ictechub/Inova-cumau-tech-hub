import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@inova-cumau/supabase/server";

export const metadata: Metadata = {
  title: "Novidades | Inova Cumaú",
};

type NovidadeResumo = {
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

async function getNovidades(): Promise<NovidadeResumo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("slug, title, cover_image_url, tags, published_at")
    .eq("status", "publicado")
    .eq("section", "novidades")
    .order("published_at", { ascending: false });

  return data ?? [];
}

export default async function NovidadesPage() {
  const novidades = await getNovidades();

  return (
    <>
      <PageHeader
        eyebrow="Notícias"
        title="Novidades"
        description="O que está acontecendo no ecossistema Inova Cumaú."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {novidades.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma novidade publicada até o momento.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {novidades.map((novidade) => (
              <Link key={novidade.slug} href={`/noticias/novidades/${novidade.slug}`}>
                <Card className="h-full transition-colors hover:ring-foreground/20">
                  {novidade.cover_image_url ? (
                    <img
                      src={novidade.cover_image_url}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}
                  <CardHeader>
                    {novidade.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {novidade.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <CardTitle className="mt-2 font-serif text-lg">{novidade.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {novidade.published_at ? formatData(novidade.published_at) : ""}
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
