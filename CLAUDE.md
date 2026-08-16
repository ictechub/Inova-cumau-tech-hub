# Inova Cumaú: site institucional

Hub de comunicação da Inova Cumaú (associação de startups de tecnologia e
bioeconomia de Santana/AP). O site é a porta de entrada para o ecossistema
(Instagram, WhatsApp, YouTube, Revista do Investidor) e, numa fase futura, para
a área logada (associados/admin/marketplace).

## Comunicação

Responder sempre em português (PT-BR), inclusive e especialmente mensagens
de fechamento/feedback sobre o que foi entregue em uma tarefa. Nunca resumir
ou reportar conclusão de trabalho em inglês. Regra permanente.

Nunca escrever usando travessão (—), nem em respostas no chat nem em nenhuma
copy do sistema (UI, docs, commits, código). Ao remover um travessão,
substituir por vírgula, ponto, parênteses ou reescrever a frase, o que fizer
mais sentido no contexto. Regra permanente.

## Fluxo de verificação

Não testar as mudanças no navegador antes de reportar conclusão, apenas
implementar exatamente o que foi pedido. O usuário testa manualmente e avisa
caso algo precise ser corrigido. Regra permanente, substitui qualquer
expectativa padrão de verificação end-to-end no navegador para tarefas
neste projeto.

## Stack (travada, não trocar sem pedido explícito)

- **Monorepo**: pnpm workspaces + Turborepo.
- **App**: Next.js (App Router, TypeScript estrito) em `apps/web`.
- **UI**: shadcn/ui (estilo `base-nova`, sucessor do "New York": Base UI + Nova),
  instalado sempre via `shadcn@latest`, nunca copiado de memória.
- **Estilos**: Tailwind CSS v4 (`@theme inline`), tokens de marca espelhados 1:1 de
  `docs/brand/inova-cumau-guia-de-marca-v1.3.html`.
- **Fontes**: `next/font/google`: Lora (`--font-serif`, headings), Geist
  (`--font-sans`, corpo/UI), Space Mono (`--font-mono`, labels/metadados).
- **Backend**: Supabase (projeto `ekkbqazhdaabdkncwlwa`), acessado via MCP para
  schema/migrations/types, nunca credenciais manuais.
- **Deploy**: Vercel, via a integração GitHub. Todo `git push` para `main`
  dispara automaticamente um novo deployment de produção (confirmado
  cruzando `list_deployments`/`get_project` do MCP Vercel com o histórico do
  `git log`: cada deployment carrega `meta.githubCommitSha` apontando para um
  commit já existente localmente). A ferramenta MCP `deploy_to_vercel` **não**
  é o mecanismo usado por este projeto, ela existe para deploy direto de
  árvore de arquivos sem git, cenário que não se aplica aqui; nunca invocar
  para deploys de rotina, só `git push`. Env vars do Supabase
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  precisam estar configuradas no projeto Vercel.
- **E-mail transacional**: Resend, exceção deliberada a esta seção (pedido
  explícito do usuário), usado só para o convite de conta Consultor
  (`apps/web/src/lib/resend.ts` + `apps/web/src/lib/email-templates/`). O
  e-mail de confirmação de cadastro público continua nativo do Supabase Auth,
  Resend não substitui esse fluxo.

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
│       │   ├── (marketing)/       # páginas institucionais (home, sobre, midia, noticias,
│       │   │                      #   parceiros...) + area-do-associado/, layout com
│       │   │                      #   header/footer sempre presentes (ver "Estado atual")
│       │   ├── associe-se/        # wizard de cadastro de startups (page.tsx + actions.ts + form-state.ts)
│       │   ├── admin/             # área administrativa: sidebar-07 do shadcn, stock (destino do CTA pós-cadastro)
│       │   └── entrar/            # tela de login (bloco login-04 do shadcn), fora do grupo (marketing)
│       ├── src/components/
│       │   ├── registration-wizard/  # steps + schema Zod do wizard de associe-se
│       │   ├── header-user-menu.tsx  # avatar/dropdown no SiteHeader p/ associado logado
│       │   ├── nav-associado.tsx     # nav (Perfil/Atividades/Carteira/Sair) da área do associado,
│       │   │                         #   markup simples, sem o primitivo Sidebar (ver "Estado atual")
│       │   ├── app-sidebar.tsx, nav-*.tsx, team-switcher.tsx  # peças do sidebar-07 (admin), stock
│       │   └── ui/                   # componentes shadcn (base-nova)
│       ├── public/logo/          # variantes do logo (SVG estático servido pelo Next)
│       ├── .env.example          # placeholders, nunca commitar .env.local
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
`--neutral-*`, `--success/warning/error/info-*`, 50 a 950) e uma camada semântica
(`--bg`, `--surface`, `--text-primary`, `--brand-primary-bg` etc.) para `:root`
(claro) e `.dark` (escuro, usamos a classe `.dark`, não `[data-theme="dark"]` do
guia, para casar com a convenção shadcn/next-themes). Um bloco `@theme inline`
mapeia esses tokens semânticos para os nomes que o shadcn/ui espera
(`--color-primary`, `--color-border` etc.). **Sempre reutilizar esses nomes** ao
invés de introduzir cores novas, qualquer cor deve vir do guia de marca.

