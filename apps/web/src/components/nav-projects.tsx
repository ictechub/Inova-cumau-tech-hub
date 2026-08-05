"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MoreHorizontalIcon, FolderIcon, ArrowRightIcon, Trash2Icon } from "lucide-react"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projetos</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton render={<a href={item.url} />}>
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  />
                }
              >
                <MoreHorizontalIcon
                />
                <span className="sr-only">Mais</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-fit"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem className="cursor-pointer">
                  <FolderIcon
                  />
                  <span>Ver Projeto</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <ArrowRightIcon
                  />
                  <span>Compartilhar Projeto</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="cursor-pointer">
                  <Trash2Icon
                  />
                  <span>Excluir Projeto</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontalIcon className="text-sidebar-foreground/70" />
            <span>Mais</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
