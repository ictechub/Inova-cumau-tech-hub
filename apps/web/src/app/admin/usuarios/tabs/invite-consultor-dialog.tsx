"use client";

import { useActionState, useEffect, useState } from "react";

import { IconMailForward } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

import { inviteConsultor } from "../invite-consultor";
import type { ActionResult } from "../actions";

export function InviteConsultorDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    inviteConsultor,
    null,
  );
  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: state.message ?? "Convite enviado." });
      onOpenChange(false);
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="font-sans">Convidar Consultor</DialogTitle>
            <DialogDescription>
              Envie um convite por e-mail para criar uma conta de Consultor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="responsavel_nome">Nome</Label>
            <Input
              id="responsavel_nome"
              name="responsavel_nome"
              placeholder="Nome completo"
              aria-invalid={!!errors.responsavel_nome}
            />
            <FieldError errors={errors.responsavel_nome?.map((message) => ({ message }))} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="responsavel_email">E-mail</Label>
            <Input
              id="responsavel_email"
              name="responsavel_email"
              type="email"
              placeholder="nome@email.com"
              aria-invalid={!!errors.responsavel_email}
            />
            <FieldError errors={errors.responsavel_email?.map((message) => ({ message }))} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit">Enviar convite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InviteConsultorButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <IconMailForward />
        Convidar Consultor
      </Button>
      <InviteConsultorDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
