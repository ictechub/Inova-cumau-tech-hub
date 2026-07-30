import type { Metadata } from "next";
import Link from "next/link";
import { IconTools } from "@tabler/icons-react";

import { Logo, LogoWordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Área do associado | Inova Cumaú",
};

export default function AreaDoAssociadoPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted p-6 text-center md:p-10">
      <Link href="/" className="flex items-center gap-2" aria-label="Inova Cumaú">
        <Logo />
        <LogoWordmark />
      </Link>

      <div className="flex max-w-md flex-col items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg border-[1.4px] border-border bg-white shadow-sm">
          <IconTools className="size-5 text-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Área do associado</h1>
        <p className="text-sm text-muted-foreground">
          Estamos construindo esta área. Em breve, associados poderão
          acompanhar aqui as novidades e os benefícios da Inova Cumaú.
        </p>
      </div>

      <Button render={<Link href="/" />} nativeButton={false} variant="outline">
        Voltar para o início
      </Button>
    </div>
  );
}
