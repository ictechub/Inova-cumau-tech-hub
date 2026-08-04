"use client";

import {
  IconChevronRight,
  IconUserCircle,
  IconActivity,
  IconWallet,
  IconLogout,
} from "@tabler/icons-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(marketing)/actions";

const navAssociado = [
  {
    title: "Perfil",
    icon: IconUserCircle,
    isActive: true,
    items: [
      { title: "Meus dados", url: "/area-do-associado/meus-dados" },
      { title: "Privacidade", url: "#" },
      { title: "Mensagens", url: "#" },
      { title: "Notificações", url: "#" },
    ],
  },
  {
    title: "Atividades",
    icon: IconActivity,
    items: [{ title: "Salvos", url: "#" }],
  },
  {
    title: "Carteira",
    icon: IconWallet,
    items: [
      { title: "Cartão de sócio", url: "#" },
      { title: "Cumaú Coin", url: "#" },
    ],
  },
];

const navItemTriggerClass =
  "flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium text-foreground hover:bg-muted";

export function NavAssociado() {
  return (
    <nav className="flex flex-col gap-1">
      {navAssociado.map((item) => {
        const Icon = item.icon;
        return (
          <Collapsible key={item.title} defaultOpen={item.isActive} className="group/collapsible">
            <CollapsibleTrigger className={navItemTriggerClass}>
              <Icon className="size-4" />
              <span>{item.title}</span>
              <IconChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mx-3.5 mt-0.5 flex translate-x-px flex-col gap-0.5 border-l border-border pl-2.5">
                {item.items.map((subItem) => (
                  <li key={subItem.title}>
                    <a
                      href={subItem.url}
                      className="block rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {subItem.title}
                    </a>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
      <button
        type="button"
        onClick={() => signOut()}
        className={cn(navItemTriggerClass, "mt-2")}
      >
        <IconLogout className="size-4" />
        <span>Sair</span>
      </button>
    </nav>
  );
}
