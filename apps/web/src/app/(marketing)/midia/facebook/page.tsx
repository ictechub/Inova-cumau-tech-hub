import type { Metadata } from "next";
import { IconBrandFacebook } from "@tabler/icons-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Facebook | Inova Cumaú",
};

export default function FacebookPage() {
  return (
    <PagePlaceholder
      icon={IconBrandFacebook}
      eyebrow="Mídia"
      title="Facebook"
      description="Novidades e comunidade do ecossistema. Em construção."
    />
  );
}
