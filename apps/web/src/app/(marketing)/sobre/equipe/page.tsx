import type { Metadata } from "next";
import { IconUsers } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Equipe | Inova Cumaú",
};

export default function EquipePage() {
  return (
    <PagePlaceholder
      icon={IconUsers}
      eyebrow="Sobre"
      title="Equipe"
      description="A apresentação da equipe da Inova Cumaú está em construção."
    />
  );
}
