"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { field } from "@/lib/utils";

const TIPOS = new Set(["ADUBACAO", "DEFENSIVO", "IRRIGACAO", "COLHEITA", "OUTRO"]);

export async function createEventoPlantio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const plantioId = field(formData, "plantio_id");
  const tipo = field(formData, "tipo");
  const data = field(formData, "data");

  if (!plantioId || !data || !TIPOS.has(tipo)) {
    return { error: "Informe o tipo e a data do evento." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("eventos_plantio").insert({
    plantio_id: plantioId,
    tipo,
    data,
    produto_usado: field(formData, "produto_usado") || null,
    quantidade: field(formData, "quantidade") || null,
    observacoes: field(formData, "observacoes") || null,
  });

  if (error) return { error: "Não foi possível registrar o evento." };

  revalidatePath(`/plantios/${plantioId}`);
  revalidatePath("/");
  revalidatePath("/relatorios");
  redirect(`/plantios/${plantioId}`);
}

export async function updateEventoPlantio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");
  const plantioId = field(formData, "plantio_id");
  const tipo = field(formData, "tipo");
  const data = field(formData, "data");

  if (!id || !plantioId || !data || !TIPOS.has(tipo)) {
    return { error: "Informe o tipo e a data do evento." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("eventos_plantio")
    .update({
      tipo,
      data,
      produto_usado: field(formData, "produto_usado") || null,
      quantidade: field(formData, "quantidade") || null,
      observacoes: field(formData, "observacoes") || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidatePath(`/plantios/${plantioId}`);
  revalidatePath("/");
  revalidatePath("/relatorios");
  redirect(`/plantios/${plantioId}`);
}

export async function deleteEventoPlantio(formData: FormData) {
  const id = field(formData, "id");
  const plantioId = field(formData, "plantio_id");
  const supabase = createClient();
  await supabase.from("eventos_plantio").delete().eq("id", id);
  revalidatePath(`/plantios/${plantioId}`);
  revalidatePath("/");
  revalidatePath("/relatorios");
  redirect(`/plantios/${plantioId}`);
}
