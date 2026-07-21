import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Entrar | Inova Cumaú",
};

export default function EntrarPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div>
        <h1 className="font-serif text-2xl font-medium sm:text-3xl">
          Área do associado
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Nossa plataforma de login, gestão e marketplace para associados está em
          construção.
        </p>
      </div>
      <Button render={<Link href="/associe-se" />} nativeButton={false}>
        Quero me associar
      </Button>
    </div>
  );
}
