# Changelog / histórico de implementação — Inova Cumaú

Este arquivo guarda o histórico narrativo detalhado de features e correções
implementadas no projeto: o passo a passo de cada decisão, os bugs
encontrados e como foram corrigidos, e os registros de "verificado end-to-end
no navegador". Foi separado do `CLAUDE.md` em 2026-08-04 porque esse arquivo
é lido por inteiro a cada turno de trabalho com o Claude Code — quando cresce
demais (chegou a 1637 linhas / ~49k tokens), consome a janela de contexto e
atrapalha o desenvolvimento. O `CLAUDE.md` agora mantém só regras essenciais,
convenções ativas e o estado atual condensado; este arquivo é consultado sob
demanda, quando o histórico completo de uma decisão for necessário.

## Home e páginas institucionais

Home (`/`) expandida com seções institucionais: `Hero` → `About`
(`components/sections/about.tsx`, teaser "quem somos") → `Offers`
(`components/sections/offers.tsx`, benefícios de associar-se) → seção
"Portal" (grid de hubs Sobre/Notícias/Mídia/Parceiros, inline em `page.tsx`)
→ `Movements` (`components/sections/movements.tsx`, editais/eventos/
novidades/comunicados) → `Newsletter`.

### Reescrita da seção "Quem somos" (`(marketing)/sobre/quem-somos/page.tsx`)

Pedido explícito do usuário para trocar o antigo parágrafo de origem do nome
("cumaru, árvore nativa da Amazônia" — considerado incorreto pelo usuário,
"nada tem a ver") por uma narrativa verificada sobre o **Forte Cumaú**: forte
erguido em 1632 por ingleses no atual município de Santana/AP (foz do
Igarapé da Fortaleza), com apoio dos povos indígenas Nheengaíbas, Aruãs e
Tucujus, considerado a fortificação mais antiga já documentada no Amapá —
anterior em mais de um século à Fortaleza de São José, em Macapá; disputado
depois por portugueses e franceses, restando hoje só ruínas. Fatos
levantados via busca na internet (pedido explícito do usuário, "Verifique na
internet") em fontes como UNIFAP, IPHAN, Câmara Municipal de Santana e
artigos acadêmicos — nenhum dado inventado. O texto **não** rotula o
conteúdo como "uma curiosidade" (pedido explícito do usuário).

Duas novas seções, **Visão** e **Missão**, foram adicionadas abaixo da prose
original — conteúdo extraído do material original do projeto
(`docs/brand/plano-cominicacao-IC.pdf`, "Plano de Comunicação Inova Cumaú"):
Visão adaptada da seção 3.1 "Conceito-guia" (ponte entre a inteligência da
floresta e a economia digital) e Missão adaptada da seção 3.2 "Missão de
comunicação" (visibilidade, geração de negócios e investimentos para as
startups de tecnologia/bioeconomia do Amapá).

Uma primeira versão implementou Visão/Missão como dois `Card`s lado a lado.
O usuário rejeitou com feedback explícito: *"não quero card pequenos para
visão e missão, nem texto pouco exploratório. Quero duas seções. Uma pra
cada. Não use travessão nos textos e nem uso a fonte lora pra titulo
pequenos. Lora é apenas para títulos enormes e chamativos, para cards,
Usamos a geist normalmente com mais peso."* Reescrito para a versão final:
três seções full-width sequenciais (Forte Cumaú/quem somos, Visão, Missão),
grid de duas colunas (`grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16`),
separadas por `border-t border-border`; a seção Visão usa `bg-rio-100`.

Uma primeira versão dos títulos H2 dessas seções usou `font-sans` (Geist),
seguindo ao pé da letra "Lora só para títulos enormes/cards". O usuário
corrigiu: esses dois títulos específicos **devem** usar Lora — grandes o
bastante para contar como "título chamativo". Classe final de ambos:
`font-serif text-3xl font-medium sm:text-4xl` (idêntica ao H1 "Quem somos").
**Não existe uma convenção geral de "títulos de seção usam Geist"** — a
escolha Lora vs. Geist para títulos de seção é decidida caso a caso pelo
usuário. Nenhum travessão ("—") permanece em nenhum texto desta página.

## Wizard de cadastro (`/associe-se`)

Wizard de cadastro de startups, substituindo o antigo formulário simples de
`leads_associacao`: 7 steps (dados do responsável, dados do negócio,
contato, segmentação, termos, criar conta, confirmação de e-mail),
validados com Zod por step, estado mantido em memória (`useState`) até o
step final.

### Step 1 — Responsável

Ordem: Responsável pela Inscrição, E-mail (`responsavel_email`,
obrigatório), Celular/WhatsApp (grid 2 colunas, `PhoneCountryInput`),
Cargo/função.

### Step 2 — Empreendimento

Ordem: CNPJ (+ checkbox "ainda não possuo CNPJ") como primeiro campo, Nome
do Negócio, Endereço comercial (`contato_endereco`, opcional) e Cidade
(`contato_cidade`, obrigatória) — relocados do antigo Step 3 para não
fragmentar um mesmo endereço em duas etapas. CNPJ validado por checksum
(`lib/cnpj.ts`, `isValidCNPJ`) e, quando os 14 dígitos são válidos, consulta
a BrasilAPI via Server Action (`lookupCnpj`) para autopreencher
`startup_nome`, `contato_endereco` e `contato_cidade`. O autofill nunca
sobrescreve valor já digitado manualmente (`v.field || result.data.value`);
`contato_endereco`/`contato_cidade` continuam habilitados mesmo com "ainda
não possuo CNPJ" marcado (só o campo de CNPJ é desabilitado). Verificado
end-to-end no navegador: ordem dos campos, autopreenchimento com CNPJ real,
preservação de valores manuais, campos habilitados com checkbox marcado.

