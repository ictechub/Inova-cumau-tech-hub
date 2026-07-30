export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export const TERMS_OF_USE: LegalSection[] = [
  {
    title: "1. Aceitação dos termos",
    paragraphs: [
      'Ao utilizar o site da Inova Cumaú e, em especial, ao concluir o cadastro de associação disponível em "Associe-se", você declara que leu, compreendeu e concorda com estes Termos de Uso e com a Política de Privacidade. Caso não concorde com qualquer disposição, recomendamos não utilizar os serviços oferecidos nesta plataforma.',
    ],
  },
  {
    title: "2. Sobre a Inova Cumaú",
    paragraphs: [
      "A Inova Cumaú é uma associação que reúne startups de tecnologia e bioeconomia sediadas em Santana, no Amapá, com o objetivo de fortalecer o ecossistema local de inovação. Este site funciona como o principal canal de comunicação da associação com startups associadas, parceiros e o público em geral, reunindo informações institucionais, notícias, conteúdos de mídia e, futuramente, uma área logada destinada a associados.",
    ],
  },
  {
    title: "3. Cadastro de associação",
    paragraphs: [
      "O cadastro de startups é feito por meio do formulário de associação, no qual o responsável pela inscrição informa dados pessoais e do negócio (como nome, CNPJ, endereço, contatos e segmento de atuação) e cria uma conta de acesso com e-mail e senha.",
      "Ao se cadastrar, você se compromete a fornecer informações verdadeiras, completas e atualizadas; manter a confidencialidade da senha de acesso e responder por toda atividade realizada com sua conta; e comunicar à Inova Cumaú qualquer uso não autorizado da conta assim que tiver conhecimento.",
      "O cadastro está sujeito a análise e não garante, por si só, a admissão da startup como associada — critérios de elegibilidade podem ser definidos pela diretoria da associação.",
    ],
  },
  {
    title: "4. Uso da plataforma",
    paragraphs: [
      "Você concorda em utilizar o site e a futura área logada apenas para finalidades lícitas e compatíveis com os objetivos da Inova Cumaú, não sendo permitido violar leis ou direitos de terceiros, tentar acessar áreas restritas sem autorização ou comprometer a segurança da plataforma, utilizar dados de outros associados obtidos pela plataforma para fins diversos dos previstos, ou publicar conteúdo ofensivo, enganoso ou que infrinja direitos autorais.",
    ],
  },
  {
    title: "5. Propriedade intelectual",
    paragraphs: [
      "A marca Inova Cumaú, sua identidade visual, textos, imagens e demais conteúdos publicados neste site são de titularidade da associação ou de terceiros que autorizaram sua utilização, sendo protegidos pela legislação de propriedade intelectual. É vedada a reprodução, distribuição ou uso comercial desses conteúdos sem autorização prévia.",
    ],
  },
  {
    title: "6. Disponibilidade e alterações do serviço",
    paragraphs: [
      "A Inova Cumaú busca manter o site disponível e em pleno funcionamento, mas não garante disponibilidade ininterrupta — o serviço pode ser temporariamente suspenso para manutenção, atualizações ou por motivos fora de seu controle. Novas funcionalidades, como a área logada de associados e o marketplace, poderão ser adicionadas, alteradas ou descontinuadas a qualquer momento.",
    ],
  },
  {
    title: "7. Encerramento de conta",
    paragraphs: [
      "O associado pode solicitar o encerramento de sua conta e a exclusão de seus dados a qualquer momento, pelos canais de contato oficiais da Inova Cumaú. A associação também pode suspender ou encerrar o acesso de um usuário em caso de descumprimento destes Termos ou do estatuto/regimento interno da associação.",
    ],
  },
  {
    title: "8. Limitação de responsabilidade",
    paragraphs: [
      'O site e seus conteúdos são fornecidos "como estão". A Inova Cumaú não se responsabiliza por decisões de negócio tomadas com base em conteúdos informativos do site, nem por eventuais indisponibilidades, erros ou interrupções decorrentes de fatores fora de seu controle razoável.',
    ],
  },
  {
    title: "9. Alterações destes termos",
    paragraphs: [
      "Estes Termos podem ser atualizados periodicamente para refletir mudanças na plataforma, na legislação ou nas práticas da associação. A versão vigente estará sempre disponível nesta página, e o uso continuado do site após uma atualização representa concordância com os novos termos.",
    ],
  },
  {
    title: "10. Legislação aplicável",
    paragraphs: [
      "Estes Termos são regidos pela legislação brasileira, ficando eleito o foro da comarca de Santana/AP para dirimir eventuais controvérsias, salvo disposição legal em contrário.",
    ],
  },
];

