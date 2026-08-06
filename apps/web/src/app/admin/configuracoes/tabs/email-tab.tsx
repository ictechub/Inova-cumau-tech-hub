"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { SettingsRow, SettingsSection } from "@/components/settings-row";

import { updateEmail, type ActionResult } from "../actions";

export function EmailTab({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateEmail,
    null,
  );

  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({
        type: "success",
        description: state.message ?? "E-mail de acesso atualizado com sucesso.",
      });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <SettingsSection
        title="Email"
        description="O e-mail usado para entrar na sua conta."
        actions={
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      >
        <SettingsRow
          label="E-mail de acesso"
          description="Ao alterar, enviaremos um e-mail de confirmação para o novo endereço."
        >
          <Input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={currentEmail}
            aria-invalid={!!errors.email}
          />
          <FieldError errors={errors.email?.map((message) => ({ message }))} />
        </SettingsRow>
      </SettingsSection>
    </form>
  );
}
