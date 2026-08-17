"use client";

import { useFormState } from "react-dom";
import { createEventoPlantio, updateEventoPlantio } from "@/app/actions/eventos-plantio";
import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { TIPOS_EVENTO_PLANTIO } from "@/lib/constants";
import type { EventoPlantio } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const initial = { error: null };

export function EventoPlantioForm({
  plantioId,
  evento,
}: {
  plantioId: string;
  evento?: EventoPlantio;
}) {
  const action = evento ? updateEventoPlantio : createEventoPlantio;
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="card space-y-4 p-5">
      <h2 className="text-base font-semibold text-earth-900">
        {evento ? "Editar evento" : "Registrar evento"}
      </h2>
      {evento ? <input type="hidden" name="id" value={evento.id} /> : null}
      <input type="hidden" name="plantio_id" value={plantioId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="tipo">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            required
            defaultValue={evento?.tipo ?? "ADUBACAO"}
            className="input"
          >
            {TIPOS_EVENTO_PLANTIO.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="data">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            required
            defaultValue={evento?.data ?? todayISO()}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="produto_usado">
            Produto usado
          </label>
          <input
            id="produto_usado"
            name="produto_usado"
            defaultValue={evento?.produto_usado ?? ""}
            className="input"
            placeholder="Ex.: ureia, herbicida"
          />
        </div>
        <div>
          <label className="label" htmlFor="quantidade">
            Quantidade
          </label>
          <input
            id="quantidade"
            name="quantidade"
            defaultValue={evento?.quantidade ?? ""}
            className="input"
            placeholder="Ex.: 200 kg/ha"
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
            defaultValue={evento?.observacoes ?? ""}
            className="input"
          />
        </div>
      </div>
      <FormError error={state.error} />
      <SubmitButton>{evento ? "Salvar alterações" : "Registrar evento"}</SubmitButton>
    </form>
  );
}
