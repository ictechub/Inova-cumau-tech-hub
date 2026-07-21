import type { Metadata } from "next";
import { IconFolderDown } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Press kit | Inova Cumaú",
};

export default function PressKitPage() {
  return (
    <PagePlaceholder
      icon={IconFolderDown}
      eyebrow="Mídia"
      title="Press kit"
      description="Logos, imagens e materiais oficiais para a imprensa. Em construção."
    />
  );
}
