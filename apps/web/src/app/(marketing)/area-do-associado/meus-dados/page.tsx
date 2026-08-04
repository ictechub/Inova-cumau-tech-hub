import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NavAssociado } from "@/components/nav-associado";
import { createClient } from "@inova-cumau/supabase/server";
import { MeusDadosForm } from "./meus-dados-form";

export const metadata: Metadata = {
  title: "Meus dados | Inova Cumaú",
};

export default async function MeusDadosPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/entrar");
  }

  const { data: registration } = await supabase
    .from("startup_registrations")
    .select(
      "responsavel_nome, responsavel_email, responsavel_telefone, responsavel_whatsapp, responsavel_cargo, startup_nome, startup_cnpj, startup_cnpj_ausente, contato_endereco, contato_cidade, fase_negocio, startup_descricao, segmentos, segmento_outro, segmentacao_outros_detalhes, objetivo_filiacao, objetivo_filiacao_outro, avatar_url",
    )
    .eq("user_id", authUser.id)
    .single();

  if (!registration) {
    redirect("/entrar");
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <NavAssociado />
        </aside>
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-medium">Meus dados</h1>
          <p className="mt-1 mb-8 text-muted-foreground">
            Atualize as informações do responsável e do seu negócio.
          </p>
          <MeusDadosForm
            initial={{
              avatar_url: registration.avatar_url,
              responsavel_nome: registration.responsavel_nome,
              responsavel_email: registration.responsavel_email,
              responsavel_telefone: registration.responsavel_telefone,
              responsavel_whatsapp: registration.responsavel_whatsapp,
              responsavel_cargo: registration.responsavel_cargo,
              startup_nome: registration.startup_nome,
              startup_cnpj: registration.startup_cnpj,
              startup_cnpj_ausente: registration.startup_cnpj_ausente,
              contato_endereco: registration.contato_endereco,
              contato_cidade: registration.contato_cidade,
              fase_negocio: registration.fase_negocio,
              startup_descricao: registration.startup_descricao,
              segmentos: registration.segmentos ?? [],
              segmento_outro: registration.segmento_outro,
              segmentacao_outros_detalhes: registration.segmentacao_outros_detalhes,
              objetivo_filiacao: registration.objetivo_filiacao ?? [],
              objetivo_filiacao_outro: registration.objetivo_filiacao_outro,
            }}
          />
        </div>
      </div>
    </section>
  );
}