### Step 3 — Contato

Expandido para paridade com o Step 1: e-mail público da startup, grid de 2
colunas com Telefone (`contato_telefone`, obrigatório) e WhatsApp
(`contato_whatsapp`, opcional), ambos `PhoneCountryInput`; seguido de Site,
Instagram, Facebook e LinkedIn (`UrlInput`), cada um em sua própria linha
(sem grid — pedido explícito do usuário). Verificado no navegador via
`getBoundingClientRect()`: Telefone/WhatsApp na mesma linha, redes sociais
empilhadas uma por linha.

### Step 4 — Segmentação

Combobox multi-select com busca (`MultiSelectCombobox`) no lugar da antiga
grade de checkboxes. `TECH_SEGMENTS` (`constants.ts`): 24 verticais "-tech"
reais + "Outra" (campo de texto livre). Termo é "Agrotech" (não "Agtech")
para casar com busca em português. Segundo campo multi-select, "Objetivo da
filiação" (`objetivo_filiacao`, `OBJETIVOS_FILIACAO`), mesmo padrão de
"Outros" condicional. Ordem final: Segmentos de atuação → [Qual segmento?]
→ Outros detalhes (textarea com contador) → Objetivo da filiação → [Qual
objetivo?] — pedido explícito do usuário para não deixar "Outros detalhes"
isolado no fim do step. Verificado end-to-end: busca por dial code/nome de
país no `PhoneCountryInput`, seleção múltipla, remoção de badge, exibição
condicional de "Outra"/"Outros", bloqueio de avanço sem seleção.

### Step 5 — Termos

