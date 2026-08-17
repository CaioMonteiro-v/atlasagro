"use client";

import { useFormState } from "react-dom";
import { createLote, updateLote } from "@/app/actions/lotes";
import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Lote } from "@/lib/types";

const initial = { error: null };

export function LoteForm({ lote }: { lote?: Lote }) {
  const action = lote ? updateLote : createLote;
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="card space-y-4 p-5">
      <h2 className="text-base font-semibold text-earth-900">
        {lote ? "Editar lote" : "Novo lote"}
      </h2>
      {lote ? <input type="hidden" name="id" value={lote.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            required
            defaultValue={lote?.nome ?? ""}
            className="input"
            placeholder="Ex.: Pasto 2 — novilhas"
          />
        </div>
        <div>
          <label className="label" htmlFor="especie">
            Espécie
          </label>
          <input
            id="especie"
            name="especie"
            defaultValue={lote?.especie ?? ""}
            className="input"
            placeholder="Ex.: Bovino, ovino"
          />
        </div>
        <div>
          <label className="label" htmlFor="quantidade_animais">
            Quantidade de animais
          </label>
          <input
            id="quantidade_animais"
            name="quantidade_animais"
            inputMode="numeric"
            defaultValue={lote?.quantidade_animais ?? ""}
            className="input"
            placeholder="Ex.: 40"
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
            defaultValue={lote?.observacoes ?? ""}
            className="input"
          />
        </div>
      </div>
      <FormError error={state.error} />
      <SubmitButton>{lote ? "Salvar alterações" : "Cadastrar lote"}</SubmitButton>
    </form>
  );
}
