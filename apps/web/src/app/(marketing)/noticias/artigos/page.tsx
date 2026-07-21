import type { Metadata } from "next";
import { IconNews } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Artigos | Inova Cumaú",
};

export default function ArtigosPage() {
  return (
    <PagePlaceholder
      icon={IconNews}
      eyebrow="Notícias"
      title="Artigos"
      description="Artigos e conteúdos sobre inovação, bioeconomia e tecnologia na Amazônia estão em construção."
    />
  );
}
