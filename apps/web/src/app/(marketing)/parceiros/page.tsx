import type { Metadata } from "next";
import { IconHeartHandshake } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Parceiros | Inova Cumaú",
};

export default function ParceirosPage() {
  return (
    <PagePlaceholder
      icon={IconHeartHandshake}
      eyebrow="Parceiros"
      title="Parceiros"
      description="A relação de parceiros da Inova Cumaú está em construção."
    />
  );
}
