# Inova Cumaú — site institucional

Hub de comunicação da Inova Cumaú (associação de startups de tecnologia e
bioeconomia de Santana/AP). O site é a porta de entrada para o ecossistema
(Instagram, WhatsApp, YouTube, Revista do Investidor) e, numa fase futura, para
a área logada (associados/admin/marketplace).

## Manutenção deste arquivo

Sempre que uma tarefa for concluída, atualizar este `CLAUDE.md` para refletir o
que mudou (estado atual, convenções novas, pendências resolvidas/criadas) —
regra permanente, não só para a tarefa que a originou.

## Fluxo de verificação

Não testar as mudanças no navegador antes de reportar conclusão — apenas
implementar exatamente o que foi pedido. O usuário testa manualmente e avisa
caso algo precise ser corrigido. Regra permanente, substitui qualquer
expectativa padrão de verificação end-to-end no navegador para tarefas
neste projeto.

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
- **Deploy**: Vercel, via a integração GitHub — todo `git push` para `main`
  dispara automaticamente um novo deployment de produção (confirmado
  cruzando `list_deployments`/`get_project` do MCP Vercel com o histórico do
  `git log`: cada deployment carrega `meta.githubCommitSha` apontando para um
  commit já existente localmente). A ferramenta MCP `deploy_to_vercel` **não**
  é o mecanismo usado por este projeto — ela existe para deploy direto de
  árvore de arquivos sem git, cenário que não se aplica aqui; nunca invocar
  para deploys de rotina, só `git push`. Env vars do Supabase
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  precisam estar configuradas no projeto Vercel.

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
│       │   │                      #   parceiros...) + area-do-associado/ — layout com
│       │   │                      #   header/footer sempre presentes (ver "Estado atual")
│       │   ├── associe-se/        # wizard de cadastro de startups (page.tsx + actions.ts + form-state.ts)
│       │   ├── admin/             # área administrativa — sidebar-07 do shadcn, stock (destino do CTA pós-cadastro)
│       │   └── entrar/            # tela de login (bloco login-04 do shadcn), fora do grupo (marketing)
│       ├── src/components/
│       │   ├── registration-wizard/  # steps + schema Zod do wizard de associe-se
│       │   ├── header-user-menu.tsx  # avatar/dropdown no SiteHeader p/ associado logado
│       │   ├── nav-associado.tsx     # nav (Perfil/Atividades/Carteira/Sair) da área do associado,
│       │   │                         #   markup simples, sem o primitivo Sidebar (ver "Estado atual")
│       │   ├── app-sidebar.tsx, nav-*.tsx, team-switcher.tsx  # peças do sidebar-07 (admin), stock
│       │   └── ui/                   # componentes shadcn (base-nova)
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

Placeholders de input/textarea/select usam um token semântico próprio,
`--text-placeholder` (exposto como `--color-placeholder-foreground`), em vez de
`--text-muted`/`--color-muted-foreground` — um tom mais claro que o texto muted
(`--neutral-500` em ambos os temas, claro e escuro; `--text-muted` usa
`--neutral-600` no claro e `--neutral-400` no escuro). Como a escala neutra é
simétrica em torno de `--neutral-500` em relação ao fundo de cada tema, "um tom
a menos de contraste" cai exatamente em `--neutral-500` nos dois modos — por
isso o mesmo valor serve para claro e escuro. Usado em
`components/ui/input.tsx` e `components/ui/textarea.tsx`
(`placeholder:text-placeholder-foreground`) e `components/ui/select.tsx`
(`data-placeholder:text-placeholder-foreground` no `SelectTrigger` — o
`text-muted-foreground` do ícone de seta, `ChevronDownIcon`, não é afetado por
não ser texto de placeholder).

## Supabase

Três tabelas — `leads_associacao`, `newsletter_subscribers` (RLS habilitado, só
INSERT anônimo liberado, sem SELECT público) e `startup_registrations` (cadastro
completo de startups associadas, ver abaixo). Inserções acontecem via **Server
Actions** do Next.js, nunca client-side direto, usando `createServerClient` de
`packages/supabase/server.ts`.

- `packages/supabase/client.ts` — client de browser (`createBrowserClient`, uso em
  Client Components).
- `packages/supabase/server.ts` — client de servidor (`createServerClient` com
  cookies, uso em Server Components/Server Actions).
- `packages/supabase/database.types.ts` — gerado via MCP
  (`generate_typescript_types`); regenerar após qualquer migration.
- Env vars (`apps/web/.env.local`, nunca commitado):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

### `startup_registrations`

Alimentada pelo wizard de `/associe-se` (`apps/web/src/app/associe-se/actions.ts`,
Server Action `submitRegistration`). RLS exige `auth.uid() = user_id`, então o
fluxo é: `supabase.auth.signUp({ email, password })` cria o usuário e, **só se
`signUp` já devolver uma sessão ativa** (sem confirmação de e-mail pendente), o
insert acontece na sequência, autenticado como o próprio usuário recém-criado.

Campos `startup_cnpj` (string de 14 dígitos, sem máscara, ou `null`) e
`startup_cnpj_ausente` (boolean) vêm do step 2 do wizard (ver "CNPJ com
autopreenchimento" em Convenções, abaixo) — `submitRegistration` grava
`startup_cnpj: null` sempre que `startup_cnpj_ausente` for `true`, ignorando
qualquer valor remanescente no campo.

Colunas `responsavel_email` (obrigatória), `contato_telefone`, `contato_email`,
`contato_instagram`, `contato_facebook` e `contato_linkedin` foram adicionadas
via migration a esta tabela — originalmente `contato_email`/`contato_telefone`
como NOT NULL, alimentadas pelo extinto Step 3 ("Contato") do wizard. Com a
remoção total do Step 3 (ver "Estado atual" abaixo), uma segunda migration
tornou `contato_email` e `contato_telefone` nullable, já que o wizard parou de
coletar esses campos; `insertStartupRegistration`
(`apps/web/src/app/associe-se/actions.ts`) agora grava `startup_site`,
`contato_email`, `contato_telefone`, `contato_whatsapp`, `contato_instagram`,
`contato_facebook` e `contato_linkedin` sempre como `null`. `database.types.ts`
já reflete as duas migrations (regenerado via `generate_typescript_types` após
cada uma).

Colunas `objetivo_filiacao` (`text[]`) e `objetivo_filiacao_outro` (nullable
text) foram adicionadas via migration seguindo o mesmo padrão de
`segmentos`/`segmento_outro` (array + campo livre condicional) — ver Step 4 em
"Estado atual" abaixo. `database.types.ts` já reflete essas colunas.

**Gap conhecido, resolvido em código pelo Step 7 (OTP)**: o projeto Supabase
está com confirmação de e-mail exigida por padrão, então `signUp` normalmente
retorna sem sessão. Em vez do antigo erro terminal, `submitRegistration`
agora retorna `{ status: "otp_pending", email }`, o wizard avança para o
**Step 7 ("Confirmar e-mail", `steps/step-7-confirmacao.tsx`)** e o usuário
digita o código de **8 dígitos** recebido por e-mail; `verifyRegistrationOtp`
chama `supabase.auth.verifyOtp({ email, token, type: "signup" })` e só então
insere em `startup_registrations` (mesmo helper `insertStartupRegistration`
reutilizado do branch raro de sessão já ativa). Esse foi o caminho que o
usuário escolheu (em vez de desabilitar a confirmação de e-mail no painel) —
ver Step 7 em "Estado atual", abaixo.

**Pré-requisito manual ainda pendente**: o template "Confirm signup" no
painel do Supabase (Authentication → Email Templates) precisa ser editado
para mostrar `{{ .Token }}` (o código de 8 dígitos) — por padrão o template
só tem o link mágico `{{ .ConfirmationURL }}`, sem o token visível, então o
Step 7 não tem o que exibir para o usuário digitar enquanto essa edição
manual não acontecer. Um template HTML pronto, já com a marca da Inova
Cumaú e **sem** `{{ .ConfirmationURL }}`, está em
`docs/email-templates/confirm-signup.html` — ver "Template de e-mail de
confirmação" em Convenções, abaixo, para o motivo de remover o link e o
passo a passo de onde colar. Essa edição é 100% manual (Authentication →
Email Templates no painel do Supabase) — não há ferramenta MCP do Supabase
para templates/config de Auth, então nunca deve ser feita unilateralmente
por mim.

Testado com um e-mail real (`gmail.com`, mailbox inexistente — ver gotcha de
validação de domínio em Convenções): confirmado via `execute_sql` que o
`auth.users` recebe a linha nova (`email_confirmed_at: null`) enquanto o
código não é confirmado, e `startup_registrations` só recebe a linha depois
do `verifyOtp` bem-sucedido. Da mesma forma, `/entrar` (`signIn`) rejeita
login de um usuário ainda não confirmado com a mensagem genérica "E-mail ou
senha incorretos." (mesma mensagem de qualquer outra falha — escolha
deliberada de segurança para não revelar se a conta existe).

## Estado atual

**Feito**: monorepo, Next.js + shadcn/ui + tokens de marca, fontes, schema Supabase +
clients + types, extração dos 6 logos SVG (`color`, `white`, `dark`, `floresta`,
`rio`, `floresta900`), site multi-página com mega-menu. Home (`/`) expandida com
seções institucionais:
`Hero` → `About` (`components/sections/about.tsx`, teaser "quem somos") → `Offers`
(`components/sections/offers.tsx`, benefícios de associar-se) → seção "Portal"
(grid de hubs Sobre/Notícias/Mídia/Parceiros, inline em `page.tsx`) → `Movements`
(`components/sections/movements.tsx`, editais/eventos/novidades/comunicados) →
`Newsletter`.

Tela de login em `/entrar` (`components/login-form.tsx`, bloco login-04 do
shadcn). Wizard de cadastro de startups em `/associe-se`
(`components/registration-wizard/`), substituindo o antigo formulário simples de
`leads_associacao`: 6 steps (dados do responsável, dados do negócio, contato,
segmentação, termos, login/senha) validados com **Zod** por step, estado do
wizard mantido em memória (`useState`) no client até o step final, que usa
`useActionState` + a Server Action `submitRegistration` para criar o usuário no
Supabase Auth e inserir em `startup_registrations`.

Step 1 (`steps/step-1-responsavel.tsx`) tem, nesta ordem: Responsável pela
Inscrição, **E-mail** (`responsavel_email`, obrigatório, logo após o nome e
antes do grid de telefone/whatsapp), Celular/WhatsApp (grid 2 colunas,
`PhoneCountryInput`) e Cargo/função. Step 3 (`steps/step-3-contato.tsx`) foi
expandido para paridade com o Step 1: além do e-mail público da startup, agora
tem um grid de 2 colunas com **Telefone** (`contato_telefone`, obrigatório) e
**WhatsApp** (`contato_whatsapp`, opcional) — ambos usando o mesmo componente
`PhoneCountryInput` do Step 1 (antes o WhatsApp usava `Input` + `formatPhone`
solto) — seguido de Site, Instagram, Facebook e LinkedIn
(`startup_site`/`contato_instagram`/`contato_facebook`/`contato_linkedin`,
todos opcionais, componente `UrlInput` — ver "Campo de link com prefixo
https:// fixo" em Convenções, abaixo), cada um em sua própria linha (sem grid
de colunas — pedido explícito do usuário para não agrupar as três redes
sociais lado a lado). **Verificado no navegador** via medição de
`getBoundingClientRect()`: Telefone/WhatsApp renderizam na mesma linha (grid 2
colunas, padrão do Step 1) e Site/Instagram/Facebook/LinkedIn renderizam
empilhados, um por linha (mesmo `left`/`width`, `top` sequencial).

Step 2 do wizard (`steps/step-2-empreendimento.tsx`) tem, nesta ordem, CNPJ
(+ checkbox "ainda não possuo CNPJ") como **primeiro campo**, Nome do Negócio,
Endereço comercial (`contato_endereco`, opcional) e Cidade (`contato_cidade`,
obrigatória) — estes dois últimos foram relocados do Step 3 para o Step 2 para
não fragmentar um mesmo endereço em duas etapas, reutilizando as mesmas
colunas do Supabase (sem migration nova). O campo Endereço comercial não tem
`FieldDescription` (texto explicativo abaixo do input) — só label e erro de
validação, igual aos demais campos do step. CNPJ é validado por checksum
(`lib/cnpj.ts`, `isValidCNPJ`) e, quando os 14 dígitos são válidos, consulta a
BrasilAPI via Server Action (`lookupCnpj` em `actions.ts`) para preencher
automaticamente `startup_nome`, `contato_endereco` e `contato_cidade` — tudo
dentro do próprio Step 2, sem callback entre steps (o antigo mecanismo
`onAutofill`/`handleAutofill` em `wizard.tsx` foi removido). O autofill nunca
sobrescreve um valor já digitado manualmente (`v.field || result.data.value`)
e `contato_endereco`/`contato_cidade` continuam habilitados mesmo com "ainda
não possuo CNPJ" marcado (só o campo de CNPJ é desabilitado nesse caso) — ou
seja, quem não tem CNPJ ainda preenche o endereço manualmente. Step 3
(`steps/step-3-contato.tsx`) ficou só com os canais públicos: e-mail,
telefone/WhatsApp e os links (site, Instagram, Facebook, LinkedIn).
**Verificado end-to-end no navegador**: ordem dos campos no Step 2,
autopreenchimento com CNPJ real (nome/endereço/cidade preenchidos juntos),
preservação de valores digitados manualmente após o autofill, campos de
endereço/cidade habilitados com o checkbox de ausência marcado, e Step 3 sem
mais os campos de endereço/cidade — todos os caminhos funcionam corretamente.

