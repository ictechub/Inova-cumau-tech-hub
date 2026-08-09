"use client";

import { useActionState, useEffect, useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { SettingsRow, SettingsSection } from "@/components/settings-row";

import { updateArea, type ActionResult } from "../actions";
import type { TeamRosterMember } from "../equipe-tabs";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
  }
  return (parts[0] ?? name).slice(0, 2).toUpperCase();
}

function MemberAreaForm({ member }: { member: TeamRosterMember }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(updateArea, null);
  const formRef = useRef<HTMLFormElement>(null);
  const initialArea = member.area ?? "";
  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Área atualizada." });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="user_id" value={member.user_id} />
      <Input
        name="area"
        defaultValue={initialArea}
        placeholder="Ex.: Tecnologia, Comunicação, Financeiro"
        maxLength={60}
        aria-invalid={!!errors.area}
        onBlur={(e) => {
          if (e.target.value !== initialArea) {
            formRef.current?.requestSubmit();
          }
        }}
      />
      <FieldError errors={errors.area?.map((message) => ({ message }))} />
    </form>
  );
}

export function MembrosTab({ roster }: { roster: TeamRosterMember[] }) {
  return (
    <SettingsSection
      title="Membros da equipe"
      description="Administradores cadastrados na Inova Cumaú e a área de atuação de cada um."
    >
      {roster.map((member) => (
        <SettingsRow
          key={member.user_id}
          label={member.responsavel_nome}
          description={member.responsavel_cargo}
        >
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-lg after:hidden">
              <AvatarImage
                src={member.avatar_url ?? ""}
                alt={member.responsavel_nome}
                className="rounded-lg object-cover"
              />
              <AvatarFallback className="rounded-lg text-xs font-medium">
                {getInitials(member.responsavel_nome)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{member.responsavel_email}</span>
          </div>
          <MemberAreaForm member={member} />
        </SettingsRow>
      ))}
    </SettingsSection>
  );
}
