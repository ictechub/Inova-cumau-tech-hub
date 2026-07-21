import type { Metadata } from "next";
import { IconNews } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Blog | Inova Cumaú",
};

export default function BlogPage() {
  return (
    <PagePlaceholder
      icon={IconNews}
      eyebrow="Conteúdo"
      title="Blog"
      description="O blog da Inova Cumaú está em construção."
    />
  );
}
