import Link from "next/link";
import { deleteFazenda } from "@/app/actions/fazendas";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listFazendas } from "@/lib/fazenda";

export default async function FazendasPage() {
  const fazendas = await listFazendas();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fazendas"
        description="Cada propriedade tem seus próprios talhões, plantios e lotes. Troque no menu da esquerda."
        actions={
          <Link href="/fazendas/nova" className="btn-primary">
            Nova fazenda
          </Link>
        }
      />

      {fazendas.length === 0 ? (
        <EmptyState
          title="Nenhuma fazenda cadastrada"
          description="Comece cadastrando a primeira propriedade."
          actionLabel="Cadastrar fazenda"
          actionHref="/fazendas/nova"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {fazendas.map((fazenda) => (
            <article key={fazenda.id} className="card p-5">
              <h2 className="text-lg font-semibold text-earth-900">{fazenda.nome}</h2>
              <p className="mt-1 text-sm text-stone-600">
                {fazenda.municipio || fazenda.uf
                  ? [fazenda.municipio, fazenda.uf].filter(Boolean).join(" / ")
                  : "Local não informado"}
              </p>
              {fazenda.observacoes ? (
                <p className="mt-2 line-clamp-2 text-sm text-stone-500">{fazenda.observacoes}</p>
              ) : null}
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={`/fazendas/${fazenda.id}`}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  Editar
                </Link>
                <form action={deleteFazenda}>
                  <input type="hidden" name="id" value={fazenda.id} />
                  <DeleteButton confirmMessage="Excluir esta fazenda também apaga talhões, plantios, lotes e eventos dela. Continuar?" />
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
