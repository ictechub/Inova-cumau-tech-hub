import type { Metadata } from "next";
import { IconBook } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Revista do investidor | Inova Cumaú",
};

export default function RevistaDoInvestidorPage() {
  return (
    <PagePlaceholder
      icon={IconBook}
      eyebrow="Mídia"
      title="Revista do investidor"
      description="Publicação com dados e oportunidades para quem quer investir na região. Acesso em breve."
    />
  );
}
