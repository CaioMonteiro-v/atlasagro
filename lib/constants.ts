import type { TipoEventoPlantio, TipoEventoSanitario } from "./types";

export const TIPOS_EVENTO_PLANTIO: { value: TipoEventoPlantio; label: string }[] =
  [
    { value: "ADUBACAO", label: "Adubação" },
    { value: "DEFENSIVO", label: "Defensivo" },
    { value: "IRRIGACAO", label: "Irrigação" },
    { value: "COLHEITA", label: "Colheita" },
    { value: "OUTRO", label: "Outro" },
  ];

export const TIPOS_EVENTO_SANITARIO: {
  value: TipoEventoSanitario;
  label: string;
}[] = [
  { value: "VACINA", label: "Vacina" },
  { value: "VERMIFUGO", label: "Vermífugo" },
  { value: "TRATAMENTO", label: "Tratamento" },
  { value: "OUTRO", label: "Outro" },
];

const LABELS: Record<string, string> = {
  ADUBACAO: "Adubação",
  DEFENSIVO: "Defensivo",
  IRRIGACAO: "Irrigação",
  COLHEITA: "Colheita",
  VACINA: "Vacina",
  VERMIFUGO: "Vermífugo",
  TRATAMENTO: "Tratamento",
  OUTRO: "Outro",
};

export function labelTipo(tipo: string) {
  return LABELS[tipo] ?? tipo;
}

export const BADGE_STYLES: Record<string, string> = {
  ADUBACAO: "bg-emerald-100 text-emerald-800",
  DEFENSIVO: "bg-orange-100 text-orange-800",
  IRRIGACAO: "bg-sky-100 text-sky-800",
  COLHEITA: "bg-amber-100 text-amber-900",
  VACINA: "bg-teal-100 text-teal-800",
  VERMIFUGO: "bg-violet-100 text-violet-800",
  TRATAMENTO: "bg-rose-100 text-rose-800",
  OUTRO: "bg-stone-200 text-stone-700",
};

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
