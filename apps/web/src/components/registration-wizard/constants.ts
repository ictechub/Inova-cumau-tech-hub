import {
  IconBuildingSkyscraper,
  IconLock,
  IconMailCheck,
  IconShieldCheck,
  IconTags,
  IconUser,
} from "@tabler/icons-react";

type Icon = typeof IconUser;

export type StepKey =
  | "responsavel"
  | "empreendimento"
  | "segmentacao"
  | "termos"
  | "credenciais"
  | "confirmacao";

export type StepMeta = {
  key: StepKey;
  title: string;
  description: string;
  icon: Icon;
};

export const STEPS: StepMeta[] = [
  {
    key: "responsavel",
    title: "Dados pessoais",
    description: "Quem é o responsável pelo cadastro.",
    icon: IconUser,
  },
  {
    key: "empreendimento",
    title: "Negócio",
    description: "Dados da startup ou negócio.",
    icon: IconBuildingSkyscraper,
  },
  {
    key: "segmentacao",
    title: "Segmentação",
    description: "Área de atuação do negócio.",
    icon: IconTags,
  },
  {
    key: "termos",
    title: "Termos",
    description: "Políticas e aceite de uso.",
    icon: IconShieldCheck,
  },
  {
    key: "credenciais",
    title: "Criar conta",
    description: "E-mail e senha de acesso à sua conta.",
    icon: IconLock,
  },
  {
    key: "confirmacao",
    title: "Confirmar e-mail",
    description: "Confirme o código enviado por e-mail.",
    icon: IconMailCheck,
  },
];

export const BUSINESS_PHASES = [
  {
    value: "ideacao",
    label: "Ideação",
    objetivo: "Entender o problema e validar a hipótese de mercado.",
    oQueAcontece:
      "Fundadores mapeiam uma dor relevante, analisam concorrentes e definem o público-alvo, conversam com potenciais clientes para validar se o problema é real.",
    metricaChave: "Número de entrevistas e validações de dor.",
  },
  {
    value: "validacao",
    label: "Validação / Pré-Seed",
    objetivo: "Construir a solução mínima e provar que as pessoas pagariam por ela.",
    oQueAcontece:
      "Lançamento do MVP, testes com early adopters, ajuste via feedback rápido.",
    metricaChave: "Engajamento dos primeiros usuários e feedback loop.",
  },
  {
    value: "tracao",
    label: "Tração / Seed",
    objetivo: "Atingir o PMF (product-market fit) e provar a eficiência das vendas.",
    oQueAcontece:
      "Produto resolve bem o problema de um nicho, busca de modelo de receita previsível/sustentável, atenção a métricas unitárias.",
    metricaChave: "CAC, LTV, Churn e Retenção.",
  },
  {
    value: "escala",
    label: "Escala / Growth",
    objetivo: "Crescer aceleradamente e dominar o mercado.",
    oQueAcontece:
      "PMF comprovado, investimento robusto, expansão de equipe/marketing/vendas/internacionalização.",
    metricaChave: "Crescimento de receita (MoM/YoY), MRR/ARR.",
  },
  {
    value: "saida",
    label: "Mapeamento de Saída / Maturidade",
    objetivo: "Retorno financeiro para investidores e fundadores.",
    oQueAcontece:
      "Consolidação como grande empresa tech/corporação; saída via M&A ou IPO.",
    metricaChave: "Valuation e opções de saída (M&A/IPO).",
  },
] as const;

export const TECH_SEGMENTS = [
  { value: "adtech", label: "Adtech" },
  { value: "agrotech", label: "Agrotech" },
  { value: "biotech", label: "Biotech" },
  { value: "construtech", label: "Construtech" },
  { value: "cybertech", label: "Cybertech" },
  { value: "deeptech", label: "Deeptech" },
  { value: "edtech", label: "Edtech" },
  { value: "femtech", label: "Femtech" },
  { value: "fintech", label: "Fintech" },
  { value: "foodtech", label: "Foodtech" },
  { value: "govtech", label: "Govtech" },
  { value: "greentech", label: "Greentech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "hrtech", label: "HRtech" },
  { value: "insurtech", label: "Insurtech" },
  { value: "legaltech", label: "Legaltech" },
  { value: "logtech", label: "Logtech" },
  { value: "martech", label: "Martech" },
  { value: "mobilitytech", label: "Mobilitytech" },
  { value: "proptech", label: "Proptech" },
  { value: "retailtech", label: "Retailtech" },
  { value: "sportech", label: "Sportech" },
  { value: "traveltech", label: "Traveltech" },
  { value: "outra", label: "Outra" },
] as const;

export const BRAZIL_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;

export const OBJETIVOS_FILIACAO = [
  { value: "mentorias", label: "Acesso a mentorias" },
  { value: "networking", label: "Networking" },
  { value: "capacitacao", label: "Capacitação e cursos" },
  { value: "editais_fomento", label: "Acesso a editais e fomento" },
  { value: "financiamento", label: "Financiamento" },
  { value: "investimentos", label: "Investimentos" },
  { value: "leis_tributacoes", label: "Leis e tributações atraentes" },
  { value: "coworking", label: "Espaço de coworking" },
  { value: "certificacoes", label: "Certificações e selos do setor" },
  { value: "visibilidade", label: "Visibilidade e divulgação da marca" },
  { value: "parcerias_comerciais", label: "Parcerias comerciais" },
  { value: "internacionalizacao", label: "Internacionalização" },
  { value: "laboratorios_pd", label: "Acesso a laboratórios e infraestrutura de P&D" },
  { value: "outros", label: "Outros" },
] as const;
