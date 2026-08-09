"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { IconCircleCheck, IconLoader2, IconMailCheck } from "@tabler/icons-react";
import { toast } from "@/components/ui/toast";

import { resendRegistrationOtp, verifyRegistrationOtp } from "@/app/associe-se/actions";
import { initialOtpFormState } from "@/app/associe-se/form-state";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { WizardData } from "../schema";

const RESEND_COOLDOWN_SECONDS = 60;

export function Step7Confirmacao({
  email,
  payload,
  onBack,
  onComplete,
}: {
  email: string;
  payload: Partial<WizardData>;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    verifyRegistrationOtp,
    initialOtpFormState,
  );
  const [isResending, startResend] = useTransition();
  // O e-mail de confirmação já é enviado pelo signUp ao entrar neste step, então o
  // cooldown começa "quente", evita bater no rate limit do Supabase (~60s por e-mail).
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((current) => (current <= 0 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleResend() {
    if (cooldown > 0 || isResending) return;
    startResend(async () => {
      const result = await resendRegistrationOtp(email);
      if (result.error) {
        if (result.retryAfterSeconds) {
          setCooldown(result.retryAfterSeconds);
          toast.add({
            type: "warning",
            description: `Aguarde ${result.retryAfterSeconds}s antes de tentar novamente.`,
          });
        } else {
          setCooldown(RESEND_COOLDOWN_SECONDS);
          toast.add({
            type: "error",
            description: "Não foi possível reenviar o código agora. Tente novamente em instantes.",
          });
        }
      } else {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        toast.add({ type: "success", description: "Código reenviado. Confira seu e-mail." });
      }
    });
  }

  useEffect(() => {
    if (state.status === "success") {
      onComplete();
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, onComplete]);

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
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <IconMailCheck className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Enviamos um código de 8 dígitos para{" "}
            <strong className="text-foreground">{email}</strong>. Confira sua
            caixa de entrada (e o spam) e informe o código abaixo.
          </p>
        </div>

        <Field className="items-center">
          <FieldLabel htmlFor="code" required className="sr-only">
            Código de confirmação
          </FieldLabel>
          <InputOTP
            id="code"
            name="code"
            maxLength={8}
            required
            containerClassName="justify-center"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
        </Field>

        <Field className="items-center">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
          >
            {isResending
              ? "Reenviando código..."
              : cooldown > 0
                ? `Reenviar código (${cooldown}s)`
                : "Reenviar código"}
          </Button>
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
            {pending ? <IconLoader2 className="size-4 animate-spin" /> : "Confirmar código"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