export const PRIVACY_POLICY: LegalSection[] = [
  {
    title: "1. Sobre esta política",
    paragraphs: [
      "Esta Política de Privacidade descreve como a Inova Cumaú coleta, usa, armazena e protege os dados pessoais tratados por meio deste site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Ao utilizar o site e enviar seus dados, você concorda com as práticas aqui descritas.",
    ],
  },
  {
    title: "2. Quem é o controlador dos dados",
    paragraphs: [
      "A Inova Cumaú, associação de startups de tecnologia e bioeconomia de Santana/AP, é a controladora dos dados pessoais tratados por meio deste site. Dúvidas ou solicitações relacionadas a dados pessoais podem ser enviadas pelos canais de contato oficiais informados no rodapé deste site.",
    ],
  },
  {
    title: "3. Quais dados coletamos",
    paragraphs: [
      "Coletamos os dados que você fornece diretamente: dados de cadastro de associação (nome do responsável, e-mail, telefone/WhatsApp, cargo, e dados da startup como nome, CNPJ, endereço, cidade, segmento de atuação e redes sociais); dados de acesso (e-mail e senha, para autenticação na área logada); e o e-mail informado na assinatura da newsletter.",
      "Também podemos coletar dados básicos de navegação, quando aplicável, para fins de segurança e melhoria do site.",
    ],
  },
  {
    title: "4. Para que usamos os dados",
    paragraphs: [
      "Utilizamos os dados pessoais coletados para analisar e processar pedidos de associação à Inova Cumaú; criar e gerenciar contas de acesso à área logada; entrar em contato com associados e responsáveis sobre assuntos da associação; enviar comunicados e newsletters a quem se inscreveu voluntariamente; e cumprir obrigações legais e regulatórias aplicáveis à associação.",
    ],
  },
  {
    title: "5. Com quem compartilhamos os dados",
    paragraphs: [
      "Não vendemos nem alugamos dados pessoais a terceiros. Os dados podem ser tratados por prestadores de serviço de infraestrutura tecnológica (como provedores de hospedagem e banco de dados) estritamente para viabilizar o funcionamento do site, sempre sob obrigações de confidencialidade e segurança, ou compartilhados quando exigido por lei ou ordem judicial.",
    ],
  },
  {
    title: "6. Como protegemos os seus dados",
    paragraphs: [
      "Adotamos medidas técnicas e organizacionais para proteger os dados pessoais contra acesso não autorizado, perda ou alteração indevida, como autenticação e regras de permissão que restringem cada usuário aos seus próprios dados de cadastro. Apesar dos esforços, nenhum sistema é totalmente livre de riscos, e trabalhamos continuamente para aprimorar nossas práticas de segurança.",
    ],
  },
  {
    title: "7. Por quanto tempo guardamos os dados",
    paragraphs: [
      "Os dados pessoais são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta Política, para atender obrigações legais/regulatórias ou enquanto durar o vínculo associativo, podendo ser excluídos ou anonimizados após esse período ou mediante solicitação do titular, observadas eventuais obrigações legais de retenção.",
    ],
  },
  {
    title: "8. Seus direitos como titular de dados",
    paragraphs: [
      "Nos termos da LGPD, você tem direito a confirmar a existência de tratamento de seus dados; acessar, corrigir ou atualizar seus dados; solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei; solicitar a portabilidade dos dados; revogar o consentimento dado e solicitar a exclusão de dados tratados com base nele; e obter informações sobre o compartilhamento de seus dados.",
      "Esses direitos podem ser exercidos pelos canais de contato oficiais da Inova Cumaú informados no rodapé deste site.",
    ],
  },
  {
    title: "9. Cookies",
    paragraphs: [
      "O site pode utilizar cookies e tecnologias semelhantes para viabilizar funcionalidades básicas de navegação e, futuramente, para fins de análise de audiência. Você pode gerenciar o uso de cookies diretamente nas configurações do seu navegador.",
    ],
  },
  {
    title: "10. Alterações desta política",
    paragraphs: [
      "Esta Política pode ser atualizada periodicamente para refletir mudanças em nossas práticas, na plataforma ou na legislação aplicável. Recomendamos revisitar esta página periodicamente; alterações relevantes serão comunicadas pelos canais oficiais da associação.",
    ],
  },
];
