import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEventoSanitario } from "@/app/actions/eventos-sanitarios";
import { deleteLote } from "@/app/actions/lotes";
import { EventoSanitarioForm } from "@/components/forms/evento-sanitario-form";
import { LoteForm } from "@/components/forms/lote-form";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TipoBadge } from "@/components/ui/tipo-badge";
import { createClient } from "@/lib/supabase/server";
import type { EventoSanitario, Lote } from "@/lib/types";
import { formatDate, formatNumber, castRows } from "@/lib/utils";

export default async function LoteDetalhePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { editar?: string };
}) {
  const supabase = createClient();
  const { data: loteData } = await supabase
    .from("lotes")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!loteData) notFound();

  const lote = loteData as unknown as Lote;
  const { data: eventosData } = await supabase
    .from("eventos_sanitarios")
    .select("*")
    .eq("lote_id", params.id)
    .order("data", { ascending: false });

  const eventos = castRows<EventoSanitario>(eventosData);
  const editando = eventos.find((evento) => evento.id === searchParams.editar);

  return (
    <div className="space-y-6">
      <PageHeader
        title={lote.nome}
        description={`${lote.especie || "Espécie não informada"} · ${formatNumber(lote.quantidade_animais)} animais`}
        crumbs={[
          { href: "/lotes", label: "Lotes" },
          { label: lote.nome },
        ]}
        actions={
          <form action={deleteLote}>
            <input type="hidden" name="id" value={lote.id} />
            <DeleteButton
              label="Excluir lote"
              className="btn-danger"
              confirmMessage="Excluir este lote também apaga os eventos sanitários. Continuar?"
            />
          </form>
        }
      />

      <LoteForm lote={lote} />
      <EventoSanitarioForm loteId={lote.id} evento={editando} />

      <section className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-earth-900">Eventos sanitários</h2>
        {eventos.length === 0 ? (
          <EmptyState
            title="Nenhum evento sanitário"
            description="Registre vacina, vermífugo ou tratamento com data, produto e dose."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Dose</th>
                  <th>Próxima</th>
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
                    <td>{evento.produto || "—"}</td>
                    <td>{evento.dose || "—"}</td>
                    <td>{formatDate(evento.proxima_aplicacao)}</td>
                    <td className="max-w-xs truncate">{evento.observacoes || "—"}</td>
                    <td className="whitespace-nowrap text-right">
                      <Link
                        href={`/lotes/${lote.id}?editar=${evento.id}`}
                        className="mr-3 text-sm font-medium text-brand-700 hover:underline"
                      >
                        Editar
                      </Link>
                      <form action={deleteEventoSanitario} className="inline">
                        <input type="hidden" name="id" value={evento.id} />
                        <input type="hidden" name="lote_id" value={lote.id} />
                        <DeleteButton confirmMessage="Excluir este evento sanitário?" />
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
