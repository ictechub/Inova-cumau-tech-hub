"use client"

import * as React from "react"

import { Logo } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  IconLayoutDashboard,
  IconTools,
  IconAdjustmentsCog,
} from "@tabler/icons-react"

// This is sample data.
const data = {
  teams: [
    {
      name: "Inova Cumaú",
      logo: <Logo variant="white" className="h-4 w-auto" />,
      plan: "Associado",
    },
    {
      name: "Inova Cumaú",
      logo: <Logo variant="white" className="h-4 w-auto" />,
      plan: "Administrador",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: (
        <IconLayoutDashboard
        />
      ),
      isActive: true,
      items: [
        {
          title: "Histórico",
          url: "#",
        },
        {
          title: "Métricas",
          url: "/admin/metricas",
          roles: ["owner", "administrador", "consultor"],
        },
        {
          title: "Configurações",
          url: "#",
        },
      ],
    },
    {
      title: "Ferramentas",
      url: "#",
      icon: (
        <IconTools
        />
      ),
      roles: ["owner", "administrador", "consultor"],
      items: [
        {
          title: "Editor de publicação",
          url: "/admin/ferramentas/projetos",
        },
        {
          title: "Quadro de tarefas",
          url: "/admin/ferramentas/tarefas",
        },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: (
        <IconAdjustmentsCog
        />
      ),
      items: [
        {
          title: "Geral",
          url: "/admin/configuracoes",
          roles: ["owner", "administrador", "consultor"],
        },
        {
          title: "Usuários",
          url: "/admin/usuarios",
          roles: ["owner", "administrador"],
        },
        {
          title: "Equipe",
          url: "/admin/equipe",
          roles: ["owner", "administrador"],
        },
        {
          title: "Faturamento",
          url: "#",
          roles: ["owner", "administrador"],
        },
        {
          title: "Limites",
          url: "#",
          roles: ["owner", "administrador"],
        },
      ],
    },
  ],
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  administrador: "Administrador",
  consultor: "Consultor",
  associado: "Associado",
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar: string
    role?: string
  }
}) {
  const team = [{ ...data.teams[0]!, plan: ROLE_LABEL[user.role ?? "associado"] ?? "Associado" }]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={team} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} role={user.role} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
