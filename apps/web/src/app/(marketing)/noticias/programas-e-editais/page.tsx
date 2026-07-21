import type { Metadata } from "next";
import { IconFileText } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Programas e Editais | Inova Cumaú",
};

export default function ProgramasEEditaisPage() {
  return (
    <PagePlaceholder
      icon={IconFileText}
      eyebrow="Notícias"
      title="Programas e Editais"
      description="A listagem de programas e editais abertos para o ecossistema está em construção."
    />
  );
}
