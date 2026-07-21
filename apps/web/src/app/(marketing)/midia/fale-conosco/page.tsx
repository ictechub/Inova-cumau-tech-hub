import type { Metadata } from "next";
import { IconMail } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Fale conosco | Inova Cumaú",
};

export default function FaleConoscoPage() {
  return (
    <PagePlaceholder
      icon={IconMail}
      eyebrow="Mídia"
      title="Fale conosco"
      description="Canal de contato para a imprensa. Em construção."
    />
  );
}
