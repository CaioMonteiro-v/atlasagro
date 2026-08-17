import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEventoPlantio } from "@/app/actions/eventos-plantio";
import { deletePlantio } from "@/app/actions/plantios";
import { EventoPlantioForm } from "@/components/forms/evento-plantio-form";
import { PlantioForm } from "@/components/forms/plantio-form";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TipoBadge } from "@/components/ui/tipo-badge";
import { createClient } from "@/lib/supabase/server";
import type { EventoPlantio, Plantio, Talhao } from "@/lib/types";
import { formatDate, castRows, relOne } from "@/lib/utils";
import { requireFazendaId } from "@/lib/fazenda";

export default async function PlantioDetalhePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { editar?: string };
}) {
  const fazendaId = await requireFazendaId();
  const supabase = createClient();
  const { data: plantioData } = await supabase
    .from("plantios")
    .select("*, talhoes!inner(id, nome, fazenda_id)")
    .eq("id", params.id)
    .eq("talhoes.fazenda_id", fazendaId)
    .maybeSingle();

  if (!plantioData) notFound();

  const plantio = plantioData as unknown as Plantio & {
    talhoes: Pick<Talhao, "id" | "nome"> | Pick<Talhao, "id" | "nome">[] | null;
  };
  const { data: eventosData } = await supabase
    .from("eventos_plantio")
    .select("*")
    .eq("plantio_id", params.id)
    .order("data", { ascending: false });

  const eventos = castRows<EventoPlantio>(eventosData);
  const editando = eventos.find((evento) => evento.id === searchParams.editar);
  const talhao = relOne(plantio.talhoes);

  return (
    <div className="space-y-6">
      <PageHeader
        title={plantio.cultura}
        description={`Plantio em ${talhao?.nome ?? "talhão"} · ${formatDate(plantio.data_plantio)}${plantio.safra ? ` · Safra ${plantio.safra}` : ""}`}
        crumbs={[
          { href: "/talhoes", label: "Talhões" },
          {
            href: `/talhoes/${plantio.talhao_id}`,
            label: talhao?.nome ?? "Talhão",
          },
          { label: plantio.cultura },
        ]}
        actions={
          <form action={deletePlantio}>
            <input type="hidden" name="id" value={plantio.id} />
            <input type="hidden" name="talhao_id" value={plantio.talhao_id} />
            <DeleteButton
              label="Excluir plantio"
              className="btn-danger"
              confirmMessage="Excluir este plantio também apaga os eventos registrados. Continuar?"
            />
          </form>
        }
      />

      <PlantioForm talhaoId={plantio.talhao_id} plantio={plantio} />
      <EventoPlantioForm plantioId={plantio.id} evento={editando} />

      <section className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-earth-900">Eventos do plantio</h2>
        {eventos.length === 0 ? (
          <EmptyState
            title="Nenhum evento registrado"
            description="Registre adubação, defensivo, irrigação ou colheita."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Observações</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td>{formatDate(evento.data)}</td>
                    <td>
                      <TipoBadge tipo={evento.tipo} />
                    </td>
                    <td>{evento.produto_usado || "—"}</td>
                    <td>{evento.quantidade || "—"}</td>
                    <td className="max-w-xs truncate">{evento.observacoes || "—"}</td>
                    <td className="whitespace-nowrap text-right">
                      <Link
                        href={`/plantios/${plantio.id}?editar=${evento.id}`}
                        className="mr-3 text-sm font-medium text-brand-700 hover:underline"
                      >
                        Editar
                      </Link>
                      <form action={deleteEventoPlantio} className="inline">
                        <input type="hidden" name="id" value={evento.id} />
                        <input type="hidden" name="plantio_id" value={plantio.id} />
                        <DeleteButton confirmMessage="Excluir este evento?" />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
