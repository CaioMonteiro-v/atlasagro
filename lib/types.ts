export type Fazenda = {
  id: string;
  nome: string;
  municipio: string | null;
  uf: string | null;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
};

export type Talhao = {
  id: string;
  fazenda_id: string;
  nome: string;
  area_hectares: number | null;
  observacoes: string | null;
  created_at: string;
};

export type Plantio = {
  id: string;
  talhao_id: string;
  cultura: string;
  data_plantio: string;
  safra: string | null;
  observacoes: string | null;
  created_at: string;
};

export type TipoEventoPlantio =
  | "ADUBACAO"
  | "DEFENSIVO"
  | "IRRIGACAO"
  | "COLHEITA"
  | "OUTRO";

export type EventoPlantio = {
  id: string;
  plantio_id: string;
  tipo: TipoEventoPlantio;
  data: string;
  produto_usado: string | null;
  quantidade: string | null;
  observacoes: string | null;
  created_at: string;
};

export type Lote = {
  id: string;
  fazenda_id: string;
  nome: string;
  especie: string | null;
  quantidade_animais: number | null;
  observacoes: string | null;
  created_at: string;
};

export type TipoEventoSanitario = "VACINA" | "VERMIFUGO" | "TRATAMENTO" | "OUTRO";

export type EventoSanitario = {
  id: string;
  lote_id: string;
  tipo: TipoEventoSanitario;
  data: string;
  produto: string | null;
  dose: string | null;
  proxima_aplicacao: string | null;
  observacoes: string | null;
  created_at: string;
};

export type PlantioComTalhao = Plantio & {
  talhoes: Pick<Talhao, "id" | "nome"> | null;
};

export type EventoPlantioDetalhado = EventoPlantio & {
  plantios:
    | (Pick<Plantio, "id" | "cultura" | "talhao_id"> & {
        talhoes: Pick<Talhao, "id" | "nome"> | null;
      })
    | null;
};

export type EventoSanitarioDetalhado = EventoSanitario & {
  lotes: Pick<Lote, "id" | "nome" | "especie"> | null;
};

export type RelatorioLinha = {
  id: string;
  origem: "Plantio" | "Sanitário";
  data: string;
  tipo: string;
  tipo_codigo: string;
  local: string;
  detalhe: string;
  produto: string;
  quantidade: string;
  observacoes: string;
};

export type ActionState = {
  error: string | null;
  message?: string | null;
};
