import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsRow, SettingsSection } from "@/components/settings-row";

import type { AdminRosterItem } from "../configuracoes-tabs";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
  }
  return (parts[0] ?? name).slice(0, 2).toUpperCase();
}

export function TeamTab({ admins }: { admins: AdminRosterItem[] }) {
  return (
    <SettingsSection
      title="Team"
      description="Administradores com acesso a esta área organizacional."
    >
      {admins.map((admin) => (
        <SettingsRow key={admin.responsavel_email ?? admin.responsavel_nome} label={admin.responsavel_nome}>
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-lg after:hidden">
              <AvatarImage
                src={admin.avatar_url ?? ""}
                alt={admin.responsavel_nome}
                className="rounded-lg object-cover"
              />
              <AvatarFallback className="rounded-lg text-xs font-medium">
                {getInitials(admin.responsavel_nome || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm text-foreground">{admin.responsavel_cargo}</span>
              <span className="text-xs text-muted-foreground">{admin.responsavel_email}</span>
            </div>
          </div>
        </SettingsRow>
      ))}
    </SettingsSection>
  );
}
