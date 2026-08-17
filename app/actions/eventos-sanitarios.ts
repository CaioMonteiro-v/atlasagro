"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { addDaysISO, field, optionalInt } from "@/lib/utils";

const TIPOS = new Set(["VACINA", "VERMIFUGO", "TRATAMENTO", "OUTRO"]);

function proximaAplicacao(data: string, formData: FormData) {
  const intervalo = optionalInt(field(formData, "intervalo_dias"));
  if (intervalo && intervalo > 0) {
    return addDaysISO(data, intervalo);
  }
  return field(formData, "proxima_aplicacao") || null;
}

export async function createEventoSanitario(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const loteId = field(formData, "lote_id");
  const tipo = field(formData, "tipo");
  const data = field(formData, "data");

  if (!loteId || !data || !TIPOS.has(tipo)) {
    return { error: "Informe o tipo e a data do evento." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("eventos_sanitarios").insert({
    lote_id: loteId,
    tipo,
    data,
    produto: field(formData, "produto") || null,
    dose: field(formData, "dose") || null,
    proxima_aplicacao: proximaAplicacao(data, formData),
    observacoes: field(formData, "observacoes") || null,
  });

  if (error) return { error: "Não foi possível registrar o evento sanitário." };

  revalidatePath(`/lotes/${loteId}`);
  revalidatePath("/");
  revalidatePath("/alertas");
  revalidatePath("/relatorios");
  redirect(`/lotes/${loteId}`);
}

export async function updateEventoSanitario(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");
  const loteId = field(formData, "lote_id");
  const tipo = field(formData, "tipo");
  const data = field(formData, "data");

  if (!id || !loteId || !data || !TIPOS.has(tipo)) {
    return { error: "Informe o tipo e a data do evento." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("eventos_sanitarios")
    .update({
      tipo,
      data,
      produto: field(formData, "produto") || null,
      dose: field(formData, "dose") || null,
      proxima_aplicacao: proximaAplicacao(data, formData),
      observacoes: field(formData, "observacoes") || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidatePath(`/lotes/${loteId}`);
  revalidatePath("/");
  revalidatePath("/alertas");
  revalidatePath("/relatorios");
  redirect(`/lotes/${loteId}`);
}

export async function deleteEventoSanitario(formData: FormData) {
  const id = field(formData, "id");
  const loteId = field(formData, "lote_id");
  const supabase = createClient();
  await supabase.from("eventos_sanitarios").delete().eq("id", id);
  revalidatePath(`/lotes/${loteId}`);
  revalidatePath("/");
  revalidatePath("/alertas");
  revalidatePath("/relatorios");
  redirect(`/lotes/${loteId}`);
}
