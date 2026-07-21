import type { Metadata } from "next";
import { IconHelpCircle } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "FAQ | Inova Cumaú",
};

export default function FaqPage() {
  return (
    <PagePlaceholder
      icon={IconHelpCircle}
      eyebrow="Ajuda"
      title="Perguntas frequentes"
      description="Nossa central de perguntas frequentes está em construção."
    />
  );
}
