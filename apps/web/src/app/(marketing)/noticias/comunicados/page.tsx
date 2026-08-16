import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@inova-cumau/supabase/server";

export const metadata: Metadata = {
  title: "Comunicados | Inova Cumaú",
};

type ComunicadoResumo = {
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

async function getComunicados(): Promise<ComunicadoResumo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("slug, title, cover_image_url, tags, published_at")
    .eq("status", "publicado")
    .eq("section", "comunicados")
    .order("published_at", { ascending: false });

  return data ?? [];
}

export default async function ComunicadosPage() {
  const comunicados = await getComunicados();

  return (
    <>
      <PageHeader
        eyebrow="Notícias"
        title="Comunicados"
        description="Comunicados oficiais da Inova Cumaú."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {comunicados.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhum comunicado publicado até o momento.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comunicados.map((comunicado) => (
              <Link key={comunicado.slug} href={`/noticias/comunicados/${comunicado.slug}`}>
                <Card className="h-full transition-colors hover:ring-foreground/20">
                  {comunicado.cover_image_url ? (
                    <img
                      src={comunicado.cover_image_url}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}
                  <CardHeader>
                    {comunicado.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {comunicado.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <CardTitle className="mt-2 font-serif text-lg">{comunicado.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {comunicado.published_at ? formatData(comunicado.published_at) : ""}
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
