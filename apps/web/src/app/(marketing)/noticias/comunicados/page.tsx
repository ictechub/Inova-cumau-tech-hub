import type { Metadata } from "next";
import { IconBell } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Comunicados | Inova Cumaú",
};

export default function ComunicadosPage() {
  return (
    <PagePlaceholder
      icon={IconBell}
      eyebrow="Notícias"
      title="Comunicados"
      description="Os comunicados oficiais da Inova Cumaú serão publicados aqui em breve."
    />
  );
}
