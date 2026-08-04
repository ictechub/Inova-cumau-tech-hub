import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Entrar | Inova Cumaú",
};

export default function EntrarPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Voltar para o início
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
