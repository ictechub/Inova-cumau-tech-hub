import type { Metadata } from "next";
import { IconCalendar } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Eventos | Inova Cumaú",
};

export default function EventosPage() {
  return (
    <PagePlaceholder
      icon={IconCalendar}
      eyebrow="Notícias"
      title="Eventos"
      description="A agenda de eventos da Inova Cumaú está em construção."
    />
  );
}
