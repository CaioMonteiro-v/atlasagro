"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { switchFazenda } from "@/app/actions/fazendas";
import type { Fazenda } from "@/lib/types";

export function FarmSwitcher({
  fazendas,
  atualId,
}: {
  fazendas: Fazenda[];
  atualId: string | null;
}) {
  if (fazendas.length === 0) {
    return (
      <Link
        href="/fazendas/nova"
        className="mb-6 block rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/15"
      >
        Cadastrar fazenda
      </Link>
    );
  }

  return (
    <form action={switchFazenda} className="relative mb-6">
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-brand-200">
        Fazenda
      </label>
      <div className="relative">
        <select
          name="fazenda_id"
          defaultValue={atualId ?? fazendas[0].id}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 pr-9 text-sm font-medium text-white outline-none hover:bg-white/15"
        >
          {fazendas.map((fazenda) => (
            <option key={fazenda.id} value={fazenda.id} className="text-stone-900">
              {fazenda.nome}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-100" />
      </div>
      <Link
        href="/fazendas"
        className="mt-2 mr-3 inline-block text-xs text-brand-200 hover:text-white"
      >
        Gerenciar
      </Link>
      <Link
        href="/fazendas/nova"
        className="mt-2 inline-block text-xs text-brand-200 hover:text-white"
      >
        + Nova fazenda
      </Link>
    </form>
  );
}
