"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
  role,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    roles?: string[]
    items?: {
      title: string
      url: string
      roles?: string[]
    }[]
  }[]
  role?: string
}) {
  const pathname = usePathname()
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const stored = window.localStorage.getItem("admin-sidebar-open")
    if (!stored) return
    try {
      setOpenMap(JSON.parse(stored))
    } catch {
      // ignora valor corrompido
    }
  }, [])

  const isSubItemActive = (url: string) => url !== "#" && pathname === url

  const visibleItems = items
    .filter((item) => !item.roles || (role && item.roles.includes(role)))
    .map((item) => ({
      ...item,
      items: item.items?.filter(
        (subItem) => !subItem.roles || (role && subItem.roles.includes(role)),
      ),
    }))

  function handleOpenChange(title: string, open: boolean) {
    setOpenMap((prev) => {
      const next = { ...prev, [title]: open }
      window.localStorage.setItem("admin-sidebar-open", JSON.stringify(next))
      return next
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.map((item) => {
          const hasActiveSubItem = item.items?.some((subItem) =>
            isSubItemActive(subItem.url),
          )
          const isOpen =
            item.title in openMap
              ? openMap[item.title]
              : (hasActiveSubItem ?? item.isActive ?? false)

          return (
            <Collapsible
              key={item.title}
              open={isOpen}
              onOpenChange={(open) => handleOpenChange(item.title, open)}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={<SidebarMenuButton tooltip={item.title} />}
              >
                {item.icon}
                <span>{item.title}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        isActive={isSubItemActive(subItem.url)}
                        render={<a href={subItem.url} />}
                      >
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
