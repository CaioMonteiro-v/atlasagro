import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePlantio } from "@/app/actions/plantios";
import { deleteTalhao } from "@/app/actions/talhoes";
import { PlantioForm } from "@/components/forms/plantio-form";
import { TalhaoForm } from "@/components/forms/talhao-form";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Plantio, Talhao } from "@/lib/types";
import { formatDate, formatNumber, castRows } from "@/lib/utils";

export default async function TalhaoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: talhao } = await supabase
    .from("talhoes")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!talhao) notFound();

  const { data: plantiosData } = await supabase
    .from("plantios")
    .select("*")
    .eq("talhao_id", params.id)
    .order("data_plantio", { ascending: false });

  const plantios = castRows<Plantio>(plantiosData);
  const registro = talhao as unknown as Talhao;

  return (
    <div className="space-y-6">
      <PageHeader
        title={registro.nome}
        description={`${formatNumber(registro.area_hectares, " ha")} · ${plantios.length} plantio(s)`}
        crumbs={[
          { href: "/talhoes", label: "Talhões" },
          { label: registro.nome },
        ]}
        actions={
          <form action={deleteTalhao}>
            <input type="hidden" name="id" value={registro.id} />
            <DeleteButton
              label="Excluir talhão"
              className="btn-danger"
              confirmMessage="Excluir este talhão também apaga os plantios e eventos ligados a ele. Continuar?"
            />
          </form>
        }
      />

      <TalhaoForm talhao={registro} />
      <PlantioForm talhaoId={registro.id} />

      <section className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-earth-900">Plantios</h2>
        {plantios.length === 0 ? (
          <EmptyState
            title="Nenhum plantio neste talhão"
            description="Cadastre a cultura e a data de plantio no formulário acima."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cultura</th>
                  <th>Data</th>
                  <th>Safra</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plantios.map((plantio) => (
                  <tr key={plantio.id}>
                    <td>
                      <Link
                        href={`/plantios/${plantio.id}`}
                        className="font-semibold text-brand-800 hover:underline"
                      >
                        {plantio.cultura}
                      </Link>
                    </td>
                    <td>{formatDate(plantio.data_plantio)}</td>
                    <td>{plantio.safra || "—"}</td>
                    <td className="whitespace-nowrap text-right">
                      <Link
                        href={`/plantios/${plantio.id}`}
                        className="mr-3 text-sm font-medium text-brand-700 hover:underline"
                      >
                        Eventos
                      </Link>
                      <form action={deletePlantio} className="inline">
                        <input type="hidden" name="id" value={plantio.id} />
                        <input type="hidden" name="talhao_id" value={registro.id} />
                        <DeleteButton confirmMessage="Excluir este plantio também apaga os eventos registrados. Continuar?" />
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
