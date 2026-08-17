import Link from "next/link";
import { Bell, LandPlot, Sprout } from "lucide-react";
import { EventosChart } from "@/components/dashboard/eventos-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TipoBadge } from "@/components/ui/tipo-badge";
import { labelTipo } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  EventoPlantioDetalhado,
  EventoSanitarioDetalhado,
} from "@/lib/types";
import { daysFromTodayISO, formatDate, formatNumber, todayISO, castRows, relOne } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = createClient();
  const hoje = todayISO();
  const em15 = daysFromTodayISO(15);

  const [
    talhoes,
    lotes,
    alertas,
    eventosPlantio,
    eventosSanitarios,
  ] = await Promise.all([
    supabase.from("talhoes").select("id", { count: "exact", head: true }),
    supabase.from("lotes").select("id", { count: "exact", head: true }),
    supabase
      .from("eventos_sanitarios")
      .select("id, tipo, produto, proxima_aplicacao, lotes(nome)")
      .not("proxima_aplicacao", "is", null)
      .gte("proxima_aplicacao", hoje)
      .lte("proxima_aplicacao", em15)
      .order("proxima_aplicacao", { ascending: true }),
    supabase
      .from("eventos_plantio")
      .select("id, plantio_id, tipo, data, produto_usado, plantios(cultura, talhoes(nome))")
      .order("data", { ascending: false })
      .limit(12),
    supabase
      .from("eventos_sanitarios")
      .select("id, lote_id, tipo, data, produto, lotes(nome)")
      .order("data", { ascending: false })
      .limit(12),
  ]);

  const recentes = [
    ...castRows<EventoPlantioDetalhado>(eventosPlantio.data).map((evento) => ({
      id: evento.id,
      origem: "Plantio" as const,
      data: evento.data,
      tipo: evento.tipo,
      titulo: relOne(relOne(evento.plantios)?.talhoes)?.nome ?? "Talhão",
      detalhe: relOne(evento.plantios)?.cultura ?? "",
      produto: evento.produto_usado,
      href: `/plantios/${evento.plantio_id ?? ""}`,
    })),
    ...castRows<EventoSanitarioDetalhado>(eventosSanitarios.data).map((evento) => ({
      id: evento.id,
      origem: "Sanitário" as const,
      data: evento.data,
      tipo: evento.tipo,
      titulo: relOne(evento.lotes)?.nome ?? "Lote",
      detalhe: relOne(evento.lotes)?.especie ?? "",
      produto: evento.produto,
      href: `/lotes/${evento.lote_id ?? ""}`,
    })),
  ]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 10);

  const chartMap = new Map<string, number>();
  for (const evento of recentes) {
    const name = labelTipo(evento.tipo);
    chartMap.set(name, (chartMap.get(name) ?? 0) + 1);
  }
  const chartData = Array.from(chartMap.entries()).map(([name, total]) => ({
    name,
    total,
  }));

  const alertas15 = castRows<{
    id: string;
    tipo: string;
    produto: string | null;
    proxima_aplicacao: string | null;
    lotes: { nome: string } | { nome: string }[] | null;
  }>(alertas.data);

  return (
    <div>
      <PageHeader
        title="Painel da propriedade"
        description="Resumo dos talhões, lotes e do que está próximo de vencer."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          href="/talhoes"
          icon={<Sprout className="h-5 w-5" />}
          label="Talhões ativos"
          value={formatNumber(talhoes.count ?? 0)}
        />
        <StatCard
          href="/lotes"
          icon={<LandPlot className="h-5 w-5" />}
          label="Lotes"
          value={formatNumber(lotes.count ?? 0)}
        />
        <StatCard
          href="/alertas"
          icon={<Bell className="h-5 w-5" />}
          label="Alertas (15 dias)"
          value={formatNumber(alertas15.length)}
          highlight={alertas15.length > 0}
        />
      </div>

      {alertas15.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-amber-950">
              Próximas aplicações em até 15 dias
            </h2>
            <Link href="/alertas" className="text-sm font-medium text-amber-900 hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="space-y-2">
            {alertas15.map((alerta) => (
              <li
                key={alerta.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 text-sm"
              >
                <span className="font-medium text-stone-800">
                  {alerta.lotes ? relOne(alerta.lotes)?.nome ?? "Lote" : "Lote"} · {labelTipo(alerta.tipo)}
                  {alerta.produto ? ` — ${alerta.produto}` : ""}
                </span>
                <span className="font-semibold text-amber-900">
                  {formatDate(alerta.proxima_aplicacao)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-earth-900">
            Eventos recentes por tipo
          </h2>
          <EventosChart data={chartData} />
        </section>
        <section className="card p-5 lg:col-span-3">
          <h2 className="mb-4 text-base font-semibold text-earth-900">
            Últimos eventos registrados
          </h2>
          {recentes.length === 0 ? (
            <EmptyState
              title="Nenhum evento ainda"
              description="Cadastre um talhão ou um lote e comece a registrar o manejo."
              actionLabel="Cadastrar talhão"
              actionHref="/talhoes"
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Onde</th>
                    <th>Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((evento) => (
                    <tr key={`${evento.origem}-${evento.id}`}>
                      <td>{formatDate(evento.data)}</td>
                      <td>
                        <TipoBadge tipo={evento.tipo} />
                      </td>
                      <td>
                        <Link href={evento.href} className="font-medium hover:underline">
                          {evento.titulo}
                        </Link>
                        <span className="block text-xs text-stone-500">{evento.origem}</span>
                      </td>
                      <td>{evento.produto || evento.detalhe || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  href,
  icon,
  label,
  value,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 ${
        highlight ? "border-amber-300 bg-amber-50" : ""
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          highlight ? "bg-amber-200 text-amber-950" : "bg-brand-100 text-brand-800"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm text-stone-600">{label}</span>
        <span className="text-2xl font-bold text-earth-900">{value}</span>
      </span>
    </Link>
  );
}
