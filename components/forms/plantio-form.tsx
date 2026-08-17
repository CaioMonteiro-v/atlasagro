"use client";

import { useFormState } from "react-dom";
import { createPlantio, updatePlantio } from "@/app/actions/plantios";
import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Plantio } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const initial = { error: null };

export function PlantioForm({
  talhaoId,
  plantio,
}: {
  talhaoId: string;
  plantio?: Plantio;
}) {
  const action = plantio ? updatePlantio : createPlantio;
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="card space-y-4 p-5">
      <h2 className="text-base font-semibold text-earth-900">
        {plantio ? "Editar plantio" : "Novo plantio"}
      </h2>
      {plantio ? <input type="hidden" name="id" value={plantio.id} /> : null}
      <input type="hidden" name="talhao_id" value={talhaoId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="cultura">
            Cultura
          </label>
          <input
            id="cultura"
            name="cultura"
            required
            defaultValue={plantio?.cultura ?? ""}
            className="input"
            placeholder="Ex.: Soja, milho, café"
          />
        </div>
        <div>
          <label className="label" htmlFor="data_plantio">
            Data do plantio
          </label>
          <input
            id="data_plantio"
            name="data_plantio"
            type="date"
            required
            defaultValue={plantio?.data_plantio ?? todayISO()}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="safra">
            Safra
          </label>
          <input
            id="safra"
            name="safra"
            defaultValue={plantio?.safra ?? ""}
            className="input"
            placeholder="Ex.: 2025/26"
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
            defaultValue={plantio?.observacoes ?? ""}
            className="input"
          />
        </div>
      </div>
      <FormError error={state.error} />
      <SubmitButton>{plantio ? "Salvar alterações" : "Cadastrar plantio"}</SubmitButton>
    </form>
  );
}
