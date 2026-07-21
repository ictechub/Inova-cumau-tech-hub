import type { Metadata } from "next";
import { IconGavel } from "@tabler/icons-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Jurídico | Inova Cumaú",
};

export default function JuridicoPage() {
  return (
    <PagePlaceholder
      icon={IconGavel}
      eyebrow="Sobre"
      title="Jurídico"
      description="O estatuto e os documentos legais da associação estão em construção."
    />
  );
}
