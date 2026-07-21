import type { Metadata } from "next";
import { IconSpeakerphone } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Novidades | Inova Cumaú",
};

export default function NovidadesPage() {
  return (
    <PagePlaceholder
      icon={IconSpeakerphone}
      eyebrow="Notícias"
      title="Novidades"
      description="As novidades do ecossistema Inova Cumaú serão publicadas aqui em breve."
    />
  );
}
