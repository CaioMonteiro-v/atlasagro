import { ExportCsvButton } from "@/components/relatorios/export-csv-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TipoBadge } from "@/components/ui/tipo-badge";
import { TIPOS_EVENTO_PLANTIO, TIPOS_EVENTO_SANITARIO, labelTipo } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  EventoPlantioDetalhado,
  EventoSanitarioDetalhado,
  Lote,
  RelatorioLinha,
  Talhao,
} from "@/lib/types";
import { formatDate, castRows, relOne } from "@/lib/utils";

type Search = {
  origem?: string;
  inicio?: string;
  fim?: string;
  talhao_id?: string;
  lote_id?: string;
  tipo?: string;
};

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const supabase = createClient();
  const origem = searchParams.origem || "todos";
  const inicio = searchParams.inicio || "";
  const fim = searchParams.fim || "";
  const talhaoId = searchParams.talhao_id || "";
  const loteId = searchParams.lote_id || "";
  const tipo = searchParams.tipo || "";

  const [{ data: talhoesData }, { data: lotesData }] = await Promise.all([
    supabase.from("talhoes").select("id, nome").order("nome"),
    supabase.from("lotes").select("id, nome").order("nome"),
  ]);
  const talhoes = castRows<Pick<Talhao, "id" | "nome">>(talhoesData);
  const lotes = castRows<Pick<Lote, "id" | "nome">>(lotesData);

  const linhas: RelatorioLinha[] = [];
  const tipoPlantio = TIPOS_EVENTO_PLANTIO.some((item) => item.value === tipo);
  const tipoSanitario = TIPOS_EVENTO_SANITARIO.some((item) => item.value === tipo);
  const incluirPlantio =
    (origem === "todos" || origem === "plantio") &&
    !loteId &&
    (!tipo || tipoPlantio);
  const incluirSanitario =
    (origem === "todos" || origem === "sanitario") &&
    !talhaoId &&
    (!tipo || tipoSanitario);

  if (incluirPlantio) {
    let query = supabase
      .from("eventos_plantio")
      .select("id, tipo, data, produto_usado, quantidade, observacoes, plantios(cultura, talhao_id, talhoes(id, nome))")
      .order("data", { ascending: false });

    if (inicio) query = query.gte("data", inicio);
    if (fim) query = query.lte("data", fim);
    if (tipo && tipoPlantio) query = query.eq("tipo", tipo);

    const { data } = await query;
    const eventos = castRows<EventoPlantioDetalhado>(data);
    for (const evento of eventos) {
      const plantio = relOne(evento.plantios);
      const talhao = relOne(plantio?.talhoes);
      if (talhaoId && talhao?.id !== talhaoId) continue;
      linhas.push({
        id: `p-${evento.id}`,
        origem: "Plantio",
        data: evento.data,
        tipo: labelTipo(evento.tipo),
        tipo_codigo: evento.tipo,
        local: talhao?.nome ?? "Talhão",
        detalhe: plantio?.cultura ?? "",
        produto: evento.produto_usado ?? "",
        quantidade: evento.quantidade ?? "",
        observacoes: evento.observacoes ?? "",
      });
    }
  }

  if (incluirSanitario) {
    let query = supabase
      .from("eventos_sanitarios")
      .select("id, tipo, data, produto, dose, observacoes, lote_id, lotes(id, nome, especie)")
      .order("data", { ascending: false });

    if (inicio) query = query.gte("data", inicio);
    if (fim) query = query.lte("data", fim);
    if (loteId) query = query.eq("lote_id", loteId);
    if (tipo && tipoSanitario) query = query.eq("tipo", tipo);

    const { data } = await query;
    const eventos = castRows<EventoSanitarioDetalhado>(data);
    for (const evento of eventos) {
      const lote = relOne(evento.lotes);
      linhas.push({
        id: `s-${evento.id}`,
        origem: "Sanitário",
        data: evento.data,
        tipo: labelTipo(evento.tipo),
        tipo_codigo: evento.tipo,
        local: lote?.nome ?? "Lote",
        detalhe: lote?.especie ?? "",
        produto: evento.produto ?? "",
        quantidade: evento.dose ?? "",
        observacoes: evento.observacoes ?? "",
      });
    }
  }

  linhas.sort((a, b) => b.data.localeCompare(a.data));

  const csvRows = linhas.map((linha) => ({
    Data: formatDate(linha.data),
    Origem: linha.origem,
    Tipo: linha.tipo,
    Local: linha.local,
    Detalhe: linha.detalhe,
    Produto: linha.produto,
    "Quantidade/Dose": linha.quantidade,
    Observações: linha.observacoes,
  }));

  const tiposFiltro =
    origem === "plantio"
      ? TIPOS_EVENTO_PLANTIO
      : origem === "sanitario"
        ? TIPOS_EVENTO_SANITARIO
        : [
            ...TIPOS_EVENTO_PLANTIO,
            ...TIPOS_EVENTO_SANITARIO.filter((item) => item.value !== "OUTRO"),
          ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Filtre por período, talhão, lote ou tipo de evento e exporte o resultado."
        actions={
          <ExportCsvButton rows={csvRows} filename="relatorio-atlasagro.csv" />
        }
      />

      <form className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3" method="get">
        <div>
          <label className="label" htmlFor="origem">
            Origem
          </label>
          <select id="origem" name="origem" defaultValue={origem} className="input">
            <option value="todos">Plantio e sanitário</option>
            <option value="plantio">Somente plantio</option>
            <option value="sanitario">Somente sanitário</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="inicio">
            Data inicial
          </label>
          <input id="inicio" name="inicio" type="date" defaultValue={inicio} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="fim">
            Data final
          </label>
          <input id="fim" name="fim" type="date" defaultValue={fim} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="talhao_id">
            Talhão
          </label>
          <select id="talhao_id" name="talhao_id" defaultValue={talhaoId} className="input">
            <option value="">Todos</option>
            {talhoes.map((talhao) => (
              <option key={talhao.id} value={talhao.id}>
                {talhao.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="lote_id">
            Lote
          </label>
          <select id="lote_id" name="lote_id" defaultValue={loteId} className="input">
            <option value="">Todos</option>
            {lotes.map((lote) => (
              <option key={lote.id} value={lote.id}>
                {lote.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="tipo">
            Tipo de evento
          </label>
          <select id="tipo" name="tipo" defaultValue={tipo} className="input">
            <option value="">Todos</option>
            {tiposFiltro.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
          <button type="submit" className="btn-primary">
            Filtrar
          </button>
          <a href="/relatorios" className="btn-secondary">
            Limpar
          </a>
        </div>
      </form>

      {linhas.length === 0 ? (
        <EmptyState
          title="Nenhum evento encontrado"
          description="Ajuste os filtros ou cadastre eventos nos talhões e lotes."
        />
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Origem</th>
                <th>Tipo</th>
                <th>Local</th>
                <th>Detalhe</th>
                <th>Produto</th>
                <th>Qtd / dose</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr key={linha.id}>
                  <td>{formatDate(linha.data)}</td>
                  <td>{linha.origem}</td>
                  <td>
                    <TipoBadge tipo={linha.tipo_codigo} />
                  </td>
                  <td>{linha.local}</td>
                  <td>{linha.detalhe || "—"}</td>
                  <td>{linha.produto || "—"}</td>
                  <td>{linha.quantidade || "—"}</td>
                  <td className="max-w-xs truncate">{linha.observacoes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
