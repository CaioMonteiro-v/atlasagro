import { notFound } from "next/navigation";
import { FazendaForm } from "@/components/forms/fazenda-form";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Fazenda } from "@/lib/types";

export default async function EditarFazendaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("fazendas")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) notFound();
  const fazenda = data as unknown as Fazenda;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={fazenda.nome}
        crumbs={[
          { href: "/fazendas", label: "Fazendas" },
          { label: fazenda.nome },
        ]}
      />
      <FazendaForm fazenda={fazenda} />
    </div>
  );
}
