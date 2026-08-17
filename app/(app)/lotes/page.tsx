import Link from "next/link";
import { deleteLote } from "@/app/actions/lotes";
import { LoteForm } from "@/components/forms/lote-form";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Lote } from "@/lib/types";
import { formatNumber, castRows } from "@/lib/utils";

export default async function LotesPage() {
  const supabase = createClient();
  const { data } = await supabase.from("lotes").select("*").order("nome", { ascending: true });
  const lotes = castRows<Lote>(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lotes"
        description="Cadastre os grupos de animais e registre vacinas, vermífugos e tratamentos."
      />
      <LoteForm />
      {lotes.length === 0 ? (
        <EmptyState
          title="Nenhum lote cadastrado"
          description="Use o formulário acima para registrar o primeiro lote."
        />
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Espécie</th>
                <th>Animais</th>
                <th>Observações</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lotes.map((lote) => (
                <tr key={lote.id}>
                  <td>
                    <Link
                      href={`/lotes/${lote.id}`}
                      className="font-semibold text-brand-800 hover:underline"
                    >
                      {lote.nome}
                    </Link>
                  </td>
                  <td>{lote.especie || "—"}</td>
                  <td>{formatNumber(lote.quantidade_animais)}</td>
                  <td className="max-w-sm truncate">{lote.observacoes || "—"}</td>
                  <td className="whitespace-nowrap text-right">
                    <Link
                      href={`/lotes/${lote.id}`}
                      className="mr-3 text-sm font-medium text-brand-700 hover:underline"
                    >
                      Abrir
                    </Link>
                    <form action={deleteLote} className="inline">
                      <input type="hidden" name="id" value={lote.id} />
                      <DeleteButton confirmMessage="Excluir este lote também apaga os eventos sanitários. Continuar?" />
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