Step 4 (`steps/step-4-segmentacao.tsx`) trocou a antiga grade de checkboxes de
segmentos por um combobox multi-select com busca, `MultiSelectCombobox`
(`components/registration-wizard/multi-select-combobox.tsx`, componente
genérico — ver "Combobox multi-select com busca" em Convenções, abaixo). A
lista de segmentos (`TECH_SEGMENTS` em `constants.ts`) tem 24 verticais
"-tech" reais do ecossistema de startups (adtech, agrotech, biotech,
construtech, cybertech, deeptech, edtech, femtech, fintech, foodtech, govtech,
greentech, healthtech, hrtech, insurtech, legaltech, logtech, martech,
mobilitytech, proptech, retailtech, sportech, traveltech) + "Outra" (abre
campo de texto livre). O termo é **"Agrotech"** (não "Agtech") especificamente
para casar com a busca em português — usuários buscando "agro" não
encontrariam "Agtech" (substring não bate). O `PhoneCountryInput` (Step 1 e
Step 3) também ganhou um campo de busca no popup de código de país — ver
mesma seção de Convenções.
**Verificado end-to-end no navegador**: busca por dial code ("55" → Brasil,
Albânia, Camboja, Tanzânia) e por nome de país no `PhoneCountryInput`;
autofoco no campo de busca, filtro por label/value ("agro" → Agrotech,
"fintech" → Fintech), seleção múltipla, remoção de badge individual, exibição
condicional do campo "Qual segmento?" ao marcar "Outra", e bloqueio de avanço
com a mensagem "Selecione ao menos um segmento." quando nenhum segmento está
selecionado — todos no `MultiSelectCombobox`.

Step 4 também ganhou um segundo campo multi-select, **Objetivo da filiação**
(`objetivo_filiacao`): reutiliza o mesmo `MultiSelectCombobox` genérico, com as
opções de `OBJETIVOS_FILIACAO` em `constants.ts` (Acesso a mentorias,
Networking, Financiamento, Leis e tributações atraentes, Investimentos,
Outros). Ao marcar "Outros" aparece o campo condicional "Qual objetivo?"
(`objetivo_filiacao_outro`), mesmo padrão de "Qual segmento?"/`segmento_outro`
— validado em `step4Schema`/`wizardDataSchema` via `superRefine`. Ordem final
do Step 4 (pedido explícito do usuário para manter "Outros detalhes" logo
após Segmentos de atuação, em vez de no fim do step): Segmentos de atuação →
[Qual segmento?] → Outros detalhes (textarea com contador, opcional) →
Objetivo da filiação → [Qual objetivo?].
**Verificado end-to-end no navegador**: validação bloqueando avanço com
"Selecione ao menos um segmento."/"Selecione ao menos um objetivo." quando
ambos os campos estão vazios, seleção múltipla e remoção de badge em
"Objetivo da filiação", exibição condicional de "Qual objetivo?" ao marcar
"Outros", submissão do step avançando corretamente para o Step 5 (Termos) com
os dois multi-selects preenchidos, e a nova ordem dos campos (Outros detalhes
entre "Qual segmento?" e Objetivo da filiação) renderizando corretamente.

Step 4 também teve o campo "Outros detalhes" (`segmentacao_outros_detalhes`)
reposicionado para logo após "Segmentos de atuação"/[Qual segmento?] — pedido
explícito do usuário para não deixá-lo isolado no fim do step. Ordem
reconfirmada em `steps/step-4-segmentacao.tsx`: Segmentos de atuação → [Qual
segmento?] → Outros detalhes → Objetivo da filiação → [Qual objetivo?].

Step 5 (`steps/step-5-termos.tsx`) trocou o antigo aviso de placeholder por
dois cards lado a lado (`grid gap-3 sm:grid-cols-2`) — "Termos de Uso"
(`IconFileText`) e "Política de Privacidade" (`IconShieldLock`) — cada um
implementado como `LegalDocumentCard`, um `Card` clicável envolto por um
`Dialog` (ver "Card clicável que abre Dialog com conteúdo legal" em
Convenções, abaixo). O conteúdo (genérico, mas adaptado ao contexto da Inova
Cumaú — cadastro de associação, área logada futura, dados tratados conforme
LGPD) vive em `registration-wizard/legal-content.ts`, 10 seções cada,
pesquisado a partir de padrões comuns de Termos de Uso/Política de
Privacidade e adaptado ao ecossistema da associação, sem inventar nenhum dado
real (nenhum e-mail/telefone/CNPJ/endereço da Inova Cumaú é citado — o texto
referencia genericamente "canais de contato oficiais"/"rodapé deste site").
O checkbox de aceite (`termos_aceitos`) segue abaixo dos cards, validado por
`step5Schema` (`z.literal(true, ...)`), bloqueando "Continuar" até ser
marcado. **Verificado end-to-end no navegador**: os dois cards abrem seus
Dialogs com o título e as 10 seções corretas de `legal-content.ts` (conteúdo
extraído via JS e comparado byte a byte), o checkbox alterna corretamente, e
"Continuar" só avança para o Step 6 (Criar conta) com o checkbox marcado —
resolvendo a pendência de "conteúdo real de termos/políticas de uso".

Step 5 teve três ajustes adicionais: (1) o `CardTitle` de cada card ("Termos de
Uso"/"Política de Privacidade") também usa `font-sans` (Geist), igual ao
`DialogTitle` — antes só o título do Dialog tinha o override; (2) o texto do
checkbox de aceite foi encurtado de "Li e concordo com os Termos de Uso e a
Política de Privacidade da Inova Cumaú." para "Li e concordo com os Termos de
Uso e a Política de Privacidade." (removido "da Inova Cumaú"), com o asterisco
de obrigatório reaproveitando o padrão `-ml-1.5 text-destructive` de
`FieldLabel` (`field.tsx`) para ficar rente ao texto; (3) o checkbox de aceite
agora **exige leitura completa dos dois documentos antes de habilitar**: cada
`LegalDocumentCard` recebe `read`/`onRead` do `Step5Termos` (estado
`termosRead`/`privacyRead`), e o Dialog interno detecta fim de leitura via
`checkScrolledToEnd` (`el.scrollHeight - el.scrollTop - el.clientHeight <= 4`)
chamado tanto no `onScroll` do container quanto (via `setTimeout(0)`) no
`onOpenChange`, cobrindo o caso do conteúdo já caber inteiro sem precisar
rolar. Enquanto `canAccept = termosRead && privacyRead` for falso, o checkbox
fica `disabled` (label com `opacity-50`) e uma dica aparece abaixo ("Abra e
leia até o final os Termos de Uso e a Política de Privacidade para liberar a
confirmação."); um ícone de check (`IconCheck`) aparece no título do card
assim que aquele documento é lido. **Verificado end-to-end no navegador**:
fonte Geist confirmada via `getComputedStyle` nos dois `CardTitle`, texto
exato do checkbox sem "da Inova Cumaú" com asterisco logo em seguida, checkbox
iniciando desabilitado com a dica visível, habilitando (dica some, checkbox
`disabled`/`aria-disabled` viram `null`) só depois de rolar os dois Dialogs
até o fim (com checkmark aparecendo em cada card conforme lido). Reaplicar
esse padrão de "leitura obrigatória antes de liberar ação" (`read`/`onRead` +
detecção de fim de scroll) em qualquer documento textual longo futuro que
precise de confirmação de leitura, não só de aceite.

Step 6 (`steps/step-6-credenciais.tsx`) é o passo final do wizard: e-mail de
acesso, senha e confirmar senha, usando `useActionState` + a Server Action
`submitRegistration` (`app/associe-se/actions.ts`). **Não existe tabela de
login própria** — a decisão de arquitetura foi reutilizar `auth.users`, a
tabela nativa do Supabase Auth (já é o "login" da plataforma, vinculada a
`startup_registrations` via `user_id` único), em vez de criar uma tabela
nova. Critérios de senha (`PASSWORD_REQUIREMENTS`/`PASSWORD_SPECIAL_CHARS` em
`schema.ts`): mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1
caractere especial do conjunto literal `!@#$%¨&*` (inclui o `¨` de crase —
não é erro de digitação, é um caractere permitido). Abaixo do input de senha,
uma lista (`PASSWORD_REQUIREMENTS.map`) mostra cada critério com
`IconCircleCheck` (Tabler) e o texto do requisito: `text-success-700` quando
o critério é atendido (calculado ao vivo a cada tecla, via `useState` local
`senha`), `text-muted-foreground` quando não. O e-mail e a confirmação de
senha são inputs não-controlados (sem `value`/`onChange`); só o campo de
senha em si é controlado (`useState`), pois precisa alimentar o checklist ao
vivo. `submitRegistration` chama `supabase.auth.signUp({ email, password })`
e só insere em `startup_registrations` diretamente se `signUp` já devolver
uma sessão ativa (caso raro); no caso comum (sem sessão, confirmação de
e-mail pendente), retorna `{ status: "otp_pending", email }` e o wizard
avança para o Step 7 (ver abaixo) em vez de tratar isso como erro terminal.
**Verificado end-to-end no navegador**: o checklist alterna corretamente
cor/estado a cada critério conforme a senha é digitada, e a submissão do
formulário efetivamente chama `signUp`, cria a linha em `auth.users`
(confirmado via `execute_sql`) e leva ao Step 7.

O cabeçalho principal do wizard (`StepCard`, `components/registration-wizard/step-card.tsx`)
esconde o ícone grande acima do título/descrição especificamente para o Step 6
(`showIcon = step.key !== "credenciais"`) — pedido explícito do usuário. `STEPS`
(`constants.ts`) permanece sem alteração (todo step, incluindo `credenciais`,
mantém seu `icon: IconLock` etc.), então o ícone menor de cada step na barra
lateral (`StepperNav`, `components/registration-wizard/stepper-nav.tsx`) não é
afetado — `StepperItem` renderiza `<Icon />` incondicionalmente para todo item,
sem checar `step.key`. **Verificado end-to-end no navegador**: o cabeçalho do
Step 6 renderiza só `h1`/`p` (zero `<svg>`), enquanto o item "Criar conta" na
`StepperNav` continua mostrando o ícone de cadeado (`tabler-icon-lock`)
normalmente. Reaplicar esse padrão (flag por `step.key` só no `StepCard`,
nunca em `STEPS`) caso outro step precise esconder/customizar o ícone do
cabeçalho principal sem afetar a barra lateral.

O título deste step (`title` em `STEPS`, `constants.ts`) foi renomeado de
"Login e senha" para "Criar conta" — pedido explícito do usuário, texto mais
direto para o usuário final. O `key: "credenciais"` permanece inalterado
(usado em `showIcon = step.key !== "credenciais"` no `StepCard`, ver acima),
então nenhuma lógica condicional por `key` foi afetada. O texto do botão de
submit do step (`steps/step-6-credenciais.tsx`) também mudou de "Concluir
cadastro" para "Criar conta", mantendo o título do step e o rótulo do botão
consistentes entre si. A `description` deste step (subtítulo exibido no
`StepCard`, abaixo do `h1`) também foi trocada de "Dados de acesso para a
gestão interna." para "E-mail e senha de acesso à sua conta." — pedido
explícito do usuário para deixá-la congruente com o novo título "Criar
conta" (a antiga soava como acesso administrativo interno, não como criação
de conta do próprio usuário) e mais curta, no mesmo padrão enxuto das
demais `description`s de `STEPS`.

Step 7 (`steps/step-7-confirmacao.tsx`) é o novo passo final, adicionado
para resolver o gap de confirmação de e-mail: o `wizard.tsx` guarda o
e-mail recém-cadastrado em `otpEmail` (`useState`, setado por
`handleSignedUp` quando `Step6Credenciais` detecta `state.status ===
"otp_pending"` via `useEffect`) e renderiza o Step 7 com um `InputOTP` de
**8 dígitos**. O form usa `useActionState(verifyRegistrationOtp, ...)`,
enviando `email` + `code` + o mesmo `payload` (JSON dos steps 1–5) num
input hidden; `verifyRegistrationOtp` (`actions.ts`) revalida tudo com Zod
(`step7Schema`/`wizardDataSchema`) no servidor, chama
`supabase.auth.verifyOtp({ email, token, type: "signup" })` e só então
insere em `startup_registrations` via `insertStartupRegistration` (mesmo
helper compartilhado com `submitRegistration`) — é só nesse momento que
`auth.uid()` passa a existir e a RLS libera o insert. Há também um botão
"Reenviar código" chamando `resendRegistrationOtp` (`supabase.auth.resend({
type: "signup", email })`) diretamente do client (Server Action chamada a
partir de um handler de evento, mesmo padrão de `lookupCnpj`), com feedback
local de "enviado"/erro e um **cooldown de 60s** entre reenvios (ver
"Rate limit do Supabase Auth no reenvio de código", abaixo — versão
atualizada, o cooldown deixou de ser ausente). O bloco final de sucesso
("Cadastro realizado!") foi
movido do Step 6 para o Step 7, já que agora é ali que o sucesso real
acontece. Esse bloco (e sua cópia idêntica em `step-6-credenciais.tsx`, que
só aparece no caminho raro em que `signUp` já retorna sessão ativa sem
passar pelo OTP) ganhou um `IconCircleCheck` (Tabler) grande —
`size-12 text-success-600` — acima do texto de apoio, para reforçar
visualmente o sucesso (pedido explícito do usuário). Reaplicar essa dupla
edição (Step 6 + Step 7) sempre que o texto/estrutura desse bloco de
sucesso mudar, já que os dois arquivos mantêm o mesmo JSX duplicado por
enquanto (sem componente compartilhado extraído). O texto de apoio também
foi trocado de "Nosso time vai analisar suas informações e entrar em
contato em breve." para "Você já pode entrar com seu e-mail e senha." —
pedido explícito do usuário: o cadastro não passa por nenhuma
validação/aprovação manual da equipe, o usuário já pode fazer login
imediatamente. Uma versão intermediária desse texto mencionava "— em breve
você terá acesso à área de associado", mas o usuário pediu a remoção desse
trecho na sequência, deixando só a frase de login.

Ao validar o cadastro (sucesso em `Step6Credenciais` ou `Step7Confirmacao`),
três coisas acontecem simultaneamente, pedido explícito do usuário: (1) o
step final também aparece marcado como concluído na `StepperNav` da coluna
esquerda; (2) os pontinhos de progresso (`StepProgressDots`) na coluna
direita somem; (3) surge um botão levando direto para a área do associado.
Implementado com um estado `isComplete` (`useState`) elevado a
`RegistrationWizard` (`wizard.tsx`), setado por uma função `handleCompleted`
passada como prop `onComplete` para `Step6Credenciais` e `Step7Confirmacao`
— cada um chama `onComplete()` dentro do `useEffect` que já observava
`state.status`, no mesmo padrão do par `onSignedUp`/`handleSignedUp` usado
para a transição de OTP pendente. `isComplete` flui para dois lugares:
`StepperNav` ganhou uma prop `isComplete` que altera o cálculo de
`isDone` para `isComplete || index < currentIndex` (antes o último step
nunca podia satisfazer `index < currentIndex`, então nunca aparecia
marcado); `StepCard` ganhou uma prop `hideProgress` que, quando `true`,
suprime o bloco de `StepProgressDots` no fim do card. O botão novo em
ambos os blocos de sucesso usa o padrão polimórfico já estabelecido no
app (`Button render={<Link href="/area-do-associado" />}
nativeButton={false}`, mesmo padrão do CTA "Associe-se" em
`site-header.tsx`) — reaplicar essa dupla edição (Step 6 + Step 7) junto
com a já existente sempre que esse bloco de sucesso mudar.

Criada a rota `/area-do-associado`
(`apps/web/src/app/area-do-associado/page.tsx`), destino do botão acima.
Segue a mesma convenção de rota isolada (fora do grupo `(marketing)/`) já
usada por `/entrar` e `/associe-se` — layout centralizado
`min-h-svh flex flex-col items-center justify-center bg-muted`, modelado
em `entrar/page.tsx`, com logo, um ícone-badge (`IconTools`, mesmo padrão
visual `size-11`/`rounded-lg`/`border-[1.4px]` do ícone de step do
`StepCard`), título/descrição de placeholder e um botão "Voltar para o
início". Página propositalmente sem nenhuma funcionalidade real (sem
autenticação, sem dados) — pedido explícito do usuário para só criar a
página/rota como destino válido do link, sem construir a área ainda.

