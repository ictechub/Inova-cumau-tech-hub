import type { Metadata } from "next";
import { IconMicrophone } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Podcast | Inova Cumaú",
};

export default function PodcastPage() {
  return (
    <PagePlaceholder
      icon={IconMicrophone}
      eyebrow="Mídia"
      title="Podcast"
      description="Conversas sobre inovação e bioeconomia na Amazônia. Em construção."
    />
  );
}
