import type { Metadata } from "next";
import { IconAccessPoint } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Rádio Web | Inova Cumaú",
};

export default function RadioWebPage() {
  return (
    <PagePlaceholder
      icon={IconAccessPoint}
      eyebrow="Mídia"
      title="Rádio Web"
      description="Uma rádio para contar a história da inovação amazônica. No ar em breve."
    />
  );
}
