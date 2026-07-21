import type { Metadata } from "next";
import { IconBrandInstagram } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Instagram | Inova Cumaú",
};

export default function InstagramPage() {
  return (
    <PagePlaceholder
      icon={IconBrandInstagram}
      eyebrow="Mídia"
      title="Instagram"
      description="Bastidores do ecossistema de inovação. Em construção."
    />
  );
}
