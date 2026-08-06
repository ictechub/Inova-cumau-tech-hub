"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { SettingsRow, SettingsSection } from "@/components/settings-row";

import { updateProfile, type ActionResult } from "../actions";
import type { ConfiguracoesInitialData } from "../configuracoes-tabs";

export function ProfileTab({ initial }: { initial: ConfiguracoesInitialData }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateProfile,
    null,
  );

  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Perfil atualizado com sucesso." });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <SettingsSection
        title="Profile"
        description="Como sua startup aparece publicamente no site da Inova Cumaú."
        actions={
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      >
        <SettingsRow
          label="Perfil público"
          description="Exibir o perfil da sua startup na página pública de negócios."
        >
          <div className="flex items-center gap-2">
            <Switch name="perfil_visivel_publico" defaultChecked={initial.perfil_visivel_publico} />
          </div>
        </SettingsRow>

        <SettingsRow label="Site" description="Endereço do site da startup.">
          <Input
            name="startup_site"
            type="text"
            placeholder="https://suastartup.com.br"
            defaultValue={initial.startup_site ?? ""}
            aria-invalid={!!errors.startup_site}
          />
          <FieldError errors={errors.startup_site?.map((message) => ({ message }))} />
        </SettingsRow>

        <SettingsRow label="Instagram" description="Usuário ou link do perfil.">
          <Input
            name="contato_instagram"
            type="text"
            placeholder="@suastartup"
            defaultValue={initial.contato_instagram ?? ""}
            aria-invalid={!!errors.contato_instagram}
          />
          <FieldError errors={errors.contato_instagram?.map((message) => ({ message }))} />
        </SettingsRow>

        <SettingsRow label="Facebook" description="Usuário ou link da página.">
          <Input
            name="contato_facebook"
            type="text"
            placeholder="facebook.com/suastartup"
            defaultValue={initial.contato_facebook ?? ""}
            aria-invalid={!!errors.contato_facebook}
          />
          <FieldError errors={errors.contato_facebook?.map((message) => ({ message }))} />
        </SettingsRow>

        <SettingsRow label="LinkedIn" description="Usuário ou link da página.">
          <Input
            name="contato_linkedin"
            type="text"
            placeholder="linkedin.com/company/suastartup"
            defaultValue={initial.contato_linkedin ?? ""}
            aria-invalid={!!errors.contato_linkedin}
          />
          <FieldError errors={errors.contato_linkedin?.map((message) => ({ message }))} />
        </SettingsRow>
      </SettingsSection>
    </form>
  );
}
