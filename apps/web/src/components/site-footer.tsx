import Image from "next/image";
import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
} from "@tabler/icons-react";

import { Logo } from "@/components/logo";

type FooterLink = { href: string; label: string };
type FooterColumn = { label: string; links: FooterLink[] };

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    label: "Sobre",
    links: [
      { href: "/sobre/quem-somos", label: "Quem somos" },
      { href: "/sobre/equipe", label: "Governança/Diretoria" },
      { href: "/sobre/juridico", label: "Jurídico" },
      { href: "/associe-se", label: "Benefícios" },
      { href: "/parceiros", label: "Parceiros" },
    ],
  },
  {
    label: "Notícias",
    links: [
      { href: "/noticias/programas-e-editais", label: "Programas e Editais" },
      { href: "/noticias/novidades", label: "Novidades" },
      { href: "/noticias/eventos", label: "Eventos" },
      { href: "/noticias/comunicados", label: "Comunicados" },
      { href: "/noticias/artigos", label: "Artigos" },
    ],
  },
  {
    label: "Mídia",
    links: [
      { href: "/midia/vitrine-de-startups", label: "Vitrine de Startups" },
      { href: "/midia/revista-do-investidor", label: "Revista do investidor" },
      { href: "/midia/podcast", label: "Podcast" },
      { href: "/midia/press-kit", label: "Press kit" },
    ],
  },
  {
    label: "Jurídico",
    links: [
      { href: "/sobre/juridico", label: "Termos" },
      { href: "/sobre/juridico", label: "Privacidade" },
      { href: "/sobre/juridico", label: "Cookies" },
      { href: "/sobre/juridico", label: "Licenças" },
      { href: "/sobre/juridico", label: "Documentos" },
    ],
  },
  {
    label: "Recursos",
    links: [
      { href: "/#newsletter", label: "Newsletter" },
      { href: "/faq", label: "Central de ajuda" },
      { href: "/faq", label: "FAQ" },
      { href: "/faq", label: "Tutoriais" },
      { href: "/midia/fale-conosco", label: "Fale conosco" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "/midia/facebook", label: "Facebook", icon: IconBrandFacebook },
  { href: "/midia/instagram", label: "Instagram", icon: IconBrandInstagram },
  { href: "/midia/canal-youtube", label: "Youtube", icon: IconBrandYoutube },
];

export function SiteFooter() {
  return (
    <footer className="bg-floresta-900 text-floresta-100">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2" aria-label="Inova Cumaú">
              <Logo variant="white" />
              <span className="flex flex-col font-serif uppercase">
                <span className="text-sm leading-none font-semibold text-floresta-100">
                  Inova
                </span>
                <span className="text-sm leading-none font-semibold text-white">
                  Cumaú
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-floresta-300">
              Associação que conecta as startups de tecnologia e bioeconomia do
              Amapá a clientes, parceiros e investidores.
            </p>

            <div className="mt-6 flex items-center">
              <Image
                src="/louro.svg"
                alt=""
                width={131}
                height={80}
                aria-hidden
                className="h-20 w-auto shrink-0"
              />
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.label} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-floresta-50">
                  {column.label}
                </p>
                {column.links.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="text-sm text-floresta-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-floresta-800">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-xs text-floresta-300">
            © {new Date().getFullYear()} Inova Cumaú. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <Link
                key={social.href}
                href={social.href}
                aria-label={social.label}
                className="text-floresta-300 transition-colors hover:text-white"
              >
                <social.icon className="size-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
