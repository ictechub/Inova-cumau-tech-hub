"use client";

import Link from "next/link";
import { IconUserCircle, IconLogout, IconShieldCog } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/(marketing)/actions";
import { formatMatricula } from "@/lib/matricula";

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase();
}

export function HeaderUserMenu({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
    matricula_numero?: number;
  };
}) {
  const initials = getInitials(user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <Avatar className="rounded-lg after:rounded-lg">
          <AvatarImage className="rounded-lg" src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
        </Avatar>
        <span className="grid text-left leading-tight">
          <span className="max-w-[140px] truncate text-sm font-medium">
            {user.name}
          </span>
          {user.matricula_numero !== undefined && (
            <span className="truncate font-mono text-xs text-muted-foreground">
              {formatMatricula(user.matricula_numero)}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="rounded-lg after:rounded-lg">
                <AvatarImage
                  className="rounded-lg"
                  src={user.avatar}
                  alt={user.name}
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/area-do-associado" />}>
          <IconUserCircle />
          Área do associado
        </DropdownMenuItem>
        {user.role === "administrador" && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <IconShieldCog />
            Área administrativa
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <IconLogout />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
