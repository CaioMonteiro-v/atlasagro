import { redirect } from "next/navigation";
import { daysFromTodayISO, todayISO } from "@/lib/utils";
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

  const { count } = await supabase
    .from("eventos_sanitarios")
    .select("id", { count: "exact", head: true })
    .not("proxima_aplicacao", "is", null)
    .gte("proxima_aplicacao", todayISO())
    .lte("proxima_aplicacao", daysFromTodayISO(30));

  return (
    <AppShell email={user.email ?? "Usuário"} alertCount={count ?? 0}>
      {children}
    </AppShell>
  );
}
