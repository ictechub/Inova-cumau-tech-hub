import Link from "next/link";

import { Logo } from "@/components/logo";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/noticias", label: "Notícias" },
  { href: "/midia", label: "Mídia" },
  { href: "/parceiros", label: "Parceiros" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">
            Associação que conecta as startups de tecnologia e bioeconomia do Amapá a
            clientes, parceiros e investidores.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm text-muted-foreground">
          <p>Santana / AP, Brasil</p>
          <Link href="/entrar" className="mt-2 inline-block hover:text-foreground">
            Área do associado
          </Link>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Inova Cumaú. Todos os direitos reservados.
      </div>
    </footer>
  );
}
