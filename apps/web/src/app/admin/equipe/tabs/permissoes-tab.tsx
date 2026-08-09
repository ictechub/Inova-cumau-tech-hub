"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { SettingsRow, SettingsSection } from "@/components/settings-row";

import { updatePermissao, type ActionResult } from "../actions";
import type { TeamRosterMember } from "../equipe-tabs";

const PERMISSION_ROLES = [
  {
    value: "admin_geral",
    label: "Admin geral",
    description:
      "Acesso completo a todas as áreas administrativas, incluindo gestão de outros membros da equipe.",
  },
  {
    value: "gestor",
    label: "Gestor",
    description:
      "Gerencia conteúdo e operações do dia a dia, sem acesso à gestão de permissões da equipe.",
  },
  {
    value: "membro",
    label: "Membro",
    description: "Acesso básico às áreas administrativas, sem permissões de gestão.",
  },
] as const;

const PERMISSION_ROLE_ITEMS = Object.fromEntries(
  PERMISSION_ROLES.map((role) => [role.value, role.label]),
);

function MemberPermissionForm({ member }: { member: TeamRosterMember }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updatePermissao,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.status === "validation_error" ? state.errors : {};

  const [permissionRole, setPermissionRole] = useState(member.permission_role);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Permissão atualizada." });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    formRef.current?.requestSubmit();
  }, [permissionRole]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="user_id" value={member.user_id} />
      <input type="hidden" name="permission_role" value={permissionRole} />
      <Select
        items={PERMISSION_ROLE_ITEMS}
        value={permissionRole}
        onValueChange={(value) => setPermissionRole(value as string)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o papel" />
        </SelectTrigger>
        <SelectContent>
          {PERMISSION_ROLES.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={errors.permission_role?.map((message) => ({ message }))} />
    </form>
  );
}

export function PermissoesTab({ roster }: { roster: TeamRosterMember[] }) {
  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Permissões"
        description="Papel de permissão de cada administrador dentro da área administrativa."
      >
        {roster.map((member) => (
          <SettingsRow
            key={member.user_id}
            label={member.responsavel_nome}
            description={member.responsavel_cargo}
          >
            <MemberPermissionForm member={member} />
          </SettingsRow>
        ))}
      </SettingsSection>

      <SettingsSection
        title="O que cada papel pode fazer"
        description="Referência rápida para a escolha acima."
      >
        <div className="flex flex-col gap-4 py-5">
          {PERMISSION_ROLES.map((role) => (
            <div key={role.value} className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{role.label}</span>
              <span className="text-sm text-muted-foreground">{role.description}</span>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}
