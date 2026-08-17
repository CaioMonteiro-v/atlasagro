"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { createEventoSanitario, updateEventoSanitario } from "@/app/actions/eventos-sanitarios";
import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { TIPOS_EVENTO_SANITARIO } from "@/lib/constants";
import type { EventoSanitario, TipoEventoSanitario } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const initial = { error: null };

export function EventoSanitarioForm({
  loteId,
  evento,
}: {
  loteId: string;
  evento?: EventoSanitario;
}) {
  const action = evento ? updateEventoSanitario : createEventoSanitario;
  const [state, formAction] = useFormState(action, initial);
  const [tipo, setTipo] = useState<TipoEventoSanitario>(evento?.tipo ?? "VACINA");

  return (
    <form action={formAction} className="card space-y-4 p-5">
      <h2 className="text-base font-semibold text-earth-900">
        {evento ? "Editar evento sanitário" : "Registrar evento sanitário"}
      </h2>
      {evento ? <input type="hidden" name="id" value={evento.id} /> : null}
      <input type="hidden" name="lote_id" value={loteId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="tipo">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            required
            value={tipo}
            onChange={(event) => setTipo(event.target.value as TipoEventoSanitario)}
            className="input"
          >
            {TIPOS_EVENTO_SANITARIO.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
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
          <label className="label" htmlFor="produto">
            Produto
          </label>
          <input
            id="produto"
            name="produto"
            defaultValue={evento?.produto ?? ""}
            className="input"
            placeholder="Ex.: vacina aftosa"
          />
        </div>
        <div>
          <label className="label" htmlFor="dose">
            Dose
          </label>
          <input
            id="dose"
            name="dose"
            defaultValue={evento?.dose ?? ""}
            className="input"
            placeholder="Ex.: 5 ml/animal"
          />
        </div>
        {tipo === "VACINA" ? (
          <div className="sm:col-span-2">
            {evento?.proxima_aplicacao ? (
              <input
                type="hidden"
                name="proxima_aplicacao"
                value={evento.proxima_aplicacao}
              />
            ) : null}
            <label className="label" htmlFor="intervalo_dias">
              Repetir em (dias)
            </label>
            <input
              id="intervalo_dias"
              name="intervalo_dias"
              inputMode="numeric"
              className="input"
              placeholder="Ex.: 180 — calcula a próxima aplicação automaticamente"
            />
            <p className="mt-1 text-xs text-stone-500">
              Informe o intervalo para preencher a próxima aplicação a partir da data.
              {evento?.proxima_aplicacao
                ? ` Atual: ${evento.proxima_aplicacao.split("-").reverse().join("/")}.`
                : null}
            </p>
          </div>
        ) : (
          <div>
            <label className="label" htmlFor="proxima_aplicacao">
              Próxima aplicação
            </label>
            <input
              id="proxima_aplicacao"
              name="proxima_aplicacao"
              type="date"
              defaultValue={evento?.proxima_aplicacao ?? ""}
              className="input"
            />
          </div>
        )}
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
      <SubmitButton>
        {evento ? "Salvar alterações" : "Registrar evento"}
      </SubmitButton>
    </form>
  );
}
