export function renderConsultorInviteEmail({
  nome,
  actionLink,
}: {
  nome: string;
  actionLink: string;
}) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Convite para a Inova Cumaú</title>
</head>
<body style="margin:0; padding:0; background-color:#f7f7f7; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f7; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #d9d9d9;">
          <!-- header -->
          <tr>
            <td style="background-color:#495b4f; padding:28px 32px;">
              <span style="font-family:Georgia, 'Times New Roman', serif; font-size:20px; font-weight:700; color:#ffffff;">Inova Cumaú</span>
              <br>
              <span style="font-family:Arial, Helvetica, sans-serif; font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:#d4c0a0;">Ecossistema de startups &middot; Santana/AP</span>
            </td>
          </tr>
          <!-- corpo -->
          <tr>
            <td style="padding:36px 32px 8px;">
              <h1 style="margin:0 0 12px; font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-weight:600; color:#262626;">Você foi convidado como Consultor</h1>
              <p style="margin:0 0 20px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:#525252;">
                Olá, ${nome}. Você foi convidado para atuar como Consultor na plataforma da Inova Cumaú. Clique no botão abaixo para definir sua senha e acessar sua conta.
              </p>
            </td>
          </tr>
          <!-- botão -->
          <tr>
            <td style="padding:0 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8f7; border:1px solid #d2dbd5; border-radius:10px;">
                <tr>
                  <td align="center" style="padding:20px 16px;">
                    <a href="${actionLink}" style="display:inline-block; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; color:#ffffff; background-color:#495b4f; padding:12px 24px; border-radius:8px; text-decoration:none;">Definir senha e acessar</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- aviso de segurança -->
          <tr>
            <td style="padding:20px 32px 4px;">
              <p style="margin:0 0 12px; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:1.6; color:#696969;">
                Este link é pessoal e intransferível. Não compartilhe esse link com ninguém.
              </p>
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:1.6; color:#696969;">
                Se você não esperava este convite, ignore este e-mail. Nenhuma ação será tomada.
              </p>
            </td>
          </tr>
          <!-- rodapé -->
          <tr>
            <td style="padding:28px 32px 32px;">
              <hr style="border:none; border-top:1px solid #d9d9d9; margin:0 0 16px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:1.6; color:#8a8a8a;">
                E-mail automático da Inova Cumaú. Em caso de dúvidas, procure os canais de contato oficiais da associação.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
