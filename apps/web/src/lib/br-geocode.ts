import municipios from "@/data/br-municipios.json";

interface MunicipioRecord {
  uf: string;
  nome: string;
  lat: number;
  lng: number;
}

const DATA = municipios as MunicipioRecord[];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

const byUfCity = new Map<string, [number, number]>();
const byCityOnly = new Map<string, [number, number][]>();

for (const m of DATA) {
  const cityKey = normalize(m.nome);
  byUfCity.set(`${m.uf}|${cityKey}`, [m.lng, m.lat]);

  const candidates = byCityOnly.get(cityKey) ?? [];
  candidates.push([m.lng, m.lat]);
  byCityOnly.set(cityKey, candidates);
}

// Geocodifica cidade+UF de texto livre (contato_cidade/contato_estado) para
// [lng, lat] usando o dataset kelvins/municipios-brasileiros. Retorna null
// quando não há correspondência confiável; nunca inventa coordenadas.
export function geocodeCidade(
  cidade: string,
  uf: string | null,
): [number, number] | null {
  const cityKey = normalize(cidade);

  if (uf) {
    const hit = byUfCity.get(`${uf.trim().toUpperCase()}|${cityKey}`);
    if (hit) return hit;
  }

  // Sem UF (ou UF não bateu): só aceita se o nome da cidade for único no país.
  const candidates = byCityOnly.get(cityKey);
  if (candidates && candidates.length === 1) return candidates[0] ?? null;

  return null;
}
