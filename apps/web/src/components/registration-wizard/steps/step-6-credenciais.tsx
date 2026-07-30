"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { IconCircleCheck, IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";

import { submitRegistration } from "@/app/associe-se/actions";
import { initialRegistrationFormState } from "@/app/associe-se/form-state";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { PASSWORD_REQUIREMENTS, type WizardData } from "../schema";

export function Step6Credenciais({
  payload,
  onBack,
  onSignedUp,
  onComplete,
}: {
  payload: Partial<WizardData>;
  onBack: () => void;
  onSignedUp: (email: string) => void;
  onComplete: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    submitRegistration,
    initialRegistrationFormState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [senha, setSenha] = useState("");

  useEffect(() => {
    if (state.status === "otp_pending") {
      onSignedUp(state.email);
    } else if (state.status === "success") {
      onComplete();
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, onSignedUp, onComplete]);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center text-center">
        <IconCircleCheck className="size-12 text-success-600" aria-hidden />
        <p className="mt-3 text-sm font-medium text-foreground">Cadastro realizado!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Seu negócio foi cadastrado com sucesso. Agora você já pode entrar.
        </p>
        <Button render={<Link href="/area-do-associado" />} nativeButton={false} className="mt-6">
          Ir para a área do associado
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email" required>
            E-mail de acesso
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@suastartup.com.br"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="senha" required>
            Senha
          </FieldLabel>
          <div className="relative">
            <Input
              id="senha"
              name="senha"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              className="pr-9"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
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
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmar_senha" required>
            Confirmar senha
          </FieldLabel>
          <Input
            id="confirmar_senha"
            name="confirmar_senha"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita a senha"
            required
          />
        </Field>

        <Field className="mt-2 flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={pending}
          >
            Voltar
          </Button>
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? <IconLoader2 className="size-4 animate-spin" /> : "Criar conta"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
