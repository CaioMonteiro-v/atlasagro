import { FazendaForm } from "@/components/forms/fazenda-form";
import { PageHeader } from "@/components/ui/page-header";
import { listFazendas } from "@/lib/fazenda";

export default async function NovaFazendaPage() {
  const fazendas = await listFazendas();
  const primeira = fazendas.length === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={primeira ? "Cadastre sua fazenda" : "Nova fazenda"}
        description={
          primeira
            ? "Depois do login, o primeiro passo é registrar a propriedade. Se você tiver mais de uma, dá para cadastrar as outras depois e trocar no menu."
            : "Talhões e lotes desta fazenda ficam separados das outras propriedades."
        }
        crumbs={
          primeira
            ? undefined
            : [
                { href: "/fazendas", label: "Fazendas" },
                { label: "Nova" },
              ]
        }
      />
      <FazendaForm />
    </div>
  );
}
