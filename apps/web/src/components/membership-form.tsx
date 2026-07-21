"use client";

import { useActionState } from "react";
import { IconLoader2 } from "@tabler/icons-react";

import { submitMembership } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/form-state";

const SEGMENTOS = [
  "Bioeconomia & Floresta",
  "Tecnologia & Startups",
  "Negócios & Investimento",
  "Comunidade & Território",
  "Educação Empreendedora",
  "Outro",
];

export function MembershipForm() {
  const [state, formAction, pending] = useActionState(
    submitMembership,
    initialFormState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quero associar minha startup</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" required autoComplete="name" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="startup">Startup</Label>
            <Input id="startup" name="startup" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="segmento">Segmento</Label>
            <select
              id="segmento"
              name="segmento"
              required
              defaultValue=""
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            >
              <option value="" disabled>
                Selecione
              </option>
              {SEGMENTOS.map((segmento) => (
                <option key={segmento} value={segmento}>
                  {segmento}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              placeholder="(96) 90000-0000"
              required
              autoComplete="tel"
            />
          </div>

          <Button type="submit" disabled={pending} className="mt-2 gap-2">
            {pending && <IconLoader2 className="animate-spin" />}
            Quero me associar
          </Button>

          {state.status !== "idle" && (
            <p
              role="status"
              className={
                state.status === "success"
                  ? "text-sm text-success-700"
                  : "text-sm text-destructive"
              }
            >
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
