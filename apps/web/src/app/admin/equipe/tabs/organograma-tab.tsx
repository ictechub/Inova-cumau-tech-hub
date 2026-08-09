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

import { updateHierarquia, type ActionResult } from "../actions";
import type { TeamRosterMember } from "../equipe-tabs";

const HIERARCHY_LEVELS = [
  { value: "diretor", label: "Diretor(a)" },
  { value: "coordenador", label: "Coordenador(a)" },
  { value: "lider", label: "Líder" },
  { value: "par", label: "Par" },
] as const;

const TIERS = [
  { level: "diretor", title: "Diretoria" },
  { level: "coordenador", title: "Coordenação" },
  { level: "lider", title: "Liderança" },
  { level: "par", title: "Pares" },
] as const;

const HIERARCHY_LEVEL_ITEMS = Object.fromEntries(
  HIERARCHY_LEVELS.map((level) => [level.value, level.label]),
);

const SEM_SUPERVISOR = "nenhum";

function MemberHierarchyForm({
  member,
  roster,
}: {
  member: TeamRosterMember;
  roster: TeamRosterMember[];
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updateHierarquia,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.status === "validation_error" ? state.errors : {};

  const [hierarchyLevel, setHierarchyLevel] = useState(member.hierarchy_level ?? "");
  const [reportsTo, setReportsTo] = useState(member.reports_to ?? SEM_SUPERVISOR);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Organograma atualizado." });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  // O useEffect só dispara depois que o React já atualizou o input hidden no
  // DOM, evitando enviar o valor anterior (requestSubmit chamado direto no
  // onValueChange leria o hidden input antes do re-render aplicar o novo
  // valor, já que setValue do Base UI notifica onValueChange antes de
  // atualizar seu próprio estado interno).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    formRef.current?.requestSubmit();
  }, [hierarchyLevel, reportsTo]);

  const opcoesReportaPara = roster.filter(
    (candidato) => candidato.team_member_id && candidato.team_member_id !== member.team_member_id,
  );

  const reportsToItems = {
    [SEM_SUPERVISOR]: "Não reporta a ninguém",
    ...Object.fromEntries(
      opcoesReportaPara.map((candidato) => [candidato.team_member_id as string, candidato.responsavel_nome]),
    ),
  };

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 sm:flex-row">
      <input type="hidden" name="user_id" value={member.user_id} />
      <input type="hidden" name="hierarchy_level" value={hierarchyLevel} />
      <input type="hidden" name="reports_to" value={reportsTo === SEM_SUPERVISOR ? "" : reportsTo} />
      <div className="flex flex-1 flex-col gap-2">
        <Select
          items={HIERARCHY_LEVEL_ITEMS}
          value={hierarchyLevel}
          onValueChange={(value) => setHierarchyLevel(value as string)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Nível hierárquico" />
          </SelectTrigger>
          <SelectContent>
            {HIERARCHY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError errors={errors.hierarchy_level?.map((message) => ({ message }))} />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Select
          items={reportsToItems}
          value={reportsTo}
          onValueChange={(value) => setReportsTo(value as string)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Reporta para" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEM_SUPERVISOR}>Não reporta a ninguém</SelectItem>
            {opcoesReportaPara.map((candidato) => (
              <SelectItem key={candidato.team_member_id} value={candidato.team_member_id as string}>
                {candidato.responsavel_nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError errors={errors.reports_to?.map((message) => ({ message }))} />
      </div>
    </form>
  );
}

export function OrganogramaTab({ roster }: { roster: TeamRosterMember[] }) {
  const semNivel = roster.filter((member) => !member.hierarchy_level);
  const grupos = TIERS.map((tier) => ({
    ...tier,
    membros: roster.filter((member) => member.hierarchy_level === tier.level),
  })).filter((grupo) => grupo.membros.length > 0);

  return (
    <div className="flex flex-col gap-8">
      {semNivel.length > 0 && (
        <SettingsSection
          title="Sem nível definido"
          description="Defina o nível hierárquico inicial de cada membro."
        >
          {semNivel.map((member) => (
            <SettingsRow
              key={member.user_id}
              label={member.responsavel_nome}
              description={member.responsavel_cargo}
            >
              <MemberHierarchyForm member={member} roster={roster} />
            </SettingsRow>
          ))}
        </SettingsSection>
      )}
      {grupos.map((grupo) => (
        <SettingsSection key={grupo.level} title={grupo.title}>
          {grupo.membros.map((member) => (
            <SettingsRow
              key={member.user_id}
              label={member.responsavel_nome}
              description={member.responsavel_cargo}
            >
              <MemberHierarchyForm member={member} roster={roster} />
            </SettingsRow>
          ))}
        </SettingsSection>
      ))}
    </div>
  );
}
