export type PhoneCountry = {
  name: string;
  iso2: string;
  dialCode: string;
};

/**
 * Códigos de discagem (E.164) verificados em fontes públicas (ITU / CountryCode.org /
 * Worldometer). Cobre os ~195 países reconecidos pela ONU + Kosovo, Taiwan, Hong Kong,
 * Macau, Palestina e Vaticano. Brasil fica sempre em primeiro (país padrão).
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { name: "Brasil", iso2: "BR", dialCode: "+55" },

  // Lusofonia
  { name: "Portugal", iso2: "PT", dialCode: "+351" },
  { name: "Angola", iso2: "AO", dialCode: "+244" },
  { name: "Moçambique", iso2: "MZ", dialCode: "+258" },
  { name: "Cabo Verde", iso2: "CV", dialCode: "+238" },
  { name: "Guiné-Bissau", iso2: "GW", dialCode: "+245" },
  { name: "São Tomé e Príncipe", iso2: "ST", dialCode: "+239" },
  { name: "Timor-Leste", iso2: "TL", dialCode: "+670" },

  // América do Sul
  { name: "Argentina", iso2: "AR", dialCode: "+54" },
  { name: "Uruguai", iso2: "UY", dialCode: "+598" },
  { name: "Paraguai", iso2: "PY", dialCode: "+595" },
  { name: "Chile", iso2: "CL", dialCode: "+56" },
  { name: "Bolívia", iso2: "BO", dialCode: "+591" },
  { name: "Peru", iso2: "PE", dialCode: "+51" },
  { name: "Colômbia", iso2: "CO", dialCode: "+57" },
  { name: "Equador", iso2: "EC", dialCode: "+593" },
  { name: "Venezuela", iso2: "VE", dialCode: "+58" },
  { name: "Guiana", iso2: "GY", dialCode: "+592" },
  { name: "Suriname", iso2: "SR", dialCode: "+597" },

  // América do Norte e Central
  { name: "México", iso2: "MX", dialCode: "+52" },
  { name: "Estados Unidos", iso2: "US", dialCode: "+1" },
  { name: "Canadá", iso2: "CA", dialCode: "+1" },
  { name: "Guatemala", iso2: "GT", dialCode: "+502" },
  { name: "Belize", iso2: "BZ", dialCode: "+501" },
  { name: "El Salvador", iso2: "SV", dialCode: "+503" },
  { name: "Honduras", iso2: "HN", dialCode: "+504" },
  { name: "Nicarágua", iso2: "NI", dialCode: "+505" },
  { name: "Costa Rica", iso2: "CR", dialCode: "+506" },
  { name: "Panamá", iso2: "PA", dialCode: "+507" },
  { name: "Cuba", iso2: "CU", dialCode: "+53" },
  { name: "Haiti", iso2: "HT", dialCode: "+509" },
  { name: "República Dominicana", iso2: "DO", dialCode: "+1809" },
  { name: "Jamaica", iso2: "JM", dialCode: "+1876" },
  { name: "Bahamas", iso2: "BS", dialCode: "+1242" },
  { name: "Trinidad e Tobago", iso2: "TT", dialCode: "+1868" },
  { name: "Barbados", iso2: "BB", dialCode: "+1246" },
  { name: "Antígua e Barbuda", iso2: "AG", dialCode: "+1268" },
  { name: "Dominica", iso2: "DM", dialCode: "+1767" },
  { name: "Granada", iso2: "GD", dialCode: "+1473" },
  { name: "São Cristóvão e Névis", iso2: "KN", dialCode: "+1869" },
  { name: "Santa Lúcia", iso2: "LC", dialCode: "+1758" },
  { name: "São Vicente e Granadinas", iso2: "VC", dialCode: "+1784" },

  // Europa
  { name: "Espanha", iso2: "ES", dialCode: "+34" },
  { name: "França", iso2: "FR", dialCode: "+33" },
  { name: "Alemanha", iso2: "DE", dialCode: "+49" },
  { name: "Itália", iso2: "IT", dialCode: "+39" },
  { name: "Reino Unido", iso2: "GB", dialCode: "+44" },
  { name: "Irlanda", iso2: "IE", dialCode: "+353" },
  { name: "Países Baixos", iso2: "NL", dialCode: "+31" },
  { name: "Bélgica", iso2: "BE", dialCode: "+32" },
  { name: "Luxemburgo", iso2: "LU", dialCode: "+352" },
  { name: "Suíça", iso2: "CH", dialCode: "+41" },
  { name: "Áustria", iso2: "AT", dialCode: "+43" },
  { name: "Liechtenstein", iso2: "LI", dialCode: "+423" },
  { name: "Dinamarca", iso2: "DK", dialCode: "+45" },
  { name: "Noruega", iso2: "NO", dialCode: "+47" },
  { name: "Suécia", iso2: "SE", dialCode: "+46" },
  { name: "Finlândia", iso2: "FI", dialCode: "+358" },
  { name: "Islândia", iso2: "IS", dialCode: "+354" },
  { name: "Polônia", iso2: "PL", dialCode: "+48" },
  { name: "República Checa", iso2: "CZ", dialCode: "+420" },
  { name: "Eslováquia", iso2: "SK", dialCode: "+421" },
  { name: "Hungria", iso2: "HU", dialCode: "+36" },
  { name: "Eslovênia", iso2: "SI", dialCode: "+386" },
  { name: "Croácia", iso2: "HR", dialCode: "+385" },
  { name: "Bósnia e Herzegovina", iso2: "BA", dialCode: "+387" },
  { name: "Sérvia", iso2: "RS", dialCode: "+381" },
  { name: "Montenegro", iso2: "ME", dialCode: "+382" },
  { name: "Macedônia do Norte", iso2: "MK", dialCode: "+389" },
  { name: "Kosovo", iso2: "XK", dialCode: "+383" },
  { name: "Albânia", iso2: "AL", dialCode: "+355" },
  { name: "Grécia", iso2: "GR", dialCode: "+30" },
  { name: "Bulgária", iso2: "BG", dialCode: "+359" },
  { name: "Romênia", iso2: "RO", dialCode: "+40" },
  { name: "Moldávia", iso2: "MD", dialCode: "+373" },
  { name: "Ucrânia", iso2: "UA", dialCode: "+380" },
  { name: "Bielorrússia", iso2: "BY", dialCode: "+375" },
  { name: "Rússia", iso2: "RU", dialCode: "+7" },
  { name: "Estônia", iso2: "EE", dialCode: "+372" },
  { name: "Letônia", iso2: "LV", dialCode: "+371" },
  { name: "Lituânia", iso2: "LT", dialCode: "+370" },
  { name: "Andorra", iso2: "AD", dialCode: "+376" },
  { name: "Mônaco", iso2: "MC", dialCode: "+377" },
  { name: "San Marino", iso2: "SM", dialCode: "+378" },
  { name: "Vaticano", iso2: "VA", dialCode: "+379" },
  { name: "Malta", iso2: "MT", dialCode: "+356" },
  { name: "Chipre", iso2: "CY", dialCode: "+357" },

  // Ásia
  { name: "China", iso2: "CN", dialCode: "+86" },
  { name: "Japão", iso2: "JP", dialCode: "+81" },
  { name: "Coreia do Sul", iso2: "KR", dialCode: "+82" },
  { name: "Coreia do Norte", iso2: "KP", dialCode: "+850" },
  { name: "Índia", iso2: "IN", dialCode: "+91" },
  { name: "Paquistão", iso2: "PK", dialCode: "+92" },
  { name: "Bangladesh", iso2: "BD", dialCode: "+880" },
  { name: "Sri Lanka", iso2: "LK", dialCode: "+94" },
  { name: "Nepal", iso2: "NP", dialCode: "+977" },
  { name: "Butão", iso2: "BT", dialCode: "+975" },
  { name: "Maldivas", iso2: "MV", dialCode: "+960" },
  { name: "Afeganistão", iso2: "AF", dialCode: "+93" },
  { name: "Indonésia", iso2: "ID", dialCode: "+62" },
  { name: "Malásia", iso2: "MY", dialCode: "+60" },
  { name: "Singapura", iso2: "SG", dialCode: "+65" },
  { name: "Filipinas", iso2: "PH", dialCode: "+63" },
  { name: "Tailândia", iso2: "TH", dialCode: "+66" },
  { name: "Vietnã", iso2: "VN", dialCode: "+84" },
  { name: "Camboja", iso2: "KH", dialCode: "+855" },
  { name: "Laos", iso2: "LA", dialCode: "+856" },
  { name: "Myanmar", iso2: "MM", dialCode: "+95" },
  { name: "Brunei", iso2: "BN", dialCode: "+673" },
  { name: "Hong Kong", iso2: "HK", dialCode: "+852" },
  { name: "Macau", iso2: "MO", dialCode: "+853" },
  { name: "Taiwan", iso2: "TW", dialCode: "+886" },
  { name: "Mongólia", iso2: "MN", dialCode: "+976" },
  { name: "Cazaquistão", iso2: "KZ", dialCode: "+7" },
  { name: "Uzbequistão", iso2: "UZ", dialCode: "+998" },
  { name: "Turcomenistão", iso2: "TM", dialCode: "+993" },
  { name: "Quirguistão", iso2: "KG", dialCode: "+996" },
  { name: "Tadjiquistão", iso2: "TJ", dialCode: "+992" },
  { name: "Armênia", iso2: "AM", dialCode: "+374" },
  { name: "Azerbaijão", iso2: "AZ", dialCode: "+994" },
  { name: "Geórgia", iso2: "GE", dialCode: "+995" },
  { name: "Turquia", iso2: "TR", dialCode: "+90" },
  { name: "Israel", iso2: "IL", dialCode: "+972" },
  { name: "Palestina", iso2: "PS", dialCode: "+970" },
  { name: "Líbano", iso2: "LB", dialCode: "+961" },
  { name: "Jordânia", iso2: "JO", dialCode: "+962" },
  { name: "Síria", iso2: "SY", dialCode: "+963" },
  { name: "Iraque", iso2: "IQ", dialCode: "+964" },
  { name: "Irã", iso2: "IR", dialCode: "+98" },
  { name: "Arábia Saudita", iso2: "SA", dialCode: "+966" },
  { name: "Iêmen", iso2: "YE", dialCode: "+967" },
  { name: "Omã", iso2: "OM", dialCode: "+968" },
  { name: "Emirados Árabes Unidos", iso2: "AE", dialCode: "+971" },
  { name: "Catar", iso2: "QA", dialCode: "+974" },
  { name: "Bahrein", iso2: "BH", dialCode: "+973" },
  { name: "Kuwait", iso2: "KW", dialCode: "+965" },

  // Oceania
  { name: "Austrália", iso2: "AU", dialCode: "+61" },
  { name: "Nova Zelândia", iso2: "NZ", dialCode: "+64" },
  { name: "Papua-Nova Guiné", iso2: "PG", dialCode: "+675" },
  { name: "Fiji", iso2: "FJ", dialCode: "+679" },
  { name: "Ilhas Salomão", iso2: "SB", dialCode: "+677" },
  { name: "Vanuatu", iso2: "VU", dialCode: "+678" },
  { name: "Samoa", iso2: "WS", dialCode: "+685" },
  { name: "Tonga", iso2: "TO", dialCode: "+676" },
  { name: "Kiribati", iso2: "KI", dialCode: "+686" },
  { name: "Tuvalu", iso2: "TV", dialCode: "+688" },
  { name: "Nauru", iso2: "NR", dialCode: "+674" },
  { name: "Palau", iso2: "PW", dialCode: "+680" },
  { name: "Micronésia", iso2: "FM", dialCode: "+691" },
  { name: "Ilhas Marshall", iso2: "MH", dialCode: "+692" },

  // África
  { name: "África do Sul", iso2: "ZA", dialCode: "+27" },
  { name: "Egito", iso2: "EG", dialCode: "+20" },
  { name: "Marrocos", iso2: "MA", dialCode: "+212" },
  { name: "Argélia", iso2: "DZ", dialCode: "+213" },
  { name: "Tunísia", iso2: "TN", dialCode: "+216" },
  { name: "Líbia", iso2: "LY", dialCode: "+218" },
  { name: "Nigéria", iso2: "NG", dialCode: "+234" },
  { name: "Gana", iso2: "GH", dialCode: "+233" },
  { name: "Costa do Marfim", iso2: "CI", dialCode: "+225" },
  { name: "Senegal", iso2: "SN", dialCode: "+221" },
  { name: "Mali", iso2: "ML", dialCode: "+223" },
  { name: "Burkina Faso", iso2: "BF", dialCode: "+226" },
  { name: "Níger", iso2: "NE", dialCode: "+227" },
  { name: "Togo", iso2: "TG", dialCode: "+228" },
  { name: "Benin", iso2: "BJ", dialCode: "+229" },
  { name: "Gâmbia", iso2: "GM", dialCode: "+220" },
  { name: "Guiné", iso2: "GN", dialCode: "+224" },
  { name: "Serra Leoa", iso2: "SL", dialCode: "+232" },
  { name: "Libéria", iso2: "LR", dialCode: "+231" },
  { name: "Mauritânia", iso2: "MR", dialCode: "+222" },
  { name: "Camarões", iso2: "CM", dialCode: "+237" },
  { name: "Chade", iso2: "TD", dialCode: "+235" },
  { name: "República Centro-Africana", iso2: "CF", dialCode: "+236" },
  { name: "Gabão", iso2: "GA", dialCode: "+241" },
  { name: "Congo", iso2: "CG", dialCode: "+242" },
  { name: "República Democrática do Congo", iso2: "CD", dialCode: "+243" },
  { name: "Guiné Equatorial", iso2: "GQ", dialCode: "+240" },
  { name: "Quênia", iso2: "KE", dialCode: "+254" },
  { name: "Tanzânia", iso2: "TZ", dialCode: "+255" },
  { name: "Uganda", iso2: "UG", dialCode: "+256" },
  { name: "Ruanda", iso2: "RW", dialCode: "+250" },
  { name: "Burundi", iso2: "BI", dialCode: "+257" },
  { name: "Etiópia", iso2: "ET", dialCode: "+251" },
  { name: "Eritreia", iso2: "ER", dialCode: "+291" },
  { name: "Djibuti", iso2: "DJ", dialCode: "+253" },
  { name: "Somália", iso2: "SO", dialCode: "+252" },
  { name: "Sudão", iso2: "SD", dialCode: "+249" },
  { name: "Sudão do Sul", iso2: "SS", dialCode: "+211" },
  { name: "Zâmbia", iso2: "ZM", dialCode: "+260" },
  { name: "Zimbábue", iso2: "ZW", dialCode: "+263" },
  { name: "Malawi", iso2: "MW", dialCode: "+265" },
  { name: "Namíbia", iso2: "NA", dialCode: "+264" },
  { name: "Botsuana", iso2: "BW", dialCode: "+267" },
  { name: "Essuatíni", iso2: "SZ", dialCode: "+268" },
  { name: "Lesoto", iso2: "LS", dialCode: "+266" },
  { name: "Madagascar", iso2: "MG", dialCode: "+261" },
  { name: "Maurícia", iso2: "MU", dialCode: "+230" },
  { name: "Seicheles", iso2: "SC", dialCode: "+248" },
  { name: "Comores", iso2: "KM", dialCode: "+269" },
];

export const DEFAULT_PHONE_COUNTRY: PhoneCountry = PHONE_COUNTRIES[0]!;

export function findPhoneCountry(iso2: string): PhoneCountry {
  return PHONE_COUNTRIES.find((country) => country.iso2 === iso2) ?? DEFAULT_PHONE_COUNTRY;
}

/** Converte um código ISO 3166-1 alpha-2 (ex.: "BR") no emoji de bandeira correspondente. */
export function getFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/** Divide um valor já salvo (ex.: "+55 (96) 90000-0000") em país + número local. */
export function parsePhoneValue(raw: string): { country: PhoneCountry; number: string } {
  const match = raw.match(/^\+(\d+)\s*(.*)$/);
  if (!match) {
    return { country: DEFAULT_PHONE_COUNTRY, number: raw };
  }

  const digits = match[1] ?? "";
  const rest = match[2] ?? "";
  const country =
    PHONE_COUNTRIES.find((candidate) => candidate.dialCode === `+${digits}`) ??
    DEFAULT_PHONE_COUNTRY;

  return { country, number: rest };
}
