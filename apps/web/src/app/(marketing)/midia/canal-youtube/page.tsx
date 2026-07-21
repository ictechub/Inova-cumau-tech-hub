import type { Metadata } from "next";
import { IconBrandYoutube } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Youtube | Inova Cumaú",
};

export default function CanalYoutubePage() {
  return (
    <PagePlaceholder
      icon={IconBrandYoutube}
      eyebrow="Mídia"
      title="Youtube"
      description="Entrevistas, eventos e conteúdo sobre inovação na Amazônia. Canal em construção."
    />
  );
}
