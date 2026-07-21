# Inova Cumaú — site institucional

Hub de comunicação da Inova Cumaú (associação de startups de tecnologia e
bioeconomia de Santana/AP). O site é a porta de entrada para o ecossistema
(Instagram, WhatsApp, YouTube, rádio web, Revista do Investidor) e, numa fase
futura, para a área logada (associados/admin/marketplace).

## Stack (travada — não trocar sem pedido explícito)

- **Monorepo**: pnpm workspaces + Turborepo.
- **App**: Next.js (App Router, TypeScript estrito) em `apps/web`.
- **UI**: shadcn/ui (estilo `base-nova`, sucessor do "New York" — Base UI + Nova),
  instalado sempre via `shadcn@latest`, nunca copiado de memória.
- **Estilos**: Tailwind CSS v4 (`@theme inline`), tokens de marca espelhados 1:1 de
  `docs/brand/inova-cumau-guia-de-marca-v1.3.html`.
- **Fontes**: `next/font/google` — Lora (`--font-serif`, headings), Geist
  (`--font-sans`, corpo/UI), Space Mono (`--font-mono`, labels/metadados).
- **Backend**: Supabase (projeto `ekkbqazhdaabdkncwlwa`), acessado via MCP para
  schema/migrations/types — nunca credenciais manuais.
- **Deploy**: Vercel. **NUNCA rodar `vercel` / `vercel deploy` nesta fase** — apenas
  preparar configuração local.

## Comandos

```bash
pnpm install       # na raiz
pnpm dev           # apps/web em http://localhost:3000
pnpm build          # build de todos os workspaces (turbo)
pnpm lint           # lint de todos os workspaces
pnpm typecheck       # typecheck de todos os workspaces
```

Para rodar comandos só em `apps/web`: `pnpm --filter @inova-cumau/web <script>`.

## Estrutura

```
inova-cumau/
├── apps/
│   └── web/                     # Next.js App Router
│       ├── src/app/              # rotas, layout, globals.css
│       ├── public/logo/          # variantes do logo (SVG estático servido pelo Next)
│       ├── .env.example          # placeholders — nunca commitar .env.local
│       └── components.json       # config shadcn/ui
├── packages/
│   ├── ui/                       # componentes shadcn compartilhados + assets/logo (fonte)
│   ├── supabase/                 # database.types.ts, client.ts (browser), server.ts (SSR)
│   └── config/                   # tsconfig base, eslint base
├── docs/brand/                    # guia de marca (fonte de verdade de cores/logo)
├── pnpm-workspace.yaml
├── turbo.json
└── CLAUDE.md
```

## Tokens de marca (Tailwind)

`apps/web/src/app/globals.css` define a paleta completa (`--floresta-*`, `--rio-*`,
`--neutral-*`, `--success/warning/error/info-*`, 50–950) e uma camada semântica
(`--bg`, `--surface`, `--text-primary`, `--brand-primary-bg` etc.) para `:root`
(claro) e `.dark` (escuro — usamos a classe `.dark`, não `[data-theme="dark"]` do
guia, para casar com a convenção shadcn/next-themes). Um bloco `@theme inline`
mapeia esses tokens semânticos para os nomes que o shadcn/ui espera
(`--color-primary`, `--color-border` etc.). **Sempre reutilizar esses nomes** ao
invés de introduzir cores novas — qualquer cor deve vir do guia de marca.

## Supabase

Duas tabelas (`leads_associacao`, `newsletter_subscribers`), RLS habilitado, só
INSERT anônimo liberado (sem SELECT público — dados de leads não são legíveis pelo
client). Inserções acontecem via **Server Actions** do Next.js, nunca client-side
direto, usando `createServerClient` de `packages/supabase/server.ts`.

- `packages/supabase/client.ts` — client de browser (`createBrowserClient`, uso em
  Client Components).
- `packages/supabase/server.ts` — client de servidor (`createServerClient` com
  cookies, uso em Server Components/Server Actions).
- `packages/supabase/database.types.ts` — gerado via MCP
  (`generate_typescript_types`); regenerar após qualquer migration.
- Env vars (`apps/web/.env.local`, nunca commitado):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Estado atual

**Feito**: monorepo, Next.js + shadcn/ui + tokens de marca, fontes, schema Supabase +
clients + types, extração dos 6 logos SVG (`color`, `white`, `dark`, `floresta`,
`rio`, `floresta900`), site multi-página com mega-menu, badge de rádio no header
(`SiteHeaderRadioBadge`, `apps/web/src/components/site-header-radio-badge.tsx`,
visível a partir do breakpoint `lg`, posicionada entre o menu e os botões de CTA)
com play/pause, título "tocando agora" com efeito marquee e mutar/desmutar. O
estado do player (play/pause, volume, mute, analyser) fica num contexto
compartilhado (`RadioPlayerProvider`, `apps/web/src/components/radio-player-provider.tsx`,
montado em `apps/web/src/app/(marketing)/layout.tsx`), hoje consumido só pela
`SiteHeaderRadioBadge` (a barra sticky `SiteRadioBar` que ficava acima do header,
junto com o `LiveWaveform` que ela usava, foi removida a pedido — a badge no
header assumiu essa função). Home (`/`) expandida com seções institucionais:
`Hero` → `About` (`components/sections/about.tsx`, teaser "quem somos") → `Offers`
(`components/sections/offers.tsx`, benefícios de associar-se) → seção "Portal"
(grid de hubs Sobre/Notícias/Mídia/Parceiros, inline em `page.tsx`) → `Movements`
(`components/sections/movements.tsx`, editais/eventos/novidades/comunicados) →
`Newsletter`.

**Pendente**: verificação final (build/lint/dev + teste end-to-end dos
formulários).

**Dados reais ausentes** (usar placeholder explícito até serem fornecidos — nunca
inventar): número de associados, depoimentos, logos de parceiros, estatísticas de
impacto, **URL do stream de áudio da rádio web** (placeholder em
`RADIO_STREAM_URL` dentro de `radio-player-provider.tsx`) e **título/descrição
"tocando agora"** (virá de uma API/endpoint ou embed ainda não definido — hoje são
textos estáticos `NOW_PLAYING_TITLE`/`NOW_PLAYING_DESCRIPTION` em
`radio-player-provider.tsx`, front-end já preparado para receber dados reais
depois).

## Convenções

- Componentes shadcn/ui sempre via `npx shadcn@latest add <componente>` dentro de
  `apps/web`, nunca escritos à mão.
- Queries/mutations Supabase ficam em Server Actions dentro de `apps/web/src/app`
  (colocadas perto da seção que as usa), importando os clients de
  `@inova-cumau/supabase`.
- Nenhum dado real inventado (estatísticas, depoimentos, parceiros) — usar
  placeholder explícito e listar como pendência.
- **Nunca rodar `vercel deploy`** nesta fase do projeto.