Placeholders de input/textarea/select usam um token semântico próprio,
`--text-placeholder` (exposto como `--color-placeholder-foreground`), em vez de
`--text-muted`/`--color-muted-foreground`: um tom mais claro que o texto muted
(`--neutral-500` em ambos os temas, claro e escuro; `--text-muted` usa
`--neutral-600` no claro e `--neutral-400` no escuro). Como a escala neutra é
simétrica em torno de `--neutral-500` em relação ao fundo de cada tema, "um tom
a menos de contraste" cai exatamente em `--neutral-500` nos dois modos, por
isso o mesmo valor serve para claro e escuro. Usado em
`components/ui/input.tsx` e `components/ui/textarea.tsx`
(`placeholder:text-placeholder-foreground`) e `components/ui/select.tsx`
(`data-placeholder:text-placeholder-foreground` no `SelectTrigger`, o
`text-muted-foreground` do ícone de seta, `ChevronDownIcon`, não é afetado por
não ser texto de placeholder).

Fonte serifada (Lora, `--font-serif`) é exclusiva da landing page (`(marketing)/page.tsx`
e as demais páginas institucionais dentro do grupo `(marketing)`, exceto
`area-do-associado/`). Área do Associado e área Admin sempre usam a fonte sem
serifa (Geist, `--font-sans`), inclusive em headings, nunca `font-serif`
nessas duas áreas.

Atenção especial: o token `--font-heading` (usado por padrão em componentes
como `DialogTitle`, `apps/web/src/components/ui/dialog.tsx`) resolve para
`--font-serif`, ou seja, Lora vaza mesmo sem ninguém escrever `font-serif`
explicitamente, basta usar um componente que aplica `font-heading` por padrão
sem sobrescrever. Qualquer `DialogTitle` (ou outro componente com esse
default) dentro de Área do Associado ou Admin precisa sempre do override
explícito `className="font-sans"`, sem exceção, mesmo em dialogs novos ou
aninhados. Antes de dar uma tarefa de UI em Admin/Área do Associado como
concluída, conferir que nenhum `DialogTitle` (ou heading equivalente) novo
ficou sem esse override.

## Supabase

Tabelas principais: `leads_associacao`, `newsletter_subscribers` (RLS
habilitado, só INSERT anônimo liberado, sem SELECT público),
`startup_registrations` (cadastro completo de startups associadas, também
reaproveitada como perfil de conta Consultor direta, com valores sentinela
nos campos obrigatórios de startup), `projects` (artigos do "Ferramentas"
admin, RLS com SELECT público liberado só onde `status = 'publicado'`) e
`project_permissions` (permissões `ver`/`editar`/`compartilhar` por usuário
em `projects`). Inserções acontecem via **Server Actions** do Next.js, nunca
client-side direto, usando `createServerClient` de
`packages/supabase/server.ts`; escrita em `projects`/`project_permissions`
usa `createAdminClient()` (bypass de RLS) por trás de checagem de papel/
autorização na própria Server Action.

- `packages/supabase/client.ts`: client de browser (`createBrowserClient`, uso em
  Client Components).
- `packages/supabase/server.ts`: client de servidor (`createServerClient` com
  cookies, uso em Server Components/Server Actions).
- `packages/supabase/database.types.ts`: gerado via MCP
  (`generate_typescript_types`); regenerar após qualquer migration.
- Bucket de storage `project-media` (público): imagens e vídeos inseridos no
  editor de artigos, mesmo padrão dos buckets `avatars`/`profile-photos`.
- Env vars (`apps/web/.env.local`, nunca commitado):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
