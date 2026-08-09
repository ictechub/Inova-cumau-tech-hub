"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PermissoesTab } from "./tabs/permissoes-tab";
import { UsuariosTab } from "./tabs/usuarios-tab";

export type PlatformUser = {
  user_id: string;
  responsavel_nome: string;
  responsavel_cargo: string;
  responsavel_email: string;
  avatar_url: string | null;
  matricula_numero: number;
  role: "owner" | "administrador" | "consultor" | "associado";
};

export function UsuariosTabs({
  usuarios,
  currentUserId,
}: {
  usuarios: PlatformUser[];
  currentUserId: string;
}) {
  return (
    <Tabs defaultValue="usuarios">
      <TabsList variant="line">
        <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        <TabsTrigger value="permissoes">Permissões</TabsTrigger>
      </TabsList>
      <TabsContent value="usuarios" className="pt-6">
        <UsuariosTab usuarios={usuarios} currentUserId={currentUserId} />
      </TabsContent>
      <TabsContent value="permissoes" className="pt-6">
        <PermissoesTab />
      </TabsContent>
    </Tabs>
  );
}
