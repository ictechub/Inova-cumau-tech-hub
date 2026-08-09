"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EmailTab } from "./tabs/email-tab";
import { MyDetailsTab } from "./tabs/my-details-tab";
import { NotificationTab } from "./tabs/notification-tab";
import { PasswordTab } from "./tabs/password-tab";
import { ProfileTab } from "./tabs/profile-tab";

export type ConfiguracoesInitialData = {
  avatar_url: string | null;
  responsavel_nome: string;
  responsavel_email: string | null;
  responsavel_cargo: string;
  perfil_visivel_publico: boolean;
  startup_site: string | null;
  contato_instagram: string | null;
  contato_facebook: string | null;
  contato_linkedin: string | null;
  notify_email_novidades: boolean;
  notify_email_editais: boolean;
};

export function ConfiguracoesTabs({
  initial,
  authEmail,
}: {
  initial: ConfiguracoesInitialData;
  authEmail: string;
}) {
  return (
    <Tabs defaultValue="my-details">
      <TabsList variant="line">
        <TabsTrigger value="my-details">Meus Dados</TabsTrigger>
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="password">Senha</TabsTrigger>
        <TabsTrigger value="email">E-mail</TabsTrigger>
        <TabsTrigger value="notification">Notificações</TabsTrigger>
      </TabsList>
      <TabsContent value="my-details" className="pt-6">
        <MyDetailsTab initial={initial} />
      </TabsContent>
      <TabsContent value="profile" className="pt-6">
        <ProfileTab initial={initial} />
      </TabsContent>
      <TabsContent value="password" className="pt-6">
        <PasswordTab />
      </TabsContent>
      <TabsContent value="email" className="pt-6">
        <EmailTab currentEmail={authEmail} />
      </TabsContent>
      <TabsContent value="notification" className="pt-6">
        <NotificationTab initial={initial} />
      </TabsContent>
    </Tabs>
  );
}