**Correção do tamanho do código (6 → 8 dígitos)**: o plano original (e a
primeira implementação) assumiu 6 dígitos, valor mais comum do GoTrue
(`Mailer.OtpLength`, configurável de 6 a 10 no servidor). Um teste real
mostrou que o e-mail de confirmação enviado por este projeto Supabase
efetivamente traz um código de **8 dígitos**, não 6 — o que bloqueava
qualquer confirmação, já que `step7Schema` (`length(6)`/`regex(/^\d{6}$/)`)
e o `InputOTP` (`maxLength={6}`) rejeitavam o código antes mesmo de chamar
`verifyOtp`. Corrigido em `schema.ts` (`step7Schema` agora usa `length(8,
"Informe o código de 8 dígitos.")` + `regex(/^\d{8}$/, ...)`) e em
`step-7-confirmacao.tsx` (`InputOTP maxLength={8}`, dividido em dois
`InputOTPGroup` de 4 slots cada — índices 0–3 e 4–7 — separados por
`InputOTPSeparator`; copy atualizada para "Enviamos um código de 8
dígitos..."). Reaplicar esse cuidado (nunca assumir 6 dígitos como fixo)
caso o `Mailer.OtpLength` deste projeto seja alterado no futuro — o valor
correto só pode ser confirmado testando um e-mail real, não deduzido do
padrão mais comum do GoTrue.

**Rate limit do Supabase Auth no reenvio de código**: usuário reportou que
"Reenviar código" no Step 7 sempre mostrava "Não foi possível reenviar o
código agora. Tente novamente em instantes." A causa raiz, achada via
`get_logs` (service `auth`) no projeto Supabase, não era um bug de
aplicação: o GoTrue aplica um rate limit de segurança embutido por
e-mail em endpoints que enviam e-mail (`/resend`, `/signup`), retornando
HTTP 429 com `error_code: "over_email_send_rate_limit"` e uma mensagem
tipo `"For security purposes, you can only request this after 43
seconds."` — uma janela de ~60s por endereço, não configurável pelo
painel. `resendRegistrationOtp` (`actions.ts`) descartava todo detalhe do
erro (`return { error: Boolean(error) }`), então qualquer 429 virava a
mesma mensagem genérica sem indicar a causa nem o tempo de espera. Corrigido
em duas partes: (1) `resendRegistrationOtp` agora faz parse do tempo de
espera na mensagem do Supabase (`/after (\d+) seconds?/i`) e retorna
`{ error: true, retryAfterSeconds }`; (2) `step-7-confirmacao.tsx` ganhou
um cooldown local (`cooldown`/`setCooldown`, `useState` iniciado em
`RESEND_COOLDOWN_SECONDS = 60`, decrementado por um único `setInterval`
dentro de um `useEffect` de dependência vazia) que desabilita o botão
"Reenviar código" e mostra a contagem regressiva no próprio rótulo
(`Reenviar código (Ns)`) enquanto `cooldown > 0`; `handleResend` ignora
cliques nesse intervalo e, a cada tentativa, reseta o cooldown para
`retryAfterSeconds` (se o 429 ainda assim ocorrer) ou para 60s por padrão.
O cooldown começa "quente" (60s) já na montagem do step, não só após um
clique em "Reenviar" — necessário porque o `signUp()` do Step 6 já dispara
o e-mail de confirmação inicial antes do usuário chegar ao Step 7, então a
mesma janela de rate limit do Supabase já está em vigor desde o primeiro
render. Reaplicar esse mesmo padrão (nunca descartar o erro do Supabase
Auth sem parsear tempo de espera; cooldown client-side pré-emptivo, não só
reativo) em qualquer outro fluxo futuro que dispare e-mails via GoTrue
(reset de senha, magic link etc.).

**Feedback de reenvio de código migrado para toast** (shadcn/Toast nativo —
ver "Toasts" em Convenções, abaixo): o aviso "Código reenviado. Confira
seu e-mail." (e seu par de erro) deixaram de ser `FieldDescription` inline
sob o botão "Reenviar código" e viraram `toast.add(...)` disparados direto
de `handleResend` (`step-7-confirmacao.tsx`), removendo o antigo state local
`resendState`. Mapeamento de variante por status real (não mais um
`cooldown > 0` checado em render, que deixava o branch de erro quase
inatingível): reenvio bem-sucedido → `toast.add({ type: "success",
description: "Código reenviado. Confira seu e-mail." })`; bloqueado por
rate limit do Supabase (`result.retryAfterSeconds` presente) → `type:
"warning"` com o tempo de espera na própria mensagem (`Aguarde Ns antes de
tentar novamente.`) — tratado como aviso benigno/esperado, não erro; falha
genérica (sem `retryAfterSeconds`) → `type: "error"` ("Não foi possível
reenviar o código agora. Tente novamente em instantes."). A mensagem de
erro de código incorreto/expirado (`state.status === "error"` retornado
por `verifyRegistrationOtp`) também migrou de `FieldError` inline para
toast (`type: "error"`) — ver "Erros de resultado de Server Action" em
"Toasts" nas Convenções, abaixo, para o motivo (pedido posterior do
usuário, depois de notar que esse tipo de mensagem de resultado de
submissão ainda aparecia como texto solto no conteúdo do formulário).
(Migrado depois de Sonner para o Toast nativo do shadcn — ver "Toasts"
em Convenções.)

**Verificado end-to-end no navegador** (wizard completo, Steps 1→7, com
dados fictícios): preenchimento dos Steps 1–4 sem erros; Step 5 (Termos)
com o gate de leitura obrigatória liberado após abrir e rolar os dois
Dialogs até o fim; Step 6 submetido com sucesso via `signUp()` real
(linha nova confirmada em `auth.users` via `execute_sql`); Step 7
alcançado e inspecionado via DOM, confirmando exatamente a estrutura
esperada (`{ groupCount: 2, hasSeparator: true, maxLength: 8, slotCount: 8
}`) e a copy "Enviamos um código de 8 dígitos". Também verificado o
caminho de código incorreto: submeter "00000000" exibe corretamente
"Código incorreto ou expirado. Confira o e-mail e tente novamente." sem
crash. **Ainda não verificado end-to-end**: o caminho de sucesso completo
do OTP (código real recebido por e-mail → `verifyOtp` → insert em
`startup_registrations` → login) — bloqueado pelo "Pré-requisito manual
ainda pendente" descrito na seção Supabase acima (o template "Confirm
signup" do Supabase precisa ser editado para mostrar `{{ .Token }}`, o que
ainda não foi feito no painel).

`/entrar` (`components/login-form.tsx` + `app/entrar/actions.ts`,
`signIn`) usa `supabase.auth.signInWithPassword({ email, password })` e
redireciona para `/area-do-associado` em caso de sucesso; em qualquer erro
(credenciais erradas ou e-mail não confirmado), mostra a mesma mensagem
genérica "E-mail ou senha incorretos.", sem crash e sem distinguir os dois
casos (não revela se a conta existe). Essa mensagem é exibida via toast
(`type: "error"`, disparado por um `useEffect` observando `state.status
=== "error"` — mesmo padrão de `submitRegistration`/`verifyRegistrationOtp`,
ver "Erros de resultado de Server Action" em "Toasts" nas Convenções),
não mais como `FieldError` inline. **Verificado end-to-end no
navegador**: credenciais erradas e credenciais corretas-mas-não-confirmadas
mostram esse erro corretamente; o caminho de sucesso (login válido →
redirect) está sujeito ao mesmo gap de confirmação de e-mail acima e não foi
observável neste ambiente. **Correção**: o redirect pós-login apontava para
`/` (home) em vez de `/area-do-associado` — a página de destino já existia
(criada numa tarefa anterior, ver Step 7 acima), só o `redirect()` em
`signIn` (`app/entrar/actions.ts`) estava desatualizado. Corrigido para
`redirect("/area-do-associado")`.

`entrar/page.tsx` ganhou um link "Voltar para o início" (`href="/"`) acima do
`LoginForm`, pedido explícito do usuário ("na tela de login, criar um link
para voltar pra home"). Reaproveita a mesma convenção já documentada acima
("Link "Voltar para o início" no topo do lado 1 do wizard") — mesmo texto e
mesma classe (`text-sm text-muted-foreground underline-offset-2
hover:text-foreground hover:underline`), aqui com `inline-block` (em vez de
estar dentro de um `<aside>` flex como no wizard, o link fica direto no `div`
de centralização da página, então precisa de `inline-block` para o `mb-6`
funcionar) em vez de posicionado dentro de um `<aside>`/logo — decisão de
estilo minha, não pedida explicitamente, para manter consistência visual com
o link equivalente do wizard. Typecheck (`pnpm --filter @inova-cumau/web
typecheck`) rodou limpo; não verificado no navegador (regra permanente, ver
"Fluxo de verificação" no topo deste arquivo).

**Sidebar da área do associado**: instalado `npx shadcn@latest add sidebar-07`
dentro de `apps/web`, **exatamente como o bloco de exemplo do shadcn** (pedido
explícito do usuário: "criar exatamente como é no componente exemplo e depois
vamos mudando... conforme a necessidade que eu te indicar") — sem nenhuma
customização de conteúdo, cores ou ícones ainda. A CLI criou originalmente a
rota `/dashboard` (stock) com dados de exemplo (`AppSidebar` em
`components/app-sidebar.tsx` + `NavMain`/`NavProjects`/`NavUser`/
`TeamSwitcher`), além dos componentes de UI que faltavam (`sidebar.tsx`,
`breadcrumb.tsx`, `collapsible.tsx`, `skeleton.tsx`, `hooks/use-mobile.ts`).
Como o bloco usa ícones `lucide-react` (`components.json` tem `iconLibrary:
"lucide"`), essa é a única parte do app que foge à convenção Tabler do
projeto — deliberadamente mantido assim por enquanto, já que o pedido foi
instalar sem alterar; qualquer troca de ícone fica para um pedido futuro
explícito. `TooltipProvider` (de `components/ui/tooltip.tsx`, que já existia
no projeto) foi adicionado ao `app/layout.tsx` envolvendo `{children}` —
exigido pelo próprio aviso da CLI ao final da instalação, já que os tooltips
do sidebar colapsado (labels dos itens de menu) não funcionam sem esse
provider. A CLI tentou sobrescrever dois arquivos com customizações
documentadas deste projeto — `input.tsx` (token `--text-placeholder`, ver
"Tokens de marca" acima) e `dropdown-menu.tsx` (prop `anchor`, ver convenção
de "DropdownMenu/Menu" acima) — instalado com `--overwrite --yes` para rodar
sem prompts interativos e, na sequência, os dois arquivos foram restaurados
via `git checkout` (estavam limpos/sem alterações pendentes antes da
instalação, então a restauração não teve risco de perda de trabalho).
Reaplicar esse mesmo cuidado (`--diff` antes de `--overwrite`, depois `git
checkout` nos arquivos com customização documentada) em qualquer instalação
futura de bloco shadcn que toque arquivos de `components/ui/` já
customizados pelo projeto.

Em seguida, pedido explícito do usuário para mover a rota: o conteúdo de
`/dashboard/page.tsx` (stock, inalterado) foi transferido para
`app/area-do-associado/page.tsx`, substituindo o antigo placeholder
("Estamos construindo esta área...") — só o `export const metadata` (título
"Área do associado | Inova Cumaú") foi preservado do placeholder antigo, todo
o resto do JSX é o bloco `sidebar-07` completo (`SidebarProvider` +
`AppSidebar` + `SidebarInset` com header/breadcrumb/skeletons de exemplo). A
pasta `app/dashboard/` foi removida (`rm -rf`) — nenhum outro arquivo do
projeto referenciava `/dashboard` (confirmado via busca antes de apagar), e
`/area-do-associado` já era o destino de todos os redirects/links existentes
(`signIn` em `entrar/actions.ts`, os botões de sucesso dos Steps 6/7 do
wizard), então nenhum outro arquivo precisou mudar. Segue com dados 100%
stock (times/nav/usuário fictícios) e ícones `lucide-react`, aguardando a
próxima instrução do usuário sobre conteúdo real. Typecheck (`pnpm --filter
@inova-cumau/web typecheck`) rodou limpo após as duas etapas (install +
mudança de rota); não verificado no navegador (regra permanente, ver "Fluxo
de verificação" no topo deste arquivo).

Primeira etapa de "abrasileirar" o sidebar-07 (`components/app-sidebar.tsx` +
`components/team-switcher.tsx`): o `data.teams` (antes 3 empresas fictícias —
"Acme Inc"/"Acme Corp."/"Evil Corp." com ícones `lucide-react` avulsos e
`plan` "Enterprise"/"Startup"/"Free") virou 2 entradas, ambas **"Inova
Cumaú"**, distinguidas só pelo campo `plan` — **"Associado"** e
**"Administrador"** (pedido explícito do usuário: "Enterprise" representava o
tipo de usuário, e os dois tipos que o app vai ter são esses). O ícone de
cada entrada trocou de `GalleryVerticalEndIcon`/`AudioLinesIcon`/
`TerminalIcon` (lucide) para `<Logo variant="white" className="h-4 w-auto" />`
(`components/logo.tsx`) — a variante "mono-branca" do glifo da marca,
satisfazendo o pedido de "logo mono-branca sobre floresta" **sem precisar de
nenhum CSS novo**: o container do trigger principal (`size-8`) já era
`bg-sidebar-primary text-sidebar-primary-foreground`
(`--color-sidebar-primary` → `--nav-active-bg` → `--floresta-700`/
`--floresta-500` claro/escuro; `--color-sidebar-primary-foreground` → branco
nos dois temas), então só trocar o ícone já bastou ali. O container menor
dentro do dropdown (`size-6`, item de cada team na lista) **não** tinha esse
fundo (só `border`) — ganhou `bg-sidebar-primary text-sidebar-primary-foreground`
no lugar de `border` para o logo branco continuar visível ali também. A
`key` do `.map()` sobre `teams` trocou de `team.name` para `team.plan`, já
que as duas entradas agora compartilham o mesmo `name`. **Nenhuma lógica de
nível de acesso/permissão foi implementada** — `plan` é hoje só um rótulo de
texto exibido, sem nenhum efeito em rotas, componentes ou dados; o próprio
usuário pediu para deixar isso para um próximo passo explícito ("Por
enquanto ainda não vamos mexer no nível de acesso"). O rótulo "Teams" (label
do grupo no dropdown) e o item "Add team" no fim do popup **permanecem em
inglês, stock** — não foram tocados nesta tarefa, já que não foram pedidos
explicitamente e têm relação direta com o desenho ainda pendente de
níveis de acesso (ex.: "Add team" não faz sentido nesse domínio de
associado/administrador único). Typecheck (`pnpm --filter @inova-cumau/web
typecheck`) rodou limpo; não verificado no navegador (regra permanente, ver
"Fluxo de verificação" no topo deste arquivo).

`/area-do-associado` (`app/area-do-associado/page.tsx`) virou um Server
Component **assíncrono** e passou a puxar dados reais do usuário logado, no
lugar do `data.user` stock (`name: "shadcn"`, `email: "m@example.com"`,
`avatar: "/avatars/shadcn.jpg"`) que `AppSidebar` usava antes. Fluxo: chama
`supabase.auth.getUser()` (client de `@inova-cumau/supabase/server`) e, se
não houver usuário autenticado, `redirect("/entrar")` — guarda de acesso que
a página não tinha até então (interpretação minha, não pedida explicitamente,
mas necessária para "dados do usuário logado" fazerem sentido: sem ela a
página quebraria ou mostraria dados vazios para um visitante não autenticado).
Em seguida busca `startup_nome` em `startup_registrations` filtrando por
`user_id = authUser.id` — confirmado via `execute_sql` (MCP Supabase, tabela
`pg_policies`) que existe a policy de RLS `owner can select own registration`
(`SELECT`, `auth.uid() = user_id`), então o Server Component consegue ler a
própria linha do associado autenticado sem precisar de nenhuma policy nova.
O objeto `user` montado e repassado para `<AppSidebar user={user} />` é
`{ name: registration?.startup_nome ?? "Associado", email: authUser.email ??
"", avatar: "" }`. Duas decisões de interpretação a registrar: (1) **"e-mail
cadastrado" foi resolvido como `auth.users.email`** (o e-mail de
login/autenticação, via `getUser()`), não `startup_registrations
.responsavel_email` (e-mail do responsável pela inscrição, coletado no Step 1
do wizard, que pode em tese divergir do e-mail de login) — escolhido por ser
literalmente o e-mail com o qual a conta foi cadastrada/autenticada; (2)
**`avatar` fica vazio (`""`)** porque não existe nenhuma feature de upload de
foto no projeto ainda — `AvatarFallback` cobre esse caso mostrando as
iniciais computadas do nome (ver abaixo), então não há placeholder de imagem
quebrado. `AppSidebar` (`components/app-sidebar.tsx`) ganhou uma prop
obrigatória `user: { name, email, avatar }`, removendo de vez o `data.user`
stock do objeto `data` (que agora só tem `teams`/`navMain`/`projects`); o
componente é `"use client"` mas só repassa a prop para `NavUser`, sem lógica
própria.

`NavUser` (`components/nav-user.tsx`) ganhou duas mudanças: (1) formato do
`Avatar` mudou de círculo para **quadrado com borda arredondada**, igual ao
badge do logo no topo (`TeamSwitcher`, `rounded-lg`) — pedido explícito do
usuário ("vamos usar o Avatar no mesmo formato do logo no topo, quadrado com
borda arredondada"). Como o componente `Avatar` de `components/ui/avatar.tsx`
é compartilhado (`rounded-full` hardcoded em `Avatar`/`AvatarImage`/
`AvatarFallback`, mais um `after:rounded-full` na pseudo-borda de `Avatar`) e
esse arquivo não foi tocado, a troca para `rounded-lg` foi feita via
`className` nos dois pontos de uso dentro de `nav-user.tsx` (trigger do
dropdown + label dentro do dropdown aberto) — `grep` confirmou que `nav-
user.tsx` é o único consumidor de `@/components/ui/avatar` no app hoje, então
não existe nenhum outro Avatar circular no projeto que ficasse inconsistente
com essa mudança; se um novo uso de `Avatar` aparecer no futuro decidir
explicitamente se ele deve seguir o mesmo formato quadrado ou o círculo
default do componente. (2) o fallback trocou do texto hardcoded `"CN"` para
iniciais computadas de verdade a partir do nome (`getInitials`, novo helper
no topo do arquivo: 2+ palavras → primeira letra da primeira + primeira letra
da última, maiúsculas; 1 palavra → duas primeiras letras) — com `startup_nome`
como nome agora, "CN" não fazia mais sentido. Typecheck (`pnpm --filter
@inova-cumau/web typecheck`) rodou limpo; não verificado no navegador (regra
permanente, ver "Fluxo de verificação" no topo deste arquivo) — em especial o
caminho de guarda de acesso (`redirect("/entrar")` sem sessão) e o texto real
de `startup_nome`/`authUser.email` renderizados não foram vistos na tela.

**Tradução completa do inglês remanescente para PT-BR**: pedido explícito do
usuário ("Traduzir tudo que está em inglês para o português-BR"), varrendo o
app inteiro em busca de texto stock/placeholder ainda em inglês, não só a
área `sidebar-07`. Dois arquivos ganharam a tradução completa do conteúdo
stock (`data.navMain`/`data.projects` em `components/app-sidebar.tsx`:
"Playground"→"Área de Testes", "Models"→"Modelos", "Documentation"→
"Documentação", "Settings"→"Configurações", "History"→"Histórico",
"Starred"→"Favoritos", "Genesis"→"Gênesis", "Explorer"→"Explorador",
"Quantum"→"Quântico", "Introduction"→"Introdução", "Get Started"→"Primeiros
Passos", "Tutorials"→"Tutoriais", "Changelog"→"Registro de Alterações",
"General"→"Geral", "Team"→"Equipe", "Billing"→"Faturamento", "Limits"→
"Limites", "Design Engineering"→"Engenharia de Design", "Sales & Marketing"→
"Vendas e Marketing", "Travel"→"Viagens"); `components/nav-main.tsx`
("Platform"→"Plataforma"); `components/nav-projects.tsx` ("Projects"→
"Projetos", "More"→"Mais" ×2, "View Project"→"Ver Projeto", "Share Project"→
"Compartilhar Projeto", "Delete Project"→"Excluir Projeto");
`components/nav-user.tsx` ("Upgrade to Pro"→"Fazer upgrade para o Pro",
"Account"→"Conta", "Billing"→"Faturamento", "Notifications"→"Notificações",
"Log out"→"Sair"); `components/team-switcher.tsx` ("Teams"→"Equipes", "Add
team"→"Adicionar equipe" — tradução literal do rótulo, sem redesenhar a
feature; a incerteza sobre se ela faz sentido no domínio de Associado/
Administrador único segue em aberto, ver item de Pendente abaixo);
`app/area-do-associado/page.tsx` (breadcrumb placeholder "Build Your
Application"→"Construir sua aplicação", "Data Fetching"→"Busca de dados").
Decisão de interpretação: como todo esse conteúdo é 100% dado de exemplo
(`// This is sample data.` no próprio `app-sidebar.tsx`), termos ambíguos
("Genesis", "Quantum" etc.) foram traduzidos por completo em vez de
mantidos em inglês, priorizando consistência de idioma sobre a estética de
nome-de-produto que eles sugerem.

Também tocados **componentes `ui/` compartilhados por todo o app** (não só
pela área logada), já que continham texto de acessibilidade hardcoded em
inglês: `ui/sidebar.tsx` (`SheetTitle` "Sidebar"→"Barra lateral",
`SheetDescription` "Displays the mobile sidebar."→"Exibe a barra lateral em
dispositivos móveis.", e os três "Toggle Sidebar"→"Alternar barra lateral"
— sr-only span, `aria-label`, `title` — do botão de colapsar a sidebar);
`ui/dialog.tsx` e `ui/sheet.tsx` (sr-only "Close"→"Fechar" do botão de
fechar; `ui/dialog.tsx` também tinha um segundo "Close" hardcoded no botão
opcional de `DialogFooter`, `showCloseButton`, sem `sr-only` — mesma
tradução, "Fechar"); `ui/breadcrumb.tsx` (`aria-label="breadcrumb"`→`"trilha de
navegação"` no `<nav>` raiz, sr-only "More"→"Mais" em
`BreadcrumbEllipsis`); `ui/toast.tsx` (`aria-label="Close toast"`→`"Fechar
notificação"` em `ToastClose`). Como `Dialog`/`Sheet`/`Toast` são usados em
todo o app (Steps 2 e 5 do wizard de `/associe-se`, `PhoneCountryInput`,
o fluxo inteiro de toasts de login/cadastro/OTP — ver histórico acima), o
alcance desta mudança vai além da área `sidebar-07` que a originou.
Reaplicar esse mesmo escopo (varrer também os `ui/` compartilhados, não só
o feature que motivou a tarefa) em qualquer pedido futuro de tradução ou
auditoria de texto em inglês. Dois falsos positivos identificados e
descartados na varredura: tokens `.sr-only` como *seletor CSS* dentro de
`className` (ex. `[&>.sr-only]:w-auto` em `field.tsx` — não é texto
visível/lido, é sintaxe Tailwind) e os rótulos "-tech" da lista de
segmentos em `registration-wizard/constants.ts` (ex. "Traveltech") — termos
de vertical de startup deliberados e já documentados, não prosa solta em
inglês. Typecheck (`pnpm --filter @inova-cumau/web typecheck`) rodou limpo;
não verificado no navegador (regra permanente, ver "Fluxo de verificação"
no topo deste arquivo).

**Botão "Sair" funcional**: pedido explícito do usuário ("Tornar o botão Sair
funcional"), escopo deliberadamente restrito só a esse item — os outros três
itens stock do dropdown de `NavUser` ("Fazer upgrade para o Pro", "Conta",
"Faturamento", "Notificações") permanecem não-funcionais, sem terem sido
pedidos. Nova Server Action `signOut` em
`apps/web/src/app/area-do-associado/actions.ts` (arquivo novo, seguindo a
convenção de colocar Server Actions perto da seção que as usa — escolhido
porque `area-do-associado/page.tsx` é hoje o único consumidor de `NavUser`),
espelhando o padrão de `signIn` em `entrar/actions.ts`: chama
`createClient()` de `@inova-cumau/supabase/server`, `supabase.auth.signOut()`
e `redirect("/entrar")`. `/entrar` foi escolhido como destino por já ser o
destino estabelecido para visitante sem sessão (mesmo `redirect("/entrar")`
já usado como guarda de acesso em `area-do-associado/page.tsx`), dando um
caminho imediato de volta ao login. Em `components/nav-user.tsx`, o
`DropdownMenuItem` de "Sair" ganhou `onClick={() => signOut()}`, chamando a
Server Action diretamente como RPC a partir do Client Component (sem
`<form>`) — confirmado antes, lendo `ui/dropdown-menu.tsx`, que
`DropdownMenuItem` espalha as props de `MenuPrimitive.Item` do Base UI e
aceita `onClick` normalmente. Typecheck (`pnpm --filter @inova-cumau/web
typecheck`) rodou limpo; não verificado no navegador (regra permanente, ver
"Fluxo de verificação" no topo deste arquivo).

**Correção arquitetural: sidebar-07 é a área do Admin, não a área do
associado** (pedido explícito do usuário, corrigindo o entendimento de todo o
histórico acima sobre "área do associado"): tudo que este arquivo documentou
até aqui como "área do associado"/`/area-do-associado` (bloco `sidebar-07`,
`AppSidebar`/`NavMain`/`NavProjects`/`NavUser`/`TeamSwitcher`, ícones
`lucide-react`, dados stock) é na verdade a **área do Admin** — movida para a
rota `/admin` (`apps/web/src/app/admin/page.tsx` + `admin/actions.ts`, mesmo
conteúdo/Server Actions de antes, só a pasta renomeada de `area-do-associado`
para `admin`; nenhum outro arquivo referenciava o path antigo fora dos já
listados). A **área do associado real** (associado comum, não admin) é outra
coisa, ainda a ser construída em conteúdo: quando um associado comum faz
login, ele não vai para um dashboard separado — ele continua vendo a mesma
home/landing page institucional (header e rodapé **sempre presentes**, em
toda página, logado ou não), e a única mudança visível é um **avatar no canto
superior direito do header** (`HeaderUserMenu`,
`components/header-user-menu.tsx`) no lugar dos botões "Entrar"/"Associe-se".
Clicar num item do dropdown do avatar leva a páginas de "área de membro" que
também vivem dentro do layout institucional, nunca substituindo header/rodapé.

Implementado: nova rota `apps/web/src/app/(marketing)/area-do-associado/page.tsx`
(dentro do route group `(marketing)`, então herda automaticamente o header/
rodapé persistentes sem nenhum layout próprio — só por estar nesse grupo);
`apps/web/src/app/(marketing)/layout.tsx` virou um Server Component
**assíncrono** que chama `supabase.auth.getUser()` e, se houver sessão, busca
`startup_nome` em `startup_registrations` (mesmo padrão de `admin/page.tsx`),
montando `{ name, email, avatar: "" }` e passando como prop `user` para
`<SiteHeader user={user} />` — logo, **todas** as páginas dentro de
`(marketing)/` (home, sobre, noticias, midia, parceiros, associe-se, entrar,
area-do-associado) ganham automaticamente o header ciente de autenticação, sem
precisar de nenhuma mudança individual em cada página. `SiteHeader`
(`components/site-header.tsx`) recebe essa prop opcional (`user?: { name,
email, avatar } | null`) e alterna condicionalmente, em dois pontos (desktop,
dentro de `.ml-auto`; mobile, dentro do `Sheet` de navegação): usuário logado
→ `<HeaderUserMenu user={user} />`; não logado → os botões "Entrar"/
"Associe-se" de sempre. `HeaderUserMenu` (`components/header-user-menu.tsx`,
novo) é um `DropdownMenu` com `Avatar` quadrado (`rounded-lg`, mesma convenção
já documentada), label com nome/e-mail, e — por pedido explícito do
usuário para deixar o conteúdo detalhado para depois ("Vou detalhar os itens
depois") — só dois itens por enquanto: link para "Área do associado"
(`DropdownMenuItem render={<Link href="/area-do-associado" />}`, confirma que
`DropdownMenuItem` suporta o prop `render` do Base UI) e "Sair"
(`onClick={() => signOut()}`, nova Server Action em
`app/(marketing)/actions.ts` — **distinta** da `signOut` do admin: aqui
redireciona para `/` (home), não para `/entrar`, já que um associado comum
deslogando volta a ser um visitante anônimo da mesma landing page, não é
expulso para uma tela de login separada). Typecheck (`pnpm --filter
@inova-cumau/web typecheck`) rodou limpo; não verificado no navegador (regra
permanente, ver "Fluxo de verificação" no topo deste arquivo).

**Segunda correção arquitetural: área do associado virou dashboard próprio,
com sidebar** (pedido explícito do usuário: "na area de associado, crie uma
sidebar com as opções: Perfil> Meus dados, Privacidade, Mensagens,
Notificações / Atividades> Salvos / Carteira> Cartão de sócio, Cumaú Coin /
Sair") — isso substitui a premissa da correção arquitetural acima ("não vai
para um dashboard separado... continua vendo a mesma home/landing page
institucional"). Antes deste pedido, o usuário havia sugerido reaproveitar
`sidebar-07` também aqui ("na area do associado, vamos criar npx shadcn@latest
add sidebar-07"); pedi esclarecimento (`AskUserQuestion`) por conflitar com o
que estava documentado até então, e o usuário **dispensou a pergunta sem
responder**, sinalizando para aguardar a próxima instrução em vez de agir
sobre qualquer uma das alternativas oferecidas — só a mensagem seguinte
(a lista de opções da sidebar acima) foi tratada como a instrução real a
executar.

Implementado (nesse momento): nova rota top-level
`apps/web/src/app/area-do-associado/page.tsx` (fora de `(marketing)`, sem
herdar `SiteHeader`/`SiteFooter`), espelhando a estrutura de
`admin/page.tsx`: `SidebarProvider` + `AssociadoSidebar` (nova,
`components/associado-sidebar.tsx`) + `SidebarInset` com
header/breadcrumb/conteúdo. `AssociadoSidebar` tinha um cabeçalho estático
(logo badge, mesmo padrão `bg-sidebar-primary`/`text-sidebar-primary-foreground`
de `team-switcher.tsx`, sem dropdown/trocador — só "Inova Cumaú"/"Associado"
fixos) e delegava a navegação para `NavAssociado`
(`components/nav-associado.tsx`), que implementa exatamente a estrutura
pedida: três grupos colapsáveis — **Perfil** (Meus dados, Privacidade,
Mensagens, Notificações), **Atividades** (Salvos), **Carteira** (Cartão de
sócio, Cumaú Coin) — e um item avulso **Sair** fora de qualquer grupo,
chamando a mesma Server Action `signOut` de `app/(marketing)/actions.ts` já
usada por `HeaderUserMenu` (redireciona para `/`, não para `/entrar` — é a
variante de associado/visitante, distinta da `signOut` do admin). Diferente
do admin (que usa `lucide-react` como exceção documentada), os ícones aqui
seguem a convenção padrão do projeto: Tabler
(`IconChevronRight`/`IconUserCircle`/`IconActivity`/`IconWallet`/
`IconLogout`).

**Terceira correção arquitetural: sidebar não pode ficar desapartada do
header/footer da landing page** (pedido explícito do usuário, corrigindo a
implementação imediatamente acima: *"você não seguiu o plano de manter
header nav e footer. essa área não é algo desapartado da ladingpage."*) — a
versão com `SidebarProvider`/`AssociadoSidebar`/`SidebarInset` era um
dashboard 100% isolado, sem `SiteHeader`/`SiteFooter`, o que contradizia o
próprio pedido de manter a área do associado dentro da experiência da
landing page (só trocando o header por uma versão ciente de autenticação,
como já valia para `/` e as demais páginas de `(marketing)/`). Causa raiz:
o primitivo `Sidebar` do shadcn (`components/ui/sidebar.tsx`) renderiza seu
container desktop como `position: fixed` + `h-svh` (altura cheia da
viewport) — estruturalmente incompatível com coexistir com um header/footer
em fluxo normal de documento.

Correção: a rota voltou para dentro do grupo `(marketing)`
(`apps/web/src/app/(marketing)/area-do-associado/page.tsx`), voltando a
herdar `SiteHeader`/`SiteFooter` automaticamente de `(marketing)/layout.tsx`,
sem nenhuma mudança nesse layout. `apps/web/src/components/associado-sidebar.tsx`
(o wrapper do primitivo `Sidebar`) e a rota top-level antiga
(`apps/web/src/app/area-do-associado/`) foram **removidos**. `NavAssociado`
(`components/nav-associado.tsx`) deixou de depender do contexto do Sidebar —
trocou `SidebarMenuSub`/`SidebarMenuButton` por markup simples
(`Collapsible`/`CollapsibleTrigger`/`CollapsibleContent` de
`components/ui/collapsible.tsx`, que não tem dependência de contexto, mais
`<ul>`/`<a>`/`<button>` estilizados à mão) — mesmos três grupos, mesmos
ícones Tabler, mesmo `signOut` de `(marketing)/actions.ts`, comportamento
idêntico ao anterior, só sem o primitivo Sidebar por trás. O chevron de cada
grupo usa `group-data-open/collapsible:rotate-90` (não
`group-data-[panel-open]`) — confirmado via leitura do pacote
`@base-ui/react` instalado que o `Collapsible` **Root** (onde fica
`className="group/collapsible"`) reaplica em si mesmo os atributos
`data-open`/`data-closed` do **Panel**, enquanto `data-panel-open` é um
atributo à parte, exclusivo do **Trigger** — nunca presente no Root.
Reaplicar esse cuidado (checar `data-open`/`data-closed` no Root, não
`data-panel-open`) em qualquer novo uso de `Collapsible` fora do contexto do
Sidebar.

A página em si (`(marketing)/area-do-associado/page.tsx`) virou um layout de
duas colunas em fluxo normal (sem `position: fixed`, sem `SidebarProvider`):
`<section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6">` (mesma
convenção de container já usada em `sobre/page.tsx`, `pt-16` alinhado ao
padrão de `sobre/ecossistema/page.tsx`) envolvendo
`<div className="flex flex-col gap-8 lg:flex-row">` com um
`<aside className="lg:w-64 lg:shrink-0"><NavAssociado /></aside>` à esquerda
e uma `<div className="flex-1">` à direita com o mesmo texto "Bem-vindo(a),
{nome}" (`startup_nome`, inalterado) e o placeholder de conteúdo. Mantém a
mesma guarda de acesso de antes (`supabase.auth.getUser()` +
`redirect("/entrar")` sem sessão). O `Breadcrumb`/header interno do antigo
`SidebarInset` foi removido (não fazia sentido fora do padrão Sidebar; o
`SiteHeader` já cumpre esse papel). `PageHeader` (componente já usado em
outras páginas institucionais) foi avaliado e descartado para este caso —
seu estilo centralizado/com eyebrow não serve para uma saudação
personalizada alinhada à esquerda. Todos os sub-itens (Meus dados,
Privacidade, Mensagens, Notificações, Salvos, Cartão de sócio, Cumaú Coin)
continuam `href="#"` — só a navegação/estrutura foi pedida até aqui, não o
conteúdo de cada página (ver "Pendente", abaixo). Typecheck (`pnpm --filter
@inova-cumau/web typecheck`) rodou limpo; não verificado no navegador (regra
permanente, ver "Fluxo de verificação" no topo deste arquivo).

O nome/e-mail exibidos no header para um associado logado deixaram de vir de
`startup_nome`/`authUser.email` e passaram a vir do **responsável pela
inscrição** (Step 1 do wizard): `(marketing)/layout.tsx` agora consulta
`.select("responsavel_nome, responsavel_email")` em vez de `startup_nome`,
extrai só o **primeiro nome** (`registration?.responsavel_nome?.trim()
.split(/\s+/)[0]`, fallback `"Associado"`) e usa `responsavel_email` como
e-mail exibido (fallback `authUser.email`, o e-mail de login, só se
`responsavel_email` vier vazio) — pedido explícito do usuário. Além disso,
`HeaderUserMenu` (`components/header-user-menu.tsx`) ganhou o **primeiro
nome** também dentro do `DropdownMenuTrigger`, ao lado do avatar, visível
direto na barra do header (antes só aparecia dentro do dropdown já aberto,
no `DropdownMenuLabel`) — `<span className="max-w-[140px] truncate text-sm
font-medium">{user.name}</span>`. **Só o nome fica no trigger — o e-mail
permanece exclusivamente dentro do conteúdo aberto do dropdown**
(`DropdownMenuLabel`), pedido explícito do usuário após uma primeira versão
que também duplicava o e-mail ao lado do avatar. Como `HeaderUserMenu` é
compartilhado entre a barra desktop (`.ml-auto` em `site-header.tsx`) e o
menu mobile (dentro do `Sheet`), o mesmo trigger aparece nos dois lugares
sem nenhuma variante condicional por breakpoint (decisão deliberada de
manter simples — se ficar apertado em telas muito estreitas, ajustar com
uma instrução futura explícita). O bloco já existente dentro do
`DropdownMenuLabel` (conteúdo aberto do dropdown, com nome **e** e-mail) não
foi alterado estruturalmente, só passou a refletir os mesmos valores novos
automaticamente. `area-do-associado/page.tsx` (texto "Bem-vindo(a), {nome}")
**não foi tocado** — continua usando `startup_nome`, fora do escopo deste
pedido. Typecheck (`pnpm --filter @inova-cumau/web typecheck`) rodou limpo;
não verificado no navegador (regra permanente, ver "Fluxo de verificação" no
topo deste arquivo).

**Correção visual na sidebar de `area-do-associado`**: pedido explícito do
usuário ("apenas corrija o componente sidebar. a linha da seção está fora da
direção correta, tem muito espaço sendo consumido a direita"). Diagnóstico
confirmado via `AskUserQuestion` (usuário escolheu "Linha vertical de
indentação"): em `NavAssociado` (`components/nav-associado.tsx`), o `<ul>`
de sub-itens dentro de cada `CollapsibleContent` tinha só `pl-4` (sem
margem/limite à direita), então a linha de indentação (`border-l`) e a área
de hover/clique de cada `<a>` de sub-item se esticavam sem limite até a
borda direita da coluna `lg:w-64` da sidebar — diferente do padrão stock do
shadcn (`SidebarMenuSub`, usado pelo admin via `nav-main.tsx`), que usa
`mx-3.5` para conter a lista numa coluna mais estreita que o container pai.
Corrigido espelhando esse mesmo padrão de contenção em escala menor: o `<ul>`
ganhou `mr-2` (além do `ml-2` que substituiu o antigo `pl-4`→`pl-3` de
indentação à esquerda), classe final
`mt-0.5 mr-2 ml-2 flex flex-col gap-0.5 border-l border-border pl-3`.
Escopo deliberadamente restrito só a esse arquivo (pedido do usuário, "apenas
corrija o componente sidebar") — nenhum outro arquivo foi tocado. Typecheck
(`pnpm --filter @inova-cumau/web typecheck`) rodou limpo; não verificado no
navegador (regra permanente, ver "Fluxo de verificação" no topo deste
arquivo).

Essa primeira correção resolveu o espaço sobrando à direita, mas o usuário
apontou na sequência que a linha vertical continuava fora do lugar "em
relação a como de fato é o componente do shadcn... está pra fora da direção
do ícone" — ou seja, a linha de indentação não caía sob o centro do ícone do
item pai, ao contrário do padrão real do shadcn. Diagnosticado comparando
diretamente com o `sidebar.tsx` stock (`components/ui/sidebar.tsx`, usado
pelo admin): `sidebarMenuButtonVariants` usa `p-2` (8px) de padding + ícone
`size-4` (16px), então o centro do ícone fica a 16px da borda esquerda do
container; `SidebarMenuSub` usa `mx-3.5 translate-x-px` (~15px) para a linha
`border-l`, alinhando quase exatamente sob esse centro. `NavAssociado`, por
outro lado, usava `px-2.5` (10px) no trigger — não `p-2` como o stock — o que
jogava o centro do ícone para 18px, bem longe dos 8px (`ml-2`) onde a linha
antiga estava. Corrigido replicando exatamente os valores do componente real
do shadcn: `navItemTriggerClass` trocou `px-2.5 py-2` por `p-2` (igual ao
`SidebarMenuButton` stock, centro do ícone agora em 16px) e o `<ul>` de
sub-itens trocou `mt-0.5 mr-2 ml-2 ... pl-3` por
`mx-3.5 mt-0.5 flex translate-x-px flex-col gap-0.5 border-l border-border
pl-2.5` (mesmos `mx-3.5`/`translate-x-px`/`pl-2.5` do `SidebarMenuSub` stock).
Escopo novamente restrito a `nav-associado.tsx`. Typecheck (`pnpm --filter
@inova-cumau/web typecheck`) rodou limpo; não verificado no navegador (regra
permanente, ver "Fluxo de verificação" no topo deste arquivo).

**Página "Meus dados"** (`apps/web/src/app/(marketing)/area-do-associado/meus-dados/`):
primeira página real da sidebar do associado, implementada em quatro arquivos:

- `schema.ts` — `meusDadosSchema` (Zod): combina todos os campos editáveis de
  `startup_registrations` — campos do responsável (`step1Schema`), do negócio
  (`step2Schema`, com CNPJ/ausente + autofill BrasilAPI) e segmentação
  (`step4Schema`, com `MultiSelectCombobox` para segmentos e objetivos) — com os
  mesmos `superRefine`s de CNPJ válido/ausente, "outra"/"outros" condicionais.
  Campos excluídos deliberadamente: `notify_email_editais`/`notify_email_novidades`/
  `perfil_visivel_publico` (futuras páginas Notificações/Privacidade), os 7 campos
  de contato sempre-`null` (`startup_site`, `contato_email`, `contato_telefone`,
  `contato_whatsapp`, `contato_instagram`, `contato_facebook`, `contato_linkedin`),
  e campos imutáveis/sistema (`status`, `termos_aceitos*`, `id`, `created_at`,
  `updated_at`, `user_id`).
- `actions.ts` — Server Action `updateMeusDados` (`useActionState`): revalida com
  Zod no servidor (nunca confia no payload do client), faz `.update({...}).eq("user_id",
  user.id)` em `startup_registrations` (RLS UPDATE policy já existia, sem migration
  nova), exporta `lookupCnpj` re-exportando de `associe-se/actions.ts` para o form
  client poder chamar o autofill de CNPJ. Retorna `{ status: "success" }` em caso de
  êxito (toast verde disparado no client) ou `{ status: "error" | "validation_error" }`
  em falha. `revalidatePath` em `/area-do-associado` e `/area-do-associado/meus-dados`
  após update bem-sucedido.
- `meus-dados-form.tsx` — Client Component `MeusDadosForm`: formulário controlado
  (todos os campos via `useState` — necessário porque há interação entre estados:
  CNPJ ausente desabilita input, autofill preenche outros campos, arrays de
  multi-select precisam de hidden inputs); reutiliza `PhoneCountryInput`,
  `MultiSelectCombobox`, Select+Dialog de fase do negócio e textareas com contador
  exatamente como nos steps correspondentes do wizard; feedback de salvamento via
  toast (`type: "success"` / `type: "error"`), mesmo padrão dos outros fluxos de
  Server Action. Arrays (`segmentos`, `objetivo_filiacao`) e booleano
  (`startup_cnpj_ausente`) são passados como `<input type="hidden">` porque
  `formData.getAll()` / `formData.get() === "true"` é a única forma confiável de
  serializar esses tipos num `<form action={serverAction}>`.
- `page.tsx` — Server Component assíncrono: guarda de acesso (`redirect("/entrar")`
  sem sessão ou sem `startup_registrations`), seleciona todos os campos editáveis
  da tabela em um único `.select(...)`, passa como prop `initial` para `MeusDadosForm`.
  Layout de duas colunas idêntico ao de `area-do-associado/page.tsx` (herda
  `SiteHeader`/`SiteFooter` por estar no grupo `(marketing)/`).

`nav-associado.tsx`: `{ title: "Meus dados", url: "#" }` → `url:
"/area-do-associado/meus-dados"`. Typecheck (`pnpm --filter @inova-cumau/web
typecheck`) rodou limpo; não verificado no navegador (regra permanente, ver "Fluxo
de verificação" no topo deste arquivo).

**Pendente**:
- Construir o conteúdo real das demais páginas linkadas pela sidebar de
  `area-do-associado/page.tsx` (`components/nav-associado.tsx`) — Privacidade,
  Mensagens, Notificações (grupo Perfil), Salvos (grupo Atividades), Cartão de
  sócio e Cumaú Coin (grupo Carteira) — ainda `href="#"`, sem rota própria nem
  conteúdo. Aguardando instrução explícita do usuário sobre o que entra em cada
  página.
- Decidir se o `TeamSwitcher` (área do Admin, `/admin`) deve ter um seletor de
  "equipes" no domínio de Associado/Administrador único da Inova Cumaú — o
  rótulo "Equipes"/"Adicionar equipe" já foi traduzido (ver acima), mas a
  pergunta de design (a feature em si faz sentido aqui?) segue em aberto, sem
  instrução explícita do usuário.
- Desenhar e implementar o nível de acesso real por tipo de usuário
  (Associado vs. Administrador), incluindo proteger `/admin` para não ser
  acessível por um associado comum (hoje `/admin` só verifica sessão, não
  papel/role — a tabela `user_roles` já existe no schema Supabase mas não é
  referenciada em nenhum código ainda). Hoje `plan` é só texto exibido no
  `TeamSwitcher`, sem nenhuma lógica de permissão associada. Aguardando
  instrução explícita do usuário.
- Adaptar os itens de navegação do Admin (`navMain`/`projects`, ainda 100%
  stock) ao conteúdo real dessa área (o header com breadcrumb fixo "Build
  Your Application"/"Data Fetching" e os blocos cinza de skeleton também
  continuam placeholder) — nome/e-mail do `NavUser` já são reais (ver acima),
  avatar segue sem foto por falta de feature de upload. Aguardando instrução
  explícita do usuário sobre o que entra em cada etapa.
- Implementar upload/edição de foto de perfil, caso desejado — hoje `avatar`
  é sempre `""` (`AvatarFallback` com iniciais cobre a ausência).
- Colar o template `docs/email-templates/confirm-signup.html` no painel do
  Supabase (Authentication → Email Templates → "Confirm signup", campo
  "Message body (HTML)") e confirmar que `{{ .ConfirmationURL }}` não
  permanece em nenhum lugar do template salvo — só então o e-mail passa a
  mostrar o código de 8 dígitos que o Step 7 pede. Edição 100% manual, não
  há ferramenta MCP do Supabase para isso (ver "Pré-requisito manual ainda
  pendente" na seção Supabase acima).
- Verificação final do caminho de sucesso completo do OTP (código real
  recebido por e-mail → `verifyOtp` → insert em `startup_registrations` via
  `execute_sql` → login em `/entrar`) — bloqueada até a edição manual acima
  acontecer; todos os outros caminhos (código errado, reenvio, criação do
  usuário em `auth.users`) já foram verificados end-to-end no navegador.

**Dados reais ausentes** (usar placeholder explícito até serem fornecidos — nunca
inventar): número de associados, depoimentos, logos de parceiros, estatísticas de
impacto.

**Correção: botão "Salvar alterações" com largura/posição erradas** (`meus-dados-form.tsx`):
o `<Field className="mt-2 flex-row justify-end">` fazia o botão esticar para
`w-full` porque `Field` aplica `*:w-full` na orientação vertical padrão.
Corrigido usando a prop `orientation="horizontal"` do próprio `Field`
(`<Field orientation="horizontal" className="mt-2 justify-end">`), que já
existe para esse propósito, em vez de só sobrescrever via `className`.

**Correção: abrir um `Select` rolava a página para o topo** (bug relatado
pelo usuário: "quando clico em selects, sou redirecionado para o topo").
Causa raiz, confirmada lendo o código-fonte do `@base-ui/react` (`select/
popup/SelectPopup.js` e `floating-ui-react/components/FloatingFocusManager.js`):
o `Select` do Base UI usa `FloatingFocusManager` sem customizar
`initialFocus`, então ao abrir o popup o foco vai por padrão para o primeiro
elemento focável **dentro** do popup (ex.: o `SelectItem` selecionado), não
para o container do popup — e a chamada interna de `enqueueFocus` só passa
`preventScroll: true` quando o alvo do foco é o próprio container, então
focar um item interno roda com `preventScroll: false`, permitindo o
scroll-into-view nativo do navegador disparado pelo `focus()`. Não há prop
pública (`initialFocus`/`preventScroll`) exposta pelos `.d.ts` do módulo
`select` para desativar esse comportamento diretamente. Corrigido em
`apps/web/src/components/ui/select.tsx`: `Select` deixou de ser um simples
alias (`const Select = SelectPrimitive.Root`) e virou um wrapper genérico
(`function Select<Value, Multiple extends boolean | undefined = false>({
onOpenChange, ...props }: SelectPrimitive.Root.Props<Value, Multiple>)` —
os parâmetros de tipo são obrigatórios porque `SelectRoot` do Base UI é
genérico; usar `SelectPrimitive.Root.Props` sem argumentos de tipo é erro de
TypeScript, `TS2707`) que intercepta `onOpenChange`. Uma primeira tentativa
tentou restaurar o scroll via dois `requestAnimationFrame` aninhados
(adivinhando o timing relativo ao `enqueueFocus` interno do Base UI), mas o
usuário reportou que **não resolveu** o bug em teste real — apostar em um
número fixo de frames para vencer uma corrida contra o scheduling interno do
Base UI não é confiável. Substituído por uma abordagem orientada a evento:
ao abrir (`open === true`), guarda `window.scrollX/scrollY` e registra um
listener de `scroll` em `window` (capture phase) que restaura essa posição
imediatamente a cada evento de scroll disparado; o listener é removido após
300ms (`window.setTimeout`), janela suficiente para cobrir o scroll-into-view
do Base UI sem interferir em scroll legítimo do usuário depois que o popup
estabiliza. Reaplicar esse mesmo padrão (listener de `scroll` real, não
contagem de frames) em qualquer outro componente baseado em
`FloatingFocusManager` que apresente o mesmo sintoma (ex.: `DropdownMenu`,
`Popover`, `Menu`, se o mesmo bug for reportado neles). Não verificado no
navegador (regra permanente, ver "Fluxo de verificação" no topo deste
arquivo).

**Mesmo bug reportado no `Popover`** (usuário: abrir os dropdowns de
"Segmentos de atuação"/"Objetivo da filiação" — `MultiSelectCombobox`, que
usa `Popover`, não `Select` — na página "Meus dados" jogava a página pro
topo). Aplicado exatamente o mesmo fix de `select.tsx` em
`components/ui/popover.tsx`: `Popover` deixou de ser um alias direto de
`PopoverPrimitive.Root` e virou um wrapper que intercepta `onOpenChange`,
guardando `window.scrollX/scrollY` ao abrir e restaurando via listener de
`scroll` (capture phase, removido após 300ms). Como `Popover` é a base de
`MultiSelectCombobox` (compartilhado entre o Step 4 do wizard de
`/associe-se` e a página "Meus dados") e de qualquer outro Popover do app,
o fix cobre todos os usos automaticamente, sem mudança nos componentes
consumidores. Não verificado no navegador (regra permanente, ver "Fluxo de
verificação" no topo deste arquivo).

## Convenções

- Componentes shadcn/ui sempre via `npx shadcn@latest add <componente>` dentro de
  `apps/web`, nunca escritos à mão.
- Queries/mutations Supabase ficam em Server Actions dentro de `apps/web/src/app`
  (colocadas perto da seção que as usa), importando os clients de
  `@inova-cumau/supabase`.
- Formulários multi-etapa (ex.: wizard de `/associe-se`) validam cada step com
  **Zod** (`safeParse`) no client, sem round-trip ao servidor; só o step final
  usa `useActionState` + Server Action, que revalida tudo de novo com Zod no
  servidor (nunca confiar no payload do client).
- Ícones: Tabler (`@tabler/icons-react`) é o padrão; `lucide-animated` só quando
  pedido um ícone animado específico.
- Nenhum dado real inventado (estatísticas, depoimentos, parceiros) — usar
  placeholder explícito e listar como pendência.
- CNPJ com autopreenchimento (step 2 do wizard de `/associe-se`): validação de
  checksum sempre client-side e server-side antes de qualquer chamada externa
  (`lib/cnpj.ts`, `isValidCNPJ` — mod-11, reaplicado em `schema.ts` via
  `superRefine` e de novo dentro de `lookupCnpj`), e a consulta ao registro
  público (BrasilAPI, `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`) **sempre
  via Server Action**, nunca fetch client-side, para não expor a origem da
  chamada nem depender de CORS. Reaplicar esse padrão (checksum antes,
  Server Action para o lookup) em qualquer validador de documento
  (CPF, CEP etc.) que precise consultar API pública no futuro.
- Fetch server-side para APIs públicas externas (ex.: BrasilAPI em
  `lookupCnpj`, `apps/web/src/app/associe-se/actions.ts`): sempre enviar um
  header `User-Agent` de navegador desktop explícito. Confirmado que a
  BrasilAPI retorna 403 (bloqueio do Cloudflare/WAF) para requisições sem esse
  header — o `fetch()` do runtime Node do Next não envia um `User-Agent` que
  passe por proteção anti-bot básica. Reaplicar em qualquer nova integração
  server-side com API pública de terceiros que possa estar atrás de
  Cloudflare.
- Select (`apps/web/src/components/ui/select.tsx`): o dropdown sempre abre
  **abaixo do trigger, com 4px de gap** (`side="bottom"`, `sideOffset={4}`,
  `alignItemWithTrigger={false}` como default em `SelectContent`) — nunca o
  padrão nativo de `<select>` (que sobrepõe o popup ao trigger via
  `alignItemWithTrigger={true}`, causando o popup "torto"/desalinhado). Como
  `SelectContent` é compartilhado por todo Select do app, essa é a convenção
  para qualquer uso futuro, sem precisar repetir as props por instância.
- DropdownMenu/Menu (`apps/web/src/components/ui/dropdown-menu.tsx`): quando o
  `Menu.Trigger` visual é menor que o "campo" lógico que ele representa (ex.:
  um botão de bandeira/código de país dentro de um `InputGroup` maior, como em
  `components/registration-wizard/phone-country-input.tsx`), o popup deve ser
  ancorado no container inteiro via a prop `anchor` de `DropdownMenuContent`
  (repassada para `MenuPrimitive.Positioner`), passando um `ref` do elemento
  pai (ex.: `InputGroup`) — nunca deixar o anchor implícito no trigger pequeno,
  pois isso faz o `sideOffset={4}` medir a partir do trigger (mais alto que o
  campo) em vez do campo visível inteiro, resultando em gap quase zero e popup
  desalinhado ("torto"). `DropdownMenuSubContent` já herda `anchor` de
  `DropdownMenuContent` automaticamente.
- Textarea com contador de caracteres (ex.: `startup_descricao` no step 2 do
  wizard de `/associe-se`, `components/registration-wizard/steps/step-2-empreendimento.tsx`):
  o padrão é a variante `InputGroup` do shadcn (`components/ui/input-group.tsx`) —
  `<InputGroup><InputGroupTextarea maxLength={N} .../><InputGroupAddon align="block-end"><InputGroupText>{valor.length}/N</InputGroupText></InputGroupAddon></InputGroup>`,
  posicionando o contador **dentro** da caixa do textarea, no canto inferior
  esquerdo (sem `InputGroupButton` — aqui não há ação de "postar", só o contador).
  O limite (`maxLength={N}`) é sempre reforçado no Zod com `.max(N, ...)` em
  `schema.ts`. Reaplicar esse mesmo padrão em qualquer textarea futura que precise
  de contador, em vez de voltar ao `Textarea` simples com `FieldDescription`
  abaixo do campo.
- Lista de itens dentro de um Dialog informativo (ex.: modal "Fases do negócio" no
  step 2 do wizard, `components/registration-wizard/steps/step-2-empreendimento.tsx`):
  título do `DialogTitle` com `className="font-sans"` para usar Geist em vez do
  `font-heading`/Lora padrão (confirmado que `font-heading` e `font-sans` são
  reconhecidos como conflitantes pelo `tailwind-merge` padrão — não precisa de
  `!important`, `cn()` já resolve). O `DialogContent` pode receber um `max-w-*`
  maior (`sm:max-w-2xl`) quando o conteúdo é uma lista longa. Divisor sutil entre
  itens: `divide-y divide-neutral-200` no container da lista + `py-4 first:pt-0
  last:pb-0` em cada item (em vez de `gap-*` simples) — reaplicar esse padrão em
  qualquer lista futura dentro de um Dialog/scroll area que precise de separador
  neutro entre entradas.
- Campo de link com prefixo `https://` fixo (`components/registration-wizard/url-input.tsx`,
  `UrlInput`, usado em `startup_site`/`contato_instagram`/`contato_facebook`/`contato_linkedin`
  no Step 3 do wizard de `/associe-se`): variante `InputGroup` do shadcn com um `InputGroupAddon`
  exibindo o texto estático `https://` seguido de um `InputGroupInput` editável só com o resto do
  link (placeholder com exemplo completo, ex.: `instagram.com/suastartup`). O valor armazenado no
  estado do formulário (`onChange`) sempre inclui o prefixo `https://` — o componente recombina
  prefixo fixo + parte editável a cada mudança (mesmo padrão de "prefixo é UI, mas faz parte do
  valor" já usado em `PhoneCountryInput` com o código de discagem do país), e `stripProtocol` limpa
  qualquer `http://`/`https://` colado pelo usuário antes de reprefixar, então o campo nunca duplica
  o protocolo. A validação Zod correspondente em `schema.ts` (`startup_site`, `contato_instagram`,
  `contato_facebook`, `contato_linkedin`) exige `https://` no início (`/^https:\/\/.+\..+/`) para
  casar com o prefixo fixo da UI. Reaplicar esse padrão em qualquer campo de link futuro que deva
  sempre ser HTTPS.
- Combobox multi-select com busca (`components/registration-wizard/multi-select-combobox.tsx`,
  `MultiSelectCombobox` — componente genérico, recebe `options`/`value`/`onChange`/placeholders,
  usado tanto em `segmentos` quanto em `objetivo_filiacao` no Step 4 do wizard de `/associe-se`):
  variante `Popover` do shadcn (não `Select` nativo, que não suporta multi-seleção nem busca) — o
  `PopoverTrigger` renderiza os itens selecionados como `Badge`s (com botão de remover inline,
  `stopPropagation` no clique para não reabrir o popup) e um placeholder quando vazio; o
  `PopoverContent` tem um `InputGroupInput` de busca (`autoFocus` nativo — funciona direto,
  sem precisar de `useEffect`/`requestAnimationFrame`, pois `Popover` já foca o conteúdo ao
  abrir) seguido da lista filtrada (`label`/`value` via `.includes()`, case-insensitive),
  cada item é um `button` com checkbox visual (`CheckIcon` quando selecionado) que faz
  toggle (adiciona/remove do array) em vez de fechar o popup — permitindo selecionar vários
  itens em sequência sem reabrir. Foi extraído de um componente específico (`TechSegmentSelect`)
  para esse genérico assim que surgiu o segundo uso (`objetivo_filiacao`) — reaplicar esse mesmo
  componente (não duplicar) em qualquer campo futuro que precise de seleção múltipla com busca
  (em vez de checkboxes soltos ou um `Select` de item único). O `PopoverTrigger` não usa mais
  `flex-wrap` (badges quebrando em várias linhas) — agora é `flex-nowrap overflow-hidden` de
  uma linha só, com um limite **fixo por contagem** (não por largura medida): até 2 badges
  reais visíveis; a partir da 3ª selecionada, essa posição já vira a badge `+N` (`N = total
  selecionado − 2`) em vez de um item real — pedido explícito do usuário ("o limite é 2, se
  houver um terceiro, ele já se torna a badge com contador"). `MAX_VISIBLE_ITEMS = 2` no topo
  do arquivo. Essa é a segunda versão do comportamento de colapso: a primeira tentativa media a
  largura real de cada badge via `ResizeObserver` + uma camada de medição invisível fora da
  tela (`useLayoutEffect`) para decidir dinamicamente quantas cabiam por linha, mas o usuário
  pediu a regra fixa por contagem no lugar — mais previsível e sem a complexidade de medição de
  layout. Reaplicar esse mesmo padrão de colapso (regra fixa de contagem, não largura) em
  qualquer campo multiselect futuro (o componente é compartilhado, então qualquer novo uso já
  herda o comportamento automaticamente).
- Busca dentro de popup (`Menu`/`DropdownMenu`) que precisa de autofoco ao abrir (ex.:
  `PhoneCountryInput`, `components/registration-wizard/phone-country-input.tsx` — código de
  país nos campos de telefone/WhatsApp dos Steps 1 e 3): o autofoco do campo de busca usa
  `useEffect(() => { const t = setTimeout(() => searchRef.current?.focus(), 0); return () =>
  clearTimeout(t); }, [open])` — **nunca `requestAnimationFrame`** para esse fim. Motivo:
  `requestAnimationFrame` é **pausado** (não só throttled) pelo navegador enquanto o
  documento está oculto/sem foco (aba em background), o que faz o autofoco simplesmente nunca
  acontecer nesse cenário; `setTimeout` é apenas throttled, então sempre dispara. Como não há
  como garantir que a aba do usuário estará em foco no momento exato da interação, `setTimeout`
  é a escolha mais robusta para qualquer autofoco-ao-abrir baseado em efeito (o `Popover` do
  `MultiSelectCombobox` não tem esse problema por usar o atributo HTML nativo `autoFocus` em vez
  de um efeito). O `DropdownMenuItem`/busca já usa `onKeyDown` com `e.stopPropagation()` (exceto
  `Escape`) para o Menu não interceptar teclas de digitação como atalhos de navegação.
- Layout de duas colunas do wizard (`components/registration-wizard/wizard.tsx`):
  no breakpoint `lg:` (onde vira `flex-row`), o container externo usa
  `lg:h-screen lg:overflow-hidden` (trava a altura na viewport e impede scroll da
  página), e apenas o `<main>` (lado 2, card do step atual) recebe
  `overflow-y-auto lg:min-h-0` — o `<aside>` (lado 1, `StepperNav`) não tem
  overflow próprio, então fica estático enquanto o lado 2 rola. O `lg:min-h-0` é
  necessário porque flex items têm `min-height: auto` por padrão, o que ignoraria
  o `overflow-y-auto` e deixaria o conteúdo estourar em vez de rolar. Abaixo de
  `lg:` (mobile, `flex-col`), o layout continua com `min-h-screen` normal (scroll
  único de página, sem isolamento) já que as colunas empilham em vez de ficar
  lado a lado. Reaplicar esse padrão em qualquer novo layout de duas colunas que
  precise que só um lado role.
- Link "Voltar para o início" no topo do lado 1 do wizard
  (`components/registration-wizard/wizard.tsx`): acima do `Link` do logo
  (`Logo`/`LogoWordmark`) dentro do `<aside>`, um link de texto simples
  (`Voltar para o início`, sem ícone) apontando para `/`, estilizado como
  `text-sm text-muted-foreground underline-offset-2 hover:text-foreground
  hover:underline` (mesmo padrão de link de texto já usado em "Esqueceu sua
  senha?" em `login-form.tsx`) com `mb-6` para separá-lo do logo abaixo.
  Pedido explícito do usuário. Diferente do "Voltar para o início" já
  existente em `area-do-associado/page.tsx` (um `Button variant="outline"`
  no rodapé da página) — aqui é deliberadamente um link puro de texto, sem
  ícone, no topo, não um botão.
- `InputGroupAddon` (`apps/web/src/components/ui/input-group.tsx`) tem um
  `onClick` que foca o primeiro `<input>` do `InputGroup` pai — pensado para
  cliques na área do addon (ícone, espaço em branco) fora de um `<input>`/
  `<button>` próprio. Esse handler agora ignora cliques que já se originaram
  num `input`/`textarea`, não só num `button` (`target.closest("button,
  input, textarea")`). Motivo: quando um `InputGroupAddon` envolve um
  `DropdownMenu`/`Menu` cujo popup é renderizado via `Portal` (ex.:
  `PhoneCountryInput`, cujo `InputGroupAddon` externo envolve o trigger de
  país), o popup sai da subárvore do DOM mas continua borbulhando eventos
  React pela árvore de componentes — um clique no input de busca *dentro* do
  popup borbulhava até o `InputGroupAddon` externo, cujo
  `querySelector("input")` então encontrava o único `<input>` que sobrou na
  subárvore DOM real do `InputGroup` pai (o input do número de telefone,
  irmão do addon), roubando o foco de volta pra ele. Reaplicar esse cuidado
  (nunca deixar o guard do `InputGroupAddon` checar só `button`) em qualquer
  novo uso de `InputGroupAddon` envolvendo um popup/menu portalizado com
  campo de busca próprio.
- Card clicável que abre Dialog com conteúdo legal/textual longo (ex.: os cards
  "Termos de Uso"/"Política de Privacidade" no Step 5 do wizard de
  `/associe-se`, `LegalDocumentCard` em
  `components/registration-wizard/steps/step-5-termos.tsx`): diferente do
  padrão de trigger pequeno (botão/ícone) já usado nos outros Dialogs do app,
  aqui o `Card` inteiro (`components/ui/card.tsx`) é o `DialogTrigger`
  (`className="text-left"`, já que `DialogTrigger` não é `block` por padrão),
  com `hover:bg-muted/40` para indicar clicabilidade. O conteúdo do Dialog
  reaproveita os mesmos tokens visuais já convencionados: `DialogTitle
  className="font-sans"`, `sm:max-w-2xl`, e a lista de seções usa
  `max-h-[60vh] overflow-y-auto` + `divide-y divide-neutral-200` com `py-4
  first:pt-0 last:pb-0` por seção (mesmo padrão de "Lista de itens dentro de
  um Dialog informativo" já usado no modal "Fases do negócio" do Step 2). O
  conteúdo textual (`LegalSection[]`, `{ title, paragraphs }`) fica
  centralizado em `registration-wizard/legal-content.ts`, fora do componente
  de UI — reaplicar essa separação (conteúdo em arquivo próprio, componente
  genérico de exibição) para qualquer novo documento textual longo
  (ex.: política de cookies, regimento interno) que precise do mesmo padrão de
  card → Dialog.
- `PhoneCountryInput` (`components/registration-wizard/phone-country-input.tsx`):
  além do fix acima, o `Menu` do Base UI (`@base-ui/react`, usado por
  `DropdownMenuContent`) tem uma lógica interna de auto-foco no primeiro
  `DropdownMenuItem` pouco depois do popup abrir (via `useListNavigation`/
  `FloatingFocusManager` do `floating-ui-react`, sem prop pública para
  desativar) — isso competia com o foco manual no input de busca, fazendo o
  cursor de digitação "sair" do input de busca logo após o popup abrir. Fix:
  `onFocus={() => searchRef.current?.focus()}` no container da lista de
  países (`<div className="max-h-64 overflow-y-auto p-1">`), devolvendo o
  foco ao input de busca sempre que qualquer item da lista for focado
  automaticamente — como a navegação por teclado já é bloqueada nesse input
  (`stopPropagation` no `onKeyDown`), essa reafirmação de foco não quebra
  nenhuma navegação legítima. Reaplicar esse padrão (delegar `onFocus` no
  container da lista) em qualquer outro popup de `Menu`/`DropdownMenu` com
  campo de busca próprio que apresente o mesmo sintoma.
- Checkbox com label de texto (ex.: "Ainda não possuo CNPJ" no Step 2 e "Li e
  concordo..." no Step 5 do wizard de `/associe-se`): o `<label>` que envolve
  o `Checkbox` e o texto usa sempre `flex items-start gap-2 text-sm
  text-foreground` (nunca `items-center`/`text-muted-foreground` — ajustado no
  Step 2 para igualar ao Step 5, que já usava esse padrão desde a implementação
  do aceite de termos), e o próprio `Checkbox` recebe `className="mt-0.5"` para
  ficar alinhado com a primeira linha do texto sob `items-start` (necessário
  porque o texto do label pode quebrar em mais de uma linha em telas
  estreitas — `items-center` centralizaria o checkbox errado nesse caso).
  Reaplicar esse mesmo par de classes (`items-start` + `mt-0.5`) em qualquer
  novo checkbox com label de texto no wizard, em vez de `items-center` sem
  ajuste de margem.
- Teste manual/navegador de `signUp` do Supabase Auth com e-mail fictício:
  o GoTrue valida o **domínio** do e-mail em `signUp()`, não só o formato —
  um domínio inexistente/não resolvível (ex.: `teste@empresafalsa.com.br`)
  é rejeitado com `error_code: "email_address_invalid"`, mesmo com o resto do
  e-mail bem formado. Usar sempre um domínio real e resolvível (ex.:
  `gmail.com`) para e-mails de teste em `signUp`, mesmo que a caixa de
  entrada não exista de fato — só o domínio precisa ser válido.
- Teste manual/navegador de formulários `useActionState` com campos
  não-controlados (ex.: `#email`/`#confirmar_senha` em
  `steps/step-6-credenciais.tsx`, `#email`/`#password` em `login-form.tsx`):
  o React **reseta automaticamente inputs não-controlados** (sem
  `value`/`onChange`) depois que uma submissão de formulário via Server
  Action (`useActionState`) completa, independente de sucesso ou erro —
  campos controlados (`useState`) não são afetados. Isso significa que, ao
  testar reenvios no navegador após uma submissão que falhou, os campos
  não-controlados voltam a ficar vazios e precisam ser preenchidos de novo
  antes de cada nova tentativa (senão o valor lido pelo `FormData` no
  próximo submit fica vazio/incorreto). Reaplicar esse cuidado em qualquer
  teste manual futuro de formulário com campos mistos (controlados +
  não-controlados) sob `useActionState`.
- Template de e-mail de confirmação (`docs/email-templates/confirm-signup.html`,
  usado no template "Confirm signup" do Supabase Auth — ver Step 7 em "Estado
  atual" e "Pré-requisito manual ainda pendente" na seção Supabase, acima):
  HTML de e-mail exige layout com `<table>` (não flexbox/grid) e **estilos
  inline** em cada elemento — clientes de e-mail não confiam em `<style>`
  global nem em CSS moderno. Cores da marca viram valores hex literais (ex.
  `#495b4f` para `--floresta-700`, `#f7f8f7`/`#d2dbd5` para `--floresta-50`/
  borda, `#3d4c42` para `--floresta-800`, `#d4c0a0` para `--rio-300`) em vez
  de custom properties (`var(--...)`), que não sobrevivem a clientes de
  e-mail. Fontes usam pilhas web-safe que aproximam a marca em vez de
  `next/font` (Georgia/"Times New Roman" no lugar de Lora/`font-serif`,
  Arial/Helvetica no lugar de Geist/`font-sans`). Não há logo em imagem (SVG
  tem suporte ruim em clientes de e-mail e não existe PNG/logo público
  confirmado no repo) — usa um wordmark em texto estilizado. O ponto central
  do template é **nunca incluir `{{ .ConfirmationURL }}`**, só `{{ .Token }}`
  dentro de uma caixa de código estilizada — um scanner de segurança
  corporativo (ex. Microsoft Safe Links) não tem link nenhum para
  pré-clicar/consumir antes do usuário real digitar o código. Reaplicar esse
  mesmo padrão (tabela + inline + web-safe + hex literal + sem link) em
  qualquer novo template de e-mail do Supabase Auth no futuro (ex. "Reset
  Password", "Magic Link"). Toda edição desses templates continua 100%
  manual no painel do Supabase (Authentication → Email Templates) — nunca
  deve ser feita unilateralmente, e enviar e-mails de teste via qualquer MCP
  de e-mail conectado ao projeto exige permissão explícita do usuário a cada
  vez, mesmo que a ferramenta esteja disponível.
- Toasts: feedback assíncrono passageiro (ex.: resultado de "Reenviar
  código" no Step 7 do wizard de `/associe-se`, ver acima) usa o componente
  nativo shadcn **Toast** (`components/ui/toast.tsx`, instalado via
  `npx shadcn@latest add toast`, construído sobre `@base-ui/react/toast` —
  não o antigo `sonner`, removido: `sonner.tsx` deletado, dependência
  `sonner` tirada do `package.json`), nunca uma mensagem inline solta no
  conteúdo do formulário. `<Toaster />` (de `@/components/ui/toast`) é
  montado uma única vez, global, em `app/layout.tsx` (dentro de `<body>`,
  ao lado de `{children}`) — qualquer Client Component em qualquer parte da
  árvore pode disparar toasts só importando `toast` de
  `"@/components/ui/toast"` e chamando `toast.add({ title?, description?,
  type?, priority?, actionProps? })`, sem precisar montar outro
  `<Toaster />` local nem um `ToastManager` próprio (o módulo já exporta um
  `toast` default via `createToastManager()`). Cor por variante é só no
  ícone, não no card inteiro: `ToastIcon` (dentro de `toast.tsx`) mapeia
  `type` para uma cor da escala de marca já registrada como utilitário
  Tailwind (`text-success-600`/`text-warning-600`/`text-error-600`/
  `text-info-600`, via `--color-success-*` etc. no `@theme inline` de
  `globals.css`) — decisão deliberada de manter o card do toast neutro
  (`bg-popover`/`text-popover-foreground`), diferente do antigo `richColors`
  do Sonner que recolorizava o card inteiro via os tokens `--badge-*`
  (esses tokens não são utilitários Tailwind registrados, só CSS custom
  properties cruas). Ícones seguem o padrão Tabler do projeto: `ToastIcon`
  e `ToastClose` usam `IconCircleCheck`/`IconInfoCircle`/
  `IconAlertTriangle`/`IconCircleX`/`IconLoader2`/`IconX` no lugar dos
  ícones lucide-react default do componente shadcn — `IconOctagonX`
  (equivalente mais próximo do ícone default de erro) não existe na versão
  instalada de `@tabler/icons-react` (`3.45.0`), então `IconCircleX` foi
  usado no lugar (mesma substituição já usada quando o app ainda usava
  Sonner). Convenção de mapeamento variante↔status, demonstrada em
  `handleResend` (`steps/step-7-confirmacao.tsx`): sucesso confirmado →
  `type: "success"`; condição esperada/não-erro mas que impede a ação (ex.:
  rate limit do Supabase com tempo de espera conhecido) → `type: "warning"`,
  com o dado relevante (tempo de espera) interpolado direto na
  `description`; falha genérica/inesperada → `type: "error"`.

  **Erros de resultado de Server Action (nível `useActionState`) também
  viram toast**, não só os eventos assíncronos secundários acima: em
  `login-form.tsx` (`signIn`), `steps/step-6-credenciais.tsx`
  (`submitRegistration`) e `steps/step-7-confirmacao.tsx`
  (`verifyRegistrationOtp`), o antigo `{state.status === "error" &&
  <FieldError>{state.message}</FieldError>}` — solto no conteúdo do
  formulário, sem estar preso a nenhum campo específico — foi substituído
  por um `useEffect` observando `state.status` (o mesmo efeito que já
  tratava `"success"`/`"otp_pending"` nesses arquivos, só com mais um
  branch) chamando `toast.add({ type: "error", description: state.message
  })`. Pedido explícito do usuário, depois de testar e notar que mensagens
  como "Este e-mail já está cadastrado. Tente novamente com outro e-mail."
  ainda apareciam como texto inline mesmo após a migração inicial de
  Sonner→Toast nativo (que só tinha coberto o reenvio de código). Isso é
  diferente dos **erros de validação de campo por Zod** (`errors.<field>`
  passado para `FieldError` via a prop `errors`, usados nos Steps 1, 2, 4 e
  5 do wizard) — esses continuam inline, presos ao input errado, porque
  vários podem aparecer ao mesmo tempo (um por campo) e o usuário precisa
  vê-los ao lado do campo que precisa corrigir; toast não serve para esse
  padrão de "vários erros simultâneos apontando pra lugares diferentes na
  tela". Reaplicar esse critério (resultado de submissão completa de
  Server Action → toast; erro de validação por campo → inline) em
  qualquer novo fluxo `useActionState` futuro. Reaplicar também o padrão
  geral de toast já estabelecido (variante por status real, não por
  heurística de UI; ícones Tabler; cor só no ícone via a escala
  `text-{status}-600`, nunca reintroduzir `--badge-*`/recolorir o card) em
  qualquer novo uso de toast no app.

  **Posicionamento: sempre no canto superior direito, em qualquer
  breakpoint** — pedido explícito do usuário ("posicionar todos os toasts
  sempre no canto superior direito"), substituindo o padrão anterior
  (mobile full-width ancorado embaixo/centralizado, só passando a ancorar
  à direita a partir do breakpoint `sm:`). `ToastViewport`
  (`components/ui/toast.tsx`) agora usa uma única classe incondicional
  (`fixed top-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm`, sem variante
  `sm:`) — `w-[calc(100%-2rem)]` reproduz a margem de segurança de 1rem
  que antes vinha de `inset-x-4`/`mx-auto` no mobile, agora medida a partir
  do `right-4`, e `max-w-sm` trava o crescimento em telas largas. A
  reancoragem forçou reescrever também a matemática de empilhamento/entrada
  do `Toast` (função `Toast`, mesmo arquivo): `--toast-offset-y` (variável
  interna do Base UI, lida em `node_modules/@base-ui/react/toast/store.js`)
  é uma soma cumulativa de altura **sem direção própria** (sempre
  não-negativa; o sentido visual pra cima/baixo da pilha é decidido
  inteiramente pelo CSS do consumidor) — não existe API declarativa de
  `placement`/anchor no pacote (confirmado via grep no diretório inteiro do
  Toast). Por isso a troca de ancoragem exigiu inverter manualmente todo
  sinal ligado à direção da âncora: `absolute right-0 bottom-0` →
  `absolute top-0 right-0`, `origin-bottom` → `origin-top`, os dois `*-1`
  no cálculo de `--offset-y` removidos, os sinais de menos no
  `translateY` da transformação recolhida (peek/shrink) trocados para
  mais, a pseudo-`after` de gap entre toasts de `after:top-full` →
  `after:bottom-full`, e a animação de entrada/saída genérica
  (`data-starting-style`/`[data-ending-style]:not(...)`) de
  `translateY(150%)` → `translateY(-150%)` (entra/sai por cima em vez de
  por baixo). As oito regras de `data-ending-style:data-[swipe-direction=
  down/left/right/up]` (com e sem `data-expanded:`) foram **deliberadamente
  mantidas intactas** — representam a direção física do gesto de arrastar
  para descartar, independente de onde o toast está ancorado na tela; as
  que usam `var(--offset-y)` no eixo perpendicular já herdam o sinal
  corrigido automaticamente. Reaplicar esse mesmo raciocínio (distinguir
  lógica dependente da âncora, que precisa inverter sinal, de lógica
  dependente do gesto de swipe, que não muda) caso o posicionamento do
  Toaster mude de novo no futuro. Mudança não verificada no navegador —
  regra permanente do projeto (ver "Fluxo de verificação" no topo deste
  arquivo).
