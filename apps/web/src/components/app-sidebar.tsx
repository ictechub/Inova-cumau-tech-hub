"use client"

import * as React from "react"

import { Logo } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"

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
      title: "Área de Testes",
      url: "#",
      icon: (
        <TerminalSquareIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "Histórico",
          url: "#",
        },
        {
          title: "Favoritos",
          url: "#",
        },
        {
          title: "Configurações",
          url: "#",
        },
      ],
    },
    {
      title: "Modelos",
      url: "#",
      icon: (
        <BotIcon
        />
      ),
      items: [
        {
          title: "Gênesis",
          url: "#",
        },
        {
          title: "Explorador",
          url: "#",
        },
        {
          title: "Quântico",
          url: "#",
        },
      ],
    },
    {
      title: "Documentação",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: "Introdução",
          url: "#",
        },
        {
          title: "Primeiros Passos",
          url: "#",
        },
        {
          title: "Tutoriais",
          url: "#",
        },
        {
          title: "Registro de Alterações",
          url: "#",
        },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "Geral",
          url: "#",
        },
        {
          title: "Equipe",
          url: "#",
        },
        {
          title: "Faturamento",
          url: "#",
        },
        {
          title: "Limites",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Engenharia de Design",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Vendas e Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Viagens",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
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
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
