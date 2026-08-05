"use server";

type IbgeMunicipio = {
  nome?: string;
};

export async function listMunicipiosByUf(uf: string): Promise<string[]> {
  const sigla = uf.trim().toUpperCase();

  if (sigla.length !== 2) {
    return [];
  }

  let response: Response;
  try {
    response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as IbgeMunicipio[];

  return payload
    .map((municipio) => municipio.nome?.trim())
    .filter((nome): nome is string => Boolean(nome))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}
