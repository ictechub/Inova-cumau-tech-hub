import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NavAssociado } from "@/components/nav-associado";
import { createClient } from "@inova-cumau/supabase/server";

export const metadata: Metadata = {
  title: "Área do associado | Inova Cumaú",
};

export default async function AreaDoAssociadoPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/entrar");
  }

  const { data: registration } = await supabase
    .from("startup_registrations")
    .select("responsavel_nome")
    .eq("user_id", authUser.id)
    .single();

  const nome = registration?.responsavel_nome?.trim().split(/\s+/)[0] ?? "Associado";

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <NavAssociado />
        </aside>
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-medium">
            Boas-vindas, {nome}
          </h1>
          <div className="mt-6 min-h-[60vh] rounded-xl bg-muted/50" />
        </div>
      </div>
    </section>
  );
}
