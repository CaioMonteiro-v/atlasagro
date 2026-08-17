import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { daysFromTodayISO, todayISO } from "@/lib/utils";
import { resolveFazenda } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pathname = headers().get("x-pathname") || "";
  const onFazendas = pathname.startsWith("/fazendas");
  const { fazendas, atual } = await resolveFazenda();

  if (!atual && !onFazendas) {
    redirect("/fazendas/nova");
  }

  let alertCount = 0;
  if (atual) {
    const { count } = await supabase
      .from("eventos_sanitarios")
      .select("id, lotes!inner(fazenda_id)", { count: "exact", head: true })
      .eq("lotes.fazenda_id", atual.id)
      .not("proxima_aplicacao", "is", null)
      .gte("proxima_aplicacao", todayISO())
      .lte("proxima_aplicacao", daysFromTodayISO(30));
    alertCount = count ?? 0;
  }

  return (
    <AppShell
      email={user.email ?? "Usuário"}
      alertCount={alertCount}
      fazendas={fazendas}
      fazendaAtualId={atual?.id ?? null}
    >
      {children}
    </AppShell>
  );
}
