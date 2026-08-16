export const PROJECT_SECTIONS = [
  { value: "programas-e-editais", label: "Programas e Editais" },
  { value: "novidades", label: "Novidades" },
  { value: "eventos", label: "Eventos" },
  { value: "comunicados", label: "Comunicados" },
  { value: "artigos", label: "Artigos" },
] as const;

export type ProjectSection = (typeof PROJECT_SECTIONS)[number]["value"];

export const PROJECT_SECTION_VALUES = PROJECT_SECTIONS.map((section) => section.value) as [
  ProjectSection,
  ...ProjectSection[],
];
