import type { Metadata } from "next";
import { IconBuildingStore } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Vitrine de Startups | Inova Cumaú",
};

export default function VitrineDeStartupsPage() {
  return (
    <PagePlaceholder
      icon={IconBuildingStore}
      eyebrow="Mídia"
      title="Vitrine de Startups"
      description="A vitrine de startups associadas à Inova Cumaú está em construção."
    />
  );
}
