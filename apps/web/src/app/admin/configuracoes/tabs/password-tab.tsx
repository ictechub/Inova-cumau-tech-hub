"use client";

import { useActionState, useEffect, useState } from "react";
import { IconCircleCheck, IconEye, IconEyeOff } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { SettingsRow, SettingsSection } from "@/components/settings-row";
import { cn } from "@/lib/utils";

import { PASSWORD_REQUIREMENTS } from "@/components/registration-wizard/schema";
import { updatePassword, type ActionResult } from "../actions";

export function PasswordTab() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updatePassword,
    null,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [senha, setSenha] = useState("");

  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: state.message ?? "Senha atualizada com sucesso." });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <SettingsSection
        title="Password"
        description="Atualize a senha usada para entrar na sua conta."
        actions={
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      >
        <SettingsRow label="Nova senha" description="Mínimo de 8 caracteres.">
          <div className="relative">
            <Input
              name="senha"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              className="pr-9"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-invalid={!!errors.senha}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </button>
          </div>
          <ul className="mt-1 flex flex-col gap-1">
            {PASSWORD_REQUIREMENTS.map((requirement) => {
              const met = requirement.test(senha);
              return (
                <li
                  key={requirement.label}
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    met ? "text-success-700" : "text-muted-foreground",
                  )}
                >
                  <IconCircleCheck className="size-3.5 shrink-0" aria-hidden />
                  {requirement.label}
                </li>
              );
            })}
          </ul>
          <FieldError errors={errors.senha?.map((message) => ({ message }))} />
        </SettingsRow>

        <SettingsRow label="Confirmar senha" description="Repita a nova senha.">
          <Input
            name="confirmar_senha"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita a senha"
            aria-invalid={!!errors.confirmar_senha}
          />
          <FieldError errors={errors.confirmar_senha?.map((message) => ({ message }))} />
        </SettingsRow>
      </SettingsSection>
    </form>
  );
}
