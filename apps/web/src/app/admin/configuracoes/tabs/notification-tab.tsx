"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { SettingsRow, SettingsSection } from "@/components/settings-row";

import { updateNotifications, type ActionResult } from "../actions";
import type { ConfiguracoesInitialData } from "../configuracoes-tabs";

export function NotificationTab({ initial }: { initial: ConfiguracoesInitialData }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateNotifications,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Preferências salvas com sucesso." });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <SettingsSection
        title="Notification"
        description="Escolha quais e-mails você quer receber."
        actions={
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      >
        <SettingsRow label="Novidades" description="Novidades e comunicados da Inova Cumaú.">
          <Switch
            name="notify_email_novidades"
            defaultChecked={initial.notify_email_novidades}
          />
        </SettingsRow>

        <SettingsRow label="Editais" description="Novos editais e oportunidades de fomento.">
          <Switch name="notify_email_editais" defaultChecked={initial.notify_email_editais} />
        </SettingsRow>
      </SettingsSection>
    </form>
  );
}
