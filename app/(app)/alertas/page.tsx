import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TipoBadge } from "@/components/ui/tipo-badge";
import { createClient } from "@/lib/supabase/server";
import type { EventoSanitarioDetalhado } from "@/lib/types";
import { daysFromTodayISO, formatDate, parseISODate, todayISO, castRows, relOne } from "@/lib/utils";
import { requireFazendaId } from "@/lib/fazenda";

export default async function AlertasPage() {
  const fazendaId = await requireFazendaId();
  const supabase = createClient();
  const hoje = todayISO();
  const limite = daysFromTodayISO(30);

  const { data } = await supabase
    .from("eventos_sanitarios")
    .select("id, lote_id, tipo, produto, dose, proxima_aplicacao, lotes!inner(id, nome, especie, fazenda_id)")
    .eq("lotes.fazenda_id", fazendaId)
    .not("proxima_aplicacao", "is", null)
    .gte("proxima_aplicacao", hoje)
    .lte("proxima_aplicacao", limite)
    .order("proxima_aplicacao", { ascending: true });

  const alertas = castRows<EventoSanitarioDetalhado>(data);
  const hojeDate = parseISODate(hoje);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas sanitários"
        description="Próximas aplicações com vencimento nos próximos 30 dias, da mais próxima para a mais distante."
      />

      {alertas.length === 0 ? (
        <EmptyState
          title="Nenhuma aplicação próxima"
          description="Quando uma vacina tiver intervalo informado, a próxima data aparece aqui."
          actionLabel="Ver lotes"
          actionHref="/lotes"
        />
      ) : (
        <div className="space-y-3">
          {alertas.map((alerta) => {
            const dias = Math.round(
              (parseISODate(alerta.proxima_aplicacao ?? hoje).getTime() - hojeDate.getTime()) /
                86_400_000,
            );
            const urgente = dias <= 7;
            return (
              <article
                key={alerta.id}
                className={`card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${
                  urgente ? "border-amber-300 bg-amber-50" : ""
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TipoBadge tipo={alerta.tipo} />
                    <span className="font-semibold text-earth-900">
                      {relOne(alerta.lotes)?.nome ?? "Lote"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">
                    {alerta.produto || "Produto não informado"}
                    {alerta.dose ? ` · dose ${alerta.dose}` : ""}
                    {relOne(alerta.lotes)?.especie ? ` · ${relOne(alerta.lotes)?.especie}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${urgente ? "text-amber-900" : "text-brand-800"}`}>
                    {formatDate(alerta.proxima_aplicacao)}
                  </p>
                  <p className="text-xs text-stone-500">
                    {dias === 0 ? "Hoje" : dias === 1 ? "Amanhã" : `Em ${dias} dias`}
                  </p>
                  <Link
                    href={`/lotes/${alerta.lote_id}`}
                    className="mt-1 inline-block text-sm font-medium text-brand-700 hover:underline"
                  >
                    Abrir lote
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
