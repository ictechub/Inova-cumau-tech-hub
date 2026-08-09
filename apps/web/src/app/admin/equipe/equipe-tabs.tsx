"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MembrosTab } from "./tabs/membros-tab";
import { OrganogramaTab } from "./tabs/organograma-tab";
import { PermissoesTab } from "./tabs/permissoes-tab";

export type TeamRosterMember = {
  user_id: string;
  responsavel_nome: string;
  responsavel_cargo: string;
  responsavel_email: string;
  avatar_url: string | null;
  team_member_id: string | null;
  hierarchy_level: string | null;
  permission_role: string;
  reports_to: string | null;
  area: string | null;
};

export function EquipeTabs({ roster }: { roster: TeamRosterMember[] }) {
  return (
    <Tabs defaultValue="membros">
      <TabsList variant="line">
        <TabsTrigger value="membros">Membros</TabsTrigger>
        <TabsTrigger value="organograma">Organograma</TabsTrigger>
        <TabsTrigger value="permissoes">Permissões</TabsTrigger>
      </TabsList>
      <TabsContent value="membros" className="pt-6">
        <MembrosTab roster={roster} />
      </TabsContent>
      <TabsContent value="organograma" className="pt-6">
        <OrganogramaTab roster={roster} />
      </TabsContent>
      <TabsContent value="permissoes" className="pt-6">
        <PermissoesTab roster={roster} />
      </TabsContent>
    </Tabs>
  );
}
