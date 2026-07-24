"use client";

import { useActionState } from "react";
import { IconLoader2, IconSend } from "@tabler/icons-react";

import { submitNewsletter } from "@/app/actions";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { initialFormState } from "@/lib/form-state";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    submitNewsletter,
    initialFormState,
  );

  return (
    <form action={formAction} className="w-full max-w-sm">
      <label htmlFor="newsletter-email" className="sr-only">
        E-mail
      </label>
      <InputGroup className="h-11">
        <InputGroupInput
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoComplete="email"
          className="h-11 px-3 text-base"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            size="sm"
            disabled={pending}
            variant="default"
            className="gap-1.5 px-4"
          >
            {pending ? <IconLoader2 className="animate-spin" /> : <IconSend />}
            Inscrever
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {state.status !== "idle" && (
        <p
          role="status"
          className={
            state.status === "success"
              ? "mt-2 text-sm text-success-700"
              : "mt-2 text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
