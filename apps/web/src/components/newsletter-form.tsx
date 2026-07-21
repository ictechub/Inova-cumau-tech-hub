"use client";

import { useActionState } from "react";
import { IconLoader2, IconSend } from "@tabler/icons-react";

import { submitNewsletter } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form-state";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    submitNewsletter,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          E-mail
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />
        {state.status !== "idle" && (
          <p
            role="status"
            className={
              state.status === "success"
                ? "mt-2 text-sm text-success-300"
                : "mt-2 text-sm text-error-300"
            }
          >
            {state.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="gap-2 sm:shrink-0">
        {pending ? <IconLoader2 className="animate-spin" /> : <IconSend />}
        Inscrever
      </Button>
    </form>
  );
}
