"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconBell,
  IconBook,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBuilding,
  IconBuildingStore,
  IconCalendar,
  IconFileText,
  IconFolderDown,
  IconGavel,
  IconGift,
  IconHeartHandshake,
  IconMail,
  IconMenu2,
  IconMicrophone,
  IconNews,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavLink = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type NavGroup = { label: string; items: NavLink[] };

type NavPromo = {
  image: string;
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

type NavEntry =
  | { href: string; label: string }
  | { label: string; items: NavLink[] }
  | { label: string; groups: NavGroup[]; promo?: NavPromo };

const NAV_ITEMS: NavEntry[] = [
  { href: "/", label: "Início" },
  {
    label: "Sobre",
    groups: [
      {
        label: "Institucional",
        items: [
          {
            href: "/sobre/quem-somos",
            label: "Quem somos",
            description: "O que é a Inova Cumaú?",
            icon: IconBuilding,
          },
          {
            href: "/sobre/equipe",
            label: "Governança/Diretoria",
            description: "Quem lidera o ecossistema.",
            icon: IconUsers,
          },
          {
            href: "/sobre/juridico",
            label: "Jurídico",
            description: "Estatuto e documentos.",
            icon: IconGavel,
          },
        ],
      },
      {
        label: "Para associados",
        items: [
          {
            href: "/associe-se",
            label: "Benefícios",
            description: "Vantagens de se associar.",
            icon: IconGift,
          },
        ],
      },
      {
        label: "Ecossistema",
        items: [
          {
            href: "/parceiros",
            label: "Parceiros",
            description: "Quem apoia o ecossistema.",
            icon: IconHeartHandshake,
          },
        ],
      },
    ],
  },
  {
    label: "Notícias",
    items: [
      {
        href: "/noticias/programas-e-editais",
        label: "Programas e Editais",
        description: "Editais e programas abertos.",
        icon: IconFileText,
      },
      {
        href: "/noticias/novidades",
        label: "Novidades",
        description: "Novidades do ecossistema.",
        icon: IconSpeakerphone,
      },
      {
        href: "/noticias/eventos",
        label: "Eventos",
        description: "Agenda de eventos.",
        icon: IconCalendar,
      },
      {
        href: "/noticias/comunicados",
        label: "Comunicados",
        description: "Comunicados oficiais.",
        icon: IconBell,
      },
    ],
  },
  {
    label: "Mídia",
    groups: [
      {
        label: "Mídia",
        items: [
          {
            href: "/midia/vitrine-de-startups",
            label: "Vitrine de Startups",
            description: "Startups associadas.",
            icon: IconBuildingStore,
          },
          {
            href: "/midia/revista-do-investidor",
            label: "Revista do investidor",
            description: "Dados para investidores.",
            icon: IconBook,
          },
          {
            href: "/midia/podcast",
            label: "Podcast",
            description: "Conversas sobre inovação.",
            icon: IconMicrophone,
          },
          {
            href: "/noticias/artigos",
            label: "Artigos",
            description: "Artigos sobre inovação.",
            icon: IconNews,
          },
        ],
      },
      {
        label: "Social",
        items: [
          {
            href: "/midia/instagram",
            label: "Instagram",
            description: "Bastidores do ecossistema.",
            icon: IconBrandInstagram,
          },
          {
            href: "/midia/facebook",
            label: "Facebook",
            description: "Novidades e comunidade.",
            icon: IconBrandFacebook,
          },
          {
            href: "/midia/canal-youtube",
            label: "Youtube",
            description: "Vídeos e entrevistas.",
            icon: IconBrandYoutube,
          },
        ],
      },
      {
        label: "Imprensa",
        items: [
          {
            href: "/midia/press-kit",
            label: "Press kit",
            description: "Kit de logos e materiais.",
            icon: IconFolderDown,
          },
          {
            href: "/midia/fale-conosco",
            label: "Fale conosco",
            description: "Contato para a imprensa.",
            icon: IconMail,
          },
        ],
      },
    ],
    promo: {
      image: "/revista.png",
      title: "Revista YOU",
      description:
        "Edições especiais de 2026, com narrativa premium e estética sofisticada para marcas e líderes que buscam excelência.",
      primary: { href: "/midia/revista-do-investidor", label: "Ler agora" },
      secondary: { href: "/midia/revista-do-investidor", label: "Ver edições" },
    },
  },
];

function MegaMenuLink({ href, label, description, icon: Icon }: NavLink) {
  return (
    <NavigationMenuLink
      render={<Link href={href} />}
      className="flex w-full min-w-0 items-start gap-3 rounded-lg p-2"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-neutral-200 bg-white">
        <Icon className="size-5 text-foreground" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-[13px] text-muted-foreground">{description}</span>
      </span>
    </NavigationMenuLink>
  );
}

function MegaMenuPromo({ image, title, description, primary, secondary }: NavPromo) {
  return (
    <div className="flex w-56 shrink-0 flex-col rounded-lg bg-muted/30 pt-3 pr-3 pl-3">
      <div className="relative h-28 w-full overflow-hidden rounded-md">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="flex flex-col gap-2 py-3">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
          {description}
        </p>
        <div className="mt-1 flex items-center gap-4 text-[13px] font-medium">
          <Link href={primary.href} className="text-primary hover:underline">
            {primary.label}
          </Link>
          <Link href={secondary.href} className="text-secondary-foreground hover:underline">
            {secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

function MegaMenuFooter() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
      <div className="flex w-full flex-col gap-3 rounded-lg bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-foreground">
          Quer fazer parte do ecossistema?{" "}
          <Link href="/associe-se" className="text-primary hover:underline">
            Associe-se
          </Link>
        </p>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/faq" className="text-primary hover:underline">
            FAQ
          </Link>
          <Link href="/blog" className="text-primary hover:underline">
            Blog
          </Link>
        </div>
      </div>
    </div>
  );
}

function LogoWordmark() {
  return (
    <span className="flex flex-col font-serif uppercase">
      <span className="text-sm leading-none font-semibold text-floresta-700">
        Inova
      </span>
      <span className="text-sm leading-none font-semibold text-rio-700">
        Cumaú
      </span>
    </span>
  );
}

export function SiteHeader() {
  const headerRef = React.useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-border bg-white-exception"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Inova Cumaú">
          <Logo />
          <LogoWordmark />
        </Link>

        <NavigationMenu
          className="hidden md:flex md:ml-8"
          anchor={headerRef}
          footer={<MegaMenuFooter />}
          onValueChange={(value) => setMenuOpen(value != null)}
        >
          <NavigationMenuList>
            {NAV_ITEMS.map((item) =>
              "groups" in item ? (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="mx-auto flex h-[302px] w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
                      <div className="flex flex-1 gap-12">
                        <div className="flex flex-1 gap-12 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] translate-x-[var(--mm-slide-x)]">
                          {item.groups.map((group) => (
                            <div key={group.label} className="flex w-60 shrink-0 flex-col gap-1">
                              <p className="mb-1 text-xs font-bold tracking-widest text-rio-700 uppercase">
                                {group.label}
                              </p>
                              {group.items.map((sub) => (
                                <MegaMenuLink key={sub.href} {...sub} />
                              ))}
                            </div>
                          ))}
                        </div>
                        {item.promo && <MegaMenuPromo {...item.promo} />}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : "items" in item ? (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="mx-auto flex h-[302px] w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
                      <p className="mb-2 text-xs font-bold tracking-widest text-rio-700 uppercase">
                        {item.label}
                      </p>
                      <div className="grid flex-1 grid-cols-4 grid-flow-col grid-rows-4 items-start gap-x-8 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] translate-x-[var(--mm-slide-x)]">
                        {item.items.map((sub) => (
                          <MegaMenuLink key={sub.href} {...sub} />
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button
            render={<Link href="/entrar" />}
            nativeButton={false}
            variant="ghost"
            className="hidden text-rio-700 hover:bg-rio-700/10 hover:text-rio-700 sm:inline-flex"
          >
            Entrar
          </Button>
          <Button
            render={<Link href="/associe-se" />}
            nativeButton={false}
            className="hidden sm:inline-flex"
          >
            Associe-se
          </Button>

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <IconMenu2 />
              <span className="sr-only">Abrir menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2" aria-label="Inova Cumaú">
                    <Logo />
                    <LogoWordmark />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-6 px-4 pb-6">
                {NAV_ITEMS.map((item) =>
                  "groups" in item ? (
                    <div key={item.label} className="flex flex-col gap-4">
                      <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                        {item.label}
                      </p>
                      {item.groups.map((group) => (
                        <div key={group.label} className="flex flex-col gap-3 pl-1">
                          {group.label !== item.label && (
                            <p className="text-xs font-semibold text-muted-foreground/70 uppercase">
                              {group.label}
                            </p>
                          )}
                          {group.items.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="text-sm font-medium text-foreground"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : "items" in item ? (
                    <div key={item.label} className="flex flex-col gap-3">
                      <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                        {item.label}
                      </p>
                      <div className="flex flex-col gap-3 pl-1">
                        {item.items.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="text-sm font-medium text-foreground"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-foreground"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <Link
                  href="/entrar"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Entrar
                </Link>
                <Button render={<Link href="/associe-se" />} nativeButton={false}>
                  Associe-se
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
