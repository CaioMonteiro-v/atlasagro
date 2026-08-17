"use client";

import { useFormState } from "react-dom";
import { createFazenda, updateFazenda } from "@/app/actions/fazendas";
import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { UFS } from "@/lib/constants";
import type { Fazenda } from "@/lib/types";

const initial = { error: null };

export function FazendaForm({ fazenda }: { fazenda?: Fazenda }) {
  const action = fazenda ? updateFazenda : createFazenda;
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="card space-y-4 p-5">
      <h2 className="text-base font-semibold text-earth-900">
        {fazenda ? "Editar fazenda" : "Cadastrar fazenda"}
      </h2>
      {fazenda ? <input type="hidden" name="id" value={fazenda.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="nome">
            Nome da fazenda
          </label>
          <input
            id="nome"
            name="nome"
            required
            defaultValue={fazenda?.nome ?? ""}
            className="input"
            placeholder="Ex.: Sítio Santa Rita, Fazenda Boa Vista"
          />
        </div>
        <div>
          <label className="label" htmlFor="municipio">
            Município
          </label>
          <input
            id="municipio"
            name="municipio"
            defaultValue={fazenda?.municipio ?? ""}
            className="input"
            placeholder="Ex.: Uberaba"
          />
        </div>
        <div>
          <label className="label" htmlFor="uf">
            UF
          </label>
          <select id="uf" name="uf" defaultValue={fazenda?.uf ?? ""} className="input">
            <option value="">Selecione</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="observacoes">
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={3}
            defaultValue={fazenda?.observacoes ?? ""}
            className="input"
          />
        </div>
      </div>
      <FormError error={state.error} />
      <SubmitButton>{fazenda ? "Salvar alterações" : "Cadastrar fazenda"}</SubmitButton>
    </form>
  );
}
