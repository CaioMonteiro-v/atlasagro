"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { field } from "@/lib/utils";

export async function createPlantio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const talhaoId = field(formData, "talhao_id");
  const cultura = field(formData, "cultura");
  const dataPlantio = field(formData, "data_plantio");

  if (!talhaoId || !cultura || !dataPlantio) {
    return { error: "Informe cultura e data do plantio." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("plantios")
    .insert({
      talhao_id: talhaoId,
      cultura,
      data_plantio: dataPlantio,
      safra: field(formData, "safra") || null,
      observacoes: field(formData, "observacoes") || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível cadastrar o plantio." };
  }

  revalidatePath(`/talhoes/${talhaoId}`);
  revalidatePath("/");
  redirect(`/plantios/${data.id}`);
}

export async function updatePlantio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");
  const cultura = field(formData, "cultura");
  const dataPlantio = field(formData, "data_plantio");

  if (!id || !cultura || !dataPlantio) {
    return { error: "Informe cultura e data do plantio." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("plantios")
    .update({
      cultura,
      data_plantio: dataPlantio,
      safra: field(formData, "safra") || null,
      observacoes: field(formData, "observacoes") || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidatePath(`/plantios/${id}`);
  revalidatePath("/");
  redirect(`/plantios/${id}`);
}

export async function deletePlantio(formData: FormData) {
  const id = field(formData, "id");
  const talhaoId = field(formData, "talhao_id");
  const supabase = createClient();
  await supabase.from("plantios").delete().eq("id", id);
  revalidatePath(`/talhoes/${talhaoId}`);
  revalidatePath("/");
  redirect(`/talhoes/${talhaoId}`);
}
