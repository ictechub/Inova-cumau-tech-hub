import { SettingsSection } from "@/components/settings-row";

const ROLE_DESCRIPTIONS = [
  {
    value: "administrador",
    label: "Administrador",
    description:
      "Acesso completo à área administrativa: métricas do ecossistema, configurações da conta, gestão de equipe e nível de acesso de outros usuários.",
  },
  {
    value: "consultor",
    label: "Consultor",
    description:
      "Acesso à área administrativa restrito a Ferramentas, Métricas e gestão do próprio perfil, incluindo visualizar a equipe e os projetos em que participa. Sem acesso à área de membros nem à gestão de outros usuários.",
  },
  {
    value: "associado",
    label: "Associado",
    description:
      "Acesso à área do associado: dados cadastrais da própria startup, sem acesso às áreas administrativas.",
  },
] as const;

export function PermissoesTab() {
  return (
    <SettingsSection
      title="O que cada nível de acesso pode fazer"
      description="Referência rápida para a escolha do nível de acesso na aba Usuários."
    >
      <div className="flex flex-col gap-4 py-5">
        {ROLE_DESCRIPTIONS.map((role) => (
          <div key={role.value} className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{role.label}</span>
            <span className="text-sm text-muted-foreground">{role.description}</span>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