Dois cards lado a lado ("Termos de Uso"/"Política de Privacidade"), cada um
um `Card` clicável (`LegalDocumentCard`) que abre um `Dialog` com conteúdo
de `registration-wizard/legal-content.ts` (10 seções cada, pesquisado a
partir de padrões comuns de Termos/Política e adaptado ao contexto da Inova
Cumaú, sem inventar dado real). Checkbox de aceite (`termos_aceitos`)
**exige leitura completa dos dois documentos antes de habilitar**: estado
`termosRead`/`privacyRead`, detecção de fim de scroll via
`checkScrolledToEnd` (`el.scrollHeight - el.scrollTop - el.clientHeight <=
4`) chamada no `onScroll` e no `onOpenChange` (via `setTimeout(0)`, cobre
conteúdo que já cabe sem rolar). `IconCheck` aparece no título do card
assim que lido. Reaplicar esse padrão ("leitura obrigatória antes de
liberar ação") em qualquer documento textual longo futuro que precise de
confirmação de leitura. Verificado end-to-end: conteúdo dos Dialogs
correto, checkbox alternando, gate de leitura funcionando nos dois
documentos, fonte Geist nos `CardTitle`.

### Step 6 — Criar conta (antigo "Login e senha")

E-mail de acesso, senha e confirmar senha, via `useActionState` +
`submitRegistration`. **Sem tabela de login própria** — reutiliza
`auth.users` do Supabase Auth. Critérios de senha
(`PASSWORD_REQUIREMENTS`/`PASSWORD_SPECIAL_CHARS` em `schema.ts`): mínimo 8
caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial do
conjunto `!@#$%¨&*`. Checklist ao vivo (`IconCircleCheck`,
`text-success-700`/`text-muted-foreground`) abaixo do campo de senha
(controlado via `useState`); e-mail e confirmar senha são não-controlados.
Cabeçalho do wizard (`StepCard`) esconde o ícone grande só para este step
(`showIcon = step.key !== "credenciais"`, `STEPS` inalterado — o ícone
menor da `StepperNav` não é afetado). Título "Criar conta" (era "Login e
senha"), botão "Criar conta" (era "Concluir cadastro"), descrição "E-mail e
senha de acesso à sua conta." (era "Dados de acesso para a gestão
interna."). Verificado end-to-end: checklist reativo, `signUp` criando
linha em `auth.users`.

### Step 7 — Confirmação de e-mail (OTP)

Resolve o gap de confirmação de e-mail exigida por padrão no projeto
Supabase: `submitRegistration` retorna `{ status: "otp_pending", email }`
em vez de erro terminal quando `signUp` não devolve sessão ativa; o wizard
avança para o Step 7, um `InputOTP` de **8 dígitos** (não 6 — corrigido
depois de um teste real mostrar que o e-mail deste projeto usa 8 dígitos,
não o valor mais comum de 6 do GoTrue; `step7Schema`/`InputOTP` ajustados,
`maxLength={8}`, dois grupos de 4). `verifyRegistrationOtp` revalida com
Zod, chama `supabase.auth.verifyOtp({ email, token, type: "signup" })` e só
então insere em `startup_registrations` via `insertStartupRegistration`
(mesmo helper do caminho raro de sessão já ativa) — é nesse momento que
`auth.uid()` passa a existir e a RLS libera o insert.

Botão "Reenviar código" (`resendRegistrationOtp`,
`supabase.auth.resend({ type: "signup", email })`) com **cooldown de 60s**
entre reenvios, "quente" já na montagem do step (o `signUp()` do Step 6 já
dispara o e-mail antes do usuário chegar ao Step 7).

**Rate limit do Supabase Auth**: usuário reportou reenvio sempre falhando.
Causa raiz (via `get_logs`, service `auth`): GoTrue aplica rate limit
embutido por e-mail (~60s, não configurável pelo painel), HTTP 429
`error_code: "over_email_send_rate_limit"`. Corrigido: `resendRegistrationOtp`
faz parse do tempo de espera na mensagem (`/after (\d+) seconds?/i`) e
retorna `{ error: true, retryAfterSeconds }`; o cooldown local usa esse
valor quando disponível. Reaplicar esse padrão (nunca descartar erro do
Supabase Auth sem parsear tempo de espera; cooldown client-side
pré-emptivo) em qualquer fluxo futuro que dispare e-mails via GoTrue (reset
de senha, magic link etc.).

Bloco de sucesso ("Cadastro realizado!") movido do Step 6 para o Step 7 (é
onde o sucesso real acontece agora), com `IconCircleCheck` grande
(`size-12 text-success-600`). Texto de apoio: "Você já pode entrar com seu
e-mail e senha." (não menciona análise/aprovação manual — o cadastro não
passa por validação da equipe).

Ao validar o cadastro (Step 6 ou 7), três coisas acontecem simultaneamente
(estado `isComplete` elevado a `RegistrationWizard`, via `onComplete`): o
step final aparece marcado como concluído na `StepperNav`; os pontinhos de
progresso somem (`StepCard` ganhou prop `hideProgress`); surge um botão
para `/area-do-associado` (padrão polimórfico `Button render={<Link .../>}
nativeButton={false}`).

**Correção de tamanho do código (6 → 8 dígitos)**: `Mailer.OtpLength` é
configurável de 6 a 10 no GoTrue; o valor real deste projeto só pôde ser
confirmado testando um e-mail real. Nunca assumir 6 como padrão fixo se o
`OtpLength` for alterado no futuro.

**Feedback de reenvio migrado para toast**: "Código reenviado..."/erro de
rate limit/erro de código incorreto deixaram de ser `FieldDescription`/
`FieldError` inline e viraram `toast.add(...)`, mapeados por status real
(sucesso → `success`; rate limit → `warning`, com tempo de espera na
mensagem; falha genérica → `error`).

**Verificado end-to-end no navegador** (wizard completo, Steps 1→7, dados
fictícios): Steps 1–4 sem erros; Step 5 com gate de leitura liberado após
rolar os Dialogs; Step 6 com `signUp()` real (linha em `auth.users`
confirmada via `execute_sql`); Step 7 alcançado, estrutura confirmada via
DOM (`{ groupCount: 2, hasSeparator: true, maxLength: 8, slotCount: 8 }`);
caminho de código incorreto ("00000000") exibe erro sem crash. **Ainda não
verificado**: caminho de sucesso completo do OTP (código real por e-mail →
`verifyOtp` → insert → login) — bloqueado pelo pré-requisito manual do
template de e-mail (ver seção Supabase no `CLAUDE.md`).

## Login (`/entrar`)

`login-form.tsx` + `entrar/actions.ts` (`signIn`) usa
`supabase.auth.signInWithPassword` e redireciona para
`/area-do-associado`; qualquer erro mostra a mesma mensagem genérica
"E-mail ou senha incorretos." via toast (`useEffect` observando
`state.status === "error"`), sem distinguir credenciais erradas de e-mail
não confirmado (não revela se a conta existe). Verificado no navegador:
credenciais erradas e corretas-mas-não-confirmadas mostram o erro
corretamente. **Correção**: o redirect pós-login apontava para `/` em vez
de `/area-do-associado` — corrigido.

`entrar/page.tsx` ganhou link "Voltar para o início" (`href="/"`) acima do
`LoginForm`, mesma convenção de estilo do link equivalente no wizard, aqui
com `inline-block` (fora de um `<aside>` flex).

## Teste manual de e-mail/domínio (GoTrue)

O GoTrue valida o **domínio** do e-mail em `signUp()`, não só o formato —
domínio inexistente/não resolvível é rejeitado (`email_address_invalid`).
Usar sempre um domínio real e resolvível (ex.: `gmail.com`) para e-mails de
teste, mesmo que a caixa não exista de fato.

## Reset de campos não-controlados em `useActionState`

React reseta automaticamente inputs não-controlados após uma submissão via
Server Action (`useActionState`), sucesso ou erro — campos controlados
(`useState`) não são afetados. Em testes manuais de reenvio, preencher os
campos não-controlados de novo antes de cada nova tentativa.

## Template de e-mail de confirmação

`docs/email-templates/confirm-signup.html`: HTML de e-mail com `<table>` +
estilos inline (clientes de e-mail não confiam em `<style>` global/CSS
moderno), cores da marca como hex literais (`#495b4f` = `--floresta-700`
etc.), fontes web-safe (Georgia/Times New Roman no lugar de Lora, Arial no
lugar de Geist), sem logo em imagem (wordmark em texto estilizado). Ponto
central: **nunca incluir `{{ .ConfirmationURL }}`**, só `{{ .Token }}` — um
scanner de segurança corporativo (ex. Microsoft Safe Links) não tem link
para pré-clicar antes do usuário digitar o código. Reaplicar esse padrão em
qualquer novo template do Supabase Auth (Reset Password, Magic Link).

## Área do Admin (`/admin`, sidebar-07)

Instalado `npx shadcn@latest add sidebar-07` **exatamente como o bloco de
exemplo** (pedido explícito: "criar exatamente como é... e depois vamos
mudando... conforme a necessidade"), sem customização de conteúdo/cores/
ícones. Usa `lucide-react` (única exceção à convenção Tabler do projeto,
deliberada). `TooltipProvider` adicionado a `app/layout.tsx` (exigido pela
CLI, tooltips do sidebar colapsado). A CLI tentou sobrescrever `input.tsx`
(token `--text-placeholder`) e `dropdown-menu.tsx` (prop `anchor`) —
instalado com `--overwrite --yes` e os dois arquivos restaurados via `git
checkout` na sequência (sem mudanças pendentes antes, sem risco). Reaplicar
esse cuidado (`--diff` antes de `--overwrite`, `git checkout` depois) em
qualquer instalação futura de bloco shadcn.

Rota movida de `/dashboard` (stock) para `app/admin/page.tsx` — pasta
`app/dashboard/` removida (nenhum outro arquivo referenciava). Segue com
dados 100% stock, aguardando instrução do usuário sobre conteúdo real.

**"Abrasileiramento" do `team-switcher.tsx`**: `data.teams` (antes 3
empresas fictícias) virou 2 entradas, ambas "Inova Cumaú", distinguidas só
pelo campo `plan` — "Associado" e "Administrador" (pedido explícito:
"Enterprise" representava tipo de usuário). Ícone de cada entrada trocado
para `<Logo variant="white" .../>` (aproveitando o `bg-sidebar-primary`
já existente no container `size-8`); o container menor do dropdown
(`size-6`) ganhou o mesmo fundo no lugar de `border`. **Nenhuma lógica de
nível de acesso foi implementada** — `plan` é só texto exibido, sem efeito
em rotas/dados (deixado para próximo passo explícito). "Teams"/"Add team"
permanecem em inglês, stock (não tocados, relação direta com o desenho
pendente de níveis de acesso).

`/admin` virou Server Component assíncrono, puxando dados reais do usuário
logado: `supabase.auth.getUser()` + `redirect("/entrar")` sem sessão (guarda
de acesso nova); busca `startup_nome` em `startup_registrations` filtrando
por `user_id` (RLS policy `owner can select own registration` já existia).
`user` montado: `{ name: startup_nome ?? "Associado", email: authUser.email
?? "", avatar: "" }`. Depois trocado para `responsavel_nome`/
`responsavel_email` (ver seção "Header ciente de autenticação" abaixo, o
mesmo ajuste vale só para o header — `admin/page.tsx` continua com
`startup_nome`).

`NavUser` ganhou: (1) `Avatar` quadrado (`rounded-lg`, via `className` nos
pontos de uso, já que `avatar.tsx` compartilhado é `rounded-full`
hardcoded); (2) fallback com iniciais reais (`getInitials`) em vez de "CN"
hardcoded.

## Tradução completa do inglês remanescente para PT-BR

Varredura completa do app (pedido explícito: "Traduzir tudo que está em
inglês"). Dados stock de `app-sidebar.tsx`/`nav-main.tsx`/
`nav-projects.tsx`/`nav-user.tsx`/`team-switcher.tsx`/`admin/page.tsx`
(breadcrumb) traduzidos. Componentes `ui/` compartilhados também tocados:
`ui/sidebar.tsx` (labels de acessibilidade), `ui/dialog.tsx`/`ui/sheet.tsx`
("Close"→"Fechar"), `ui/breadcrumb.tsx`, `ui/toast.tsx`. Falsos positivos
descartados: `.sr-only` como seletor CSS em `className`, rótulos "-tech" de
`constants.ts` (termos deliberados de vertical de startup).

## Botão "Sair" funcional (Admin)

Server Action `signOut` em `app/admin/actions.ts`: `supabase.auth.signOut()`
+ `redirect("/entrar")`. Chamada via RPC direto do Client Component
(`onClick={() => signOut()}`, sem `<form>`).

## Correções arquiteturais da "área do associado"

### 1ª correção: sidebar-07 é a área do Admin, não do associado

Tudo documentado até então como "área do associado" era na verdade a área
do **Admin** — movida para `/admin`. A área do associado real: quando um
associado comum faz login, continua vendo a mesma home/landing institucional
(header/footer sempre presentes), só muda um **avatar no canto superior
direito do header** (`HeaderUserMenu`) no lugar de "Entrar"/"Associe-se".

Implementado: `(marketing)/area-do-associado/page.tsx` dentro do route group
`(marketing)` (herda header/footer automaticamente);
`(marketing)/layout.tsx` virou Server Component assíncrono buscando
`startup_nome`/user e passando `user` para `<SiteHeader user={user} />` —
todas as páginas de `(marketing)/` ganham o header ciente de autenticação
automaticamente. `HeaderUserMenu` (novo): `DropdownMenu` com `Avatar`
quadrado, label nome/e-mail, dois itens (link "Área do associado",
"Sair" — Server Action distinta do Admin, redireciona para `/`, não
`/entrar`, já que um associado comum deslogando vira visitante anônimo).

### 2ª correção: dashboard próprio com sidebar (rejeitada na sequência)

Pedido explícito do usuário para criar sidebar com Perfil (Meus dados,
Privacidade, Mensagens, Notificações) / Atividades (Salvos) / Carteira
(Cartão de sócio, Cumaú Coin) / Sair — isso substituiu a premissa da
correção anterior. O usuário havia sugerido antes reaproveitar `sidebar-07`
também aqui; esclarecimento pedido via `AskUserQuestion` foi dispensado sem
resposta, sinalizando aguardar a próxima instrução (a lista de opções da
sidebar) como a real.

Implementado nesse momento: rota top-level `app/area-do-associado/page.tsx`
(fora de `(marketing)`, sem herdar header/footer), `SidebarProvider` +
`AssociadoSidebar` + `SidebarInset`, `NavAssociado` com três grupos
colapsáveis + item "Sair" avulso.

### 3ª correção: sidebar não pode ficar desapartada do header/footer

Usuário corrigiu a implementação anterior: *"você não seguiu o plano de
manter header nav e footer. essa área não é algo desapartado da
ladingpage."* Causa raiz: o primitivo `Sidebar` do shadcn renderiza seu
container desktop como `position: fixed` + `h-svh` — incompatível com
coexistir com header/footer em fluxo normal.

Correção final: rota de volta para `(marketing)/area-do-associado/page.tsx`
(herda `SiteHeader`/`SiteFooter`); `associado-sidebar.tsx` e a rota
top-level antiga removidos. `NavAssociado` deixou de depender do contexto
do Sidebar — `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent`
(sem dependência de contexto) + markup `<ul>`/`<a>`/`<button>` estilizado à
mão, mesmos três grupos/ícones/`signOut`. Chevron usa
`group-data-open/collapsible:rotate-90` (não `group-data-[panel-open]` —
confirmado via leitura do `@base-ui/react` que o Collapsible **Root**
reaplica `data-open`/`data-closed` do **Panel**, enquanto `data-panel-open`
é exclusivo do **Trigger**).

Página virou layout de duas colunas em fluxo normal:
`<section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6">` +
`<div className="flex flex-col gap-8 lg:flex-row">`, `<aside
className="lg:w-64 lg:shrink-0">` (NavAssociado) + `<div
className="flex-1">` (saudação + conteúdo). `PageHeader` avaliado e
descartado (estilo centralizado não serve para saudação personalizada à
esquerda). Sub-itens continuam `href="#"` (só navegação/estrutura pedida).

### Cards de novidades + banner carrossel

Pedido: "crie alguns card de novidades: artigos pra ler, eventos
acontecendo, ultimos avisos... banner carrossel no topo e cards com modelo
(igual ao que temos da aba mídias no navbar". Carrossel via primitivo
shadcn `Carousel` (`embla-carousel-react`), `BANNER_SLIDES` (3 slides,
cores da marca). `CarouselPrevious`/`CarouselNext` reposicionados de
`-left-12`/`-right-12` (padrão, fora dos limites) para `left-2`/`right-2`
via `className` — necessário porque o carrossel vive numa coluna
`flex-1` sem espaço lateral sobrando. Seção "Novidades" reutiliza o
modelo de `(marketing)/midia/page.tsx`: `NOVIDADES_LINKS` mapeado em
`LinkCard`s, 3 categorias (Artigos, Eventos, Avisos). **Sem tabela
Supabase própria ainda** — todos os `href` são `"#"`, textos genéricos
(nenhum dado real inventado).

### Header ciente de autenticação usa dados do responsável, não da startup

Nome/e-mail exibidos no header deixaram de vir de `startup_nome`/
`authUser.email` e passaram a vir do **responsável pela inscrição**:
`(marketing)/layout.tsx` consulta `responsavel_nome`/`responsavel_email`,
extrai só o primeiro nome (fallback "Associado"), usa `responsavel_email`
como e-mail (fallback `authUser.email` só se vazio). `HeaderUserMenu` ganhou
o primeiro nome também no `DropdownMenuTrigger` (visível na barra), ao lado
do avatar — **só o nome no trigger, e-mail só dentro do dropdown aberto**
(pedido explícito após uma versão que duplicava o e-mail). Compartilhado
entre desktop e mobile sem variante por breakpoint. `area-do-associado/
page.tsx` (texto "Bem-vindo(a)") não foi tocado, continua com `startup_nome`
— fora do escopo desse pedido específico.

### Correção visual: linha de indentação da sidebar

Pedido: "apenas corrija o componente sidebar. a linha da seção está fora da
direção correta, tem muito espaço sendo consumido a direita." Diagnóstico
via `AskUserQuestion` (usuário escolheu "Linha vertical de indentação"): o
`<ul>` de sub-itens em `NavAssociado` tinha só `pl-4` sem margem/limite à
direita, esticando a linha `border-l` e a área de clique até a borda direita
da coluna. Corrigido espelhando o padrão stock do shadcn (`SidebarMenuSub`
usa `mx-3.5`): primeira correção usou `mr-2`/`ml-2`. Usuário apontou que a
linha ainda não caía sob o centro do ícone do item pai. Diagnosticado
comparando com `sidebar.tsx` stock: `SidebarMenuButton` usa `p-2` (8px) +
ícone `size-4`, centro do ícone a 16px da borda; `NavAssociado` usava
`px-2.5` (10px), jogando o centro para 18px. Corrigido replicando os
valores exatos do stock: `navItemTriggerClass` → `p-2`; `<ul>` →
`mx-3.5 mt-0.5 flex translate-x-px flex-col gap-0.5 border-l
border-border pl-2.5`.

## Página "Meus dados" (`(marketing)/area-do-associado/meus-dados/`)

Primeira página real da sidebar do associado, quatro arquivos:
- `schema.ts` — `meusDadosSchema`: combina campos editáveis de
  `startup_registrations` (responsável, negócio com CNPJ/autofill,
  segmentação com multi-select), mesmos `superRefine`s do wizard. Excluídos:
  campos de notificação/privacidade (futuras páginas), 7 campos de contato
  sempre-`null`, campos imutáveis/sistema.
- `actions.ts` — `updateMeusDados` (`useActionState`): revalida com Zod no
  servidor, `.update(...).eq("user_id", user.id)` (RLS UPDATE já existia),
  re-exporta `lookupCnpj`. `revalidatePath` em ambas as rotas após sucesso.
- `meus-dados-form.tsx` — formulário controlado (todos os campos via
  `useState`, necessário pela interação CNPJ ausente/autofill/multi-select),
  reutiliza `PhoneCountryInput`/`MultiSelectCombobox`/Select+Dialog de fase
  do negócio/textareas com contador do wizard. Arrays e booleano via
  `<input type="hidden">`.
- `page.tsx` — guarda de acesso, seleciona campos editáveis, passa `initial`
  para o form. Mesmo layout de duas colunas de `area-do-associado/page.tsx`.

`nav-associado.tsx`: "Meus dados" aponta para
`/area-do-associado/meus-dados`.

## Correções de bugs de UI

### Botão "Salvar alterações" com largura/posição erradas

`meus-dados-form.tsx`: `<Field className="mt-2 flex-row justify-end">`
esticava o botão para `w-full` porque `Field` aplica `*:w-full` na
orientação vertical padrão. Corrigido usando `orientation="horizontal"`
(prop própria do `Field` para esse propósito) em vez de sobrescrever via
`className`.

### Abrir um `Select`/`Popover` rolava a página para o topo

Bug relatado pelo usuário. Causa raiz (via leitura do `@base-ui/react`,
`select/popup/SelectPopup.js` e `floating-ui-react/components/
FloatingFocusManager.js`): `Select`/`Popover` usam `FloatingFocusManager`
sem `initialFocus` customizado — ao abrir, o foco vai para o primeiro
elemento focável **dentro** do popup (ex.: item selecionado), não para o
container; `enqueueFocus` interno só passa `preventScroll: true` quando o
alvo é o próprio container, então focar um item interno permite o
scroll-into-view nativo do navegador. Não há prop pública para desativar.

Uma primeira tentativa (dois `requestAnimationFrame` aninhados, adivinhando
o timing) **não resolveu** em teste real — apostar em contagem de frames
contra o scheduling interno do Base UI não é confiável. Substituído por
abordagem orientada a evento: ao abrir, guarda `window.scrollX/scrollY` e
registra um listener de `scroll` em `window` (capture phase) que restaura a
posição imediatamente a cada evento, removido após 300ms. Aplicado em
`components/ui/select.tsx` (wrapper genérico interceptando `onOpenChange`,
necessário porque `Select` do Base UI é genérico — `SelectPrimitive.Root.Props`
exige argumentos de tipo, `TS2707`) e depois no mesmo padrão em
`components/ui/popover.tsx` (mesmo bug relatado no `MultiSelectCombobox`,
que usa `Popover`). Como `Popover` é a base de `MultiSelectCombobox` e
qualquer outro Popover do app, o fix cobre todos os usos automaticamente.
Reaplicar esse padrão (listener de `scroll` real, não contagem de frames)
em qualquer outro componente baseado em `FloatingFocusManager` que
apresente o mesmo sintoma (`DropdownMenu`, `Menu`, se reportado).

## Reposicionamento de Toast (canto superior direito)

Pedido explícito: "posicionar todos os toasts sempre no canto superior
direito", substituindo o padrão anterior (mobile full-width ancorado
embaixo, `sm:` passando a ancorar à direita). `ToastViewport` usa uma
classe incondicional (`fixed top-4 right-4 z-50 w-[calc(100%-2rem)]
max-w-sm`, sem variante `sm:`).

A reancoragem forçou reescrever a matemática de empilhamento/entrada do
`Toast`: `--toast-offset-y` (variável interna do Base UI) é uma soma
cumulativa de altura **sem direção própria** (sempre não-negativa; o
sentido visual é decidido pelo CSS do consumidor) — não há API declarativa
de `placement`/anchor no pacote. A troca exigiu inverter manualmente todo
sinal ligado à direção da âncora: `absolute right-0 bottom-0` → `absolute
top-0 right-0`, `origin-bottom` → `origin-top`, os `*-1` no cálculo de
`--offset-y` removidos, sinais de menos no `translateY` de peek/shrink
trocados para mais, a pseudo-`after` de gap de `after:top-full` →
`after:bottom-full`, animação de entrada/saída genérica de
`translateY(150%)` → `translateY(-150%)`. As oito regras de
`data-ending-style:data-[swipe-direction=...]` foram **deliberadamente
mantidas intactas** — representam a direção física do gesto de arrastar,
independente da âncora na tela. Reaplicar esse raciocínio (distinguir
lógica dependente da âncora, que inverte sinal, de lógica dependente do
gesto de swipe, que não muda) caso o posicionamento mude de novo.

## Migração de Sonner para Toast nativo do shadcn

Ver seção "Toasts" nas Convenções do `CLAUDE.md` para a convenção ativa.
Histórico: o app usava `sonner` inicialmente; migrado para o Toast nativo
shadcn (`@base-ui/react/toast`) — `sonner.tsx` deletado, dependência
`sonner` removida do `package.json`. Depois da migração inicial (só
cobrindo o reenvio de código do Step 7), o usuário testou e notou que
mensagens de erro de resultado de submissão completa (`useActionState`)
ainda apareciam como `FieldError` inline solto no formulário (ex.: "Este
e-mail já está cadastrado..."). Corrigido migrando também esses casos para
toast, mantendo só os erros de validação Zod por campo como inline (regra
final documentada no `CLAUDE.md`).

## Foto de perfil e redirecionamento pós-login por role

Bucket de storage `profile-photos` (público, limite 2 MB): upload, preview e
exclusão de avatar na página "Meus dados", com `avatar_url` propagado
globalmente (`SiteHeader` e `NavUser` do admin, via os respectivos layouts),
mesmo padrão depois reaproveitado pelo bucket `project-media`.

Coluna `role` adicionada a `startup_registrations` (default `'associado'`,
precursora do modelo de papéis que mais tarde migraria para `user_roles`,
ver seção "Papel Consultor" adiante). `signIn` passou a consultar esse
campo e redirecionar contas com `role === "admin"` para `/admin`, associados
comuns continuam em `/area-do-associado`.

## Ajustes finos na sidebar admin (pós sidebar-07)

Sequência de pequenos ajustes sobre o bloco `sidebar-07` instalado stock:
label de role dinâmico no `TeamSwitcher` (deixa de mostrar sempre
"Associado"/"Administrador" fixos, passa a refletir a role real da conta
logada); links para "Início do site" e "Área do associado" adicionados ao
dropdown do `TeamSwitcher`; item "Área administrativa" (link para `/admin`)
adicionado ao dropdown do `HeaderUserMenu` quando `role === "admin"`,
complementando o redirecionamento pós-login (exige propagar a role também
para `(marketing)/layout.tsx` até `SiteHeader` e `HeaderUserMenu`); rótulos
stock "Área de Testes"/"Favoritos" trocados por "Dashboard"/"Métricas";
`cursor-pointer` adicionado aos itens de dropdown que ficavam com cursor
default (`nav-projects.tsx`, `nav-user.tsx`, `team-switcher.tsx`); atalho de
teclado `⌘N` e ícone "add team" do stock removidos do `team-switcher.tsx`
por não terem função real no projeto.

**Indicador de scroll (hover) só ativava depois do primeiro scroll
manual**: causa raiz era o hook `useScrollableList` calcular overflow num
`useEffect` com dependências estáveis (`useRef`/`useCallback`), reagindo só
à montagem do componente dono do hook, não ao elemento de fato aparecer,
como listas em popover/dropdown são portaladas e montam depois, o
indicador ficava "invisível" até o primeiro scroll manual recalcular o
estado. Corrigido espelhando o nó em `state` via ref-callback, para o
efeito reagir ao elemento real aparecer. Aproveitado o mesmo commit para
introduzir `ScrollHoverButton` (setas de scroll contínuo no hover,
espelhando o algoritmo do `SelectScrollArrow` do Base UI), aplicado em
`Command`, `PhoneCountryInput` e `MultiSelectCombobox`.

## Formulário de associação simples e campo Estado/UF via IBGE

`membership-form.tsx` (formulário simples, distinto do wizard completo de
`/associe-se`) ainda usava um `<select>` nativo para "Segmento", destoando
do resto do app, trocado por `Select`/`SelectTrigger`/`SelectContent`/
`SelectItem` do shadcn.

Campo `contato_estado` (UF) adicionado ao wizard de cadastro e a "Meus
dados", com um combobox de cidades (`city-combobox.tsx`) alimentado pela
API de localidades do IBGE (`lib/ibge-actions.ts`, `listMunicipiosByUf`) no
lugar do input livre de texto anterior, evitando erro de digitação e
mantendo cidade/estado consistentes. A consulta de CNPJ via BrasilAPI
passou a retornar também a UF, autopreenchendo o campo do mesmo jeito que já
acontecia com cidade/endereço/nome. Trocar a UF limpa a cidade selecionada,
já que a lista de municípios depende do estado escolhido.

## Página de Métricas admin e mapa de negócios por região

Nova página `/admin/metricas`: cards de associados/crescimento/contas
ativas e um mapa do Brasil (`business-map-card.tsx`) plotando as startups
associadas agrupadas por cidade, geocodificadas via um dataset de
municípios brasileiros. Aproveitado para corrigir `admin/page.tsx`, que
ainda lia `startup_nome`/`startup_email` em vez de `responsavel_nome`/
`responsavel_email` de `startup_registrations`.

Ícones do sidebar admin trocados de `lucide-react` para Tabler (biblioteca
oficial do projeto), item "Modelos" renomeado para "Editor de conteúdo"
(viria a virar "Ferramentas" mais adiante) e os placeholders stock
"Documentação"/"Viagens" removidos.

**Fallback de dados mockados mascarava o caso real de zero resultados**: o
`business-map-card` exibia `MOCK_CITIES` quando não havia negócios
geocodificados, escondendo o estado real de "nenhum dado ainda". Corrigido
para usar sempre os dados vindos de `startup_registrations`, mesmo quando
vazio.

**Falha em `admin.listUsers` derrubava a página inteira de Métricas**:
causa raiz era uma linha em `auth.users` com colunas de token `NULL` (dado
corrompido), fazendo o GoTrue retornar 500 no `listUsers` e o código
relançar o erro sem tratamento. Dado corrigido via SQL direto no Supabase;
`getContasAtivas` passou a capturar falhas da API admin e degradar apenas
aquele card, em vez de derrubar a página inteira.

## Página de Configurações admin (6 abas)

Nova área organizacional em `/admin/configuracoes`, alcançável via
"Configurações > Geral" na sidebar: seis abas (Meus Dados, Perfil, Senha,
Equipe, E-mail, Notificações). Introduziu `SettingsSection`/`SettingsRow`
como novo padrão de construção de UI para páginas administrativas,
reaproveitado depois em outras telas do admin.

## Papel Consultor, Ferramentas/Projetos e convite via Resend

A entrega mais extensa do projeto até aqui, somando o plano registrado em
`splendid-napping-blanket.md` a uma sequência de ajustes pós-entrega.

**Papéis de plataforma**: modelo migrado de uma coluna solta em
`startup_registrations` para uma tabela dedicada `user_roles`, com
`PlatformRole` estendido para `"owner" | "administrador" | "consultor" |
"associado"`. `owner` é a autoridade máxima (a conta `ictechub@gmail.com`,
"Admin dos Admin"), deliberadamente fora de qualquer enum de UI/Zod, então
nenhum caminho do app consegue atribuí-lo, e nenhuma outra conta consegue
alterar ou excluir uma conta `owner`. `isPlatformAdmin()` e
`requirePlatformRole()` (helpers novos em `lib/user-role.ts`) generalizam
os gates que antes só aceitavam `"administrador"`, permitindo Consultor
entrar em Métricas, Ferramentas e no próprio perfil sem acesso à área de
associados.

**Convite direto de Consultor**: usa
`supabase.auth.admin.generateLink({ type: "invite", ... })` (só gera o
link, não dispara e-mail do Supabase) e envia o e-mail via **Resend**,
decisão explícita do usuário e exceção deliberada à stack padrão do
projeto (só para esse fluxo, o e-mail de confirmação de cadastro público
continua nativo do Supabase Auth). Nova rota `convite/definir-senha`
(client-side, lê o fragmento da URL com o token, chama
`setSession`/`updateUser`) porque o link de convite do Supabase entrega a
sessão via fragmento, que nunca chega ao servidor. `startup_registrations`
reaproveitada como perfil também de um Consultor sem startup real,
gravando valores sentinela nos campos obrigatórios de startup (mesmo
padrão já usado por uma conta de teste anterior).

**Ferramentas/Projetos**: "Editor de conteúdo" renomeado para
"Ferramentas", implementados artigos de verdade estilo Notion via
**Tiptap** (`lib/tiptap-extensions.ts`, fonte única de verdade do schema,
usada tanto pelo editor quanto pelo `generateHTML()` do render público,
para os dois nunca divergirem), tags fixas (Tecnologia, Eventos, Ciência,
Inovação, Empreendedorismo, Bioeconomia, Política), publicação direta para
a coluna pública de notícias e um modelo de permissão (ver/editar/
compartilhar) com cascata automática de "chefe direto + pares" via
organograma (`team_members`, `lib/project-access.ts`): quem cria um
projeto dá acesso de editar automaticamente ao seu gestor direto e aos
seus pares, sem subir a cadeia inteira; excluir o projeto ou conceder
permissão a outras pessoas continua exclusivo do dono ou de `owner`.

**Páginas novas de administração**: Equipe (organograma, membros e
permissões, reaproveitando `team_members`), Usuários (gestão de papéis e
botão "Convidar Consultor"), coluna de matrícula (`lib/matricula.ts`) na
tabela de Usuários, "Meus Dados" reestruturada em abas. Componentes shadcn
novos instalados para essas telas: `Table`, `Toggle`/`ToggleGroup`.

**Ajustes pós-entrega**: `RESEND_API_KEY`/`RESEND_FROM_EMAIL` declaradas
em `turbo.json` (build parou de avisar sobre env vars não declaradas);
campo "Cargo" removido do modal de convite de Consultor (valor sempre
fixo "Consultor", campo era redundante); headings da área do associado e
do editor de projetos que ainda usavam `font-serif` por engano corrigidos
para `font-sans` (reforça a regra do `CLAUDE.md` sobre vazamento de Lora
via `font-heading`); import e constante sem uso removidos do fluxo de
Meus Dados e Projetos.

## Editor: edição de imagem estilo Google Docs e presets de lista

Editor de projetos ganhou toolbar de imagem: alças de redimensionar nos 4
cantos, botão de excluir e menu de disposição de texto (Quebrar, Ajustar,
Atrás e Na frente do texto). Listas passaram a ter presets de marcador
(padrão, losango, quadrados, setas, estrela, seta circular), aplicados
tanto no editor quanto no artigo publicado via classes CSS compartilhadas
(mesmo raciocínio de fonte única de verdade do schema Tiptap).

Criação de projeto passou a validar título e tags (`schema.ts`) e a gerar
o slug a partir do título (`lib/slug.ts`), em vez de sempre criar como
"Sem título". Sidebar admin passou a destacar o subitem da rota atual e a
lembrar quais grupos ficam abertos/fechados entre navegações
(`localStorage`).

Outros ajustes do mesmo lote: limite de upload de Server Actions aumentado
para 20 MB (mídia de artigo); lista de tarefas deixou de herdar marcador
de bullet no artigo público; tamanho de botões padronizado; overflow/fundo
corrigidos em telas mais estreitas.

## Seção de publicação e páginas públicas das 5 seções de Notícias

Campo "Seção de publicação" adicionado ao editor de Ferramentas/Projetos
(coluna `section` em `projects`), permitindo direcionar cada artigo para
uma das 5 seções de Notícias. Novidades, Comunicados, Eventos e Programas
e Editais deixaram de ser placeholders e viraram listagens e páginas de
detalhe reais, filtradas por seção, no mesmo padrão já usado em Artigos.

## Autor nas páginas públicas, compartilhar in-place e tooltips no mapa

Checkbox `show_author` do editor de projetos passou a de fato controlar a
exibição de autoria: as 5 páginas públicas de detalhe de notícia/artigo
buscam `owner_id`/`show_author` e o nome do responsável (via
`createAdminClient()` e `startup_registrations`), exibindo "Por {nome}"
quando habilitado.

Item "Compartilhar" do menu de ações da listagem de projetos
(`/admin/ferramentas/projetos`) deixou de navegar até o editor do projeto
só para abrir o modal de compartilhamento (`router.push`) e passou a abrir
o mesmo `ShareDialog` in-place, direto na listagem, buscando os dados sob
demanda (`getProjectShareData`) só quando o modal é aberto.

Tooltips (`Tooltip`/`TooltipTrigger`/`TooltipContent`) adicionados aos
três botões de controle do mapa de negócios (aproximar, afastar, focar no
Brasil), substituindo o atributo `title` HTML nativo.
