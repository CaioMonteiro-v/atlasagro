"use client";

import { useFormState } from "react-dom";
import { createTalhao, updateTalhao } from "@/app/actions/talhoes";
import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Talhao } from "@/lib/types";

const initial = { error: null };

export function TalhaoForm({ talhao }: { talhao?: Talhao }) {
  const action = talhao ? updateTalhao : createTalhao;
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="card space-y-4 p-5">
      <h2 className="text-base font-semibold text-earth-900">
        {talhao ? "Editar talhão" : "Novo talhão"}
      </h2>
      {talhao ? <input type="hidden" name="id" value={talhao.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            required
            defaultValue={talhao?.nome ?? ""}
            className="input"
            placeholder="Ex.: Talhão 3 — várzea"
          />
        </div>
        <div>
          <label className="label" htmlFor="area_hectares">
            Área (hectares)
          </label>
          <input
            id="area_hectares"
            name="area_hectares"
            inputMode="decimal"
            defaultValue={talhao?.area_hectares ?? ""}
            className="input"
            placeholder="Ex.: 12,5"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="observacoes">
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={3}
            defaultValue={talhao?.observacoes ?? ""}
            className="input"
            placeholder="Opcional"
          />
        </div>
      </div>
      <FormError error={state.error} />
      <SubmitButton>{talhao ? "Salvar alterações" : "Cadastrar talhão"}</SubmitButton>
    </form>
  );
}
