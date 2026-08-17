import Link from "next/link";
import { deleteTalhao } from "@/app/actions/talhoes";
import { TalhaoForm } from "@/components/forms/talhao-form";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Talhao } from "@/lib/types";
import { formatNumber, castRows } from "@/lib/utils";

export default async function TalhoesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("talhoes")
    .select("*")
    .order("nome", { ascending: true });
  const talhoes = castRows<Talhao>(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talhões"
        description="Cadastre as áreas da propriedade e, em seguida, os plantios de cada uma."
      />
      <TalhaoForm />
      {talhoes.length === 0 ? (
        <EmptyState
          title="Nenhum talhão cadastrado"
          description="Use o formulário acima para registrar a primeira área."
        />
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Área</th>
                <th>Observações</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {talhoes.map((talhao) => (
                <tr key={talhao.id}>
                  <td>
                    <Link
                      href={`/talhoes/${talhao.id}`}
                      className="font-semibold text-brand-800 hover:underline"
                    >
                      {talhao.nome}
                    </Link>
                  </td>
                  <td>{formatNumber(talhao.area_hectares, " ha")}</td>
                  <td className="max-w-sm truncate">{talhao.observacoes || "—"}</td>
                  <td className="whitespace-nowrap text-right">
                    <Link
                      href={`/talhoes/${talhao.id}`}
                      className="mr-3 text-sm font-medium text-brand-700 hover:underline"
                    >
                      Abrir
                    </Link>
                    <form action={deleteTalhao} className="inline">
                      <input type="hidden" name="id" value={talhao.id} />
                      <DeleteButton confirmMessage="Excluir este talhão também apaga os plantios e eventos ligados a ele. Continuar?" />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
