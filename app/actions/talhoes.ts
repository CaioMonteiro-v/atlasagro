"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { field, optionalNumber } from "@/lib/utils";

export async function createTalhao(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nome = field(formData, "nome");
  if (!nome) return { error: "Informe o nome do talhão." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("talhoes")
    .insert({
      nome,
      area_hectares: optionalNumber(field(formData, "area_hectares")),
      observacoes: field(formData, "observacoes") || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível cadastrar o talhão." };
  }

  revalidatePath("/talhoes");
  revalidatePath("/");
  redirect(`/talhoes/${data.id}`);
}

export async function updateTalhao(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");
  const nome = field(formData, "nome");
  if (!id || !nome) return { error: "Informe o nome do talhão." };

  const supabase = createClient();
  const { error } = await supabase
    .from("talhoes")
    .update({
      nome,
      area_hectares: optionalNumber(field(formData, "area_hectares")),
      observacoes: field(formData, "observacoes") || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidatePath("/talhoes");
  revalidatePath(`/talhoes/${id}`);
  revalidatePath("/");
  redirect(`/talhoes/${id}`);
}

export async function deleteTalhao(formData: FormData) {
  const id = field(formData, "id");
  const supabase = createClient();
  await supabase.from("talhoes").delete().eq("id", id);
  revalidatePath("/talhoes");
  revalidatePath("/");
  redirect("/talhoes");
}
