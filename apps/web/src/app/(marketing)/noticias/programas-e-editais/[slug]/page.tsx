import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { generateHTML } from "@tiptap/core";
import { IconArrowLeft } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@inova-cumau/supabase/server";
import { tiptapExtensions } from "@/lib/tiptap-extensions";

type ProgramaDetalhe = {
  title: string;
  content: unknown;
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

async function getPrograma(slug: string): Promise<ProgramaDetalhe | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("title, content, cover_image_url, tags, published_at")
    .eq("slug", slug)
    .eq("status", "publicado")
    .eq("section", "programas-e-editais")
    .maybeSingle();

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const programa = await getPrograma(slug);

  if (!programa) return { title: "Programa ou Edital | Inova Cumaú" };

  return { title: `${programa.title} | Inova Cumaú` };
}

export default async function ProgramaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const programa = await getPrograma(slug);

  if (!programa) notFound();

  const html = generateHTML(
    (programa.content as Record<string, unknown>) ?? { type: "doc", content: [] },
    tiptapExtensions,
  );

  return (
    <article className="mx-auto max-w-2xl px-4 pt-16 pb-20 sm:px-6">
      <Link
        href="/noticias/programas-e-editais"
        className="inline-flex items-center gap-1 text-xs font-bold tracking-widest text-rio-700 uppercase"
      >
        <IconArrowLeft className="size-3.5" />
        Programas e Editais
      </Link>

      <h1 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">{programa.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {programa.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
        {programa.published_at ? (
          <span className="text-sm text-muted-foreground">{formatData(programa.published_at)}</span>
        ) : null}
      </div>

      {programa.cover_image_url ? (
        <img
          src={programa.cover_image_url}
          alt=""
          className="mt-8 aspect-video w-full rounded-xl object-cover"
        />
      ) : null}

      <div
        className="prose-content mt-8 text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_h1]:mt-8 [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-medium [&_h2]:mt-6 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-medium [&_h3]:mt-4 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-medium [&_img]:my-4 [&_img]:w-full [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_p]:leading-relaxed [&_ul:not([data-type='taskList'])]:list-disc [&_ul:not([data-type='taskList'])]:pl-6 [&_video]:my-4 [&_video]:w-full [&_video]:rounded-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
